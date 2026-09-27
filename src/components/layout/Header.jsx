import { Menu } from 'lucide-react'
import './Header.css'

export default function Header({ onMenuClick }) {
  return (
    <header className="header">
      <button
        className="header-menu-btn"
        onClick={onMenuClick}
        aria-label="Toggle menu"
      >
        <Menu size={24} />
      </button>
      <div className="header-logo">
        <div className="logo-mark">CC</div>
        <span>Campus Companion</span>
      </div>
      <div className="header-spacer"></div>
    </header>
  )
}
