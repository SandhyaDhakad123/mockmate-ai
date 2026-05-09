const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();
const { startInterview, submitAnswer, finishInterview, getHistory, getInterview } = require('../controllers/interviewController');
const { authMiddleware } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.post('/start', [
  authMiddleware,
  body('role').notEmpty().withMessage('Interview role is required'),
  body('difficulty').optional().isIn(['easy', 'medium', 'hard']).withMessage('Invalid difficulty level'),
  validate
], startInterview);

router.post('/submit-answer', [
  authMiddleware,
  body('interviewId').notEmpty().withMessage('Interview ID is required'),
  body('questionIndex').isInt({ min: 0 }).withMessage('Question index must be a positive integer'),
  body('answer').notEmpty().withMessage('Answer cannot be empty'),
  validate
], submitAnswer);

router.post('/finish', [
  authMiddleware,
  body('interviewId').notEmpty().withMessage('Interview ID is required'),
  validate
], finishInterview);

router.get('/history', authMiddleware, getHistory);

router.get('/:id', [
  authMiddleware,
  param('id').notEmpty().withMessage('Interview ID is required'),
  validate
], getInterview);

module.exports = router;
