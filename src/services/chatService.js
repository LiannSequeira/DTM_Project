import { apiCall } from './api.js'

// Chat Service
export const chatService = {
  async sendMessage(message) {
    const response = await apiCall('/chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
    })

    return {
      id: Date.now(),
      message: response.answer || 'No response from backend.',
      sources: (response.citations || []).map((citation) => ({
        id: citation.documentId,
        title: citation.title,
        page: citation.page || 1,
        type: citation.sourceType || 'Policy',
        url: citation.url || `/api/documents/${citation.documentId}/file`,
      })),
      isBot: true,
      timestamp: new Date(),
    }
  },

  async getConversationHistory() {
    const response = await apiCall('/chat/history')
    return response.conversations || []
  },

  async clearChat() {
    return { success: true }
  },
}

export default chatService
