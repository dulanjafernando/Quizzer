import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllMCQs } from './api/mcqApi'
import './App.css'

function ViewMCQs() {
  const navigate = useNavigate()
  const [mcqs, setMcqs] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [expandedId, setExpandedId] = useState(null)

  const categories = [
    'All',
    'Physics',
    'Combined Maths',
    'Biology',
    'Chemistry',
    'Electronics',
    'History',
    'Accounting',
    'Information Technology'
  ]

  useEffect(() => {
    fetchMCQs()
  }, [])

  const fetchMCQs = async () => {
    try {
      setLoading(true)
      const data = await getAllMCQs()
      setMcqs(data)
    } catch (error) {
      console.error('Error fetching MCQs:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredMCQs = selectedCategory === 'All' 
    ? mcqs 
    : mcqs.filter(mcq => mcq.category === selectedCategory)

  const categoryCounts = {}
  mcqs.forEach(mcq => {
    categoryCounts[mcq.category] = (categoryCounts[mcq.category] || 0) + 1
  })

  return (
    <div className="view-mcqs-container">
      <div className="view-mcqs-header">
        <div className="view-mcqs-header-content">
          <h1 className="view-mcqs-title">All MCQs Database</h1>
          <button 
            className="view-mcqs-back-button" 
            onClick={() => navigate('/admin')}
          >
            ← Back to Admin
          </button>
        </div>
      </div>

      <div className="view-mcqs-content">
        {/* Category Filter */}
        <div className="view-mcqs-filters">
          <h3 className="filter-title">Filter by Category</h3>
          <div className="category-filter-buttons">
            {categories.map((category) => (
              <button
                key={category}
                className={`category-filter-btn ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
                <span className="count-badge">
                  {category === 'All' ? mcqs.length : (categoryCounts[category] || 0)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* MCQs Display */}
        <div className="view-mcqs-list">
          {loading ? (
            <div className="loading-spinner">
              <p>Loading MCQs...</p>
            </div>
          ) : filteredMCQs.length === 0 ? (
            <div className="no-mcqs-message">
              <p>No MCQs found in {selectedCategory} category</p>
            </div>
          ) : (
            <>
              <p className="mcqs-count">
                Showing {filteredMCQs.length} question{filteredMCQs.length !== 1 ? 's' : ''}
              </p>
              {filteredMCQs.map((mcq, index) => (
                <div 
                  key={mcq._id} 
                  className="mcq-card"
                  onClick={() => setExpandedId(expandedId === mcq._id ? null : mcq._id)}
                >
                  <div className="mcq-header">
                    <div className="mcq-meta">
                      <span className="mcq-index">{index + 1}</span>
                      <span className="mcq-category">{mcq.category}</span>
                      <span className="mcq-time">⏱️ {mcq.timeLimit}s</span>
                    </div>
                    <div className="mcq-toggle">
                      {expandedId === mcq._id ? '▼' : '▶'}
                    </div>
                  </div>

                  <div className="mcq-question">
                    <h4>{mcq.question}</h4>
                  </div>

                  {expandedId === mcq._id && (
                    <div className="mcq-details">
                      <div className="mcq-options">
                        <h5>Options:</h5>
                        <ul>
                          {mcq.options.map((option, idx) => (
                            <li 
                              key={idx}
                              className={option === mcq.correctAnswer ? 'correct-answer' : ''}
                            >
                              <span className="option-letter">
                                {String.fromCharCode(65 + idx)}.
                              </span>
                              <span className="option-text">{option}</span>
                              {option === mcq.correctAnswer && (
                                <span className="correct-badge">✓ Correct</span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {mcq.explanation && (
                        <div className="mcq-explanation">
                          <h5>Explanation:</h5>
                          <p>{mcq.explanation}</p>
                        </div>
                      )}

                      {mcq.image && (
                        <div className="mcq-image">
                          <h5>Image:</h5>
                          <img src={mcq.image} alt="MCQ" style={{ maxWidth: '100%', marginTop: '10px' }} />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        .view-mcqs-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .view-mcqs-header {
          background: rgba(0, 0, 0, 0.7);
          padding: 30px;
          text-align: center;
        }

        .view-mcqs-header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: 1200px;
          margin: 0 auto;
        }

        .view-mcqs-title {
          color: white;
          font-size: 2em;
          margin: 0;
        }

        .view-mcqs-back-button {
          background: #667eea;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 5px;
          cursor: pointer;
          font-size: 1em;
          transition: background 0.3s;
        }

        .view-mcqs-back-button:hover {
          background: #764ba2;
        }

        .view-mcqs-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }

        .view-mcqs-filters {
          background: white;
          padding: 20px;
          border-radius: 10px;
          margin-bottom: 30px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .filter-title {
          margin: 0 0 15px 0;
          color: #333;
        }

        .category-filter-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .category-filter-btn {
          background: #f0f0f0;
          border: 2px solid #ddd;
          padding: 10px 15px;
          border-radius: 25px;
          cursor: pointer;
          font-size: 0.9em;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .category-filter-btn:hover {
          background: #e8e8e8;
          border-color: #667eea;
        }

        .category-filter-btn.active {
          background: #667eea;
          color: white;
          border-color: #667eea;
        }

        .count-badge {
          background: rgba(0, 0, 0, 0.1);
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 0.85em;
          font-weight: bold;
        }

        .category-filter-btn.active .count-badge {
          background: rgba(255, 255, 255, 0.3);
        }

        .view-mcqs-list {
          background: white;
          border-radius: 10px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .loading-spinner,
        .no-mcqs-message {
          padding: 40px;
          text-align: center;
          color: #666;
        }

        .mcqs-count {
          padding: 15px 20px;
          background: #f9f9f9;
          margin: 0;
          color: #666;
          border-bottom: 1px solid #eee;
          font-size: 0.9em;
        }

        .mcq-card {
          border-bottom: 1px solid #eee;
          padding: 20px;
          cursor: pointer;
          transition: background 0.3s;
        }

        .mcq-card:hover {
          background: #f9f9f9;
        }

        .mcq-card:last-child {
          border-bottom: none;
        }

        .mcq-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .mcq-meta {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .mcq-index {
          background: #667eea;
          color: white;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 0.9em;
        }

        .mcq-category {
          background: #e8f0ff;
          color: #667eea;
          padding: 5px 12px;
          border-radius: 20px;
          font-size: 0.85em;
          font-weight: 600;
        }

        .mcq-time {
          font-size: 0.9em;
          color: #666;
        }

        .mcq-toggle {
          font-size: 1.2em;
          color: #667eea;
        }

        .mcq-question {
          margin-bottom: 15px;
          padding-bottom: 15px;
          border-bottom: 1px solid #eee;
        }

        .mcq-question h4 {
          margin: 0;
          color: #333;
          font-size: 1.1em;
        }

        .mcq-details {
          margin-top: 15px;
          padding-top: 15px;
          border-top: 1px solid #eee;
        }

        .mcq-options h5,
        .mcq-explanation h5,
        .mcq-image h5 {
          margin: 0 0 10px 0;
          color: #667eea;
          font-size: 0.9em;
          text-transform: uppercase;
        }

        .mcq-options ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .mcq-options li {
          padding: 8px 12px;
          margin: 5px 0;
          background: #f9f9f9;
          border-left: 3px solid #ddd;
          border-radius: 3px;
          display: flex;
          align-items: center;
          gap: 10px;
          transition: all 0.3s;
        }

        .mcq-options li.correct-answer {
          background: #e8f5e9;
          border-left-color: #4caf50;
        }

        .option-letter {
          font-weight: bold;
          color: #667eea;
          min-width: 25px;
        }

        .option-text {
          flex: 1;
        }

        .correct-badge {
          background: #4caf50;
          color: white;
          padding: 2px 8px;
          border-radius: 3px;
          font-size: 0.75em;
          font-weight: bold;
        }

        .mcq-explanation {
          margin-top: 15px;
          padding: 12px;
          background: #fff3cd;
          border-left: 3px solid #ffc107;
          border-radius: 3px;
        }

        .mcq-explanation p {
          margin: 0;
          color: #856404;
          font-size: 0.95em;
        }

        .mcq-image {
          margin-top: 15px;
          padding: 12px;
          background: #f0f0f0;
          border-radius: 3px;
        }

        @media (max-width: 768px) {
          .view-mcqs-header-content {
            flex-direction: column;
            gap: 15px;
          }

          .category-filter-buttons {
            flex-direction: column;
          }

          .category-filter-btn {
            width: 100%;
            justify-content: space-between;
          }

          .mcq-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .mcq-meta {
            width: 100%;
            margin-bottom: 10px;
          }
        }
      `}</style>
    </div>
  )
}

export default ViewMCQs
