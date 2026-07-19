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
        <div style="display:flex;gap:8px">
          <button class="btn btn-outline" onclick="window.showSettingsModal()"><i class="fas fa-cog"></i> Paramètres</button>
          <a href="#/listings" class="btn btn-primary"><i class="fas fa-search"></i> Rechercher</a>
        </div>
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
      
      <!-- Parrainage & Code Promo -->
      <div class="detail-section" style="margin-top:30px">
        <h3><i class="fas fa-gift" style="color:var(--orange);margin-right:8px"></i>Parrainage & Code Promo</h3>
        <p style="font-size:.85rem;color:var(--gray);margin-top:4px;line-height:1.4">Partagez votre code promo avec des utilisateurs pour leur faire découvrir la plateforme. Lorsqu'ils s'inscriront avec votre code, l'administrateur pourra voir les parrainages créés.</p>
        <div style="display:flex;align-items:center;gap:16px;background:rgba(230,81,0,0.05);border:1px dashed var(--orange);padding:16px;border-radius:12px;margin-top:12px;max-width:400px">
          <div style="flex:1">
            <span style="font-size:.78rem;color:var(--gray);font-weight:600;text-transform:uppercase;display:block">Votre Code Promo</span>
            <strong id="promo-code-val" style="font-size:1.3rem;color:#1a1a2e;font-family:'Outfit',sans-serif;letter-spacing:1px">${user.promoCode || '—'}</strong>
          </div>
          <button class="btn btn-primary btn-sm" onclick="window.copyPromoCode('${user.promoCode || ''}')">
            <i class="fas fa-copy"></i> Copier
          </button>
        </div>
      </div>
    </div>
  </div>`;
}
