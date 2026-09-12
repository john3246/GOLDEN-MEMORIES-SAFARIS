import { api } from '../api/client.js';

export function renderLogin() {
  return `
    <main class="cms-login">
      <form class="cms-card" id="login-form">
        <p class="section-kicker" style="color:#c4a455">Golden Memories</p>
        <h1>Safari CMS</h1>
        <p class="cms-muted">Sign in to manage safari packages.</p>
        <label>Email <input name="email" type="email" autocomplete="username" required /></label>
        <label>Password <input name="password" type="password" autocomplete="current-password" required /></label>
        <p class="cms-error" id="login-error" hidden></p>
        <button class="cms-btn cms-btn-gold" style="margin-top:1.25rem;width:100%" type="submit">Sign in</button>
      </form>
    </main>
  `;
}

export function initLogin(onSuccess) {
  const form = document.querySelector('#login-form');
  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const error = document.querySelector('#login-error');
    error.hidden = true;
    const data = new FormData(form);
    try {
      await api.login(String(data.get('email')), String(data.get('password')));
      onSuccess();
    } catch (err) {
      error.hidden = false;
      error.textContent = err.message;
    }
  });
}
