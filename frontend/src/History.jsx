import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from './Navbar'
import { getQuizHistory, deleteQuizHistory } from './api/quizHistoryApi'
import './App.css'

function History() {
  const navigate = useNavigate()
  const [quizHistory, setQuizHistory] = useState([])
  const [userName] = useState(localStorage.getItem('userName') || 'Guest User')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadQuizHistory()
  }, [])

  const loadQuizHistory = async () => {
    setLoading(true)
    setError('')
    
    try {
      const userId = localStorage.getItem('userId') || 'guest'
      const history = await getQuizHistory(userId)
      
      // Sort by timestamp (most recent first)
      const sortedHistory = history.sort((a, b) => 
        new Date(b.submittedAt) - new Date(a.submittedAt)
      )
      
      setQuizHistory(sortedHistory)
    } catch (error) {
      console.error('Error loading quiz history:', error)
      setError('Failed to load quiz history')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteQuiz = async (id, category) => {
    if (window.confirm(`Are you sure you want to delete the ${category} quiz result?`)) {
      try {
        await deleteQuizHistory(id)
        
        // Also remove from localStorage
        localStorage.removeItem(`quizResult_${category}`)
        
        // Reload history
        await loadQuizHistory()
        
        console.log('Quiz history deleted successfully')
      } catch (error) {
        console.error('Error deleting quiz history:', error)
        alert('Failed to delete quiz history. Please try again.')
      }
    }
  }

  const handleRetakeQuiz = (category) => {
    navigate(`/quiz/${category}`)
  }

  const handleBackToHome = () => {
    navigate('/home')
  }

  const formatDate = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTotalStats = () => {
    const total = quizHistory.length
    const passed = quizHistory.filter(q => q.passed).length
    const failed = total - passed
    const totalScore = quizHistory.reduce((sum, q) => sum + q.score, 0)
    const totalQuestions = quizHistory.reduce((sum, q) => sum + q.totalQuestions, 0)
    const overallPercentage = totalQuestions > 0 ? ((totalScore / totalQuestions) * 100).toFixed(1) : 0

    return { total, passed, failed, overallPercentage }
  }

  const stats = getTotalStats()

  if (loading) {
    return (
      <>
        <Navbar userName={userName} />
        <div className="history-container">
          <div className="history-content">
            <div className="loading-message">Loading quiz history...</div>
          </div>
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <Navbar userName={userName} />
        <div className="history-container">
          <div className="history-content">
            <div className="error-message">{error}</div>
            <button className="back-home-btn" onClick={handleBackToHome}>
              ← Back to Home
            </button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar userName={userName} />
      <div className="history-container">
        <div className="history-content">
          <div className="history-header">
            <h1 className="history-title">Quiz History & Marks</h1>
            <button className="back-home-btn" onClick={handleBackToHome}>
              ← Back to Home
            </button>
          </div>

          {quizHistory.length > 0 ? (
            <>
              <div className="stats-overview">
                <div className="stat-card">
                  <div className="stat-icon">📚</div>
                  <div className="stat-value">{stats.total}</div>
                  <div className="stat-label">Total Quizzes</div>
                </div>
                <div className="stat-card success">
                  <div className="stat-icon">✓</div>
                  <div className="stat-value">{stats.passed}</div>
                  <div className="stat-label">Passed</div>
                </div>
                <div className="stat-card danger">
                  <div className="stat-icon">✗</div>
                  <div className="stat-value">{stats.failed}</div>
                  <div className="stat-label">Failed</div>
                </div>
                <div className="stat-card primary">
                  <div className="stat-icon">📊</div>
                  <div className="stat-value">{stats.overallPercentage}%</div>
                  <div className="stat-label">Overall Score</div>
                </div>
              </div>

              <div className="history-list">
                {quizHistory.map((quiz) => (
                  <div key={quiz._id} className={`history-item ${quiz.passed ? 'passed' : 'failed'}`}>
                    <div className="history-item-header">
                      <div className="history-category">
                        <h3>{quiz.category}</h3>
                        <span className={`status-badge ${quiz.passed ? 'badge-passed' : 'badge-failed'}`}>
                          {quiz.passed ? '✓ Passed' : '✗ Failed'}
                        </span>
                      </div>
                      <div className="history-date">{formatDate(quiz.submittedAt)}</div>
                    </div>
                    
                    <div className="history-item-body">
                      <div className="score-display">
                        <div className="score-circle-small">
                          <div className="score-percentage-small">{quiz.percentage.toFixed(1)}%</div>
                        </div>
                        <div className="score-details">
                          <div className="score-text-large">
                            {quiz.score} / {quiz.totalQuestions}
                          </div>
                          <div className="score-label">Correct Answers</div>
                        </div>
                      </div>
                      
                      <div className="history-actions">
                        <button 
                          className="retake-btn"
                          onClick={() => handleRetakeQuiz(quiz.category)}
                        >
                          🔄 Retake Quiz
                        </button>
                        <button 
                          className="delete-btn"
                          onClick={() => handleDeleteQuiz(quiz._id, quiz.category)}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="no-history">
              <div className="no-history-icon">📝</div>
              <h2>No Quiz History Yet</h2>
              <p>You haven't completed any quizzes yet. Start taking quizzes to see your results here!</p>
              <button className="start-quiz-btn" onClick={handleBackToHome}>
                Start a Quiz
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default History
