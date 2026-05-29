const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const PLANS = {
  'locataire-access': { name: 'Accès Locataire', price: 1500, type: 'one-time', selarSlug: '2d9m57h7p4' },
  'bailleur-monthly': { name: 'Bailleur Mensuel', price: 2500, type: 'monthly', duration: 30, selarSlug: '0169mh1uh6' },
  'bailleur-annual': { name: 'Bailleur Annuel', price: 15000, type: 'annual', duration: 365, selarSlug: '1914971px8' },
  'pro-monthly': { name: 'Professionnel Mensuel', price: 15000, type: 'monthly', duration: 30, selarSlug: '22jt717lw2' },
  'pro-annual': { name: 'Professionnel Annuel', price: 120000, type: 'annual', duration: 365, selarSlug: '77y15n4173' }
};

// @route   GET /api/payment/plans
// @desc    Get available plans with Selar product slugs
router.get('/plans', (req, res) => {
  res.json({ success: true, plans: PLANS });
});

// @route   POST /api/payment/confirm
// @desc    Confirm payment and activate subscription
router.post('/confirm', protect, async (req, res) => {
  try {
    const { planId, reference } = req.body;

    if (!planId || !PLANS[planId]) {
      return res.status(400).json({ success: false, message: 'Plan invalide' });
    }

    const plan = PLANS[planId];
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur introuvable' });
    }

    const now = new Date();

    if (plan.type === 'one-time') {
      user.accessPaid = true;
    } else {
      const endDate = new Date(now);
      endDate.setDate(endDate.getDate() + plan.duration);
      user.subscription = {
        plan: plan.type === 'monthly' ? 'monthly' : 'annual',
        active: true,
        startDate: now,
        endDate
      };
    }

    // Check if reference already exists to prevent duplicate histories
    const refStr = reference || '';
    const alreadyProcessed = user.paymentHistory.some(h => h.reference === refStr && refStr !== '');
    if (!alreadyProcessed) {
      user.paymentHistory.push({
        planId,
        amount: plan.price,
        date: now,
        method: 'selar_confirm',
        reference: refStr
      });
    }

    await user.save();

    const userData = user.toObject();
    delete userData.password;

    res.json({ success: true, message: 'Paiement confirmé !', user: userData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/payment/webhook
// @desc    Selar webhook notifications
router.post('/webhook', async (req, res) => {
  try {
    console.log('[Selar Webhook Received]', JSON.stringify(req.body));
    
    // Optional: verify the incoming request headers to secure the webhook
    const selarApiKey = process.env.SELAR_API_KEY;
    const authHeader = req.headers['authorization'] || req.headers['x-selar-token'] || '';
    
    // We support verification if SELAR_API_KEY is configured and present in headers
    if (selarApiKey) {
      const cleanHeaderToken = authHeader.replace(/^Bearer\s+/i, '').trim();
      const cleanApiKey = selarApiKey.trim();
      if (cleanHeaderToken && cleanHeaderToken !== cleanApiKey) {
        console.warn('[Selar Webhook] Security mismatch - unauthorized request token');
        return res.status(401).json({ success: false, message: 'Non autorisé' });
      }
    }

    const payload = req.body || {};

    // 1. Extract Customer details
    let email = payload.email || payload.customer_email || payload.customer?.email || '';
    let phone = payload.phone || payload.customer_phone || payload.customer?.phone || '';
    
    if (typeof email === 'string') email = email.trim().toLowerCase();
    if (typeof phone === 'string') phone = phone.trim();

    // 2. Extract Product / Transaction Info
    const productSlug = payload.product_slug || payload.slug || payload.product?.slug || '';
    const productName = payload.product_name || payload.product_title || payload.product?.name || payload.product?.title || '';
    const reference = payload.reference || payload.transaction_id || payload.payment_id || payload.trxref || '';
    const amount = parseFloat(payload.amount || payload.price || payload.total || 0);

    // 3. Find matching plan ID
    let planId = null;
    if (productSlug) {
      planId = Object.keys(PLANS).find(key => PLANS[key].selarSlug === productSlug);
    }
    
    if (!planId && productName) {
      const nameLower = productName.toLowerCase();
      if (nameLower.includes('pro') && nameLower.includes('mensuel')) {
        planId = 'pro-monthly';
      } else if (nameLower.includes('pro') && nameLower.includes('annuel')) {
        planId = 'pro-annual';
      } else if (nameLower.includes('bailleur') && nameLower.includes('mensuel')) {
        planId = 'bailleur-monthly';
      } else if (nameLower.includes('bailleur') && nameLower.includes('annuel')) {
        planId = 'bailleur-annual';
      } else if (nameLower.includes('locataire') || nameLower.includes('accès')) {
        planId = 'locataire-access';
      }
    }

    if (!planId) {
      console.warn('[Selar Webhook] Plan unidentified for product:', productName, 'slug:', productSlug);
      return res.status(400).json({ success: false, message: 'Plan d\'abonnement non identifié' });
    }

    const plan = PLANS[planId];

    // 4. Find user by email or phone
    let user = null;
    if (email) {
      user = await User.findOne({ email });
    }
    if (!user && phone) {
      const cleanPhone = phone.replace(/\D/g, '');
      user = await User.findOne({ phone });
      if (!user) {
        user = await User.findOne({ phone: new RegExp(cleanPhone + '$') });
      }
      if (!user && cleanPhone.length >= 9) {
        const suffix = cleanPhone.substring(cleanPhone.length - 9);
        user = await User.findOne({ phone: new RegExp(suffix + '$') });
      }
    }

    if (!user) {
      console.warn('[Selar Webhook] User not found for email:', email, 'phone:', phone);
      return res.status(404).json({ success: false, message: 'Utilisateur introuvable' });
    }

    const now = new Date();

    // 5. Activate access / subscription
    if (plan.type === 'one-time') {
      user.accessPaid = true;
    } else {
      const endDate = new Date(now);
      endDate.setDate(endDate.getDate() + plan.duration);
      user.subscription = {
        plan: plan.type === 'monthly' ? 'monthly' : 'annual',
        active: true,
        startDate: now,
        endDate
      };
    }

    // Check if reference already exists to prevent duplicates
    const alreadyProcessed = user.paymentHistory.some(h => h.reference === reference && reference !== '');
    if (!alreadyProcessed) {
      user.paymentHistory.push({
        planId,
        amount: amount || plan.price,
        date: now,
        method: 'selar_webhook',
        reference: reference
      });
    }

    await user.save();
    console.log(`[Selar Webhook] Successfully activated plan ${planId} for user ${user.name} (${user.phone})`);
    
    res.status(200).json({ success: true, message: 'Abonnement activé avec succès' });
  } catch (error) {
    console.error('[Selar Webhook Error]', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
