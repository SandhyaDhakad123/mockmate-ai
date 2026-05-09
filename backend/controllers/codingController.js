const CodingInterview = require('../models/CodingInterview');
const aiService = require('../services/aiService');

const startCodingInterview = async (req, res) => {
  try {
    const { difficulty = 'medium', language = 'javascript' } = req.body;
    
    // AI generates a fresh DSA problem
    const problem = await aiService.createCodingProblem(difficulty);

    const interview = await CodingInterview.create({
      userId: req.user.id,
      language,
      difficulty,
      problemTitle: problem.title,
      problemStatement: problem.problemStatement,
      constraints: problem.constraints,
      examples: problem.examples
    });

    res.status(201).json({
      success: true,
      message: 'Coding interview started',
      data: interview
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const submitCode = async (req, res) => {
  try {
    const { interviewId, code } = req.body;
    if (!interviewId || !code) return res.status(400).json({ message: 'interviewId and code are required' });

    const interview = await CodingInterview.findOne({ _id: interviewId, userId: req.user.id });
    if (!interview) return res.status(404).json({ message: 'Interview session not found' });
    if (interview.status === 'completed') return res.status(400).json({ message: 'Session already completed' });

    // AI evaluation of the code
    const evaluation = await aiService.auditCodeSubmission(
      { title: interview.problemTitle, statement: interview.problemStatement },
      code,
      interview.language
    );

    interview.submittedCode = code;
    interview.logicScore = evaluation.logicScore;
    interview.complexityScore = evaluation.complexityScore;
    interview.qualityScore = evaluation.qualityScore;
    interview.totalScore = Math.round((evaluation.logicScore + evaluation.complexityScore + evaluation.qualityScore) / 3);
    
    interview.bugDetection = evaluation.bugDetection;
    interview.timeComplexity = evaluation.timeComplexity;
    interview.spaceComplexity = evaluation.spaceComplexity;
    interview.aiReview = evaluation.aiReview;
    interview.suggestions = evaluation.suggestions;
    interview.status = 'completed';

    await interview.save();

    res.json({
      success: true,
      message: 'Code submitted and evaluated',
      data: interview
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getCodingHistory = async (req, res) => {
  try {
    const history = await CodingInterview.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json({ success: true, data: history });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getCodingSession = async (req, res) => {
  try {
    const session = await CodingInterview.findOne({ _id: req.params.id, userId: req.user.id });
    if (!session) return res.status(404).json({ message: 'Session not found' });
    res.json({ success: true, data: session });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { startCodingInterview, submitCode, getCodingHistory, getCodingSession };
