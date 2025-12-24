const express = require('express');
const { requireAuth, optionalAuth, requireRole } = require('../middleware/auth');
const { createCampaign, listCampaigns, listMyCampaigns, getCampaignById } = require('../controllers/campaignController');
const { createCampaignValidator } = require('../validators/campaignValidators');

const router = express.Router();

router.post('/', requireAuth, requireRole('creator', 'admin'), createCampaignValidator, createCampaign);
router.get('/', listCampaigns);
router.get('/mine', requireAuth, requireRole('creator', 'admin'), listMyCampaigns);
router.get('/:id', optionalAuth, getCampaignById);

module.exports = router;
