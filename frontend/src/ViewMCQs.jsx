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
          background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
          padding-bottom: 40px;
        }

        .view-mcqs-header {
          background: linear-gradient(135deg, rgba(30, 60, 114, 0.95) 0%, rgba(42, 82, 152, 0.95) 100%);
          padding: 40px 30px;
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
          border-bottom: 2px solid rgba(255, 255, 255, 0.1);
        }

        .view-mcqs-header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: 1400px;
          margin: 0 auto;
        }

        .view-mcqs-title {
          color: white;
          font-size: 2.5em;
          margin: 0;
          font-weight: 700;
          letter-spacing: 0.5px;
        }

        .view-mcqs-back-button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 12px 28px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1.05em;
          font-weight: 600;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .view-mcqs-back-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(102, 126, 234, 0.6);
        }

        .view-mcqs-content {
          max-width: 1400px;
          margin: 0 auto;
          padding: 30px 20px;
        }

        .view-mcqs-filters {
          background: white;
          padding: 25px;
          border-radius: 12px;
          margin-bottom: 30px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
          border-top: 4px solid #667eea;
        }

        .filter-title {
          margin: 0 0 20px 0;
          color: #000;
          font-size: 1.3em;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .category-filter-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }

        .category-filter-btn {
          background: #f5f5f5;
          border: 2px solid #ddd;
          padding: 12px 18px;
          border-radius: 25px;
          cursor: pointer;
          font-size: 0.95em;
          font-weight: 600;
          color: #000;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .category-filter-btn:hover {
          background: #e8e8e8;
          border-color: #667eea;
          color: #000;
          transform: translateY(-2px);
        }

        .category-filter-btn.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-color: #667eea;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .count-badge {
          background: rgba(0, 0, 0, 0.1);
          padding: 3px 10px;
          border-radius: 12px;
          font-size: 0.9em;
          font-weight: bold;
          color: #000;
        }

        .category-filter-btn.active .count-badge {
          background: rgba(255, 255, 255, 0.3);
          color: white;
        }

        .view-mcqs-list {
          background: white;
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
          overflow: hidden;
        }

        .loading-spinner,
        .no-mcqs-message {
          padding: 50px;
          text-align: center;
          color: #000;
          font-size: 1.05em;
          font-weight: 500;
        }

        .mcqs-count {
          padding: 18px 25px;
          background: linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%);
          margin: 0;
          color: #000;
          border-bottom: 1px solid #e8e8e8;
          font-size: 1em;
          font-weight: 600;
        }

        .mcq-card {
          border-bottom: 1px solid #eee;
          padding: 25px;
          cursor: pointer;
          transition: all 0.3s ease;
          background: white;
        }

        .mcq-card:hover {
          background: #f8f9ff;
          border-left: 4px solid #667eea;
          padding-left: 21px;
        }

        .mcq-card:last-child {
          border-bottom: none;
        }

        .mcq-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }

        .mcq-meta {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .mcq-index {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          width: 35px;
          height: 35px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 1em;
          box-shadow: 0 4px 8px rgba(102, 126, 234, 0.3);
        }

        .mcq-category {
          background: linear-gradient(135deg, #e8f0ff 0%, #f0e8ff 100%);
          color: #000;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 0.9em;
          font-weight: 700;
          border: 1px solid #ddd;
        }

        .mcq-time {
          font-size: 0.95em;
          color: #000;
          font-weight: 500;
        }

        .mcq-toggle {
          font-size: 1.3em;
          color: #667eea;
          font-weight: bold;
        }

        .mcq-question {
          margin-bottom: 15px;
          padding-bottom: 15px;
          border-bottom: 2px solid #f0f0f0;
        }

        .mcq-question h4 {
          margin: 0;
          color: #000;
          font-size: 1.2em;
          font-weight: 700;
          line-height: 1.6;
        }

        .mcq-details {
          margin-top: 18px;
          padding-top: 18px;
          border-top: 2px solid #f0f0f0;
        }

        .mcq-options h5,
        .mcq-explanation h5,
        .mcq-image h5 {
          margin: 0 0 12px 0;
          color: #000;
          font-size: 1em;
          text-transform: uppercase;
          font-weight: 700;
          letter-spacing: 0.5px;
        }

        .mcq-options ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .mcq-options li {
          padding: 12px 15px;
          margin: 8px 0;
          background: #f8f9fa;
          border-left: 4px solid #ddd;
          border-radius: 6px;
          display: flex;
          align-items: center;
          gap: 12px;
          transition: all 0.3s ease;
          color: #000;
          font-weight: 500;
        }

        .mcq-options li:hover {
          background: #f0f4ff;
          border-left-color: #667eea;
        }

        .mcq-options li.correct-answer {
          background: linear-gradient(135deg, #e8f5e9 0%, #f1f8f4 100%);
          border-left-color: #4caf50;
          font-weight: 600;
        }

        .option-letter {
          font-weight: bold;
          color: #667eea;
          min-width: 28px;
          font-size: 1.05em;
        }

        .option-text {
          flex: 1;
          color: #000;
          font-weight: 500;
        }

        .correct-badge {
          background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
          color: white;
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 0.8em;
          font-weight: bold;
          white-space: nowrap;
        }

        .mcq-explanation {
          margin-top: 18px;
          padding: 15px 18px;
          background: linear-gradient(135deg, #fff3cd 0%, #fffbf0 100%);
          border-left: 4px solid #ffc107;
          border-radius: 6px;
          border: 1px solid #ffe082;
        }

        .mcq-explanation p {
          margin: 0;
          color: #000;
          font-size: 1em;
          font-weight: 500;
          line-height: 1.6;
        }

        .mcq-image {
          margin-top: 18px;
          padding: 18px;
          background: linear-gradient(135deg, #f0f0f0 0%, #f8f8f8 100%);
          border-radius: 6px;
          border: 1px solid #e0e0e0;
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
