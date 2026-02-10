import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllMCQs, updateMCQ, deleteMCQ } from './api/mcqApi'
import './App.css'

function EditMCQ() {
  const navigate = useNavigate()
  const [questions, setQuestions] = useState([])
  const [selectedQuestion, setSelectedQuestion] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [editFormData, setEditFormData] = useState({
    category: '',
    question: '',
    option1: '',
    option2: '',
    option3: '',
    option4: '',
    correctAnswer: '',
    timeLimit: 60
  })
  const [imagePreview, setImagePreview] = useState(null)
  const [newImage, setNewImage] = useState(null)

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

  useEffect(() => {
    fetchQuestions()
  }, [])

  const fetchQuestions = async () => {
    setLoading(true)
    try {
      const data = await getAllMCQs()
      setQuestions(data)
    } catch (error) {
      setError('Failed to load questions')
      console.error('Error fetching questions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBackToDashboard = () => {
    navigate('/admin')
  }

  const handleEditClick = (question) => {
    setSelectedQuestion(question)
    setEditFormData({
      category: question.category,
      question: question.question,
      option1: question.options[0],
      option2: question.options[1],
      option3: question.options[2],
      option4: question.options[3],
      correctAnswer: question.correctAnswer,
      timeLimit: question.timeLimit || 60
    })
    setImagePreview(question.image || null)
    setNewImage(null)
    setIsEditing(true)
  }

  const handleDeleteClick = async (questionId) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        await deleteMCQ(questionId)
        alert('Question deleted successfully!')
        // Refresh the list
        fetchQuestions()
      } catch (error) {
        alert('Failed to delete question')
        console.error('Error deleting question:', error)
      }
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setEditFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setNewImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setNewImage(null)
    setImagePreview(null)
  }

  const handleSaveEdit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      const mcqData = {
        category: editFormData.category,
        question: editFormData.question,
        image: imagePreview || null,
        options: [editFormData.option1, editFormData.option2, editFormData.option3, editFormData.option4],
        correctAnswer: editFormData.correctAnswer,
        timeLimit: parseInt(editFormData.timeLimit) || 60
      }

      await updateMCQ(selectedQuestion._id, mcqData)
      alert('Question updated successfully!')
      setIsEditing(false)
      setSelectedQuestion(null)
      // Refresh the list
      fetchQuestions()
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update question')
      console.error('Error updating question:', error)
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setSelectedQuestion(null)
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <div className="admin-header-content">
          <h1 className="admin-header-title">Edit MCQ</h1>
          <button className="admin-back-button" onClick={handleBackToDashboard}>
            ← Back to Dashboard
          </button>
        </div>
      </div>

      <div className="admin-content">
        {isEditing ? (
          <div className="mcq-form-container">
            <h2 className="edit-title">Edit Question (ID: {selectedQuestion._id})</h2>
            <form className="mcq-form" onSubmit={handleSaveEdit}>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  name="category"
                  value={editFormData.category}
                  onChange={handleChange}
                  className="form-select"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Question</label>
                <textarea
                  name="question"
                  value={editFormData.question}
                  onChange={handleChange}
                  className="form-textarea"
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
                  value={editFormData.timeLimit}
                  onChange={handleChange}
                  className="form-input"
                  min="10"
                  max="600"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Option 1</label>
                <input
                  type="text"
                  name="option1"
                  value={editFormData.option1}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Option 2</label>
                <input
                  type="text"
                  name="option2"
                  value={editFormData.option2}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Option 3</label>
                <input
                  type="text"
                  name="option3"
                  value={editFormData.option3}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Option 4</label>
                <input
                  type="text"
                  name="option4"
                  value={editFormData.option4}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Correct Answer</label>
                <select
                  name="correctAnswer"
                  value={editFormData.correctAnswer}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value={editFormData.option1}>{editFormData.option1}</option>
                  <option value={editFormData.option2}>{editFormData.option2}</option>
                  <option value={editFormData.option3}>{editFormData.option3}</option>
                  <option value={editFormData.option4}>{editFormData.option4}</option>
                </select>
              </div>

              <div className="form-actions">
                <button type="submit" className="form-submit-button">
                  Save Changes
                </button>
                <button type="button" className="form-cancel-button" onClick={handleCancelEdit}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="questions-list-container">
            {loading && <div className="loading-message">Loading questions...</div>}
            {error && <div className="error-message">{error}</div>}
            <div className="questions-list">
              {questions.map((question) => (
                <div key={question._id} className="question-item">
                  <div className="question-header">
                    <span className="question-id">ID: {question._id}</span>
                    <span className="question-category-badge">{question.category}</span>
                  </div>
                  <p className="question-text">{question.question}</p>
                  {question.image && (
                    <div className="question-image-preview">
                      <img src={question.image} alt="Question" className="question-thumbnail" />
                    </div>
                  )}
                  <div className="question-meta">
                    <span className="question-time-badge">⏱ {question.timeLimit || 60}s</span>
                  </div>
                  <div className="question-options">
                    {question.options.map((opt, idx) => (
                      <div key={idx} className="option-preview">
                        {opt} {opt === question.correctAnswer && <span className="correct-badge">✓ Correct</span>}
                      </div>
                    ))}
                  </div>
                  <div className="question-actions">
                    <button className="edit-button" onClick={() => handleEditClick(question)}>
                      Edit
                    </button>
                    <button className="delete-button" onClick={() => handleDeleteClick(question._id)}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default EditMCQ
