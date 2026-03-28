import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom'
import './App.css'
import Login from './Login.jsx'
import Signup from './Signup.jsx'
import Home from './Home.jsx'
import Quiz from './Quiz.jsx'
import Admin from './Admin.jsx'
import AddMCQ from './AddMCQ.jsx'
import EditMCQ from './EditMCQ.jsx'
import ViewMCQs from './ViewMCQs.jsx'
import History from './History.jsx'
import QuizDetails from './QuizDetails.jsx'

function AuthPages() {
  return (
    <div className="app-wrapper">
      <div className="app-toggle">
        <Link to="/login" className="toggle-link">
          <button className="toggle-button">
            Login
          </button>
        </Link>
        <Link to="/signup" className="toggle-link">
          <button className="toggle-button">
            Sign Up
          </button>
        </Link>
      </div>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </div>
  )
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/marks" element={<History />} />
        <Route path="/marks/:id" element={<QuizDetails />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/viewmcqs" element={<ViewMCQs />} />
        <Route path="/addmcq" element={<AddMCQ />} />
        <Route path="/editmcq" element={<EditMCQ />} />
        <Route path="/quiz/:category" element={<Quiz />} />
        <Route path="/*" element={<AuthPages />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  )
}

export default App
