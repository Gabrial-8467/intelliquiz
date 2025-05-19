const express = require('express');
const router = express.Router();
const resultController = require('../controllers/resultController');
const authenticate = require('../middleware/authMiddleware');

// Save quiz result (protected route)
router.post('/', authenticate, resultController.submitResult);

// Get user's quiz results (protected route)
router.get('/user', authenticate, resultController.getUserResults);

// Get results for a specific topic (public route)
router.get('/topic/:topic', resultController.getTopicResults);

module.exports = router;
