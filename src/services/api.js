// Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'

// Helper function for API calls
async function apiCall(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      const message = await response.text()
      throw new Error(message || `API Error: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('API Call Error:', error)
    throw error
  }
}

export { apiCall, API_BASE_URL }
