import { useState, useEffect, useRef } from 'react'
import { Send, Trash2, ExternalLink } from 'lucide-react'
import { Button, EmptyState, LoadingState } from '../components/ui'
import { chatService } from '../services'
import './Chat.css'

const suggestedPrompts = [
  "What are the hostel rules?",
  "Find me Semester 5 question papers.",
  "How is CGPA calculated?",
  "What scholarships are available?",
  "Show me previous papers for Data Structures.",
]

export default function Chat() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(true)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    loadConversationHistory()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadConversationHistory = async () => {
    try {
      const history = await chatService.getConversationHistory()
      setMessages(history)
    } catch (error) {
      console.error('Failed to load history:', error)
    } finally {
      setLoadingHistory(false)
    }
  }

  const handleSendMessage = async (messageText = input) => {
    if (!messageText.trim()) return

    // Add user message
    const userMessage = {
      id: Math.random(),
      message: messageText,
      isBot: false,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const response = await chatService.sendMessage(messageText)
      const botMessage = {
        id: response.id,
        message: response.message,
        isBot: true,
        sources: response.sources,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botMessage])
    } catch (error) {
      console.error('Failed to send message:', error)
      const errorMessage = {
        id: Math.random(),
        message: 'Sorry, something went wrong. Please try again later.',
        isBot: true,
        timestamp: new Date(),
        error: true,
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleClearChat = async () => {
    if (!window.confirm('Clear conversation history?')) return
    try {
      await chatService.clearChat()
      setMessages([])
    } catch (error) {
      console.error('Failed to clear chat:', error)
    }
  }

  const handleSuggestedPrompt = (prompt) => {
    handleSendMessage(prompt)
  }

  if (loadingHistory) {
    return <LoadingState title="Loading conversation..." />
  }

  return (
    <div className="chat-page">
      <div className="chat-header">
        <div className="chat-header-content">
          <h1>AI Companion</h1>
          <p>Ask about your campus, academics, resources, policies and more.</p>
        </div>
        {messages.length > 0 && (
          <button
            className="chat-clear-btn"
            onClick={handleClearChat}
            aria-label="Clear chat"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>

      <div className="chat-container">
        {messages.length === 0 ? (
          <div className="chat-empty">
            <EmptyState
              title="Start your conversation"
              description="Ask anything about your campus, academics, or resources."
            />

            <div className="suggested-prompts">
              <h3>Suggested questions:</h3>
              <div className="prompts-grid">
                {suggestedPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    className="prompt-button"
                    onClick={() => handleSuggestedPrompt(prompt)}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="messages-container">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`message ${msg.isBot ? 'bot' : 'user'} ${
                    msg.error ? 'error' : ''
                  }`}
                >
                  <div className="message-content">
                    <p className="message-text">{msg.message}</p>

                    {msg.isBot && msg.sources && msg.sources.length > 0 && (
                      <div className="message-sources">
                        <h4>Sources:</h4>
                        <div className="sources-list">
                          {msg.sources.map((source) => (
                            <div key={source.id} className="source-card">
                              <div className="source-info">
                                <p className="source-title">{source.title}</p>
                                <div className="source-meta">
                                  <span className="source-type">{source.type}</span>
                                  {source.page && (
                                    <span className="source-page">p. {source.page}</span>
                                  )}
                                </div>
                              </div>
                              <a
                                href={source.url || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="source-link"
                                aria-label={`Open ${source.title}`}
                              >
                                <ExternalLink size={16} />
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <span className="message-time">
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              ))}
              {loading && (
                <div className="message bot loading">
                  <div className="message-content">
                    <div className="loading-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </>
        )}
      </div>

      <div className="chat-input-area">
        <div className="chat-input-wrapper">
          <input
            type="text"
            placeholder="Type your question here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSendMessage()
              }
            }}
            disabled={loading}
            className="chat-input"
          />
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleSendMessage()}
            disabled={!input.trim() || loading}
            className="chat-send-btn"
          >
            <Send size={18} />
          </Button>
        </div>
        <p className="chat-disclaimer">
          Campus Companion can make mistakes. Always verify important information.
        </p>
      </div>
    </div>
  )
}
