import { readStore, updateStore } from '../../cms-store/index.js';
import { DEFAULT_SETTINGS } from '../content/content.seed.js';
import { smtpConfig } from './mailer.js';
import { clearSmtpSecret, normalizeSmtpPass, writeSmtpSecret } from './smtp-secrets.js';

const MASK = '••••••••';

function publicEmail(stored, live) {
  const email = { ...(stored || {}) };
  delete email.smtpPass;
  email.smtpHost = live.smtpHost || email.smtpHost || '';
  email.smtpPort = live.smtpPort || email.smtpPort || '587';
  email.smtpUser = live.smtpUser || email.smtpUser || '';
  email.smtpPass = live.configured ? MASK : '';
  email.smtpSecure = Boolean(live.smtpSecure);
  email.configured = Boolean(live.configured);
  email.envLocked = Boolean(live.envLocked);
  return email;
}

function publicSettings(settings, live) {
  const next = JSON.parse(JSON.stringify(settings || DEFAULT_SETTINGS));
  next.email = publicEmail(next.email, live);
  return next;
}

export const settingsService = {
  async getPublic() {
    const store = await readStore();
    const settings = store.settings || DEFAULT_SETTINGS;
    return {
      site: settings.site || DEFAULT_SETTINGS.site,
      seo: settings.seo || DEFAULT_SETTINGS.seo,
      websiteLive: settings.websiteLive !== false,
    };
  },

  async getAdmin() {
    const store = await readStore();
    const live = await smtpConfig();
    return publicSettings(store.settings || DEFAULT_SETTINGS, live);
  },

  async save(body, actor) {
    const incomingPass = normalizeSmtpPass(body?.email?.smtpPass);
    const liveBefore = await smtpConfig();
    if (incomingPass && incomingPass !== MASK && !liveBefore.envLocked) {
      await writeSmtpSecret(incomingPass);
    }
    if (
      body?.email &&
      Object.prototype.hasOwnProperty.call(body.email, 'smtpPass') &&
      !incomingPass &&
      !liveBefore.envLocked
    ) {
      await clearSmtpSecret();
    }

    const saved = await updateStore((store) => {
      const current = store.settings || { ...DEFAULT_SETTINGS };
      const email = { ...(current.email || {}), ...(body.email || {}) };
      delete email.smtpPass;
      delete email.configured;
      delete email.envLocked;
      if (liveBefore.envLocked) {
        email.smtpHost = current.email?.smtpHost || '';
        email.smtpPort = current.email?.smtpPort || '587';
        email.smtpUser = current.email?.smtpUser || '';
        email.smtpSecure = current.email?.smtpSecure || false;
      }
      store.settings = {
        ...current,
        ...body,
        site: { ...(current.site || {}), ...(body.site || {}) },
        email,
        seo: { ...(current.seo || {}), ...(body.seo || {}) },
        updated_at: new Date().toISOString(),
        updated_by: actor?.userId || null,
      };
      return store.settings;
    });
    const live = await smtpConfig();
    return publicSettings(saved, live);
  },
};
