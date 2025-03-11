// backend/routes/skills.js
const express = require('express');
const router = express.Router();
const sequelize = require('../database');
const DataTypes = require('sequelize').DataTypes;
const Skill = require('../models/skill')(sequelize, DataTypes);
const aiEngine = require('../utils/aiEngine');

// Get all skills
router.get('/', async (req, res) => {
  try {
    const skills = await Skill.findAll();
    res.json(skills);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch skills' });
  }
});

// Get roadmap recommendations based on user input
router.post('/recommend', async (req, res) => {
  const { known, desired } = req.body; // e.g., { known: "loops, arrays", desired: "dynamic programming" }
  try {
    const recommendation = await aiEngine.getRoadmapRecommendation(known, desired);
    res.json({ recommendation });
  } catch (err) {
    res.status(500).json({ error: 'Recommendation failed', details: err.message });
  }
});

module.exports = router;
