const express = require('express');
const router = express.Router();
const {
  saveQuizResult,
  getQuizHistory,
  getQuizHistoryByCategory,
  deleteQuizHistory,
  deleteAllQuizHistory
} = require('../controllers/quizHistoryController');

// Save or update quiz result
router.post('/', saveQuizResult);

// Get all quiz history for a user
router.get('/:userId', getQuizHistory);

// Get quiz history by category
router.get('/:userId/:category', getQuizHistoryByCategory);

// Delete specific quiz history
router.delete('/:id', deleteQuizHistory);

// Delete all quiz history for a user
router.delete('/user/:userId', deleteAllQuizHistory);

module.exports = router;
