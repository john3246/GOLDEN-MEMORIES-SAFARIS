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
          src="${slide.src}"
          alt="${slide.alt}"
          width="900"
          height="720"
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
      <svg class="why-slideshow-defs" aria-hidden="true" focusable="false">
        <defs>
          <clipPath id="why-spill-clip" clipPathUnits="objectBoundingBox">
            <path d="M0.28 0.20 C0.34 0.08 0.50 0.06 0.60 0.16 C0.70 0.08 0.84 0.12 0.88 0.26 C0.96 0.32 0.90 0.44 0.86 0.50 C1.02 0.56 1.02 0.74 0.90 0.82 C0.94 0.92 0.82 1.00 0.70 0.92 C0.58 1.02 0.40 0.96 0.30 0.86 C0.16 0.92 0.02 0.78 0.06 0.62 C0.00 0.50 0.08 0.38 0.10 0.30 C0.06 0.20 0.16 0.12 0.28 0.20 Z" />
            <path d="M0.86 0.86 C0.91 0.84 0.95 0.91 0.91 0.95 C0.86 0.97 0.81 0.89 0.86 0.86 Z" />
            <path d="M0.04 0.86 C0.10 0.84 0.13 0.92 0.08 0.96 C0.02 0.98 0.00 0.90 0.04 0.86 Z" />
          </clipPath>
        </defs>
      </svg>
      <div class="why-slideshow-spill">
        <div class="why-slideshow-stage">
          ${images}
        </div>
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
