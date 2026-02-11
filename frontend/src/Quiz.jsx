import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getMCQsByCategory } from './api/mcqApi'
import { saveQuizResult, getQuizHistoryByCategory, deleteQuizHistory } from './api/quizHistoryApi'
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
      const userId = localStorage.getItem('userId') || 'guest'
      
      // First priority: Check localStorage for complete data
      const localStorageData = localStorage.getItem(`quizResult_${category}`)
      if (localStorageData) {
        try {
          const resultData = JSON.parse(localStorageData)
          if (resultData.questions && Array.isArray(resultData.questions) && resultData.questions.length > 0) {
            console.log('Loading from localStorage with full details')
            setQuestions(resultData.questions)
            setAnswers(resultData.answers || {})
            setScore(resultData.score)
            setSavedDatabaseResult(null) // No database result needed
            setShowResults(true)
            setIsSubmitted(true)
            setTimeExpired(true)
            setHasDetailedAnswers(true)
            setLoading(false)
            return
          }
        } catch (error) {
          console.error('Error parsing localStorage data:', error)
        }
      }
      
      // Second priority: Check database for saved result
      try {
        const savedQuizResult = await getQuizHistoryByCategory(userId, category)
        
        if (savedQuizResult) {
          console.log('[Load] Loading from database:', savedQuizResult)
          console.log('[Load] Saved review details count:', savedQuizResult.reviewDetails ? savedQuizResult.reviewDetails.length : 0)
          if (savedQuizResult.reviewDetails) {
            savedQuizResult.reviewDetails.forEach((rd, idx) => {
              console.log(`[Load] Saved Review Detail ${idx + 1}: explanation="${rd.explanation ? rd.explanation.substring(0, 50) : 'EMPTY'}"`)
            })
          }
          
          // If we have review details, fetch fresh MCQ data to get updated explanations
          if (savedQuizResult.reviewDetails && Array.isArray(savedQuizResult.reviewDetails) && savedQuizResult.reviewDetails.length > 0) {
            try {
              // Fetch fresh MCQ data to get latest explanations
              const freshMCQs = await getMCQsByCategory(category)
              
              console.log('[Frontend] Fresh MCQs fetched:', freshMCQs.length)
              freshMCQs.forEach((mcq, idx) => {
                console.log(`[Frontend] Fresh MCQ ${idx + 1}: ID=${mcq._id}, explanation="${mcq.explanation ? mcq.explanation.substring(0, 40) : 'EMPTY'}"`)
              })
              
              // Create a map of MCQs by ID for quick lookup
              const mcqMap = {}
              freshMCQs.forEach(mcq => {
                mcqMap[mcq._id] = mcq
              })
              
              console.log('[Frontend] Saved review details:', savedQuizResult.reviewDetails.length)
              
              // Merge saved review details with fresh MCQ explanations
              const enhancedReviewDetails = savedQuizResult.reviewDetails.map(review => {
                const freshExplanation = mcqMap[review.questionId] && mcqMap[review.questionId].explanation
                const finalExplanation = freshExplanation || review.explanation || ''
                console.log(`[Frontend] Review Q${review.questionId}: Fresh='${freshExplanation ? freshExplanation.substring(0, 30) : 'NONE'}' | Saved='${review.explanation ? review.explanation.substring(0, 30) : 'NONE'}' | Final='${finalExplanation ? finalExplanation.substring(0, 30) : 'EMPTY'}'`)
                return {
                  ...review,
                  explanation: finalExplanation
                }
              })
              
              console.log('[Frontend] Enhanced review details ready:', enhancedReviewDetails)
              
              // Create questions with fresh explanations
              const dummyQuestions = enhancedReviewDetails.map((review, idx) => {
                const q = {
                  _id: review.questionId,
                  question: review.question,
                  options: review.options || ['A', 'B', 'C', 'D'],
                  correctAnswer: review.correctAnswer,
                  image: review.image,
                  explanation: review.explanation
                }
                console.log(`[Frontend] DummyQuestion ${idx + 1}: explanation="${q.explanation ? q.explanation.substring(0, 40) : 'EMPTY'}"`)
                return q
              })
              
              setQuestions(dummyQuestions)
              setScore(savedQuizResult.score)
              setSavedDatabaseResult(savedQuizResult)
              setAnswers({})
              setShowResults(true)
              setIsSubmitted(true)
              setTimeExpired(true)
              setHasDetailedAnswers(true)
              setSavedReviewDetails(enhancedReviewDetails)
              setLoading(false)
              return
            } catch (mcqError) {
              console.error('[Frontend] Could not fetch fresh MCQs, using saved data:', mcqError)
              
              // Fallback: use saved review details as-is
              const dummyQuestions = savedQuizResult.reviewDetails.map((review, idx) => {
                const q = {
                  _id: review.questionId,
                  question: review.question,
                  options: review.options || ['A', 'B', 'C', 'D'],
                  correctAnswer: review.correctAnswer,
                  image: review.image,
                  explanation: review.explanation
                }
                console.log(`[Fallback] DummyQuestion ${idx + 1}: explanation="${q.explanation ? q.explanation.substring(0, 40) : 'EMPTY'}"`)
                return q
              })
              
              setQuestions(dummyQuestions)
              setScore(savedQuizResult.score)
              setSavedDatabaseResult(savedQuizResult)
              setAnswers({})
              setShowResults(true)
              setIsSubmitted(true)
              setTimeExpired(true)
              setHasDetailedAnswers(true)
              setSavedReviewDetails(savedQuizResult.reviewDetails)
              setLoading(false)
              return
            }
          } else {
            // Fallback to dummy questions if no review details
            const dummyQuestions = Array(savedQuizResult.totalQuestions).fill(null).map((_, i) => ({
              _id: `dummy-${i}`,
              question: `Question ${i + 1}`,
              options: ['A', 'B', 'C', 'D'],
              correctAnswer: 'A'
            }))
            
            setQuestions(dummyQuestions)
            setScore(savedQuizResult.score)
            setSavedDatabaseResult(savedQuizResult)
            setAnswers({})
            setShowResults(true)
            setIsSubmitted(true)
            setTimeExpired(true)
            setHasDetailedAnswers(false)
            setLoading(false)
            return
          }
        }
      } catch (dbError) {
        console.log('No saved result in database, continuing to fresh quiz')
      }
      
      // Third priority: Load fresh questions for new quiz
      console.log('[Frontend] Loading fresh questions for new quiz')
      const data = await getMCQsByCategory(category)
      
      // Log explanation data
      console.log('[Frontend] Fresh questions loaded:', data)
      data.forEach((q, idx) => {
        console.log(`[Frontend] Q${idx + 1}: question="${q.question.substring(0, 30)}..." | explanation="${q.explanation ? q.explanation.substring(0, 50) : 'EMPTY'}"`)
      })
      
      if (data.length === 0) {
        setError('No questions available for this category')
        setQuestions([])
        setLoading(false)
        return
      }

      setQuestions(data)
      setSavedDatabaseResult(null)
      setScore(0)
      setAnswers({})
      setShowResults(false)
      setIsSubmitted(false)
      setTimeExpired(false)
      setHasDetailedAnswers(true)
      
      // Calculate total time for all questions
      const totalTime = data.reduce((sum, q) => sum + (q.timeLimit || 60), 0)
      setTotalQuizTime(totalTime)
      
      setLoading(false)
    } catch (error) {
      setError('Failed to load questions. Please try again.')
      console.error('Error fetching questions:', error)
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
    
    setScore(correctCount)
    setShowResults(true)
    setHasDetailedAnswers(true) // We just submitted, so we have detailed answers
    setSavedDatabaseResult(null) // Clear saved result since this is a new submission
    
    // Save result to localStorage as backup
    const resultData = {
      questions,
      answers,
      score: correctCount,
      timestamp: Date.now()
    }
    localStorage.setItem(`quizResult_${category}`, JSON.stringify(resultData))
    
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
      
      console.log('[Database] Saving quiz result with reviewDetails:', reviewDetails.length)
      reviewDetails.forEach((rd, idx) => {
        console.log(`[Database] Review Detail ${idx + 1}: explanation="${rd.explanation ? rd.explanation.substring(0, 50) : 'EMPTY'}"`)
      })
      
      await saveQuizResult({
        userId,
        userName,
        category,
        totalQuestions,
        score: correctCount,
        percentage,
        passed,
        submittedAt: new Date(),
        reviewDetails // Include review details with explanations
      })
      
      console.log('[Database] Quiz result saved to database successfully with review details')
    } catch (error) {
      console.error('[Database] Failed to save quiz result to database:', error)
    }
  }

  const handleRetakeQuiz = async () => {
    // Clear saved result from localStorage
    localStorage.removeItem(`quizResult_${category}`)
    
    // Try to delete from database
    try {
      const userId = localStorage.getItem('userId') || 'guest'
      const savedQuizResult = await getQuizHistoryByCategory(userId, category)
      
      if (savedQuizResult && savedQuizResult._id) {
        await deleteQuizHistory(savedQuizResult._id)
        console.log('Quiz result deleted from database for retake')
      }
    } catch (error) {
      console.error('Error deleting quiz result from database:', error)
    }
    
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
      setHasDetailedAnswers(true) // Reset to true for new quiz
      setSavedDatabaseResult(null) // Clear saved database result
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
