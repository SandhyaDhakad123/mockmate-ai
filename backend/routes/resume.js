const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { uploadResume, getResume, getATSScore } = require('../controllers/resumeController');
const { authMiddleware } = require('../middleware/auth');
const validate = require('../middleware/validate');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`)
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') cb(null, true);
  else cb(new Error('Only PDF files are allowed'), false);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

router.post('/upload', authMiddleware, upload.single('resume'), uploadResume);
router.get('/', authMiddleware, getResume);

router.post('/ats-score', [
  authMiddleware,
  body('role').notEmpty().withMessage('Target role is required'),
  validate
], getATSScore);

module.exports = router;
