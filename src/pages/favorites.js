import { store } from '../store.js';
import { renderPropertyCard } from '../components/property-card.js';

export function renderFavorites() {
  const user = store.getCurrentUser();
  if (!user) return '<div class="auth-page"><div class="auth-card"><h2>Connexion requise</h2><p class="subtitle">Connectez-vous pour voir vos favoris</p><a href="#/login" class="btn btn-primary btn-block">Se Connecter</a></div></div>';
  const favorites = store.getFavorites();
  return `
  <div class="page-header"><h1>❤️ Mes Favoris</h1><p>${favorites.length} annonce${favorites.length>1?'s':''} sauvegardée${favorites.length>1?'s':''}</p></div>
  <div class="container" style="padding:30px 20px 60px">
    ${favorites.length?`<div class="properties-grid">${favorites.map(l=>renderPropertyCard(l)).join('')}</div>`:`<div class="empty-state"><i class="far fa-heart"></i><h3>Aucun favori</h3><p>Ajoutez des annonces à vos favoris pour les retrouver ici</p><a href="#/listings" class="btn btn-primary">Parcourir les annonces</a></div>`}
  </div>`;
}
