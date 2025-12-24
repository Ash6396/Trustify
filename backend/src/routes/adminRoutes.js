const express = require('express');
const { requireAuth, requireRole } = require('../middleware/auth');
const { listAllCampaigns, approveCampaign, rejectCampaign, deleteCampaign } = require('../controllers/adminController');

const router = express.Router();

router.get('/campaigns', requireAuth, requireRole('admin'), listAllCampaigns);
router.put('/campaigns/:id/approve', requireAuth, requireRole('admin'), approveCampaign);
router.put('/campaigns/:id/reject', requireAuth, requireRole('admin'), rejectCampaign);
router.delete('/campaigns/:id', requireAuth, requireRole('admin'), deleteCampaign);

module.exports = router;
