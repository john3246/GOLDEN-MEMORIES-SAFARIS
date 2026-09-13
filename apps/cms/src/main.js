import './styles/cms.css';
import { api } from './api/client.js';
import { CONTENT_TYPES, CONTENT_KEYS } from './content/catalog.js';
import { renderLogin, initLogin } from './pages/login.js';
import { renderDashboard, initDashboard } from './pages/dashboard.js';
import { renderList, initList } from './pages/list.js';
import { renderEditor, initEditor } from './pages/editor.js';
import { renderMedia, initMedia } from './pages/media.js';
import { renderClients, initClients } from './pages/clients.js';
import { renderAudit, initAudit } from './pages/audit.js';
import { renderContentList, initContentList } from './pages/content-list.js';
import { renderContentEditor, initContentEditor } from './pages/content-editor.js';
import { renderSettings, initSettings } from './pages/settings.js';
import { renderOperations, initOperations } from './pages/operations.js';
import { initShell } from './pages/shell.js';

function route() {
  const hash = window.location.hash.replace(/^#/, '') || '/dashboard';
  const safari = hash.match(/^\/safaris\/([^/]+)$/);
  const contentEdit = hash.match(/^\/(pages|destinations|posts|testimonials|faqs|lodges|departures|menus)\/([^/]+)$/);
  const contentList = hash.match(/^\/(pages|destinations|posts|testimonials|faqs|lodges|departures|menus)$/);
  if (hash === '/login') return { name: 'login' };
  if (hash === '/' || hash === '/dashboard') return { name: 'dashboard' };
  if (hash === '/media') return { name: 'media' };
  if (hash === '/api-clients') return { name: 'clients' };
  if (hash === '/activity') return { name: 'activity' };
  if (hash === '/settings') return { name: 'settings' };
  if (hash === '/bookings') return { name: 'ops', kind: 'bookings' };
  if (hash === '/inquiries') return { name: 'ops', kind: 'inquiries' };
  if (hash === '/customers') return { name: 'ops', kind: 'customers' };
  if (safari) return { name: 'editor', id: safari[1] };
  if (hash === '/safaris') return { name: 'list' };
  if (contentEdit) return { name: 'content-editor', type: contentEdit[1], id: contentEdit[2] };
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

  if (!user || current.name === 'login') {
    if (user && current.name === 'login') {
      window.location.hash = '#/dashboard';
      return;
    }
    app.innerHTML = renderLogin();
    initLogin(goDashboard);
    return;
  }

  const adminOnly = ['clients', 'activity', 'settings'];
  if (adminOnly.includes(current.name) && user.role !== 'Admin') {
    window.location.hash = '#/dashboard';
    return;
  }

  if (current.name === 'editor') {
    app.innerHTML = renderEditor(user, current.id);
    readyChrome();
    await initEditor(current.id);
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
  if (current.name === 'ops') {
    app.innerHTML = renderOperations(user, current.kind);
    readyChrome();
    await initOperations(current.kind);
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

mount();
