const mongoose = require('mongoose');
const MCQ = require('./models/MCQ');

// Load env vars
require('dotenv').config();
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://quizworld:Fdulanja%40123@quiz.m5ith5k.mongodb.net/quizdb?retryWrites=true&w=majority";

const { seedMCQs } = require('./seeds');

mongoose.connect(MONGODB_URI)
  .then(async () => {
    try {
      console.log('Connected to DB. Clearing MCQ collection...');
      await MCQ.deleteMany({});
      console.log('✓ MCQ collection cleared');
      
      console.log('Reseeding MCQs...');
      await seedMCQs();
      
      console.log('✓ Database reset and reseeded successfully!');
      process.exit(0);
    } catch (error) {
      console.error('Error:', error);
      process.exit(1);
    }
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
