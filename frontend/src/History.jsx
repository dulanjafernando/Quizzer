import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from './Navbar'
import { getQuizHistory, deleteQuizHistory } from './api/quizHistoryApi'
import { showToast } from './utils/toast'
import './App.css'

function History() {
  const navigate = useNavigate()
  const [quizHistory, setQuizHistory] = useState([])
  const [userName] = useState(localStorage.getItem('userName') || 'Guest User')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    // Check if we just saved a quiz
    const shouldRefresh = sessionStorage.getItem('refreshHistoryAfterSave') === 'true'
    if (shouldRefresh) {
      console.log('[History] Quiz just saved - showing success message')
      sessionStorage.removeItem('refreshHistoryAfterSave')
      sessionStorage.removeItem('lastSavedCategory')
      // Store timestamp of submission
      sessionStorage.setItem('quizSubmittedTime', Date.now().toString())
      setShowSuccess(true)
    } else {
      // Check if there was a recent submission within 5 minutes
      const submittedTime = sessionStorage.getItem('quizSubmittedTime')
      if (submittedTime) {
        const elapsed = Date.now() - parseInt(submittedTime)
        const fiveMinutes = 300000
        if (elapsed < fiveMinutes) {
          setShowSuccess(true)
        } else {
          sessionStorage.removeItem('quizSubmittedTime')
          setShowSuccess(false)
        }
      }
    }
    
    // Set up interval to check elapsed time
    const interval = setInterval(() => {
      const submittedTime = sessionStorage.getItem('quizSubmittedTime')
      if (submittedTime) {
        const elapsed = Date.now() - parseInt(submittedTime)
        const fiveMinutes = 300000
        if (elapsed >= fiveMinutes) {
          sessionStorage.removeItem('quizSubmittedTime')
          setShowSuccess(false)
        }
      }
    }, 10000) // Check every 10 seconds
    
    // Load quiz history
    loadQuizHistory()

    // Cleanup interval on unmount
    return () => clearInterval(interval)
  }, [])

  const loadQuizHistory = async () => {
    setLoading(true)
    setError('')
    
    // Add timeout to prevent infinite loading (10 seconds)
    const timeoutId = setTimeout(() => {
      setLoading(false)
      setError('Loading took too long. Please refresh to try again.')
    }, 10000)
    
    try {
      const userId = localStorage.getItem('userId') || 'guest'
      const token = localStorage.getItem('token')
      console.log('[History] Loading quiz history for userId:', userId, 'has token:', !!token)
      
      const history = await getQuizHistory(userId)
      clearTimeout(timeoutId)
      
      console.log('[History] Raw API response:', history)
      console.log('[History] Response type:', typeof history)
      console.log('[History] Is array:', Array.isArray(history))
      
      // Handle both array and object responses
      let historyData = Array.isArray(history) ? history : history?.data || []
      console.log('[History] Processed history data count:', historyData.length)
      
      if (historyData.length > 0) {
        console.log('[History] Categories found:', historyData.map(q => q.category).join(', '))
      }
      
      // Sort by timestamp (most recent first)
      const sortedHistory = historyData.sort((a, b) => 
        new Date(b.submittedAt) - new Date(a.submittedAt)
      )
      
      // Perf Fix: Pre-calculate attempt numbers in O(n) time
      const categoryTotals = {}
      sortedHistory.forEach(h => {
        categoryTotals[h.category] = (categoryTotals[h.category] || 0) + 1
      })
      
      const historyWithAttempts = sortedHistory.map(h => {
        const attempt = categoryTotals[h.category]
        categoryTotals[h.category]--
        return { ...h, attemptNumber: attempt }
      })
      
      setQuizHistory(historyWithAttempts)
      setLoading(false)
      
      // Clear session storage flags after successful load
      sessionStorage.removeItem('refreshHistoryAfterSave')
      sessionStorage.removeItem('lastSavedCategory')
    } catch (error) {
      clearTimeout(timeoutId)
      console.error('[History] Error loading quiz history:', error.message)
      console.error('[History] Error status:', error.response?.status)
      console.error('[History] Error data:', error.response?.data)
      setError(`Failed to load quiz marks: ${error.response?.data?.message || error.message}`)
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

        showToast('Quiz deleted from the history', 'success', 3000, 'top-left')
      } catch (error) {
        console.error('Error deleting quiz history:', error)
        showToast('Failed to delete quiz history. Please try again.', 'error', 3000, 'top-left')
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

  const getCategoryStats = () => {
    const categoryMap = {}
    quizHistory.forEach(quiz => {
      if (!categoryMap[quiz.category]) {
        categoryMap[quiz.category] = {
          category: quiz.category,
          attempts: 0,
          latestAttempt: null,
          latestScore: 0,
          latestTotalQuestions: 0,
          latestPercentage: 0,
          latestPassed: false,
          allAttempts: []
        }
      }
      const cat = categoryMap[quiz.category]
      cat.attempts += 1
      cat.allAttempts.push({
        percentage: quiz.percentage,
        score: quiz.score,
        total: quiz.totalQuestions,
        date: quiz.submittedAt
      })
      
      if (!cat.latestAttempt || new Date(quiz.submittedAt) > new Date(cat.latestAttempt)) {
        cat.latestAttempt = quiz.submittedAt
        cat.latestScore = quiz.score
        cat.latestTotalQuestions = quiz.totalQuestions
        cat.latestPercentage = quiz.percentage
        cat.latestPassed = quiz.passed
      }
    })

    // Sort attempts by date for each category
    Object.values(categoryMap).forEach(cat => {
      cat.allAttempts.sort((a, b) => new Date(a.date) - new Date(b.date))
    })

    return Object.values(categoryMap).sort((a, b) => new Date(b.latestAttempt) - new Date(a.latestAttempt))
  }

  const LineChart = ({ attempts, categoryName }) => {
    if (!attempts || attempts.length < 2) return null

    const width = 320
    const height = 160
    const padding = 40
    const chartWidth = width - 2 * padding
    const chartHeight = height - 2 * padding

    const maxPercentage = 100
    const xStep = chartWidth / (attempts.length - 1)
    const yStep = chartHeight / maxPercentage

    const points = attempts
      .map((attempt, index) => {
        const x = padding + index * xStep
        const y = height - padding - attempt.percentage * yStep
        return { x, y, ...attempt }
      })

    const pathD = points
      .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
      .join(' ')

    return (
      <div style={{ marginTop: '1.5rem' }}>
        <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          📊 Attempt Progression
        </h4>
        <svg width={width} height={height} style={{ background: 'rgba(15, 23, 42, 0.5)', borderRadius: '0.5rem', border: '1px solid rgba(148, 163, 184, 0.2)' }}>
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((val) => (
            <line
              key={`grid-${val}`}
              x1={padding}
              y1={height - padding - (val / 100) * chartHeight}
              x2={width - padding}
              y2={height - padding - (val / 100) * chartHeight}
              stroke="rgba(148, 163, 184, 0.1)"
              strokeWidth="1"
              strokeDasharray="4"
            />
          ))}

          {/* Y-axis */}
          <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="rgba(148, 163, 184, 0.3)" strokeWidth="2" />

          {/* X-axis */}
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="rgba(148, 163, 184, 0.3)" strokeWidth="2" />

          {/* Line */}
          <path d={pathD} fill="none" stroke="#60a5fa" strokeWidth="2" />

          {/* Y-axis labels */}
          {[0, 25, 50, 75, 100].map((val) => (
            <text
              key={`label-${val}`}
              x={padding - 10}
              y={height - padding - (val / 100) * chartHeight + 4}
              textAnchor="end"
              fontSize="11"
              fill="#94a3b8"
            >
              {val}%
            </text>
          ))}
        </svg>
        <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: '#cbd5e1' }}>
          <div>Total Attempts: {attempts.length}</div>
          <div>Current: {attempts[attempts.length - 1].percentage.toFixed(1)}%</div>
          {attempts.length > 1 && (
            <div style={{ color: attempts[attempts.length - 1].percentage >= attempts[attempts.length - 2].percentage ? '#10b981' : '#ef4444' }}>
              Change: {(attempts[attempts.length - 1].percentage - attempts[attempts.length - 2].percentage).toFixed(1)}%
            </div>
          )}
        </div>
      </div>
    )
  }

  const stats = getTotalStats()
  const categoryStats = getCategoryStats()

  return (
    <>
      <Navbar userName={userName} />
      <div className="history-container">
        <div className="history-content">
          <div className="history-header">
            <h1 className="history-title">Quiz History & Marks</h1>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                className="back-home-btn"
                onClick={loadQuizHistory}
                disabled={loading}
                style={{
                  opacity: loading ? 0.6 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
                title="Click to reload quiz history"
              >
                🔄 {loading ? 'Loading...' : 'Refresh'}
              </button>
              <button className="back-home-btn" onClick={handleBackToHome}>
                ← Back to Home
              </button>
            </div>
          </div>

          {/* Loading Overlay/Message */}
          {loading && (
            <div style={{
              background: 'rgba(59, 130, 246, 0.1)',
              color: '#3b82f6',
              padding: '1rem',
              borderRadius: '0.5rem',
              marginBottom: '1rem',
              textAlign: 'center',
              border: '1px solid #3b82f6'
            }}>
              Loading your quiz history...
            </div>
          )}

          {/* Success Message */}
          {showSuccess && (
            <div style={{
              background: '#10b981',
              color: 'white',
              padding: '1rem',
              borderRadius: '0.5rem',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span style={{ fontSize: '1.2rem' }}>✓</span>
              <span><strong>Quiz saved successfully!</strong> Your new marks are displayed below.</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div style={{
              background: '#ef4444',
              color: 'white',
              padding: '1rem',
              borderRadius: '0.5rem',
              marginBottom: '1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span>⚠️ {error}</span>
              <button
                onClick={loadQuizHistory}
                style={{
                  background: '#dc2626',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.3rem',
                  cursor: 'pointer'
                }}
              >
                Retry
              </button>
            </div>
          )}

          {/* Latest Quiz Result Card */}
          {showSuccess && quizHistory.length > 0 && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(10, 150, 100, 0.1) 100%)',
              border: '2px solid #10b981',
              borderRadius: '1rem',
              padding: '1.5rem',
              marginBottom: '2rem',
              boxShadow: '0 8px 20px rgba(16, 185, 129, 0.15)'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '2rem'
              }}>
                {/* Left: Score Circle */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '1rem',
                  minWidth: '120px'
                }}>
                  <div style={{
                    position: 'relative',
                    width: '100px',
                    height: '100px'
                  }}>
                    <svg width="100" height="100" style={{ transform: 'rotate(-90deg)' }}>
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="rgba(148, 163, 184, 0.2)"
                        strokeWidth="3"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke={quizHistory[0]?.percentage >= 70 ? '#10b981' : quizHistory[0]?.percentage >= 50 ? '#f59e0b' : '#ef4444'}
                        strokeWidth="3"
                        strokeDasharray={`${(quizHistory[0]?.percentage / 100) * 282.7} 282.7`}
                        style={{ transition: 'stroke-dasharray 0.5s ease' }}
                      />
                    </svg>
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      textAlign: 'center'
                    }}>
                      <div style={{
                        fontSize: '1.8rem',
                        fontWeight: '700',
                        color: quizHistory[0]?.percentage >= 70 ? '#10b981' : quizHistory[0]?.percentage >= 50 ? '#f59e0b' : '#ef4444'
                      }}>
                        {quizHistory[0]?.percentage?.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Middle: Quiz Details */}
                <div style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.8rem'
                }}>
                  <h3 style={{
                    margin: 0,
                    fontSize: '1.3rem',
                    fontWeight: '700',
                    color: '#f1f5f9'
                  }}>
                    🎉 Latest Quiz Submitted
                  </h3>
                  <div style={{
                    display: 'flex',
                    gap: '1rem',
                    flexWrap: 'wrap'
                  }}>
                    <div>
                      <div style={{
                        fontSize: '0.75rem',
                        color: '#94a3b8',
                        textTransform: 'uppercase',
                        fontWeight: '600',
                        letterSpacing: '0.05em',
                        marginBottom: '0.25rem'
                      }}>
                        Category
                      </div>
                      <div style={{
                        fontSize: '1.1rem',
                        fontWeight: '700',
                        color: '#cbd5e1'
                      }}>
                        {quizHistory[0]?.category}
                      </div>
                    </div>
                    <div>
                      <div style={{
                        fontSize: '0.75rem',
                        color: '#94a3b8',
                        textTransform: 'uppercase',
                        fontWeight: '600',
                        letterSpacing: '0.05em',
                        marginBottom: '0.25rem'
                      }}>
                        Score
                      </div>
                      <div style={{
                        fontSize: '1.1rem',
                        fontWeight: '700',
                        color: '#60a5fa'
                      }}>
                        {quizHistory[0]?.score} / {quizHistory[0]?.totalQuestions}
                      </div>
                    </div>
                    <div>
                      <div style={{
                        fontSize: '0.75rem',
                        color: '#94a3b8',
                        textTransform: 'uppercase',
                        fontWeight: '600',
                        letterSpacing: '0.05em',
                        marginBottom: '0.25rem'
                      }}>
                        Status
                      </div>
                      <div style={{
                        fontSize: '1rem',
                        fontWeight: '700',
                        color: quizHistory[0]?.passed ? '#10b981' : '#ef4444'
                      }}>
                        {quizHistory[0]?.passed ? '✓ Passed' : '✗ Failed'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Action Button */}
                <button
                  onClick={() => navigate(`/marks/${quizHistory[0]?._id}`)}
                  style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    fontSize: '0.95rem',
                    fontWeight: '700',
                    transition: 'all 0.3s ease',
                    whiteSpace: 'nowrap'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 16px rgba(16, 185, 129, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  📑 View Details
                </button>
              </div>
            </div>
          )}

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

              <div className="category-stats-section">
                <h2 className="category-stats-title">📊 Category-wise Performance</h2>
                <div className="category-stats-grid">
                  {categoryStats.map((cat) => (
                    <div key={cat.category} className="category-stat-card">
                      <div className="category-stat-header">
                        <h3 className="category-stat-name">{cat.category}</h3>
                        <div className="attempt-badge">{cat.attempts} {cat.attempts === 1 ? 'attempt' : 'attempts'}</div>
                      </div>
                      
                      <div className="category-stat-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {/* Last Attempt Marks */}
                        <div>
                          <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '500' }}>Last Attempt Marks</div>
                          <div style={{ color: '#60a5fa', fontSize: '1.3rem', fontWeight: 'bold' }}>{cat.latestScore} / {cat.latestTotalQuestions}</div>
                        </div>

                        {/* Last Attempt Percentage */}
                        <div>
                          <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '500' }}>Last Attempt Percentage</div>
                          <div style={{ color: '#60a5fa', fontSize: '1.3rem', fontWeight: 'bold' }}>{cat.latestPercentage.toFixed(1)}%</div>
                        </div>

                        {/* Pass/Fail Status */}
                        <div>
                          <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '500' }}>Status</div>
                          <div style={{
                            display: 'inline-block',
                            padding: '0.5rem 1rem',
                            borderRadius: '0.375rem',
                            fontWeight: 'bold',
                            fontSize: '0.95rem',
                            background: cat.latestPassed ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                            color: cat.latestPassed ? '#10b981' : '#ef4444'
                          }}>
                            {cat.latestPassed ? '✓ Passed' : '✗ Failed'}
                          </div>
                        </div>

                        {/* Last Attempt Date */}
                        <div>
                          <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '500' }}>Last Attempt Date</div>
                          <div style={{ color: '#cbd5e1', fontSize: '0.95rem' }}>
                            {new Date(cat.latestAttempt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>

                      <div className="progress-bar" style={{ marginTop: '1.5rem' }}>
                        <div 
                          className="progress-fill" 
                          style={{
                            width: `${cat.latestPercentage}%`,
                            backgroundColor: cat.latestPercentage >= 70 ? '#10b981' : cat.latestPercentage >= 50 ? '#4caf50' : '#f44336'
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Category-wise Line Graphs Section */}
              {categoryStats.length > 0 && (
                <div style={{ marginTop: '3rem', marginBottom: '2rem' }}>
                  <h2 style={{ 
                    fontSize: '1.5rem', 
                    fontWeight: '700', 
                    color: '#f1f5f9', 
                    marginBottom: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                  }}>
                    📊 Attempt Progression by Category
                  </h2>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                    gap: '1.5rem'
                  }}>
                    {categoryStats.map((cat) => (
                      <div key={cat.category} style={{
                        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.8) 100%)',
                        border: '1px solid rgba(148, 163, 184, 0.2)',
                        borderRadius: '1rem',
                        padding: '1rem',
                        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
                      }}>
                        <h3 style={{
                          margin: '0 0 1rem 0',
                          fontSize: '1.1rem',
                          fontWeight: '600',
                          color: '#cbd5e1'
                        }}>
                          {cat.category}
                        </h3>
                        <LineChart attempts={cat.allAttempts} categoryName={cat.category} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <h2 className="history-list-title">📝 Detailed Quiz History</h2>
              <div className="history-list">
                {quizHistory.map((quiz, index) => (
                  <div 
                    key={quiz._id} 
                    style={{
                      background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.8) 100%)',
                      border: '1px solid rgba(148, 163, 184, 0.2)',
                      borderLeft: `4px solid ${quiz.passed ? '#10b981' : '#ef4444'}`,
                      borderRadius: '0.875rem',
                      padding: '1.5rem',
                      marginBottom: '1rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
                    }}
                    onClick={() => navigate(`/marks/${quiz._id}`)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(96, 165, 250, 0.15)';
                      e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
                      e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.2)';
                    }}
                  >
                    {/* Left Section: Category and Score Info */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flex: 1 }}>
                      {/* Circle Percentage */}
                      <div style={{ position: 'relative', width: '80px', height: '80px', flexShrink: 0 }}>
                        <svg width="80" height="80" style={{ transform: 'rotate(-90deg)' }}>
                          <circle
                            cx="40"
                            cy="40"
                            r="36"
                            fill="none"
                            stroke="rgba(148, 163, 184, 0.15)"
                            strokeWidth="2"
                          />
                          <circle
                            cx="40"
                            cy="40"
                            r="36"
                            fill="none"
                            stroke={quiz.percentage >= 70 ? '#10b981' : quiz.percentage >= 50 ? '#f59e0b' : '#ef4444'}
                            strokeWidth="2"
                            strokeDasharray={`${(quiz.percentage / 100) * 226.2} 226.2`}
                            style={{ transition: 'stroke-dasharray 0.5s ease' }}
                          />
                        </svg>
                        <div style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          textAlign: 'center'
                        }}>
                          <div style={{
                            fontSize: '1.2rem',
                            fontWeight: '700',
                            color: quiz.percentage >= 70 ? '#10b981' : quiz.percentage >= 50 ? '#f59e0b' : '#ef4444'
                          }}>
                            {quiz.percentage.toFixed(1)}%
                          </div>
                        </div>
                      </div>

                      {/* Category and Score Details */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <h3 style={{ 
                            margin: 0, 
                            fontSize: '1.25rem', 
                            fontWeight: '600',
                            color: '#f1f5f9'
                          }}>
                            {quiz.category}
                          </h3>
                          <div style={{
                            background: 'rgba(99, 102, 241, 0.2)',
                            color: '#818cf8',
                            padding: '0.35rem 0.7rem',
                            borderRadius: '0.4rem',
                            fontSize: '0.7rem',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            border: '1px solid rgba(99, 102, 241, 0.3)'
                          }}>
                            Attempt #{quiz.attemptNumber}
                          </div>
                          <div style={{
                            background: quiz.passed ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                            color: quiz.passed ? '#10b981' : '#ef4444',
                            padding: '0.35rem 0.7rem',
                            borderRadius: '0.4rem',
                            fontSize: '0.7rem',
                            fontWeight: '600',
                            border: `1px solid ${quiz.passed ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                          }}>
                            {quiz.passed ? '✓ Passed' : '✗ Failed'}
                          </div>
                        </div>
                        <div style={{
                          fontSize: '1.1rem',
                          fontWeight: '700',
                          color: '#60a5fa'
                        }}>
                          {quiz.score} / {quiz.totalQuestions}
                          <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: '500', marginLeft: '0.5rem' }}>Correct Answers</span>
                        </div>
                      </div>
                    </div>

                    {/* Right Section: Date and Action Buttons */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1rem' }}>
                      <div style={{
                        fontSize: '0.9rem',
                        color: '#94a3b8',
                        whiteSpace: 'nowrap'
                      }}>
                        {formatDate(quiz.submittedAt)}
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/marks/${quiz._id}`);
                          }}
                          style={{
                            background: 'transparent',
                            color: '#60a5fa',
                            border: '1px solid rgba(96, 165, 250, 0.5)',
                            padding: '0.5rem 1rem',
                            borderRadius: '0.5rem',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(96, 165, 250, 0.1)';
                            e.currentTarget.style.borderColor = 'rgba(96, 165, 250, 0.8)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.borderColor = 'rgba(96, 165, 250, 0.5)';
                          }}
                        >
                          📑 View Details
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRetakeQuiz(quiz.category);
                          }}
                          style={{
                            background: 'rgba(147, 112, 219, 0.2)',
                            color: '#a78bfa',
                            border: '1px solid rgba(147, 112, 219, 0.4)',
                            padding: '0.5rem 1rem',
                            borderRadius: '0.5rem',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(147, 112, 219, 0.3)';
                            e.currentTarget.style.borderColor = 'rgba(147, 112, 219, 0.6)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(147, 112, 219, 0.2)';
                            e.currentTarget.style.borderColor = 'rgba(147, 112, 219, 0.4)';
                          }}
                        >
                          🔄 Retake Quiz
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteQuiz(quiz._id, quiz.category);
                          }}
                          style={{
                            background: 'rgba(239, 68, 68, 0.2)',
                            color: '#f87171',
                            border: '1px solid rgba(239, 68, 68, 0.4)',
                            padding: '0.5rem 1rem',
                            borderRadius: '0.5rem',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.3)';
                            e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.6)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                            e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)';
                          }}
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
