const mongoose = require('mongoose');

const quizHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      default: 'guest'
    },
    userName: {
      type: String,
      required: true,
      default: 'Guest User'
    },
    category: {
      type: String,
      required: true,
      enum: [
        'Physics',
        'Combined Maths',
        'Biology',
        'Chemistry',
        'Electronics',
        'History',
        'Accounting',
        'Information Technology'
      ]
    },
    totalQuestions: {
      type: Number,
      required: true
    },
    score: {
      type: Number,
      required: true
    },
    percentage: {
      type: Number,
      required: true
    },
    passed: {
      type: Boolean,
      required: true
    },
    submittedAt: {
      type: Date,
      default: Date.now
    },
    reviewDetails: [
      {
        questionId: String,
        question: String,
        options: [String],
        userAnswer: String,
        correctAnswer: String,
        isCorrect: Boolean,
        image: String,
        explanation: String
      }
    ]
  },
  {
    timestamps: true
  }
);

// Index for faster queries
quizHistorySchema.index({ userId: 1, submittedAt: -1 });
quizHistorySchema.index({ category: 1 });

const QuizHistory = mongoose.model('QuizHistory', quizHistorySchema);

module.exports = QuizHistory;
