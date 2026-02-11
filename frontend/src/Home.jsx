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
      history.forEach(quiz => {
        scores[quiz.category] = {
          score: quiz.score,
          total: quiz.totalQuestions,
          percentage: quiz.percentage.toFixed(1)
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
                score: resultData.score || 0,
                total: resultData.questions.length,
                percentage: ((resultData.score / resultData.questions.length) * 100).toFixed(1)
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
                      <span className="score-badge">
                        {scoreData.score}/{scoreData.total} ({scoreData.percentage}%)
                      </span>
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
