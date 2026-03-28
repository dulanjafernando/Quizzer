const express = require('express');
const router = express.Router();
const {
  getAllMCQs,
  getMCQsByCategory,
  getMCQById,
  createMCQ,
  updateMCQ,
  deleteMCQ
} = require('../controllers/mcqController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(getAllMCQs).post(protect, createMCQ);
router.route('/category/:category').get(getMCQsByCategory);
router.route('/:id').get(getMCQById).put(protect, updateMCQ).delete(protect, deleteMCQ);

module.exports = router;
