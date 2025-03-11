// backend/routes/challenge.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'secret_key';
const sequelize = require('../database');
const DataTypes = require('sequelize').DataTypes;
const Submission = require('../models/submission')(sequelize, DataTypes);
// Dummy AI: use our aiEngine below
const aiEngine = require('../utils/aiEngine');

// Middleware for authentication
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// GET challenge problems (sample 30 problems)
router.get('/', (req, res) => {
  // Generate 30 dummy problems with id, title, difficulty, description, and testCases (JSON string)
  const problems = [];
  for (let i = 1; i <= 30; i++) {
    let difficulty = 'easy';
    if (i > 10 && i <= 20) difficulty = 'medium';
    if (i > 20) difficulty = 'hard';
    // For the first problem, include a sum challenge with test cases.
    let testCases = '[]';
    if (i === 1) {
      testCases = JSON.stringify([{ input: "2 3", expectedOutput: "5" }]);
    } else {
      testCases = JSON.stringify([{ input: "sample input", expectedOutput: "sample output" }]);
    }
    problems.push({
      id: i,
      title: `Problem ${i}: ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Challenge`,
      description: `Solve challenge number ${i}.`,
      difficulty,
      testCases
    });
  }
  res.json(problems);
});

// Secure submission endpoint with tracking for honest points and AI recommendations
router.post('/submit', authenticateToken, async (req, res) => {
  const { problemId, code, usageData, language } = req.body;
  // For problem 1, if the user asks for AI assistance, call the dummy AI engine.
  let aiRecommendation = null;
  if (problemId === 1) {
    aiRecommendation = await aiEngine.getRecommendation("sum", code);
  }
  try {
    await Submission.create({
      code,
      problemId,
      userId: req.user.userId,
      result: 'Accepted'
    });
    res.json({ 
      message: 'Submission received!', 
      result: 'Accepted', 
      honestPoints: usageData && usageData.honest ? 10 : 0,
      aiRecommendation
    });
  } catch (error) {
    res.status(500).json({ error: 'Submission failed' });
  }
});

module.exports = router;
