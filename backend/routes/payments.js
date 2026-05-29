const express = require('express');
const router = express.Router();
const Flutterwave = require('flutterwave-node-v3');
const Payment = require('../models/Payment');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Initialize Flutterwave
const getFlw = () => new Flutterwave(process.env.FLW_PUBLIC_KEY, process.env.FLW_SECRET_KEY);

// Plan prices in FCFA (XAF)
const PLANS = {
  bailleur: { monthly: 2500, annual: 15000 },
  professionnel: { monthly: 15000, annual: 120000, weekly: 5000 },
  locataire: { 'one-time': 1500 }
};

// @route   POST /api/payments/init
// @desc    Initialize a payment via Flutterwave
router.post('/init', protect, async (req, res) => {
  try {
    const { plan } = req.body; // monthly, annual, weekly, one-time
    const userType = req.user.type;

    if (!PLANS[userType] || !PLANS[userType][plan]) {
      return res.status(400).json({ success: false, message: 'Plan invalide pour votre type de compte' });
    }

    const amount = PLANS[userType][plan];
    const txRef = `AH-${Date.now()}-${req.user._id}`;

    // Create payment record
    const payment = await Payment.create({
      user: req.user._id,
      type: userType === 'locataire' ? 'access' : 'subscription',
      plan,
      amount,
      currency: 'XAF',
      flutterwaveRef: txRef,
      status: 'pending'
    });

    // Return payment data for frontend to use Flutterwave inline
    const paymentData = {
      tx_ref: txRef,
      amount,
      currency: 'XAF',
      payment_options: 'mobilemoneycm,mobilemoneyghana,mobilemoneysn',
      customer: {
        email: req.user.email || `${req.user.phone}@africahome.com`,
        phone_number: req.user.phone,
        name: req.user.name
      },
      customizations: {
        title: 'AfricaHome - Paiement',
        description: `Abonnement ${plan} - ${userType}`,
        logo: 'https://africahome.onrender.com/logo.jpg'
      },
      meta: {
        userId: req.user._id.toString(),
        paymentId: payment._id.toString(),
        plan,
        userType
      }
    };

    res.json({ success: true, paymentData, paymentId: payment._id, publicKey: process.env.FLW_PUBLIC_KEY });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/payments/verify
// @desc    Verify payment after Flutterwave callback
router.post('/verify', protect, async (req, res) => {
  try {
    const { transaction_id, tx_ref } = req.body;

    const payment = await Payment.findOne({ flutterwaveRef: tx_ref });
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Paiement introuvable' });
    }

    // Verify with Flutterwave
    const flw = getFlw();
    const response = await flw.Transaction.verify({ id: transaction_id });

    if (response.data.status === 'successful' &&
        response.data.amount >= payment.amount &&
        response.data.currency === 'XAF') {

      payment.status = 'successful';
      payment.flutterwaveTxId = transaction_id;
      payment.paymentMethod = response.data.payment_type;
      await payment.save();

      // Activate subscription or access
      const user = await User.findById(payment.user);
      if (payment.type === 'access') {
        user.accessPaid = true;
      } else {
        const now = new Date();
        let endDate = new Date(now);
        if (payment.plan === 'monthly') endDate.setMonth(endDate.getMonth() + 1);
        else if (payment.plan === 'annual') endDate.setFullYear(endDate.getFullYear() + 1);
        else if (payment.plan === 'weekly') endDate.setDate(endDate.getDate() + 7);

        user.subscription = {
          plan: payment.plan,
          active: true,
          startDate: now,
          endDate
        };
      }
      await user.save();

      res.json({ success: true, message: 'Paiement confirmé !', payment });
    } else {
      payment.status = 'failed';
      await payment.save();
      res.status(400).json({ success: false, message: 'Paiement échoué' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/payments/webhook
// @desc    Flutterwave webhook
router.post('/webhook', async (req, res) => {
  try {
    const hash = req.headers['verif-hash'];
    if (hash !== process.env.FLW_WEBHOOK_HASH) {
      return res.status(401).end();
    }

    const { data } = req.body;
    if (data.status === 'successful') {
      const payment = await Payment.findOne({ flutterwaveRef: data.tx_ref });
      if (payment && payment.status !== 'successful') {
        payment.status = 'successful';
        payment.flutterwaveTxId = data.id.toString();
        payment.paymentMethod = data.payment_type;
        await payment.save();

        const user = await User.findById(payment.user);
        if (payment.type === 'access') {
          user.accessPaid = true;
        } else {
          const now = new Date();
          let endDate = new Date(now);
          if (payment.plan === 'monthly') endDate.setMonth(endDate.getMonth() + 1);
          else if (payment.plan === 'annual') endDate.setFullYear(endDate.getFullYear() + 1);
          else if (payment.plan === 'weekly') endDate.setDate(endDate.getDate() + 7);
          user.subscription = { plan: payment.plan, active: true, startDate: now, endDate };
        }
        await user.save();
      }
    }
    res.status(200).end();
  } catch (error) {
    res.status(500).end();
  }
});

// @route   GET /api/payments/history
// @desc    Get payment history
router.get('/history', protect, async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
