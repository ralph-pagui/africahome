import { store } from '../store.js';
import { navigate } from '../router.js';
import { renderPhoneInput, getPhoneInputValue } from '../components/phone-input.js';

export function renderLogin() {
  return `
  <div class="auth-page">
    <div class="auth-card">
      <div style="text-align:center;margin-bottom:20px"><img src="/logo.jpg" alt="AfricaHome" style="width:72px;height:72px;border-radius:50%;margin:0 auto;object-fit:cover" /></div>
      <h2>Connexion</h2>
      <p class="subtitle">Accédez à votre compte AfricaHome</p>
      
      <div class="form-tabs">
        <div class="form-tab active" onclick="window.switchLoginTab('bailleur')">Bailleur</div>
        <div class="form-tab" onclick="window.switchLoginTab('locataire')">Locataire</div>
        <div class="form-tab" onclick="window.switchLoginTab('professionnel')">Pro</div>
        <div class="form-tab" onclick="window.switchLoginTab('admin')" style="font-size:.75rem">🛡️ Admin</div>
      </div>
      
      <form onsubmit="window.handleLogin(event)">
        <input type="hidden" id="login-type" value="bailleur" />
        ${renderPhoneInput({
          id: 'login-phone',
          label: 'Numéro de téléphone *',
          defaultCountry: 'Cameroun',
          required: true,
          showOperators: false
        })}
        <div class="form-group">
          <label>Mot de passe</label>
          <input type="password" id="login-password" placeholder="Votre mot de passe" required />
        </div>
        <div id="login-error" style="color:#ef5350;font-size:.85rem;margin-bottom:10px;display:none"></div>
        <button type="submit" class="btn btn-primary btn-block btn-lg" id="login-btn"><i class="fas fa-sign-in-alt"></i> Se Connecter</button>
      </form>
      
      ${(window.location.href.startsWith('capacitor://') || (window.location.hostname === 'localhost' && window.location.port !== '3000' && window.location.port !== '5173')) ? `
        <p style="text-align:center;margin-top:20px;margin-bottom:15px;font-size:.78rem;color:var(--gray);background:#f8f9fa;padding:12px;border-radius:8px;line-height:1.4">
          💡 La connexion Google est disponible sur notre site web. Sur l'application, veuillez utiliser votre numéro de téléphone et mot de passe.
        </p>
      ` : `
        <div class="form-divider">ou</div>
        <button type="button" class="btn btn-block" style="background:#fff;border:1.5px solid #dadce0;color:#3c4043;font-family:'Outfit',sans-serif;margin-bottom:12px;box-shadow:0 1px 3px rgba(0,0,0,0.08);transition:all 0.2s" onmouseover="this.style.background='#f8f9fa';this.style.borderColor='#d2d4d7'" onmouseout="this.style.background='#fff';this.style.borderColor='#dadce0'" onclick="window.startGoogleAuthFlow()">
          <svg viewBox="0 0 24 24" width="18" height="18" style="margin-right:8px;vertical-align:middle;display:inline-block">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.22-.66-.35-1.36-.35-2.09z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          Continuer avec Google
        </button>
      `}
      
      <a href="#/register" class="btn btn-outline btn-block">Créer un Compte</a>
      <p style="text-align:center;margin-top:16px;font-size:.78rem;color:var(--gray)">Utilisez votre numéro de téléphone pour vous connecter</p>
    </div>
  </div>`;
}

window.switchLoginTab = (type) => {
  document.getElementById('login-type').value = type;
  const types = ['bailleur','locataire','professionnel','admin'];
  document.querySelectorAll('.form-tab').forEach((t, i) => {
    t.classList.toggle('active', types[i] === type);
  });
};

window.handleLogin = async (e) => {
  e.preventDefault();
  const btn = document.getElementById('login-btn');
  const errorEl = document.getElementById('login-error');
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connexion...';
  btn.disabled = true;
  errorEl.style.display = 'none';

  try {
    const phoneVal = getPhoneInputValue('login-phone');
    if (!phoneVal.valid) {
      throw new Error(`Téléphone : ${phoneVal.error}`);
    }
    const phone = phoneVal.digits;
    const password = document.getElementById('login-password').value;
    const type = document.getElementById('login-type').value;

    if (window.APP?.mode === 'api') {
      await window.APP.api.login(phone, password, type);
      window.showToast('Bienvenue !', 'success');
    } else {
      // Demo mode fallback
      const user = store.login(phone, type);
      if (!user) throw new Error('Numéro non reconnu');
      window.showToast('Bienvenue, ' + user.name + ' !', 'success');
    }
    const dash = type === 'admin' ? '/dashboard-admin' : type === 'bailleur' ? '/dashboard-bailleur' : type === 'professionnel' ? '/dashboard-pro' : '/dashboard-locataire';
    navigate(dash);
  } catch (error) {
    errorEl.textContent = error.message;
    errorEl.style.display = 'block';
    btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Se Connecter';
    btn.disabled = false;
  }
};
