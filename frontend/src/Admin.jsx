import { useNavigate } from 'react-router-dom'
import './App.css'

function Admin() {
  const navigate = useNavigate()

  const adminCards = [
    { title: 'View All MCQs', description: 'View all quiz questions in the database', icon: '📋', route: '/viewmcqs' },
    { title: 'Add MCQ', description: 'Add new quiz questions to the database', icon: '➕', route: '/addmcq' },
    { title: 'Edit MCQ', description: 'Edit or delete existing quiz questions', icon: '✏️', route: '/editmcq' }
  ]

  const handleCardClick = (route) => {
    navigate(route)
  }

  const handleLogout = () => {
    navigate('/login')
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <div className="admin-header-content">
          <h1 className="admin-header-title">Admin Dashboard</h1>
          <button className="admin-logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      <div className="admin-content">
        <div className="admin-welcome">
          <h2 className="admin-welcome-title">Welcome to Quiz Admin Panel</h2>
          <p className="admin-welcome-text">
            Manage your quiz system, monitor user activity, and configure settings from this dashboard.
          </p>
        </div>

        <div className="admin-grid">
          {adminCards.map((card, idx) => (
            <div 
              key={idx} 
              className="admin-card"
              onClick={() => handleCardClick(card.route)}
            >
              <div className="admin-card-icon">{card.icon}</div>
              <h3 className="admin-card-title">{card.title}</h3>
              <p className="admin-card-description">{card.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Admin
