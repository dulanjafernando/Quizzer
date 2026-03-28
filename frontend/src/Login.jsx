import { useState } from 'react'
import './App.css'
import { login } from './api/authApi'
import { showToast } from './utils/toast'

function Login() {
  const [form, setForm] = useState({
    email: '',
    password: '',
  })

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!form.email || !form.password) {
      setError('Please enter both email and password.')
      setLoading(false)
      return
    }

    try {
      const data = await login({ email: form.email, password: form.password })
      if (data && data.token) {
        showToast('Logged in successfully', 'success', 3000, 'top-left')
        setTimeout(() => { window.location.href = '/home' }, 900)
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed'
      setError(msg)
      showToast(msg, 'error')
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="welcome-title">Welcome to our QUIZ World...</h1>
        <h2 className="auth-title">Login</h2>
        {error && <div className="auth-error">{error}</div>}
        {loading && <div className="auth-loading">🔒 Authenticating... Please wait</div>}
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
              disabled={loading}
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
              disabled={loading}
            />
          </label>
          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? '⏳ Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login
