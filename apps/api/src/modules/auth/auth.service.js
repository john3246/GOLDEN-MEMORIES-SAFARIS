import crypto from 'node:crypto';
import { validationError, unauthorized, AppError } from '../../errors/index.js';
import { requireNonEmptyString } from '@gm-safaris/shared-validation';
import { usersRepository } from '../users/users.repository.js';
import { hashPassword, verifyPassword } from '../../security/password.js';
import { passwordProblems } from '../../security/password-policy.js';
import { signAccessToken } from '../../security/jwt.js';
import { invalidateAuthCache } from '../../security/requireAuth.js';
import { recordAudit } from '../audit/audit.service.js';
import { sendSiteMail, loadMailSettings } from '../settings/mailer.js';
import { passwordResetEmail, cmsSiteUrl } from '../settings/email-templates.js';

const MAX_FAILED = 5;
const LOCK_MINUTES = 15;
// Constant-time-ish path for unknown emails so login timing does not reveal accounts.
const DUMMY_HASH = '$2b$12$Sn.UL1zQYwLlms1NCjp2Bu3U6KX8oyPOVLPHFZNk2TMP8rzAAULlu';

function tooManyAttempts(until) {
  const minutes = Math.max(1, Math.ceil((Date.parse(until) - Date.now()) / 60000));
  return new AppError(
    'ACCOUNT_LOCKED',
    `Too many failed sign-in attempts. Try again in ${minutes} minute${minutes === 1 ? '' : 's'} or reset your password.`,
    429
  );
}

export const authService = {
  async login(email, password, context = {}) {
    const emailResult = requireNonEmptyString(email, 'email', 180);
    const passwordResult = requireNonEmptyString(password, 'password', 200);
    if (!emailResult.ok) throw validationError('Enter your email address');
    if (!passwordResult.ok) throw validationError('Enter your password');

    const user = await usersRepository.findByEmail(emailResult.value);
    if (!user) {
      await verifyPassword(passwordResult.value, DUMMY_HASH);
      throw unauthorized('Invalid email or password');
    }
    if (user.lockedUntil && Date.parse(user.lockedUntil) > Date.now()) {
      throw tooManyAttempts(user.lockedUntil);
    }

    const ok = await verifyPassword(passwordResult.value, user.passwordHash);
    if (!ok) {
      const failed = Number(user.failedLoginCount || 0) + 1;
      const locked = failed >= MAX_FAILED ? new Date(Date.now() + LOCK_MINUTES * 60000).toISOString() : null;
      await usersRepository.save({ ...user, failedLoginCount: locked ? 0 : failed, lockedUntil: locked });
      await recordAudit({
        actorId: user.id,
        actorEmail: user.email,
        action: locked ? 'auth.locked' : 'auth.login_failed',
        resource: 'user',
        resourceId: user.id,
        metadata: { ip: context.ip || null },
      });
      if (locked) throw tooManyAttempts(locked);
      throw unauthorized('Invalid email or password');
    }
    if (user.status === 'disabled') {
      throw unauthorized('This account is disabled. Ask a Super Admin to re-activate it.');
    }

    const saved = await usersRepository.save({
      ...user,
      failedLoginCount: 0,
      lockedUntil: null,
      lastLoginAt: new Date().toISOString(),
    });
    invalidateAuthCache(user.id);
    const token = signAccessToken(saved || user);
    await recordAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: 'auth.login',
      resource: 'user',
      resourceId: user.id,
      metadata: { ip: context.ip || null },
    });

    return {
      token,
      user: usersRepository.toPublic(saved || user),
      // The CMS asks the user to choose a stronger password right away.
      passwordWeak: passwordProblems(passwordResult.value, { email: user.email, name: user.name }).length > 0,
    };
  },

  async forgotPassword(email) {
    const emailResult = requireNonEmptyString(email, 'email', 180);
    if (!emailResult.ok) throw validationError('Enter your email address');
    const user = await usersRepository.findByEmail(emailResult.value);
    if (user && user.status !== 'disabled') {
      const token = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
      await usersRepository.setPasswordReset(user.id, tokenHash, expiresAt);
      const settings = await loadMailSettings();
      const resetUrl = `${cmsSiteUrl(settings)}/#/reset?token=${token}`;
      const mail = passwordResetEmail({ name: user.name, resetUrl }, settings);
      await sendSiteMail({
        to: user.email,
        subject: mail.subject,
        text: mail.text,
        html: mail.html,
      });
      await recordAudit({
        actorId: user.id,
        actorEmail: user.email,
        action: 'auth.password_reset_requested',
        resource: 'user',
        resourceId: user.id,
      });
    }
    // Same answer whether or not the account exists.
    return { ok: true };
  },

  async resetPassword(token, password) {
    const tokenResult = requireNonEmptyString(token, 'token', 200);
    const passwordResult = requireNonEmptyString(password, 'password', 200);
    if (!tokenResult.ok) throw validationError('This reset link is invalid or has expired');
    if (!passwordResult.ok) throw validationError('Enter a new password');
    const tokenHash = crypto.createHash('sha256').update(tokenResult.value).digest('hex');
    const user = await usersRepository.findByResetTokenHash(tokenHash);
    if (!user) throw validationError('This reset link is invalid or has expired');
    const problems = passwordProblems(passwordResult.value, { email: user.email, name: user.name });
    if (problems.length) throw validationError(problems[0], { field: 'password' });
    await usersRepository.updatePassword(user.id, await hashPassword(passwordResult.value));
    invalidateAuthCache(user.id);
    await recordAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: 'auth.password_reset',
      resource: 'user',
      resourceId: user.id,
    });
    return { ok: true };
  },

  async me(userId) {
    const user = await usersRepository.findById(userId);
    if (!user) throw unauthorized('Session is no longer valid');
    return usersRepository.toPublic(user);
  },
};
