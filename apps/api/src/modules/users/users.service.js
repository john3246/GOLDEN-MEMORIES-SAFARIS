import { CmsRole } from '@gm-safaris/shared-types';
import { usersRepository } from './users.repository.js';
import { hashPassword, verifyPassword } from '../../security/password.js';
import { forbidden, notFound, validationError } from '../../errors/index.js';
import { recordAudit } from '../audit/audit.service.js';
import { invalidateAuthCache } from '../../security/requireAuth.js';
import { passwordProblems } from '../../security/password-policy.js';
import { sendSiteMail, loadMailSettings } from '../settings/mailer.js';
import { staffWelcomeEmail } from '../settings/email-templates.js';

const ALL_ROLES = [CmsRole.SUPER_ADMIN, CmsRole.ADMIN, CmsRole.MANAGER, CmsRole.EDITOR, CmsRole.VIEWER];

function actorMeta(actor) {
  return { actorId: actor?.userId, actorEmail: actor?.email };
}

function cleanEmail(value) {
  const email = String(value || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 180) {
    throw validationError('Enter a valid email address', { field: 'email' });
  }
  return email;
}

function cleanName(value) {
  const name = String(value || '').trim();
  if (!name) throw validationError('Name is required', { field: 'name' });
  if (name.length > 120) throw validationError('Name is too long', { field: 'name' });
  return name;
}

function cleanPhone(value) {
  return String(value || '').trim().slice(0, 40);
}

function cleanRole(value, actor) {
  const role = String(value || '').trim();
  if (!ALL_ROLES.includes(role)) {
    throw validationError(`Role must be one of: ${ALL_ROLES.join(', ')}`, { field: 'role' });
  }
  if (role === CmsRole.SUPER_ADMIN && actor?.role !== CmsRole.SUPER_ADMIN) {
    throw forbidden('Only a Super Admin can assign the Super Admin role');
  }
  return role;
}

function cleanPassword(value, required, context = {}) {
  const password = String(value || '');
  if (!password) {
    if (required) throw validationError('Password is required', { field: 'password' });
    return null;
  }
  const problems = passwordProblems(password, context);
  if (problems.length) throw validationError(problems[0], { field: 'password' });
  return password;
}

async function activeSuperAdmins() {
  const users = await usersRepository.all();
  return users.filter((user) => user.role === CmsRole.SUPER_ADMIN && user.status !== 'disabled').length;
}

function assertCanManage(target, actor) {
  if (target.role === CmsRole.SUPER_ADMIN && actor?.role !== CmsRole.SUPER_ADMIN) {
    throw forbidden('Only a Super Admin can change a Super Admin account');
  }
}

export const usersService = {
  roles() {
    return ALL_ROLES;
  },

  async list() {
    const users = await usersRepository.all();
    return {
      data: users.map((user) => usersRepository.toPublic(user)),
      meta: { total: users.length, roles: ALL_ROLES },
    };
  },

  async create(body, actor) {
    const email = cleanEmail(body?.email);
    if (await usersRepository.findByEmail(email)) {
      throw validationError('That email is already in use', { field: 'email' });
    }
    const name = cleanName(body?.name);
    const password = cleanPassword(body?.password, true, { email, name });
    const user = await usersRepository.create({
      email,
      name,
      phone: cleanPhone(body?.phone),
      role: cleanRole(body?.role || CmsRole.EDITOR, actor),
      passwordHash: await hashPassword(password),
      status: body?.status === 'disabled' ? 'disabled' : 'active',
      actorId: actor?.userId || null,
    });
    await recordAudit({ ...actorMeta(actor), action: 'users.create', resource: 'users', resourceId: user.id, metadata: { role: user.role } });
    if (body?.sendWelcome !== false) {
      const settings = await loadMailSettings();
      const mail = staffWelcomeEmail({ name: user.name, email: user.email, role: user.role }, settings);
      await sendSiteMail({ to: user.email, subject: mail.subject, text: mail.text, html: mail.html }).catch(() => undefined);
    }
    return usersRepository.toPublic(user);
  },

  async update(id, body, actor) {
    const user = await usersRepository.findById(id);
    if (!user) throw notFound('User not found');
    assertCanManage(user, actor);

    if (body?.email !== undefined) {
      const email = cleanEmail(body.email);
      const existing = await usersRepository.findByEmail(email);
      if (existing && existing.id !== user.id) {
        throw validationError('That email is already in use', { field: 'email' });
      }
      user.email = email;
    }
    if (body?.name !== undefined) user.name = cleanName(body.name);
    if (body?.phone !== undefined) user.phone = cleanPhone(body.phone);
    if (body?.notifyBookings !== undefined) user.notifyBookings = Boolean(body.notifyBookings);
    if (body?.notifyInquiries !== undefined) user.notifyInquiries = Boolean(body.notifyInquiries);

    let sessionsReset = false;
    if (body?.role !== undefined) {
      const role = cleanRole(body.role, actor);
      if (user.role === CmsRole.SUPER_ADMIN && role !== CmsRole.SUPER_ADMIN && (await activeSuperAdmins()) <= 1) {
        throw validationError('Keep at least one active Super Admin');
      }
      if (user.id === actor?.userId && role !== user.role && user.role === CmsRole.SUPER_ADMIN) {
        throw validationError('Ask another Super Admin to change your own role');
      }
      if (role !== user.role) sessionsReset = true;
      user.role = role;
    }

    if (body?.status !== undefined) {
      const nextStatus = body.status === 'disabled' ? 'disabled' : 'active';
      if (nextStatus === 'disabled' && user.status !== 'disabled') {
        if (user.id === actor?.userId) throw validationError('You cannot disable your own account');
        if (user.role === CmsRole.SUPER_ADMIN && (await activeSuperAdmins()) <= 1) {
          throw validationError('Keep at least one active Super Admin');
        }
        user.status = 'disabled';
        user.disabledAt = new Date().toISOString();
        sessionsReset = true;
      } else if (nextStatus === 'active') {
        user.status = 'active';
        user.disabledAt = null;
      }
    }

    if (body?.unlock) {
      user.failedLoginCount = 0;
      user.lockedUntil = null;
    }

    const password = cleanPassword(body?.password, false, { email: user.email, name: user.name });
    if (password) {
      user.passwordHash = await hashPassword(password);
      user.failedLoginCount = 0;
      user.lockedUntil = null;
      sessionsReset = true;
    }
    if (sessionsReset || body?.signOutEverywhere) {
      user.tokenVersion = Number(user.tokenVersion || 0) + 1;
    }

    const saved = await usersRepository.save(user);
    invalidateAuthCache(id);
    await recordAudit({ ...actorMeta(actor), action: 'users.update', resource: 'users', resourceId: id });
    return usersRepository.toPublic(saved || user);
  },

  async remove(id, actor) {
    const user = await usersRepository.findById(id);
    if (!user) throw notFound('User not found');
    assertCanManage(user, actor);
    if (user.id === actor?.userId) throw validationError('You cannot delete your own account');
    if (user.role === CmsRole.SUPER_ADMIN && (await activeSuperAdmins()) <= 1) {
      throw validationError('Keep at least one active Super Admin');
    }
    await usersRepository.remove(id);
    invalidateAuthCache(id);
    await recordAudit({ ...actorMeta(actor), action: 'users.delete', resource: 'users', resourceId: id, metadata: { email: user.email } });
    return { id };
  },

  /** Signed-in staff member edits their own profile / password. */
  async updateSelf(actor, body) {
    const user = await usersRepository.findById(actor?.userId);
    if (!user) throw notFound('User not found');
    if (body?.name !== undefined) user.name = cleanName(body.name);
    if (body?.phone !== undefined) user.phone = cleanPhone(body.phone);
    if (body?.notifyBookings !== undefined) user.notifyBookings = Boolean(body.notifyBookings);
    if (body?.notifyInquiries !== undefined) user.notifyInquiries = Boolean(body.notifyInquiries);
    if (body?.newPassword) {
      if (!(await verifyPassword(String(body.currentPassword || ''), user.passwordHash))) {
        throw validationError('Your current password is not correct', { field: 'currentPassword' });
      }
      const password = cleanPassword(body.newPassword, true, { email: user.email, name: user.name });
      user.passwordHash = await hashPassword(password);
      user.tokenVersion = Number(user.tokenVersion || 0) + 1;
    }
    const saved = await usersRepository.save(user);
    invalidateAuthCache(user.id);
    await recordAudit({ ...actorMeta(actor), action: 'users.self_update', resource: 'users', resourceId: user.id });
    return { user: usersRepository.toPublic(saved || user), passwordChanged: Boolean(body?.newPassword) };
  },
};
