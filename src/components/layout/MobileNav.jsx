import { Link, useLocation } from 'react-router-dom'
import {
  Home,
  MessageSquare,
  BookOpen,
  Calculator,
  Users,
} from 'lucide-react'
import './MobileNav.css'

const mobileNavItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/chat', icon: MessageSquare, label: 'Chat' },
  { href: '/resources', icon: BookOpen, label: 'Resources' },
  { href: '/cgpa', icon: Calculator, label: 'CGPA' },
  { href: '/clubs', icon: Users, label: 'Clubs' },
]

export default function MobileNav() {
  const location = useLocation()

  const isActive = (href) => {
    if (href === '/') return location.pathname === '/'
    return location.pathname.startsWith(href)
  }

  return (
    <nav className="mobile-nav">
      {mobileNavItems.map((item) => {
        const Icon = item.icon
        const active = isActive(item.href)
        return (
          <Link
            key={item.href}
            to={item.href}
            className={`mobile-nav-item ${active ? 'active' : ''}`}
            aria-label={item.label}
          >
            <Icon size={24} />
            <span>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
