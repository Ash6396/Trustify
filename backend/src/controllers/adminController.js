const { ApiError } = require('../utils/errors');
const { asyncHandler } = require('../utils/asyncHandler');
const Campaign = require('../models/Campaign');
const Donation = require('../models/Donation');

const listAllCampaigns = asyncHandler(async (req, res) => {
  const campaigns = await Campaign.find({}).populate('creator', 'name email role').sort({ createdAt: -1 });
  res.json({ campaigns });
});

const approveCampaign = asyncHandler(async (req, res) => {
  const campaign = await Campaign.findById(req.params.id);
  if (!campaign) throw new ApiError(404, 'Campaign not found');
  campaign.approved = true;
  campaign.rejected = false;
  campaign.rejectionReason = '';
  campaign.rejectedAt = null;
  await campaign.save();
  res.json({ campaign });
});

const rejectCampaign = asyncHandler(async (req, res) => {
  const campaign = await Campaign.findById(req.params.id);
  if (!campaign) throw new ApiError(404, 'Campaign not found');

  const reason = typeof req.body?.reason === 'string' ? req.body.reason.trim() : '';
  campaign.approved = false;
  campaign.rejected = true;
  campaign.rejectionReason = reason;
  campaign.rejectedAt = new Date();

  await campaign.save();
  res.json({ campaign });
});

const deleteCampaign = asyncHandler(async (req, res) => {
  const campaign = await Campaign.findById(req.params.id);
  if (!campaign) throw new ApiError(404, 'Campaign not found');

  await Donation.deleteMany({ campaign: campaign._id });
  await campaign.deleteOne();

  res.json({ ok: true });
});

module.exports = { listAllCampaigns, approveCampaign, rejectCampaign, deleteCampaign };
