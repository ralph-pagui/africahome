import { store } from '../store.js';
import { renderPropertyCard } from '../components/property-card.js';
import { ALL_COUNTRY_NAMES, AFRICAN_COUNTRIES } from '../utils.js';

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

  const allListings = store.getListings();
  const activeCountries = [...new Set(allListings.map(l => l.country).filter(Boolean))];
  const countries = [...new Set([...ALL_COUNTRY_NAMES, ...activeCountries])].sort();

  return `
  <div class="hero">
    <div class="hero-content">
      <div class="hero-badge"><i class="fas fa-sparkles"></i> La plateforme immobilière N°1 en Afrique</div>
      <h1>Trouvez votre <span class="highlight">logement idéal</span> en Afrique</h1>
      <p>Location, vente, terrain, construction — tout l'immobilier africain sur une seule plateforme.</p>
      <div class="hero-search">
        <select id="hero-country" onchange="window.updateHeroCities()">
          <option value="">Pays</option>
          ${countries.map(c => {
            const flag = AFRICAN_COUNTRIES[c]?.flag || '🌍';
            return `<option value="${c}">${flag} ${c}</option>`;
          }).join('')}
        </select>
        <select id="hero-city">
          <option value="">Ville</option>
        </select>
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

window.updateHeroCities = () => {
  const countryEl = document.getElementById('hero-country');
  const cityEl = document.getElementById('hero-city');
  if (!countryEl || !cityEl) return;
  
  const selectedCountry = countryEl.value;
  const allListings = store.getListings();
  
  // Get active cities (from database listings) for this country
  const activeCities = [...new Set(
    allListings
      .filter(l => !selectedCountry || l.country === selectedCountry)
      .map(l => l.city)
      .filter(Boolean)
  )].sort();
  
  // Default popular cities mapping for major African countries
  const defaultCitiesMap = {
    'Cameroun': ['Douala', 'Yaoundé', 'Garoua', 'Bafoussam', 'Bamenda', 'Maroua', 'Kribi', 'Limbe'],
    'Sénégal': ['Dakar', 'Thiès', 'Mbour', 'Saint-Louis', 'Touba', 'Ziguinchor', 'Kaolack'],
    "Côte d'Ivoire": ['Abidjan', 'Bouaké', 'Yamoussoukro', 'San-Pédro', 'Korhogo', 'Man'],
    'RD Congo': ['Kinshasa', 'Lubumbashi', 'Mbuji-Mayi', 'Goma', 'Kisangani', 'Bukavu', 'Kananga'],
    'Gabon': ['Libreville', 'Port-Gentil', 'Franceville', 'Oyem', 'Moanda'],
    'Congo': ['Brazzaville', 'Pointe-Noire', 'Dolisie', 'Nkayi'],
    'Mali': ['Bamako', 'Sikasso', 'Mopti', 'Kayes', 'Ségou'],
    'Burkina Faso': ['Ouagadougou', 'Bobo-Dioulasso', 'Koudougou', 'Banfora'],
    'Guinée': ['Conakry', 'Nzérékoré', 'Kankan', 'Kindia', 'Labé'],
    'Bénin': ['Cotonou', 'Porto-Novo', 'Parakou', 'Abomey-Calavi', 'Djougou'],
    'Togo': ['Lomé', 'Kara', 'Sokodé', 'Kpalimé', 'Atakpamé'],
    'Niger': ['Niamey', 'Zinder', 'Maradi', 'Tahoua'],
    'Tchad': ['N\'Djaména', 'Moundou', 'Sarh', 'Abéché'],
    'Madagascar': ['Antananarivo', 'Toamasina', 'Antsirabe', 'Mahajanga'],
    'Maroc': ['Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tanger', 'Agadir', 'Oujda'],
    'Algérie': ['Alger', 'Oran', 'Constantine', 'Annaba', 'Blida', 'Sétif'],
    'Tunisie': ['Tunis', 'Sfax', 'Sousse', 'Bizerte', 'Gabès'],
    'Rwanda': ['Kigali', 'Gisenyi', 'Butare', 'Gitarama']
  };
  
  let citiesToDisplay = [];
  if (selectedCountry) {
    const defaults = defaultCitiesMap[selectedCountry] || [];
    citiesToDisplay = [...new Set([...defaults, ...activeCities])].sort();
  } else {
    // If no country is selected, gather all default cities plus all active cities
    const allDefaults = Object.values(defaultCitiesMap).flat();
    citiesToDisplay = [...new Set([...allDefaults, ...activeCities])].sort();
  }
  
  // Populate dropdown html
  let html = '<option value="">Ville</option>';
  citiesToDisplay.forEach(city => {
    html += `<option value="${city}">${city}</option>`;
  });
  cityEl.innerHTML = html;
};

window.initializeHome = () => {
  window.updateHeroCities();
};
