import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import AppShell from './components/layout/AppShell'
import Home from './pages/Home'
import Chat from './pages/Chat'
import Resources from './pages/Resources'
import CGPA from './pages/CGPA'
import Clubs from './pages/Clubs'
import Feedback from './pages/Feedback'
import Profile from './pages/Profile'
import './styles/globals.css'

function App() {
  return (
    <Router>
      <AppShell>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/cgpa" element={<CGPA />} />
          <Route path="/clubs" element={<Clubs />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppShell>
    </Router>
  )
}

export default App
