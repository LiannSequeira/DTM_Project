import './Button.css'

export function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  children,
  className = '',
  ...props
}) {
  const baseClasses = `btn btn-${variant} btn-${size}`
  const classes = `${baseClasses} ${className}`

  return (
    <button
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <span className="btn-loading">Loading...</span> : children}
    </button>
  )
}

export function ButtonGroup({ children, className = '' }) {
  return <div className={`button-group ${className}`}>{children}</div>
}
