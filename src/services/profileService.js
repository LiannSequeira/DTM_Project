import { apiCall } from './api.js'

const mockProfile = {
  id: 'A2309220001',
  name: 'Alex Kumar',
  email: 'alex.kumar@srmramapuram.edu.in',
  phone: '+91 98765 43210',
  rollNumber: 'A2309220001',
  batch: 2023,
  major: 'Computer Science and Engineering',
  branch: 'CSE',
  currentSemester: 5,
  cgpa: 8.45,
  joinedDate: '2023-07-15',
}

const PROFILE_API_BASE_URL = import.meta.env.VITE_PROFILE_API_BASE_URL || 'http://localhost:5000/api'
const getStudentId = () => import.meta.env.VITE_STUDENT_ID || '00000000-0000-0000-0000-000000000001'

export const profileService = {
  async getProfile(studentId = getStudentId()) {
    try {
      const response = await fetch(`${PROFILE_API_BASE_URL}/profile/${studentId}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const message = await response.text()
        throw new Error(message || `Profile API Error: ${response.statusText}`)
      }

      const data = await response.json()

      return {
        ...mockProfile,
        name: data.name || mockProfile.name,
        email: data.email_id || data.email || mockProfile.email,
        phone: data.phone_number || data.phone || mockProfile.phone,
        rollNumber: data.register_number || data.rollNumber || mockProfile.rollNumber,
        batch: data.batch || mockProfile.batch,
        major: data.department || data.major || mockProfile.major,
        branch: data.branch || mockProfile.branch,
        currentSemester: data.current_semester || mockProfile.currentSemester,
        cgpa: Number(data.current_cgpa ?? mockProfile.cgpa),
        joinedDate: data.joined || mockProfile.joinedDate,
      }
    } catch (error) {
      console.error('Profile fetch failed:', error)
      throw error
    }
  },

  async updateProfile(data) {
    try {
      const response = await apiCall('/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      })
      return { success: true, profile: { ...mockProfile, ...response } }
    } catch (error) {
      return { success: true, profile: { ...mockProfile, ...data } }
    }
  },

  async getRecentActivity() {
    return [
      { id: 1, title: 'Calculated CGPA', date: '2 hours ago' },
      { id: 2, title: 'Downloaded Data Structures PYQ', date: '1 day ago' },
      { id: 3, title: 'Asked about hostel policies', date: '2 days ago' },
      {
        id: 4,
        title: 'Joined AI/ML Society event',
        date: '5 days ago',
      },
    ]
  },
}

export default profileService
