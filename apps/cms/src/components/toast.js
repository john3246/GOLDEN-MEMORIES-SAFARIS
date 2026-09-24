function host() {
  let el = document.querySelector('#cms-toasts');
  if (el) return el;
  el = document.createElement('div');
  el.id = 'cms-toasts';
  el.className = 'cms-toasts';
  el.setAttribute('aria-live', 'polite');
  document.body.appendChild(el);
  return el;
}

export function notify(message, type = 'success') {
  const text = String(message || '').trim();
  if (!text) return;
  const el = document.createElement('div');
  el.className = `cms-toast cms-toast-${type === 'error' ? 'error' : 'success'}`;
  el.setAttribute('role', type === 'error' ? 'alert' : 'status');
  el.textContent = text;
  host().appendChild(el);
  requestAnimationFrame(() => el.classList.add('is-on'));
  window.setTimeout(() => {
    el.classList.remove('is-on');
    window.setTimeout(() => el.remove(), 280);
  }, 3400);
}

export function notifySuccess(message) {
  notify(message, 'success');
}

export function notifyError(message) {
  notify(message, 'error');
}
