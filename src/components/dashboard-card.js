import { store } from '../store.js';

/**
 * Renders a listing card with edit/delete action buttons for use in dashboards.
 */
export function renderDashboardCard(listing) {
  const avgRating = store.getAvgRating(listing.id);
  const reviewCount = store.getReviews(listing.id).length;
  const catLabel = listing.category==='location'?'À LOUER':listing.category==='vente'?'À VENDRE':listing.category==='terrain'?'TERRAIN':'CONSTRUCTION';
  const badgeClass = listing.category==='location'?'badge-location':listing.category==='vente'?'badge-vente':listing.category==='terrain'?'badge-terrain':'badge-plan';
  const priceLabel = listing.category==='location'?'/mois':'';
  const starsHtml = Array.from({length:5},(_,i) => `<i class="fa${i<Math.round(avgRating)?'s':'r'} fa-star"></i>`).join('');

  return `
  <div class="property-card dash-card">
    <div class="property-img" onclick="window.location.hash='#/detail/${listing.id}'">
      <img src="${listing.images?.[0]||'/images/apartment.png'}" alt="${listing.title}" loading="lazy" />
      <span class="property-badge ${badgeClass}">${catLabel}</span>
      ${listing.available?'':'<span class="property-badge" style="background:#c62828;color:#fff;right:12px;left:auto">Indisponible</span>'}
    </div>
    <div class="property-info">
      <div class="property-price">${listing.price?.toLocaleString('fr-FR')} ${listing.currency} <span>${priceLabel}</span></div>
      <div class="property-title">${listing.title}</div>
      <div class="card-rating">
        <span class="stars">${starsHtml}</span>
        <span>${avgRating>0?avgRating:'—'}</span>
        <span>·</span>
        <span>${reviewCount} avis</span>
        <span>·</span>
        <span><i class="fas fa-eye" style="font-size:.65rem"></i> ${listing.views||0}</span>
      </div>
      <div class="property-location"><i class="fas fa-map-marker-alt" style="color:var(--orange)"></i>${listing.quarter||''}, ${listing.city}</div>
      <div class="dash-card-actions">
        <button class="btn btn-sm btn-outline" onclick="event.stopPropagation();window.editListing('${listing.id}')">
          <i class="fas fa-edit"></i> Modifier
        </button>
        <button class="btn btn-sm btn-danger" onclick="event.stopPropagation();window.confirmDeleteListing('${listing.id}','${listing.title.replace(/'/g, "\\'")}')">
          <i class="fas fa-trash-alt"></i> Supprimer
        </button>
      </div>
    </div>
  </div>`;
}

// Navigate to publish page in edit mode
window.editListing = (id) => {
  window.location.hash = `#/publish/${id}`;
};

// Delete with confirmation modal
window.confirmDeleteListing = (id, title) => {
  const modal = document.getElementById('modal-root');
  modal.innerHTML = `
  <div class="modal-overlay" onclick="if(event.target===this)this.innerHTML=''">
    <div class="modal">
      <h3><i class="fas fa-exclamation-triangle" style="color:#c62828;margin-right:8px"></i>Supprimer l'annonce</h3>
      <p style="margin:16px 0;color:var(--text);line-height:1.6">
        Êtes-vous sûr de vouloir supprimer <strong>"${title}"</strong> ?<br>
        <span style="font-size:.85rem;color:var(--gray)">Cette action est irréversible.</span>
      </p>
      <div style="display:flex;gap:10px;justify-content:flex-end">
        <button class="btn btn-outline btn-sm" onclick="document.getElementById('modal-root').innerHTML=''">Annuler</button>
        <button class="btn btn-danger btn-sm" onclick="window.doDeleteListing('${id}')">
          <i class="fas fa-trash-alt"></i> Confirmer
        </button>
      </div>
    </div>
  </div>`;
};

window.doDeleteListing = (id) => {
  store.deleteListing(id);
  document.getElementById('modal-root').innerHTML = '';
  window.showToast('Annonce supprimée avec succès', 'success');
  window.dispatchEvent(new Event('hashchange'));
};
