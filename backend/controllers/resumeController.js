const Resume = require('../models/Resume');
const pdfParse = require('pdf-parse');
const fs = require('fs');
const aiService = require('../services/aiService');

const uploadResume = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    if (req.file.size === 0) {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: 'Uploaded file is empty' });
    }

    const dataBuffer = fs.readFileSync(req.file.path);
    if (!dataBuffer || dataBuffer.length === 0) {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: 'Could not read file data' });
    }

    const data = await pdfParse(dataBuffer);
    const rawText = data.text || '';

    if (!rawText.trim()) {
      // If pdf-parse failed to extract text (e.g. image-only PDF), we still continue but with a warning
      console.warn('PDF text extraction yielded empty result. PDF might be image-only.');
    }

    // Advanced AI Parsing
    const parsedData = await aiService.analyzeResumeData(rawText);

    // Clean up uploaded file
    try { fs.unlinkSync(req.file.path); } catch (_) {}

    // Upsert resume for user
    const resume = await Resume.findOneAndUpdate(
      { userId: req.user.id },
      {
        userId: req.user.id,
        fileName: req.file.originalname,
        ...parsedData,
        rawText: rawText.substring(0, 8000),
        uploadedAt: new Date()
      },
      { upsert: true, new: true }
    );

    res.status(201).json({
      success: true,
      message: 'Resume analyzed with Enterprise AI',
      data: resume
    });
  } catch (err) {
    console.error('Resume Upload Error:', err);
    if (req.file?.path && fs.existsSync(req.file.path)) {
      try { fs.unlinkSync(req.file.path); } catch (_) {}
    }
    res.status(500).json({ message: `PDF Processing Error: ${err.message}` });
  }
};

const getResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ userId: req.user.id });
    if (!resume) return res.status(404).json({ message: 'No resume found' });
    res.json({ success: true, data: resume });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getATSScore = async (req, res) => {
  try {
    const { role } = req.body;
    if (!role) return res.status(400).json({ message: 'Target role is required' });

    const resume = await Resume.findOne({ userId: req.user.id });
    if (!resume) return res.status(404).json({ message: 'Upload resume first' });

    const analysis = await aiService.getATSBenchmarking(role, resume);

    // Update resume with latest ATS score for this role
    resume.atsScore = analysis.atsScore;
    resume.atsFeedback = analysis.atsFeedback;
    await resume.save();

    res.json({
      success: true,
      atsScore: analysis.atsScore,
      atsFeedback: analysis.atsFeedback,
      missingSkills: analysis.missingSkills
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { uploadResume, getResume, getATSScore };
