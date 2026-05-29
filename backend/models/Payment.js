const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['subscription', 'access'],
    required: true
  },
  plan: { type: String, enum: ['monthly', 'annual', 'weekly', 'one-time'] },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'XAF' },
  paymentMethod: { type: String }, // orange_money, mtn_momo, card
  flutterwaveRef: { type: String },
  flutterwaveTxId: { type: String },
  status: {
    type: String,
    enum: ['pending', 'successful', 'failed', 'cancelled'],
    default: 'pending'
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Payment', PaymentSchema);
