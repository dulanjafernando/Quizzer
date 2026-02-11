import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createMCQ } from './api/mcqApi'
import './App.css'

function AddMCQ() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    category: '',
    question: '',
    option1: '',
    option2: '',
    option3: '',
    option4: '',
    correctAnswer: '',
    timeLimit: 60,
    explanation: ''
  })
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setImage(null)
    setImagePreview(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    // Validation
    if (!formData.category || !formData.question || !formData.option1 || !formData.option2 || 
        !formData.option3 || !formData.option4 || !formData.correctAnswer) {
      setError('Please fill in all required fields')
      return
    }

    setLoading(true)

    try {
      const mcqData = {
        category: formData.category,
        question: formData.question,
        image: imagePreview || null,
        options: [formData.option1, formData.option2, formData.option3, formData.option4],
        correctAnswer: formData.correctAnswer,
        timeLimit: parseInt(formData.timeLimit) || 60,
        explanation: formData.explanation || ''
      }

      await createMCQ(mcqData)
      alert('MCQ added successfully!')
      
      // Reset form
      setFormData({
        category: '',
        question: '',
        option1: '',
        option2: '',
        option3: '',
        option4: '',
        correctAnswer: '',
        timeLimit: 60,
        explanation: ''
      })
      setImage(null)
      setImagePreview(null)
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to add MCQ. Please try again.')
      console.error('Error adding MCQ:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBackToDashboard = () => {
    navigate('/admin')
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <div className="admin-header-content">
          <h1 className="admin-header-title">Add MCQ</h1>
          <button className="admin-back-button" onClick={handleBackToDashboard}>
            ← Back to Dashboard
          </button>
        </div>
      </div>

      <div className="admin-content">
        <div className="mcq-form-container">
          {error && <div className="error-message">{error}</div>}
          <form className="mcq-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="form-select"
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Question</label>
              <textarea
                name="question"
                value={formData.question}
                onChange={handleChange}
                className="form-textarea"
                placeholder="Enter your question here..."
                rows="3"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Image (Optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="form-input"
              />
              {imagePreview && (
                <div className="image-preview-container">
                  <img src={imagePreview} alt="Preview" className="image-preview" />
                  <button type="button" onClick={handleRemoveImage} className="remove-image-button">
                    Remove Image
                  </button>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Time Limit (seconds)</label>
              <input
                type="number"
                name="timeLimit"
                value={formData.timeLimit}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter time limit in seconds"
                min="10"
                max="600"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Option 1</label>
              <input
                type="text"
                name="option1"
                value={formData.option1}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter option 1"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Option 2</label>
              <input
                type="text"
                name="option2"
                value={formData.option2}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter option 2"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Option 3</label>
              <input
                type="text"
                name="option3"
                value={formData.option3}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter option 3"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Option 4</label>
              <input
                type="text"
                name="option4"
                value={formData.option4}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter option 4"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Correct Answer</label>
              <select
                name="correctAnswer"
                value={formData.correctAnswer}
                onChange={handleChange}
                className="form-select"
              >
                <option value="">Select Correct Answer</option>
                {formData.option1 && <option value={formData.option1}>{formData.option1}</option>}
                {formData.option2 && <option value={formData.option2}>{formData.option2}</option>}
                {formData.option3 && <option value={formData.option3}>{formData.option3}</option>}
                {formData.option4 && <option value={formData.option4}>{formData.option4}</option>}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Explanation (Optional)</label>
              <textarea
                name="explanation"
                value={formData.explanation}
                onChange={handleChange}
                className="form-textarea"
                placeholder="Enter explanation for this question..."
                rows="3"
              />
            </div>

            <button type="submit" className="form-submit-button" disabled={loading}>
              {loading ? 'Adding...' : 'Add MCQ'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AddMCQ
