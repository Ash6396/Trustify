const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { createDonation, donateValidators } = require('../controllers/donationController');

const router = express.Router();

router.post('/', requireAuth, donateValidators, createDonation);

module.exports = router;
