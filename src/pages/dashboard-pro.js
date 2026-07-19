import { store } from '../store.js';
import { renderDashboardCard } from '../components/dashboard-card.js';

const STATUS_CONFIG = {
  non_soumis:  { icon: 'fa-file-upload',    color: '#9e9e9e', bg: 'rgba(158,158,158,0.1)', label: 'Documents non soumis',          step: 0 },
  en_attente:  { icon: 'fa-clock',          color: '#f57c00', bg: 'rgba(245,124,0,0.1)',   label: 'En attente de vérification',     step: 1 },
  en_cours:    { icon: 'fa-search',         color: '#1976d2', bg: 'rgba(25,118,210,0.1)',   label: 'Vérification en cours',          step: 2 },
  approuve:    { icon: 'fa-check-circle',   color: '#2e7d32', bg: 'rgba(46,125,50,0.1)',    label: 'Compte Professionnel Vérifié',   step: 3 },
  rejete:      { icon: 'fa-times-circle',   color: '#c62828', bg: 'rgba(198,40,40,0.1)',    label: 'Vérification refusée',           step: -1 },
  info_requise:{ icon: 'fa-exclamation-triangle', color: '#e65100', bg: 'rgba(230,81,0,0.1)', label: 'Informations supplémentaires requises', step: -2 }
};

export function renderDashboardPro() {
  const user = store.getCurrentUser();
  if (!user || user.type !== 'professionnel') return '<div class="auth-page"><div class="auth-card"><h2>Accès Réservé</h2><p class="subtitle">Connectez-vous en tant que professionnel</p><a href="#/login" class="btn btn-primary btn-block">Se Connecter</a></div></div>';

  const myListings = store.getUserListings(user.id);
  const totalViews = myListings.reduce((s,l) => s + (l.views||0), 0);
  const status = user.verificationStatus || (user.verified ? 'approuve' : 'non_soumis');
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.non_soumis;
  const checklist = user.verificationChecklist || {};
  const history = user.verificationHistory || [];
  const checkedCount = Object.values(checklist).filter(Boolean).length;
  const totalChecks = Object.keys(checklist).length || 6;
  const progressPct = Math.round((checkedCount / totalChecks) * 100);

  // Steps for the progress tracker
  const steps = [
    { label: 'Soumission', icon: 'fa-file-upload', done: ['en_attente','en_cours','approuve'].includes(status) },
    { label: 'En revue', icon: 'fa-search', done: ['en_cours','approuve'].includes(status) },
    { label: 'Vérifié', icon: 'fa-shield-alt', done: status === 'approuve' }
  ];

  return `
  <div class="dashboard">
    <div class="container">
      <div class="dash-header">
        <div>
          <h1>🏢 ${user.structureName || user.name}</h1>
          <p style="color:var(--gray);font-size:.9rem">${user.verified ? 'Compte Professionnel Vérifié ✅' : 'Compte en attente de vérification ⏳'}</p>
        </div>
        <div style="display:flex;gap:8px">
          <button class="btn btn-outline" onclick="window.showSettingsModal()"><i class="fas fa-cog"></i> Paramètres</button>
          <a href="#/publish" class="btn btn-primary"><i class="fas fa-plus"></i> Publier</a>
        </div>
      </div>

      <!-- VERIFICATION STATUS CARD -->
      <div class="detail-section" style="margin-top:0;background:linear-gradient(135deg, ${cfg.bg}, rgba(255,255,255,0.6));border:1.5px solid ${cfg.color}22;position:relative;overflow:hidden">
        <div style="position:absolute;top:0;right:0;width:120px;height:120px;background:${cfg.color}08;border-radius:0 0 0 120px"></div>
        <div style="display:flex;align-items:center;gap:14px;margin-bottom:16px">
          <div style="width:48px;height:48px;border-radius:50%;background:${cfg.bg};display:flex;align-items:center;justify-content:center;flex-shrink:0">
            <i class="fas ${cfg.icon}" style="font-size:1.3rem;color:${cfg.color}"></i>
          </div>
          <div>
            <h3 style="margin:0;font-size:1.1rem;color:#1a1a2e">${cfg.label}</h3>
            <p style="margin:4px 0 0;font-size:.82rem;color:var(--gray)">${status === 'approuve' ? 'Votre identité a été vérifiée avec succès' : status === 'rejete' ? (user.rejectionReason || 'Vos documents n\'ont pas été acceptés') : status === 'info_requise' ? (user.rejectionReason || 'Veuillez fournir des informations supplémentaires') : status === 'en_cours' ? 'Un administrateur examine vos documents' : status === 'en_attente' ? 'Vos documents seront examinés prochainement' : 'Soumettez vos documents pour être vérifié'}</p>
          </div>
        </div>

        <!-- PROGRESS STEPS -->
        ${status !== 'non_soumis' ? `
        <div style="display:flex;align-items:center;justify-content:center;gap:0;margin:20px 0 8px;position:relative">
          ${steps.map((s, i) => `
            <div style="display:flex;align-items:center;flex:1;${i === steps.length - 1 ? 'flex:0 0 auto' : ''}">
              <div style="display:flex;flex-direction:column;align-items:center;gap:4px;position:relative;z-index:1">
                <div style="width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.85rem;border:2px solid ${s.done ? '#2e7d32' : '#ccc'};background:${s.done ? '#2e7d32' : '#fff'};color:${s.done ? '#fff' : '#999'};transition:all 0.3s">
                  <i class="fas ${s.done ? 'fa-check' : s.icon}"></i>
                </div>
                <span style="font-size:.72rem;color:${s.done ? '#2e7d32' : '#999'};font-weight:${s.done ? '600' : '400'};white-space:nowrap">${s.label}</span>
              </div>
              ${i < steps.length - 1 ? `<div style="flex:1;height:3px;background:${s.done ? '#2e7d32' : '#e0e0e0'};margin:0 6px -16px;border-radius:2px;transition:background 0.3s"></div>` : ''}
            </div>
          `).join('')}
        </div>
        ` : ''}

        <!-- CHECKLIST PROGRESS BAR -->
        ${status !== 'non_soumis' && status !== 'approuve' ? `
        <div style="margin-top:16px;padding-top:12px;border-top:1px solid ${cfg.color}22">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
            <span style="font-size:.8rem;color:var(--gray)">Progression de la vérification</span>
            <span style="font-size:.8rem;font-weight:600;color:${cfg.color}">${checkedCount}/${totalChecks} critères validés</span>
          </div>
          <div style="height:6px;background:#e0e0e0;border-radius:3px;overflow:hidden">
            <div style="height:100%;width:${progressPct}%;background:linear-gradient(90deg,${cfg.color},${cfg.color}cc);border-radius:3px;transition:width 0.6s ease"></div>
          </div>
        </div>
        ` : ''}

        ${(status === 'rejete' || status === 'info_requise') && user.rejectionReason ? `
        <div style="margin-top:14px;padding:12px;background:rgba(198,40,40,0.06);border:1px solid rgba(198,40,40,0.15);border-radius:8px">
          <div style="display:flex;align-items:center;gap:8px;font-size:.85rem;color:#c62828;font-weight:600"><i class="fas fa-info-circle"></i> Motif :</div>
          <p style="margin:6px 0 0;font-size:.82rem;color:#555;line-height:1.5">${user.rejectionReason}</p>
        </div>
        ` : ''}

        <!-- Upload documents form -->
        ${['non_soumis', 'rejete', 'info_requise'].includes(status) ? `
        <div style="margin-top:20px;padding-top:20px;border-top:1px dashed #e0e0e0">
          <h4 style="font-size:.9rem;font-weight:700;margin-bottom:12px;color:#1a1a2e"><i class="fas fa-file-signature" style="color:var(--orange)"></i> Demander la vérification du compte</h4>
          <form onsubmit="window.handleProVerifySubmit(event)" id="pro-verify-form" style="display:flex;flex-direction:column;gap:12px">
            <div class="form-group" style="margin-bottom:0">
              <label style="font-size:.78rem;font-weight:600;color:#333;margin-bottom:4px">Nom de la structure / agence *</label>
              <input type="text" id="v-structure" value="${user.structureName || ''}" placeholder="Ex: Agence Immobilière du Centre" required style="width:100%;padding:10px 12px;background:#fff;border:1.5px solid #e0e0e0;border-radius:8px;font-size:.85rem" />
            </div>
            
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
              <div class="form-group" style="margin-bottom:0">
                <label style="font-size:.78rem;font-weight:600;color:#333;margin-bottom:4px">Numéro d'Identifiant Unique (NIU)</label>
                <input type="text" id="v-niu" value="${user.niu || ''}" placeholder="Ex: M123456789" style="width:100%;padding:10px 12px;background:#fff;border:1.5px solid #e0e0e0;border-radius:8px;font-size:.85rem" />
              </div>
              <div class="form-group" style="margin-bottom:0">
                <label style="font-size:.78rem;font-weight:600;color:#333;margin-bottom:4px">Nom du représentant *</label>
                <input type="text" id="v-rep-name" value="${user.representativeName || user.name}" placeholder="Ex: Jean Douala" required style="width:100%;padding:10px 12px;background:#fff;border:1.5px solid #e0e0e0;border-radius:8px;font-size:.85rem" />
              </div>
            </div>

            <div class="form-group" style="margin-bottom:0">
              <label style="font-size:.78rem;font-weight:600;color:#333;margin-bottom:4px">Numéro CNI *</label>
              <input type="text" id="v-cni" value="${user.cniNumber || ''}" placeholder="Ex: 102938475" required style="width:100%;padding:10px 12px;background:#fff;border:1.5px solid #e0e0e0;border-radius:8px;font-size:.85rem" />
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
              <div class="form-group" style="margin-bottom:0">
                <label style="font-size:.78rem;font-weight:600;color:#333;margin-bottom:4px">Doc officiel (Agrément/Registre) *</label>
                <input type="file" id="v-doc" accept="image/*" ${!user.officialDocUrl ? 'required' : ''} style="width:100%;font-size:.78rem;background:#fff;padding:8px;border:1.5px solid #e0e0e0;border-radius:8px" />
                ${user.officialDocUrl ? `<span style="font-size:.7rem;color:var(--green);margin-top:2px;display:block">📄 Document déjà fourni</span>` : ''}
              </div>
              <div class="form-group" style="margin-bottom:0">
                <label style="font-size:.78rem;font-weight:600;color:#333;margin-bottom:4px">Photo de la CNI *</label>
                <input type="file" id="v-cni-photo" accept="image/*" ${!user.cniPhotoUrl ? 'required' : ''} style="width:100%;font-size:.78rem;background:#fff;padding:8px;border:1.5px solid #e0e0e0;border-radius:8px" />
                ${user.cniPhotoUrl ? `<span style="font-size:.7rem;color:var(--green);margin-top:2px;display:block">🪪 Photo CNI déjà fournie</span>` : ''}
              </div>
            </div>

            <button type="submit" class="btn btn-primary btn-block btn-sm" id="v-submit-btn" style="margin-top:8px;padding:12px">
              <i class="fas fa-paper-plane"></i> Soumettre la Demande de Vérification
            </button>
          </form>
        </div>
        ` : ''}
      </div>

      <!-- VERIFICATION TIMELINE -->
      ${history.length > 0 ? `
      <div class="detail-section">
        <h3><i class="fas fa-history" style="color:var(--orange);margin-right:8px"></i>Historique de Vérification</h3>
        <div style="margin-top:12px;position:relative;padding-left:24px">
          <div style="position:absolute;left:8px;top:4px;bottom:4px;width:2px;background:#e0e0e0;border-radius:1px"></div>
          ${history.slice().reverse().map(h => {
            const hCfg = STATUS_CONFIG[h.action] || { icon: 'fa-circle', color: '#999' };
            const dateStr = h.date ? (typeof h.date === 'string' ? h.date : new Date(h.date).toLocaleDateString('fr-FR')) : '';
            return `
            <div style="position:relative;margin-bottom:16px;padding-left:16px">
              <div style="position:absolute;left:-16px;top:2px;width:18px;height:18px;border-radius:50%;background:${hCfg.color};display:flex;align-items:center;justify-content:center">
                <i class="fas ${hCfg.icon}" style="font-size:.55rem;color:#fff"></i>
              </div>
              <div style="font-size:.82rem;font-weight:600;color:#1a1a2e">${STATUS_CONFIG[h.action]?.label || h.action}</div>
              <div style="font-size:.75rem;color:var(--gray);margin-top:2px">${dateStr} · par ${h.by}</div>
              ${h.note ? `<div style="font-size:.78rem;color:#555;margin-top:4px;line-height:1.4">${h.note}</div>` : ''}
            </div>`;
          }).join('')}
        </div>
      </div>
      ` : ''}

      <div class="stat-cards">
        <div class="stat-card"><div class="stat-icon" style="background:rgba(230,81,0,0.1);color:var(--orange)"><i class="fas fa-building"></i></div><div class="stat-value">${myListings.length}</div><div class="stat-label">Publications</div></div>
        <div class="stat-card"><div class="stat-icon" style="background:rgba(46,125,50,0.1);color:var(--green)"><i class="fas fa-eye"></i></div><div class="stat-value">${totalViews}</div><div class="stat-label">Vues Totales</div></div>
        <div class="stat-card"><div class="stat-icon" style="background:rgba(245,166,35,0.1);color:var(--gold)"><i class="fas fa-star"></i></div><div class="stat-value">${myListings.length > 0 ? (myListings.reduce((s,l) => s+store.getAvgRating(l.id),0)/myListings.length).toFixed(1) : '—'}</div><div class="stat-label">Note Moyenne</div></div>
        <div class="stat-card"><div class="stat-icon" style="background:${cfg.bg};color:${cfg.color}"><i class="fas ${cfg.icon}"></i></div><div class="stat-value">${status === 'approuve' ? 'Vérifié' : status === 'en_attente' ? 'En attente' : status === 'en_cours' ? 'En cours' : status === 'rejete' ? 'Refusé' : status === 'info_requise' ? 'Info requise' : 'Non soumis'}</div><div class="stat-label">Statut</div></div>
      </div>

      <div class="detail-section">
        <h3><i class="fas fa-info-circle" style="color:var(--orange);margin-right:8px"></i>Services Autorisés</h3>
        <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:12px">
          ${['Maisons à louer','Maisons à vendre','Terrains','Plans 3D','Construction','Électricité','Plomberie','Maçonnerie','Électroménager','Meubles','Décoration'].map(s => `<span class="detail-tag">${s}</span>`).join('')}
        </div>
      </div>
      
      <!-- Parrainage & Code Promo -->
      <div class="detail-section" style="margin-top:20px">
        <h3><i class="fas fa-gift" style="color:var(--orange);margin-right:8px"></i>Parrainage & Code Promo</h3>
        <p style="font-size:.85rem;color:var(--gray);margin-top:4px;line-height:1.4">Partagez votre code promo avec des utilisateurs pour leur faire découvrir la plateforme. Lorsqu'ils s'inscriront avec votre code, l'administrateur pourra voir les parrainages créés.</p>
        <div style="display:flex;align-items:center;gap:16px;background:rgba(230,81,0,0.05);border:1px dashed var(--orange);padding:16px;border-radius:12px;margin-top:12px;max-width:400px">
          <div style="flex:1">
            <span style="font-size:.78rem;color:var(--gray);font-weight:600;text-transform:uppercase;display:block">Votre Code Promo</span>
            <strong id="promo-code-val" style="font-size:1.3rem;color:#1a1a2e;font-family:'Outfit',sans-serif;letter-spacing:1px">${user.promoCode || '—'}</strong>
          </div>
          <button class="btn btn-primary btn-sm" onclick="window.copyPromoCode('${user.promoCode || ''}')">
            <i class="fas fa-copy"></i> Copier
          </button>
        </div>
      </div>

      <div style="margin-top:30px">
        <h2 style="font-size:1.3rem;color:#1a1a2e;margin-bottom:20px">📋 Mes Publications</h2>
        ${myListings.length > 0
          ? `<div class="properties-grid">${myListings.map(l => renderDashboardCard(l)).join('')}</div>`
          : `<div class="empty-state"><i class="fas fa-plus-circle"></i><h3>Aucune publication</h3><p>Publiez vos offres immobilières</p><a href="#/publish" class="btn btn-primary">Publier</a></div>`
        }
      </div>
    </div>
  </div>`;
}

// Handle Pro verification documents submission
window.handleProVerifySubmit = async (e) => {
  e.preventDefault();
  const btn = document.getElementById('v-submit-btn');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Envoi en cours...';

  try {
    const docFile = document.getElementById('v-doc')?.files[0];
    const cniFile = document.getElementById('v-cni-photo')?.files[0];
    
    let officialDocUrl = store.getCurrentUser()?.officialDocUrl || '';
    let cniPhotoUrl = store.getCurrentUser()?.cniPhotoUrl || '';

    // Upload files if new ones are selected
    if (window.APP?.mode === 'api') {
      if (docFile) {
        const urls = await window.APP.api.uploadFiles([docFile]);
        officialDocUrl = urls[0];
      }
      if (cniFile) {
        const urls = await window.APP.api.uploadFiles([cniFile]);
        cniPhotoUrl = urls[0];
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

    const verificationData = {
      structureName: document.getElementById('v-structure').value,
      niu: document.getElementById('v-niu').value,
      representativeName: document.getElementById('v-rep-name').value,
      cniNumber: document.getElementById('v-cni').value,
      officialDocUrl,
      cniPhotoUrl,
      verificationStatus: 'en_attente',
      verificationHistory: [
        ...(store.getCurrentUser()?.verificationHistory || []),
        { action: 'en_attente', date: new Date().toISOString().split('T')[0], by: 'Utilisateur', note: 'Documents de vérification soumis depuis le tableau de bord' }
      ],
      verificationChecklist: {
        cniPhotoLisible: false,
        cniNumeroValide: false,
        niuVerifie: false,
        docOfficielAuthentique: false,
        representantCorrespond: false,
        structureVerifiee: false
      }
    };

    if (window.APP?.mode === 'api') {
      await window.APP.api.submitVerification(verificationData);
    } else {
      const user = store.getCurrentUser();
      Object.assign(user, verificationData);
      store.save();
    }

    window.showToast('✅ Documents soumis avec succès pour examen !', 'success');
    
    // Force re-render of current view
    window.location.reload();
  } catch (err) {
    window.showToast('❌ Échec de la soumission : ' + err.message, 'error');
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-paper-plane"></i> Soumettre la Demande de Vérification';
  }
};
