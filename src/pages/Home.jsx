import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  MessageSquare,
  BookOpen,
  Calculator,
  Users,
  MessageCircle,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import { Button } from '../components/ui'
import './Home.css'

export default function Home() {
  const [userName, setUserName] = useState('Alex')
  const [hour, setHour] = useState(new Date().getHours())

  useEffect(() => {
    setHour(new Date().getHours())
  }, [])

  const getTimeGreeting = () => {
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const quickActions = [
    {
      title: 'Find a Question Paper',
      href: '/resources?type=PYQ',
      icon: BookOpen,
    },
    {
      title: 'Check Academic Policies',
      href: '/resources?type=Policy',
      icon: BookOpen,
    },
    {
      title: 'Calculate CGPA',
      href: '/cgpa',
      icon: Calculator,
    },
    {
      title: 'Explore Clubs',
      href: '/clubs',
      icon: Users,
    },
    {
      title: 'Give Feedback',
      href: '/feedback',
      icon: MessageCircle,
    },
  ]

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="home-hero">
        <div className="hero-content">
          <h1 className="hero-greeting">
            {getTimeGreeting()}, <span className="hero-name">{userName}</span>.
          </h1>
          <p className="hero-subheading">What do you need help with today?</p>
          <Link to="/chat">
            <Button variant="primary" size="lg" className="hero-cta">
              <Sparkles size={20} />
              Ask Campus Companion
            </Button>
          </Link>
          <p className="hero-tagline">Your campus, understood.</p>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="home-section">
        <div className="section-header">
          <h2>Quick Actions</h2>
        </div>
        <div className="quick-actions">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Link key={action.title} to={action.href} className="quick-action-card">
                <div className="action-icon">
                  <Icon size={24} />
                </div>
                <p className="action-text">{action.title}</p>
                <ArrowRight size={18} className="action-arrow" />
              </Link>
            )
          })}
        </div>
      </section>

      {/* Recent Activity */}
      <section className="home-section">
        <div className="section-header">
          <h2>Continue Where You Left Off</h2>
          <Link to="/profile" className="section-link">
            View all
          </Link>
        </div>
        <div className="recent-activity">
          <div className="activity-item">
            <div className="activity-icon">
              <Calculator size={20} />
            </div>
            <div className="activity-content">
              <p className="activity-title">Calculated CGPA</p>
              <span className="activity-time">2 hours ago</span>
            </div>
          </div>
          <div className="activity-item">
            <div className="activity-icon">
              <BookOpen size={20} />
            </div>
            <div className="activity-content">
              <p className="activity-title">Downloaded Data Structures PYQ</p>
              <span className="activity-time">1 day ago</span>
            </div>
          </div>
          <div className="activity-item">
            <div className="activity-icon">
              <MessageSquare size={20} />
            </div>
            <div className="activity-content">
              <p className="activity-title">Asked about hostel policies</p>
              <span className="activity-time">2 days ago</span>
            </div>
          </div>
        </div>
      </section>

      {/* Resources Preview */}
      <section className="home-section">
        <div className="section-header">
          <h2>Resources You Might Need</h2>
          <Link to="/resources" className="section-link">
            Explore all
          </Link>
        </div>
        <div className="resources-preview">
          <div className="resource-card">
            <div className="resource-badge">Policy</div>
            <h3>Scholarship Policy</h3>
            <p className="resource-meta">Official • 2024</p>
          </div>
          <div className="resource-card">
            <div className="resource-badge pyq">PYQ</div>
            <h3>Data Structures - Sem 5</h3>
            <p className="resource-meta">CSE2001 • 2023</p>
          </div>
          <div className="resource-card">
            <div className="resource-badge">Policy</div>
            <h3>Hostel Policy</h3>
            <p className="resource-meta">Official • 2024</p>
          </div>
        </div>
      </section>

      {/* Clubs Preview */}
      <section className="home-section">
        <div className="section-header">
          <h2>Join a Club</h2>
          <Link to="/clubs" className="section-link">
            See all
          </Link>
        </div>
        <div className="clubs-preview">
          <div className="club-card">
            <div className="club-header">
              <h3>IEEE Student Branch</h3>
              <span className="club-badge">Technical</span>
            </div>
            <p>Learn cutting-edge technologies and engineering practices.</p>
            <span className="club-upcoming">2 upcoming events</span>
          </div>
          <div className="club-card">
            <div className="club-header">
              <h3>Coding Club</h3>
              <span className="club-badge">Technical</span>
            </div>
            <p>Competitive programming and web development workshops.</p>
            <span className="club-upcoming">3 upcoming events</span>
          </div>
          <div className="club-card">
            <div className="club-header">
              <h3>Cultural Committee</h3>
              <span className="club-badge">Cultural</span>
            </div>
            <p>Music, dance, drama, and other cultural events.</p>
            <span className="club-upcoming">5 upcoming events</span>
          </div>
        </div>
      </section>
    </div>
  )
}
