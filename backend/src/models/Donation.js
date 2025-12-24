const mongoose = require('mongoose');

const DonationSchema = new mongoose.Schema(
  {
    campaign: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
    donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false, default: null },
    donorAddress: { type: String, required: false, default: null },
    amountEth: { type: Number, required: true, min: 0.0000001 },
    txHash: { type: String, required: false, default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Donation', DonationSchema);
