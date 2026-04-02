const mongoose = require('mongoose');
const MCQ = require('./models/MCQ');

require('dotenv').config();
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
  .then(async () => {
    try {
      const totalMCQs = await MCQ.countDocuments();
      const chemistryMCQs = await MCQ.countDocuments({ category: 'Chemistry' });
      
      console.log(`\n📊 Database Statistics:`);
      console.log(`   Total MCQs: ${totalMCQs}`);
      console.log(`   Chemistry MCQs: ${chemistryMCQs}`);
      
      if (chemistryMCQs > 0) {
        console.log(`\n🧪 Chemistry Questions:`);
        const questions = await MCQ.find({ category: 'Chemistry' }).select('question explanation');
        questions.forEach((q, idx) => {
          console.log(`   ${idx + 1}. ${q.question.substring(0, 50)}...`);
          console.log(`      └─ Explanation: ${q.explanation ? q.explanation.substring(0, 50) + '...' : 'NONE'}`);
        });
      }
      
      process.exit(0);
    } catch (error) {
      console.error('Error:', error);
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('Connection error:', err);
    process.exit(1);
  });
