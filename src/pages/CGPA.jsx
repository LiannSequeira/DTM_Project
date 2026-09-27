import { useState } from 'react'
import { Plus, Trash2, TrendingUp } from 'lucide-react'
import { Button, Input, Select } from '../components/ui'
import { cgpaService } from '../services'
import './CGPA.css'

const gradeOptions = cgpaService.getGradePoints()

export default function CGPA() {
  const [activeTab, setActiveTab] = useState('calculate')
  const [subjects, setSubjects] = useState([])
  const [editingIndex, setEditingIndex] = useState(null)
  const [currentCGPA, setCurrentCGPA] = useState('')
  const [completedCredits, setCompletedCredits] = useState('')
  const [targetCGPA, setTargetCGPA] = useState('')
  const [upcomingCredits, setUpcomingCredits] = useState('')
  const [predictResult, setPredictResult] = useState(null)

  const cgpaResult = cgpaService.calculateCGPA(subjects)

  const handleAddSubject = () => {
    setSubjects((prev) => [...prev, { name: '', credits: '', grade: '', gradePoint: '' }])
    setEditingIndex(subjects.length)
  }

  const handleUpdateSubject = (index, field, value) => {
    const updated = [...subjects]
    updated[index] = { ...updated[index], [field]: value }

    if (field === 'grade') {
      const selectedGrade = gradeOptions.find((g) => String(g.value) === value)
      if (selectedGrade) {
        updated[index].grade = String(selectedGrade.value)
        updated[index].gradePoint = selectedGrade.value
      }
    }

    setSubjects(updated)
  }

  const handleDeleteSubject = (index) => {
    setSubjects(subjects.filter((_, i) => i !== index))
    setEditingIndex(null)
  }

  const handlePredict = () => {
    const result = cgpaService.predictCGPA({
      currentCGPA,
      completedCredits,
      targetCGPA,
      upcomingCredits,
    })
    setPredictResult(result)
  }

  const resetForm = () => {
    setCurrentCGPA('')
    setCompletedCredits('')
    setTargetCGPA('')
    setUpcomingCredits('')
    setPredictResult(null)
  }

  return (
    <div className="cgpa-page">
      <div className="cgpa-header">
        <div className="header-content">
          <h1>CGPA Tools</h1>
          <p>Calculate and plan your academic performance.</p>
        </div>
      </div>

      <div className="cgpa-tabs">
        <button
          className={`tab-button ${activeTab === 'calculate' ? 'active' : ''}`}
          onClick={() => setActiveTab('calculate')}
        >
          Calculate CGPA
        </button>
        <button
          className={`tab-button ${activeTab === 'predict' ? 'active' : ''}`}
          onClick={() => setActiveTab('predict')}
        >
          Predict CGPA
        </button>
      </div>

      {activeTab === 'calculate' && (
        <div className="cgpa-section">
          <div className="calculator-wrapper">
            <div className="calculator-content">
              <h3>Add Your Subjects</h3>

              <div className="subjects-list">
                {subjects.map((subject, idx) => (
                  <div key={idx} className="subject-row">
                    <Input
                      type="text"
                      placeholder="Subject name"
                      value={subject.name}
                      onChange={(e) => handleUpdateSubject(idx, 'name', e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder="Credits"
                      min="0"
                      step="0.5"
                      value={subject.credits}
                      onChange={(e) => handleUpdateSubject(idx, 'credits', e.target.value)}
                    />
                    <Select
                      options={gradeOptions}
                      value={subject.grade}
                      onChange={(e) => handleUpdateSubject(idx, 'grade', e.target.value)}
                      placeholder="Select grade"
                    />
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteSubject(idx)}
                      className="delete-btn"
                    >
                      <Trash2 size={18} />
                    </Button>
                  </div>
                ))}
              </div>

              <Button
                variant="secondary"
                onClick={handleAddSubject}
                className="add-subject-btn"
              >
                <Plus size={18} />
                Add Subject
              </Button>
            </div>

            {subjects.length > 0 && (
              <div className="cgpa-result">
                <div className="result-display">
                  <p className="result-label">Your CGPA</p>
                  <div className="result-value">{cgpaResult.cgpa.toFixed(2)}</div>
                </div>

                <div className="result-stats">
                  <div className="stat">
                    <p className="stat-label">Total Credits</p>
                    <p className="stat-value">{cgpaResult.totalCredits.toFixed(1)}</p>
                  </div>
                  <div className="stat">
                    <p className="stat-label">Total Points</p>
                    <p className="stat-value">{cgpaResult.totalPoints.toFixed(1)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'predict' && (
        <div className="cgpa-section">
          <div className="predictor-wrapper">
            <div className="predictor-form">
              <h3>Predict Your Target CGPA</h3>

              <div className="form-group">
                <label htmlFor="current-cgpa">Current CGPA</label>
                <Input
                  id="current-cgpa"
                  type="number"
                  placeholder="e.g. 8.5"
                  min="0"
                  max="4"
                  step="0.01"
                  value={currentCGPA}
                  onChange={(e) => setCurrentCGPA(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="completed-credits">Completed Credits</label>
                <Input
                  id="completed-credits"
                  type="number"
                  placeholder="e.g. 60"
                  min="0"
                  step="0.5"
                  value={completedCredits}
                  onChange={(e) => setCompletedCredits(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="target-cgpa">Target CGPA</label>
                <Input
                  id="target-cgpa"
                  type="number"
                  placeholder="e.g. 9.0"
                  min="0"
                  max="4"
                  step="0.01"
                  value={targetCGPA}
                  onChange={(e) => setTargetCGPA(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="upcoming-credits">Upcoming Credits</label>
                <Input
                  id="upcoming-credits"
                  type="number"
                  placeholder="e.g. 20"
                  min="0"
                  step="0.5"
                  value={upcomingCredits}
                  onChange={(e) => setUpcomingCredits(e.target.value)}
                />
              </div>

              <div className="form-actions">
                <Button variant="primary" onClick={handlePredict} className="predict-btn">
                  <TrendingUp size={18} />
                  Calculate Required GPA
                </Button>
                <Button
                  variant="secondary"
                  onClick={resetForm}
                  disabled={
                    !currentCGPA && !completedCredits && !targetCGPA && !upcomingCredits
                  }
                >
                  Clear
                </Button>
              </div>
            </div>

            {predictResult && (
              <div className={`prediction-result ${predictResult.achievable ? 'success' : 'warning'}`}>
                <p className="result-label">Required Average Grade Point</p>
                <div className="result-value">
                  {predictResult.requiredGPA.toFixed(2)}/4.0
                </div>
                <div className={`result-status ${predictResult.achievable ? 'achievable' : 'not-achievable'}`}>
                  {predictResult.message}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
