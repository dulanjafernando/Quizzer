import { useState } from 'react'
import './App.css'
import { signup } from './api/authApi'
import { showToast } from './utils/toast'

function Signup() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
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

    if (!form.email || !form.password || !form.confirmPassword) {
      setError('Please fill in all fields.')
      setLoading(false)
      return
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      setLoading(false)
      return
    }

    try {
      const payload = { name: form.name || form.email.split('@')[0], email: form.email, password: form.password }
      const data = await signup(payload)
      if (data && data.token) {
        showToast('Account created successfully', 'success', 3000, 'top-left')
        // navigate to home after toast shows
        setTimeout(() => { window.location.href = '/home' }, 900)
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Signup failed'
      setError(msg)
      showToast(msg, 'error')
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="welcome-title">Welcome to our QUIZ World...</h1>
        <h2 className="auth-title">Sign Up</h2>
        {error && <div className="auth-error">{error}</div>}
        {loading && <div className="auth-loading">🔐 Creating account... Please wait</div>}
        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-label">
            Name
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="auth-input"
              placeholder="Your full name"
              disabled={loading}
            />
          </label>
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
              placeholder="Create a password"
              disabled={loading}
            />
          </label>
          <label className="auth-label">
            Confirm Password
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              className="auth-input"
              placeholder="Re-enter your password"
              disabled={loading}
            />
          </label>
          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? '⏳ Signing up...' : 'Sign Up'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Signup
