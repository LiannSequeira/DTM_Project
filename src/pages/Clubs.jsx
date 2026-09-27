import { useState, useEffect } from 'react'
import { Search, Filter, Mail, Users } from 'lucide-react'
import { Button, Input, Select, EmptyState, LoadingState, Badge } from '../components/ui'
import { clubsService } from '../services'
import './Clubs.css'

export default function Clubs() {
  const [activeTab, setActiveTab] = useState('clubs')
  const [clubs, setClubs] = useState([])
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [clubsData, eventsData] = await Promise.all([
        clubsService.getClubs(),
        clubsService.getEvents(),
      ])
      setClubs(clubsData)
      setEvents(eventsData)
    } catch (error) {
      console.error('Failed to load clubs/events:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = async () => {
    try {
      setLoading(true)
      const data = await clubsService.getClubs({
        category: categoryFilter || undefined,
        search: search,
      })
      setClubs(data)
    } catch (error) {
      console.error('Failed to filter clubs:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(handleFilterChange, 300)
    return () => clearTimeout(timer)
  }, [search, categoryFilter])

  if (loading) {
    return <LoadingState title="Loading clubs and events..." />
  }

  const categoryOptions = [
    { value: 'Technical', label: 'Technical Clubs' },
    { value: 'Cultural', label: 'Cultural & Non-Technical' },
    { value: 'Sports', label: 'Sports' },
  ]

  return (
    <div className="clubs-page">
      <div className="clubs-header">
        <div className="header-content">
          <h1>Clubs & Events</h1>
          <p>Join clubs, discover events, and connect with fellow students.</p>
        </div>
      </div>

      <div className="clubs-tabs">
        <button
          className={`tab-button ${activeTab === 'clubs' ? 'active' : ''}`}
          onClick={() => setActiveTab('clubs')}
        >
          Clubs
        </button>
        <button
          className={`tab-button ${activeTab === 'events' ? 'active' : ''}`}
          onClick={() => setActiveTab('events')}
        >
          Events
        </button>
      </div>

      {activeTab === 'clubs' && (
        <>
          <div className="clubs-controls">
            <Input
              type="text"
              placeholder="Search clubs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={Search}
              className="search-input"
            />
            <Button
              variant="secondary"
              onClick={() => setShowFilters(!showFilters)}
              className="filters-toggle"
            >
              <Filter size={18} />
              Category
            </Button>
          </div>

          {showFilters && (
            <div className="clubs-filters">
              <Select
                options={categoryOptions}
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                placeholder="All categories"
              />
            </div>
          )}

          {clubs.length === 0 ? (
            <EmptyState
              title="No clubs found"
              description="Try adjusting your filters or search terms."
            />
          ) : (
            <div className="clubs-grid">
              {clubs.map((club) => (
                <div key={club.id} className="club-item">
                  <div className="club-header-section">
                    <h3>{club.name}</h3>
                    <Badge variant="primary" size="sm">
                      {club.category}
                    </Badge>
                  </div>

                  <p className="club-description">{club.description}</p>

                  <div className="club-info">
                    <div className="info-row">
                      <span className="info-label">President:</span>
                      <span className="info-value">{club.president}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Events:</span>
                      <span className="info-value">{club.upcomingEvents} upcoming</span>
                    </div>
                  </div>

                  <div className="club-contact">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => window.location.href = `mailto:${club.contact}`}
                    >
                      <Mail size={16} />
                      Contact
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'events' && (
        <>
          {events.length === 0 ? (
            <EmptyState
              title="No events scheduled"
              description="Check back later for upcoming events."
            />
          ) : (
            <div className="events-list">
              {events.map((event) => (
                <div key={event.id} className="event-item">
                  <div className="event-header">
                    <h3>{event.title}</h3>
                    <Badge variant="info" size="sm">
                      {new Date(event.date).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Badge>
                  </div>
                  <p className="event-club">
                    <Users size={14} />
                    {event.club}
                  </p>
                  <p className="event-description">{event.description}</p>
                  <Button variant="primary" size="sm">
                    Learn More
                  </Button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
