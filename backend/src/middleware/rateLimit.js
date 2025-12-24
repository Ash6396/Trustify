const rateLimit = require('express-rate-limit');

const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = { apiRateLimit };
