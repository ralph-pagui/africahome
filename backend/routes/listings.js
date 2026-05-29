const express = require('express');
const router = express.Router();
const Listing = require('../models/Listing');
const { protect, authorize, requireSubscription } = require('../middleware/auth');
const { validate, createListingRules, updateListingRules } = require('../middleware/validators');
const { param } = require('express-validator');

// @route   GET /api/listings
// @desc    Get all listings with filters
router.get('/', async (req, res) => {
  try {
    const { country, city, quarter, type, category, maxPrice, minPrice, sort, page = 1, limit = 20 } = req.query;
    const query = { available: true };

    if (country) query.country = new RegExp(country, 'i');
    if (city) query.city = new RegExp(city, 'i');
    if (quarter) query.quarter = new RegExp(quarter, 'i');
    if (type) query.type = type;
    if (category) query.category = category;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const sortOptions = sort === 'price_asc' ? { price: 1 } :
                         sort === 'price_desc' ? { price: -1 } :
                         sort === 'views' ? { views: -1 } :
                         { createdAt: -1 };

    const total = await Listing.countDocuments(query);
    const listings = await Listing.find(query)
      .populate('user', 'name type phone whatsapp verified structureName')
      .sort(sortOptions)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({
      success: true,
      count: listings.length,
      total,
      pages: Math.ceil(total / Number(limit)),
      page: Number(page),
      listings
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/listings/countries
// @desc    Get all unique countries and cities
router.get('/locations', async (req, res) => {
  try {
    const countries = await Listing.distinct('country', { available: true });
    const cities = await Listing.distinct('city', { available: true });
    const quarters = await Listing.distinct('quarter', { available: true });
    res.json({ success: true, countries, cities, quarters });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/listings/user/mine
// @desc    Get current user's listings
// NOTE: This route MUST be before /:id to avoid "user" being matched as an id
router.get('/user/mine', protect, async (req, res) => {
  try {
    const listings = await Listing.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: listings.length, listings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/listings/:id
// @desc    Get single listing
router.get('/:id', async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate('user', 'name type phone whatsapp verified structureName avatar');
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Annonce introuvable' });
    }
    // Increment views
    listing.views += 1;
    await listing.save();
    res.json({ success: true, listing });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/listings
// @desc    Create listing (bailleur/pro only)
router.post('/', protect, authorize('bailleur', 'professionnel'), requireSubscription, createListingRules, validate, async (req, res) => {
  try {
    req.body.user = req.user._id;
    req.body.contactPhone = req.body.contactPhone || req.user.phone;
    req.body.contactWhatsapp = req.body.contactWhatsapp || req.user.whatsapp;
    const listing = await Listing.create(req.body);
    res.status(201).json({ success: true, listing });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/listings/:id
// @desc    Update listing
router.put('/:id', protect, updateListingRules, validate, async (req, res) => {
  try {
    let listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ success: false, message: 'Annonce introuvable' });
    if (listing.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Non autorisé' });
    }
    req.body.updatedAt = Date.now();
    listing = await Listing.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, listing });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/listings/:id
// @desc    Delete listing
router.delete('/:id', protect, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ success: false, message: 'Annonce introuvable' });
    if (listing.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Non autorisé' });
    }
    await listing.deleteOne();
    res.json({ success: true, message: 'Annonce supprimée' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


module.exports = router;
