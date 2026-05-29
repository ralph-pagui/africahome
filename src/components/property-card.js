import { store } from '../store.js';
import { escapeHtml } from '../utils.js';

export function renderPropertyCard(listing) {
  const isFav = store.isFavorite(listing.id);
  const owner = store.getUser(listing.userId);
  const avgRating = store.getAvgRating(listing.id);
  const reviewCount = store.getReviews(listing.id).length;
  const isNew = store.isNew(listing);
  const badgeClass = listing.category==='location'?'badge-location':listing.category==='vente'?'badge-vente':listing.category==='terrain'?'badge-terrain':'badge-plan';
  const catLabel = listing.category==='location'?'À LOUER':listing.category==='vente'?'À VENDRE':listing.category==='terrain'?'TERRAIN':'CONSTRUCTION';
  const priceLabel = listing.category==='location'?'/mois':'';
  const starsHtml = Array.from({length:5},(_,i) => `<i class="fa${i<Math.round(avgRating)?'s':'r'} fa-star"></i>`).join('');

  return `
  <div class="property-card" onclick="window.location.hash='#/detail/${listing.id}'">
    <div class="property-img">
      <img src="${listing.images?.[0]||'/images/apartment.png'}" alt="${escapeHtml(listing.title)}" loading="lazy" />
      <span class="property-badge ${badgeClass}">${catLabel}</span>
      ${isNew?'<span class="badge-new">🔥 Nouveau</span>':''}
      ${listing.featured?'<span class="badge-featured">⭐ Sélection</span>':''}
      <div class="property-fav ${isFav?'active':''}" onclick="event.stopPropagation();window.toggleFav('${listing.id}')">
        <i class="fa${isFav?'s':'r'} fa-heart"></i>
      </div>
    </div>
    <div class="property-info">
      <div class="property-price">${listing.price?.toLocaleString('fr-FR')} ${listing.currency} <span>${priceLabel}</span></div>
      <div class="property-title">${escapeHtml(listing.title)}</div>
      <div class="card-rating">
        <span class="stars">${starsHtml}</span>
        <span>${avgRating>0?avgRating:'—'}</span>
        <span>·</span>
        <span>${reviewCount} avis</span>
        <span>·</span>
        <span><i class="fas fa-eye" style="font-size:.65rem"></i> ${listing.views||0}</span>
      </div>
      <div class="property-location"><i class="fas fa-map-marker-alt" style="color:var(--orange)"></i>${listing.quarter}, ${listing.city}</div>
      <div class="card-owner">
        <span>${owner?.structureName||owner?.name||'Bailleur'}</span>
        ${owner?.verified?'<i class="fas fa-check-circle verified" title="Vérifié"></i>':''}
        <span>· ${owner?.type==='professionnel'?'Pro':owner?.type==='bailleur'?'Bailleur':''}</span>
      </div>
    </div>
  </div>`;
}

window.toggleFav = (id) => {
  store.toggleFavorite(id);
  window.dispatchEvent(new Event('hashchange'));
};
