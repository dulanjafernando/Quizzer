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

router.route('/').get(getAllMCQs).post(createMCQ);
router.route('/category/:category').get(getMCQsByCategory);
router.route('/:id').get(getMCQById).put(updateMCQ).delete(deleteMCQ);

module.exports = router;
