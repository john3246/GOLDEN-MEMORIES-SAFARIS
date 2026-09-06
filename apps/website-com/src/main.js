import './styles/main.css';
import { renderHeader, initHeader } from './components/navigation/header.js';
import { renderFooter } from './components/layout/footer.js';
import { renderHome, initHomeReveals } from './pages/home/home.js';
import { initWhyUsSlideshow } from './components/gallery/why-slideshow.js';

/**
 * Website entry — composes layout + home page modules.
 */
function mount() {
  const app = document.querySelector('#app');
  if (!app) return;

  app.innerHTML = `${renderHeader()}${renderHome()}${renderFooter()}`;
  initHeader();
  initHomeReveals();
  initWhyUsSlideshow();
}

mount();
