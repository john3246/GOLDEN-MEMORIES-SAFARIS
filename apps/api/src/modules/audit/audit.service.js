import { createId } from '@gm-safaris/shared-utils';
import { updateStore } from '../../cms-store/index.js';

const MAX_LOGS = 2000;

/**
 * Append an audit event. Never log secrets or raw API keys.
 * @param {{ actorId?: string, actorEmail?: string, action: string, resource: string, resourceId?: string, metadata?: Record<string, unknown> }} event
 */
export async function recordAudit(event) {
  const entry = {
    id: createId(),
    actorId: event.actorId || null,
    actorEmail: event.actorEmail || null,
    action: event.action,
    resource: event.resource,
    resourceId: event.resourceId || null,
    metadata: event.metadata || {},
    timestamp: new Date().toISOString(),
  };

  await updateStore((store) => {
    store.auditLogs.unshift(entry);
    if (store.auditLogs.length > MAX_LOGS) {
      store.auditLogs.length = MAX_LOGS;
    }
  });

  return entry;
}

export const auditService = {
  record: recordAudit,
};
