import { AlertCircle, Inbox } from 'lucide-react'
import './States.css'

export function EmptyState({
  title = 'No items found',
  description = '',
  icon: Icon = Inbox,
  action = null,
  className = '',
}) {
  return (
    <div className={`empty-state ${className}`}>
      <Icon className="empty-state-icon" size={48} />
      <h3 className="empty-state-title">{title}</h3>
      {description && <p className="empty-state-description">{description}</p>}
      {action && <div className="empty-state-action">{action}</div>}
    </div>
  )
}

export function LoadingState({
  title = 'Loading...',
  description = '',
  className = '',
}) {
  return (
    <div className={`loading-state ${className}`}>
      <div className="loading-spinner"></div>
      <h3 className="loading-state-title">{title}</h3>
      {description && <p className="loading-state-description">{description}</p>}
    </div>
  )
}

export function ErrorState({
  title = 'Something went wrong',
  description = 'Please try again later',
  icon: Icon = AlertCircle,
  action = null,
  className = '',
}) {
  return (
    <div className={`error-state ${className}`}>
      <Icon className="error-state-icon" size={48} />
      <h3 className="error-state-title">{title}</h3>
      {description && <p className="error-state-description">{description}</p>}
      {action && <div className="error-state-action">{action}</div>}
    </div>
  )
}

export function Skeleton({ width = '100%', height = '1rem', className = '' }) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{
        width,
        height,
      }}
    />
  )
}
