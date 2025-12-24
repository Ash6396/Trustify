const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { ApiError } = require('../utils/errors');
const User = require('../models/User');

async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      throw new ApiError(401, 'Unauthorized');
    }

    const token = header.slice('Bearer '.length).trim();
    const decoded = jwt.verify(token, env.JWT_SECRET);

    const user = await User.findById(decoded.sub).select('-passwordHash');
    if (!user) throw new ApiError(401, 'Unauthorized');

    req.user = user;
    next();
  } catch (e) {
    next(e instanceof ApiError ? e : new ApiError(401, 'Unauthorized'));
  }
}

async function optionalAuth(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) return next();

    const token = header.slice('Bearer '.length).trim();
    const decoded = jwt.verify(token, env.JWT_SECRET);
    const user = await User.findById(decoded.sub).select('-passwordHash');
    if (user) req.user = user;
    return next();
  } catch {
    return next();
  }
}

function requireRole(...roles) {
  return function roleMiddleware(req, res, next) {
    if (!req.user) return next(new ApiError(401, 'Unauthorized'));
    if (!roles.includes(req.user.role)) return next(new ApiError(403, 'Forbidden'));
    next();
  };
}

module.exports = { requireAuth, optionalAuth, requireRole };
