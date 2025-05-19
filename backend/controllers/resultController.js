const Result = require("../models/Result");
const Quiz = require("../models/Quiz");

// Submit a quiz result
exports.submitResult = async (req, res) => {
  const { score, totalQuestions, topic, answers } = req.body;

  try {
    // Create a result entry for the user
    const result = await Result.create({
      user: req.user._id,
      topic,
      score,
      totalQuestions,
      answers: Object.entries(answers).map(([index, answer]) => ({
        questionIndex: parseInt(index),
        selectedAnswer: answer
      }))
    });

    // Respond with the created result
    res.status(201).json({
      message: "Result saved successfully",
      result
    });
  } catch (err) {
    console.error("Error saving result:", err);
    res.status(500).json({ 
      message: "Failed to save result",
      error: err.message 
    });
  }
};

// Get all results for a specific user
exports.getUserResults = async (req, res) => {
  try {
    // Fetch results for the logged-in user
    const results = await Result.find({ user: req.user._id })
      .sort({ createdAt: -1 });

    // Return the user's quiz results
    res.json(results);
  } catch (err) {
    console.error("Error fetching user results:", err);
    res.status(500).json({ 
      message: "Failed to fetch results",
      error: err.message 
    });
  }
};

// Get results for a specific topic
exports.getTopicResults = async (req, res) => {
  const { topic } = req.params;

  try {
    const results = await Result.find({ topic })
      .populate("user", "name email")
      .sort({ score: -1, createdAt: -1 });

    res.json(results);
  } catch (err) {
    console.error("Error fetching topic results:", err);
    res.status(500).json({ 
      message: "Failed to fetch topic results",
      error: err.message 
    });
  }
};
