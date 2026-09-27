import { useState } from 'react'
import { Send, CheckCircle } from 'lucide-react'
import { Button, Input, Select, Textarea } from '../components/ui'
import { feedbackService } from '../services'
import './Feedback.css'

const categories = feedbackService.getFeedbackCategories()
const ratings = feedbackService.getRatingOptions()

export default function Feedback() {
  const [category, setCategory] = useState('')
  const [message, setMessage] = useState('')
  const [rating, setRating] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!category || !message) return

    try {
      setLoading(true)
      await feedbackService.submitFeedback({
        category,
        message,
        rating: rating ? parseInt(rating) : undefined,
      })
      setSubmitted(true)
      setTimeout(() => {
        setCategory('')
        setMessage('')
        setRating('')
        setSubmitted(false)
      }, 3000)
    } catch (error) {
      console.error('Failed to submit feedback:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="feedback-page">
      <div className="feedback-header">
        <h1>Help Improve Campus Companion</h1>
        <p>Your feedback helps us build a better platform for you and your peers.</p>
      </div>

      {submitted && (
        <div className="feedback-success">
          <CheckCircle size={24} />
          <p>Thank you for your feedback! We really appreciate it.</p>
        </div>
      )}

      <form className="feedback-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="category">What is your feedback about?</label>
          <Select
            id="category"
            options={categories}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Select a category"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="message">Your Feedback</label>
          <Textarea
            id="message"
            placeholder="Tell us what's on your mind..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={6}
            required
          />
        </div>

        <div className="form-group">
          <label>How satisfied are you? (Optional)</label>
          <div className="rating-options">
            {ratings.map((ratingOption) => (
              <button
                key={ratingOption.value}
                type="button"
                className={`rating-button ${rating === String(ratingOption.value) ? 'selected' : ''}`}
                onClick={() => setRating(String(ratingOption.value))}
                aria-pressed={rating === String(ratingOption.value)}
              >
                <span className="rating-emoji">{ratingOption.label.split(' ')[2]}</span>
                <span className="rating-text">{ratingOption.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="form-actions">
          <Button
            variant="primary"
            size="lg"
            type="submit"
            disabled={!category || !message || loading}
            loading={loading}
          >
            <Send size={18} />
            Submit Feedback
          </Button>
        </div>
      </form>

      <div className="feedback-tips">
        <h3>Tips for helpful feedback:</h3>
        <ul>
          <li>Be specific about what you liked or what could be improved</li>
          <li>Include examples or suggestions when possible</li>
          <li>Help us understand how this affects your campus experience</li>
          <li>Let us know if we can contact you about your feedback</li>
        </ul>
      </div>
    </div>
  )
}
