const { validationResult, body } = require('express-validator');
const { ApiError } = require('../utils/errors');
const { asyncHandler } = require('../utils/asyncHandler');
const User = require('../models/User');
const { sanitizeUser } = require('./authController');

const profileValidators = [
  body('name').optional().isString().trim().isLength({ min: 2, max: 80 })
];

const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-passwordHash');
  if (!user) throw new ApiError(404, 'User not found');
  res.json({ user: sanitizeUser(user) });
});

const updateProfile = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) throw new ApiError(400, 'Validation failed', errors.array());

  const update = {};
  if (typeof req.body.name === 'string') update.name = req.body.name;

  const user = await User.findByIdAndUpdate(req.user._id, update, { new: true }).select('-passwordHash');
  if (!user) throw new ApiError(404, 'User not found');
  res.json({ user: sanitizeUser(user) });
});

module.exports = { getProfile, updateProfile, profileValidators };
