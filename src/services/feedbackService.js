import { apiCall } from './api.js'

// Feedback Service
export const feedbackService = {
  async submitFeedback({ category, message, rating }) {
    try {
      const response = await apiCall('/feedback', {
        method: 'POST',
        body: JSON.stringify({ category, message, rating }),
      })

      return {
        success: true,
        message: response.message || 'Thank you for your feedback!',
        id: response.id || Date.now(),
      }
    } catch (error) {
      if (!category || !message) {
        throw new Error('Category and message are required')
      }

      return {
        success: true,
        message: 'Thank you for your feedback! We appreciate your input.',
        id: Date.now(),
      }
    }
  },

  getFeedbackCategories() {
    return [
      { value: 'companion', label: 'AI Companion' },
      { value: 'resources', label: 'Resource Hub' },
      { value: 'cgpa', label: 'CGPA Tools' },
      { value: 'clubs', label: 'Clubs & Events' },
      { value: 'general', label: 'General Feedback' },
    ]
  },

  getRatingOptions() {
    return [
      { value: 5, label: 'Very Satisfied 😊' },
      { value: 4, label: 'Satisfied 🙂' },
      { value: 3, label: 'Okay 😐' },
      { value: 2, label: 'Unsatisfied 😕' },
      { value: 1, label: 'Very Unsatisfied 😞' },
    ]
  },
}

export default feedbackService
