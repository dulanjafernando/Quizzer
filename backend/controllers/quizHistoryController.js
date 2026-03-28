const QuizHistory = require('../models/QuizHistory');

// Helper to normalize user identity from request (auth middleware sets req.user)
const resolveUserIdentity = (req) => {
  if (req.user) {
    return {
      userRef: req.user._id,
      userId: req.user._id.toString(),
      userName: req.user.name || req.user.email || 'User'
    };
  }
  // Fallback to body or guest
  return {
    userRef: null,
    userId: req.body.userId || 'guest',
    userName: req.body.userName || 'Guest User'
  };
};

// @desc    Save quiz result
// @route   POST /api/quiz-history
// @access  Public (but will use authenticated user if available)
const saveQuizResult = async (req, res) => {
  try {
    const { category, totalQuestions, score, percentage, passed, submittedAt, reviewDetails } = req.body;
    const identity = resolveUserIdentity(req);
    const { userRef, userId, userName } = identity;

    console.log('[QuizHistory] POST - Saving NEW quiz attempt');
    console.log('[QuizHistory] POST - Category:', category);
    console.log('[QuizHistory] POST - Score:', score, '/', totalQuestions);
    console.log('[QuizHistory] POST - Percentage:', percentage, '| Passed:', passed);
    console.log('[QuizHistory] POST - User: userId =', userId, ', userName =', userName);

    // Validate required fields
    if (!category || totalQuestions === undefined || score === undefined || percentage === undefined || passed === undefined) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Always create a NEW record for each attempt (don't update existing)
    const payload = {
      userId: userId || 'guest',
      userName: userName || 'Guest User',
      category,
      totalQuestions,
      score,
      percentage,
      passed,
      submittedAt: submittedAt || new Date(),
      reviewDetails: reviewDetails && Array.isArray(reviewDetails) ? reviewDetails : []
    };

    if (userRef) payload.userRef = userRef;

    console.log('[QuizHistory] POST - Creating NEW attempt record');
    const quizHistory = await QuizHistory.create(payload);
    
    console.log('[QuizHistory] POST - ✓ Successfully saved quiz attempt');
    console.log('[QuizHistory] POST - Attempt ID:', quizHistory._id);
    console.log('[QuizHistory] POST - Category:', quizHistory.category);
    console.log('[QuizHistory] POST - Score:', quizHistory.score, '/', quizHistory.totalQuestions);
    console.log('[QuizHistory] POST - Submitted at:', quizHistory.submittedAt);

    return res.status(201).json(quizHistory);
  } catch (error) {
    console.error('[QuizHistory] POST - Error saving quiz result:', error);
    res.status(500).json({ message: 'Server error while saving quiz result', error: error.message });
  }
};

// @desc    Get all quiz history for a user
// @route   GET /api/quiz-history/:userId
// @access  Public
const getQuizHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('[QuizHistory] GET - userId param:', userId);
    console.log('[QuizHistory] GET - req.user:', req.user ? req.user._id : 'not authenticated');

    // If user requests 'me' and is authenticated, use userRef
    if (userId === 'me' && req.user) {
      console.log('[QuizHistory] GET - Using authenticated endpoint (me), searching by userRef:', req.user._id);
      const history = await QuizHistory.find({ userRef: req.user._id }).select('-reviewDetails').sort({ submittedAt: -1 });
      console.log('[QuizHistory] GET - ✓ Found', history.length, 'records for userRef');
      return res.json(history);
    }

    // If userId looks like an ObjectId, treat as userRef
    const isObjectId = userId && userId.match && userId.match(/^[0-9a-fA-F]{24}$/);
    if (isObjectId) {
      console.log('[QuizHistory] GET - Detected ObjectId, searching by userRef:', userId);
      const history = await QuizHistory.find({ userRef: userId }).select('-reviewDetails').sort({ submittedAt: -1 });
      console.log('[QuizHistory] GET - ✓ Found', history.length, 'records for userRef ObjectId');
      return res.json(history);
    }

    console.log('[QuizHistory] GET - Searching by userId string:', userId || 'guest');
    const history = await QuizHistory.find({ userId: userId || 'guest' }).select('-reviewDetails').sort({ submittedAt: -1 });
    console.log('[QuizHistory] GET - ✓ Found', history.length, 'records for userId');
    res.json(history);
  } catch (error) {
    console.error('[QuizHistory] GET - ✗ Error fetching quiz history:', error);
    res.status(500).json({ message: 'Server error while fetching quiz history', error: error.message });
  }
};

// @desc    Get quiz history by category
// @route   GET /api/quiz-history/:userId/:category
// @access  Public
const getQuizHistoryByCategory = async (req, res) => {
  try {
    const { userId, category } = req.params;

    // If user requests 'me' and is authenticated, use userRef
    let query;
    if (userId === 'me' && req.user) {
      query = { userRef: req.user._id, category };
    } else if (userId && userId.match && userId.match(/^[0-9a-fA-F]{24}$/)) {
      query = { userRef: userId, category };
    } else {
      query = { userId: userId || 'guest', category };
    }

    const history = await QuizHistory.find(query).sort({ submittedAt: -1 });

    if (!history || history.length === 0) {
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

    // If history belongs to a user (userRef), ensure requester is that user
    if (history.userRef) {
      if (!req.user) return res.status(401).json({ message: 'Not authorized' });
      if (history.userRef.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to delete this history' });
      }
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

    // If user requests 'me' and is authenticated, delete by userRef
    if (userId === 'me' && req.user) {
      await QuizHistory.deleteMany({ userRef: req.user._id });
      return res.json({ message: 'All quiz history deleted successfully' });
    }

    // If userId looks like ObjectId, treat as userRef
    const isObjectId = userId && userId.match && userId.match(/^[0-9a-fA-F]{24}$/);
    if (isObjectId) {
      await QuizHistory.deleteMany({ userRef: userId });
      return res.json({ message: 'All quiz history deleted successfully' });
    }

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
