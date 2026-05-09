const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

/**
 * Enterprise Reliability Utilities
 */
const safeParseJSON = (text, fallback = null) => {
  try {
    // 1. Strip potential markdown code blocks
    let cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    // 2. Extract JSON structure (handle case where AI adds preamble)
    const jsonMatch = cleaned.match(/[\{\[]([\s\S]*?)[\}\]]/);
    if (jsonMatch) cleaned = jsonMatch[0];
    
    return JSON.parse(cleaned);
  } catch (err) {
    console.warn("AI JSON Parse Warning: Falling back to safe defaults", err);
    return fallback;
  }
};

// Simple In-memory Cache for expensive AI operations
const aiCache = new Map();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

const getCachedResult = (key) => {
  const cached = aiCache.get(key);
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) return cached.value;
  return null;
};

const setCachedResult = (key, value) => {
  aiCache.set(key, { value, timestamp: Date.now() });
};

const generateQuestions = async (role, skills, difficulty = 'medium', company = 'General') => {
  try {
    const skillList = skills.length > 0 ? skills.join(', ') : 'general programming';
    const prompt = `You are an expert technical interviewer at ${company}. Generate exactly 8 interview questions for a ${role} position.
Candidate skills from resume: ${skillList}
Difficulty level: ${difficulty}

Rules:
- Mix technical, behavioral, and ${company}-specific culture questions
- Make questions relevant to the skills listed
- Include at least 2 practical/scenario-based questions
- Return ONLY a valid JSON array of strings, no explanation

Example format:
["Question 1?", "Question 2?", "Question 3?"]`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    return safeParseJSON(text, ["Tell me about your experience with modern web frameworks.", "How do you handle state management?", "Describe a challenging bug you fixed."]);
  } catch (err) {
    console.error("Gemini API Error (Questions):", err.message);
    return ["Tell me about your experience with modern web frameworks.", "How do you handle state management?", "Describe a challenging bug you fixed.", "How do you optimize web performance?", "Explain your favorite project.", "What is your testing strategy?", "How do you handle conflict in a team?", "Where do you see yourself in 5 years?"];
  }
};

const evaluateAnswer = async (question, answer, role) => {
  if (!answer || answer.trim().length < 5) {
    return {
      score: 0,
      feedback: 'No answer provided. Please attempt every question.',
      followUp: `Can you try to answer: ${question}`
    };
  }

  try {
    const prompt = `You are an expert ${role} interviewer evaluating a candidate's answer.

Question: ${question}
Candidate's Answer: ${answer}

Evaluate the answer and respond with ONLY a valid JSON object:
{
  "score": <number from 0-10>,
  "feedback": "<specific feedback on what was good and what was missing>",
  "followUp": "<a follow-up question if the answer was incomplete or shallow, else empty string>"
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    return safeParseJSON(text, {
      score: 5,
      feedback: "Answer recorded. AI evaluation fallback triggered.",
      followUp: "Could you elaborate more on your technical approach?"
    });
  } catch (err) {
    console.error("Gemini API Error (Evaluation):", err.message);
    return {
      score: 5,
      feedback: "Answer recorded. AI evaluation currently unavailable.",
      followUp: "Please proceed to the next question."
    };
  }
};

const generateFeedbackReport = async (role, questionsAndAnswers, totalScore, maxScore) => {
  const percentage = Math.round((totalScore / maxScore) * 100);
  const qaText = questionsAndAnswers.map((q, i) => 
    `Q${i+1}: ${q.question}\nAnswer: ${q.answer || 'Not answered'}\nScore: ${q.score}/10`
  ).join('\n\n');

  try {
    const prompt = `You are an expert career coach reviewing a mock interview for a ${role} position.

Interview Results (${percentage}% - ${totalScore}/${maxScore}):
${qaText}

Generate a comprehensive feedback report as ONLY a valid JSON object:
{
  "overallFeedback": "<2-3 sentences summarizing overall performance>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "weaknesses": ["<weakness 1>", "<weakness 2>", "<weakness 3>"],
  "recommendations": ["<recommendation 1>", "<recommendation 2>", "<recommendation 3>", "<recommendation 4>"]
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    return safeParseJSON(text, {
      overallFeedback: "Standard review complete.",
      strengths: ["Communication", "Technical Knowledge"],
      weaknesses: ["Deep Architecture", "Optimizations"],
      recommendations: ["Study system design", "Practice DSA"]
    });
  } catch (err) {
    console.error("Gemini API Error (Report):", err.message);
    return {
      overallFeedback: "Your interview data has been recorded. AI summary is currently processing or unavailable.",
      strengths: ["Consistency", "Participation"],
      weaknesses: ["AI analysis offline"],
      recommendations: ["Keep practicing", "Review your recorded answers"]
    };
  }
};

const parseResume = async (rawText) => {
  try {
    const prompt = `You are an expert HR recruitment system. Analyze the following resume text and extract structured information into a valid JSON object.

Resume Text:
${rawText.substring(0, 8000)}

Rules:
- Be precise. If a field is not found, use an empty string or empty array.
- Extract skills as a flat array of strings.
- Extract technologies as a flat array of strings.
- Format Education, Experience, and Projects exactly as shown below.

Return ONLY a valid JSON object with this structure:
{
  "skills": ["string"],
  "technologies": ["string"],
  "education": [{"degree": "string", "institution": "string", "year": "string", "cgpa": "string"}],
  "experience": [{"role": "string", "company": "string", "duration": "string", "description": "string"}],
  "projects": [{"title": "string", "technologies": ["string"], "description": "string"}],
  "certifications": ["string"],
  "achievements": ["string"]
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    return safeParseJSON(text, {
      skills: [],
      technologies: [],
      education: [],
      experience: [],
      projects: [],
      certifications: [],
      achievements: []
    });
  } catch (err) {
    console.error("Gemini API Error (Resume Parsing):", err.message);
    return {
      skills: ["General Tech", "Software Development"],
      technologies: [],
      education: [],
      experience: [],
      projects: [],
      certifications: [],
      achievements: []
    };
  }
};

const calculateATSScore = async (role, resumeData) => {
  try {
    const prompt = `You are an expert ATS (Applicant Tracking System) algorithm. Compare the following resume data against the requirements for a ${role} position.

Resume Data:
${JSON.stringify(resumeData)}

Evaluate the match and return ONLY a valid JSON object:
{
  "atsScore": <number from 0-100>,
  "atsFeedback": "<short paragraph explaining the score and key missing elements>",
  "missingSkills": ["<skill 1>", "<skill 2>"]
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    return safeParseJSON(text, {
      atsScore: 0,
      atsFeedback: "ATS parsing failed. Please check resume structure.",
      missingSkills: []
    });
  } catch (err) {
    console.error("Gemini API Error (ATS):", err.message);
    return {
      atsScore: 70,
      atsFeedback: "Manual evaluation suggested. AI service temporarily unavailable.",
      missingSkills: ["AI Service unavailable"]
    };
  }
};

const generateCodingProblem = async (difficulty = 'medium') => {
  const cacheKey = `coding_problem_${difficulty}`;
  const cached = getCachedResult(cacheKey);
  if (cached) return cached;

  try {
    const prompt = `You are an expert technical interviewer. Generate a ${difficulty} difficulty Data Structures and Algorithms (DSA) problem for a coding interview.

Return ONLY a valid JSON object:
{
  "title": "<problem title>",
  "problemStatement": "<detailed problem description>",
  "constraints": ["<constraint 1>", "<constraint 2>"],
  "examples": [
    { "input": "<example input>", "output": "<example output>", "explanation": "<short explanation>" }
  ]
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const problem = safeParseJSON(text, {
      title: "Algorithmic Challenge",
      problemStatement: "Describe how you would solve a complex problem using standard DSA.",
      constraints: ["Time: O(n)", "Space: O(n)"],
      examples: [{ input: "N/A", output: "N/A", explanation: "Standard assessment" }]
    });
    setCachedResult(cacheKey, problem);
    return problem;
  } catch (err) {
    console.error("Gemini API Error (Coding Problem):", err.message);
    return {
      title: "Two Sum",
      problemStatement: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
      constraints: ["nums.length <= 10^4", "target <= 10^9"],
      examples: [{ input: "nums = [2,7,11,15], target = 9", output: "[0,1]", explanation: "nums[0] + nums[1] == 9" }]
    };
  }
};

const evaluateCode = async (problem, content, language) => {
  try {
    const prompt = `You are an expert senior software engineer and code reviewer. Evaluate the following code submission for a DSA problem.

Problem:
${JSON.stringify(problem)}

Language: ${language}

Submitted Code:
\`\`\`${language}
${content}
\`\`\`

Analyze the code for logic correctness, time/space complexity, and code quality. 
Return ONLY a valid JSON object:
{
  "logicScore": <0-10>,
  "complexityScore": <0-10>,
  "qualityScore": <0-10>,
  "bugDetection": "<description of any logic bugs or edge cases missed>",
  "timeComplexity": "<e.g., O(n log n)>",
  "spaceComplexity": "<e.g., O(n)>",
  "aiReview": "<2-3 sentence summary review>",
  "suggestions": ["<suggestion 1>", "<suggestion 2>"]
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    return safeParseJSON(text, {
      logicScore: 5,
      complexityScore: 5,
      qualityScore: 5,
      bugDetection: "Incomplete analysis due to malformed output.",
      timeComplexity: "O(?)",
      spaceComplexity: "O(?)",
      aiReview: "Evaluation completed with fallback data.",
      suggestions: ["Review standard implementation patterns."]
    });
  } catch (err) {
    console.error("Gemini API Error (Code Evaluation):", err.message);
    return {
      logicScore: 8,
      complexityScore: 8,
      qualityScore: 8,
      bugDetection: "Manual review suggested.",
      timeComplexity: "Analyzed manually",
      spaceComplexity: "Analyzed manually",
      aiReview: "Submission recorded. AI detailed review temporarily offline.",
      suggestions: ["Check your logic against test cases."]
    };
  }
};

module.exports = { 
  generateQuestions, 
  evaluateAnswer, 
  generateFeedbackReport, 
  parseResume, 
  calculateATSScore,
  generateCodingProblem,
  evaluateCode 
};
