const mongoose = require('mongoose');
const User = require('./models/User');
const QuizHistory = require('./models/QuizHistory');

// Load env vars
require('dotenv').config();
require('dotenv').config();
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://quizworld:Fdulanja%40123@quiz.m5ith5k.mongodb.net/quizdb?retryWrites=true&w=majority";

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('Connected to DB. Fixing QuizHistory usernames...');
    const users = await User.find({});
    for (let u of users) {
      const res = await QuizHistory.updateMany(
        { $or: [{ userId: u._id.toString() }, { userRef: u._id }] },
        { $set: { userName: u.name } }
      );
      console.log(`Synced user ${u.name} - Updated ${res.modifiedCount || res.nModified || 0} records.`);
    }
    console.log('Done fixing.');
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
