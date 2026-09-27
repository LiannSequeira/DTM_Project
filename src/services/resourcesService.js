import { apiCall } from './api.js'

export const resourcesService = {
  async getResources(filters = {}) {
    const params = new URLSearchParams()
    if (filters.search) params.set('search', filters.search)
    if (filters.type) params.set('type', filters.type)
    if (filters.semester) params.set('semester', String(filters.semester))
    if (filters.courseCode) params.set('courseCode', filters.courseCode)
    if (filters.subject) params.set('subject', filters.subject)
    if (filters.year) params.set('year', String(filters.year))

    const response = await apiCall(`/resource-hub/documents?${params.toString()}`)
    return (response.documents || []).map((doc) => ({
      id: doc.id,
      title: doc.title || doc.filename,
      type: doc.sourceType === 'official' ? 'Policy' : 'PYQ',
      subject: doc.subject || 'General',
      semester: doc.semester ?? '-',
      year: doc.year ?? '-',
      courseCode: doc.courseCode || '-',
      url: `/api/documents/${doc.id}/file`,
    }))
  },

  async getResourceById(id) {
    const response = await apiCall(`/documents/${id}`)
    return {
      id: response.id,
      title: response.title || response.filename,
      type: response.sourceType === 'official' ? 'Policy' : 'PYQ',
      subject: response.subject || 'General',
      semester: response.semester ?? '-',
      year: response.year ?? '-',
      courseCode: response.courseCode || '-',
      url: response.url || `/api/documents/${response.id}/file`,
    }
  },

  async getCategories() {
    return [
      { id: 'policies', label: 'Official Documents', type: 'Policy' },
      { id: 'pyq', label: 'Previous Year Questions', type: 'PYQ' },
    ]
  },
}

export default resourcesService
