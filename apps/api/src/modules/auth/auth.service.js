import { validationError, unauthorized } from '../../errors/index.js';
import { requireNonEmptyString } from '@gm-safaris/shared-validation';
import { LOCAL_CMS_USER } from '../../security/requireAuth.js';
import { usersRepository } from '../users/users.repository.js';
import { verifyPassword } from '../../security/password.js';
import { signAccessToken } from '../../security/jwt.js';
import { recordAudit } from '../audit/audit.service.js';

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
