import { store } from '../store.js';
import { navigate } from '../router.js';
import { renderPhoneInput, getPhoneInputValue } from '../components/phone-input.js';
import { renderCountryOptions, getCountryCode } from '../utils.js';

export function renderRegister() {
  return `
  <div class="auth-page">
    <div class="auth-card" style="max-width:580px">
      <div style="text-align:center;margin-bottom:20px"><img src="/logo.jpg" alt="AfricaHome" style="width:72px;height:72px;border-radius:50%;margin:0 auto;object-fit:cover" /></div>
      <h2>Créer un Compte</h2>
      <p class="subtitle">Rejoignez AfricaHome en quelques étapes</p>
      
      <div class="form-tabs" id="reg-tabs">
        <div class="form-tab active" onclick="window.switchRegTab('bailleur')">🏠 Bailleur</div>
        <div class="form-tab" onclick="window.switchRegTab('locataire')">🔍 Locataire</div>
        <div class="form-tab" onclick="window.switchRegTab('professionnel')">🏢 Pro</div>
      </div>
      
      <form onsubmit="window.handleRegister(event)" id="reg-form">
        <input type="hidden" id="reg-type" value="bailleur" />
        
        <div class="form-group"><label>Nom complet *</label><input type="text" id="reg-name" placeholder="Votre nom complet" required /></div>
        ${renderPhoneInput({
          id: 'reg-phone',
          label: 'Numéro de téléphone (WhatsApp + Appel) *',
          defaultCountry: 'Cameroun',
          required: true,
          syncWithCountrySelect: 'reg-country'
        })}
        <div class="form-group"><label>Email</label><input type="email" id="reg-email" placeholder="votre@email.com" /></div>
        
        <div id="reg-extra-fields">
          <div class="form-row">
            <div class="form-group">
              <label>Pays *</label>
              <select id="reg-country" required>
                ${renderCountryOptions('Cameroun', true)}
              </select>
            </div>
            <div class="form-group"><label>Ville *</label><input type="text" id="reg-city" placeholder="Votre ville" required /></div>
          </div>
          <div class="form-group"><label>Quartier</label><input type="text" id="reg-quarter" placeholder="Votre quartier" /></div>
        </div>
        
        <div id="reg-pro-fields" style="display:none">
          <div class="form-divider">Informations Professionnelles</div>
          <div class="form-group"><label>Nom de la structure *</label><input type="text" id="reg-structure" placeholder="Nom de votre entreprise" /></div>
          <div class="form-group"><label>Numéro d'identifiant unique (NIU)</label><input type="text" id="reg-niu" placeholder="N° identifiant unique" /></div>
          <div class="form-group"><label>Nom du représentant</label><input type="text" id="reg-rep-name" placeholder="Nom du représentant" /></div>
          <div class="form-group"><label>Numéro CNI</label><input type="text" id="reg-cni" placeholder="N° carte d'identité" /></div>
          <div class="form-group"><label>Document officiel (photo)</label><input type="file" id="reg-doc" accept="image/*" style="padding:10px" /></div>
          <div class="form-group"><label>Photo CNI</label><input type="file" id="reg-cni-photo" accept="image/*" style="padding:10px" /></div>
        </div>
        
        <div class="form-group"><label>Mot de passe *</label><input type="password" id="reg-password" placeholder="Min. 6 caractères" required minlength="6" /></div>
        
        <div class="form-group">
          <label>Code Promo / Parrainage (facultatif)</label>
          <input type="text" id="reg-referred-by" placeholder="Ex: NOM123" style="text-transform:uppercase" />
        </div>
        
        <div id="reg-plan-info" style="background:rgba(230,81,0,0.1);border:1px solid rgba(230,81,0,0.2);border-radius:var(--radius-sm);padding:16px;margin-bottom:18px">
          <div style="font-weight:600;color:var(--orange);margin-bottom:8px">💳 Abonnement Bailleur</div>
          <div style="font-size:.85rem;color:var(--text)">• Mensuel : <strong>2 500 FCFA</strong><br>• Annuel : <strong>15 000 FCFA</strong><br><span style="font-size:.8rem;color:var(--gray)">Paiement par Orange Money / Mobile Money</span></div>
        </div>
        
        <div id="reg-error" style="color:#ef5350;font-size:.85rem;margin-bottom:10px;display:none"></div>
        <button type="submit" class="btn btn-primary btn-block btn-lg" id="reg-btn"><i class="fas fa-user-plus"></i> S'inscrire</button>
      </form>
      
      ${(window.location.href.startsWith('capacitor://') || (window.location.hostname === 'localhost' && window.location.port !== '3000' && window.location.port !== '5173')) ? `
        <p style="text-align:center;margin-top:20px;margin-bottom:15px;font-size:.78rem;color:var(--gray);background:#f8f9fa;padding:12px;border-radius:8px;line-height:1.4">
          💡 L'inscription via Google est disponible sur notre site web. Sur l'application, veuillez utiliser votre numéro de téléphone et mot de passe.
        </p>
      ` : `
        <div class="form-divider">déjà inscrit ?</div>
        <button type="button" class="btn btn-block" style="background:#fff;border:1.5px solid #dadce0;color:#3c4043;font-family:'Outfit',sans-serif;margin-bottom:12px;box-shadow:0 1px 3px rgba(0,0,0,0.08);transition:all 0.2s" onmouseover="this.style.background='#f8f9fa';this.style.borderColor='#d2d4d7'" onmouseout="this.style.background='#fff';this.style.borderColor='#dadce0'" onclick="window.startGoogleAuthFlow()">
          <svg viewBox="0 0 24 24" width="18" height="18" style="margin-right:8px;vertical-align:middle;display:inline-block">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.22-.66-.35-1.36-.35-2.09z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          S'inscrire avec Google
        </button>
      `}
      
      <a href="#/login" class="btn btn-outline btn-block">Se Connecter</a>
    </div>
  </div>`;
}

window.switchRegTab = (type) => {
  document.getElementById('reg-type').value = type;
  document.querySelectorAll('#reg-tabs .form-tab').forEach((t, i) => {
    t.classList.toggle('active', ['bailleur','locataire','professionnel'][i] === type);
  });
  const extra = document.getElementById('reg-extra-fields');
  const pro = document.getElementById('reg-pro-fields');
  const plan = document.getElementById('reg-plan-info');
  const countryField = document.getElementById('reg-country');
  const cityField = document.getElementById('reg-city');
  if (type === 'locataire') {
    extra.style.display = 'none'; pro.style.display = 'none';
    // Remove required from hidden fields to prevent browser validation errors
    if (countryField) countryField.required = false;
    if (cityField) cityField.required = false;
    plan.innerHTML = `<div style="font-weight:600;color:var(--orange);margin-bottom:8px">💳 Frais d'accès Locataire</div><div style="font-size:.85rem;color:var(--text)">Paiement unique : <strong>1 500 FCFA</strong><br><span style="font-size:.8rem;color:var(--gray)">Orange Money / Mobile Money</span></div>`;
  } else if (type === 'professionnel') {
    extra.style.display = 'block'; pro.style.display = 'block';
    if (countryField) countryField.required = true;
    if (cityField) cityField.required = true;
    plan.innerHTML = `<div style="font-weight:600;color:var(--orange);margin-bottom:8px">💳 Abonnement Professionnel</div><div style="font-size:.85rem;color:var(--text)">• Mensuel : <strong>15 000 FCFA</strong><br>• Annuel : <strong>120 000 FCFA</strong><br><span style="font-size:.8rem;color:var(--gray)">Orange Money / Mobile Money</span></div>`;
  } else {
    extra.style.display = 'block'; pro.style.display = 'none';
    if (countryField) countryField.required = true;
    if (cityField) cityField.required = true;
    plan.innerHTML = `<div style="font-weight:600;color:var(--orange);margin-bottom:8px">💳 Abonnement Bailleur</div><div style="font-size:.85rem;color:var(--text)">• Mensuel : <strong>2 500 FCFA</strong><br>• Annuel : <strong>15 000 FCFA</strong><br><span style="font-size:.8rem;color:var(--gray)">Orange Money / Mobile Money</span></div>`;
  }
};

window.handleRegister = async (e) => {
  e.preventDefault();
  const btn = document.getElementById('reg-btn');
  const errorEl = document.getElementById('reg-error');
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Inscription...';
  btn.disabled = true;
  errorEl.style.display = 'none';

  try {
    const phoneVal = getPhoneInputValue('reg-phone');
    if (!phoneVal.valid) {
      throw new Error(`Téléphone : ${phoneVal.error}`);
    }
    const phoneCode = getCountryCode(phoneVal.country);

    const type = document.getElementById('reg-type').value;
    const userData = {
      type,
      name: document.getElementById('reg-name').value,
      phone: phoneVal.digits,
      phoneCode: phoneCode,
      phoneCountry: phoneVal.country,
      whatsapp: phoneVal.digits,
      whatsappCode: phoneCode,
      whatsappCountry: phoneVal.country,
      email: document.getElementById('reg-email')?.value || '',
      password: document.getElementById('reg-password').value,
      country: document.getElementById('reg-country')?.value || '',
      city: document.getElementById('reg-city')?.value || '',
      quarter: document.getElementById('reg-quarter')?.value || '',
      referredByCode: document.getElementById('reg-referred-by')?.value || ''
    };

    let officialDocUrl = '';
    let cniPhotoUrl = '';

    const docFileEl = document.getElementById('reg-doc');
    const cniFileEl = document.getElementById('reg-cni-photo');

    const docFile = docFileEl && docFileEl.files[0];
    const cniFile = cniFileEl && cniFileEl.files[0];

    if (type === 'professionnel') {
      if (window.APP?.mode === 'api') {
        if (docFile) {
          try {
            const urls = await window.APP.api.uploadFiles([docFile]);
            officialDocUrl = urls[0];
          } catch (err) {
            throw new Error('Échec du chargement du document officiel : ' + err.message);
          }
        }
        if (cniFile) {
          try {
            const urls = await window.APP.api.uploadFiles([cniFile]);
            cniPhotoUrl = urls[0];
          } catch (err) {
            throw new Error('Échec du chargement de la photo CNI : ' + err.message);
          }
        }
      } else {
        const readFileAsDataURL = (file) => {
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (ev) => resolve(ev.target.result);
            reader.readAsDataURL(file);
          });
        };
        if (docFile) officialDocUrl = await readFileAsDataURL(docFile);
        if (cniFile) cniPhotoUrl = await readFileAsDataURL(cniFile);
      }

      userData.structureName = document.getElementById('reg-structure')?.value || '';
      userData.niu = document.getElementById('reg-niu')?.value || '';
      userData.representativeName = document.getElementById('reg-rep-name')?.value || '';
      userData.cniNumber = document.getElementById('reg-cni')?.value || '';
      if (officialDocUrl) userData.officialDocUrl = officialDocUrl;
      if (cniPhotoUrl) userData.cniPhotoUrl = cniPhotoUrl;
      // Initialize verification workflow
      if (officialDocUrl || cniPhotoUrl) {
        userData.verificationStatus = 'en_attente';
        userData.verificationHistory = [
          { action: 'en_attente', date: new Date().toISOString().split('T')[0], by: 'Système', note: 'Documents soumis lors de l\'inscription' }
        ];
      } else {
        userData.verificationStatus = 'non_soumis';
      }
      userData.verificationChecklist = {
        cniPhotoLisible: false, cniNumeroValide: false, niuVerifie: false,
        docOfficielAuthentique: false, representantCorrespond: false, structureVerifiee: false
      };
    }

    if (window.APP?.mode === 'api') {
      await window.APP.api.register(userData);
    } else {
      store.register(userData);
    }
    window.showToast('Compte créé avec succès !', 'success');
    const dash = type === 'bailleur' ? '/dashboard-bailleur' : type === 'professionnel' ? '/dashboard-pro' : '/dashboard-locataire';
    navigate(dash);
  } catch (error) {
    errorEl.textContent = error.message;
    errorEl.style.display = 'block';
    btn.innerHTML = '<i class="fas fa-user-plus"></i> S\'inscrire';
    btn.disabled = false;
  }
};
