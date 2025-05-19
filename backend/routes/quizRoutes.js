const express = require("express");
const router = express.Router();
const quizController = require("../controllers/quizController");
const protect = require("../middleware/authMiddleware");

// 🔹 Save a quiz from UUID (no auth needed for public link sharing)
router.post("/save", quizController.saveQuizWithUUID);

// Create a new quiz (protected)
router.post("/", protect, quizController.createQuiz);

// Get all quizzes (public)
router.get("/", quizController.getAllQuizzes);

// Get quizzes created by logged-in user (protected)
router.get("/my-quizzes", protect, quizController.getUserQuizzes);

// Get a quiz by its UUID (public)
router.get("/shared/:uuid", quizController.getQuizByUUID);

module.exports = router;
