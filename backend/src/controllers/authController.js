const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const env = require('../config/env');
const { ApiError } = require('../utils/errors');
const { asyncHandler } = require('../utils/asyncHandler');
const User = require('../models/User');

function signToken(userId) {
  if (!env.JWT_SECRET) {
    throw new ApiError(503, 'Server not configured: JWT_SECRET is missing');
  }
  return jwt.sign({ sub: userId }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
}

function sanitizeUser(userDoc) {
  const { _id, name, email, role, createdAt, updatedAt } = userDoc;
  return { id: String(_id), name, email, role, createdAt, updatedAt };
}

const signup = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) throw new ApiError(400, 'Validation failed', errors.array());

  const { name, email, password, role } = req.body;
  const existing = await User.findOne({ email: String(email).toLowerCase() });
  if (existing) throw new ApiError(409, 'Email already in use');

  const passwordHash = await bcrypt.hash(String(password), 12);
  const user = await User.create({
    name,
    email: String(email).toLowerCase(),
    passwordHash,
    role: role || 'donor'
  });

  const token = signToken(user._id);
  res.status(201).json({ token, user: sanitizeUser(user) });
});

const login = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) throw new ApiError(400, 'Validation failed', errors.array());

  const { email, password } = req.body;
  const user = await User.findOne({ email: String(email).toLowerCase() });
  if (!user) throw new ApiError(401, 'Invalid credentials');

  const ok = await bcrypt.compare(String(password), user.passwordHash);
  if (!ok) throw new ApiError(401, 'Invalid credentials');

  const token = signToken(user._id);
  res.json({ token, user: sanitizeUser(user) });
});

const me = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, 'Unauthorized');
  res.json({ user: sanitizeUser(req.user) });
});

module.exports = { signup, login, me, sanitizeUser };
