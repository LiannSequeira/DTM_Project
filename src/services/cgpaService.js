import { apiCall } from './api.js'

// CGPA Services
export const cgpaService = {
  async calculateCGPA(subjects) {
    try {
      const response = await apiCall('/cgpa/calculate', {
        method: 'POST',
        body: JSON.stringify({ subjects }),
      })
      return response
    } catch (error) {
      if (!subjects || subjects.length === 0) {
        return { cgpa: 0, totalCredits: 0, totalPoints: 0 }
      }

      let totalCredits = 0
      let totalPoints = 0

      subjects.forEach((subject) => {
        const credits = parseFloat(subject.credits) || 0
        const gradePoint = parseFloat(subject.gradePoint) || 0
        totalCredits += credits
        totalPoints += credits * gradePoint
      })

      const cgpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : 0

      return {
        cgpa: parseFloat(cgpa),
        totalCredits,
        totalPoints,
      }
    }
  },

  async predictCGPA({ currentCGPA, completedCredits, targetCGPA, upcomingCredits }) {
    try {
      const response = await apiCall('/cgpa/predict', {
        method: 'POST',
        body: JSON.stringify({ currentCGPA, completedCredits, targetCGPA, upcomingCredits }),
      })
      return response
    } catch (error) {
      const currentCGPANum = parseFloat(currentCGPA) || 0
      const completedNum = parseFloat(completedCredits) || 0
      const targetNum = parseFloat(targetCGPA) || 0
      const upcomingNum = parseFloat(upcomingCredits) || 0

      if (upcomingNum <= 0) {
        return {
          requiredGPA: 0,
          achievable: false,
          message: 'Please enter upcoming credits',
        }
      }

      const numerator = targetNum * (completedNum + upcomingNum) - currentCGPANum * completedNum
      const requiredGPA = numerator / upcomingNum
      const achievable = requiredGPA >= 0 && requiredGPA <= 4.0

      return {
        requiredGPA: parseFloat(requiredGPA.toFixed(2)),
        achievable,
        message: achievable
          ? `You need an average of ${requiredGPA.toFixed(2)}/4.0 in the next ${upcomingNum} credits to achieve ${targetNum} CGPA.`
          : `It's not possible to achieve ${targetNum} CGPA with ${requiredGPA.toFixed(2)}/4.0 in upcoming credits.`,
      }
    }
  },

  getGradePoints() {
    return [
      { label: 'A (10/10)', value: 4.0 },
      { label: 'A- (9.5/10)', value: 3.7 },
      { label: 'B+ (9/10)', value: 3.3 },
      { label: 'B (8.5/10)', value: 3.0 },
      { label: 'B- (8/10)', value: 2.7 },
      { label: 'C+ (7.5/10)', value: 2.3 },
      { label: 'C (7/10)', value: 2.0 },
      { label: 'C- (6.5/10)', value: 1.7 },
      { label: 'D (6/10)', value: 1.0 },
      { label: 'F (< 6/10)', value: 0.0 },
    ]
  },
}

export default cgpaService
