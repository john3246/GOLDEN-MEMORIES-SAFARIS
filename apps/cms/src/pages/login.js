import { api } from '../api/client.js';

function loginCard(inner) {
  return `
    <main class="cms-login">
      ${inner}
    </main>
  `;
}

export function renderLogin() {
  return loginCard(`
      <form class="cms-card" id="login-form">
        <p class="section-kicker" style="color:#c4a455">Golden Memories</p>
        <h1>Safari CMS</h1>
        <p class="cms-muted">Sign in to manage tours, pages, media, bookings, email, and site settings.</p>
        <label>Email <input name="email" type="email" autocomplete="username" required /></label>
        <label>Password <input name="password" type="password" autocomplete="current-password" required /></label>
        <p class="cms-hint" id="login-notice" hidden></p>
        <p class="cms-error" id="login-error" hidden></p>
        <button class="cms-btn cms-btn-gold" style="margin-top:1.25rem;width:100%" type="submit">Sign in</button>
        <p class="cms-muted" style="margin-top:1rem;text-align:center"><a href="#/forgot">Forgot password?</a></p>
      </form>
  `);
}

export function initLogin(onSuccess) {
  const form = document.querySelector('#login-form');
  const notice = document.querySelector('#login-notice');
  const saved = sessionStorage.getItem('gm_cms_notice');
  if (saved && notice) {
    notice.hidden = false;
    notice.textContent = saved;
    sessionStorage.removeItem('gm_cms_notice');
  }
  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const error = document.querySelector('#login-error');
    const button = form.querySelector('button[type="submit"]');
    error.hidden = true;
    if (notice) notice.hidden = true;
    const data = new FormData(form);
    if (button) {
      button.disabled = true;
      button.textContent = 'Signing in…';
    }
    try {
      const result = await api.login(String(data.get('email')), String(data.get('password')));
      if (result?.passwordWeak) {
        sessionStorage.setItem(
          'gm_cms_profile_notice',
          'Your password is too weak for a live website. Please choose a new one below (at least 10 characters with a mix of letters, numbers and symbols).'
        );
        window.location.hash = '#/profile';
        return;
      }
      onSuccess();
    } catch (err) {
      error.hidden = false;
      error.textContent = err.message;
    } finally {
      if (button) {
        button.disabled = false;
        button.textContent = 'Sign in';
      }
    }
  });
}

export function renderForgot() {
  return loginCard(`
      <form class="cms-card" id="forgot-form">
        <p class="section-kicker" style="color:#c4a455">Golden Memories</p>
        <h1>Reset password</h1>
        <p class="cms-muted">Enter the staff email. If it matches an account, we send a one-hour reset link.</p>
        <label>Email <input name="email" type="email" autocomplete="username" required /></label>
        <p class="cms-error" id="forgot-error" hidden></p>
        <p class="cms-muted" id="forgot-ok" hidden>If that account exists, check the inbox for a reset link.</p>
        <button class="cms-btn cms-btn-gold" style="margin-top:1.25rem;width:100%" type="submit">Send reset link</button>
        <p class="cms-muted" style="margin-top:1rem;text-align:center"><a href="#/login">Back to sign in</a></p>
      </form>
  `);
}

export function initForgot() {
  const form = document.querySelector('#forgot-form');
  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const error = document.querySelector('#forgot-error');
    const ok = document.querySelector('#forgot-ok');
    error.hidden = true;
    ok.hidden = true;
    try {
      await api.forgotPassword(String(new FormData(form).get('email') || ''));
      ok.hidden = false;
    } catch (err) {
      error.hidden = false;
      error.textContent = err.message;
    }
  });
}

export function renderReset(token) {
  return loginCard(`
      <form class="cms-card" id="reset-form">
        <p class="section-kicker" style="color:#c4a455">Golden Memories</p>
        <h1>Choose a new password</h1>
        <p class="cms-muted">Use at least 10 characters with a mix of upper and lower case, numbers or symbols. The link from your email expires after one hour.</p>
        <input type="hidden" name="token" value="${String(token || '').replace(/"/g, '&quot;')}" />
        <label>New password <input name="password" type="password" autocomplete="new-password" minlength="10" required /></label>
        <label>Confirm password <input name="confirm" type="password" autocomplete="new-password" minlength="10" required /></label>
        <p class="cms-error" id="reset-error" hidden></p>
        <p class="cms-muted" id="reset-ok" hidden>Password updated. You can sign in now.</p>
        <button class="cms-btn cms-btn-gold" style="margin-top:1.25rem;width:100%" type="submit">Save password</button>
        <p class="cms-muted" style="margin-top:1rem;text-align:center"><a href="#/login">Back to sign in</a></p>
      </form>
  `);
}

export function initReset() {
  const form = document.querySelector('#reset-form');
  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const error = document.querySelector('#reset-error');
    const ok = document.querySelector('#reset-ok');
    error.hidden = true;
    ok.hidden = true;
    const data = new FormData(form);
    const password = String(data.get('password') || '');
    const confirm = String(data.get('confirm') || '');
    if (password !== confirm) {
      error.hidden = false;
      error.textContent = 'Passwords do not match';
      return;
    }
    try {
      await api.resetPassword(String(data.get('token') || ''), password);
      ok.hidden = false;
      setTimeout(() => {
        window.location.hash = '#/login';
      }, 1200);
    } catch (err) {
      error.hidden = false;
      error.textContent = err.message;
    }
  });
}
