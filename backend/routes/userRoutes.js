const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authMiddleware');
const User = require('../models/User');
const QuizResult = require('../models/result');

// Secure route using JWT middleware
router.get('/profile', authenticate, async (req, res) => {
  try {
    // Fix: use _id from token payload
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Fix: use 'user' field instead of 'userId'
    const quizHistory = await QuizResult.find({ user: user._id })
      .sort({ createdAt: -1 }); // Sort by most recent first

    res.json({ user, quizHistory });
  } catch (err) {
    console.error('Profile fetch error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
