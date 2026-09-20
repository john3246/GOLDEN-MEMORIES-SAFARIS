import crypto from 'node:crypto';
import { validationError, unauthorized } from '../../errors/index.js';
import { requireNonEmptyString } from '@gm-safaris/shared-validation';
import { LOCAL_CMS_USER } from '../../security/requireAuth.js';
import { usersRepository } from '../users/users.repository.js';
import { hashPassword, verifyPassword } from '../../security/password.js';
import { signAccessToken } from '../../security/jwt.js';
import { recordAudit } from '../audit/audit.service.js';
import { sendSiteMail, loadMailSettings } from '../settings/mailer.js';
import { passwordResetEmail, cmsSiteUrl } from '../settings/email-templates.js';

export const authService = {
  async login(email, password) {
    const emailResult = requireNonEmptyString(email, 'email', 180);
    const passwordResult = requireNonEmptyString(password, 'password', 200);
    if (!emailResult.ok) throw validationError(emailResult.message);
    if (!passwordResult.ok) throw validationError(passwordResult.message);

    const user = await usersRepository.findByEmail(emailResult.value);
    if (!user || !(await verifyPassword(passwordResult.value, user.passwordHash))) {
      throw unauthorized('Invalid email or password');
    }
    if (user.status === 'disabled') {
      throw unauthorized('This account is disabled');
    }

    const token = signAccessToken(user);
    await recordAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: 'auth.login',
      resource: 'user',
      resourceId: user.id,
    });

    return {
      token,
      user: usersRepository.toPublic(user),
    };
  },

  async forgotPassword(email) {
    const emailResult = requireNonEmptyString(email, 'email', 180);
    if (!emailResult.ok) throw validationError(emailResult.message);
    const user = await usersRepository.findByEmail(emailResult.value);
    if (user) {
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
    return { ok: true };
  },

  async resetPassword(token, password) {
    const tokenResult = requireNonEmptyString(token, 'token', 200);
    const passwordResult = requireNonEmptyString(password, 'password', 200);
    if (!tokenResult.ok) throw validationError(tokenResult.message);
    if (!passwordResult.ok) throw validationError(passwordResult.message);
    if (passwordResult.value.length < 8) {
      throw validationError('Password must be at least 8 characters');
    }
    const tokenHash = crypto.createHash('sha256').update(tokenResult.value).digest('hex');
    const user = await usersRepository.findByResetTokenHash(tokenHash);
    if (!user) throw validationError('This reset link is invalid or has expired');
    await usersRepository.updatePassword(user.id, await hashPassword(passwordResult.value));
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
    if (userId === LOCAL_CMS_USER.userId) {
      return {
        id: LOCAL_CMS_USER.userId,
        email: LOCAL_CMS_USER.email,
        name: LOCAL_CMS_USER.name,
        role: LOCAL_CMS_USER.role,
      };
    }
    const user = await usersRepository.findById(userId);
    if (!user) throw unauthorized('Session is no longer valid');
    return usersRepository.toPublic(user);
  },
};
