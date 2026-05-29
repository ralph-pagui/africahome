const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Listing = require('../models/Listing');
const Review = require('../models/Review');
const { protect } = require('../middleware/auth');
const { validate, reviewRules } = require('../middleware/validators');

// ============= FAVORITES =============

// @route   GET /api/favorites
// @desc    Get user favorites
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'favorites',
      populate: { path: 'user', select: 'name type phone whatsapp verified' }
    });
    res.json({ success: true, favorites: user.favorites || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/favorites/:listingId
// @desc    Toggle favorite
router.post('/:listingId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const listingId = req.params.listingId;
    const idx = user.favorites.indexOf(listingId);

    if (idx > -1) {
      user.favorites.splice(idx, 1);
      await user.save();
      res.json({ success: true, favorited: false, message: 'Retiré des favoris' });
    } else {
      user.favorites.push(listingId);
      await user.save();
      res.json({ success: true, favorited: true, message: 'Ajouté aux favoris' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============= REVIEWS =============

// @route   GET /api/favorites/reviews/:listingId
// @desc    Get reviews for a listing
router.get('/reviews/:listingId', async (req, res) => {
  try {
    const reviews = await Review.find({ listing: req.params.listingId })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });
    const avg = reviews.length > 0
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : 0;
    res.json({ success: true, reviews, averageRating: Number(avg), count: reviews.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/favorites/reviews
// @desc    Add a review
router.post('/reviews', protect, reviewRules, validate, async (req, res) => {
  try {
    const { listingId, rating, comment } = req.body;
    const listing = await Listing.findById(listingId);
    if (!listing) return res.status(404).json({ success: false, message: 'Annonce introuvable' });

    // Check if already reviewed
    const existing = await Review.findOne({ user: req.user._id, listing: listingId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Vous avez déjà noté cette annonce' });
    }

    const review = await Review.create({
      user: req.user._id,
      listing: listingId,
      targetUser: listing.user,
      rating,
      comment
    });

    res.status(201).json({ success: true, review });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
