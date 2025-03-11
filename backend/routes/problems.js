// backend/routes/problems.js
const express = require('express');
const router = express.Router();
const sequelize = require('../database');
const DataTypes = require('sequelize').DataTypes;
const Problem = require('../models/problem')(sequelize, DataTypes);
const codeExecutor = require('../utils/codeExecutor');
const aiEngine = require('../utils/aiEngine');

// ----------------------
// GET /api/problems
// List all problems (excluding the solution field)
router.get('/', async (req, res) => {
  try {
    const problems = await Problem.findAll();
    const sanitized = problems.map(p => {
      const obj = p.toJSON();
      delete obj.solution;
      return obj;
    });
    res.json(sanitized);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------
// GET /api/problems/:id
// Get details of a single problem (excluding the solution field)
router.get('/:id', async (req, res) => {
  try {
    const problem = await Problem.findByPk(req.params.id);
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }
    const obj = problem.toJSON();
    delete obj.solution; // Hide the solution by default
    res.json(obj);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------
// GET /api/problems/:id/solution
// Return ONLY the solution for the specified problem
router.get('/:id/solution', async (req, res) => {
  try {
    const problem = await Problem.findByPk(req.params.id);
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }
    res.json({ solution: problem.solution || "No solution available." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------
// GET /api/problems/:id/aihelp
// Return advanced AI suggestion using problem details and (optionally) user code
router.get('/:id/aihelp', async (req, res) => {
  try {
    const problem = await Problem.findByPk(req.params.id);
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }
    // You can pass user code if available; here we pass an empty string
    const suggestion = await aiEngine.getAdvancedAISuggestion(problem, "");
    res.json({ suggestion });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------
// POST /api/problems/:id/submit
// Submit user code; run it via codeExecutor and check against test cases.
// Tracks anti-cheat via usageData (e.g., { honest: true }).
router.post('/:id/submit', async (req, res) => {
  const { code, language, usageData } = req.body;
  try {
    const problem = await Problem.findByPk(req.params.id);
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }
    // Parse test cases from DB (assumed stored as JSON string)
    let testCases = [];
    try {
      testCases = JSON.parse(problem.testCases);
    } catch (err) {
      return res.status(500).json({ error: 'Invalid test cases in DB' });
    }
    // For demonstration, run only the first test case
    const testCase = testCases[0];
    const input = testCase.input;
    const expected = testCase.expectedOutput;
    
    // Call the real code executor (e.g., Judge0)
    const judge0Response = await codeExecutor.executeCode({ language, code, input });
    const stdout = judge0Response.stdout ? judge0Response.stdout.trim() : "";
    
    // Determine result by comparing output with expected output
    const result = (stdout === expected) ? "Accepted" : "Wrong Answer";
    // Award honest points if usageData indicates no cheating (this is basic; expand as needed)
    const honestPoints = usageData && usageData.honest ? 10 : 0;
    
    res.json({ output: stdout, expected, result, honestPoints });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
