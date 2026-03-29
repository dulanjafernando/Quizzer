import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from './Navbar'
import { updateProfile } from './api/authApi'
import { showToast } from './utils/toast'
import './App.css'

function EditProfile() {
  const navigate = useNavigate()
  
  // Try to get user details from the stored user object first, fallback to individual items
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
  const [userName] = useState(storedUser.name || localStorage.getItem('userName') || 'User')
  const [userId] = useState(storedUser.id || storedUser._id || localStorage.getItem('userId'))
  const [userEmail] = useState(storedUser.email || localStorage.getItem('userEmail') || 'user@example.com')
  
  const [formData, setFormData] = useState({
    name: userName,
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [passwordMode, setPasswordMode] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (!formData.name.trim()) {
      setError('Name is required')
      return
    }

    if (formData.name.trim() === userName && !formData.newPassword) {
      setError('No changes detected. Please modify your name or password.')
      return
    }

    if (passwordMode) {
      if (!formData.currentPassword) {
        setError('Current password is required to change password')
        return
      }
      if (!formData.newPassword) {
        setError('New password is required')
        return
      }
      if (formData.newPassword.length < 6) {
        setError('New password must be at least 6 characters')
        return
      }
      if (formData.newPassword !== formData.confirmPassword) {
        setError('New passwords do not match')
        return
      }
    }

    try {
      setLoading(true)
      const updateData = { name: formData.name.trim() }
      
      if (passwordMode && formData.newPassword) {
        updateData.newPassword = formData.newPassword
        updateData.currentPassword = formData.currentPassword
      }

      await updateProfile(userId, updateData)
      setSuccess(true)
      showToast('Profile updated successfully!', 'success', 3000, 'top-left')
      localStorage.setItem('userName', formData.name.trim())
      
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }))
      setPasswordMode(false)

      setTimeout(() => {
        navigate('/home')
      }, 2000)
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update profile. Please try again.';
      setError(errorMessage);
      showToast(errorMessage, 'error', 3000, 'top-left');
    } finally {
      setLoading(false)
    }
  }

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const styles = {
    container: {
      minHeight: 'calc(100vh - 70px)',
      background: 'linear-gradient(135deg, #0f172a 0%, #162e4a 50%, #1e3c72 100%)',
      padding: '2rem',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    },
    wrapper: {
      width: '100%',
      maxWidth: '1300px',
      margin: '0 auto'
    },
    breadcrumb: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      marginBottom: '1.5rem',
      fontSize: '0.875rem',
      color: '#94a3b8'
    },
    breadcrumbLink: {
      color: '#60a5fa',
      textDecoration: 'none',
      cursor: 'pointer',
      transition: 'color 0.2s'
    },
    pageHeader: {
      marginBottom: '2rem'
    },
    pageTitle: {
      fontSize: '1.75rem',
      fontWeight: '600',
      color: '#f1f5f9',
      margin: '0 0 0.5rem 0',
      letterSpacing: '-0.025em'
    },
    pageDescription: {
      fontSize: '0.9375rem',
      color: '#cbd5e1',
      margin: 0,
      lineHeight: '1.5'
    },
    card: {
      width: '100%',
      background: 'rgba(30, 41, 59, 0.8)',
      borderRadius: '12px',
      border: '1px solid rgba(148, 163, 184, 0.2)',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
      overflow: 'hidden',
      backdropFilter: 'blur(10px)'
    },
    cardHeader: {
      padding: '1.5rem 2rem',
      borderBottom: '1px solid rgba(148, 163, 184, 0.15)',
      background: 'rgba(15, 23, 42, 0.5)'
    },
    cardTitle: {
      fontSize: '1rem',
      fontWeight: '600',
      color: '#f1f5f9',
      margin: 0,
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    cardBody: {
      padding: '2rem'
    },
    profileHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '1.5rem',
      marginBottom: '2rem',
      paddingBottom: '2rem',
      borderBottom: '1px solid rgba(148, 163, 184, 0.15)'
    },
    avatar: {
      width: '80px',
      height: '80px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: '1.5rem',
      fontWeight: '600',
      flexShrink: 0,
      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
    },
    profileInfo: {
      flex: 1
    },
    profileName: {
      fontSize: '1.25rem',
      fontWeight: '600',
      color: '#f1f5f9',
      margin: '0 0 0.25rem 0'
    },
    profileEmail: {
      fontSize: '0.875rem',
      color: '#94a3b8',
      margin: 0
    },
    alert: {
      padding: '1rem 1.25rem',
      borderRadius: '8px',
      marginBottom: '1.5rem',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '0.75rem',
      fontSize: '0.875rem',
      lineHeight: '1.5'
    },
    alertSuccess: {
      background: 'rgba(16, 185, 129, 0.15)',
      border: '1px solid rgba(16, 185, 129, 0.4)',
      color: '#86efac'
    },
    alertError: {
      background: 'rgba(239, 68, 68, 0.15)',
      border: '1px solid rgba(239, 68, 68, 0.4)',
      color: '#fca5a5'
    },
    alertIcon: {
      flexShrink: 0,
      marginTop: '1px'
    },
    formGroup: {
      marginBottom: '1.5rem'
    },
    label: {
      display: 'block',
      marginBottom: '0.5rem',
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#cbd5e1'
    },
    required: {
      color: '#ef4444',
      marginLeft: '2px'
    },
    input: {
      width: '100%',
      padding: '0.75rem 1rem',
      border: '1px solid rgba(148, 163, 184, 0.3)',
      borderRadius: '8px',
      fontSize: '0.9375rem',
      color: '#f1f5f9',
      backgroundColor: 'rgba(30, 41, 59, 0.5)',
      transition: 'all 0.2s ease',
      boxSizing: 'border-box',
      outline: 'none'
    },
    inputFocus: {
      borderColor: '#667eea',
      boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.15)'
    },
    inputWrapper: {
      position: 'relative'
    },
    passwordToggle: {
      position: 'absolute',
      right: '12px',
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'none',
      border: 'none',
      color: '#94a3b8',
      cursor: 'pointer',
      padding: '4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '4px',
      transition: 'color 0.2s'
    },
    helpText: {
      fontSize: '0.8125rem',
      color: '#94a3b8',
      marginTop: '0.5rem'
    },
    divider: {
      margin: '2rem 0',
      border: 'none',
      borderTop: '1px solid rgba(148, 163, 184, 0.15)'
    },
    toggleSection: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '1rem 1.25rem',
      background: 'rgba(30, 41, 59, 0.6)',
      borderRadius: '8px',
      border: '1px solid rgba(148, 163, 184, 0.2)',
      marginBottom: '1.5rem'
    },
    toggleLabel: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.25rem'
    },
    toggleTitle: {
      fontSize: '0.9375rem',
      fontWeight: '500',
      color: '#f1f5f9'
    },
    toggleDescription: {
      fontSize: '0.8125rem',
      color: '#94a3b8'
    },
    switch: {
      position: 'relative',
      width: '48px',
      height: '26px',
      flexShrink: 0
    },
    switchInput: {
      opacity: 0,
      width: 0,
      height: 0
    },
    switchSlider: {
      position: 'absolute',
      cursor: 'pointer',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#475569',
      transition: '0.3s',
      borderRadius: '26px'
    },
    switchSliderActive: {
      backgroundColor: '#667eea'
    },
    switchKnob: {
      position: 'absolute',
      content: '""',
      height: '20px',
      width: '20px',
      left: '3px',
      bottom: '3px',
      backgroundColor: 'white',
      transition: '0.3s',
      borderRadius: '50%',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)'
    },
    switchKnobActive: {
      transform: 'translateX(22px)'
    },
    passwordSection: {
      padding: '1.5rem',
      background: 'rgba(15, 23, 42, 0.6)',
      borderRadius: '8px',
      border: '1px dashed rgba(102, 126, 234, 0.4)',
      marginBottom: '1.5rem'
    },
    passwordSectionTitle: {
      fontSize: '0.9375rem',
      fontWeight: '600',
      color: '#f1f5f9',
      margin: '0 0 1.25rem 0',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    cardFooter: {
      padding: '1.5rem 2rem',
      borderTop: '1px solid rgba(148, 163, 184, 0.15)',
      background: 'rgba(15, 23, 42, 0.5)',
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '0.75rem'
    },
    btn: {
      padding: '0.625rem 1.25rem',
      borderRadius: '8px',
      fontSize: '0.875rem',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      border: 'none',
      outline: 'none'
    },
    btnSecondary: {
      background: 'rgba(148, 163, 184, 0.15)',
      color: '#cbd5e1',
      border: '1px solid rgba(148, 163, 184, 0.3)'
    },
    btnPrimary: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: '#ffffff',
      boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
    },
    btnDisabled: {
      opacity: 0.6,
      cursor: 'not-allowed'
    }
  }

  return (
    <>
      <Navbar userName={userName} />
      <div style={styles.container}>
        <div style={styles.wrapper}>
          {/* Breadcrumb */}
          <nav style={styles.breadcrumb}>
            <span 
              style={styles.breadcrumbLink}
              onClick={() => navigate('/home')}
            >
              Home
            </span>
            <span>/</span>
            <span>Edit Profile</span>
          </nav>

          {/* Page Header */}
          <div style={styles.pageHeader}>
            <h1 style={styles.pageTitle}>Account Settings</h1>
            <p style={styles.pageDescription}>
              Manage your account information and security preferences
            </p>
          </div>

          {/* Alerts */}
          {success && (
            <div style={{...styles.alert, ...styles.alertSuccess}}>
              <svg style={styles.alertIcon} width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <strong>Profile updated successfully!</strong>
                <p style={{margin: '0.25rem 0 0 0'}}>Redirecting to home page...</p>
              </div>
            </div>
          )}

          {error && (
            <div style={{...styles.alert, ...styles.alertError}}>
              <svg style={styles.alertIcon} width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Main Card */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>
                <svg width="18" height="18" viewBox="0 0 20 20" fill="#64748b">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                Personal Information
              </h2>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div style={styles.cardBody}>
                {/* Profile Header */}
                <div style={styles.profileHeader}>
                  <div style={styles.avatar}>
                    {getInitials(formData.name || userName)}
                  </div>
                  <div style={styles.profileInfo}>
                    <h3 style={styles.profileName}>{formData.name || userName}</h3>
                    <p style={styles.profileEmail}>{userEmail}</p>
                  </div>
                </div>

                {/* Name Field */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    Full Name<span style={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    style={styles.input}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#667eea'
                      e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.15)'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(148, 163, 184, 0.3)'
                      e.target.style.boxShadow = 'none'
                    }}
                  />
                  <p style={styles.helpText}>
                    This name will be displayed across the application
                  </p>
                </div>

                <hr style={styles.divider} />

                {/* Password Toggle */}
                <div style={styles.toggleSection}>
                  <div style={styles.toggleLabel}>
                    <span style={styles.toggleTitle}>Change Password</span>
                    <span style={styles.toggleDescription}>
                      Update your account password
                    </span>
                  </div>
                  <label style={styles.switch}>
                    <input
                      type="checkbox"
                      checked={passwordMode}
                      onChange={(e) => {
                        setPasswordMode(e.target.checked)
                        setError('')
                      }}
                      style={styles.switchInput}
                    />
                    <span style={{
                      ...styles.switchSlider,
                      ...(passwordMode ? styles.switchSliderActive : {})
                    }}>
                      <span style={{
                        ...styles.switchKnob,
                        ...(passwordMode ? styles.switchKnobActive : {})
                      }} />
                    </span>
                  </label>
                </div>

                {/* Password Fields */}
                {passwordMode && (
                  <div style={styles.passwordSection}>
                    <h4 style={styles.passwordSectionTitle}>
                      <svg width="16" height="16" viewBox="0 0 20 20" fill="#cbd5e1">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                      Security Settings
                    </h4>

                    {/* Current Password */}
                    <div style={styles.formGroup}>
                      <label style={styles.label}>
                        Current Password<span style={styles.required}>*</span>
                      </label>
                      <div style={styles.inputWrapper}>
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          name="currentPassword"
                          value={formData.currentPassword}
                          onChange={handleInputChange}
                          placeholder="Enter current password"
                          style={{...styles.input, paddingRight: '2.75rem'}}
                          onFocus={(e) => {
                            e.target.style.borderColor = '#667eea'
                            e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.15)'
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = 'rgba(148, 163, 184, 0.3)'
                            e.target.style.boxShadow = 'none'
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          style={styles.passwordToggle}
                        >
                          {showCurrentPassword ? (
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                              <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                            </svg>
                          ) : (
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* New Password */}
                    <div style={styles.formGroup}>
                      <label style={styles.label}>
                        New Password<span style={styles.required}>*</span>
                      </label>
                      <div style={styles.inputWrapper}>
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          name="newPassword"
                          value={formData.newPassword}
                          onChange={handleInputChange}
                          placeholder="Enter new password"
                          style={{...styles.input, paddingRight: '2.75rem'}}
                          onFocus={(e) => {
                            e.target.style.borderColor = '#667eea'
                            e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.15)'
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = 'rgba(148, 163, 184, 0.3)'
                            e.target.style.boxShadow = 'none'
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          style={styles.passwordToggle}
                        >
                          {showNewPassword ? (
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                              <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                            </svg>
                          ) : (
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </button>
                      </div>
                      <p style={styles.helpText}>
                        Minimum 6 characters required
                      </p>
                    </div>

                    {/* Confirm Password */}
                    <div style={{...styles.formGroup, marginBottom: 0}}>
                      <label style={styles.label}>
                        Confirm New Password<span style={styles.required}>*</span>
                      </label>
                      <div style={styles.inputWrapper}>
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          placeholder="Confirm new password"
                          style={{...styles.input, paddingRight: '2.75rem'}}
                          onFocus={(e) => {
                            e.target.style.borderColor = '#667eea'
                            e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.15)'
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = 'rgba(148, 163, 184, 0.3)'
                            e.target.style.boxShadow = 'none'
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          style={styles.passwordToggle}
                        >
                          {showConfirmPassword ? (
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                              <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                            </svg>
                          ) : (
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </button>
                      </div>
                      {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                        <p style={{...styles.helpText, color: '#fca5a5'}}>
                          Passwords do not match
                        </p>
                      )}
                      {formData.confirmPassword && formData.newPassword === formData.confirmPassword && (
                        <p style={{...styles.helpText, color: '#86efac'}}>
                          ✓ Passwords match
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div style={styles.cardFooter}>
                <button
                  type="button"
                  onClick={() => navigate('/home')}
                  disabled={loading}
                  style={{
                    ...styles.btn,
                    ...styles.btnSecondary,
                    ...(loading ? styles.btnDisabled : {})
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.target.style.background = 'rgba(148, 163, 184, 0.25)'
                      e.target.style.borderColor = 'rgba(148, 163, 184, 0.5)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(148, 163, 184, 0.15)'
                    e.target.style.borderColor = 'rgba(148, 163, 184, 0.3)'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    ...styles.btn,
                    ...styles.btnPrimary,
                    ...(loading ? styles.btnDisabled : {})
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.target.style.background = 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)'
                      e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.5)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)'
                  }}
                >
                  {loading ? (
                    <>
                      <svg 
                        width="16" 
                        height="16" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2"
                        style={{
                          animation: 'spin 1s linear infinite'
                        }}
                      >
                        <circle cx="12" cy="12" r="10" opacity="0.25" />
                        <path d="M12 2a10 10 0 0 1 10 10" />
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  )
}

export default EditProfile