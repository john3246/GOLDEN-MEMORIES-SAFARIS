function nav(user, current) {
  const admin = user?.role === 'Admin';
  return `
    <header class="cms-top">
      <div class="cms-brand">Safari CMS<span>Golden Memories</span></div>
      <nav class="cms-nav">
        <a href="#/safaris" class="${current === 'safaris' ? 'is-active' : ''}">Safaris</a>
        <a href="#/media" class="${current === 'media' ? 'is-active' : ''}">Media</a>
        ${admin ? `<a href="#/api-clients" class="${current === 'clients' ? 'is-active' : ''}">API clients</a>` : ''}
      </nav>
    </header>
  `;
}

export function shell(user, current, inner) {
  return `<div class="cms-shell">${nav(user, current)}${inner}</div>`;
}
