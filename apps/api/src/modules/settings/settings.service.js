import { readStore, updateStore } from '../../cms-store/index.js';
import { DEFAULT_SETTINGS } from '../content/content.seed.js';

function publicSettings(settings) {
  const next = JSON.parse(JSON.stringify(settings || DEFAULT_SETTINGS));
  if (next.email) {
    next.email.smtpPass = next.email.smtpPass ? '••••••••' : '';
    next.email.configured = Boolean(settings?.email?.smtpHost && settings?.email?.smtpUser);
  }
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
    return publicSettings(store.settings || DEFAULT_SETTINGS);
  },

  async save(body, actor) {
    return updateStore((store) => {
      const current = store.settings || { ...DEFAULT_SETTINGS };
      const email = { ...(current.email || {}), ...(body.email || {}) };
      if (email.smtpPass === '••••••••' || email.smtpPass === '') {
        email.smtpPass = current.email?.smtpPass || '';
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
      return publicSettings(store.settings);
    });
  },
};
