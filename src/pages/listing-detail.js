import { store } from '../store.js';
import { renderPropertyCard } from '../components/property-card.js';
import { waLink, telLink, escapeHtml } from '../utils.js';

export function renderDetail(id) {
  const listing = store.getListing(id);
  if (!listing) return `<div class="page-header"><h1>Annonce introuvable</h1></div>`;
  const owner = store.getUser(listing.userId);
  const user = store.getCurrentUser();
  const isFav = store.isFavorite(listing.id);
  const reviews = store.getReviews(listing.id);
  const avgRating = store.getAvgRating(listing.id);
  const dist = store.getRatingDist(listing.id);
  const total = reviews.length;
  const similar = store.getSimilarListings(listing, 3);
  const ownerListings = store.getUserListings(listing.userId).filter(l=>l.id!==listing.id).slice(0,3);
  const catLabel = listing.category==='location'?'À Louer':listing.category==='vente'?'À Vendre':listing.category==='terrain'?'Terrain':'Construction';
  const imgs = listing.images?.length ? listing.images : ['/images/apartment.png'];
  const vids = listing.videos || [];
  const allMedia = [...imgs.map(src=>({type:'image',src})), ...vids.map(src=>({type:'video',src}))];
  const mediaCount = allMedia.length;
  const starsHtml = (n) => Array.from({length:5},(_,i)=>`<i class="fa${i<Math.round(n)?'s':'r'} fa-star"></i>`).join('');

  return `
  <div class="detail-page">
    <div class="container">
      <div class="breadcrumbs">
        <a href="#/">Accueil</a><span>›</span>
        <a href="#/listings?category=${listing.category}">${catLabel}</a><span>›</span>
        <a href="#/listings?city=${encodeURIComponent(listing.city)}">${listing.city}</a><span>›</span>
        <span style="color:#1a1a2e">${listing.title}</span>
      </div>

      <!-- GALLERY -->
      <div class="gallery" id="gallery">
        <div class="gallery-track" id="gallery-track">
          ${allMedia.map(m => m.type==='video'
            ? `<video src="${m.src}" style="min-width:100%;height:100%;object-fit:cover" controls playsinline></video>`
            : `<img src="${m.src}" alt="${listing.title}" />`
          ).join('')}
        </div>
        ${mediaCount>1?`
        <button class="gallery-btn gallery-prev" onclick="window.galleryNav(-1)"><i class="fas fa-chevron-left"></i></button>
        <button class="gallery-btn gallery-next" onclick="window.galleryNav(1)"><i class="fas fa-chevron-right"></i></button>
        <div class="gallery-dots">${allMedia.map((_,i)=>`<div class="gallery-dot ${i===0?'active':''}" onclick="window.galleryGo(${i})"></div>`).join('')}</div>
        `:''}
        <div class="gallery-counter"><span id="gallery-idx">1</span>/${mediaCount}</div>
      </div>

      <div class="detail-grid">
        <div class="detail-main">
          <div class="detail-tags">
            <span class="detail-tag" style="background:var(--orange);color:#fff">${catLabel}</span>
            <span class="detail-tag">${listing.type}</span>
            <span class="detail-tag"><i class="fas fa-map-marker-alt"></i> ${listing.city}, ${listing.country}</span>
            ${listing.available?'<span class="detail-tag" style="background:var(--green);color:#fff">Disponible</span>':''}
          </div>
          <h1>${escapeHtml(listing.title)}</h1>
          <!-- Owner line like Play Store developer -->
          <a href="#/owner/${listing.userId}" style="display:flex;align-items:center;gap:6px;margin-bottom:8px;font-size:.88rem;color:var(--orange)">
            ${owner?.structureName||owner?.name||'Bailleur'} ${owner?.verified?'<i class="fas fa-check-circle" style="color:var(--green)"></i>':''}
            · ${owner?.type==='professionnel'?'Professionnel':owner?.type==='bailleur'?'Bailleur':''}
          </a>
          <!-- Rating line like Play Store -->
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;font-size:.88rem;color:var(--gray)">
            <span style="color:var(--orange)">${starsHtml(avgRating)}</span>
            <span>${avgRating||'—'} (${total} avis)</span>
            <span>·</span>
            <span><i class="fas fa-eye"></i> ${listing.views||0} vues</span>
          </div>
          <div class="detail-price">${listing.price?.toLocaleString('fr-FR')} ${listing.currency} ${listing.category==='location'?'<span style="font-size:1rem;color:var(--gray)">/mois</span>':''}</div>

          <!-- Description -->
          <div class="detail-section">
            <h3><i class="fas fa-info-circle" style="color:var(--orange);margin-right:8px"></i>À propos de ce bien</h3>
            <p style="color:var(--text);line-height:1.8">${escapeHtml(listing.description)}</p>
          </div>

          <!-- Features -->
          <div class="detail-section">
            <h3><i class="fas fa-list" style="color:var(--orange);margin-right:8px"></i>Caractéristiques</h3>
            <div class="detail-features">
              ${listing.rooms?`<div class="detail-feature"><i class="fas fa-door-open"></i>${listing.rooms} pièce(s)</div>`:''}
              <div class="detail-feature"><i class="fas fa-map-marker-alt"></i>${listing.quarter}, ${listing.city}</div>
              <div class="detail-feature"><i class="fas fa-globe-africa"></i>${listing.country}</div>
              ${listing.distanceRoute?`<div class="detail-feature"><i class="fas fa-road"></i>${listing.distanceRoute} de la route</div>`:''}
              <div class="detail-feature"><i class="fas fa-calendar"></i>Publié le ${listing.createdAt}</div>
            </div>
          </div>

          <!-- MAP -->
          ${listing.lat && listing.lng ? `
          <div class="detail-section">
            <h3><i class="fas fa-map-marked-alt" style="color:var(--orange);margin-right:8px"></i>Localisation sur la carte</h3>
            <div id="detail-map" class="detail-map"></div>
            <div style="display:flex;gap:10px;margin-top:10px;flex-wrap:wrap">
              <a href="https://www.google.com/maps?q=${listing.lat},${listing.lng}" target="_blank" class="btn btn-outline btn-sm">
                <i class="fas fa-external-link-alt"></i> Ouvrir dans Google Maps
              </a>
              <a href="https://www.google.com/maps/dir/?api=1&destination=${listing.lat},${listing.lng}" target="_blank" class="btn btn-outline btn-sm">
                <i class="fas fa-directions"></i> Itinéraire
              </a>
            </div>
          </div>
          ` : ''}

          <!-- RATINGS & REVIEWS - Play Store style -->
          <div class="detail-section">
            <h3><i class="fas fa-star" style="color:var(--orange);margin-right:8px"></i>Notes et avis</h3>
            <div class="rating-summary">
              <div class="rating-big">
                <div class="number">${avgRating||'—'}</div>
                <div class="stars">${starsHtml(avgRating)}</div>
                <div class="count">${total} avis</div>
              </div>
              <div class="rating-bars">
                ${[5,4,3,2,1].map(n=>`<div class="rating-bar-row"><span>${n}</span><div class="rating-bar"><div class="rating-bar-fill" style="width:${total?Math.round((dist[n]/total)*100):0}%"></div></div><span>${dist[n]}</span></div>`).join('')}
              </div>
            </div>

            <!-- Review form -->
            ${user?`
            <div class="review-form">
              <div style="font-weight:600;margin-bottom:8px;font-size:.9rem">Votre avis</div>
              <div class="star-input" id="star-input">
                ${[1,2,3,4,5].map(n=>`<i class="far fa-star" data-val="${n}" onclick="window.setStars(${n})" onmouseover="window.hoverStars(${n})" onmouseout="window.resetStars()"></i>`).join('')}
              </div>
              <textarea id="review-text" placeholder="Partagez votre expérience..." rows="3" style="width:100%;padding:12px;background:#fff;border:1px solid #e0e0e0;border-radius:8px;font-size:.88rem;color:#333;resize:vertical"></textarea>
              <button class="btn btn-primary btn-sm" style="margin-top:10px" onclick="window.submitReview('${listing.id}')"><i class="fas fa-paper-plane"></i> Publier</button>
            </div>
            `:`<div style="padding:14px;background:#f9f9f9;border-radius:8px;text-align:center;font-size:.88rem;color:var(--gray)"><a href="#/login" style="color:var(--orange)">Connectez-vous</a> pour laisser un avis</div>`}

            <!-- Reviews list -->
            ${reviews.length?reviews.slice(0,5).map(r=>`
            <div class="review-card">
              <div class="review-header">
                <div class="review-avatar">${r.userName?.[0]||'?'}</div>
                <div>
                  <div class="review-name">${r.userName}</div>
                  <div class="review-date">${r.date}</div>
                </div>
              </div>
              <div class="review-stars">${starsHtml(r.rating)}</div>
              <div class="review-text">${r.comment}</div>
            </div>`).join(''):'<p style="color:var(--gray);font-size:.88rem;margin-top:12px">Aucun avis pour le moment. Soyez le premier !</p>'}
          </div>

          <!-- SIMILAR LISTINGS -->
          ${similar.length?`
          <div class="detail-section">
            <h3><i class="fas fa-th-large" style="color:var(--orange);margin-right:8px"></i>Annonces similaires</h3>
            <div class="h-scroll">${similar.map(l=>renderPropertyCard(l)).join('')}</div>
          </div>`:''}

          <!-- MORE BY OWNER -->
          ${ownerListings.length?`
          <div class="detail-section">
            <h3><i class="fas fa-user" style="color:var(--orange);margin-right:8px"></i>Autres annonces de ${owner?.structureName||owner?.name}</h3>
            <div class="h-scroll">${ownerListings.map(l=>renderPropertyCard(l)).join('')}</div>
          </div>`:''}
        </div>

        <!-- SIDEBAR -->
        <div>
          <div class="contact-card">
            <h3><i class="fas fa-user" style="color:var(--orange);margin-right:8px"></i>Contacter</h3>
            <a href="#/owner/${listing.userId}" class="contact-owner" style="cursor:pointer">
              <div class="contact-avatar">${(owner?.name||'?')[0]}</div>
              <div>
                <div style="font-weight:600;color:#1a1a2e">${owner?.structureName||owner?.name||'Propriétaire'} ${owner?.verified?'✅':''}</div>
                <div style="font-size:.82rem;color:var(--gray)">${owner?.type==='professionnel'?'Professionnel Vérifié':owner?.type==='bailleur'?'Bailleur':'Membre'}</div>
              </div>
            </a>
            ${user && (user.type !== 'locataire' || user.subscription?.active || user.accessPaid) ? `
            <div class="contact-btns">
              <a href="${waLink(listing.contactWhatsapp, listing.country)}" target="_blank" rel="noopener noreferrer" class="btn btn-whatsapp btn-block"><i class="fab fa-whatsapp"></i> WhatsApp</a>
              <a href="${telLink(listing.contactPhone, listing.country)}" class="btn btn-call btn-block"><i class="fas fa-phone"></i> Appeler</a>
            </div>
            ` : user && user.type === 'locataire' ? `
            <div style="position:relative;border-radius:8px;overflow:hidden;margin-bottom:10px">
              <div style="filter:blur(4px);pointer-events:none;opacity:0.5">
                <div class="contact-btns">
                  <div class="btn btn-whatsapp btn-block"><i class="fab fa-whatsapp"></i> WhatsApp</div>
                  <div class="btn btn-call btn-block"><i class="fas fa-phone"></i> Appeler</div>
                </div>
              </div>
              <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.7);border-radius:8px">
                <a href="#/payment" class="btn btn-primary" style="font-size:.85rem"><i class="fas fa-lock"></i> Débloquer le contact</a>
              </div>
            </div>
            ` : `
            <div style="padding:14px;background:#f9f9f9;border-radius:8px;text-align:center;font-size:.85rem;color:var(--gray)">
              <a href="#/login" style="color:var(--orange);font-weight:600">Connectez-vous</a> pour contacter le propriétaire
            </div>
            `}
            <div style="margin-top:12px">
              <button class="btn btn-outline btn-block" onclick="window.toggleFav('${listing.id}')"><i class="fa${isFav?'s':'r'} fa-heart"></i> ${isFav?'Retirer des':'Ajouter aux'} favoris</button>
            </div>
            ${user && !user.subscription?.active?`<a href="#/payment" class="btn btn-primary btn-block" style="margin-top:10px"><i class="fas fa-crown"></i> S'abonner</a>`:''}
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- Sticky CTA mobile -->
  ${user && (user.type !== 'locataire' || user.subscription?.active || user.accessPaid) ? `
  <div class="sticky-cta visible">
    <a href="${waLink(listing.contactWhatsapp, listing.country)}" target="_blank" rel="noopener noreferrer" class="btn btn-whatsapp"><i class="fab fa-whatsapp"></i> WhatsApp</a>
    <a href="${telLink(listing.contactPhone, listing.country)}" class="btn btn-call"><i class="fas fa-phone"></i> Appeler</a>
  </div>` : `
  <div class="sticky-cta visible">
    <a href="${user ? '#/payment' : '#/login'}" class="btn btn-primary" style="flex:1"><i class="fas fa-lock"></i> ${user ? 'Débloquer le contact' : 'Se connecter'}</a>
  </div>`}`;
}

// Gallery navigation
let galleryIdx = 0;
window.galleryNav = (dir) => {
  const track = document.getElementById('gallery-track');
  if (!track) return;
  const count = track.children.length;
  galleryIdx = (galleryIdx + dir + count) % count;
  track.style.transform = `translateX(-${galleryIdx*100}%)`;
  document.getElementById('gallery-idx').textContent = galleryIdx+1;
  document.querySelectorAll('.gallery-dot').forEach((d,i) => d.classList.toggle('active', i===galleryIdx));
};
window.galleryGo = (i) => { galleryIdx = i-1; window.galleryNav(1); };

// Star rating
let selectedStars = 0;
window.setStars = (n) => { selectedStars = n; document.querySelectorAll('#star-input i').forEach((s,i)=>{s.className=(i<n?'fas':'far')+' fa-star';s.classList.add('active');}); };
window.hoverStars = (n) => { document.querySelectorAll('#star-input i').forEach((s,i)=>{s.className=(i<n?'fas':'far')+' fa-star';}); };
window.resetStars = () => { if(selectedStars) window.setStars(selectedStars); else document.querySelectorAll('#star-input i').forEach(s=>{s.className='far fa-star';}); };
window.submitReview = (listingId) => {
  if (!selectedStars) { window.showToast('Sélectionnez une note','error'); return; }
  const comment = document.getElementById('review-text')?.value?.trim();
  if (!comment) { window.showToast('Écrivez un commentaire','error'); return; }
  store.addReview(listingId, selectedStars, comment);
  selectedStars = 0;
  window.showToast('Avis publié ! Merci 🙏','success');
  window.dispatchEvent(new Event('hashchange'));
};

// Favorite toggle
window.toggleFav = (id) => { store.toggleFavorite(id); window.dispatchEvent(new Event('hashchange')); };

// ============= DETAIL MAP =============
let _detailMap = null;

function initDetailMap() {
  const mapEl = document.getElementById('detail-map');
  if (!mapEl) return;
  
  // Get listing from current hash
  const hash = window.location.hash;
  const id = hash.split('/')[2];
  if (!id) return;
  const listing = store.getListing(id);
  if (!listing || !listing.lat || !listing.lng) return;
  
  // Destroy old map
  if (_detailMap) { _detailMap.remove(); _detailMap = null; }
  
  const map = L.map('detail-map', { scrollWheelZoom: false }).setView([listing.lat, listing.lng], 15);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap',
    maxZoom: 19
  }).addTo(map);
  
  const marker = L.marker([listing.lat, listing.lng]).addTo(map);
  marker.bindPopup(`
    <div style="min-width:180px">
      <strong style="font-size:.9rem">${listing.title}</strong><br>
      <span style="color:var(--orange);font-weight:600">${listing.price?.toLocaleString('fr-FR')} FCFA</span><br>
      <span style="font-size:.8rem;color:#666"><i class="fas fa-map-marker-alt"></i> ${listing.quarter}, ${listing.city}</span>
    </div>
  `).openPopup();
  
  _detailMap = map;
  setTimeout(() => map.invalidateSize(), 200);
}

// Init map when detail page renders
window.addEventListener('hashchange', () => {
  if (window.location.hash.startsWith('#/detail/')) {
    setTimeout(initDetailMap, 300);
  }
});
// Also on initial load
if (window.location.hash.startsWith('#/detail/')) {
  setTimeout(initDetailMap, 500);
}
