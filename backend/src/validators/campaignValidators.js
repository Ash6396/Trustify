const { body } = require('express-validator');

function isHttpUrl(value) {
  try {
    const u = new URL(value);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

const createCampaignValidator = [
  body('title').isString().trim().isLength({ min: 3, max: 120 }),
  body('description').isString().trim().isLength({ min: 10, max: 4000 }),
  body('imageUrl')
    .optional({ checkFalsy: true })
    .custom((value) => {
      if (typeof value !== 'string') return false;
      const url = value.trim();
      if (!url) return true;
      if (url.startsWith('ipfs://') || url.startsWith('ar://')) return true;
      return isHttpUrl(url);
    }),
  body('goalAmountEth').isFloat({ min: 0 }),
  body('onChainCampaignId').optional().isInt({ min: 0 })
];

module.exports = { createCampaignValidator };
