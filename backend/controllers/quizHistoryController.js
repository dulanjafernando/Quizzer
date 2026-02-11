const QuizHistory = require('../models/QuizHistory');

// @desc    Save quiz result
// @route   POST /api/quiz-history
// @access  Public
const saveQuizResult = async (req, res) => {
  try {
    const { userId, userName, category, totalQuestions, score, percentage, passed, submittedAt, reviewDetails } = req.body;

    // Validate required fields
    if (!category || totalQuestions === undefined || score === undefined || percentage === undefined || passed === undefined) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Check if a result for this category and user already exists
    const existingResult = await QuizHistory.findOne({ userId: userId || 'guest', category });

    if (existingResult) {
      // Update existing result
      existingResult.totalQuestions = totalQuestions;
      existingResult.score = score;
      existingResult.percentage = percentage;
      existingResult.passed = passed;
      existingResult.submittedAt = submittedAt || Date.now();
      existingResult.userName = userName || 'Guest User';
      // Store review details with explanations
      if (reviewDetails && Array.isArray(reviewDetails)) {
        existingResult.reviewDetails = reviewDetails;
      }

      await existingResult.save();
      return res.status(200).json(existingResult);
    } else {
      // Create new result
      const quizHistory = await QuizHistory.create({
        userId: userId || 'guest',
        userName: userName || 'Guest User',
        category,
        totalQuestions,
        score,
        percentage,
        passed,
        submittedAt: submittedAt || Date.now(),
        // Store review details with explanations
        reviewDetails: reviewDetails && Array.isArray(reviewDetails) ? reviewDetails : []
      });

      return res.status(201).json(quizHistory);
    }
  } catch (error) {
    console.error('Error saving quiz result:', error);
    res.status(500).json({ message: 'Server error while saving quiz result', error: error.message });
  }
};

// @desc    Get all quiz history for a user
// @route   GET /api/quiz-history/:userId
// @access  Public
const getQuizHistory = async (req, res) => {
  try {
    const { userId } = req.params;

    const history = await QuizHistory.find({ userId: userId || 'guest' })
      .sort({ submittedAt: -1 });

    res.json(history);
  } catch (error) {
    console.error('Error fetching quiz history:', error);
    res.status(500).json({ message: 'Server error while fetching quiz history', error: error.message });
  }
};

// @desc    Get quiz history by category
// @route   GET /api/quiz-history/:userId/:category
// @access  Public
const getQuizHistoryByCategory = async (req, res) => {
  try {
    const { userId, category } = req.params;

    const history = await QuizHistory.findOne({ userId: userId || 'guest', category });

    if (!history) {
      return res.status(404).json({ message: 'No history found for this category' });
    }

    res.json(history);
  } catch (error) {
    console.error('Error fetching quiz history by category:', error);
    res.status(500).json({ message: 'Server error while fetching quiz history', error: error.message });
  }
};

// @desc    Delete quiz history
// @route   DELETE /api/quiz-history/:id
// @access  Public
const deleteQuizHistory = async (req, res) => {
  try {
    const { id } = req.params;

    const history = await QuizHistory.findById(id);

    if (!history) {
      return res.status(404).json({ message: 'Quiz history not found' });
    }

    await QuizHistory.findByIdAndDelete(id);

    res.json({ message: 'Quiz history deleted successfully', id });
  } catch (error) {
    console.error('Error deleting quiz history:', error);
    res.status(500).json({ message: 'Server error while deleting quiz history', error: error.message });
  }
};

// @desc    Delete all quiz history for a user
// @route   DELETE /api/quiz-history/user/:userId
// @access  Public
const deleteAllQuizHistory = async (req, res) => {
  try {
    const { userId } = req.params;

    await QuizHistory.deleteMany({ userId: userId || 'guest' });

    res.json({ message: 'All quiz history deleted successfully' });
  } catch (error) {
    console.error('Error deleting all quiz history:', error);
    res.status(500).json({ message: 'Server error while deleting quiz history', error: error.message });
  }
};

module.exports = {
  saveQuizResult,
  getQuizHistory,
  getQuizHistoryByCategory,
  deleteQuizHistory,
  deleteAllQuizHistory
};
