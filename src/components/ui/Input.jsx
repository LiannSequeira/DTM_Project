import './Input.css'
import { AlertCircle } from 'lucide-react'

export function Input({
  type = 'text',
  placeholder = '',
  error = '',
  disabled = false,
  className = '',
  icon: Icon,
  ...props
}) {
  return (
    <div className="input-wrapper">
      {Icon && <Icon className="input-icon" size={18} />}
      <input
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        className={`input ${Icon ? 'input-with-icon' : ''} ${error ? 'input-error' : ''} ${className}`}
        {...props}
      />
      {error && (
        <div className="input-error-message">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}

export function Textarea({
  placeholder = '',
  error = '',
  disabled = false,
  rows = 4,
  className = '',
  ...props
}) {
  return (
    <div className="input-wrapper">
      <textarea
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        className={`textarea ${error ? 'input-error' : ''} ${className}`}
        {...props}
      />
      {error && (
        <div className="input-error-message">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}

export function Label({ htmlFor, children, required = false, className = '' }) {
  return (
    <label htmlFor={htmlFor} className={`input-label ${className}`}>
      {children}
      {required && <span className="required">*</span>}
    </label>
  )
}
