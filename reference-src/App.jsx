import React, { useState, useEffect } from 'react'
import { Search, Plus, Phone, Clock, CheckCircle, AlertCircle, XCircle, Users, MapPin, User, Calendar, FileText } from 'lucide-react'
import JobLogForm from './components/JobLogForm'
import Dashboard from './components/Dashboard'
import { format, addMinutes, isAfter, differenceInMinutes } from 'date-fns'

function App() {
  const [currentView, setCurrentView] = useState('dashboard')
  const [jobs, setJobs] = useState([
    {
      id: 'JL-1001',
      jobNumber: 'JL-1001',
      customer: 'Acme Ltd',
      site: 'Site A - Manchester',
      engineer: 'John Doe',
      contact: {
        name: 'Jane Smith',
        number: '07123456789',
        email: 'jane@acme.com',
        relationship: 'Site Manager'
      },
      status: 'green',
      priority: 'Medium',
      dateLogged: new Date('2025-01-28T19:00:00'),
      dateAccepted: new Date('2025-01-28T19:15:00'),
      dateOnSite: new Date('2025-01-28T19:45:00'),
      dateCompleted: new Date('2025-01-28T20:30:00'),
      description: 'Routine maintenance of electrical systems',
      jobType: 'Maintenance',
      category: 'Electrical',
      targetCompletionTime: 90, // minutes
      reason: null
    },
    {
      id: 'JL-1002',
      jobNumber: 'JL-1002',
      customer: 'Beta Ltd',
      site: 'Site B - Birmingham',
      engineer: 'Tom Brown',
      contact: {
        name: 'Tom Brown',
        number: '07987654321',
        email: 'tom@beta.com',
        relationship: 'Supervisor'
      },
      status: 'amber',
      priority: 'High',
      dateLogged: new Date('2025-01-28T19:48:00'),
      dateAccepted: new Date('2025-01-28T20:00:00'),
      dateOnSite: null,
      dateCompleted: null,
      description: 'Urgent repair required for HVAC system',
      jobType: 'Repair',
      category: 'Mechanical',
      targetCompletionTime: 120,
      reason: null
    },
    {
      id: 'JL-1003',
      jobNumber: 'JL-1003',
      customer: 'Gamma Inc',
      site: 'Site C - London',
      engineer: 'Sara Lee',
      contact: {
        name: 'Sam White',
        number: '07891234567',
        email: 'sam@gamma.com',
        relationship: 'Site Lead'
      },
      status: 'red',
      priority: 'Critical',
      dateLogged: new Date('2025-01-28T17:00:00'),
      dateAccepted: new Date('2025-01-28T17:30:00'),
      dateOnSite: null,
      dateCompleted: null,
      description: 'Critical system failure - emergency response required',
      jobType: 'Emergency',
      category: 'Electrical',
      targetCompletionTime: 60,
      reason: 'Engineer delayed due to traffic - ETA 20 minutes'
    }
  ])

  // Auto-update job statuses based on time
  useEffect(() => {
    const interval = setInterval(() => {
      setJobs(prevJobs => 
        prevJobs.map(job => {
          if (job.status === 'amber' && job.dateAccepted) {
            const timeSinceAccepted = differenceInMinutes(new Date(), job.dateAccepted)
            
            // If more than 20 minutes since acceptance and not on site, mark as red
            if (timeSinceAccepted > 20 && !job.dateOnSite) {
              return {
                ...job,
                status: 'red',
                reason: 'Engineer not on site within 20 minutes of acceptance'
              }
            }
          }
          
          // If engineer is on site, check completion time
          if (job.status === 'amber' && job.dateOnSite) {
            const timeSinceOnSite = differenceInMinutes(new Date(), job.dateOnSite)
            
            if (timeSinceOnSite > job.targetCompletionTime) {
              return {
                ...job,
                status: 'red',
                reason: 'Work not completed within target time'
              }
            }
          }
          
          return job
        })
      )
    }, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [])

  const addJob = (newJob) => {
    const job = {
      ...newJob,
      id: `JL-${Date.now()}`,
      jobNumber: `JL-${Date.now()}`,
      status: 'green',
      dateLogged: new Date(),
      dateAccepted: null,
      dateOnSite: null,
      dateCompleted: null,
      reason: null
    }
    setJobs([...jobs, job])
    setCurrentView('dashboard')
  }

  const updateJobStatus = (jobId, status, reason = null) => {
    setJobs(prevJobs => 
      prevJobs.map(job => {
        if (job.id === jobId) {
          const updates = { status, reason }
          
          if (status === 'amber') {
            updates.dateAccepted = new Date()
          } else if (status === 'green') {
            updates.dateOnSite = new Date()
            updates.dateCompleted = new Date()
          }
          
          return { ...job, ...updates }
        }
        return job
      })
    )
  }

  const getStatusStats = () => {
    const total = jobs.length
    const green = jobs.filter(j => j.status === 'green').length
    const amber = jobs.filter(j => j.status === 'amber').length
    const red = jobs.filter(j => j.status === 'red').length
    
    return { total, green, amber, red }
  }

  const stats = getStatusStats()

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <h1>Joblogic</h1>
            <span className="subtitle">Customer Service Portal</span>
          </div>
          <div className="header-actions">
            <div className="current-time">
              {format(new Date(), 'HH:mm:ss')}
            </div>
          </div>
        </div>
      </header>

      <div className="app-container">
        {/* Sidebar */}
        <aside className="sidebar">
          <nav className="sidebar-nav">
            <button
              className={`nav-button ${currentView === 'dashboard' ? 'active' : ''}`}
              onClick={() => setCurrentView('dashboard')}
            >
              <Users size={20} />
              Dashboard
            </button>
            <button
              className={`nav-button ${currentView === 'log-job' ? 'active' : ''}`}
              onClick={() => setCurrentView('log-job')}
            >
              <Plus size={20} />
              Log New Job
            </button>
          </nav>

          {/* Quick Stats */}
          <div className="quick-stats">
            <div className="stat-item">
              <span className="stat-label">Total Jobs</span>
              <span className="stat-value">{stats.total}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Completed</span>
              <span className="stat-value stat-green">{stats.green}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">In Progress</span>
              <span className="stat-value stat-amber">{stats.amber}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Issues</span>
              <span className="stat-value stat-red">{stats.red}</span>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          {currentView === 'dashboard' ? (
            <Dashboard 
              jobs={jobs} 
              onUpdateStatus={updateJobStatus}
            />
          ) : (
            <JobLogForm onSave={addJob} />
          )}
        </main>
      </div>
    </div>
  )
}

export default App
