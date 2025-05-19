const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionIndex: {
    type: Number,
    required: true
  },
  selectedAnswer: {
    type: String,
    required: true
  }
});

const resultSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  topic: {
    type: String,
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
  totalQuestions: {
    type: Number,
    required: true,
  },
  answers: [answerSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// ✅ Check if model already exists before creating it
const Result = mongoose.models.Result || mongoose.model('Result', resultSchema);

module.exports = Result;
