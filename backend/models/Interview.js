const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: String,
  answer: { type: String, default: '' },
  score: { type: Number, default: 0 },
  feedback: { type: String, default: '' },
  followUp: { type: String, default: '' },
  emotions: [String]
});

const interviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, required: true },
  company: { type: String, default: 'General' },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  questions: [questionSchema],
  totalScore: { type: Number, default: 0 },
  maxScore: { type: Number, default: 0 },
  communicationScore: { type: Number, default: 0 },
  confidenceScore: { type: Number, default: 0 },
  technicalScore: { type: Number, default: 0 },
  overallFeedback: { type: String, default: '' },
  behavioralAnalysis: { type: String, default: '' },
  strengths: [String],
  weaknesses: [String],
  recommendations: [String],
  status: { type: String, enum: ['in-progress', 'completed'], default: 'in-progress' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Interview', interviewSchema);
