import { X } from 'lucide-react'
import './Modal.css'

export function Modal({
  isOpen = false,
  onClose,
  title = '',
  children,
  size = 'md',
  closeButton = true,
}) {
  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`modal modal-${size}`}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || closeButton) && (
          <div className="modal-header">
            {title && <h2 className="modal-title">{title}</h2>}
            {closeButton && (
              <button
                className="modal-close"
                onClick={onClose}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            )}
          </div>
        )}
        <div className="modal-content">{children}</div>
      </div>
    </div>
  )
}
