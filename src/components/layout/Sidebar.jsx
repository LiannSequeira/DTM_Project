import { Link, useLocation } from 'react-router-dom'
import {
  Home,
  MessageSquare,
  BookOpen,
  Calculator,
  Users,
  MessageCircle,
  User,
  X,
} from 'lucide-react'
import './Sidebar.css'

const navigation = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/chat', label: 'AI Companion', icon: MessageSquare },
  { href: '/resources', label: 'Resource Hub', icon: BookOpen },
  { href: '/cgpa', label: 'CGPA Tools', icon: Calculator },
  { href: '/clubs', label: 'Clubs & Events', icon: Users },
  { href: '/feedback', label: 'Feedback', icon: MessageCircle },
]

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation()

  const isActive = (href) => {
    if (href === '/') return location.pathname === '/'
    return location.pathname.startsWith(href)
  }

  return (
    <>
      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="logo-mark">CC</div>
            <div className="logo-text">
              <h2>Campus Companion</h2>
              <p>Your campus, understood.</p>
            </div>
          </div>
          <button
            className="sidebar-close"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {navigation.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`sidebar-nav-item ${active ? 'active' : ''}`}
                onClick={onClose}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="sidebar-footer">
          <Link to="/profile" className="sidebar-profile" onClick={onClose}>
            <div className="profile-avatar">A</div>
            <div className="profile-info">
              <p className="profile-name">Alex Kumar</p>
              <p className="profile-roll">A2309220001</p>
            </div>
            <User size={18} />
          </Link>
        </div>
      </aside>

      {isOpen && (
        <div className="sidebar-overlay" onClick={onClose} />
      )}
    </>
  )
}
