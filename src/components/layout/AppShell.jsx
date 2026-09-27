import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import MobileNav from './MobileNav'
import './AppShell.css'

export default function AppShell({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)
  const closeSidebar = () => setSidebarOpen(false)

  return (
    <div className="app-shell">
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
      <div className="app-main">
        <Header onMenuClick={toggleSidebar} />
        <main className="app-content">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  )
}
