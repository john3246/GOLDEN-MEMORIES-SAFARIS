import { CmsRole } from '@gm-safaris/shared-types';
import { usersRepository } from './users.repository.js';
import { hashPassword } from '../../security/password.js';
import { forbidden, notFound, validationError } from '../../errors/index.js';
import { recordAudit } from '../audit/audit.service.js';
import { syncStaffUser } from './users.sync.js';

const MANAGEABLE_ROLES = new Set([CmsRole.SUPER_ADMIN, CmsRole.ADMIN]);

function actorMeta(actor) {
  return { actorId: actor?.userId, actorEmail: actor?.email };
}

function cleanEmail(value) {
  const email = String(value || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
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

function cleanRole(value, actor) {
  const role = String(value || '').trim();
  if (!MANAGEABLE_ROLES.has(role)) {
    throw validationError('Role must be Super Admin or Admin', { field: 'role' });
  }
  if (role === CmsRole.SUPER_ADMIN && actor?.role !== CmsRole.SUPER_ADMIN) {
    throw forbidden('Only a Super Admin can assign that role');
  }
  return role;
}

function cleanPassword(value, required) {
  const password = String(value || '');
  if (!password) {
    if (required) throw validationError('Password is required', { field: 'password' });
    return null;
  }
  if (password.length < 8) throw validationError('Password must be at least 8 characters', { field: 'password' });
  return password;
}

async function superAdminCount() {
  const users = await usersRepository.all();
  return users.filter((user) => user.role === CmsRole.SUPER_ADMIN && user.status !== 'disabled').length;
}

export const usersService = {
  async list() {
    const users = await usersRepository.all();
    return {
      data: users.map((user) => usersRepository.toPublic(user)),
      meta: { total: users.length },
    };
  },

  async create(body, actor) {
    const email = cleanEmail(body?.email);
    if (await usersRepository.findByEmail(email)) {
      throw validationError('That email is already in use', { field: 'email' });
    }
    const user = await usersRepository.create({
      email,
      name: cleanName(body?.name),
      role: cleanRole(body?.role, actor),
      passwordHash: await hashPassword(cleanPassword(body?.password, true)),
      status: body?.status === 'disabled' ? 'disabled' : 'active',
      actorId: actor?.userId || null,
    });
    await syncStaffUser(user);
    await recordAudit({ ...actorMeta(actor), action: 'users.create', resource: 'users', resourceId: user.id });
    return usersRepository.toPublic(user);
  },

  async update(id, body, actor) {
    const user = await usersRepository.findById(id);
    if (!user) throw notFound('User not found');
    if (user.role === CmsRole.SUPER_ADMIN && actor?.role !== CmsRole.SUPER_ADMIN) {
      throw forbidden('Only a Super Admin can change that account');
    }

    if (body?.email !== undefined) {
      const email = cleanEmail(body.email);
      const existing = await usersRepository.findByEmail(email);
      if (existing && existing.id !== user.id) {
        throw validationError('That email is already in use', { field: 'email' });
      }
      user.email = email;
    }
    if (body?.name !== undefined) user.name = cleanName(body.name);
    if (body?.role !== undefined) user.role = cleanRole(body.role, actor);

    const nextStatus = body?.status === 'disabled' ? 'disabled' : body?.status === 'active' ? 'active' : user.status;
    if (nextStatus === 'disabled') {
      if (user.id === actor?.userId) throw validationError('You cannot disable your own account');
      if (user.role === CmsRole.SUPER_ADMIN && (await superAdminCount()) <= 1) {
        throw validationError('Keep at least one Super Admin active');
      }
      user.status = 'disabled';
      user.disabledAt = new Date().toISOString();
    } else {
      user.status = 'active';
      user.disabledAt = null;
    }

    const password = cleanPassword(body?.password, false);
    if (password) user.passwordHash = await hashPassword(password);
    user.updatedAt = new Date().toISOString();
    await usersRepository.save(user);
    await syncStaffUser(user);
    await recordAudit({ ...actorMeta(actor), action: 'users.update', resource: 'users', resourceId: id });
    return usersRepository.toPublic(user);
  },
};
