import { cardUrl } from '../../media/gallery.js';

/**
 * Animated image slideshow for the Why Us section.
 * @param {{ src: string, alt: string }[]} slides
 */
export function whyUsSlideshow(slides) {
  const images = slides
    .map(
      (slide, index) => `
      <figure class="why-slide${index === 0 ? ' is-active' : ''}" data-slide-index="${index}">
        <img
          src="${cardUrl(slide.src, slide.alt, index)}"
          alt="${slide.alt}"
          width="1200"
          height="800"
          loading="${index === 0 ? 'eager' : 'lazy'}"
          decoding="async"
        />
      </figure>
    `
    )
    .join('');

  const dots = slides
    .map(
      (_, index) => `
      <button
        type="button"
        class="why-slide-dot${index === 0 ? ' is-active' : ''}"
        data-slide-to="${index}"
        aria-label="Show photo ${index + 1}"
        ${index === 0 ? 'aria-current="true"' : ''}
      ></button>
    `
    )
    .join('');

  return `
    <div class="why-slideshow" data-why-slideshow aria-roledescription="carousel" aria-label="Golden Memories Safaris moments">
      <div class="why-slideshow-stage">
        ${images}
      </div>
      <div class="why-slideshow-dots" role="tablist" aria-label="Slideshow controls">
        ${dots}
      </div>
    </div>
  `;
}

/**
 * Auto-advance slideshow every 4.5s; pause on hover / focus.
 */
export function initWhyUsSlideshow() {
  const root = document.querySelector('[data-why-slideshow]');
  if (!root) return;

  const slides = [...root.querySelectorAll('[data-slide-index]')];
  const dots = [...root.querySelectorAll('[data-slide-to]')];
  if (slides.length < 2) return;

  let index = 0;
  let timer = null;
  const intervalMs = 4500;

  const show = (next) => {
    index = (next + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      slide.classList.toggle('is-active', i === index);
    });
    dots.forEach((dot, i) => {
      const active = i === index;
      dot.classList.toggle('is-active', active);
      if (active) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
  };

  const stop = () => {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  };

  const start = () => {
    stop();
    timer = setInterval(() => show(index + 1), intervalMs);
  };

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const target = Number.parseInt(dot.getAttribute('data-slide-to') || '0', 10);
      show(target);
      start();
    });
  });

  root.addEventListener('mouseenter', stop);
  root.addEventListener('mouseleave', start);
  root.addEventListener('focusin', stop);
  root.addEventListener('focusout', start);

  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    start();
  }
}
