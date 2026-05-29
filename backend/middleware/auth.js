const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - require authentication
const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      return res.status(401).json({ success: false, message: 'Non autorisé - Token manquant' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Utilisateur introuvable' });
    }
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Token invalide' });
  }
};

// Check user type
const authorize = (...types) => {
  return (req, res, next) => {
    if (!types.includes(req.user.type)) {
      return res.status(403).json({ success: false, message: 'Accès interdit pour votre type de compte' });
    }
    next();
  };
};

// Check active subscription
const requireSubscription = async (req, res, next) => {
  if (req.user.type === 'locataire') {
    if (!req.user.accessPaid) {
      return res.status(403).json({ success: false, message: 'Veuillez payer les frais d\'accès (1 500 FCFA)' });
    }
    return next();
  }
  if (!req.user.subscription || !req.user.subscription.active) {
    return res.status(403).json({ success: false, message: 'Abonnement requis. Veuillez souscrire un abonnement.' });
  }
  if (req.user.subscription.endDate && new Date(req.user.subscription.endDate) < new Date()) {
    await User.findByIdAndUpdate(req.user._id, { 'subscription.active': false });
    return res.status(403).json({ success: false, message: 'Abonnement expiré. Veuillez renouveler.' });
  }
  next();
};

module.exports = { protect, authorize, requireSubscription };
