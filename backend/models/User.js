const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['bailleur', 'locataire', 'professionnel', 'admin'],
    required: [true, 'Le type de compte est requis']
  },
  name: {
    type: String,
    required: [true, 'Le nom est requis'],
    trim: true,
    maxlength: 100
  },
  phone: {
    type: String,
    required: [true, 'Le numéro de téléphone est requis'],
    unique: true,
    trim: true
  },
  whatsapp: { type: String, trim: true },
  email: { type: String, trim: true, lowercase: true },
  googleId: { type: String, unique: true, sparse: true },
  password: {
    type: String,
    minlength: 6,
    select: false
  },
  country: { type: String, trim: true },
  city: { type: String, trim: true },
  quarter: { type: String, trim: true },

  // Professional fields
  structureName: { type: String, trim: true },
  niu: { type: String, trim: true }, // Numéro identifiant unique
  representativeName: { type: String, trim: true },
  cniNumber: { type: String, trim: true },
  officialDocUrl: { type: String },
  cniPhotoUrl: { type: String },
  verified: { type: Boolean, default: false },

  // Professional verification workflow
  verificationStatus: {
    type: String,
    enum: ['non_soumis', 'en_attente', 'en_cours', 'approuve', 'rejete', 'info_requise'],
    default: 'non_soumis'
  },
  verificationChecklist: {
    cniPhotoLisible: { type: Boolean, default: false },
    cniNumeroValide: { type: Boolean, default: false },
    niuVerifie: { type: Boolean, default: false },
    docOfficielAuthentique: { type: Boolean, default: false },
    representantCorrespond: { type: Boolean, default: false },
    structureVerifiee: { type: Boolean, default: false }
  },
  verificationHistory: [{
    action: { type: String },
    date: { type: Date, default: Date.now },
    by: { type: String },
    note: { type: String, default: '' }
  }],
  rejectionReason: { type: String, default: '' },

  // Subscription
  subscription: {
    plan: { type: String, enum: ['monthly', 'annual', 'weekly', 'none'], default: 'none' },
    active: { type: Boolean, default: false },
    startDate: { type: Date },
    endDate: { type: Date }
  },

  // Payment history
  paymentHistory: [{
    planId: String,
    amount: Number,
    date: { type: Date, default: Date.now },
    method: { type: String, default: 'selar' },
    reference: { type: String, default: '' }
  }],

  // Locataire access
  accessPaid: { type: Boolean, default: false },

  // Favorites
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Listing' }],

  promoCode: { type: String, unique: true, sparse: true, trim: true },
  referredBy: { type: String, trim: true },

  avatar: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// Hash password before save
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT
UserSchema.methods.getSignedJwt = function() {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

module.exports = mongoose.model('User', UserSchema);
