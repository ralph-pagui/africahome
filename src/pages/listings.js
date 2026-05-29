import { store } from '../store.js';
import { renderPropertyCard } from '../components/property-card.js';

export function renderListings() {
  const hashParts = (window.location.hash.split('?')[1]||'');
  const params = new URLSearchParams(hashParts);
  const filters = {};
  if (params.get('country')) filters.country = params.get('country');
  if (params.get('city')) filters.city = params.get('city');
  if (params.get('type')) filters.type = params.get('type');
  if (params.get('category')) filters.category = params.get('category');
  if (params.get('quarter')) filters.quarter = params.get('quarter');
  const sort = params.get('sort')||'recent';

  const listings = store.getListings(filters, sort);
  const allListings = store.getListings();
  const countries = [...new Set(allListings.map(l=>l.country))];
  const cities = [...new Set(allListings.map(l=>l.city))];
  const quarters = store.getAllQuarters();

  const categories = [{k:'',l:'Tous'},{k:'location',l:'Location'},{k:'vente',l:'Vente'},{k:'terrain',l:'Terrain'},{k:'construction',l:'Construction'}];

  return `
  <div class="page-header"><h1>🔍 Annonces Immobilières</h1><p>${listings.length} annonce${listings.length>1?'s':''} disponible${listings.length>1?'s':''}</p></div>
  <div class="container" style="padding:20px 20px 60px">
    <!-- Chips categories Play Store style -->
    <div class="chips">
      ${categories.map(c=>`<div class="chip ${filters.category===c.k||(c.k===''&&!filters.category)?'active':''}" onclick="window.chipFilter('category','${c.k}')">${c.l}</div>`).join('')}
    </div>

    <div class="filters-bar">
      <div class="filter-group">
        <label>Pays</label>
        <select id="f-country"><option value="">Tous les pays</option>${countries.map(c=>`<option value="${c}" ${filters.country===c?'selected':''}>${c}</option>`).join('')}</select>
      </div>
      <div class="filter-group">
        <label>Ville</label>
        <select id="f-city"><option value="">Toutes les villes</option>${cities.map(c=>`<option value="${c}" ${filters.city===c?'selected':''}>${c}</option>`).join('')}</select>
      </div>
      <div class="filter-group">
        <label>Quartier</label>
        <select id="f-quarter"><option value="">Tous</option>${quarters.map(q=>`<option value="${q}" ${filters.quarter===q?'selected':''}>${q}</option>`).join('')}</select>
      </div>
      <div class="filter-group">
        <label>Type</label>
        <select id="f-type"><option value="">Tous</option><option value="chambre" ${filters.type==='chambre'?'selected':''}>Chambre</option><option value="studio" ${filters.type==='studio'?'selected':''}>Studio</option><option value="appartement" ${filters.type==='appartement'?'selected':''}>Appartement</option><option value="maison" ${filters.type==='maison'?'selected':''}>Maison</option><option value="terrain" ${filters.type==='terrain'?'selected':''}>Terrain</option><option value="plan3d" ${filters.type==='plan3d'?'selected':''}>Plan 3D</option></select>
      </div>
      <div class="filter-group">
        <label>Trier par</label>
        <select id="f-sort"><option value="recent" ${sort==='recent'?'selected':''}>Plus récent</option><option value="price-asc" ${sort==='price-asc'?'selected':''}>Prix ↑</option><option value="price-desc" ${sort==='price-desc'?'selected':''}>Prix ↓</option><option value="rating" ${sort==='rating'?'selected':''}>Mieux noté</option><option value="views" ${sort==='views'?'selected':''}>Plus vu</option></select>
      </div>
      <button class="btn btn-primary" onclick="window.applyFilters()"><i class="fas fa-filter"></i> Filtrer</button>
    </div>
    ${listings.length?`<div class="properties-grid">${listings.map(l=>renderPropertyCard(l)).join('')}</div>`:`<div class="empty-state"><i class="fas fa-search"></i><h3>Aucune annonce trouvée</h3><p>Essayez de modifier vos critères</p></div>`}
  </div>`;
}

window.applyFilters = () => {
  const p = [];
  const c = document.getElementById('f-country')?.value;
  const v = document.getElementById('f-city')?.value;
  const q = document.getElementById('f-quarter')?.value;
  const t = document.getElementById('f-type')?.value;
  const s = document.getElementById('f-sort')?.value;
  if (c) p.push('country='+encodeURIComponent(c));
  if (v) p.push('city='+encodeURIComponent(v));
  if (q) p.push('quarter='+encodeURIComponent(q));
  if (t) p.push('type='+t);
  if (s && s!=='recent') p.push('sort='+s);
  // Keep current category chip
  const curCat = new URLSearchParams(window.location.hash.split('?')[1]||'').get('category');
  if (curCat) p.push('category='+curCat);
  const h = '#/listings'+(p.length?'?'+p.join('&'):'');
  if (location.hash===h) window.dispatchEvent(new Event('hashchange'));
  else location.hash = h;
};

window.chipFilter = (key, val) => {
  const params = new URLSearchParams(window.location.hash.split('?')[1]||'');
  if (val) params.set(key, val); else params.delete(key);
  const h = '#/listings'+(params.toString()?'?'+params.toString():'');
  if (location.hash===h) window.dispatchEvent(new Event('hashchange'));
  else location.hash = h;
};
