import { api } from '../api/client.js';
import { shell } from './shell.js';
import { esc } from '../components/escape.js';
import { notifyError, notifySuccess } from '../components/toast.js';

export function renderProfile(user) {
  return shell(
    user,
    'profile',
    `
    <section class="cms-page">
      <div class="cms-page-head">
        <div>
          <p class="cms-kicker">Account</p>
          <h1>My profile</h1>
          <p class="cms-lead">Update your name, phone and email alerts, or change your password. Changing your password signs you out on every other device.</p>
        </div>
      </div>
      <p class="cms-error" id="profile-error" hidden></p>
      <form id="profile-form" class="cms-panel cms-form-stack">
        <h2 class="cms-hub-title">Details</h2>
        <div class="cms-grid-2">
          <div class="cms-field"><label class="cms-label" for="p-name">Name</label><input id="p-name" name="name" value="${esc(user?.name)}" required /></div>
          <div class="cms-field"><label class="cms-label">Email</label><input value="${esc(user?.email)}" disabled /></div>
          <div class="cms-field"><label class="cms-label" for="p-phone">Phone</label><input id="p-phone" name="phone" value="${esc(user?.phone)}" /></div>
          <div class="cms-field"><label class="cms-label">Role</label><input value="${esc(user?.role)}" disabled /></div>
        </div>
        <label class="cms-check"><input type="checkbox" name="notifyBookings" ${user?.notifyBookings ? 'checked' : ''}/> Email me when a new booking arrives</label>
        <label class="cms-check"><input type="checkbox" name="notifyInquiries" ${user?.notifyInquiries ? 'checked' : ''}/> Email me when a new inquiry arrives</label>
        <button class="cms-btn cms-btn-navy" type="submit">Save profile</button>
      </form>
      <form id="password-form" class="cms-panel cms-form-stack" style="margin-top:1.25rem">
        <h2 class="cms-hub-title">Change password</h2>
        <div class="cms-grid-2">
          <div class="cms-field"><label class="cms-label" for="p-current">Current password</label><input id="p-current" name="currentPassword" type="password" autocomplete="current-password" required /></div>
          <div class="cms-field"><label class="cms-label" for="p-new">New password</label><input id="p-new" name="newPassword" type="password" autocomplete="new-password" minlength="10" required /></div>
          <div class="cms-field"><label class="cms-label" for="p-confirm">Confirm new password</label><input id="p-confirm" name="confirm" type="password" autocomplete="new-password" minlength="10" required /></div>
        </div>
        <p class="cms-hint">At least 10 characters, using three of: lowercase, uppercase, numbers, symbols.</p>
        <button class="cms-btn cms-btn-gold" type="submit">Change password</button>
      </form>
    </section>
  `
  );
}

export async function initProfile() {
  const error = document.querySelector('#profile-error');
  const notice = sessionStorage.getItem('gm_cms_profile_notice');
  if (notice) {
    error.hidden = false;
    error.textContent = notice;
    sessionStorage.removeItem('gm_cms_profile_notice');
    document.querySelector('#p-current')?.focus();
  }
  function fail(err) {
    error.hidden = false;
    error.textContent = err.message;
    notifyError(err.message);
  }

  try {
    const me = await api.me();
    const form = document.querySelector('#profile-form');
    form.name.value = me.name || '';
    form.phone.value = me.phone || '';
    form.notifyBookings.checked = Boolean(me.notifyBookings);
    form.notifyInquiries.checked = Boolean(me.notifyInquiries);
  } catch {
    /* keep session values */
  }

  document.querySelector('#profile-form')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    error.hidden = true;
    const form = event.currentTarget;
    try {
      await api.updateMe({
        name: form.name.value,
        phone: form.phone.value,
        notifyBookings: form.notifyBookings.checked,
        notifyInquiries: form.notifyInquiries.checked,
      });
      notifySuccess('Profile saved.');
    } catch (err) {
      fail(err);
    }
  });

  document.querySelector('#password-form')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    error.hidden = true;
    const form = event.currentTarget;
    if (form.newPassword.value !== form.confirm.value) {
      fail(new Error('The new passwords do not match.'));
      return;
    }
    try {
      await api.updateMe({ currentPassword: form.currentPassword.value, newPassword: form.newPassword.value });
      notifySuccess('Password changed. Please sign in again.');
      api.clearSession();
      sessionStorage.setItem('gm_cms_notice', 'Password changed. Sign in with your new password.');
      window.location.hash = '#/login';
    } catch (err) {
      fail(err);
    }
  });
}
