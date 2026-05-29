import { store } from '../store.js';
import { renderPropertyCard } from '../components/property-card.js';

function renderHScroll(title, link, listings) {
  if (!listings.length) return '';
  return `<div class="h-scroll-section"><div class="h-scroll-header"><h3>${title}</h3><a href="${link}">Voir tout →</a></div><div class="h-scroll">${listings.map(l=>renderPropertyCard(l)).join('')}</div></div>`;
}

export function renderHome() {
  const stats = store.getStats();
  const featured = store.getTrending('featured', 4);
  const topViews = store.getTrending('views', 6);
  const topRated = store.getTrending('rating', 6);
  const newest = store.getTrending('new', 6);

  return `
  <div class="hero">
    <div class="hero-content">
      <div class="hero-badge"><i class="fas fa-sparkles"></i> La plateforme immobilière N°1 en Afrique</div>
      <h1>Trouvez votre <span class="highlight">logement idéal</span> en Afrique</h1>
      <p>Location, vente, terrain, construction — tout l'immobilier africain sur une seule plateforme.</p>
      <div class="hero-search">
        <select id="hero-country"><option value="">Pays</option><option value="Cameroun">Cameroun</option><option value="Sénégal">Sénégal</option><option value="Côte d'Ivoire">Côte d'Ivoire</option><option value="RD Congo">RD Congo</option></select>
        <select id="hero-city"><option value="">Ville</option><option value="Douala">Douala</option><option value="Yaoundé">Yaoundé</option><option value="Dakar">Dakar</option><option value="Abidjan">Abidjan</option></select>
        <select id="hero-type"><option value="">Type</option><option value="chambre">Chambre</option><option value="studio">Studio</option><option value="appartement">Appartement</option><option value="maison">Maison</option><option value="terrain">Terrain</option></select>
        <button class="btn btn-primary" onclick="window.heroSearch()"><i class="fas fa-search"></i></button>
      </div>
      <div class="hero-stats">
        <div class="hero-stat"><div class="num">${stats.totalListings}+</div><div class="label">Annonces</div></div>
        <div class="hero-stat"><div class="num">${stats.totalUsers}+</div><div class="label">Utilisateurs</div></div>
        <div class="hero-stat"><div class="num">${stats.cities}+</div><div class="label">Villes</div></div>
        <div class="hero-stat"><div class="num">${stats.countries}+</div><div class="label">Pays</div></div>
      </div>
    </div>
  </div>

  <div class="container" style="padding:0 20px">
    <!-- Play Store Tabs -->
    <div class="ps-tabs" id="home-tabs">
      <div class="ps-tab active" onclick="window.switchHomeTab('for-you',this)">Pour Vous</div>
      <div class="ps-tab" onclick="window.switchHomeTab('trending',this)">Tendances</div>
      <div class="ps-tab" onclick="window.switchHomeTab('categories',this)">Catégories</div>
    </div>

    <!-- Tab: Pour Vous -->
    <div id="tab-for-you">
      ${renderHScroll('⭐ Sélection AfricaHome','#/listings',featured)}
      ${renderHScroll('🆕 Nouveautés','#/listings?sort=recent',newest)}
      ${renderHScroll('🔥 Les plus vus','#/listings?sort=views',topViews)}
    </div>

    <!-- Tab: Tendances -->
    <div id="tab-trending" style="display:none">
      ${renderHScroll('🏆 Mieux notés','#/listings?sort=rating',topRated)}
      ${renderHScroll('👁 Plus de vues','#/listings?sort=views',topViews)}
      ${renderHScroll('🆕 Dernières annonces','#/listings?sort=recent',newest)}
    </div>

    <!-- Tab: Catégories -->
    <div id="tab-categories" style="display:none">
      <div class="categories-grid" style="margin-bottom:40px">
        <div class="category-card" onclick="location.hash='#/listings?category=location'"><div class="icon">🏠</div><h3>Location</h3><p>Chambres, studios, appartements</p></div>
        <div class="category-card" onclick="location.hash='#/listings?category=vente'"><div class="icon">🏘️</div><h3>Vente</h3><p>Maisons et immeubles</p></div>
        <div class="category-card" onclick="location.hash='#/listings?category=terrain'"><div class="icon">🌍</div><h3>Terrains</h3><p>Parcelles à vendre</p></div>
        <div class="category-card" onclick="location.hash='#/listings?category=construction'"><div class="icon">🏗️</div><h3>Construction</h3><p>Plans 3D et services BTP</p></div>
        <div class="category-card" onclick="location.hash='#/listings'"><div class="icon">🛋️</div><h3>Décoration</h3><p>Aménagement intérieur</p></div>
        <div class="category-card" onclick="location.hash='#/listings'"><div class="icon">🔌</div><h3>Électroménager</h3><p>Appareils et meubles</p></div>
      </div>
    </div>
  </div>

  <section class="section">
    <div class="container">
      <div class="section-header"><h2>🚀 Comment ça Marche ?</h2><p>3 étapes simples</p></div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:24px;max-width:900px;margin:0 auto">
        <div class="category-card"><div class="icon">📝</div><h3>1. Inscrivez-vous</h3><p>Créez votre compte en moins d'une minute</p></div>
        <div class="category-card"><div class="icon">🔍</div><h3>2. Recherchez</h3><p>Filtrez par pays, ville, type et prix</p></div>
        <div class="category-card"><div class="icon">📱</div><h3>3. Contactez</h3><p>WhatsApp ou appel direct au bailleur</p></div>
      </div>
    </div>
  </section>`;
}

window.heroSearch = () => {
  const p = [];
  const c = document.getElementById('hero-country')?.value;
  const v = document.getElementById('hero-city')?.value;
  const t = document.getElementById('hero-type')?.value;
  if (c) p.push('country='+encodeURIComponent(c));
  if (v) p.push('city='+encodeURIComponent(v));
  if (t) p.push('type='+t);
  location.hash = '#/listings'+(p.length?'?'+p.join('&'):'');
};

window.switchHomeTab = (tab, el) => {
  ['for-you','trending','categories'].forEach(t => {
    const d = document.getElementById('tab-'+t);
    if (d) d.style.display = t===tab?'block':'none';
  });
  document.querySelectorAll('.ps-tab').forEach(t => t.classList.remove('active'));
  if (el) el.classList.add('active');
};
