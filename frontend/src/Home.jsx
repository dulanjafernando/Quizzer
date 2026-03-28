import { useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Navbar from './Navbar'
import { getQuizHistory } from './api/quizHistoryApi'
import './App.css'

function Home() {
  const navigate = useNavigate()
  const location = useLocation()
  const [categoryScores, setCategoryScores] = useState({})
  const [userName] = useState(localStorage.getItem('userName') || 'Guest User')
  
  const categories = [
    'Physics',
    'Combined Maths',
    'Biology',
    'Chemistry',
    'Electronics',
    'History',
    'Accounting',
    'Information Technology'
  ]

  const loadScores = async () => {
    try {
      // Try to load from backend first
      const userId = localStorage.getItem('userId') || 'guest'
      const history = await getQuizHistory(userId)
      
      const scores = {}
      const categoryAttempts = {}
      
      // Group attempts by category, sorted by date
      history.forEach(quiz => {
        if (!categoryAttempts[quiz.category]) {
          categoryAttempts[quiz.category] = []
        }
        categoryAttempts[quiz.category].push({
          score: quiz.score,
          total: quiz.totalQuestions,
          percentage: quiz.percentage.toFixed(1),
          date: quiz.submittedAt
        })
      })
      
      // For each category, get the latest and previous attempt
      Object.keys(categoryAttempts).forEach(category => {
        const attempts = categoryAttempts[category].sort((a, b) => new Date(b.date) - new Date(a.date))
        scores[category] = {
          current: attempts[0], // Latest attempt
          previous: attempts[1] || null // Previous attempt (if exists)
        }
      })
      
      setCategoryScores(scores)
    } catch (error) {
      console.error('Error loading scores from backend:', error)
      
      // Fallback to localStorage
      const scores = {}
      categories.forEach(category => {
        const savedResult = localStorage.getItem(`quizResult_${category}`)
        if (savedResult) {
          try {
            const resultData = JSON.parse(savedResult)
            if (resultData.questions && Array.isArray(resultData.questions) && resultData.questions.length > 0) {
              scores[category] = {
                current: {
                  score: resultData.score || 0,
                  total: resultData.questions.length,
                  percentage: ((resultData.score / resultData.questions.length) * 100).toFixed(1)
                },
                previous: null
              }
            }
          } catch (error) {
            console.error(`Error parsing result for ${category}:`, error)
          }
        }
      })
      setCategoryScores(scores)
    }
  }

  useEffect(() => {
    loadScores()
  }, [location]) // Reload scores when location changes (e.g., navigating back to home)

  const handleCategoryClick = (category) => {
    navigate(`/quiz/${category}`)
  }

  return (
    <>
      <Navbar userName={userName} />
      <div className="home-container">
        <div className="home-content">
          <h1 className="home-title">Welcome to Quiz App</h1>
          <h2 className="categories-heading">Quiz Categories</h2>
          <div className="categories-grid">
            {categories.map((category) => {
              const scoreData = categoryScores[category]
              return (
                <button
                  key={category}
                  className="category-button"
                  onClick={() => handleCategoryClick(category)}
                >
                  <div className="category-name">{category}</div>
                  {scoreData && (
                    <div className="category-score">
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {/* Current Attempt */}
                        <span className="score-badge">
                          {scoreData.current.score}/{scoreData.current.total} ({scoreData.current.percentage}%)
                        </span>
                        {/* Previous Attempt */}
                        {scoreData.previous && (
                          <span style={{
                            fontSize: '0.75rem',
                            color: '#cbd5e1',
                            opacity: 0.8,
                            textAlign: 'center',
                            fontWeight: '400'
                          }}>
                            Prev: {scoreData.previous.score}/{scoreData.previous.total} ({scoreData.previous.percentage}%)
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}

export default Home
