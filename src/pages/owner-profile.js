import { store } from '../store.js';
import { renderPropertyCard } from '../components/property-card.js';
import { waLink, telLink } from '../utils.js';

export function renderOwnerProfile(userId) {
  const profile = store.getOwnerProfile(userId);
  if (!profile) return `<div class="page-header"><h1>Profil introuvable</h1></div>`;
  const starsHtml = Array.from({length:5},(_,i)=>`<i class="fa${i<Math.round(profile.avgRating)?'s':'r'} fa-star" style="color:var(--orange)"></i>`).join('');
  const typeLabel = profile.type==='professionnel'?'Professionnel Vérifié':profile.type==='bailleur'?'Bailleur':'Membre';

  return `
  <div class="owner-page">
    <div class="container">
      <div class="breadcrumbs">
        <a href="#/">Accueil</a><span>›</span>
        <span style="color:#1a1a2e">${profile.structureName||profile.name}</span>
      </div>
      <div class="owner-header">
        <div class="owner-avatar-lg">${(profile.name||'?')[0]}</div>
        <div class="owner-info">
          <h1>${profile.structureName||profile.name} ${profile.verified?'<i class="fas fa-check-circle" style="color:var(--green)"></i>':''}</h1>
          <div class="owner-type">${typeLabel} · ${profile.city}, ${profile.country}</div>
          <div class="owner-stats">
            <span>${starsHtml} ${profile.avgRating} (${profile.totalReviews} avis)</span>
            <span><i class="fas fa-home" style="color:var(--orange)"></i> ${profile.listings.length} annonces</span>
            <span><i class="fas fa-eye" style="color:var(--orange)"></i> ${profile.totalViews} vues</span>
          </div>
        </div>
      </div>
      <div class="detail-section" style="max-width:100%">
        <div style="display:flex;flex-direction:column;gap:10px;max-width:400px">
          ${profile.phone?`<a href="${waLink(profile.phone, profile.country)}" target="_blank" rel="noopener noreferrer" class="btn btn-whatsapp btn-block" style="overflow:hidden;text-overflow:ellipsis"><i class="fab fa-whatsapp"></i> WhatsApp</a>`:''}
          ${profile.phone?`<a href="${telLink(profile.phone, profile.country)}" class="btn btn-call btn-block" style="overflow:hidden;text-overflow:ellipsis"><i class="fas fa-phone"></i> Appeler</a>`:''}
          <button class="btn btn-outline btn-block" style="overflow:hidden;text-overflow:ellipsis" onclick="window.toggleFav && window.toggleFav('${userId}')"><i class="far fa-heart"></i> Ajouter aux favoris</button>
          ${profile.type!=='locataire'?`<a href="#/payment" class="btn btn-primary btn-block" style="overflow:hidden;text-overflow:ellipsis"><i class="fas fa-crown"></i> S'abonner</a>`:''}
        </div>
      </div>
      ${profile.niu?`<div class="detail-section"><h3>Informations légales</h3><p style="font-size:.88rem;color:var(--text)">NIU: ${profile.niu} · Membre depuis ${profile.joinDate}</p></div>`:''}
      <h2 style="font-size:1.3rem;margin:30px 0 20px">📋 Toutes les annonces</h2>
      ${profile.listings.length?`<div class="properties-grid">${profile.listings.map(l=>renderPropertyCard(l)).join('')}</div>`:`<div class="empty-state"><i class="fas fa-home"></i><h3>Aucune annonce</h3></div>`}
    </div>
  </div>`;

}
