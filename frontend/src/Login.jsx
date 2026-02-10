import { useState } from 'react'
import './App.css'

function Login() {
  const [form, setForm] = useState({
    email: '',
    password: '',
  })

  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!form.email || !form.password) {
      setError('Please enter both email and password.')
      return
    }

    console.log('Logging in with:', form)
    alert('Login submitted (no real backend yet).')
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="welcome-title">Welcome to our QUIZ World...</h1>
        <h2 className="auth-title">Login</h2>
        {error && <div className="auth-error">{error}</div>}
        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-label">
            Email
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="auth-input"
              placeholder="Enter your email"
            />
          </label>
          <label className="auth-label">
            Password
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="auth-input"
              placeholder="Enter your password"
            />
          </label>
          <button type="submit" className="auth-button">
            Login
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login
