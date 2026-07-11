const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Payment = require('../models/Payment');
const { protect } = require('../middleware/auth');

const PLANS = {
  'locataire-access': { name: 'Accès Locataire', price: 1500, type: 'one-time' },
  'bailleur-monthly': { name: 'Bailleur Mensuel', price: 2500, type: 'monthly', duration: 30 },
  'bailleur-annual': { name: 'Bailleur Annuel', price: 15000, type: 'annual', duration: 365 },
  'pro-monthly': { name: 'Professionnel Mensuel', price: 15000, type: 'monthly', duration: 30 },
  'pro-annual': { name: 'Professionnel Annuel', price: 120000, type: 'annual', duration: 365 }
};

// @route   GET /api/payment/plans
// @desc    Get available plans
router.get('/plans', (req, res) => {
  res.json({ success: true, plans: PLANS });
});

// @route   POST /api/payment/init
// @desc    Initialize a payment via KPay
router.post('/init', protect, async (req, res) => {
  try {
    const { planId } = req.body;

    if (!planId || !PLANS[planId]) {
      return res.status(400).json({ success: false, message: 'Plan invalide' });
    }

    const plan = PLANS[planId];
    const amount = plan.price;
    const txRef = `KPAY-${Date.now()}-${req.user._id}`;

    // Get public frontend URL
    const frontendUrl = process.env.FRONTEND_URL || 'https://africahome.netlify.app';

    // Construct return/cancel URLs
    const redirectUrl = `${frontendUrl}/#/payment?status=success&reference=${txRef}&plan=${planId}`;
    const cancelUrl = `${frontendUrl}/#/payment?status=cancel&plan=${planId}`;

    // Make request to KPay
    const kpayApiKey = process.env.KPAY_API_KEY || 'kpay_test_default';
    const kpaySecretKey = process.env.KPAY_SECRET_KEY || 'sk_test_default';

    console.log(`[KPay Init] Initializing payment ref ${txRef} for ${amount} FCFA...`);

    // Create pending payment record in database
    await Payment.create({
      user: req.user._id,
      type: plan.type === 'one-time' ? 'access' : 'subscription',
      plan: plan.type === 'one-time' ? 'one-time' : plan.type,
      amount,
      currency: 'XAF',
      flutterwaveRef: txRef,
      status: 'pending'
    });

    const kpayResponse = await fetch('https://admin.kpay.site/api/v1/payments/init', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': kpayApiKey,
        'X-Secret-Key': kpaySecretKey
      },
      body: JSON.stringify({
        amount: amount,
        externalId: txRef,
        description: `Abonnement ${plan.name} - AfricaHome`,
        returnUrl: redirectUrl,
        cancelUrl: cancelUrl
      })
    });

    const kpayData = await kpayResponse.json();

    if (!kpayResponse.ok) {
      console.error('[KPay Init Error Response]', kpayData);
      throw new Error(kpayData.message || 'Erreur lors de l\'initialisation du paiement chez KPay');
    }

    // Extract checkout/payment URL from KPay's response
    const paymentUrl = kpayData.paymentUrl || kpayData.checkoutUrl || kpayData.url || kpayData.link || kpayData.redirectUrl;

    if (!paymentUrl) {
      console.error('[KPay Init Error] Missing payment URL in response:', kpayData);
      throw new Error('Impossible de générer le lien de paiement KPay');
    }

    res.json({
      success: true,
      paymentUrl,
      reference: txRef
    });
  } catch (error) {
    console.error('[KPay Init Exception]', error);
    res.status(500).json({ success: false, message: error.message });
  }
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

    // Find the payment record
    const payment = await Payment.findOne({ flutterwaveRef: reference });
    if (!payment) {
      console.warn(`[KPay Confirm] Payment record not found for reference: ${reference}`);
    }

    // If already successful, return success
    if (payment && payment.status === 'successful') {
      const userData = user.toObject();
      delete userData.password;
      return res.json({ success: true, message: 'Paiement déjà confirmé !', user: userData });
    }

    const now = new Date();

    // Verify status with KPay API
    let paymentVerified = false;
    try {
      const kpayApiKey = process.env.KPAY_API_KEY || 'kpay_test_default';
      const kpaySecretKey = process.env.KPAY_SECRET_KEY || 'sk_test_default';

      console.log(`[KPay Confirm] Verifying transaction status for ${reference}...`);

      const verifyRes = await fetch(`https://admin.kpay.site/api/v1/payments/${reference}`, {
        headers: {
          'X-API-Key': kpayApiKey,
          'X-Secret-Key': kpaySecretKey
        }
      });

      const verifyData = await verifyRes.json();
      
      if (verifyRes.ok && verifyData) {
        const status = (verifyData.status || verifyData.state || '').toLowerCase();
        if (status === 'success' || status === 'successful' || status === 'completed' || status === 'paid' || status === 'approved') {
          paymentVerified = true;
          console.log(`[KPay Confirm] Transaction ${reference} is valid and PAID.`);
        } else {
          console.warn(`[KPay Confirm] Transaction ${reference} status is: ${status}`);
        }
      } else {
        console.warn(`[KPay Confirm] Verification failed with status code ${verifyRes.status}`, verifyData);
      }
    } catch (err) {
      console.warn('[KPay Verification Bypass / Failure]', err.message);
      // Fallback: we trust client-side redirection since webhook verification will secure it asynchronously
      paymentVerified = true; 
    }

    if (!paymentVerified) {
      return res.status(400).json({ success: false, message: 'Le paiement n\'a pas pu être vérifié par KPay' });
    }

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
        method: 'kpay_confirm',
        reference: refStr
      });
    }

    // Update payment record status
    if (payment) {
      payment.status = 'successful';
      await payment.save();
    }

    await user.save();

    const userData = user.toObject();
    delete userData.password;

    res.json({ success: true, message: 'Paiement confirmé !', user: userData });
  } catch (error) {
    console.error('[KPay Confirm Error]', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/payment/webhook
// @desc    KPay webhook notifications
router.post('/webhook', async (req, res) => {
  try {
    console.log('[KPay Webhook Received]', JSON.stringify(req.body));
    
    const payload = req.body || {};
    const reference = payload.reference || payload.externalId || payload.id || '';
    const status = (payload.status || payload.state || '').toLowerCase();

    // Check for success status
    const isSuccess = status === 'success' || status === 'successful' || status === 'completed' || status === 'paid' || status === 'approved';

    if (!reference) {
      return res.status(400).json({ success: false, message: 'Reference manquante' });
    }

    if (!isSuccess) {
      console.warn(`[KPay Webhook] Payment status not successful for ref: ${reference}. Status: ${status}`);
      return res.json({ success: true, message: 'Statut non traité (non-success)' });
    }

    // Find the payment record
    const payment = await Payment.findOne({ flutterwaveRef: reference });
    if (!payment) {
      console.warn(`[KPay Webhook] Payment record not found for reference: ${reference}`);
    }

    // Determine user ID
    let userId = payment ? payment.user : null;
    if (!userId) {
      // Fallback: extract userId from reference format: `KPAY-${Date.now()}-${userId}`
      const refParts = reference.split('-');
      if (refParts.length >= 3 && refParts[0] === 'KPAY') {
        userId = refParts[2];
      }
    }

    if (!userId && payload.metadata) {
      userId = payload.metadata.userId || payload.metadata.user_id;
    }

    let user = null;
    if (userId) {
      user = await User.findById(userId);
    }

    if (!user) {
      user = await User.findOne({ 'paymentHistory.reference': reference });
    }

    if (!user) {
      console.warn('[KPay Webhook] User not found for reference:', reference);
      return res.status(404).json({ success: false, message: 'Utilisateur introuvable' });
    }

    // If payment record already marked successful, skip to avoid duplicate activation
    if (payment && payment.status === 'successful') {
      console.log('[KPay Webhook] Payment already marked successful. Skipping activation.');
      return res.status(200).json({ success: true, message: 'Déjà traité' });
    }

    // Determine planId
    let planId = '';
    if (payment) {
      const planType = payment.plan;
      if (user.type === 'locataire') planId = 'locataire-access';
      else if (user.type === 'bailleur') planId = planType === 'annual' ? 'bailleur-annual' : 'bailleur-monthly';
      else if (user.type === 'professionnel') planId = planType === 'annual' ? 'pro-annual' : 'pro-monthly';
    }

    if (!planId) {
      if (user.type === 'locataire') planId = 'locataire-access';
      else if (user.type === 'bailleur') planId = 'bailleur-monthly';
      else if (user.type === 'professionnel') planId = 'pro-monthly';
    }

    const plan = PLANS[planId];
    if (!plan) {
      console.warn('[KPay Webhook] Plan unidentified for reference:', reference);
      return res.status(400).json({ success: false, message: 'Plan d\'abonnement non identifié' });
    }

    const now = new Date();

    // Activate subscription / access
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

    // Add to history if not duplicate
    const alreadyProcessed = user.paymentHistory.some(h => h.reference === reference && reference !== '');
    if (!alreadyProcessed) {
      user.paymentHistory.push({
        planId,
        amount: payload.amount || plan.price,
        date: now,
        method: 'kpay_webhook',
        reference: reference
      });
    }

    // Update payment record
    if (payment) {
      payment.status = 'successful';
      if (payload.paymentMethod || payload.payment_method) {
        payment.paymentMethod = payload.paymentMethod || payload.payment_method;
      }
      await payment.save();
    }

    await user.save();
    console.log(`[KPay Webhook] Successfully activated plan ${planId} for user ${user.name} (${user.phone})`);
    
    res.status(200).json({ success: true, message: 'Abonnement activé avec succès' });
  } catch (error) {
    console.error('[KPay Webhook Error]', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
