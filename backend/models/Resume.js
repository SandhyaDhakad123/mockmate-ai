const mongoose = require('mongoose');

const educationSchema = new mongoose.Schema({
  degree: String,
  institution: String,
  year: String,
  cgpa: String
});

const experienceSchema = new mongoose.Schema({
  role: String,
  company: String,
  duration: String,
  description: String
});

const projectSchema = new mongoose.Schema({
  title: String,
  technologies: [String],
  description: String
});

const resumeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  fileName: { type: String },
  skills: [String],
  technologies: [String],
  education: [educationSchema],
  experience: [experienceSchema],
  projects: [projectSchema],
  certifications: [String],
  achievements: [String],
  rawText: { type: String },
  atsScore: { type: Number, default: 0 },
  atsFeedback: { type: String, default: '' },
  uploadedAt: { type: Date, default: Date.now, index: true }
});

module.exports = mongoose.model('Resume', resumeSchema);
