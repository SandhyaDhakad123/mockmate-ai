const mongoose = require('mongoose');

const codingInterviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  language: { type: String, enum: ['javascript', 'python', 'java'], default: 'javascript' },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  
  problemTitle: String,
  problemStatement: String,
  constraints: [String],
  examples: [{ input: String, output: String, explanation: String }],
  
  submittedCode: { type: String, default: '' },
  
  // AI Evaluation
  logicScore: { type: Number, default: 0 },
  complexityScore: { type: Number, default: 0 },
  qualityScore: { type: Number, default: 0 },
  totalScore: { type: Number, default: 0 },
  
  bugDetection: String,
  timeComplexity: String,
  spaceComplexity: String,
  aiReview: String,
  suggestions: [String],
  
  status: { type: String, enum: ['in-progress', 'completed'], default: 'in-progress' },
  createdAt: { type: Date, default: Date.now, index: true }
});

module.exports = mongoose.model('CodingInterview', codingInterviewSchema);
