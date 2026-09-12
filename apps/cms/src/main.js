import './styles/cms.css';
import { api } from './api/client.js';
import { renderLogin, initLogin } from './pages/login.js';
import { renderList, initList } from './pages/list.js';
import { renderEditor, initEditor } from './pages/editor.js';
import { renderMedia, initMedia } from './pages/media.js';
import { renderClients, initClients } from './pages/clients.js';

function route() {
  const hash = window.location.hash.replace(/^#/, '') || '/safaris';
  const safari = hash.match(/^\/safaris\/([^/]+)$/);
  if (hash === '/login') return { name: 'login' };
  if (hash === '/media') return { name: 'media' };
  if (hash === '/api-clients') return { name: 'clients' };
  if (safari) return { name: 'editor', id: safari[1] };
  return { name: 'list' };
}

function bindLogout() {
  document.querySelector('#cms-logout')?.addEventListener('click', () => {
    api.clearSession();
    window.location.hash = '#/login';
    mount();
  });
}

async function mount() {
  const app = document.querySelector('#app');
  if (!app) return;
  const current = route();
  const user = api.user();

  if (!user || current.name === 'login') {
    if (user && current.name === 'login') {
      window.location.hash = '#/safaris';
      return;
    }
    app.innerHTML = renderLogin();
    initLogin(() => {
      window.location.hash = '#/safaris';
      mount();
    });
    return;
  }

  if (current.name === 'editor') {
    app.innerHTML = renderEditor(user, current.id);
    bindLogout();
    await initEditor(current.id);
    return;
  }
  if (current.name === 'media') {
    app.innerHTML = renderMedia(user);
    bindLogout();
    await initMedia();
    return;
  }
  if (current.name === 'clients') {
    app.innerHTML = renderClients(user);
    bindLogout();
    await initClients();
    return;
  }

  app.innerHTML = renderList(user);
  bindLogout();
  initList();
}

window.addEventListener('hashchange', () => {
  mount();
});

mount();
