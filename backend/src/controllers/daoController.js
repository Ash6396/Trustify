const { body, validationResult } = require('express-validator');
const { ApiError } = require('../utils/errors');
const { asyncHandler } = require('../utils/asyncHandler');
const Report = require('../models/Report');

const voteValidators = [
  body('campaignId').isString().trim().isLength({ min: 1 }),
  body('support').isBoolean()
];

const vote = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) throw new ApiError(400, 'Validation failed', errors.array());

  const { campaignId, support } = req.body;
  const record = await Report.create({
    type: 'daoVote',
    user: req.user._id,
    payload: { campaignId, support }
  });

  res.status(201).json({ vote: record });
});

module.exports = { vote, voteValidators };
