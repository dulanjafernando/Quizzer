import { useNavigate } from 'react-router-dom'
import './App.css'

function Home() {
  const navigate = useNavigate()
  
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

  const handleCategoryClick = (category) => {
    navigate(`/quiz/${category}`)
  }

  return (
    <div className="home-container">
      <div className="home-content">
        <h1 className="home-title">This is our home page</h1>
        <h2 className="categories-heading">Quiz Categories</h2>
        <div className="categories-grid">
          {categories.map((category) => (
            <button
              key={category}
              className="category-button"
              onClick={() => handleCategoryClick(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Home
