import { useNavigate } from 'react-router-dom'
import './App.css'

function Navbar({ userName = "User" }) {
  const navigate = useNavigate()

  const handleLogout = () => {
    // TODO: Add logout logic here
    console.log('Logout clicked')
    navigate('/login')
  }

  const handleHistoryClick = () => {
    navigate('/marks')
  }

  const handleProfileClick = () => {
    // TODO: Navigate to profile page
    console.log('Profile clicked')
    // navigate('/profile')
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <h2 className="navbar-logo">Quiz App</h2>
        </div>
        
        <div className="navbar-menu">
          <button className="navbar-btn history-btn" onClick={handleHistoryClick}>
            <span className="btn-icon">📊</span>
            <span className="btn-text">History</span>
          </button>
          
          <div className="navbar-profile" onClick={handleProfileClick}>
            <div className="profile-avatar">
              {userName.charAt(0).toUpperCase()}
            </div>
            <span className="profile-name">{userName}</span>
          </div>
          
          <button className="navbar-btn logout-btn" onClick={handleLogout}>
            <span className="btn-icon">🚪</span>
            <span className="btn-text">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
