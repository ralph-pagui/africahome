import './styles/index.css';
import { router } from './router.js';
import { api } from './api.js';
import { store } from './store.js';
import { renderNavbar } from './components/navbar.js';
import { renderFooter } from './components/footer.js';
import { renderHome } from './pages/home.js';
import { renderListings } from './pages/listings.js';
import { renderDetail } from './pages/listing-detail.js';
import { renderLogin } from './pages/login.js';
import { renderRegister } from './pages/register.js';
import { renderDashboardBailleur } from './pages/dashboard-bailleur.js';
import { renderDashboardLocataire } from './pages/dashboard-locataire.js';
import { renderDashboardPro } from './pages/dashboard-pro.js';
import { renderDashboardAdmin } from './pages/dashboard-admin.js';
import { renderPublish } from './pages/publish.js';
import { renderPricing } from './pages/pricing.js';
import { renderAbout } from './pages/about.js';
import { renderContact } from './pages/contact.js';
import { renderPayment, checkGlobalPaymentCallback } from './pages/payment.js';
import { renderOwnerProfile } from './pages/owner-profile.js';
import { renderFavorites } from './pages/favorites.js';
import { render404 } from './pages/404.js';
import { initChatbot } from './components/chatbot.js';
import { signInWithGoogle } from './firebase-auth.js';
import { renderPhoneInput, getPhoneInputValue } from './components/phone-input.js';
import { renderCountryOptions } from './utils.js';

// Make api and store globally available (always api mode for production)
window.APP = { api, store, mode: 'api' };

// Preload listings and public stats from backend API
(async () => {
  try {
    console.log('⏳ Chargement des données de production...');
    const [listingsData, statsData] = await Promise.all([
      window.APP.api.getListings({ limit: 200 }),
      window.APP.api.getPublicStats().catch(err => {
        console.warn('⚠️ Échec chargement stats:', err.message);
        return { totalListings: 0, totalUsers: 0, cities: 0, countries: 0 };
      })
    ]);
    store.syncFromApi(listingsData.listings || []);
    store.syncPublicStats(statsData);
    console.log(`✅ Données chargées (annonces: ${(listingsData.listings || []).length}, utilisateurs: ${statsData.totalUsers})`);
  } catch (e) {
    console.warn('⚠️ Échec du préchargement des données:', e.message);
  } finally {
    checkGlobalPaymentCallback();
    router.start();
  }

  // Background Real-Time Synchronization (every 20 seconds) - Only runs when tab is active
  setInterval(async () => {
    if (document.visibilityState !== 'visible') return;
    try {
      const [listingsData, statsData] = await Promise.all([
        window.APP.api.getListings({ limit: 200 }),
        window.APP.api.getPublicStats().catch(() => null)
      ]);
      
      if (listingsData && listingsData.listings) {
        store.syncFromApi(listingsData.listings);
      }
      if (statsData) {
        store.syncPublicStats(statsData);
      }
      
      // Dynamic UI refresh for listing/data pages
      const REFRESHABLE_ROUTES = ['/', '/listings', '/detail', '/favorites', '/owner'];
      if (REFRESHABLE_ROUTES.includes(router.current)) {
        router.refresh();
      }
    } catch (err) {
      console.warn('⚠️ Échec de la synchronisation en arrière-plan:', err.message);
    }
  }, 20000);
})();

const navbar = document.getElementById('navbar');
const main = document.getElementById('main-content');

function render(pageHtml) {
  navbar.innerHTML = renderNavbar();
  main.innerHTML = pageHtml + renderFooter();
}

// Toast system
window.showToast = (message, type = 'info') => {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  const icon = type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle';
  toast.innerHTML = `<i class="fas fa-${icon}"></i> ${message}`;
  container.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 3500);
};

// Navbar scroll
window.addEventListener('scroll', () => {
  const nav = document.querySelector('.navbar');
  if (nav) nav.classList.toggle('scrolled', window.scrollY > 50);
});

// Routes
router
  .on('/', () => render(renderHome()))
  .on('/listings', () => render(renderListings()))
  .on('/detail', (id) => render(renderDetail(id)))
  .on('/login', () => render(renderLogin()))
  .on('/register', () => render(renderRegister()))
  .on('/dashboard-bailleur', () => render(renderDashboardBailleur()))
  .on('/dashboard-locataire', () => render(renderDashboardLocataire()))
  .on('/dashboard-pro', () => render(renderDashboardPro()))
  .on('/dashboard-admin', () => render(renderDashboardAdmin()))
  .on('/publish', (editId) => render(renderPublish(editId)))
  .on('/pricing', () => render(renderPricing()))
  .on('/about', () => render(renderAbout()))
  .on('/contact', () => render(renderContact()))
  .on('/payment', () => render(renderPayment()))
  .on('/owner', (id) => render(renderOwnerProfile(id)))
  .on('/favorites', () => render(renderFavorites()))
  .on('/404', () => render(render404()));

// Initialize AI Chatbot
initChatbot();

// Register PWA Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(reg => reg.update()) // Force check for updated SW
    .catch(() => {});
}

// Check for payment callback on hash change
window.addEventListener('hashchange', () => {
  checkGlobalPaymentCallback();
});

// =====================================================
// GLOBAL GOOGLE AUTHENTICATION FLOW HANDLERS
// =====================================================

window.startGoogleAuthFlow = async () => {
  try {
    const googleData = await signInWithGoogle();
    
    let res;
    if (window.APP?.mode === 'api') {
      res = await window.APP.api.googleAuth(googleData);
    } else {
      res = window.APP.store.googleAuth(googleData);
    }

    if (res.success) {
      if (res.requireProfileSetup) {
        window.showGoogleProfileSetupModal(googleData);
      } else if (res.requireLinkConfirmation) {
        window.showGoogleLinkConfirmationModal(googleData, res.message);
      } else {
        window.showToast('Bienvenue, ' + res.user.name + ' !', 'success');
        const type = res.user.type;
        const dash = type === 'admin' ? '/dashboard-admin' : type === 'bailleur' ? '/dashboard-bailleur' : type === 'professionnel' ? '/dashboard-pro' : '/dashboard-locataire';
        router.navigate(dash);
      }
    } else {
      window.showToast(res.message || 'Une erreur est survenue', 'error');
    }
  } catch (err) {
    window.showToast(err.message, 'error');
  }
};

window.showGoogleProfileSetupModal = (googleData) => {
  const root = document.getElementById('modal-root');
  
  root.innerHTML = `
  <div class="modal-overlay" onclick="if(event.target===this)this.innerHTML=''" style="z-index:2000">
    <div class="modal" style="max-width:520px;width:95%;border-radius:16px;padding:24px">
      <h3 style="margin:0 0 8px;font-size:1.3rem;font-weight:700;display:flex;align-items:center;gap:10px;color:#1a1a2e">
        <i class="fas fa-user-circle" style="color:var(--orange)"></i> Compléter le Profil
      </h3>
      <p style="font-size:.85rem;color:var(--gray);margin-bottom:20px">
        Bienvenue <strong>${googleData.name}</strong> ! Saisissez vos coordonnées de résidence et de contact pour finaliser votre inscription sur AfricaHome.
      </p>

      <form onsubmit="window.submitGoogleProfileSetup(event)" id="g-setup-form">
        <div class="form-group">
          <label>Type de compte *</label>
          <div class="form-tabs" style="margin-bottom:12px;background:#f5f5f5;padding:4px;border-radius:8px">
            <div class="form-tab active" onclick="window.switchGoogleSetupTab('bailleur', this)">🏠 Bailleur</div>
            <div class="form-tab" onclick="window.switchGoogleSetupTab('locataire', this)">🔍 Locataire</div>
            <div class="form-tab" onclick="window.switchGoogleSetupTab('professionnel', this)">🏢 Pro</div>
          </div>
          <input type="hidden" id="g-setup-type" value="bailleur" />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Pays de résidence *</label>
            <select id="g-setup-country" required style="width:100%;padding:11px 12px;background:#f9f9f9;border:1.5px solid #e0e0e0;border-radius:8px;font-size:.9rem">
              ${renderCountryOptions('Cameroun', true)}
            </select>
          </div>
          <div class="form-group">
            <label>Ville *</label>
            <input type="text" id="g-setup-city" placeholder="Douala" required style="width:100%;padding:11px 12px;background:#f9f9f9;border:1.5px solid #e0e0e0;border-radius:8px;font-size:.9rem" />
          </div>
        </div>

        <div class="form-group">
          <label>Quartier</label>
          <input type="text" id="g-setup-quarter" placeholder="Akwa" style="width:100%;padding:11px 12px;background:#f9f9f9;border:1.5px solid #e0e0e0;border-radius:8px;font-size:.9rem" />
        </div>

        ${renderPhoneInput({
          id: 'g-setup-phone',
          label: 'Numéro de téléphone (WhatsApp + Appel) *',
          defaultCountry: 'Cameroun',
          required: true,
          syncWithCountrySelect: 'g-setup-country'
        })}

        <div style="display:flex;gap:10px;margin-top:24px;justify-content:flex-end">
          <button type="button" class="btn btn-outline btn-sm" onclick="document.getElementById('modal-root').innerHTML=''">Annuler</button>
          <button type="submit" class="btn btn-primary btn-sm" id="g-setup-submit"><i class="fas fa-check-circle"></i> S'inscrire</button>
        </div>
      </form>
    </div>
  </div>`;
  
  window.switchGoogleSetupTab = (type, el) => {
    document.getElementById('g-setup-type').value = type;
    el.parentNode.querySelectorAll('.form-tab').forEach(tab => tab.classList.remove('active'));
    el.classList.add('active');
  };

  window.submitGoogleProfileSetup = async (e) => {
    e.preventDefault();
    const btn = document.getElementById('g-setup-submit');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Inscription...';

    try {
      const phoneVal = getPhoneInputValue('g-setup-phone');
      if (!phoneVal.valid) {
        throw new Error(`Téléphone : ${phoneVal.error}`);
      }

      const setupData = {
        type: document.getElementById('g-setup-type').value,
        phone: phoneVal.digits,
        whatsapp: phoneVal.digits,
        country: document.getElementById('g-setup-country').value,
        city: document.getElementById('g-setup-city').value,
        quarter: document.getElementById('g-setup-quarter').value || ''
      };

      const finalPayload = {
        ...googleData,
        setupData
      };

      let res;
      if (window.APP?.mode === 'api') {
        res = await window.APP.api.googleAuth(finalPayload);
      } else {
        res = window.APP.store.googleAuth(finalPayload);
      }

      if (res.success) {
        window.showToast('Compte créé avec succès via Google ! 🎉', 'success');
        document.getElementById('modal-root').innerHTML = '';
        const dash = setupData.type === 'bailleur' ? '/dashboard-bailleur' : setupData.type === 'professionnel' ? '/dashboard-pro' : '/dashboard-locataire';
        router.navigate(dash);
      } else {
        throw new Error(res.message || 'Une erreur est survenue');
      }
    } catch (err) {
      window.showToast(err.message, 'error');
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-check-circle"></i> S\'inscrire';
    }
  };
};

window.showGoogleLinkConfirmationModal = (googleData, message) => {
  const root = document.getElementById('modal-root');
  
  root.innerHTML = `
  <div class="modal-overlay" onclick="if(event.target===this)this.innerHTML=''" style="z-index:2000">
    <div class="modal" style="max-width:440px;width:95%;border-radius:16px;padding:24px">
      <h3 style="margin:0 0 10px;font-size:1.25rem;font-weight:700;display:flex;align-items:center;gap:8px;color:#1a1a2e">
        <i class="fas fa-link" style="color:var(--orange)"></i> Lier le compte Google
      </h3>
      <p style="font-size:.85rem;color:var(--text);line-height:1.5;margin-bottom:16px">
        ${message}
      </p>

      <form onsubmit="window.submitGoogleLinkConfirmation(event)" id="g-link-form">
        <div class="form-group" style="margin-bottom:18px">
          <label>Saisissez le mot de passe de votre compte *</label>
          <input type="password" id="g-link-password" placeholder="Mot de passe AfricaHome" required style="width:100%;padding:11px 12px;background:#f9f9f9;border:1.5px solid #e0e0e0;border-radius:8px;font-size:.9rem" />
        </div>

        <div style="display:flex;gap:10px;justify-content:flex-end">
          <button type="button" class="btn btn-outline btn-sm" onclick="document.getElementById('modal-root').innerHTML=''">Annuler</button>
          <button type="submit" class="btn btn-primary btn-sm" id="g-link-submit"><i class="fas fa-link"></i> Confirmer la liaison</button>
        </div>
      </form>
    </div>
  </div>`;

  window.submitGoogleLinkConfirmation = async (e) => {
    e.preventDefault();
    const btn = document.getElementById('g-link-submit');
    const pwd = document.getElementById('g-link-password').value;
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connexion...';

    try {
      const finalPayload = {
        ...googleData,
        linkConfirmPassword: pwd
      };

      let res;
      if (window.APP?.mode === 'api') {
        res = await window.APP.api.googleAuth(finalPayload);
      } else {
        res = window.APP.store.googleAuth(finalPayload);
      }

      if (res.success) {
        window.showToast('Compte lié et connecté avec succès ! 🚀', 'success');
        document.getElementById('modal-root').innerHTML = '';
        const dash = res.user.type === 'admin' ? '/dashboard-admin' : res.user.type === 'bailleur' ? '/dashboard-bailleur' : res.user.type === 'professionnel' ? '/dashboard-pro' : res.user.type === 'locataire';
        router.navigate(dash);
      } else {
        throw new Error(res.message || 'Mot de passe incorrect');
      }
    } catch (err) {
      window.showToast(err.message, 'error');
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-link"></i> Confirmer la liaison';
    }
  };
};

// =====================================================
// GLOBAL USER SETTINGS / PROFILE MODAL HANDLER
// =====================================================
window.showSettingsModal = () => {
  const user = window.APP?.store?.getCurrentUser();
  if (!user) return;

  const root = document.getElementById('modal-root');
  const isPro = user.type === 'professionnel';
  
  root.innerHTML = `
  <div class="modal-overlay" onclick="if(event.target===this)this.innerHTML=''" style="z-index:2000">
    <div class="modal" style="max-width:550px;width:95%;border-radius:16px;padding:24px;box-shadow:0 20px 40px rgba(0,0,0,0.15)">
      <h3 style="margin:0 0 8px;font-size:1.3rem;font-weight:700;display:flex;align-items:center;gap:10px;color:#1a1a2e">
        <i class="fas fa-cog" style="color:var(--orange)"></i> Paramètres du Compte
      </h3>
      <p style="font-size:.85rem;color:var(--gray);margin-bottom:20px">
        Modifiez vos informations personnelles et sécurisez votre accès.
      </p>

      <form onsubmit="window.submitUserSettings(event)" id="settings-form" style="display:flex;flex-direction:column;gap:14px">
        <div class="form-row" style="display:flex;gap:12px;flex-wrap:wrap">
          <div class="form-group" style="flex:1;min-width:200px">
            <label>${isPro ? 'Raison Sociale / Nom Structure *' : 'Nom Complet *'}</label>
            <input type="text" id="settings-name" value="${isPro ? (user.structureName || user.name) : user.name}" required style="width:100%;padding:11px 12px;background:#f9f9f9;border:1.5px solid #e0e0e0;border-radius:8px;font-size:.9rem" />
          </div>
          ${isPro ? `
          <div class="form-group" style="flex:1;min-width:200px">
            <label>Nom du Représentant *</label>
            <input type="text" id="settings-representative" value="${user.representativeName || ''}" required style="width:100%;padding:11px 12px;background:#f9f9f9;border:1.5px solid #e0e0e0;border-radius:8px;font-size:.9rem" />
          </div>
          ` : ''}
        </div>

        <div class="form-row" style="display:flex;gap:12px;flex-wrap:wrap">
          <div class="form-group" style="flex:1;min-width:200px">
            <label>Adresse Email</label>
            <input type="email" id="settings-email" value="${user.email || ''}" style="width:100%;padding:11px 12px;background:#f9f9f9;border:1.5px solid #e0e0e0;border-radius:8px;font-size:.9rem" />
          </div>
          <div class="form-group" style="flex:1;min-width:200px">
            <label>Numéro WhatsApp</label>
            <input type="text" id="settings-whatsapp" value="${user.whatsapp || user.phone || ''}" style="width:100%;padding:11px 12px;background:#f9f9f9;border:1.5px solid #e0e0e0;border-radius:8px;font-size:.9rem" />
          </div>
        </div>

        <div class="form-row" style="display:flex;gap:12px;flex-wrap:wrap">
          <div class="form-group" style="flex:1;min-width:200px">
            <label>Pays</label>
            <select id="settings-country" style="width:100%;padding:11px 12px;background:#f9f9f9;border:1.5px solid #e0e0e0;border-radius:8px;font-size:.9rem">
              <option value="Cameroun" ${user.country === 'Cameroun' ? 'selected' : ''}>Cameroun</option>
              <option value="Sénégal" ${user.country === 'Sénégal' ? 'selected' : ''}>Sénégal</option>
              <option value="Côte d'Ivoire" ${user.country === "Côte d'Ivoire" ? 'selected' : ''}>Côte d'Ivoire</option>
              <option value="RD Congo" ${user.country === 'RD Congo' ? 'selected' : ''}>RD Congo</option>
            </select>
          </div>
          <div class="form-group" style="flex:1;min-width:200px">
            <label>Ville</label>
            <input type="text" id="settings-city" value="${user.city || ''}" style="width:100%;padding:11px 12px;background:#f9f9f9;border:1.5px solid #e0e0e0;border-radius:8px;font-size:.9rem" />
          </div>
        </div>

        <div class="form-group">
          <label>Quartier</label>
          <input type="text" id="settings-quarter" value="${user.quarter || ''}" style="width:100%;padding:11px 12px;background:#f9f9f9;border:1.5px solid #e0e0e0;border-radius:8px;font-size:.9rem" />
        </div>

        <div style="margin:10px 0 0;padding-top:16px;border-top:1px dashed #eee">
          <h4 style="margin:0 0 10px;font-size:.9rem;font-weight:700;color:#1a1a2e">🔑 Sécurité</h4>
          <div class="form-group">
            <label>Nouveau mot de passe</label>
            <input type="password" id="settings-password" placeholder="Laisser vide pour ne pas modifier" style="width:100%;padding:11px 12px;background:#f9f9f9;border:1.5px solid #e0e0e0;border-radius:8px;font-size:.9rem" />
          </div>
        </div>

        <div style="display:flex;gap:10px;margin-top:14px;justify-content:flex-end">
          <button type="button" class="btn btn-outline btn-sm" onclick="document.getElementById('modal-root').innerHTML=''">Annuler</button>
          <button type="submit" class="btn btn-primary btn-sm" id="settings-submit"><i class="fas fa-save"></i> Enregistrer</button>
        </div>
      </form>
    </div>
  </div>`;

  window.submitUserSettings = async (e) => {
    e.preventDefault();
    const btn = document.getElementById('settings-submit');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enregistrement...';

    try {
      const payload = {
        name: document.getElementById('settings-name').value,
        email: document.getElementById('settings-email').value || '',
        whatsapp: document.getElementById('settings-whatsapp').value || '',
        country: document.getElementById('settings-country').value,
        city: document.getElementById('settings-city').value || '',
        quarter: document.getElementById('settings-quarter').value || ''
      };

      if (isPro) {
        payload.structureName = document.getElementById('settings-name').value;
        payload.representativeName = document.getElementById('settings-representative').value;
      }

      const newPwd = document.getElementById('settings-password').value;
      if (newPwd) {
        if (newPwd.length < 6) {
          throw new Error('Le mot de passe doit faire au moins 6 caractères');
        }
        payload.password = newPwd;
      }

      await window.APP.store.updateProfile(payload);
      
      window.showToast('Profil mis à jour avec succès !', 'success');
      document.getElementById('modal-root').innerHTML = '';
      
      // Reload current page to see updated name
      window.dispatchEvent(new Event('hashchange'));
    } catch (err) {
      window.showToast(err.message || 'Erreur lors de la mise à jour', 'error');
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-save"></i> Enregistrer';
    }
  };
};

