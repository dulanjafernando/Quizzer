import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from './Navbar'
import { getQuizAttemptById } from './api/quizHistoryApi'
import './App.css'

function QuizDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [userName] = useState(localStorage.getItem('userName') || 'Guest User')
  const [quizDetails, setQuizDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true)
        const data = await getQuizAttemptById(id)
        setQuizDetails(data)
        setLoading(false)
      } catch (err) {
        setError('Failed to load quiz details. ' + (err.response?.data?.message || err.message))
        setLoading(false)
      }
    }
    fetchDetails()
  }, [id])

  const handleBack = () => {
    navigate('/marks')
  }

  const handleBackToHome = () => {
    navigate('/home')
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <>
        <Navbar userName={userName} />
        <div className="history-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <div style={{ color: '#3b82f6', fontSize: '1.2rem' }}>Loading quiz details...</div>
        </div>
      </>
    )
  }

  if (error || !quizDetails) {
    return (
      <>
        <Navbar userName={userName} />
        <div className="history-container">
          <div style={{ background: '#ef4444', color: 'white', padding: '1.5rem', borderRadius: '0.5rem', textAlign: 'center', marginTop: '2rem' }}>
            <h3>Oops! Something went wrong</h3>
            <p>{error || 'Quiz not found'}</p>
            <button 
              onClick={handleBack}
              style={{ padding: '0.5rem 1rem', background: 'rgba(0,0,0,0.2)', border: 'none', color: 'white', borderRadius: '0.25rem', marginTop: '1rem', cursor: 'pointer' }}
            >
              ← Back to History
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
          <div className="history-header" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <h1 className="history-title" style={{ margin: 0 }}>Review Details: {quizDetails.category}</h1>
              <div className="history-date" style={{ opacity: 0.8, fontSize: '0.9rem', marginTop: '0.5rem' }}>
                Submitted on {formatDate(quizDetails.submittedAt)}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                className="back-home-btn" 
                onClick={handleBack}
              >
                ← Back to History
              </button>
              <button 
                className="back-home-btn" 
                onClick={handleBackToHome}
              >
                🏠 Home
              </button>
            </div>
          </div>

          <div style={{ 
            background: 'rgba(255,255,255,0.05)', 
            padding: '1.5rem', 
            borderRadius: '0.75rem', 
            marginBottom: '2rem',
            display: 'flex',
            justifyContent: 'space-around',
            textAlign: 'center'
          }}>
            <div>
              <div style={{ fontSize: '0.9rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Result</div>
              <div style={{ 
                fontSize: '1.5rem', 
                fontWeight: 'bold', 
                color: quizDetails.passed ? '#10b981' : '#ef4444' 
              }}>
                {quizDetails.passed ? '✓ PASSED' : '✗ FAILED'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.9rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Score</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f8fafc' }}>
                {quizDetails.score} / {quizDetails.totalQuestions}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.9rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Percentage</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f8fafc' }}>
                {quizDetails.percentage.toFixed(1)}%
              </div>
            </div>
          </div>

          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.75rem' }}>
            Question Breakdown
          </h2>

          {(!quizDetails.reviewDetails || quizDetails.reviewDetails.length === 0) ? (
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '2rem', borderRadius: '0.5rem', textAlign: 'center', color: '#94a3b8' }}>
              <h3 style={{ margin: '0 0 0.5rem 0' }}>No detailed review data</h3>
              <p>This quiz attempt was taken before detailed tracking was enabled.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {quizDetails.reviewDetails.map((detail, index) => (
                <div key={index} style={{ 
                    background: 'rgba(255,255,255,0.03)', 
                    padding: '1.5rem', 
                    borderRadius: '0.75rem',
                    border: '1px solid rgba(255,255,255,0.05)',
                    borderLeft: `4px solid ${detail.isCorrect ? '#10b981' : '#ef4444'}`
                  }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                    <div style={{ 
                      background: detail.isCorrect ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                      color: detail.isCorrect ? '#10b981' : '#ef4444',
                      width: '2rem', height: '2rem', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center', 
                      borderRadius: '50%', fontWeight: 'bold', flexShrink: 0
                    }}>
                      {index + 1}
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: '1.1rem', color: '#f8fafc', lineHeight: '1.5', fontWeight: '500' }}>
                        {detail.question}
                      </p>
                    </div>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                    <div style={{ 
                        background: 'rgba(0,0,0,0.2)', 
                        padding: '1rem', 
                        borderRadius: '0.5rem',
                        border: `1px solid ${detail.isCorrect ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                      }}>
                      <div style={{ color: '#94a3b8', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Your Answer</div>
                      <div style={{ color: detail.isCorrect ? '#10b981' : '#ef4444', fontSize: '1.05rem', fontWeight: '500' }}>
                        {detail.userAnswer || <span style={{ opacity: 0.5, fontStyle: 'italic' }}>Not answered</span>}
                      </div>
                    </div>
                    
                    <div style={{ 
                        background: 'rgba(16, 185, 129, 0.05)', 
                        padding: '1rem', 
                        borderRadius: '0.5rem',
                        border: '1px solid rgba(16, 185, 129, 0.2)'
                      }}>
                      <div style={{ color: '#94a3b8', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Correct Answer</div>
                      <div style={{ color: '#10b981', fontSize: '1.05rem', fontWeight: '500' }}>
                        {detail.correctAnswer}
                      </div>
                    </div>
                  </div>
                  
                  {detail.explanation && (
                    <div style={{ 
                        padding: '1.25rem', 
                        background: 'rgba(59, 130, 246, 0.05)', 
                        borderLeft: '4px solid #3b82f6', 
                        borderRadius: '0 0.5rem 0.5rem 0' 
                      }}>
                      <div style={{ color: '#60a5fa', fontWeight: 'bold', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        💡 Explanation
                      </div>
                      <div style={{ color: '#cbd5e1', lineHeight: '1.6' }}>
                        {detail.explanation}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default QuizDetails
