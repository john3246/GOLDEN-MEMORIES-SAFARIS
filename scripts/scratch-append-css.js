const fs = require('fs');
const cssPath = 'apps/cms/src/styles/cms.css';
let css = fs.readFileSync(cssPath, 'utf8');

const cssAdditions = `
/* ============================================================
   REFACTORED V2 TOUR CARDS
   ============================================================ */

/* Override grid */
.cms-tour-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  align-items: stretch;
}

@media (min-width: 768px) {
  .cms-tour-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .cms-tour-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

/* New Card Anatomy */
.cms-safari-card-v2 {
  display: flex;
  flex-direction: column;
  background-color: #1a1f1d;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  overflow: hidden;
  color: #fff;
  height: 100%;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.cms-safari-card-v2:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(0,0,0,0.4);
  border-color: rgba(255, 255, 255, 0.25);
}

/* Header & Image */
.cms-card-header {
  position: relative;
  aspect-ratio: 16 / 9;
  background: #2a312e;
  overflow: hidden;
  flex-shrink: 0;
}

.cms-card-img-link {
  display: block;
  width: 100%;
  height: 100%;
}

.cms-card-header img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.3s ease;
}

.cms-safari-card-v2:hover .cms-card-header img {
  transform: scale(1.03);
}

/* Top Overlays */
.cms-card-badge-tl {
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  display: flex;
  gap: 0.5rem;
  z-index: 2;
}

.cms-card-badge-tr {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  display: flex;
  gap: 0.5rem;
  align-items: center;
  z-index: 2;
}

.cms-card-pill-kicker,
.cms-card-pill-status,
.cms-card-pill-featured {
  font-family: var(--font-body, system-ui);
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 0.25rem 0.6rem;
  border-radius: 4px;
  backdrop-filter: blur(4px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.cms-card-pill-kicker {
  background: rgba(0,0,0,0.65);
  color: #fff;
  border: 1px solid rgba(255,255,255,0.15);
}

.cms-card-pill-status.is-live {
  background: #e3f6ea;
  color: #145c38;
}

.cms-card-pill-status.is-draft {
  background: #fff3d4;
  color: #6b4e12;
}

.cms-card-pill-featured {
  background: var(--color-gold, #c9a84c);
  color: #1a1f1d;
}

/* Card Body */
.cms-card-body {
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 1.25rem;
  background-color: #1a1f1d; /* solid */
}

.cms-card-title {
  font-family: var(--font-display, 'Nunito Sans', sans-serif);
  font-size: 1.15rem;
  font-weight: 700;
  line-height: 1.35;
  margin: 0 0 0.5rem 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 3.1rem; /* approx 2 lines */
}

.cms-card-title a {
  color: #fff;
  text-decoration: none;
}
.cms-card-title a:hover {
  color: var(--color-gold, #c9a84c);
}

.cms-card-route {
  font-family: var(--font-body, system-ui);
  font-size: 0.85rem;
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Footer & Buttons */
.cms-card-footer {
  margin-top: auto; /* Pin to bottom */
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.cms-card-actions {
  display: flex;
  gap: 0.5rem;
}

.cms-card-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-body, system-ui);
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.4rem 0.85rem;
  border-radius: 4px;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s;
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  border: 1px solid transparent;
}

.cms-card-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
}

.cms-card-controls .cms-card-btn-publish {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.cms-card-controls .cms-card-btn-publish:hover {
  background: #145c38;
  color: #fff;
}

.cms-card-controls .cms-card-btn-unpublish {
  background: transparent;
  border: 1px solid rgba(255,255,255,0.2);
  color: rgba(255,255,255,0.7);
}

.cms-card-controls .cms-card-btn-unpublish:hover {
  background: rgba(255, 50, 50, 0.15);
  color: #ff6b6b;
  border-color: rgba(255, 50, 50, 0.3);
}
`;

if (!css.includes('REFACTORED V2 TOUR CARDS')) {
  fs.writeFileSync(cssPath, css + '\\n' + cssAdditions);
  console.log('Successfully appended CSS additions.');
} else {
  console.log('CSS additions already present.');
}
