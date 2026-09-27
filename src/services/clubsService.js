import { apiCall } from './api.js'

const mockClubs = [
  {
    id: 1,
    name: 'IEEE Student Branch',
    category: 'Technical',
    description: 'Learn cutting-edge technologies and engineering practices',
    president: 'Rajesh Kumar',
    contact: 'ieee@srmramapuram.edu.in',
    upcomingEvents: 2,
  },
  {
    id: 2,
    name: 'Coding Club',
    category: 'Technical',
    description: 'Competitive programming and web development workshops',
    president: 'Priya Sharma',
    contact: 'coding@srmramapuram.edu.in',
    upcomingEvents: 3,
  },
  {
    id: 3,
    name: 'AI/ML Society',
    category: 'Technical',
    description: 'Artificial Intelligence and Machine Learning projects',
    president: 'Vikram Singh',
    contact: 'aiml@srmramapuram.edu.in',
    upcomingEvents: 1,
  },
  {
    id: 4,
    name: 'Cultural Committee',
    category: 'Cultural',
    description: 'Music, dance, drama, and other cultural events',
    president: 'Anjali Patel',
    contact: 'cultural@srmramapuram.edu.in',
    upcomingEvents: 5,
  },
  {
    id: 5,
    name: 'Sports Club',
    category: 'Sports',
    description: 'Football, cricket, basketball, and fitness activities',
    president: 'Arjun Verma',
    contact: 'sports@srmramapuram.edu.in',
    upcomingEvents: 4,
  },
  {
    id: 6,
    name: 'Photography Club',
    category: 'Cultural',
    description: 'Photography and visual arts workshops',
    president: 'Shweta Gupta',
    contact: 'photo@srmramapuram.edu.in',
    upcomingEvents: 2,
  },
]

const mockEvents = [
  {
    id: 1,
    title: 'Hackathon 2024',
    club: 'Coding Club',
    date: '2024-10-15',
    description: '24-hour coding competition',
  },
  {
    id: 2,
    title: 'Tech Talks Series',
    club: 'IEEE Student Branch',
    date: '2024-09-25',
    description: 'Industry experts sharing insights',
  },
  {
    id: 3,
    title: 'Annual Sports Championship',
    club: 'Sports Club',
    date: '2024-11-01',
    description: 'Inter-department sports competition',
  },
]

export const clubsService = {
  async getClubs(filters = {}) {
    try {
      const params = new URLSearchParams()
      if (filters.category) params.set('category', filters.category)
      if (filters.search) params.set('search', filters.search)

      const response = await apiCall(`/clubs?${params.toString()}`)
      return response.clubs || []
    } catch (error) {
      console.warn('Clubs backend unavailable, using fallback data.', error)
      let results = mockClubs

      if (filters.category) {
        results = results.filter((c) => c.category === filters.category)
      }
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        results = results.filter(
          (c) => c.name.toLowerCase().includes(searchLower) || c.description.toLowerCase().includes(searchLower)
        )
      }

      return results
    }
  },

  async getClubById(id) {
    const clubs = await this.getClubs()
    return clubs.find((c) => String(c.id) === String(id)) || mockClubs.find((c) => String(c.id) === String(id))
  },

  async getEvents() {
    try {
      const response = await apiCall('/events')
      return response.events || []
    } catch (error) {
      return mockEvents
    }
  },

  async getCategories() {
    return [
      { value: 'Technical', label: 'Technical Clubs' },
      { value: 'Cultural', label: 'Cultural & Non-Technical' },
      { value: 'Sports', label: 'Sports' },
    ]
  },
}

export default clubsService
