const mongoose = require('mongoose');

const ListingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Le titre est requis'],
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: [true, 'La description est requise'],
    maxlength: 2000
  },
  type: {
    type: String,
    enum: ['chambre', 'studio', 'appartement', 'maison', 'terrain', 'plan3d', 'service'],
    required: [true, 'Le type de bien est requis']
  },
  category: {
    type: String,
    enum: ['location', 'vente', 'terrain', 'construction', 'meuble', 'electromenager', 'decoration'],
    required: [true, 'La catégorie est requise']
  },
  price: {
    type: Number,
    required: [true, 'Le prix est requis']
  },
  currency: {
    type: String,
    default: 'FCFA'
  },
  country: {
    type: String,
    required: [true, 'Le pays est requis'],
    trim: true
  },
  city: {
    type: String,
    required: [true, 'La ville est requise'],
    trim: true
  },
  quarter: { type: String, trim: true },
  distanceRoute: { type: String, trim: true },
  rooms: { type: Number, default: 0 },

  images: [{ type: String }],
  videos: [{ type: String }],

  // Geolocation
  lat: { type: Number },
  lng: { type: Number },

  contactPhone: { type: String, trim: true },
  contactWhatsapp: { type: String, trim: true },

  available: { type: Boolean, default: true },
  views: { type: Number, default: 0 },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Index for search performance
ListingSchema.index({ country: 1, city: 1, category: 1, type: 1 });
ListingSchema.index({ available: 1, createdAt: -1 });

module.exports = mongoose.model('Listing', ListingSchema);
