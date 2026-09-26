/**
 * Shared behaviour for website forms (contact, booking):
 *  - invisible spam protection (honeypot field + time-to-fill stamp)
 *  - busy state so a double click cannot send twice
 *  - clear success / error messages next to the form
 *  - only fall back to the visitor's email app when the server is unreachable,
 *    never when they simply mistyped a field.
 */

export function addSpamGuards(form) {
  if (!form || form.querySelector('[name="website"]')) return;
  const trap = document.createElement('div');
  trap.setAttribute('aria-hidden', 'true');
  trap.style.cssText = 'position:absolute;left:-10000px;width:1px;height:1px;overflow:hidden';
  trap.innerHTML = '<label>Leave this field empty<input type="text" name="website" tabindex="-1" autocomplete="off" /></label>';
  form.appendChild(trap);
  const stamp = document.createElement('input');
  stamp.type = 'hidden';
  stamp.name = '_ts';
  stamp.value = String(Date.now());
  form.appendChild(stamp);
}

export function spamFields(form) {
  const data = new FormData(form);
  return { website: String(data.get('website') || ''), _ts: Number(data.get('_ts') || 0) };
}

export function setBusy(form, busy, label = 'Sending…') {
  const button = form?.querySelector('button[type="submit"]');
  if (!button) return;
  if (busy) {
    button.dataset.label = button.dataset.label || button.textContent;
    button.textContent = label;
    button.disabled = true;
    button.setAttribute('aria-busy', 'true');
  } else {
    button.textContent = button.dataset.label || button.textContent;
    button.disabled = false;
    button.removeAttribute('aria-busy');
  }
}

export function showNote(note, message, kind = 'success') {
  if (!note) return;
  note.hidden = false;
  note.textContent = message;
  note.setAttribute('role', kind === 'error' ? 'alert' : 'status');
  note.classList.toggle('form-note-error', kind === 'error');
  note.classList.toggle('form-note-success', kind !== 'error');
  note.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/** True when the request never reached the server (offline, API down). */
export function isNetworkError(err) {
  return !err?.status || err.status >= 500;
}

export function focusField(form, field) {
  if (!field) return;
  const input = form.querySelector(`[name="${field}"]`);
  if (input) {
    input.setAttribute('aria-invalid', 'true');
    input.focus();
    input.addEventListener('input', () => input.removeAttribute('aria-invalid'), { once: true });
  }
}
