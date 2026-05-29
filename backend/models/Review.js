const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
  targetUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, maxlength: 500 },
  createdAt: { type: Date, default: Date.now }
});

ReviewSchema.index({ listing: 1 });
ReviewSchema.index({ targetUser: 1 });
// Prevent duplicate reviews: one review per user per listing
ReviewSchema.index({ user: 1, listing: 1 }, { unique: true });

module.exports = mongoose.model('Review', ReviewSchema);
