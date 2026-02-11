const MCQ = require('../models/MCQ');

// @desc    Get all MCQs
// @route   GET /api/mcqs
// @access  Public
const getAllMCQs = async (req, res) => {
  try {
    const mcqs = await MCQ.find().sort({ createdAt: -1 });
    res.json(mcqs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get MCQs by category
// @route   GET /api/mcqs/category/:category
// @access  Public
const getMCQsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const mcqs = await MCQ.find({ category });
    
    // Log to verify explanations are included
    console.log(`[Backend] Fetching MCQs for category: ${category}`);
    console.log(`[Backend] Found ${mcqs.length} MCQs`);
    mcqs.forEach((mcq, idx) => {
      console.log(`[Backend] MCQ ${idx + 1}: explanation="${mcq.explanation ? mcq.explanation.substring(0, 40) : 'EMPTY'}"`);
    });
    
    res.json(mcqs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single MCQ
// @route   GET /api/mcqs/:id
// @access  Public
const getMCQById = async (req, res) => {
  try {
    const mcq = await MCQ.findById(req.params.id);
    if (!mcq) {
      return res.status(404).json({ message: 'MCQ not found' });
    }
    res.json(mcq);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new MCQ
// @route   POST /api/mcqs
// @access  Private (Admin)
const createMCQ = async (req, res) => {
  try {
    const { category, question, image, options, correctAnswer, timeLimit, explanation } = req.body;

    // Validation
    if (!category || !question || !options || !correctAnswer) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    if (options.length !== 4) {
      return res.status(400).json({ message: 'Please provide exactly 4 options' });
    }

    if (!options.includes(correctAnswer)) {
      return res.status(400).json({ message: 'Correct answer must be one of the options' });
    }

    const mcq = await MCQ.create({
      category,
      question,
      image: image || null,
      options,
      correctAnswer,
      timeLimit: timeLimit || 60,
      explanation: explanation || null
    });

    res.status(201).json(mcq);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update MCQ
// @route   PUT /api/mcqs/:id
// @access  Private (Admin)
const updateMCQ = async (req, res) => {
  try {
    const { category, question, image, options, correctAnswer, timeLimit, explanation } = req.body;

    const mcq = await MCQ.findById(req.params.id);

    if (!mcq) {
      return res.status(404).json({ message: 'MCQ not found' });
    }

    // Validation
    if (options && options.length !== 4) {
      return res.status(400).json({ message: 'Please provide exactly 4 options' });
    }

    if (correctAnswer && options && !options.includes(correctAnswer)) {
      return res.status(400).json({ message: 'Correct answer must be one of the options' });
    }

    mcq.category = category || mcq.category;
    mcq.question = question || mcq.question;
    mcq.image = image !== undefined ? image : mcq.image;
    mcq.options = options || mcq.options;
    mcq.correctAnswer = correctAnswer || mcq.correctAnswer;
    mcq.timeLimit = timeLimit !== undefined ? timeLimit : mcq.timeLimit;
    mcq.explanation = explanation !== undefined ? explanation : mcq.explanation;

    const updatedMCQ = await mcq.save();

    res.json(updatedMCQ);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete MCQ
// @route   DELETE /api/mcqs/:id
// @access  Private (Admin)
const deleteMCQ = async (req, res) => {
  try {
    const mcq = await MCQ.findById(req.params.id);

    if (!mcq) {
      return res.status(404).json({ message: 'MCQ not found' });
    }

    await mcq.deleteOne();

    res.json({ message: 'MCQ deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllMCQs,
  getMCQsByCategory,
  getMCQById,
  createMCQ,
  updateMCQ,
  deleteMCQ
};
