import { useState, useEffect } from 'react'
import { Mail, Phone, Book, Calendar, Zap } from 'lucide-react'
import { LoadingState } from '../components/ui'
import { profileService } from '../services'
import './Profile.css'

export default function Profile() {
  const [profile, setProfile] = useState(null)
  const [activity, setActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      setLoading(true)
      setError('')
      const [profileData, activityData] = await Promise.all([
        profileService.getProfile(),
        profileService.getRecentActivity(),
      ])
      setProfile(profileData)
      setActivity(activityData)
    } catch (error) {
      console.error('Failed to load profile:', error)
      setError('Unable to load profile details right now.')
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingState title="Loading profile..." />
  }

  if (error) {
    return <div className="profile-error">{error}</div>
  }

  if (!profile) {
    return <div className="profile-error">Failed to load profile</div>
  }

  return (
    <div className="profile-page">
      {/* Student Header */}
      <div className="profile-header">
        <div className="profile-avatar-large">
          {profile.name.charAt(0).toUpperCase()}
        </div>
        <div className="profile-intro">
          <h1>{profile.name}</h1>
          <p className="profile-rollno">{profile.rollNumber}</p>
          <p className="profile-major">{profile.major}</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="profile-stats">
        <div className="stat-card">
          <Calendar size={20} />
          <div>
            <p className="stat-label">Batch</p>
            <p className="stat-value">{profile.batch}</p>
          </div>
        </div>
        <div className="stat-card">
          <Book size={20} />
          <div>
            <p className="stat-label">Current Semester</p>
            <p className="stat-value">{profile.currentSemester}</p>
          </div>
        </div>
        <div className="stat-card">
          <Zap size={20} />
          <div>
            <p className="stat-label">Current CGPA</p>
            <p className="stat-value">{profile.cgpa.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="profile-section">
        <h2>Contact Information</h2>
        <div className="contact-list">
          <div className="contact-item">
            <Mail size={18} />
            <div>
              <p className="contact-label">Email</p>
              <p className="contact-value">{profile.email}</p>
            </div>
          </div>
          <div className="contact-item">
            <Phone size={18} />
            <div>
              <p className="contact-label">Phone</p>
              <p className="contact-value">{profile.phone}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Academic Information */}
      <div className="profile-section">
        <h2>Academic Information</h2>
        <div className="academic-info">
          <div className="info-item">
            <p className="info-label">Branch</p>
            <p className="info-value">{profile.branch}</p>
          </div>
          <div className="info-item">
            <p className="info-label">Joined</p>
            <p className="info-value">
              {new Date(profile.joinedDate).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="profile-section">
        <h2>Recent Activity</h2>
        {activity.length === 0 ? (
          <p className="empty-activity">No recent activity</p>
        ) : (
          <div className="activity-timeline">
            {activity.map((item) => (
              <div key={item.id} className="timeline-item">
                <div className="timeline-dot"></div>
                <div className="timeline-content">
                  <p className="timeline-title">{item.title}</p>
                  <p className="timeline-time">{item.date}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
