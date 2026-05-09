const express = require('express');
const router = express.Router();
const { getSummary, getAllStats } = require('../controllers/analyticsController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

router.get('/summary', authMiddleware, getSummary);
router.get('/admin/all', authMiddleware, adminMiddleware, getAllStats);

module.exports = router;
