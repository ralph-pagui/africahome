const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Listing = require('../models/Listing');
const Review = require('../models/Review');
const { protect, authorize } = require('../middleware/auth');

// All admin routes require authentication + admin role
router.use(protect, authorize('admin'));

// ============= USERS =============

// @route   GET /api/admin/users
// @desc    Get all users (except admins)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({ type: { $ne: 'admin' } })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/admin/users/:id
// @desc    Get single user details (including doc URLs)
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'Utilisateur introuvable' });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/admin/users/:id/verify
// @desc    Update user verification status (full workflow)
router.put('/users/:id/verify', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'Utilisateur introuvable' });

    const { action, checklist, note } = req.body;

    // If simple toggle (backward compat)
    if (!action) {
      user.verified = !user.verified;
      user.verificationStatus = user.verified ? 'approuve' : 'en_attente';
      await user.save();
      return res.json({ success: true, user: { _id: user._id, verified: user.verified, verificationStatus: user.verificationStatus, name: user.name } });
    }

    // Full workflow actions
    const validActions = ['en_cours', 'approuve', 'rejete', 'info_requise', 'en_attente'];
    if (!validActions.includes(action)) {
      return res.status(400).json({ success: false, message: 'Action invalide' });
    }

    user.verificationStatus = action;

    if (action === 'approuve') {
      user.verified = true;
      user.rejectionReason = '';
    } else if (action === 'rejete') {
      user.verified = false;
      user.rejectionReason = note || 'Documents non conformes';
    } else if (action === 'info_requise') {
      user.verified = false;
      user.rejectionReason = note || 'Informations supplémentaires requises';
    } else {
      user.verified = false;
    }

    // Update checklist if provided
    if (checklist && typeof checklist === 'object') {
      Object.keys(checklist).forEach(key => {
        if (user.verificationChecklist && key in user.verificationChecklist) {
          user.verificationChecklist[key] = !!checklist[key];
        }
      });
      user.markModified('verificationChecklist');
    }

    // Add to history
    if (!user.verificationHistory) user.verificationHistory = [];
    user.verificationHistory.push({
      action,
      date: new Date(),
      by: req.user.name || 'Admin',
      note: note || ''
    });

    await user.save();
    res.json({ success: true, user: { _id: user._id, verified: user.verified, verificationStatus: user.verificationStatus, name: user.name } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/admin/users/:id/activate-subscription
// @desc    Manually activate user's subscription
router.put('/users/:id/activate-subscription', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'Utilisateur introuvable' });

    const { planId } = req.body;
    const PLANS = {
      'locataire-access': { name: 'Accès Locataire', price: 1500, type: 'one-time' },
      'bailleur-monthly': { name: 'Bailleur Mensuel', price: 2500, type: 'monthly', duration: 30 },
      'bailleur-annual': { name: 'Bailleur Annuel', price: 15000, type: 'annual', duration: 365 },
      'pro-monthly': { name: 'Professionnel Mensuel', price: 15000, type: 'monthly', duration: 30 },
      'pro-annual': { name: 'Professionnel Annuel', price: 120000, type: 'annual', duration: 365 }
    };

    if (!planId || !PLANS[planId]) {
      return res.status(400).json({ success: false, message: 'Plan d\'abonnement invalide' });
    }

    const plan = PLANS[planId];
    const now = new Date();

    if (plan.type === 'one-time') {
      user.accessPaid = true;
      user.subscription = {
        plan: 'none',
        active: false
      };
    } else {
      const endDate = new Date(now);
      endDate.setDate(endDate.getDate() + plan.duration);
      user.subscription = {
        plan: plan.type,
        active: true,
        startDate: now,
        endDate
      };
    }

    user.paymentHistory.push({
      planId,
      amount: plan.price,
      date: now,
      method: 'manual_admin'
    });

    await user.save();
    res.json({ success: true, message: 'Abonnement activé manuellement avec succès !', user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete user and all their listings/reviews
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'Utilisateur introuvable' });
    // Delete user's listings
    await Listing.deleteMany({ user: user._id });
    // Delete user's reviews
    await Review.deleteMany({ user: user._id });
    // Delete user
    await user.deleteOne();
    res.json({ success: true, message: 'Utilisateur et données associées supprimés' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============= LISTINGS =============

// @route   GET /api/admin/listings
// @desc    Get all listings (including unavailable)
router.get('/listings', async (req, res) => {
  try {
    const listings = await Listing.find()
      .populate('user', 'name type phone verified')
      .sort({ createdAt: -1 });
    res.json({ success: true, listings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/admin/listings/:id/toggle
// @desc    Toggle listing availability
router.put('/listings/:id/toggle', async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ success: false, message: 'Annonce introuvable' });
    listing.available = !listing.available;
    await listing.save();
    res.json({ success: true, listing: { _id: listing._id, available: listing.available } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/admin/listings/:id
// @desc    Delete any listing
router.delete('/listings/:id', async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ success: false, message: 'Annonce introuvable' });
    await listing.deleteOne();
    res.json({ success: true, message: 'Annonce supprimée' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============= REVIEWS =============

// @route   GET /api/admin/reviews
// @desc    Get all reviews
router.get('/reviews', async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('user', 'name')
      .populate('listing', 'title')
      .sort({ createdAt: -1 });
    res.json({ success: true, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/admin/reviews/:id
// @desc    Delete any review
router.delete('/reviews/:id', async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Avis introuvable' });
    await review.deleteOne();
    res.json({ success: true, message: 'Avis supprimé' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
