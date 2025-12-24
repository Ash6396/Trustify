const { validationResult } = require('express-validator');
const { ApiError } = require('../utils/errors');
const { asyncHandler } = require('../utils/asyncHandler');
const Campaign = require('../models/Campaign');
const User = require('../models/User');

const createCampaign = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) throw new ApiError(400, 'Validation failed', errors.array());

  const { title, description, goalAmountEth, onChainCampaignId, imageUrl } = req.body;
  const creator = await User.findById(req.user._id);
  if (!creator) throw new ApiError(404, 'User not found');

  const campaign = await Campaign.create({
    title,
    description,
    imageUrl: typeof imageUrl === 'string' ? imageUrl.trim() : '',
    goalAmountEth: Number(goalAmountEth),
    creator: creator._id,
    approved: false
  });

  if (typeof onChainCampaignId !== 'undefined' && onChainCampaignId !== null) {
    campaign.onChainCampaignId = Number(onChainCampaignId);
    await campaign.save();
  }

  res.status(201).json({ campaign });
});

const listCampaigns = asyncHandler(async (req, res) => {
  const campaigns = await Campaign.find({ approved: true })
    .populate('creator', 'name email role')
    .sort({ createdAt: -1 });
  res.json({ campaigns });
});

const listMyCampaigns = asyncHandler(async (req, res) => {
  const query = req.user.role === 'admin' ? {} : { creator: req.user._id };
  const campaigns = await Campaign.find(query)
    .populate('creator', 'name email role')
    .sort({ createdAt: -1 });
  res.json({ campaigns });
});

const getCampaignById = asyncHandler(async (req, res) => {
  const campaign = await Campaign.findById(req.params.id).populate('creator', 'name email role');
  if (!campaign) throw new ApiError(404, 'Campaign not found');

  if (!campaign.approved) {
    const isOwner = req.user && String(campaign.creator?._id || campaign.creator) === String(req.user._id);
    const isAdmin = req.user && req.user.role === 'admin';
    if (!isOwner && !isAdmin) throw new ApiError(403, 'Forbidden');
  }

  res.json({ campaign });
});

module.exports = { createCampaign, listCampaigns, listMyCampaigns, getCampaignById };
