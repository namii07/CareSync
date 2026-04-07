const express = require('express');
const { protect, requireRole } = require('../middleware/auth');
const { generateAccess, getByToken } = require('../controllers/accessController');

const router = express.Router();

router.post('/generate', protect, requireRole('patient'), generateAccess);

// Any authenticated doctor can use a valid access token link
router.get('/:token', protect, getByToken);

module.exports = router;
