import './styles/cms.css';
import { api } from './api/client.js';
import { renderList, initList } from './pages/list.js';
import { renderEditor, initEditor } from './pages/editor.js';
import { renderMedia, initMedia } from './pages/media.js';
import { renderClients, initClients } from './pages/clients.js';

const LOCAL_USER = {
  id: 'local-dev',
  email: 'local@gmsafaris.com',
  name: 'Local editor',
  role: 'Admin',
};

function route() {
  const hash = window.location.hash.replace(/^#/, '') || '/safaris';
  const safari = hash.match(/^\/safaris\/([^/]+)$/);
  if (hash === '/login') return { name: 'list' };
  if (hash === '/media') return { name: 'media' };
  if (hash === '/api-clients') return { name: 'clients' };
  if (safari) return { name: 'editor', id: safari[1] };
  return { name: 'list' };
}

async function mount() {
  const app = document.querySelector('#app');
  if (!app) return;
  const current = route();
  const user = LOCAL_USER;

  if (current.name === 'editor') {
    app.innerHTML = renderEditor(user, current.id);
    await initEditor(current.id);
    return;
  }
  if (current.name === 'media') {
    app.innerHTML = renderMedia(user);
    await initMedia();
    return;
  }
  if (current.name === 'clients') {
    app.innerHTML = renderClients(user);
    await initClients();
    return;
  }

  app.innerHTML = renderList(user);
  initList();
}

window.addEventListener('hashchange', () => {
  mount();
});

mount();
