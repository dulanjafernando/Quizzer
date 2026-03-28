const express = require('express');
const router = express.Router();

const {
  saveQuizResult,
  getQuizHistory,
  getQuizHistoryByCategory,
  deleteQuizHistory,
  deleteAllQuizHistory
} = require('../controllers/quizHistoryController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');

// Debug endpoints - must come BEFORE generic /:userId routes to avoid conflicts
router.get('/attempt/:id', async (req, res) => {
  try {
    const QuizHistory = require('../models/QuizHistory');
    const result = await QuizHistory.findById(req.params.id);
    if (!result) return res.status(404).json({ message: 'Quiz attempt not found' });
    res.json(result);
  } catch (error) {
    console.error('[QuizHistory] Error fetching attempt by ID:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/debug/all', async (req, res) => {
  try {
    const QuizHistory = require('../models/QuizHistory');
    const all = await QuizHistory.find().sort({ submittedAt: -1 });
    console.log('[DEBUG] Total records in database:', all.length);
    
    const summary = {
      total: all.length,
      byCategory: {},
      byUserId: {},
      records: all.map(r => {
        const category = r.category;
        const userId = r.userId;
        if (!summary.byCategory[category]) summary.byCategory[category] = 0;
        if (!summary.byUserId[userId]) summary.byUserId[userId] = 0;
        summary.byCategory[category]++;
        summary.byUserId[userId]++;
        
        return {
          _id: r._id,
          userId: r.userId,
          userRef: r.userRef,
          userName: r.userName,
          category: r.category,
          score: r.score,
          totalQuestions: r.totalQuestions,
          percentage: r.percentage,
          passed: r.passed,
          submittedAt: r.submittedAt,
          createdAt: r.createdAt
        };
      })
    };
    
    console.log('[DEBUG] Summary:', JSON.stringify(summary, null, 2));
    res.json(summary);
  } catch (error) {
    console.error('[DEBUG] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/debug/user/:userId', async (req, res) => {
  try {
    const QuizHistory = require('../models/QuizHistory');
    const { userId } = req.params;
    
    // Try to find by userId string first
    let records = await QuizHistory.find({ userId }).sort({ submittedAt: -1 });
    console.log(`[DEBUG] Found ${records.length} records for userId string: ${userId}`);
    
    // If not found and looks like ObjectId, try by userRef
    if (records.length === 0 && userId.match(/^[0-9a-fA-F]{24}$/)) {
      records = await QuizHistory.find({ userRef: userId }).sort({ submittedAt: -1 });
      console.log(`[DEBUG] Found ${records.length} records for userRef ObjectId: ${userId}`);
    }
    
    res.json({
      userId,
      total: records.length,
      records: records.map(r => ({
        _id: r._id,
        category: r.category,
        score: r.score,
        totalQuestions: r.totalQuestions,
        percentage: r.percentage,
        passed: r.passed,
        submittedAt: r.submittedAt
      }))
    });
  } catch (error) {
    console.error('[DEBUG] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Save or update quiz result (optional auth: will tie history to user if token provided)
router.post('/', optionalAuth, saveQuizResult);

// Get all quiz history for a user (optional auth: supports 'me' endpoint for authenticated users)
router.get('/:userId', optionalAuth, getQuizHistory);

// Get quiz history by category (optional auth: supports 'me' endpoint for authenticated users)
router.get('/:userId/:category', optionalAuth, getQuizHistoryByCategory);

// Delete specific quiz history (protected)
router.delete('/:id', protect, deleteQuizHistory);

// Delete all quiz history for a user (protected for 'me')
router.delete('/user/:userId', protect, deleteAllQuizHistory);

module.exports = router;
