const express = require('express');
const router = express.Router();
const Result = require('../models/Result');
const authenticate = require('../middleware/authMiddleware'); // JWT auth middleware

// Save quiz result
router.post('/submit', authenticate, async (req, res) => {
  try {
    const { topic, score, total } = req.body;

    const result = new Result({
      user: req.user._id,
      topic,
      score,
      total,
    });

    await result.save();
    res.status(201).json({ message: 'Result saved successfully', result });
  } catch (error) {
    console.error('Error saving result:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
