import './styles/cms.css';
import { api } from './api/client.js';
import { CONTENT_TYPES, CONTENT_KEYS } from './content/catalog.js';
import { renderLogin, initLogin, renderForgot, initForgot, renderReset, initReset } from './pages/login.js';
import { isStaffAdmin } from './auth/roles.js';
import { renderDashboard, initDashboard } from './pages/dashboard.js';
import { renderList, initList } from './pages/list.js';
import { renderEditor, initEditor } from './pages/editor.js';
import { renderPreview, initPreview } from './pages/preview.js';
import { renderMedia, initMedia } from './pages/media.js';
import { renderClients, initClients } from './pages/clients.js';
import { renderAudit, initAudit } from './pages/audit.js';
import { renderContentList, initContentList } from './pages/content-list.js';
import { renderContentEditor, initContentEditor } from './pages/content-editor.js';
import { renderBlogEditor, initBlogEditor } from './pages/blog-editor.js';
import { renderDestinationEditor, initDestinationEditor } from './pages/destination-editor.js';
import { renderSettings, initSettings } from './pages/settings.js';
import { renderOperations, initOperations, renderBookingDetail, initBookingDetail } from './pages/operations.js';
import { renderUsers, initUsers } from './pages/users.js';
import { initShell } from './pages/shell.js';
import { renderReviews, initReviews } from './pages/reviews.js';
import { renderIntegrations, initIntegrations } from './pages/integrations.js';
import { renderProfile, initProfile } from './pages/profile.js';
import { renderSystem, initSystem } from './pages/system.js';

function route() {
  const raw = window.location.hash.replace(/^#/, '') || '/dashboard';
  const [path, query] = raw.split('?');
  const hash = path || '/dashboard';
  const params = new URLSearchParams(query || '');
  const safariPreview = hash.match(/^\/safaris\/([^/]+)\/preview$/);
  const safari = hash.match(/^\/safaris\/([^/]+)$/);
  const contentPreview = hash.match(/^\/(pages|destinations|posts|testimonials|faqs|lodges|departures|menus)\/([^/]+)\/preview$/);
  const contentEdit = hash.match(/^\/(pages|destinations|posts|testimonials|faqs|lodges|departures|menus)\/([^/]+)$/);
  const contentList = hash.match(/^\/(pages|destinations|posts|testimonials|faqs|lodges|departures|menus)$/);
  if (hash === '/login') return { name: 'login' };
  if (hash === '/forgot') return { name: 'forgot' };
  if (hash === '/reset') return { name: 'reset', token: params.get('token') || '' };
  if (hash === '/' || hash === '/dashboard') return { name: 'dashboard' };
  if (hash === '/media') return { name: 'media' };
  if (hash === '/api-clients') return { name: 'clients' };
  if (hash === '/activity') return { name: 'activity' };
  if (hash === '/settings') return { name: 'settings' };
  const booking = hash.match(/^\/bookings\/([^/]+)$/);
  if (hash === '/bookings') return { name: 'ops', kind: 'bookings' };
  if (booking) return { name: 'booking', id: booking[1] };
  if (hash === '/inquiries') return { name: 'ops', kind: 'inquiries' };
  if (hash === '/customers') return { name: 'ops', kind: 'customers' };
  if (hash === '/users') return { name: 'users' };
  if (hash === '/reviews') return { name: 'reviews' };
  if (hash === '/integrations') return { name: 'integrations' };
  if (hash === '/profile') return { name: 'profile' };
  if (hash === '/system') return { name: 'system' };
  if (safariPreview) return { name: 'preview', type: 'safaris', id: safariPreview[1] };
  if (safari) return { name: 'editor', id: safari[1] };
  if (hash === '/safaris') return { name: 'list' };
  if (contentPreview) return { name: 'preview', type: contentPreview[1], id: contentPreview[2] };
  if (contentEdit) {
    if (contentEdit[1] === 'posts') return { name: 'blog-editor', id: contentEdit[2] };
    if (contentEdit[1] === 'destinations') return { name: 'destination-editor', id: contentEdit[2] };
    if (contentEdit[1] === 'departures') return { name: 'group-editor', id: contentEdit[2] };
    return { name: 'content-editor', type: contentEdit[1], id: contentEdit[2] };
  }
  if (contentList) return { name: 'content-list', type: contentList[1] };
  return { name: 'dashboard' };
}

function bindLogout() {
  document.querySelector('#cms-logout')?.addEventListener('click', () => {
    api.clearSession();
    window.location.hash = '#/login';
    mount();
  });
}

function readyChrome() {
  bindLogout();
  initShell();
}

function goDashboard() {
  window.location.hash = '#/dashboard';
  mount();
}

async function mount() {
  const app = document.querySelector('#app');
  if (!app) return;
  const current = route();
  const user = api.user();

  if (current.name === 'forgot') {
    app.innerHTML = renderForgot();
    initForgot();
    return;
  }
  if (current.name === 'reset') {
    app.innerHTML = renderReset(current.token);
    initReset();
    return;
  }
  if (!user || current.name === 'login') {
    if (user && current.name === 'login') {
      window.location.hash = '#/dashboard';
      return;
    }
    app.innerHTML = renderLogin();
    initLogin(goDashboard);
    return;
  }

  const adminOnly = ['clients', 'activity', 'settings', 'users', 'integrations', 'system'];
  if (adminOnly.includes(current.name) && !isStaffAdmin(user)) {
    window.location.hash = '#/dashboard';
    return;
  }

  if (current.name === 'editor') {
    app.innerHTML = renderEditor(user, current.id);
    readyChrome();
    await initEditor(current.id);
    return;
  }
  if (current.name === 'group-editor') {
    app.innerHTML = renderEditor(user, current.id, 'departures');
    readyChrome();
    await initEditor(current.id, 'departures');
    return;
  }
  if (current.name === 'preview') {
    app.innerHTML = renderPreview(user, current.type, current.id);
    readyChrome();
    await initPreview(current.type, current.id);
    return;
  }
  if (current.name === 'media') {
    app.innerHTML = renderMedia(user);
    readyChrome();
    await initMedia();
    return;
  }
  if (current.name === 'clients') {
    app.innerHTML = renderClients(user);
    readyChrome();
    await initClients();
    return;
  }
  if (current.name === 'activity') {
    app.innerHTML = renderAudit(user);
    readyChrome();
    await initAudit();
    return;
  }
  if (current.name === 'settings') {
    app.innerHTML = renderSettings(user);
    readyChrome();
    await initSettings();
    return;
  }
  const simplePages = {
    reviews: [renderReviews, initReviews],
    integrations: [renderIntegrations, initIntegrations],
    profile: [renderProfile, initProfile],
    system: [renderSystem, initSystem],
  };
  if (simplePages[current.name]) {
    const [render, init] = simplePages[current.name];
    app.innerHTML = render(user);
    readyChrome();
    await init();
    return;
  }
  if (current.name === 'users') {
    app.innerHTML = renderUsers(user);
    readyChrome();
    await initUsers();
    return;
  }
  if (current.name === 'ops') {
    app.innerHTML = renderOperations(user, current.kind);
    readyChrome();
    await initOperations(current.kind);
    return;
  }
  if (current.name === 'booking') {
    app.innerHTML = renderBookingDetail(user, current.id);
    readyChrome();
    await initBookingDetail(current.id);
    return;
  }
  if (current.name === 'blog-editor') {
    app.innerHTML = renderBlogEditor(user, current.id);
    readyChrome();
    await initBlogEditor(current.id);
    return;
  }
  if (current.name === 'destination-editor') {
    app.innerHTML = renderDestinationEditor(user, current.id);
    readyChrome();
    await initDestinationEditor(current.id);
    return;
  }
  if (current.name === 'content-list' && CONTENT_KEYS.includes(current.type)) {
    app.innerHTML = renderContentList(user, CONTENT_TYPES[current.type]);
    readyChrome();
    initContentList(current.type);
    return;
  }
  if (current.name === 'content-editor' && CONTENT_KEYS.includes(current.type)) {
    const spec = CONTENT_TYPES[current.type];
    app.innerHTML = renderContentEditor(user, spec, current.id);
    readyChrome();
    await initContentEditor(current.type, current.id, spec);
    return;
  }
  if (current.name === 'list') {
    app.innerHTML = renderList(user);
    readyChrome();
    initList();
    return;
  }

  app.innerHTML = renderDashboard(user);
  readyChrome();
  await initDashboard();
}

window.addEventListener('hashchange', () => {
  mount();
});

// Replace broken thumbnails with a neutral placeholder (no inline handlers — CSP friendly).
document.addEventListener(
  'error',
  (event) => {
    const img = event.target;
    if (!(img instanceof HTMLImageElement) || img.dataset.fallbackApplied) return;
    img.dataset.fallbackApplied = '1';
    img.classList.add('is-broken');
    const fallback = img.getAttribute('data-fallback');
    if (fallback) img.src = fallback;
  },
  true
);

mount();
