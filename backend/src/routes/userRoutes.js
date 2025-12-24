const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { getProfile, updateProfile, profileValidators } = require('../controllers/userController');

const router = express.Router();

router.get('/profile', requireAuth, getProfile);
router.put('/profile', requireAuth, profileValidators, updateProfile);

module.exports = router;
