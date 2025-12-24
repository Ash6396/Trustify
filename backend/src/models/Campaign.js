const mongoose = require('mongoose');

const CampaignSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, minlength: 3, maxlength: 120 },
    description: { type: String, required: true, trim: true, minlength: 10, maxlength: 4000 },
    imageUrl: { type: String, default: '', trim: true },
    goalAmountEth: { type: Number, required: true, min: 0 },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    approved: { type: Boolean, default: false },
    rejected: { type: Boolean, default: false },
    rejectionReason: { type: String, default: '', trim: true, maxlength: 500 },
    rejectedAt: { type: Date, default: null },
    onChainCampaignId: { type: Number, default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Campaign', CampaignSchema);
