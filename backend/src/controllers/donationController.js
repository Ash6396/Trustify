const { body, validationResult } = require('express-validator');
const { ApiError } = require('../utils/errors');
const { asyncHandler } = require('../utils/asyncHandler');
const Campaign = require('../models/Campaign');
const Donation = require('../models/Donation');

const donateValidators = [
  body('campaignId').isString().trim().isLength({ min: 1 }),
  body('amountEth').isFloat({ gt: 0 }),
  body('txHash').optional().isString().trim().isLength({ min: 10, max: 120 }),
  body('donorAddress').optional().isString().trim().isLength({ min: 4, max: 80 })
];

const createDonation = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) throw new ApiError(400, 'Validation failed', errors.array());

  const { campaignId, amountEth, txHash, donorAddress } = req.body;
  const campaign = await Campaign.findById(campaignId);
  if (!campaign) throw new ApiError(404, 'Campaign not found');
  if (!campaign.approved) throw new ApiError(403, 'Campaign not approved');

  const donation = await Donation.create({
    campaign: campaign._id,
    donor: req.user ? req.user._id : null,
    donorAddress: donorAddress || null,
    amountEth: Number(amountEth),
    txHash: txHash || null
  });

  res.status(201).json({ donation });
});

module.exports = { createDonation, donateValidators };
