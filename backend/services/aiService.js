const gemini = require('../utils/gemini');

/**
 * AI Service Layer
 * Centralizes all AI-driven business logic for the platform.
 */

const generateInterviewQuestions = async (role, skills, difficulty, company = 'General') => {
  return await gemini.generateQuestions(role, skills, difficulty, company);
};

const evaluateInterviewAnswer = async (question, answer, role) => {
  return await gemini.evaluateAnswer(question, answer, role);
};

const generateFinalReport = async (role, qaPairs, totalScore, maxScore) => {
  return await gemini.generateFeedbackReport(role, qaPairs, totalScore, maxScore);
};

const analyzeResumeData = async (rawText) => {
  return await gemini.parseResume(rawText);
};

const getATSBenchmarking = async (role, resumeData) => {
  return await gemini.calculateATSScore(role, resumeData);
};

const createCodingProblem = async (difficulty) => {
  return await gemini.generateCodingProblem(difficulty);
};

const auditCodeSubmission = async (problem, code, language) => {
  return await gemini.evaluateCode(problem, code, language);
};

module.exports = {
  generateInterviewQuestions,
  evaluateInterviewAnswer,
  generateFinalReport,
  analyzeResumeData,
  getATSBenchmarking,
  createCodingProblem,
  auditCodeSubmission
};
