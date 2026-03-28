const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const compression = require('compression');
const connectDB = require('./config/db');
const { seedDatabase } = require('./seeds');
const mcqRoutes = require('./routes/mcqRoutes');
const quizHistoryRoutes = require('./routes/quizHistoryRoutes');
const authRoutes = require('./routes/authRoutes');

// Load env vars
dotenv.config();

// Connect to database and seed if needed
const initializeDatabase = async () => {
  await connectDB();
  // Auto-seed database if in development or if collections are empty
  if (process.env.NODE_ENV !== 'production') {
    await seedDatabase();
  }
};

initializeDatabase();

const app = express();

// Middleware
app.use(cors());
app.use(compression()); // Compress all responses for faster transfer
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Add cache headers for GET requests
app.use((req, res, next) => {
  if (req.method === 'GET') {
    res.set('Cache-Control', 'public, max-age=300'); // Cache for 5 minutes
  }
  next();
});

// Routes
app.use('/api/mcqs', mcqRoutes);
app.use('/api/quiz-history', quizHistoryRoutes);
app.use('/api/auth', authRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Quiz API is running...' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
