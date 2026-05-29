import { store } from '../store.js';
import { navigate } from '../router.js';

let adminData = null;

const STATUS_CONFIG = {
  non_soumis:  { icon: 'fa-file-upload',    color: '#9e9e9e', label: 'Non soumis',    badge: 'admin-badge-inactive' },
  en_attente:  { icon: 'fa-clock',          color: '#f57c00', label: 'En attente',    badge: 'admin-badge-pending' },
  en_cours:    { icon: 'fa-search',         color: '#1976d2', label: 'En revue',      badge: 'admin-badge-review' },
  approuve:    { icon: 'fa-check-circle',   color: '#2e7d32', label: 'Approuvé',      badge: 'admin-badge-approved' },
  rejete:      { icon: 'fa-times-circle',   color: '#c62828', label: 'Rejeté',        badge: 'admin-badge-rejected' },
  info_requise:{ icon: 'fa-exclamation-triangle', color: '#e65100', label: 'Info requise', badge: 'admin-badge-info' }
};

const CHECKLIST_LABELS = {
  cniPhotoLisible: '🪪 Photo CNI lisible et exploitable',
  cniNumeroValide: '🔢 Numéro CNI valide et correspond',
  niuVerifie: '📋 NIU / RCCM vérifié',
  docOfficielAuthentique: '📄 Document officiel authentique',
  representantCorrespond: '👤 Nom du représentant correspond',
  structureVerifiee: '🏢 Structure / entreprise vérifiée'
};

window.addEventListener('hashchange', () => {
  if (window.location.hash !== '#/dashboard-admin') adminData = null;
});

export function renderDashboardAdmin() {
  const user = store.getCurrentUser();
  if (!user || user.type !== 'admin') return '<div class="auth-page"><div class="auth-card"><h2>🔒 Accès Réservé</h2><p class="subtitle">Espace réservé à l\'administrateur</p><a href="#/login" class="btn btn-primary btn-block">Se Connecter</a></div></div>';

  if (window.APP?.mode === 'api' && !adminData) {
    Promise.all([
      window.APP.api.adminGetUsers(),
      window.APP.api.adminGetListings(),
      window.APP.api.adminGetReviews()
    ]).then(([usersRes, listingsRes, reviewsRes]) => {
      const users = Array.isArray(usersRes) ? usersRes : (usersRes.users || usersRes.data || []);
      const listings = Array.isArray(listingsRes) ? listingsRes : (listingsRes.listings || listingsRes.data || []);
      const reviews = Array.isArray(reviewsRes) ? reviewsRes : (reviewsRes.reviews || reviewsRes.data || []);
      adminData = { users, listings, reviews };
      window.dispatchEvent(new Event('hashchange'));
    }).catch(err => window.showToast('Erreur: ' + err.message, 'error'));
    return `<div class="dashboard admin-dashboard"><div class="container" style="text-align:center;padding:100px 20px"><i class="fas fa-spinner fa-spin" style="font-size:3rem;color:var(--orange)"></i><h2 style="margin-top:20px;color:#1a1a2e">Chargement...</h2></div></div>`;
  }

  const allUsers = (window.APP?.mode === 'api' ? adminData?.users : store.getAllUsers()) || [];
  const allListings = (window.APP?.mode === 'api' ? adminData?.listings : store.getListings()) || [];
  const allReviews = (window.APP?.mode === 'api' ? adminData?.reviews : store.getAllReviews()) || [];
  const bailleurs = allUsers.filter(u => u.type === 'bailleur');
  const locataires = allUsers.filter(u => u.type === 'locataire');
  const pros = allUsers.filter(u => u.type === 'professionnel');
  const totalViews = allListings.reduce((s,l) => s + (l.views||0), 0);
  const totalReviews = allReviews.length;
  const pendingVerifications = pros.filter(u => ['en_attente','info_requise'].includes(u.verificationStatus)).length;

  const revenue = allUsers.reduce((total, u) => {
    // Use actual payment history if available
    if (u.paymentHistory && u.paymentHistory.length > 0) {
      return total + u.paymentHistory.reduce((s, p) => s + (p.amount || 0), 0);
    }
    // Fall back to subscription estimate
    if (!u.subscription?.active) return total;
    if (u.type === 'locataire') return total + 1500;
    if (u.type === 'bailleur') return total + (u.subscription.plan === 'annual' ? 15000 : 2500);
    if (u.type === 'professionnel') return total + (u.subscription.plan === 'annual' ? 120000 : 15000);
    return total;
  }, 0);

  return `
  <div class="dashboard admin-dashboard">
    <div class="container">
      <div class="dash-header">
        <div>
          <h1>🛡️ Panel Administrateur</h1>
          <p style="color:var(--gray);font-size:.9rem">Gestion complète de la plateforme AfricaHome</p>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="btn btn-outline btn-sm" onclick="window.adminRefreshData()"><i class="fas fa-sync-alt"></i> Rafraîchir</button>
          <button class="btn btn-outline btn-sm" onclick="window.adminExport()"><i class="fas fa-download"></i> Exporter</button>

        </div>
      </div>

      <!-- KPI STATS -->
      <div class="stat-cards" style="grid-template-columns:repeat(auto-fit,minmax(150px,1fr))">
        <div class="stat-card admin-stat"><div class="stat-icon" style="background:rgba(230,81,0,0.12);color:var(--orange)"><i class="fas fa-users"></i></div><div class="stat-value">${allUsers.filter(u=>u.type!=='admin').length}</div><div class="stat-label">Utilisateurs</div></div>
        <div class="stat-card admin-stat"><div class="stat-icon" style="background:rgba(46,125,50,0.12);color:var(--green)"><i class="fas fa-home"></i></div><div class="stat-value">${allListings.length}</div><div class="stat-label">Annonces</div></div>
        <div class="stat-card admin-stat"><div class="stat-icon" style="background:rgba(245,166,35,0.12);color:var(--gold)"><i class="fas fa-eye"></i></div><div class="stat-value">${totalViews.toLocaleString('fr-FR')}</div><div class="stat-label">Vues</div></div>
        <div class="stat-card admin-stat"><div class="stat-icon" style="background:rgba(76,175,80,0.12);color:var(--green-light)"><i class="fas fa-star"></i></div><div class="stat-value">${totalReviews}</div><div class="stat-label">Avis</div></div>
        <div class="stat-card admin-stat"><div class="stat-icon" style="background:rgba(93,64,55,0.12);color:var(--brown)"><i class="fas fa-money-bill-wave"></i></div><div class="stat-value">${revenue.toLocaleString('fr-FR')}</div><div class="stat-label">Revenus</div></div>
        ${pendingVerifications > 0 ? `<div class="stat-card admin-stat" style="border:1.5px solid rgba(230,81,0,0.3);cursor:pointer" onclick="window.switchAdminTab('users');setTimeout(()=>document.getElementById('admin-search-users')?.setAttribute('placeholder','🔍 ${pendingVerifications} vérification(s) en attente...'),100)"><div class="stat-icon" style="background:rgba(230,81,0,0.15);color:var(--orange)"><i class="fas fa-id-card"></i></div><div class="stat-value" style="color:var(--orange)">${pendingVerifications}</div><div class="stat-label">Vérif. en attente</div></div>` : ''}
      </div>

      <!-- USER BREAKDOWN -->
      <div class="detail-section" style="margin-top:10px">
        <h3><i class="fas fa-chart-pie" style="color:var(--orange);margin-right:8px"></i>Répartition</h3>
        <div style="display:flex;gap:16px;flex-wrap:wrap;margin-top:16px">
          <div class="admin-breakdown-card" style="--accent:var(--orange)"><div class="admin-breakdown-num">${bailleurs.length}</div><div class="admin-breakdown-label">🏠 Bailleurs</div><div class="admin-breakdown-bar"><div style="width:${allUsers.length?Math.round(bailleurs.length/allUsers.length*100):0}%"></div></div></div>
          <div class="admin-breakdown-card" style="--accent:var(--green)"><div class="admin-breakdown-num">${locataires.length}</div><div class="admin-breakdown-label">🔍 Locataires</div><div class="admin-breakdown-bar"><div style="width:${allUsers.length?Math.round(locataires.length/allUsers.length*100):0}%"></div></div></div>
          <div class="admin-breakdown-card" style="--accent:var(--brown)"><div class="admin-breakdown-num">${pros.length}</div><div class="admin-breakdown-label">🏢 Pros</div><div class="admin-breakdown-bar"><div style="width:${allUsers.length?Math.round(pros.length/allUsers.length*100):0}%"></div></div></div>
        </div>
      </div>

      <!-- TABS -->
      <div class="ps-tabs" style="margin-top:30px" id="admin-tabs">
        <div class="ps-tab active" onclick="window.switchAdminTab('users')">👥 Utilisateurs (${allUsers.filter(u=>u.type!=='admin').length})</div>
        <div class="ps-tab" onclick="window.switchAdminTab('listings')">🏠 Annonces (${allListings.length})</div>
        <div class="ps-tab" onclick="window.switchAdminTab('reviews')">⭐ Avis (${totalReviews})</div>
      </div>

      <!-- TAB: USERS -->
      <div id="admin-tab-users" class="admin-tab-content">
        <div style="display:flex;gap:10px;margin-bottom:16px;flex-wrap:wrap">
          <input type="text" id="admin-search-users" placeholder="🔍 Rechercher un utilisateur..." style="flex:1;min-width:200px;padding:10px 16px;border:1.5px solid #e0e0e0;border-radius:var(--radius-sm);font-size:.85rem;background:#f9f9f9" oninput="window.filterAdminUsers(this.value)" />
        </div>
        <div class="admin-table-wrapper">
          <table class="admin-table" id="admin-users-table">
            <thead><tr><th>Nom</th><th>Type</th><th>Téléphone</th><th>Ville</th><th>Vérification</th><th>Abonnement</th><th>Actions</th></tr></thead>
            <tbody>
              ${allUsers.filter(u=>u.type!=='admin').map(u => {
                const uid = u.id || u._id;
                const vs = u.verificationStatus || (u.verified ? 'approuve' : 'non_soumis');
                const vCfg = STATUS_CONFIG[vs] || STATUS_CONFIG.non_soumis;
                return `
              <tr data-name="${(u.name||'').toLowerCase()}">
                <td>
                  <div style="display:flex;align-items:center;gap:8px">
                    <div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,var(--orange),var(--gold));display:flex;align-items:center;justify-content:center;color:#fff;font-size:.75rem;font-weight:700;flex-shrink:0">${(u.name||'?')[0]}</div>
                    <div>
                      <div style="font-weight:600;font-size:.85rem">${u.name}</div>
                      <div style="font-size:.72rem;color:var(--gray)">${u.email||'—'}</div>
                    </div>
                  </div>
                </td>
                <td><span class="admin-badge admin-badge-${u.type}">${u.type==='bailleur'?'🏠 Bailleur':u.type==='locataire'?'🔍 Locataire':'🏢 Pro'}</span></td>
                <td style="font-size:.85rem">${u.phone}</td>
                <td style="font-size:.85rem">${u.city||'—'}</td>
                <td>
                  ${u.type === 'professionnel'
                    ? `<span style="display:inline-flex;align-items:center;gap:4px;padding:3px 8px;border-radius:20px;font-size:.72rem;font-weight:600;background:${vCfg.color}15;color:${vCfg.color};white-space:nowrap"><i class="fas ${vCfg.icon}" style="font-size:.6rem"></i> ${vCfg.label}</span>`
                    : (u.verified ? '<i class="fas fa-check-circle" style="color:var(--green)"></i>' : '<i class="fas fa-minus-circle" style="color:#ccc"></i>')
                  }
                </td>
                <td>${(u.subscription?.active || u.accessPaid) ? '<span style="color:var(--green);font-size:.8rem;font-weight:600">✅</span>' : '<span style="color:#c62828;font-size:.8rem;font-weight:600">❌</span>'}</td>
                <td>
                  <div style="display:flex;gap:4px;flex-wrap:wrap">
                    <button class="btn btn-sm" style="padding:4px 8px;font-size:.7rem;background:linear-gradient(135deg,var(--green),var(--green-light));color:#fff;border:none;border-radius:6px" onclick="window.adminShowSubscriptionPlans('${uid}')" title="Gérer l'abonnement">
                      <i class="fas fa-crown"></i> Activer
                    </button>
                    ${u.type === 'professionnel' ? `
                      <button class="btn btn-sm" style="padding:4px 10px;font-size:.72rem;background:linear-gradient(135deg,var(--orange),#ff8f00);color:#fff;border:none;border-radius:6px" onclick="window.adminShowProVerification('${uid}')" title="Vérifier l'identité">
                        <i class="fas fa-id-card"></i> Vérifier
                      </button>
                    ` : `
                      <button class="btn btn-sm btn-outline" style="padding:4px 8px;font-size:.7rem" onclick="window.adminToggleVerify('${uid}')" title="${u.verified?'Retirer':'Vérifier'}">
                        <i class="fas fa-${u.verified?'times':'check'}"></i>
                      </button>
                    `}
                    <button class="btn btn-sm btn-danger" style="padding:4px 8px;font-size:.7rem" onclick="window.adminDeleteUser('${uid}','${(u.name || 'Utilisateur').replace(/'/g,"\\'")}')" title="Supprimer">
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>`;}).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- TAB: LISTINGS -->
      <div id="admin-tab-listings" class="admin-tab-content" style="display:none">
        <div style="display:flex;gap:10px;margin-bottom:16px;flex-wrap:wrap">
          <input type="text" id="admin-search-listings" placeholder="🔍 Rechercher une annonce..." style="flex:1;min-width:200px;padding:10px 16px;border:1.5px solid #e0e0e0;border-radius:var(--radius-sm);font-size:.85rem;background:#f9f9f9" oninput="window.filterAdminListings(this.value)" />
        </div>
        <div class="admin-table-wrapper">
          <table class="admin-table" id="admin-listings-table">
            <thead><tr><th>Annonce</th><th>Catégorie</th><th>Prix</th><th>Ville</th><th>Propriétaire</th><th>Vues</th><th>Statut</th><th>Actions</th></tr></thead>
            <tbody>
              ${allListings.map(l => {
                const lid = l.id || l._id;
                const owner = allUsers.find(u => (u.id||u._id) === (l.userId||l.user?._id||l.user));
                return `
              <tr data-title="${(l.title||'').toLowerCase()}">
                <td><div style="display:flex;align-items:center;gap:10px"><img src="${l.images?.[0]||'/images/apartment.png'}" style="width:48px;height:48px;border-radius:8px;object-fit:cover;flex-shrink:0" /><div><div style="font-weight:600;font-size:.85rem;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${l.title}</div><div style="font-size:.72rem;color:var(--gray)">${l.type}</div></div></div></td>
                <td><span class="admin-badge admin-badge-${l.category}">${l.category==='location'?'Location':l.category==='vente'?'Vente':l.category==='terrain'?'Terrain':'Construction'}</span></td>
                <td style="font-weight:600;color:var(--orange);font-size:.85rem">${l.price?.toLocaleString('fr-FR')} F</td>
                <td style="font-size:.85rem">${l.city}</td>
                <td style="font-size:.85rem">${owner?.name||'—'}</td>
                <td style="font-size:.85rem">${l.views||0}</td>
                <td>${l.available?'<span style="color:var(--green);font-size:.75rem;font-weight:600">🟢</span>':'<span style="color:#c62828;font-size:.75rem;font-weight:600">🔴</span>'}</td>
                <td>
                  <div style="display:flex;gap:4px">
                    <button class="btn btn-sm btn-outline" style="padding:4px 8px;font-size:.7rem" onclick="window.adminToggleListing('${lid}')"><i class="fas fa-${l.available?'eye-slash':'eye'}"></i></button>
                    <button class="btn btn-sm btn-outline" style="padding:4px 8px;font-size:.7rem" onclick="window.location.hash='#/detail/${lid}'"><i class="fas fa-external-link-alt"></i></button>
                    <button class="btn btn-sm btn-danger" style="padding:4px 8px;font-size:.7rem" onclick="window.adminDeleteListing('${lid}','${(l.title || 'Sans titre').replace(/'/g,"\\\\'")}')" title="Supprimer"><i class="fas fa-trash"></i></button>
                  </div>
                </td>
              </tr>`;}).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- TAB: REVIEWS -->
      <div id="admin-tab-reviews" class="admin-tab-content" style="display:none">
        <div class="admin-table-wrapper">
          <table class="admin-table">
            <thead><tr><th>Auteur</th><th>Annonce</th><th>Note</th><th>Commentaire</th><th>Date</th><th>Actions</th></tr></thead>
            <tbody>
              ${allReviews.map(r => {
                const rid = r.id || r._id;
                const listing = allListings.find(l => (l.id||l._id) === (r.listingId||r.listing?._id||r.listing));
                return `
              <tr>
                <td style="font-size:.85rem;font-weight:500">${r.userName||r.user?.name||'Inconnu'}</td>
                <td style="font-size:.85rem;max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${listing?.title||'Supprimée'}</td>
                <td><span style="color:var(--orange);font-weight:600">${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}</span></td>
                <td style="font-size:.82rem;color:var(--text);max-width:250px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${r.comment}</td>
                <td style="font-size:.8rem;color:var(--gray)">${r.date||(r.createdAt?r.createdAt.substring(0,10):'—')}</td>
                <td><button class="btn btn-sm btn-danger" style="padding:4px 8px;font-size:.7rem" onclick="window.adminDeleteReview('${rid}')"><i class="fas fa-trash"></i></button></td>
              </tr>`;}).join('')}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  </div>`;
}

// ============= TAB / FILTER ACTIONS =============
window.switchAdminTab = (tab) => {
  document.querySelectorAll('.admin-tab-content').forEach(el => el.style.display = 'none');
  document.querySelectorAll('#admin-tabs .ps-tab').forEach(el => el.classList.remove('active'));
  const t = document.getElementById(`admin-tab-${tab}`);
  if (t) t.style.display = 'block';
  const tabs = { users: 0, listings: 1, reviews: 2 };
  document.querySelectorAll('#admin-tabs .ps-tab')[tabs[tab]]?.classList.add('active');
};
window.filterAdminUsers = (q) => { const s=q.toLowerCase(); document.querySelectorAll('#admin-users-table tbody tr').forEach(tr => { tr.style.display = tr.dataset.name.includes(s)?'':'none'; }); };
window.filterAdminListings = (q) => { const s=q.toLowerCase(); document.querySelectorAll('#admin-listings-table tbody tr').forEach(tr => { tr.style.display = tr.dataset.title.includes(s)?'':'none'; }); };

// ============= CRUD ACTIONS =============
window.adminToggleVerify = (uid) => {
  if (window.APP?.mode === 'api') {
    window.APP.api.adminToggleVerify(uid).then(() => { window.showToast('Statut mis à jour', 'success'); adminData = null; window.dispatchEvent(new Event('hashchange')); }).catch(e => window.showToast(e.message,'error'));
  } else { store.adminToggleVerify(uid); window.showToast('Statut mis à jour','success'); window.dispatchEvent(new Event('hashchange')); }
};
window.adminDeleteUser = (uid, name) => {
  document.getElementById('modal-root').innerHTML = `<div class="modal-overlay" onclick="if(event.target===this)this.innerHTML=''"><div class="modal"><h3><i class="fas fa-exclamation-triangle" style="color:#c62828;margin-right:8px"></i>Supprimer l'utilisateur</h3><p style="margin:16px 0;color:var(--text);line-height:1.6">Supprimer <strong>"${name}"</strong> et toutes ses données ?<br><span style="font-size:.85rem;color:var(--gray)">Cette action est irréversible.</span></p><div style="display:flex;gap:10px;justify-content:flex-end"><button class="btn btn-outline btn-sm" onclick="document.getElementById('modal-root').innerHTML=''">Annuler</button><button class="btn btn-danger btn-sm" onclick="window.doAdminDeleteUser('${uid}')"><i class="fas fa-trash"></i> Confirmer</button></div></div></div>`;
};
window.doAdminDeleteUser = (uid) => {
  if (window.APP?.mode === 'api') {
    window.APP.api.adminDeleteUser(uid).then(() => { window.showToast('Supprimé','success'); adminData=null; document.getElementById('modal-root').innerHTML=''; window.dispatchEvent(new Event('hashchange')); }).catch(e => window.showToast(e.message,'error'));
  } else { store.adminDeleteUser(uid); document.getElementById('modal-root').innerHTML=''; window.showToast('Supprimé','success'); window.dispatchEvent(new Event('hashchange')); }
};
window.adminToggleListing = (lid) => {
  if (window.APP?.mode === 'api') {
    window.APP.api.adminToggleListing(lid).then(() => { window.showToast('Annonce mise à jour','success'); adminData=null; window.dispatchEvent(new Event('hashchange')); }).catch(e => window.showToast(e.message,'error'));
  } else { store.adminToggleListing(lid); window.showToast('Annonce mise à jour','success'); window.dispatchEvent(new Event('hashchange')); }
};
window.adminDeleteListing = (lid, title) => {
  document.getElementById('modal-root').innerHTML = `<div class="modal-overlay" onclick="if(event.target===this)this.innerHTML=''"><div class="modal"><h3><i class="fas fa-exclamation-triangle" style="color:#c62828;margin-right:8px"></i>Supprimer l'annonce</h3><p style="margin:16px 0;color:var(--text)">Supprimer <strong>"${title}"</strong> ?</p><div style="display:flex;gap:10px;justify-content:flex-end"><button class="btn btn-outline btn-sm" onclick="document.getElementById('modal-root').innerHTML=''">Annuler</button><button class="btn btn-danger btn-sm" id="cdl-btn"><i class="fas fa-trash"></i> Confirmer</button></div></div></div>`;
  document.getElementById('cdl-btn').onclick = () => {
    if (window.APP?.mode === 'api') { window.APP.api.adminDeleteListing(lid).then(() => { window.showToast('Supprimée','success'); adminData=null; document.getElementById('modal-root').innerHTML=''; window.dispatchEvent(new Event('hashchange')); }).catch(e => window.showToast(e.message,'error')); }
    else { store.deleteListing(lid); document.getElementById('modal-root').innerHTML=''; window.showToast('Supprimée','success'); window.dispatchEvent(new Event('hashchange')); }
  };
};
window.adminDeleteReview = (rid) => {
  if (window.APP?.mode === 'api') {
    window.APP.api.adminDeleteReview(rid).then(() => { window.showToast('Avis supprimé','success'); adminData=null; window.dispatchEvent(new Event('hashchange')); }).catch(e => window.showToast(e.message,'error'));
  } else { store.adminDeleteReview(rid); window.showToast('Avis supprimé','success'); window.dispatchEvent(new Event('hashchange')); }
};
window.adminExport = () => { const d=JSON.stringify(store.data,null,2); const b=new Blob([d],{type:'application/json'}); const u=URL.createObjectURL(b); const a=document.createElement('a'); a.href=u; a.download=`africahome-export-${new Date().toISOString().split('T')[0]}.json`; a.click(); URL.revokeObjectURL(u); window.showToast('Exporté !','success'); };



window.adminRefreshData = () => {
  adminData = null;
  window.dispatchEvent(new Event('hashchange'));
  window.showToast?.('🔄 Données actualisées avec succès', 'success');
};

// =====================================================
// PREMIUM PROFESSIONAL IDENTITY VERIFICATION MODAL
// =====================================================

window.adminShowProVerification = (userId) => {
  const allUsers = window.APP?.mode === 'api' ? adminData.users : store.getAllUsers();
  const u = allUsers.find(x => (x.id || x._id) === userId);
  if (!u) { window.showToast('Utilisateur introuvable','error'); return; }

  const vs = u.verificationStatus || (u.verified ? 'approuve' : 'non_soumis');
  const vCfg = STATUS_CONFIG[vs] || STATUS_CONFIG.non_soumis;
  const cl = u.verificationChecklist || { cniPhotoLisible:false, cniNumeroValide:false, niuVerifie:false, docOfficielAuthentique:false, representantCorrespond:false, structureVerifiee:false };
  const history = u.verificationHistory || [];
  const checkedCount = Object.values(cl).filter(Boolean).length;
  const totalChecks = 6;
  const pct = Math.round((checkedCount / totalChecks) * 100);

  const modal = document.getElementById('modal-root');
  modal.innerHTML = `
  <div class="modal-overlay" onclick="if(event.target===this)window.closeVerifModal()" style="z-index:1500">
    <div class="modal" style="max-width:900px;width:95%;padding:0;border-radius:16px;max-height:92vh;overflow:hidden;display:flex;flex-direction:column">

      <!-- HEADER -->
      <div style="padding:20px 24px;background:linear-gradient(135deg,#1a1a2e,#16213e);color:#fff;position:relative;overflow:hidden">
        <div style="position:absolute;top:-30px;right:-30px;width:120px;height:120px;border-radius:50%;background:rgba(230,81,0,0.15)"></div>
        <div style="position:absolute;bottom:-20px;right:40px;width:80px;height:80px;border-radius:50%;background:rgba(230,81,0,0.1)"></div>
        <div style="display:flex;justify-content:space-between;align-items:flex-start">
          <div>
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">
              <div style="width:42px;height:42px;border-radius:50%;background:linear-gradient(135deg,var(--orange),#ff8f00);display:flex;align-items:center;justify-content:center;font-size:1.1rem;font-weight:800">${(u.name||'?')[0]}</div>
              <div>
                <h2 style="margin:0;font-size:1.2rem;font-weight:700">${u.structureName || u.name}</h2>
                <p style="margin:2px 0 0;font-size:.78rem;opacity:.7">${u.name} · ${u.phone}</p>
              </div>
            </div>
            <div style="display:inline-flex;align-items:center;gap:6px;padding:4px 12px;border-radius:20px;background:${vCfg.color}30;color:${vCfg.color};font-size:.75rem;font-weight:600;margin-top:8px">
              <i class="fas ${vCfg.icon}"></i> ${vCfg.label}
            </div>
          </div>
          <button type="button" onclick="event.stopPropagation(); window.closeVerifModal()" style="background:rgba(255,255,255,0.15);border:none;color:#fff;width:32px;height:32px;border-radius:50%;cursor:pointer;font-size:.9rem;display:flex;align-items:center;justify-content:center;position:relative;z-index:10" aria-label="Fermer"><i class="fas fa-times"></i></button>
        </div>
      </div>

      <!-- CONTENT -->
      <div style="flex:1;overflow-y:auto;padding:24px">
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:24px">

          <!-- LEFT: INFO + DOCUMENTS -->
          <div style="min-width:0">
            <!-- Info Card -->
            <div style="background:#f8f9fa;border-radius:12px;padding:16px;margin-bottom:16px;border:1px solid #e9ecef">
              <h4 style="margin:0 0 12px;color:var(--orange);font-size:.9rem;display:flex;align-items:center;gap:6px"><i class="fas fa-user-tie"></i> Informations du Professionnel</h4>
              <div style="display:grid;grid-template-columns:auto 1fr;gap:8px 12px;font-size:.82rem">
                <span style="color:#888">Structure:</span><strong>${u.structureName||'—'}</strong>
                <span style="color:#888">Représentant:</span><strong>${u.representativeName||'Non fourni'}</strong>
                <span style="color:#888">N° CNI:</span><strong style="font-family:monospace">${u.cniNumber||'Non fourni'}</strong>
                <span style="color:#888">NIU/RCCM:</span><strong style="font-family:monospace">${u.niu||'Non fourni'}</strong>
                <span style="color:#888">Téléphone:</span><strong>${u.phone}</strong>
                <span style="color:#888">Email:</span><strong>${u.email||'—'}</strong>
                <span style="color:#888">Ville:</span><strong>${u.city||'—'}, ${u.country||'—'}</strong>
              </div>
            </div>

            <!-- Documents -->
            <div style="margin-bottom:16px">
              <h4 style="margin:0 0 10px;font-size:.88rem;color:#1a1a2e;display:flex;align-items:center;gap:6px"><i class="fas fa-file-image" style="color:var(--orange)"></i> Documents soumis</h4>
              <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:10px">
                <div>
                  <div style="font-size:.72rem;color:#888;margin-bottom:4px;font-weight:600">🪪 PHOTO CNI</div>
                  ${u.cniPhotoUrl
                    ? `<div style="position:relative;height:140px;border-radius:10px;overflow:hidden;border:1.5px solid #e0e0e0;cursor:zoom-in;transition:transform 0.2s" onclick="window.openVerifLightbox('${u.cniPhotoUrl}','Photo CNI')" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
                         <img src="${u.cniPhotoUrl}" style="width:100%;height:100%;object-fit:cover" />
                         <div style="position:absolute;bottom:0;left:0;right:0;padding:8px;background:linear-gradient(transparent,rgba(0,0,0,0.6));color:#fff;font-size:.7rem;text-align:center"><i class="fas fa-search-plus"></i> Cliquer pour agrandir</div>
                       </div>`
                    : `<div style="height:140px;background:#f5f5f5;border:2px dashed #ccc;border-radius:10px;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#aaa;font-size:.78rem;gap:6px"><i class="fas fa-image" style="font-size:1.5rem"></i>Non fourni</div>`}
                </div>
                <div>
                  <div style="font-size:.72rem;color:#888;margin-bottom:4px;font-weight:600">📄 DOCUMENT OFFICIEL</div>
                  ${u.officialDocUrl
                    ? `<div style="position:relative;height:140px;border-radius:10px;overflow:hidden;border:1.5px solid #e0e0e0;cursor:zoom-in;transition:transform 0.2s" onclick="window.openVerifLightbox('${u.officialDocUrl}','Document Officiel')" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
                         <img src="${u.officialDocUrl}" style="width:100%;height:100%;object-fit:cover" />
                         <div style="position:absolute;bottom:0;left:0;right:0;padding:8px;background:linear-gradient(transparent,rgba(0,0,0,0.6));color:#fff;font-size:.7rem;text-align:center"><i class="fas fa-search-plus"></i> Cliquer pour agrandir</div>
                       </div>`
                    : `<div style="height:140px;background:#f5f5f5;border:2px dashed #ccc;border-radius:10px;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#aaa;font-size:.78rem;gap:6px"><i class="fas fa-image" style="font-size:1.5rem"></i>Non fourni</div>`}
                </div>
              </div>
            </div>
          </div>

          <!-- RIGHT: CHECKLIST + HISTORY -->
          <div style="min-width:0">
            <!-- Checklist -->
            <div style="background:#f8f9fa;border-radius:12px;padding:16px;margin-bottom:16px;border:1px solid #e9ecef">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
                <h4 style="margin:0;color:#1a1a2e;font-size:.88rem;display:flex;align-items:center;gap:6px"><i class="fas fa-clipboard-check" style="color:var(--orange)"></i> Checklist de Vérification</h4>
                <span style="font-size:.72rem;font-weight:700;color:${pct===100?'#2e7d32':'var(--orange)'}">${checkedCount}/${totalChecks}</span>
              </div>
              <div style="height:5px;background:#e0e0e0;border-radius:3px;overflow:hidden;margin-bottom:14px">
                <div style="height:100%;width:${pct}%;background:linear-gradient(90deg,var(--orange),${pct===100?'#2e7d32':'#ff8f00'});border-radius:3px;transition:width 0.4s"></div>
              </div>
              <div id="verif-checklist" style="display:flex;flex-direction:column;gap:6px">
                ${Object.entries(CHECKLIST_LABELS).map(([key, label]) => `
                  <label style="display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:8px;cursor:pointer;transition:background 0.15s;font-size:.82rem;background:${cl[key]?'rgba(46,125,50,0.06)':'transparent'}" onmouseover="this.style.background='rgba(0,0,0,0.03)'" onmouseout="this.style.background='${cl[key]?'rgba(46,125,50,0.06)':'transparent'}'">
                    <input type="checkbox" ${cl[key]?'checked':''} data-key="${key}" style="width:16px;height:16px;accent-color:var(--green);cursor:pointer" />
                    <span style="color:${cl[key]?'#2e7d32':'#555'};font-weight:${cl[key]?'500':'400'}">${label}</span>
                  </label>
                `).join('')}
              </div>
            </div>

            <!-- Timeline -->
            ${history.length > 0 ? `
            <div style="background:#f8f9fa;border-radius:12px;padding:16px;border:1px solid #e9ecef">
              <h4 style="margin:0 0 12px;color:#1a1a2e;font-size:.88rem;display:flex;align-items:center;gap:6px"><i class="fas fa-history" style="color:var(--orange)"></i> Historique</h4>
              <div style="position:relative;padding-left:20px">
                <div style="position:absolute;left:7px;top:2px;bottom:2px;width:2px;background:#e0e0e0;border-radius:1px"></div>
                ${history.slice().reverse().map(h => {
                  const hCfg = STATUS_CONFIG[h.action] || { icon:'fa-circle', color:'#999' };
                  const dateStr = h.date ? (typeof h.date === 'string' ? h.date.substring(0,10) : new Date(h.date).toLocaleDateString('fr-FR')) : '';
                  return `
                  <div style="position:relative;margin-bottom:14px;padding-left:14px">
                    <div style="position:absolute;left:-13px;top:2px;width:14px;height:14px;border-radius:50%;background:${hCfg.color};display:flex;align-items:center;justify-content:center"><i class="fas ${hCfg.icon}" style="font-size:.45rem;color:#fff"></i></div>
                    <div style="font-size:.78rem;font-weight:600;color:#1a1a2e">${STATUS_CONFIG[h.action]?.label||h.action}</div>
                    <div style="font-size:.68rem;color:#999;margin-top:1px">${dateStr} · ${h.by}</div>
                    ${h.note ? `<div style="font-size:.75rem;color:#666;margin-top:3px;line-height:1.3">${h.note}</div>` : ''}
                  </div>`;
                }).join('')}
              </div>
            </div>
            ` : ''}
          </div>
        </div>

        <!-- ACTION NOTE -->
        <div style="margin-top:20px">
          <label style="font-size:.82rem;font-weight:600;color:#1a1a2e;display:block;margin-bottom:6px"><i class="fas fa-comment-alt" style="color:var(--orange);margin-right:6px"></i>Note / Motif (optionnel)</label>
          <textarea id="verif-note" rows="2" placeholder="Ex: CNI floue, veuillez renvoyer une photo lisible..." style="width:100%;padding:10px 14px;border:1.5px solid #e0e0e0;border-radius:10px;font-size:.85rem;resize:vertical;background:#f9f9f9;font-family:inherit"></textarea>
        </div>
      </div>

      <!-- FOOTER ACTIONS -->
      <div style="padding:16px 24px;background:#f8f9fa;border-top:1px solid #e9ecef;display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end">
        <button type="button" class="btn btn-outline btn-sm" onclick="event.stopPropagation(); window.closeVerifModal()">Fermer</button>
        ${vs !== 'en_cours' ? `<button type="button" class="btn btn-sm" style="background:#1976d2;color:#fff;border:none;border-radius:8px;padding:8px 16px;font-size:.8rem" onclick="window.doVerifAction('${userId}','en_cours')"><i class="fas fa-search"></i> Marquer en revue</button>` : ''}
        <button type="button" class="btn btn-sm" style="background:#e65100;color:#fff;border:none;border-radius:8px;padding:8px 16px;font-size:.8rem" onclick="window.doVerifAction('${userId}','info_requise')"><i class="fas fa-exclamation-triangle"></i> Demander + d'infos</button>
        <button type="button" class="btn btn-sm" style="background:#c62828;color:#fff;border:none;border-radius:8px;padding:8px 16px;font-size:.8rem" onclick="window.doVerifAction('${userId}','rejete')"><i class="fas fa-times-circle"></i> Rejeter</button>
        <button type="button" class="btn btn-sm" style="background:linear-gradient(135deg,#2e7d32,#43a047);color:#fff;border:none;border-radius:8px;padding:8px 18px;font-size:.85rem;font-weight:600" onclick="window.doVerifAction('${userId}','approuve')"><i class="fas fa-check-circle"></i> Approuver</button>
      </div>
    </div>
  </div>`;
};

window.closeVerifModal = () => { document.getElementById('modal-root').innerHTML = ''; };

window.doVerifAction = (userId, action) => {
  // Gather checklist state from DOM
  const checklist = {};
  document.querySelectorAll('#verif-checklist input[type=checkbox]').forEach(cb => {
    checklist[cb.dataset.key] = cb.checked;
  });
  const note = document.getElementById('verif-note')?.value || '';

  if (window.APP?.mode === 'api') {
    window.APP.api.adminVerifyUser(userId, { action, checklist, note })
      .then(() => {
        window.showToast(action === 'approuve' ? '✅ Compte vérifié avec succès !' : action === 'rejete' ? '❌ Vérification rejetée' : action === 'info_requise' ? '⚠️ Demande d\'informations envoyée' : '🔍 Marqué en cours de revue', 'success');
        adminData = null;
        window.closeVerifModal();
        window.dispatchEvent(new Event('hashchange'));
      }).catch(e => window.showToast('Erreur: ' + e.message, 'error'));
  } else {
    store.adminVerifyUser(userId, { action, checklist, note });
    window.showToast(action === 'approuve' ? '✅ Compte vérifié avec succès !' : action === 'rejete' ? '❌ Vérification rejetée' : action === 'info_requise' ? '⚠️ Demande d\'informations envoyée' : '🔍 Marqué en cours de revue', 'success');
    window.closeVerifModal();
    window.dispatchEvent(new Event('hashchange'));
  }
};

window.openVerifLightbox = (imgUrl, title) => {
  const lb = document.createElement('div');
  lb.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.92);z-index:2000;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px;cursor:zoom-out';
  lb.onclick = () => lb.remove();
  lb.innerHTML = `
    <div style="position:absolute;top:16px;right:16px;color:#fff;font-size:1.4rem;cursor:pointer;z-index:1"><i class="fas fa-times"></i></div>
    <div style="color:#fff;margin-bottom:10px;font-weight:600;font-size:1rem">${title}</div>
    <div style="max-width:90%;max-height:80%;border-radius:10px;overflow:hidden;box-shadow:0 10px 40px rgba(0,0,0,0.5)">
      <img src="${imgUrl}" style="max-width:100%;max-height:80vh;object-fit:contain" />
    </div>
  `;
  document.body.appendChild(lb);
};

// =====================================================
// MANUAL SUBSCRIPTION PLAN ACTIVATION MODAL
// =====================================================

window.adminShowSubscriptionPlans = (userId) => {
  const allUsers = window.APP?.mode === 'api' ? adminData.users : store.getAllUsers();
  const u = allUsers.find(x => (x.id || x._id) === userId);
  if (!u) { window.showToast('Utilisateur introuvable', 'error'); return; }

  const modal = document.getElementById('modal-root');
  
  // Available plans by user type
  let plans = [];
  if (u.type === 'locataire') {
    plans = [{ id: 'locataire-access', name: 'Accès Locataire (Abonnement unique)', price: 1500 }];
  } else if (u.type === 'bailleur') {
    plans = [
      { id: 'bailleur-monthly', name: 'Bailleur Mensuel (30 jours)', price: 2500 },
      { id: 'bailleur-annual', name: 'Bailleur Annuel (365 jours)', price: 15000 }
    ];
  } else if (u.type === 'professionnel') {
    plans = [
      { id: 'pro-monthly', name: 'Professionnel Mensuel (30 jours)', price: 15000 },
      { id: 'pro-annual', name: 'Professionnel Annuel (365 jours)', price: 120000 }
    ];
  } else {
    window.showToast('Impossible d\'abonner un compte Administrateur', 'error');
    return;
  }

  modal.innerHTML = `
  <div class="modal-overlay" onclick="if(event.target===this)document.getElementById('modal-root').innerHTML=''">
    <div class="modal" style="max-width:480px">
      <h3><i class="fas fa-crown" style="color:var(--gold);margin-right:8px"></i>Activer un Abonnement</h3>
      <p style="font-size:.85rem;color:var(--gray);margin-bottom:16px">
        Sélectionnez le plan à activer manuellement pour <strong>${u.name}</strong> (${u.type}).
      </p>
      
      <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:20px">
        ${plans.map((p, i) => `
          <label style="display:flex;align-items:center;gap:12px;padding:14px;background:#f9f9f9;border:1.5px solid #e0e0e0;border-radius:10px;cursor:pointer">
            <input type="radio" name="admin-plan-select" value="${p.id}" ${i === 0 ? 'checked' : ''} style="accent-color:var(--orange);width:18px;height:18px" />
            <div style="flex:1">
              <div style="font-weight:600;font-size:.9rem;color:#1a1a2e">${p.name}</div>
              <div style="font-size:.85rem;color:var(--orange);font-weight:700;margin-top:2px">${p.price.toLocaleString('fr-FR')} FCFA</div>
            </div>
          </label>
        `).join('')}
      </div>

      <div style="display:flex;gap:10px;justify-content:flex-end">
        <button class="btn btn-outline btn-sm" onclick="document.getElementById('modal-root').innerHTML=''">Annuler</button>
        <button class="btn btn-primary btn-sm" onclick="window.adminDoActivateSubscription('${userId}')">
          <i class="fas fa-check"></i> Activer
        </button>
      </div>
    </div>
  </div>`;
};

window.adminDoActivateSubscription = (userId) => {
  const planId = document.querySelector('[name=admin-plan-select]:checked')?.value;
  if (!planId) return;

  if (window.APP?.mode === 'api') {
    window.APP.api.adminActivateSubscription(userId, planId)
      .then(() => {
        window.showToast('✅ Abonnement activé avec succès !', 'success');
        adminData = null;
        document.getElementById('modal-root').innerHTML = '';
        window.dispatchEvent(new Event('hashchange'));
      })
      .catch(e => window.showToast('Erreur: ' + e.message, 'error'));
  } else {
    store.adminActivateSubscription(userId, planId);
    window.showToast('✅ Abonnement activé avec succès !', 'success');
    document.getElementById('modal-root').innerHTML = '';
    window.dispatchEvent(new Event('hashchange'));
  }
};
