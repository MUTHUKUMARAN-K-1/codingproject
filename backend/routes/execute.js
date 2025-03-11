// backend/routes/execute.js
const express = require('express');
const router = express.Router();
const codeExecutor = require('../utils/codeExecutor');

router.post('/', async (req, res) => {
  const { language, code, input } = req.body;
  try {
    const output = await codeExecutor.executeCode({ language, code, input });
    res.json({ output });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
