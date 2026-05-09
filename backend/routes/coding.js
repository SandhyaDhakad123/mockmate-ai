const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();
const { startCodingInterview, submitCode, getCodingHistory, getCodingSession } = require('../controllers/codingController');
const { authMiddleware } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.post('/start', [
  authMiddleware,
  body('difficulty').optional().isIn(['easy', 'medium', 'hard']),
  body('language').optional().isIn(['javascript', 'python', 'java']),
  validate
], startCodingInterview);

router.post('/submit', [
  authMiddleware,
  body('interviewId').notEmpty().withMessage('Interview ID is required'),
  body('code').notEmpty().withMessage('Code cannot be empty'),
  validate
], submitCode);

router.get('/history', authMiddleware, getCodingHistory);

router.get('/:id', [
  authMiddleware,
  param('id').notEmpty().withMessage('Session ID is required'),
  validate
], getCodingSession);

module.exports = router;
