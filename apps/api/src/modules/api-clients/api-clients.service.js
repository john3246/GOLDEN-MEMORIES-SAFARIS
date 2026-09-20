import crypto from 'node:crypto';
import { createId } from '@gm-safaris/shared-utils';
import { SafariScope, ExternalPermission } from '@gm-safaris/shared-types';
import { readStore, updateStore } from '../../cms-store/index.js';
import { notFound, validationError, unauthorized, forbidden } from '../../errors/index.js';
import { recordAudit } from '../audit/audit.service.js';

const WRITE_SCOPES = new Set([
  SafariScope.WRITE,
  SafariScope.PUBLISH,
  SafariScope.DELETE,
  SafariScope.MEDIA,
  SafariScope.API_CLIENTS,
]);
const ALLOWED_SCOPES = new Set([...Object.values(SafariScope), ...Object.values(ExternalPermission)]);
const DEFAULT_PARTNER_SCOPES = Object.values(ExternalPermission);

function hashKey(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

function generateKey() {
  return `gm_${crypto.randomBytes(24).toString('hex')}`;
}

function keyPrefix(raw) {
  return `${raw.slice(0, 7)}…${raw.slice(-4)}`;
}

function toPublic(client) {
  if (!client) return null;
  return {
    id: client.id,
    name: client.name,
    prefix: client.prefix,
    scopes: client.scopes,
    expiresAt: client.expiresAt,
    revokedAt: client.revokedAt,
    lastUsedAt: client.lastUsedAt,
    createdAt: client.createdAt,
  };
}

export const apiClientsRepository = {
  async list() {
    const store = await readStore();
    return store.apiClients.map(toPublic);
  },

  async findById(id) {
    const store = await readStore();
    return store.apiClients.find((item) => item.id === id) || null;
  },

  async findByHash(keyHash) {
    const store = await readStore();
    return store.apiClients.find((item) => item.keyHash === keyHash) || null;
  },
};

export const apiClientsService = {
  async list() {
    return apiClientsRepository.list();
  },

  async create({ name, scopes, expiresAt }, actor) {
    if (!name || !String(name).trim()) throw validationError('name is required');
    const raw = generateKey();
    const resolved = Array.isArray(scopes) && scopes.length ? scopes : DEFAULT_PARTNER_SCOPES;
    if (resolved.some((scope) => !ALLOWED_SCOPES.has(scope))) {
      throw validationError('One or more scopes are invalid');
    }
    if (resolved.some((scope) => WRITE_SCOPES.has(scope)) && actor?.role !== 'Admin') {
      throw forbidden('Only administrators can issue write scopes');
    }

    const client = {
      id: createId(),
      name: String(name).trim(),
      keyHash: hashKey(raw),
      prefix: keyPrefix(raw),
      scopes: resolved,
      expiresAt: expiresAt || null,
      revokedAt: null,
      lastUsedAt: null,
      createdAt: new Date().toISOString(),
      createdBy: actor?.userId || null,
    };

    await updateStore((store) => {
      store.apiClients.push(client);
    });

    await recordAudit({
      actorId: actor?.userId,
      actorEmail: actor?.email,
      action: 'api_key.created',
      resource: 'api_client',
      resourceId: client.id,
      metadata: { name: client.name, scopes: client.scopes, prefix: client.prefix },
    });

    return { ...toPublic(client), key: raw };
  },

  async revoke(id, actor) {
    const client = await updateStore((store) => {
      const item = store.apiClients.find((row) => row.id === id);
      if (!item) return null;
      item.revokedAt = new Date().toISOString();
      return item;
    });
    if (!client) throw notFound('API client not found');
    await recordAudit({
      actorId: actor?.userId,
      actorEmail: actor?.email,
      action: 'api_key.revoked',
      resource: 'api_client',
      resourceId: id,
      metadata: { prefix: client.prefix },
    });
    return toPublic(client);
  },

  async rotate(id, actor) {
    await this.revoke(id, actor);
    const previous = await apiClientsRepository.findById(id);
    return this.create(
      { name: `${previous?.name || 'client'} (rotated)`, scopes: previous?.scopes, expiresAt: previous?.expiresAt },
      actor
    );
  },

  /**
   * Authenticate a presented key. Never returns the hash to callers.
   */
  async authenticate(presented) {
    if (!presented) throw unauthorized('Invalid or missing API key');
    const client = await apiClientsRepository.findByHash(hashKey(presented));
    if (!client || client.revokedAt) throw unauthorized('Invalid or missing API key');
    if (client.expiresAt && Date.now() > Date.parse(client.expiresAt)) {
      throw unauthorized('API key has expired');
    }
    await updateStore((store) => {
      const item = store.apiClients.find((row) => row.id === client.id);
      if (item) item.lastUsedAt = new Date().toISOString();
    });
    return {
      id: client.id,
      name: client.name,
      scopes: client.scopes,
    };
  },
};
