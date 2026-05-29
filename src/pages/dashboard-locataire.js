import { store } from '../store.js';
import { renderPropertyCard } from '../components/property-card.js';

export function renderDashboardLocataire() {
  const user = store.getCurrentUser();
  if (!user) return '<div class="auth-page"><div class="auth-card"><h2>Accès Réservé</h2><p class="subtitle">Connectez-vous pour accéder</p><a href="#/login" class="btn btn-primary btn-block">Se Connecter</a></div></div>';
  
  const favorites = store.getFavorites();
  const recent = store.getListings().slice(0, 4);
  
  return `
  <div class="dashboard">
    <div class="container">
      <div class="dash-header">
        <div><h1>👋 Bonjour, ${user.name}</h1><p style="color:var(--gray);font-size:.9rem">Tableau de bord Locataire</p></div>
        <a href="#/listings" class="btn btn-primary"><i class="fas fa-search"></i> Rechercher</a>
      </div>
      
      <div class="stat-cards">
        <div class="stat-card">
          <div class="stat-icon" style="background:rgba(230,81,0,0.1);color:var(--orange)"><i class="fas fa-heart"></i></div>
          <div class="stat-value">${favorites.length}</div>
          <div class="stat-label">Favoris</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background:rgba(46,125,50,0.1);color:var(--green)"><i class="fas fa-home"></i></div>
          <div class="stat-value">${store.getListings().length}</div>
          <div class="stat-label">Annonces Disponibles</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background:rgba(76,175,80,0.1);color:var(--green-light)"><i class="fas fa-check-circle"></i></div>
          <div class="stat-value">Actif</div>
          <div class="stat-label">Accès Plateforme</div>
        </div>
      </div>
      
      ${favorites.length > 0 ? `
      <div style="margin-top:30px">
        <h2 style="font-size:1.3rem;color:#1a1a2e;margin-bottom:20px">❤️ Mes Favoris</h2>
        <div class="properties-grid">${favorites.map(l => renderPropertyCard(l)).join('')}</div>
      </div>` : ''}
      
      <div style="margin-top:30px">
        <h2 style="font-size:1.3rem;color:#1a1a2e;margin-bottom:20px">🆕 Annonces Récentes</h2>
        <div class="properties-grid">${recent.map(l => renderPropertyCard(l)).join('')}</div>
        <div style="text-align:center;margin-top:24px"><a href="#/listings" class="btn btn-outline">Voir Toutes les Annonces</a></div>
      </div>
    </div>
  </div>`;
}
