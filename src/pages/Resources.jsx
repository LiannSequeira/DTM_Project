import { useState, useEffect } from 'react'
import { Search, Download, Filter } from 'lucide-react'
import { Button, Input, Select, EmptyState, LoadingState } from '../components/ui'
import { resourcesService } from '../services'
import './Resources.css'

export default function Resources() {
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [semesterFilter, setSemesterFilter] = useState('')
  const [courseFilter, setCourseFilter] = useState('')
  const [yearFilter, setYearFilter] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const courseOptions = [
    { value: 'Data Structures', label: 'Data Structures' },
    { value: 'Computer Networks', label: 'Computer Networks' },
    { value: 'Database Management Systems', label: 'Database Management Systems' },
    { value: 'Full Stack Development', label: 'Full Stack Development' },
    { value: 'General', label: 'General' },
  ]

  const yearOptions = [
    { value: '2022', label: '2022' },
    { value: '2023', label: '2023' },
    { value: '2024', label: '2024' },
    { value: '2025', label: '2025' },
  ]

  useEffect(() => {
    loadResources()
  }, [])

  const loadResources = async () => {
    try {
      setLoading(true)
      const data = await resourcesService.getResources()
      setResources(data)
    } catch (error) {
      console.error('Failed to load resources:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = async () => {
    try {
      setLoading(true)
      const data = await resourcesService.getResources({
        type: typeFilter || undefined,
        semester: semesterFilter ? parseInt(semesterFilter) : undefined,
        courseCode: courseFilter || undefined,
        year: yearFilter ? parseInt(yearFilter) : undefined,
        search: search,
      })
      setResources(data)
    } catch (error) {
      console.error('Failed to filter resources:', error)
      setResources([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (value) => {
    setSearch(value)
  }

  useEffect(() => {
    const timer = setTimeout(handleFilterChange, 300)
    return () => clearTimeout(timer)
  }, [search, typeFilter, semesterFilter, courseFilter, yearFilter])

  if (loading && resources.length === 0) {
    return <LoadingState title="Loading resources..." />
  }

  return (
    <div className="resources-page">
      <div className="resources-header">
        <div className="header-content">
          <h1>Resource Hub</h1>
          <p>Everything you need, organized for your semester.</p>
        </div>
      </div>

      <div className="resources-controls">
        <Input
          type="text"
          placeholder="Search resources..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          icon={Search}
          className="search-input"
        />
        <Button
          variant="secondary"
          onClick={() => setShowFilters(!showFilters)}
          className="filters-toggle"
        >
          <Filter size={18} />
          Filters
        </Button>
      </div>

      {showFilters && (
        <div className="resources-filters">
          <Select
            options={[
              { value: 'Policy', label: 'Official Documents' },
              { value: 'PYQ', label: 'Previous Year Questions' },
            ]}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            placeholder="All types"
          />
          <Select
            options={[
              { value: '1', label: 'Semester 1' },
              { value: '2', label: 'Semester 2' },
              { value: '3', label: 'Semester 3' },
              { value: '4', label: 'Semester 4' },
              { value: '5', label: 'Semester 5' },
              { value: '6', label: 'Semester 6' },
              { value: '7', label: 'Semester 7' },
              { value: '8', label: 'Semester 8' },
            ]}
            value={semesterFilter}
            onChange={(e) => setSemesterFilter(e.target.value)}
            placeholder="All semesters"
          />
          <Select
            options={courseOptions}
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            placeholder="All courses"
          />
          <Select
            options={yearOptions}
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            placeholder="All years"
          />
        </div>
      )}

      {resources.length === 0 ? (
        <EmptyState
          title="No resources found"
          description="Try adjusting your filters or search terms."
        />
      ) : (
        <div className="resources-list">
          {resources.map((resource) => (
            <div key={resource.id} className="resource-item">
              <div className="resource-item-header">
                <h3>{resource.title}</h3>
                <span className={`resource-badge ${resource.type.toLowerCase()}`}>
                  {resource.type}
                </span>
              </div>

              <div className="resource-item-meta">
                {resource.subject && (
                  <span className="meta-item">
                    <strong>Subject:</strong> {resource.subject}
                  </span>
                )}
                {resource.courseCode && resource.courseCode !== '-' && (
                  <span className="meta-item">
                    <strong>Code:</strong> {resource.courseCode}
                  </span>
                )}
                {resource.semester && resource.semester !== '-' && (
                  <span className="meta-item">
                    <strong>Semester:</strong> {resource.semester}
                  </span>
                )}
                {resource.year && (
                  <span className="meta-item">
                    <strong>Year:</strong> {resource.year}
                  </span>
                )}
              </div>

              <div className="resource-item-actions">
                <a href={resource.url} target="_blank" rel="noopener noreferrer">
                  <Button variant="secondary" size="sm">
                    <Download size={16} />
                    Download
                  </Button>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
