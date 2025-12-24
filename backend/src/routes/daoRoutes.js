const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { vote, voteValidators } = require('../controllers/daoController');

const router = express.Router();

router.post('/vote', requireAuth, voteValidators, vote);

module.exports = router;
