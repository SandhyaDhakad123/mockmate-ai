const Interview = require('../models/Interview');
const Resume = require('../models/Resume');
const aiService = require('../services/aiService');

const startInterview = async (req, res) => {
  try {
    const { role, difficulty = 'medium', company = 'General' } = req.body;
    if (!role) return res.status(400).json({ message: 'Role is required' });

    // Get user's skills from resume
    const resume = await Resume.findOne({ userId: req.user.id });
    const skills = resume?.skills || [];

    // Generate questions via Gemini
    const questionTexts = await aiService.generateInterviewQuestions(role, skills, difficulty, company);

    const questions = questionTexts.map(q => ({ question: q }));

    const interview = await Interview.create({
      userId: req.user.id,
      role,
      company,
      difficulty,
      questions,
      maxScore: questions.length * 10
    });

    res.status(201).json({
      success: true,
      data: interview
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const submitAnswer = async (req, res) => {
  try {
    const { interviewId, questionIndex, answer, emotions = [] } = req.body;
    if (interviewId === undefined || questionIndex === undefined)
      return res.status(400).json({ message: 'interviewId and questionIndex required' });

    const interview = await Interview.findOne({ _id: interviewId, userId: req.user.id });
    if (!interview) return res.status(404).json({ message: 'Interview not found' });
    if (interview.status === 'completed') return res.status(400).json({ message: 'Interview already completed' });

    const q = interview.questions[questionIndex];
    if (!q) return res.status(400).json({ message: 'Invalid question index' });

    // Evaluate with Gemini
    const evaluation = await aiService.evaluateInterviewAnswer(q.question, answer, interview.role);

    interview.questions[questionIndex].answer = answer;
    interview.questions[questionIndex].score = evaluation.score || 0;
    interview.questions[questionIndex].feedback = evaluation.feedback || '';
    interview.questions[questionIndex].followUp = evaluation.followUp || '';
    interview.questions[questionIndex].emotions = emotions;

    await interview.save();

    res.json({
      success: true,
      data: {
        score: evaluation.score,
        feedback: evaluation.feedback,
        followUp: evaluation.followUp
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const finishInterview = async (req, res) => {
  try {
    const { interviewId } = req.body;
    const interview = await Interview.findOne({ _id: interviewId, userId: req.user.id });
    if (!interview) return res.status(404).json({ message: 'Interview not found' });

    // Calculate total score
    const totalScore = interview.questions.reduce((sum, q) => sum + (q.score || 0), 0);
    interview.totalScore = totalScore;

    // Generate overall feedback report
    const report = await aiService.generateFinalReport(
      interview.role,
      interview.questions,
      totalScore,
      interview.maxScore
    );

    interview.overallFeedback = report.overallFeedback || '';
    interview.communicationScore = report.communicationScore || 0;
    interview.confidenceScore = report.confidenceScore || 0;
    interview.technicalScore = report.technicalScore || 0;
    interview.behavioralAnalysis = report.behavioralAnalysis || '';
    interview.strengths = report.strengths || [];
    interview.weaknesses = report.weaknesses || [];
    interview.recommendations = report.recommendations || [];
    interview.status = 'completed';

    await interview.save();

    res.json({
      success: true,
      data: interview
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getHistory = async (req, res) => {
  try {
    const interviews = await Interview.find({ userId: req.user.id, status: 'completed' })
      .sort({ createdAt: -1 })
      .select('-questions.answer -questions.followUp');
    res.json({ success: true, data: interviews });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getInterview = async (req, res) => {
  try {
    const interview = await Interview.findOne({ _id: req.params.id, userId: req.user.id });
    if (!interview) return res.status(404).json({ message: 'Interview not found' });
    res.json({ success: true, data: interview });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { startInterview, submitAnswer, finishInterview, getHistory, getInterview };
