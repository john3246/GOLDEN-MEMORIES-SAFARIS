import { createId } from '@gm-safaris/shared-utils';
import { CmsRole } from '@gm-safaris/shared-types';
import { readStore, updateStore } from '../../cms-store/index.js';
import { hashPassword } from '../../security/password.js';
import { config } from '../../config/index.js';

function publicUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    status: user.status || (user.disabledAt ? 'disabled' : 'active'),
    createdAt: user.createdAt,
    updatedAt: user.updatedAt || null,
    disabledAt: user.disabledAt || null,
  };
}

export const usersRepository = {
  async findByEmail(email) {
    const store = await readStore();
    const needle = String(email || '').trim().toLowerCase();
    return store.users.find((user) => user.email === needle) || null;
  },

  async findById(id) {
    const store = await readStore();
    return store.users.find((user) => user.id === id) || null;
  },

  async findByResetTokenHash(tokenHash) {
    const store = await readStore();
    const needle = String(tokenHash || '');
    const now = Date.now();
    return (
      store.users.find(
        (user) =>
          user.passwordResetTokenHash === needle &&
          user.passwordResetExpires &&
          Date.parse(user.passwordResetExpires) > now
      ) || null
    );
  },

  async setPasswordReset(id, tokenHash, expiresAt) {
    return updateStore((store) => {
      const user = store.users.find((item) => item.id === id);
      if (!user) return null;
      user.passwordResetTokenHash = tokenHash;
      user.passwordResetExpires = expiresAt;
      user.updatedAt = new Date().toISOString();
      return user;
    });
  },

  async updatePassword(id, passwordHash) {
    return updateStore((store) => {
      const user = store.users.find((item) => item.id === id);
      if (!user) return null;
      user.passwordHash = passwordHash;
      user.passwordResetTokenHash = null;
      user.passwordResetExpires = null;
      user.updatedAt = new Date().toISOString();
      return user;
    });
  },

  async all() {
    const store = await readStore();
    return store.users || [];
  },

  async create({ email, name, role, passwordHash, status = 'active', actorId = null }) {
    const now = new Date().toISOString();
    const user = {
      id: createId(),
      email: String(email).trim().toLowerCase(),
      name,
      role,
      passwordHash,
      status: status === 'disabled' ? 'disabled' : 'active',
      createdAt: now,
      updatedAt: now,
      disabledAt: status === 'disabled' ? now : null,
      createdBy: actorId,
    };
    await updateStore((store) => {
      store.users.push(user);
    });
    return user;
  },

  async save(user) {
    return updateStore((store) => {
      const index = store.users.findIndex((item) => item.id === user.id);
      if (index === -1) return null;
      store.users[index] = user;
      return user;
    });
  },

  toPublic: publicUser,
};

export async function seedDefaultUsers() {
  const store = await readStore();
  if (!store.meta.seededUsers || !store.users.length) {
    const defaults = [
      {
        email: config.cms.adminEmail,
        name: 'Safari Admin',
        role: CmsRole.ADMIN,
        password: config.cms.adminPassword,
      },
      {
        email: config.cms.editorEmail,
        name: 'Safari Editor',
        role: CmsRole.EDITOR,
        password: config.cms.editorPassword,
      },
      {
        email: config.cms.viewerEmail,
        name: 'Safari Viewer',
        role: CmsRole.VIEWER,
        password: config.cms.viewerPassword,
      },
    ];

    for (const item of defaults) {
      const exists = await usersRepository.findByEmail(item.email);
      if (exists) continue;
      await usersRepository.create({
        email: item.email,
        name: item.name,
        role: item.role,
        passwordHash: await hashPassword(item.password),
      });
    }
  }

  const adminEmail = String(config.cms.adminEmail || '').trim().toLowerCase();
  const passwordHash = await hashPassword(config.cms.adminPassword);
  await updateStore((next) => {
    const admin =
      next.users.find((user) => user.role === CmsRole.ADMIN) ||
      next.users.find((user) => user.email === adminEmail) ||
      next.users[0];
    if (admin) {
      admin.email = adminEmail;
      admin.passwordHash = passwordHash;
      admin.name = admin.name || 'Safari Admin';
      admin.role = CmsRole.ADMIN;
    }
    next.meta = { ...(next.meta || {}), seededUsers: true };
  });
}
