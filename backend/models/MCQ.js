const mongoose = require('mongoose');

const mcqSchema = new mongoose.Schema(
  {
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
    question: {
      type: String,
      required: true
    },
    image: {
      type: String,
      required: false,
      default: null
    },
    options: {
      type: [String],
      required: true,
      validate: [arrayLimit, '{PATH} must have exactly 4 options']
    },
    correctAnswer: {
      type: String,
      required: true
    },
    timeLimit: {
      type: Number,
      required: false,
      default: 60
    },
    explanation: {
      type: String,
      required: false,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Add index on category field for faster queries
mcqSchema.index({ category: 1 });

function arrayLimit(val) {
  return val.length === 4;
}

module.exports = mongoose.model('MCQ', mcqSchema);
