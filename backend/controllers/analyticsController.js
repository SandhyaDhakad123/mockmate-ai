const Interview = require('../models/Interview');
const CodingInterview = require('../models/CodingInterview');
const Resume = require('../models/Resume');

const getSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Fetch all related data
    const [interviews, codingInterviews, resume] = await Promise.all([
      Interview.find({ userId }).sort({ createdAt: -1 }),
      CodingInterview.find({ userId }).sort({ createdAt: -1 }),
      Resume.findOne({ userId })
    ]);

    // Role-wise performance
    const roleStats = {};
    interviews.forEach(interview => {
      const role = interview.role || 'General';
      if (!roleStats[role]) roleStats[role] = { count: 0, totalScore: 0 };
      roleStats[role].count++;
      roleStats[role].totalScore += interview.totalScore;
    });

    const roleData = Object.keys(roleStats).map(role => ({
      role,
      avgScore: Math.round(roleStats[role].totalScore / roleStats[role].count),
      count: roleStats[role].count
    }));

    // Score trends (Last 7 interviews)
    const trendData = interviews.slice(0, 7).reverse().map(i => ({
      date: new Date(i.createdAt).toLocaleDateString(),
      score: i.totalScore,
      codingScore: 0
    }));

    // Weak Topic Analysis — weaknesses is stored at interview root level, not nested
    const weakTopics = [];
    interviews.forEach(i => {
      if (i.weaknesses && Array.isArray(i.weaknesses)) {
        i.weaknesses.forEach(w => {
          if (w && w.length < 50) weakTopics.push(w);
        });
      }
    });

    const uniqueWeaknesses = [...new Set(weakTopics)].slice(0, 5);

    // Role Progression — structured as an object, not an empty array
    const completedInterviews = interviews.filter(i => i.status === 'completed');
    const avgScore = completedInterviews.length
      ? Math.round(completedInterviews.reduce((a, b) => a + b.totalScore, 0) / completedInterviews.length)
      : 0;

    const roleProgression = {
      current: avgScore >= 60 ? 'Mid-Level' : 'Junior',
      next: avgScore >= 60 ? 'Senior' : 'Mid-Level',
      gapSkills: uniqueWeaknesses.length > 0 ? uniqueWeaknesses.slice(0, 4) : ['System Design', 'DSA', 'Architecture']
    };

    // AI-style Learning Roadmap
    const learningRoadmap = uniqueWeaknesses.length > 0 
      ? [
          { step: 1, title: `Basics of ${uniqueWeaknesses[0] || 'Core Concepts'}`, description: "Start with fundamental documentation and basic syntax/rules.", resources: ["Official Docs", "Youtube: 101 Guide"] },
          { step: 2, title: `Intermediate ${uniqueWeaknesses[1] || 'Design Patterns'}`, description: "Focus on common patterns and implementation pitfalls.", resources: ["Medium articles", "Project-based learning"] },
          { step: 3, title: `Deep Dive into ${uniqueWeaknesses[2] || 'Advanced Optimization'}`, description: "Understand time/space complexity and enterprise-level scaling.", resources: ["LeetCode", "System Design Primer"] },
          { step: 4, title: "Mock Simulation", description: "Take a targeted interview specifically on these weak areas.", resources: ["MockMate targeted rounds"] }
        ]
      : [];

    return res.json({
      success: true,
      data: {
        summary: {
          totalInterviews: interviews.length,
          avgInterviewScore: interviews.length ? Math.round(interviews.reduce((a, b) => a + b.totalScore, 0) / interviews.length) : 0,
          totalCoding: codingInterviews.length,
          avgCodingScore: codingInterviews.length ? Math.round(codingInterviews.reduce((a, b) => a + (b.totalScore || 0), 0) / codingInterviews.length) : 0,
          atsScore: resume?.atsScore || 0
        },
        roleData,
        trendData,
        weakTopics: uniqueWeaknesses,
        learningRoadmap,
        roleProgression,
        history: {
          interviews: interviews.slice(0, 10),
          coding: codingInterviews.slice(0, 10)
        }
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAllStats = async (req, res) => {
  try {
    const counts = await Promise.all([
      Interview.countDocuments(),
      CodingInterview.countDocuments(),
      Resume.countDocuments()
    ]);
    res.json({ success: true, counts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getSummary, getAllStats };
