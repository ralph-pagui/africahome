import { store } from '../store.js';

export function renderNavbar() {
  const user = store.getCurrentUser();
  const current = window.location.hash.slice(1)||'/';
  const unread = store.getUnreadCount();
  const isActive = (p) => current.startsWith(p)?'active':'';
  const dashLink = !user?'#/login':user.type==='admin'?'#/dashboard-admin':user.type==='bailleur'?'#/dashboard-bailleur':user.type==='professionnel'?'#/dashboard-pro':'#/dashboard-locataire';

  return `
  <div class="navbar">
    <a href="#/" class="nav-logo"><img src="/logo.jpg" alt="AfricaHome" /><span>AfricaHome</span></a>
    <div class="nav-links">
      <a href="#/" class="${isActive('/')}">Accueil</a>
      <a href="#/listings" class="${isActive('/listings')}">Annonces</a>
      <a href="#/pricing" class="${isActive('/pricing')}">Tarifs</a>
      <a href="#/about" class="${isActive('/about')}">À Propos</a>
      <a href="#/contact" class="${isActive('/contact')}">Contact</a>
    </div>
    <div class="nav-auth">
      ${user?`
        <div class="notif-bell" onclick="event.stopPropagation();window.toggleNotifs()">
          <i class="fas fa-bell"></i>
          ${unread>0?`<span class="bell-badge">${unread}</span>`:''}
        </div>
        <a href="${dashLink}" class="btn btn-outline btn-sm"><i class="fas fa-user"></i> ${user.name?.split(' ')[0]}</a>
        <button class="btn btn-primary btn-sm" onclick="window.doLogout()" title="Déconnexion"><i class="fas fa-sign-out-alt"></i></button>
      `:`
        <a href="#/login" class="btn btn-outline btn-sm">Connexion</a>
        <a href="#/register" class="btn btn-primary btn-sm">Inscription</a>
      `}
    </div>
    <button class="hamburger" onclick="document.querySelector('.mobile-menu').classList.toggle('open')">
      <span></span><span></span><span></span>
    </button>
  </div>
  <div class="mobile-menu">
    <a href="#/" onclick="this.parentElement.classList.remove('open')">🏠 Accueil</a>
    <a href="#/listings" onclick="this.parentElement.classList.remove('open')">🔍 Annonces</a>
    <a href="#/pricing" onclick="this.parentElement.classList.remove('open')">💰 Tarifs</a>
    <a href="#/about" onclick="this.parentElement.classList.remove('open')">ℹ️ À Propos</a>
    <a href="#/contact" onclick="this.parentElement.classList.remove('open')">📞 Contact</a>
    ${user?`
      <a href="${dashLink}" onclick="this.parentElement.classList.remove('open')">👤 Mon Compte</a>
      <a href="#/payment" onclick="this.parentElement.classList.remove('open')">💳 Paiement</a>
      <a href="#" onclick="event.preventDefault();window.doLogout()">🚪 Déconnexion</a>
    `:`
      <a href="#/login" onclick="this.parentElement.classList.remove('open')">🔑 Connexion</a>
      <a href="#/register" onclick="this.parentElement.classList.remove('open')">📝 Inscription</a>
    `}
  </div>
  <!-- Bottom Nav Play Store style -->
  <div class="bottom-nav">
    <div class="bottom-nav-inner">
      <a href="#/" class="bottom-nav-item ${current==='/'?'active':''}"><i class="fas fa-home"></i><span>Accueil</span></a>
      <a href="#/listings" class="bottom-nav-item ${current.startsWith('/listings')?'active':''}"><i class="fas fa-search"></i><span>Recherche</span></a>
      <a href="#/${user?'favorites':'login'}" class="bottom-nav-item ${current==='/favorites'?'active':''}"><i class="fas fa-heart"></i><span>Favoris</span>${store.getFavorites().length>0?`<span class="nav-badge">${store.getFavorites().length}</span>`:''}</a>
      <a href="${dashLink}" class="bottom-nav-item ${current.startsWith('/dashboard')?'active':''}"><i class="fas fa-user"></i><span>Profil</span></a>
    </div>
  </div>`;
}

window.doLogout = () => {
  store.logout();
  const mm = document.querySelector('.mobile-menu');
  if (mm) mm.classList.remove('open');
  window.location.hash='#/';
  window.dispatchEvent(new Event('hashchange'));
};
window.toggleNotifs = () => {
  const existing = document.querySelector('.notif-dropdown');
  if (existing) { existing.remove(); return; }
  const notifs = store.getNotifications();
  const dd = document.createElement('div');
  dd.className = 'notif-dropdown';
  dd.innerHTML = `<div style="padding:14px 16px;font-weight:700;border-bottom:1px solid var(--border)">🔔 Notifications</div>` +
    (notifs.length?notifs.map(n=>`<div class="notif-item ${n.read?'':'unread'}">${n.text}<div class="notif-time">${n.time}</div></div>`).join(''):'<div class="notif-item">Aucune notification</div>');
  document.querySelector('.notif-bell').appendChild(dd);
  store.markAllRead();
  setTimeout(()=>{ document.addEventListener('click',()=>dd.remove(),{once:true}); },100);
};
