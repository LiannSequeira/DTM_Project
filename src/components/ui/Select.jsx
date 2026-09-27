import './Select.css'
import { ChevronDown } from 'lucide-react'

export function Select({
  options = [],
  value = '',
  onChange,
  placeholder = 'Select an option',
  disabled = false,
  error = '',
  className = '',
  ...props
}) {
  return (
    <div className="select-wrapper">
      <div className={`select-container ${error ? 'select-error' : ''}`}>
        <select
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`select ${className}`}
          {...props}
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="select-chevron" size={18} />
      </div>
      {error && <div className="select-error-message">{error}</div>}
    </div>
  )
}
