import { store } from '../store.js';
import { renderDashboardCard } from '../components/dashboard-card.js';

export function renderDashboardBailleur() {
  const user = store.getCurrentUser();
  if (!user || user.type !== 'bailleur') return '<div class="auth-page"><div class="auth-card"><h2>Accès Réservé</h2><p class="subtitle">Connectez-vous en tant que bailleur</p><a href="#/login" class="btn btn-primary btn-block">Se Connecter</a></div></div>';
  
  const myListings = store.getUserListings(user.id);
  const totalViews = myListings.reduce((s,l) => s + (l.views||0), 0);
  
  return `
  <div class="dashboard">
    <div class="container">
      <div class="dash-header">
        <div>
          <h1>👋 Bonjour, ${user.name}</h1>
          <p style="color:var(--gray);font-size:.9rem">Tableau de bord Bailleur</p>
        </div>
        <a href="#/publish" class="btn btn-primary"><i class="fas fa-plus"></i> Nouvelle Annonce</a>
      </div>
      
      <div class="stat-cards">
        <div class="stat-card">
          <div class="stat-icon" style="background:rgba(230,81,0,0.15);color:var(--orange)"><i class="fas fa-home"></i></div>
          <div class="stat-value">${myListings.length}</div>
          <div class="stat-label">Mes Annonces</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background:rgba(46,125,50,0.15);color:var(--green)"><i class="fas fa-eye"></i></div>
          <div class="stat-value">${totalViews}</div>
          <div class="stat-label">Vues Totales</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background:rgba(245,166,35,0.15);color:var(--gold)"><i class="fas fa-star"></i></div>
          <div class="stat-value">${myListings.length > 0 ? (myListings.reduce((s,l) => s+store.getAvgRating(l.id),0)/myListings.length).toFixed(1) : '0'}</div>
          <div class="stat-label">Note Moyenne</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background:rgba(76,175,80,0.15);color:var(--green-light)"><i class="fas fa-check-circle"></i></div>
          <div class="stat-value">${user.subscription?.active ? 'Actif' : 'Inactif'}</div>
          <div class="stat-label">Abonnement</div>
        </div>
      </div>
      
      <div class="detail-section">
        <h3><i class="fas fa-credit-card" style="color:var(--orange);margin-right:8px"></i>Mon Abonnement</h3>
        <div style="display:flex;gap:16px;flex-wrap:wrap;margin-top:12px">
          <div style="flex:1;min-width:140px;padding:16px;background:rgba(230,81,0,0.06);border-radius:var(--radius-sm);border:1px solid rgba(230,81,0,0.12)">
            <div style="font-size:.75rem;color:var(--gray);font-weight:600">Plan actuel</div>
            <div style="font-size:1.1rem;font-weight:700;color:#1a1a2e;margin-top:4px">${user.subscription?.planName || (user.subscription?.plan==='annual'?'📅 Annuel':user.subscription?.plan==='monthly'?'📆 Mensuel':'—')}</div>
          </div>
          <div style="flex:1;min-width:140px;padding:16px;background:rgba(46,125,50,0.06);border-radius:var(--radius-sm);border:1px solid rgba(46,125,50,0.12)">
            <div style="font-size:.75rem;color:var(--gray);font-weight:600">Prix</div>
            <div style="font-size:1.1rem;font-weight:700;color:var(--orange);margin-top:4px">${(user.subscription?.price || (user.subscription?.plan==='annual'?15000:2500)).toLocaleString('fr-FR')} <span style="font-size:.8rem;color:var(--gray)">FCFA</span></div>
          </div>
          <div style="flex:1;min-width:140px;padding:16px;background:${user.subscription?.active?'rgba(46,125,50,0.06)':'rgba(198,40,40,0.06)'};border-radius:var(--radius-sm);border:1px solid ${user.subscription?.active?'rgba(46,125,50,0.12)':'rgba(198,40,40,0.12)'}">
            <div style="font-size:.75rem;color:var(--gray);font-weight:600">Statut</div>
            <div style="font-size:1.1rem;font-weight:700;color:${user.subscription?.active?'var(--green)':'#c62828'};margin-top:4px">${user.subscription?.active?'✅ Actif':'❌ Expiré'}</div>
          </div>
          <div style="flex:1;min-width:140px;padding:16px;background:rgba(245,166,35,0.06);border-radius:var(--radius-sm);border:1px solid rgba(245,166,35,0.12)">
            <div style="font-size:.75rem;color:var(--gray);font-weight:600">Expire le</div>
            <div style="font-size:1rem;font-weight:700;color:#1a1a2e;margin-top:4px">${user.subscription?.end ? new Date(user.subscription.end).toLocaleDateString('fr-FR') : user.subscription?.endDate ? new Date(user.subscription.endDate).toLocaleDateString('fr-FR') : '—'}</div>
          </div>
        </div>
        <div style="margin-top:14px;display:flex;gap:8px;flex-wrap:wrap">
          <a href="#/payment" class="btn btn-outline btn-sm"><i class="fas fa-sync"></i> ${user.subscription?.active ? 'Renouveler' : 'Activer mon abonnement'}</a>
          <a href="#/pricing" class="btn btn-sm" style="background:#f5f5f5;color:var(--text);border:1px solid #e0e0e0"><i class="fas fa-exchange-alt"></i> Changer de plan</a>
        </div>
      </div>
      
      <div style="margin-top:30px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
          <h2 style="font-size:1.3rem;color:#1a1a2e">📋 Mes Annonces</h2>
        </div>
        ${myListings.length > 0 
          ? `<div class="properties-grid">${myListings.map(l => renderDashboardCard(l)).join('')}</div>`
          : `<div class="empty-state"><i class="fas fa-plus-circle"></i><h3>Aucune annonce</h3><p>Publiez votre première annonce</p><a href="#/publish" class="btn btn-primary">Publier</a></div>`
        }
      </div>
    </div>
  </div>`;
}
