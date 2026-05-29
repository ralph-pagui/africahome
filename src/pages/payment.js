import { store } from '../store.js';

// Selar.co product configuration
const SELAR_CONFIG = {
  baseUrl: 'https://selar.co',
  products: {
    'locataire-access':  { slug: '2d9m57h7p4', name: 'Accès Locataire',        price: 1500,   type: 'one-time', duration: 0 },
    'bailleur-monthly':  { slug: '0169mh1uh6', name: 'Bailleur Mensuel',       price: 2500,   type: 'monthly',  duration: 30 },
    'bailleur-annual':   { slug: '1914971px8',  name: 'Bailleur Annuel',        price: 15000,  type: 'annual',   duration: 365 },
    'pro-monthly':       { slug: '22jt717lw2',  name: 'Professionnel Mensuel',  price: 15000,  type: 'monthly',  duration: 30 },
    'pro-annual':        { slug: '77y15n4173',  name: 'Professionnel Annuel',   price: 120000, type: 'annual',   duration: 365 }
  }
};

// Get the correct price label for a subscription
function getSubPrice(user) {
  const sub = user?.subscription;
  if (!sub) return 0;
  // Use stored price if available
  if (sub.price) return sub.price;
  // Fallback: lookup from planId
  if (sub.planId && SELAR_CONFIG.products[sub.planId]) {
    return SELAR_CONFIG.products[sub.planId].price;
  }
  // Last fallback: guess from plan type and user type
  if (user.type === 'locataire') return 1500;
  if (user.type === 'bailleur') return sub.plan === 'annual' ? 15000 : 2500;
  if (user.type === 'professionnel') return sub.plan === 'annual' ? 120000 : 15000;
  return 0;
}

function getSubName(user) {
  const sub = user?.subscription;
  if (!sub) return 'Aucun';
  if (sub.planName) return sub.planName;
  if (sub.planId && SELAR_CONFIG.products[sub.planId]) {
    return SELAR_CONFIG.products[sub.planId].name;
  }
  if (sub.plan === 'annual') return 'Annuel';
  if (sub.plan === 'monthly') return 'Mensuel';
  if (sub.plan === 'one-time') return 'Accès unique';
  return 'Aucun';
}

function getPlansForUser(user) {
  if (!user) return [];
  if (user.type === 'locataire') {
    return [
      { id: 'locataire-access', ...SELAR_CONFIG.products['locataire-access'] }
    ];
  }
  if (user.type === 'bailleur') {
    return [
      { id: 'bailleur-monthly', ...SELAR_CONFIG.products['bailleur-monthly'] },
      { id: 'bailleur-annual', ...SELAR_CONFIG.products['bailleur-annual'] }
    ];
  }
  if (user.type === 'professionnel') {
    return [
      { id: 'pro-monthly', ...SELAR_CONFIG.products['pro-monthly'] },
      { id: 'pro-annual', ...SELAR_CONFIG.products['pro-annual'] }
    ];
  }
  return [];
}

function formatPrice(p) { return p.toLocaleString('fr-FR'); }

export function renderPayment() {
  const user = store.getCurrentUser();
  if (!user) return '<div class="auth-page"><div class="auth-card"><h2>Connexion requise</h2><p class="subtitle">Connectez-vous pour effectuer un paiement</p><a href="#/login" class="btn btn-primary btn-block">Se Connecter</a></div></div>';

  const plans = getPlansForUser(user);
  const sub = user.subscription;
  const isActive = sub?.active;
  const subName = getSubName(user);
  const subPrice = getSubPrice(user);
  const endDate = sub?.end || sub?.endDate;

  return `
  <div class="auth-page">
    <div class="auth-card" style="max-width:560px">
      <div style="text-align:center;margin-bottom:20px"><img src="/logo.jpg" style="width:60px;height:60px;border-radius:50%;margin:0 auto;object-fit:cover" /></div>
      <h2>💳 Paiement Sécurisé</h2>
      <p class="subtitle">Activez votre abonnement AfricaHome via Selar</p>

      ${isActive ? `
      <!-- Current subscription info -->
      <div style="background:rgba(46,125,50,0.06);border:1.5px solid rgba(46,125,50,0.2);border-radius:12px;padding:16px;margin-bottom:20px">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
          <i class="fas fa-check-circle" style="color:#2e7d32;font-size:1.1rem"></i>
          <strong style="color:#2e7d32;font-size:.92rem">Abonnement Actif</strong>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:.82rem">
          <div><span style="color:#888">Plan :</span> <strong>${subName}</strong></div>
          <div><span style="color:#888">Expire :</span> <strong>${endDate ? new Date(endDate).toLocaleDateString('fr-FR') : '—'}</strong></div>
          <div><span style="color:#888">Prix :</span> <strong>${formatPrice(subPrice)} FCFA</strong></div>
          <div><span style="color:#888">Type :</span> <strong>${user.type}</strong></div>
        </div>
      </div>
      ` : ''}

      <h3 style="font-size:1rem;margin-bottom:14px;color:#1a1a2e">${isActive ? '🔄 Renouveler / Changer de plan' : '📋 Choisissez votre plan'}</h3>

      <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:20px">
        ${plans.map((p, i) => `
          <label class="payment-plan-option ${i === 0 ? 'selected' : ''}" onclick="window.selectPlan(this)">
            <input type="radio" name="plan" value="${p.id}" ${i === 0 ? 'checked' : ''} style="accent-color:var(--orange);width:18px;height:18px" />
            <div style="flex:1">
              <div style="font-weight:600;color:#1a1a2e;font-size:.92rem">${p.name}</div>
              <div style="font-size:.78rem;color:var(--gray);margin-top:2px">${p.type === 'one-time' ? 'Paiement unique · Accès à vie' : p.type === 'annual' ? "Par an · Économisez jusqu'à 40%" : 'Par mois · Sans engagement'}</div>
            </div>
            <div style="text-align:right">
              <div style="font-family:var(--font-display);font-size:1.3rem;font-weight:800;color:var(--orange)">${formatPrice(p.price)}</div>
              <div style="font-size:.7rem;color:var(--gray)">FCFA</div>
            </div>
            ${p.type === 'annual' ? '<div style="position:absolute;top:4px;right:12px;background:linear-gradient(135deg,var(--green),var(--green-light));color:#fff;font-size:.62rem;font-weight:700;padding:2px 10px;border-radius:50px">POPULAIRE</div>' : ''}
          </label>
        `).join('')}
      </div>

      <!-- Payment methods -->
      <div style="background:#f8f9fa;border-radius:12px;padding:14px;margin-bottom:20px">
        <div style="font-size:.78rem;color:var(--gray);margin-bottom:10px;font-weight:600">Moyens de paiement acceptés :</div>
        <div style="display:flex;gap:14px;flex-wrap:wrap;justify-content:center">
          <div style="text-align:center"><div style="font-size:1.3rem">🟠</div><div style="font-size:.68rem;color:var(--text)">Orange Money</div></div>
          <div style="text-align:center"><div style="font-size:1.3rem">🟡</div><div style="font-size:.68rem;color:var(--text)">MTN MoMo</div></div>
          <div style="text-align:center"><div style="font-size:1.3rem">🔵</div><div style="font-size:.68rem;color:var(--text)">Moov Money</div></div>
          <div style="text-align:center"><div style="font-size:1.3rem">💳</div><div style="font-size:.68rem;color:var(--text)">Visa / MC</div></div>
          <div style="text-align:center"><div style="font-size:1.3rem">🏦</div><div style="font-size:.68rem;color:var(--text)">Virement</div></div>
        </div>
      </div>



      <div id="pay-error" style="color:#ef5350;font-size:.85rem;margin-bottom:10px;display:none"></div>
      <button class="btn btn-primary btn-block btn-lg" id="pay-btn" onclick="window.handlePayment()" style="font-size:1rem;padding:16px">
        <i class="fas fa-lock"></i> Payer via Selar
      </button>
      <p style="text-align:center;margin-top:10px;font-size:.72rem;color:var(--gray)">🔒 Paiement sécurisé par <strong>Selar.co</strong> · Mobile Money, Carte bancaire</p>


      <div style="margin-top:20px;padding-top:16px;border-top:1px solid #eee">
        <div style="display:flex;align-items:center;gap:8px;justify-content:center">
          <i class="fas fa-shield-alt" style="color:var(--green);font-size:.85rem"></i>
          <span style="font-size:.75rem;color:var(--gray)">Garantie satisfait ou remboursé sous 48h</span>
        </div>
      </div>
    </div>
  </div>`;
}

// Select plan visual
window.selectPlan = (label) => {
  document.querySelectorAll('.payment-plan-option').forEach(l => l.classList.remove('selected'));
  label.classList.add('selected');
  label.querySelector('input').checked = true;
};

// Handle payment — ALWAYS redirect to Selar
window.handlePayment = async () => {
  const planId = document.querySelector('[name=plan]:checked')?.value;
  const btn = document.getElementById('pay-btn');
  const errorEl = document.getElementById('pay-error');
  if (!planId) return;

  const plan = SELAR_CONFIG.products[planId];
  if (!plan) return;

  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Redirection vers Selar...';
  btn.disabled = true;
  errorEl.style.display = 'none';

  try {
    if (!plan.slug) {
      throw new Error('Ce plan n\'est pas encore configuré. Contactez l\'administrateur.');
    }

    // Store pending payment info BEFORE redirecting to Selar
    const user = store.getCurrentUser();
    localStorage.setItem('ah_pending_payment', JSON.stringify({
      planId,
      userId: user?.id || null,
      userType: user?.type || null,
      timestamp: Date.now()
    }));

    // Redirect to Selar checkout page
    const selarUrl = `${SELAR_CONFIG.baseUrl}/${plan.slug}`;
    window.location.href = selarUrl;
  } catch (error) {
    errorEl.textContent = error.message;
    errorEl.style.display = 'block';
    btn.innerHTML = '<i class="fas fa-lock"></i> Payer via Selar';
    btn.disabled = false;
  }
};



// ============= GLOBAL PAYMENT CALLBACK =============
export function checkGlobalPaymentCallback() {
  const search = window.location.search || '';
  const hash = window.location.hash || '';

  const searchParams = new URLSearchParams(search);
  const hashQIdx = hash.indexOf('?');
  const hashParams = hashQIdx > -1 ? new URLSearchParams(hash.substring(hashQIdx)) : new URLSearchParams();

  // 1. Check for cancel/failure statuses
  const statusVal = (searchParams.get('status') || hashParams.get('status') ||
                     searchParams.get('selar_status') || hashParams.get('selar_status') ||
                     searchParams.get('payment') || hashParams.get('payment') || '').toLowerCase();

  if (statusVal === 'failed' || statusVal === 'cancelled' || statusVal === 'cancel') {
    cleanPaymentUrl();
    window.showToast?.('❌ Le paiement a été annulé ou a échoué.', 'error');
    return;
  }

  // 2. Detect Selar return
  const reference = searchParams.get('reference') || hashParams.get('reference');
  const trxref = searchParams.get('trxref') || hashParams.get('trxref') || searchParams.get('transaction_id') || hashParams.get('transaction_id');
  const hasSuccessStatus = statusVal === 'success';

  const isPaymentReturn = reference || trxref || hasSuccessStatus;
  if (!isPaymentReturn) return;

  const user = store.getCurrentUser();
  if (!user) {
    window.showToast?.('⚠️ Connectez-vous pour activer votre abonnement', 'error');
    cleanPaymentUrl();
    return;
  }

  // Determine planId
  let planId = searchParams.get('plan') || hashParams.get('plan');
  if (!planId) {
    try {
      const pending = JSON.parse(localStorage.getItem('ah_pending_payment'));
      if (pending && pending.planId && (Date.now() - (pending.timestamp || 0) < 2 * 60 * 60 * 1000)) {
        planId = pending.planId;
      }
    } catch {}
  }

  if (!planId) {
    if (user.type === 'locataire') planId = 'locataire-access';
    else if (user.type === 'bailleur') planId = 'bailleur-monthly';
    else if (user.type === 'professionnel') planId = 'pro-monthly';
  }

  if (!planId) {
    cleanPaymentUrl();
    return;
  }

  const plan = SELAR_CONFIG.products[planId];
  if (!plan) {
    window.showToast?.('⚠️ Plan inconnu. Contactez le support.', 'error');
    cleanPaymentUrl();
    return;
  }

  // Prevent double activation
  const lastPayment = user.paymentHistory?.[user.paymentHistory?.length - 1];
  if (lastPayment && lastPayment.planId === planId && (Date.now() - new Date(lastPayment.date).getTime()) < 5 * 60 * 1000) {
    cleanPaymentUrl();
    return;
  }

  localStorage.removeItem('ah_pending_payment');
  cleanPaymentUrl();

  if (window.APP?.mode === 'api') {
    window.showToast?.('⌛ Activation de votre abonnement...', 'info');
    window.APP.api.confirmPayment(planId, reference || trxref)
      .then(async (updatedUser) => {
        window.showToast?.(`✅ Paiement de ${formatPrice(plan.price)} FCFA confirmé ! Abonnement ${plan.name} activé.`, 'success');
        const dash = updatedUser.type === 'bailleur' ? '/dashboard-bailleur' : updatedUser.type === 'professionnel' ? '/dashboard-pro' : '/dashboard-locataire';
        setTimeout(() => {
          window.location.hash = '#' + dash;
          window.dispatchEvent(new Event('hashchange'));
        }, 1500);
      })
      .catch((err) => {
        window.showToast?.('❌ Échec : ' + err.message, 'error');
      });
  } else {
    const now = new Date();
    const endDate = new Date(now);
    if (plan.duration) endDate.setDate(endDate.getDate() + plan.duration);

    user.subscription = {
      plan: plan.type === 'one-time' ? 'one-time' : plan.type,
      planId: planId,
      planName: plan.name,
      price: plan.price,
      active: true,
      start: now.toISOString().split('T')[0],
      end: plan.duration ? endDate.toISOString().split('T')[0] : null
    };

    if (user.type === 'locataire') user.accessPaid = true;
    if (!user.paymentHistory) user.paymentHistory = [];
    user.paymentHistory.push({
      planId,
      planName: plan.name,
      amount: plan.price,
      date: now.toISOString(),
      method: 'selar_return'
    });

    store.save();
    window.showToast?.(`✅ Paiement de ${formatPrice(plan.price)} FCFA confirmé ! Abonnement ${plan.name} activé.`, 'success');

    const dash = user.type === 'bailleur' ? '/dashboard-bailleur' : user.type === 'professionnel' ? '/dashboard-pro' : '/dashboard-locataire';
    setTimeout(() => {
      window.location.hash = '#' + dash;
      window.dispatchEvent(new Event('hashchange'));
    }, 1500);
  }
}

function cleanPaymentUrl() {
  const cleanPath = window.location.pathname;
  const hash = window.location.hash || '';
  const hashQIdx = hash.indexOf('?');
  const cleanHash = hashQIdx > -1 ? hash.substring(0, hashQIdx) : hash;
  const finalHash = cleanHash || '#/payment';
  window.history.replaceState({}, '', cleanPath + finalHash);
}

window.addEventListener('pageshow', () => {
  const btn = document.getElementById('pay-btn');
  if (btn) {
    btn.innerHTML = '<i class="fas fa-lock"></i> Payer via Selar';
    btn.disabled = false;
  }
});
