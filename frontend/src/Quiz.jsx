import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getMCQsByCategory } from './api/mcqApi'
import { saveQuizResult } from './api/quizHistoryApi'
import './App.css'

function Quiz() {
  const { category } = useParams()
  const navigate = useNavigate()
  const [questions, setQuestions] = useState([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [totalQuizTime, setTotalQuizTime] = useState(0)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [timeExpired, setTimeExpired] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState(0)
  const [hasDetailedAnswers, setHasDetailedAnswers] = useState(true) // Track if we have actual answers
  const [savedDatabaseResult, setSavedDatabaseResult] = useState(null) // Store database result
  const [savedReviewDetails, setSavedReviewDetails] = useState([]) // Store saved review details from database

  useEffect(() => {
    // Always fetch fresh questions when category changes
    fetchQuestions()
  }, [category])

  const fetchQuestions = async () => {
    setLoading(true)
    setError('')
    
    try {
      // OPTIMIZATION: Always fetch fresh questions for new quiz attempts.
      // This allows multiple attempts dynamically.
      console.log('[Frontend] Loading fresh questions for new quiz attempt')
      const freshMCQs = await getMCQsByCategory(category)
      
      console.log('[Frontend] Fresh questions loaded:', freshMCQs.length)
      
      if (freshMCQs.length === 0) {
        setError('No questions available for this category')
        setQuestions([])
        setLoading(false)
        return
      }

      setQuestions(freshMCQs)
      // Recalculate time limit when fetching fresh questions
      const totalTime = freshMCQs.reduce((sum, q) => sum + (q.timeLimit || 60), 0)
      setTotalQuizTime(totalTime)
      
      setAnswers({})
      setScore(0)
      setCurrentQuestionIndex(0)
      setShowResults(false)
      setIsSubmitted(false)
      setTimeExpired(false)
      setHasDetailedAnswers(true)
      
      setLoading(false)
    } catch (error) {
      console.error('Error fetching questions:', error)
      setError('Failed to load questions. Please try again.')
      setLoading(false)
    }
  }

  useEffect(() => {
    // Only run timer for active quizzes, not for showing results
    if (showResults || isSubmitted || !questions || questions.length === 0) {
      return
    }
    
    if (totalQuizTime > 0 && !isSubmitted && !showResults) {
      const interval = setInterval(() => {
        setTotalQuizTime(prev => {
          if (prev <= 1) {
            setTimeExpired(true)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(interval)
    } else if (totalQuizTime === 0 && !isSubmitted && !timeExpired && !showResults) {
      setTimeExpired(true)
      setTimeout(() => {
        handleSubmit()
      }, 2000)
    }
  }, [totalQuizTime, isSubmitted, timeExpired, showResults, questions])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleAnswerChange = (questionId, value) => {
    if (!timeExpired) {
      setAnswers(prev => ({
        ...prev,
        [questionId]: value
      }))
    }
  }

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitted(true)
    setTimeExpired(true)
    
    // Calculate score
    let correctCount = 0
    questions.forEach(question => {
      if (answers[question._id] === question.correctAnswer) {
        correctCount++
      }
    })
    
    const totalQuestions = questions.length
    const percentage = parseFloat(((correctCount / totalQuestions) * 100).toFixed(2))
    const passed = percentage >= 35 // Changed from 50% to 35%
    
    console.log('[Quiz] handleSubmit called');
    console.log('[Quiz] Category:', category);
    console.log('[Quiz] Total Questions:', totalQuestions);
    console.log('[Quiz] Correct Count:', correctCount);
    console.log('[Quiz] Percentage:', percentage);
    console.log('[Quiz] Passed:', passed);
    
    setScore(correctCount)
    setShowResults(true)
    setHasDetailedAnswers(true) // We just submitted, so we have detailed answers
    setSavedDatabaseResult(null) // Clear saved result since this is a new submission
    
    // Build review details array with explanations
    const reviewDetails = questions.map((question, idx) => {
      const userAnswer = answers[question._id]
      console.log(`[Save] Q${idx + 1}: question="${question.question.substring(0, 30)}..." | explanation="${question.explanation ? question.explanation.substring(0, 50) : 'EMPTY'}"`)
      return {
        questionId: question._id,
        question: question.question,
        options: question.options,
        userAnswer: userAnswer || '',
        correctAnswer: question.correctAnswer,
        isCorrect: userAnswer === question.correctAnswer,
        image: question.image,
        explanation: question.explanation || ''
      }
    })
    
    // Save result to database
    try {
      const userId = localStorage.getItem('userId') || 'guest'
      const userName = localStorage.getItem('userName') || 'Guest User'
      const token = localStorage.getItem('token')
      
      const savePayload = {
        userId,
        userName,
        category,
        totalQuestions,
        score: correctCount,
        percentage,
        passed,
        submittedAt: new Date(),
        reviewDetails // Include review details with explanations
      }
      
      console.log('[Database] Saving quiz result for category:', category)
      console.log('[Database] UserId:', userId)
      console.log('[Database] UserName:', userName)
      console.log('[Database] Token exists:', !!token)
      console.log('[Database] Category:', category)
      console.log('[Database] Score:', correctCount, '/', totalQuestions)
      console.log('[Database] ReviewDetails count:', reviewDetails.length)
      console.log('[Database] Full payload:', savePayload)
      
      const result = await saveQuizResult(savePayload)
      
      console.log('[Database] ✓ Quiz result saved successfully!')
      console.log('[Database] Saved result ID:', result._id)
      console.log('[Database] Saved result category:', result.category)
      console.log('[Database] Saved result score:', result.score)
      console.log('[Database] Saved result userId:', result.userId)
      
      // Set flag for History page to refresh and show the new result
      sessionStorage.setItem('refreshHistoryAfterSave', 'true')
      sessionStorage.setItem('lastSavedCategory', category)
      
      // Navigate to history page immediately
      navigate('/marks')
    } catch (error) {
      console.error('[Database] ✗ Failed to save quiz result for category:', category)
      console.error('[Database] Error response status:', error.response?.status)
      console.error('[Database] Error response data:', error.response?.data)
      console.error('[Database] Error message:', error.message)
      console.error('[Database] Error:', error)
      // Show alert to user
      alert(`⚠️ Failed to save quiz result for ${category}. Please try again or contact support. Error: ${error.message}`);
    }
  }

  const handleRetakeQuiz = async () => {
    // Simply reset for a new attempt - don't delete the old result
    // Multiple attempts in the same category are now saved separately
    console.log('[Quiz] Starting new attempt for category:', category);
    
    // Fetch fresh questions for new quiz
    try {
      const data = await getMCQsByCategory(category)
      
      if (data.length === 0) {
        setError('No questions available for this category')
        return
      }

      setQuestions(data)
      
      // Reset all quiz states
      setShowResults(false)
      setIsSubmitted(false)
      setTimeExpired(false)
      setScore(0)
      setCurrentQuestionIndex(0)
      setHasDetailedAnswers(true)
      setSavedDatabaseResult(null)
      setSavedReviewDetails([])
      
      // Initialize answers
      const initialAnswers = {}
      data.forEach(q => {
        initialAnswers[q._id] = ''
      })
      setAnswers(initialAnswers)
      
      // Set timer
      const totalTime = data.reduce((sum, q) => sum + (q.timeLimit || 60), 0)
      setTotalQuizTime(totalTime)
    } catch (error) {
      setError('Failed to load questions. Please try again.')
      console.error('Error fetching questions for retake:', error)
    }
  }

  const handleBackToHome = () => {
    navigate('/home')
  }

  if (questions.length === 0) {
    return (
      <div className="quiz-container">
        <div className="quiz-card">
          <h2>No questions available for this category</h2>
          <button className="quiz-nav-button" onClick={handleBackToHome}>
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]

  // Show results screen after submission
  if (showResults) {
    // Use database result if available for accurate values
    const displayScore = savedDatabaseResult ? savedDatabaseResult.score : score
    const totalQuestions = savedDatabaseResult ? savedDatabaseResult.totalQuestions : questions.length
    const percentage = savedDatabaseResult ? savedDatabaseResult.percentage.toFixed(2) : ((score / totalQuestions) * 100).toFixed(2)
    const passed = percentage >= 35
    
    console.log('Displaying results:', { displayScore, score, totalQuestions, percentage, hasDatabaseResult: !!savedDatabaseResult })

    return (
      <div className="quiz-container">
        <div className="results-card">
          <div className="results-header">
            <h1 className="results-title">Quiz Results</h1>
            <div className={`results-badge ${passed ? 'passed' : 'failed'}`}>
              {passed ? '✓ Passed' : '✗ Failed'}
            </div>
          </div>

          <div className="results-score">
            <div className="score-circle">
              <div className="score-percentage">{percentage}%</div>
              <div className="score-text">{displayScore} / {totalQuestions}</div>
            </div>
          </div>

          <div className="results-stats">
            <div className="stat-item">
              <div className="stat-icon correct">✓</div>
              <div className="stat-label">Correct</div>
              <div className="stat-value">{displayScore}</div>
            </div>
            <div className="stat-item">
              <div className="stat-icon incorrect">✗</div>
              <div className="stat-label">Incorrect</div>
              <div className="stat-value">{totalQuestions - displayScore}</div>
            </div>
            <div className="stat-item">
              <div className="stat-icon total">📊</div>
              <div className="stat-label">Total</div>
              <div className="stat-value">{savedDatabaseResult ? savedDatabaseResult.totalQuestions : questions.length}</div>
            </div>
          </div>

          {hasDetailedAnswers ? (
            <div className="results-details">
              <h3 className="details-title">Question Review</h3>
              {(savedReviewDetails.length > 0 ? savedReviewDetails : questions.map((question, index) => {
                const userAnswer = answers[question._id]
                return {
                  questionId: question._id,
                  question: question.question,
                  options: question.options,
                  userAnswer: userAnswer || '',
                  correctAnswer: question.correctAnswer,
                  isCorrect: userAnswer === question.correctAnswer,
                  image: question.image,
                  explanation: question.explanation || ''
                }
              })).map((review, index) => {
                console.log(`[Rendering] Question ${index + 1}: explanation="${review.explanation ? review.explanation.substring(0, 40) : 'EMPTY'}"`)
                const isCorrect = review.isCorrect
                
                return (
                  <div key={review.questionId} className={`review-item ${isCorrect ? 'correct-answer' : 'wrong-answer'}`}>
                    <div className="review-header">
                      <span className="review-number">Q{index + 1}</span>
                      <span className={`review-badge ${isCorrect ? 'badge-correct' : 'badge-incorrect'}`}>
                        {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                      </span>
                    </div>
                    <p className="review-question">{review.question}</p>
                    {review.image && (
                      <img src={review.image} alt="Question" className="review-image" />
                    )}
                    <div className="review-answers">
                      <div className="review-answer-item">
                        <strong>Your Answer:</strong> 
                        <span className={isCorrect ? 'answer-correct' : 'answer-wrong'}>
                          {review.userAnswer || 'Not answered'}
                        </span>
                      </div>
                      {!isCorrect && (
                        <div className="review-answer-item">
                          <strong>Correct Answer:</strong> 
                          <span className="answer-correct">{review.correctAnswer}</span>
                        </div>
                      )}
                    </div>
                    {(review.explanation || true) && (
                      <div className="question-explanation-box">
                        <strong className="explanation-heading">💡 Explanation:</strong>
                        <p className="explanation-content">
                          {review.explanation || 'No explanation provided yet. Please ask your instructor for clarification.'}
                        </p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="results-note">
              <p className="note-text">
                ℹ️ Detailed question review is not available for this quiz. 
                Retake the quiz to see detailed answers.
              </p>
            </div>
          )}

          <div className="results-actions">
            <button className="results-button primary" onClick={handleBackToHome}>
              Back to Home
            </button>
            <button className="results-button tertiary" onClick={() => navigate('/marks')}>
              View Marks
            </button>
            <button className="results-button secondary" onClick={handleRetakeQuiz}>
              Retake Quiz
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <button className="back-button" onClick={handleBackToHome}>
          ← Back to Home
        </button>
        <div className={`quiz-timer ${totalQuizTime <= 10 && totalQuizTime > 0 ? 'timer-warning' : ''} ${timeExpired ? 'timer-expired' : ''}`}>
          Time left {formatTime(totalQuizTime)}
        </div>
      </div>

      <div className="quiz-card">
        <div className="quiz-question-header">
          <h2 className="quiz-question-number">
            Question {currentQuestionIndex + 1}
          </h2>
          <div className="quiz-category-badge">{category}</div>
        </div>

        {timeExpired && (
          <div className="time-expired-message">
            ⏰ Time's Up! Quiz will be submitted automatically...
          </div>
        )}

        <p className="quiz-question-text">{currentQuestion.question}</p>

        {currentQuestion.image && (
          <div className="quiz-image-container">
            <img src={currentQuestion.image} alt="Question" className="quiz-image" />
          </div>
        )}

        <div className="quiz-answers">
          {currentQuestion.options.map((option, idx) => (
            <label 
              key={idx} 
              className={`quiz-option ${answers[currentQuestion._id] === option ? 'selected' : ''} ${
                isSubmitted 
                  ? option === currentQuestion.correctAnswer 
                    ? 'correct' 
                    : answers[currentQuestion._id] === option 
                      ? 'incorrect' 
                      : '' 
                  : ''
              }`}
            >
              <input
                type="radio"
                name={`question-${currentQuestion._id}`}
                value={option}
                checked={answers[currentQuestion._id] === option}
                onChange={(e) => handleAnswerChange(currentQuestion._id, e.target.value)}
                disabled={isSubmitted || timeExpired}
                className="quiz-radio"
              />
              <span className="quiz-option-text">{option}</span>
              {isSubmitted && option === currentQuestion.correctAnswer && (
                <span className="correct-indicator">✓</span>
              )}
              {isSubmitted && answers[currentQuestion._id] === option && option !== currentQuestion.correctAnswer && (
                <span className="incorrect-indicator">✗</span>
              )}
            </label>
          ))}
        </div>

        {isSubmitted && currentQuestion.explanation && (
          <div className="quiz-explanation">
            <strong className="quiz-explanation-label">💡 Explanation:</strong>
            <p className="quiz-explanation-text">{currentQuestion.explanation}</p>
          </div>
        )}

        <div className="quiz-navigation">
          <button 
            className="quiz-nav-button" 
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
          >
            Previous
          </button>
          
          <span className="quiz-progress">
            {currentQuestionIndex + 1} / {questions.length}
          </span>

          {currentQuestionIndex < questions.length - 1 ? (
            <button className="quiz-nav-button" onClick={handleNext}>
              Next
            </button>
          ) : (
            <button className="quiz-submit-button" onClick={handleSubmit} disabled={isSubmitted}>
              {isSubmitted ? 'Submitted' : 'Submit Quiz'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default Quiz
