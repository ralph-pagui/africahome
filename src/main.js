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
