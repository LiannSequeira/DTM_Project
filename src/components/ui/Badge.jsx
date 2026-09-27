import './Badge.css'

export function Badge({
  variant = 'default',
  size = 'md',
  children,
  className = '',
  ...props
}) {
  return (
    <span className={`badge badge-${variant} badge-${size} ${className}`} {...props}>
      {children}
    </span>
  )
}
