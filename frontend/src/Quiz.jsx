import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getMCQsByCategory } from './api/mcqApi'
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

  useEffect(() => {
    // Always fetch fresh questions when category changes
    fetchQuestions()
  }, [category])

  const fetchQuestions = async () => {
    setLoading(true)
    setError('')
    
    // Check if there's a saved result for this category
    const savedResult = localStorage.getItem(`quizResult_${category}`)
    if (savedResult) {
      const resultData = JSON.parse(savedResult)
      
      // Fetch questions to ensure we have the latest data
      try {
        const data = await getMCQsByCategory(category)
        
        if (data.length === 0) {
          setError('No questions available for this category')
          setQuestions([])
          setLoading(false)
          return
        }

        setQuestions(data)
        setAnswers(resultData.answers)
        setScore(resultData.score)
        setShowResults(true)
        setIsSubmitted(true)
        setTimeExpired(true)
      } catch (error) {
        setError('Failed to load questions. Please try again.')
        console.error('Error fetching questions:', error)
      } finally {
        setLoading(false)
      }
      return
    }
    
    try {
      const data = await getMCQsByCategory(category)
      
      if (data.length === 0) {
        setError('No questions available for this category')
        setQuestions([])
        return
      }

      setQuestions(data)
      
      // Calculate total time for all questions
      const totalTime = data.reduce((sum, q) => sum + (q.timeLimit || 60), 0)
      setTotalQuizTime(totalTime)
      
      // Initialize answers object
      const initialAnswers = {}
      data.forEach(q => {
        initialAnswers[q._id] = ''
      })
      setAnswers(initialAnswers)
    } catch (error) {
      setError('Failed to load questions. Please try again.')
      console.error('Error fetching questions:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (totalQuizTime > 0 && !isSubmitted) {
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
    } else if (totalQuizTime === 0 && !isSubmitted && !timeExpired) {
      setTimeExpired(true)
      setTimeout(() => {
        handleSubmit()
      }, 2000)
    }
  }, [totalQuizTime, isSubmitted, timeExpired])

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

  const handleSubmit = () => {
    setIsSubmitted(true)
    setTimeExpired(true)
    
    // Calculate score
    let correctCount = 0
    questions.forEach(question => {
      if (answers[question._id] === question.correctAnswer) {
        correctCount++
      }
    })
    
    setScore(correctCount)
    setShowResults(true)
    
    // Save result to localStorage
    const resultData = {
      questions,
      answers,
      score: correctCount,
      timestamp: Date.now()
    }
    localStorage.setItem(`quizResult_${category}`, JSON.stringify(resultData))
  }

  const handleRetakeQuiz = () => {
    // Clear saved result from localStorage
    localStorage.removeItem(`quizResult_${category}`)
    
    // Reset all quiz states
    setShowResults(false)
    setIsSubmitted(false)
    setTimeExpired(false)
    setScore(0)
    setCurrentQuestionIndex(0)
    
    // Reset answers
    const initialAnswers = {}
    questions.forEach(q => {
      initialAnswers[q._id] = ''
    })
    setAnswers(initialAnswers)
    
    // Reset timer
    const totalTime = questions.reduce((sum, q) => sum + (q.timeLimit || 60), 0)
    setTotalQuizTime(totalTime)
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
    const percentage = ((score / questions.length) * 100).toFixed(2)
    const passed = percentage >= 50

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
              <div className="score-text">{score} / {questions.length}</div>
            </div>
          </div>

          <div className="results-stats">
            <div className="stat-item">
              <div className="stat-icon correct">✓</div>
              <div className="stat-label">Correct</div>
              <div className="stat-value">{score}</div>
            </div>
            <div className="stat-item">
              <div className="stat-icon incorrect">✗</div>
              <div className="stat-label">Incorrect</div>
              <div className="stat-value">{questions.length - score}</div>
            </div>
            <div className="stat-item">
              <div className="stat-icon total">📊</div>
              <div className="stat-label">Total</div>
              <div className="stat-value">{questions.length}</div>
            </div>
          </div>

          <div className="results-details">
            <h3 className="details-title">Question Review</h3>
            {questions.map((question, index) => {
              const userAnswer = answers[question._id]
              const isCorrect = userAnswer === question.correctAnswer
              
              return (
                <div key={question._id} className={`review-item ${isCorrect ? 'correct-answer' : 'wrong-answer'}`}>
                  <div className="review-header">
                    <span className="review-number">Q{index + 1}</span>
                    <span className={`review-badge ${isCorrect ? 'badge-correct' : 'badge-incorrect'}`}>
                      {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                    </span>
                  </div>
                  <p className="review-question">{question.question}</p>
                  {question.image && (
                    <img src={question.image} alt="Question" className="review-image" />
                  )}
                  <div className="review-answers">
                    <div className="review-answer-item">
                      <strong>Your Answer:</strong> 
                      <span className={isCorrect ? 'answer-correct' : 'answer-wrong'}>
                        {userAnswer || 'Not answered'}
                      </span>
                    </div>
                    {!isCorrect && (
                      <div className="review-answer-item">
                        <strong>Correct Answer:</strong> 
                        <span className="answer-correct">{question.correctAnswer}</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

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
