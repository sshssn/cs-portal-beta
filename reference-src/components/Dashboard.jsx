import React, { useState, useEffect } from 'react'
import { Search, Phone, Clock, CheckCircle, AlertCircle, XCircle, MapPin, User, Calendar, FileText, MoreVertical, Edit3 } from 'lucide-react'
import { format, differenceInMinutes, differenceInSeconds } from 'date-fns'

const Dashboard = ({ jobs, onUpdateStatus }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('dateLogged')
  const [sortOrder, setSortOrder] = useState('desc')

  const filteredJobs = jobs
    .filter(job => {
      const matchesSearch = 
        job.jobNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.site.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.engineer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.contact.name.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || job.status === statusFilter
      
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      let aValue, bValue
      
      switch (sortBy) {
        case 'dateLogged':
          aValue = a.dateLogged
          bValue = b.dateLogged
          break
        case 'priority':
          const priorityOrder = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 }
          aValue = priorityOrder[a.priority] || 0
          bValue = priorityOrder[b.priority] || 0
          break
        case 'customer':
          aValue = a.customer
          bValue = b.customer
          break
        default:
          aValue = a[sortBy]
          bValue = b[sortBy]
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

  const getStatusIcon = (status) => {
    switch (status) {
      case 'green':
        return <CheckCircle size={16} className="status-icon green" />
      case 'amber':
        return <AlertCircle size={16} className="status-icon amber" />
      case 'red':
        return <XCircle size={16} className="status-icon red" />
      default:
        return <Clock size={16} className="status-icon" />
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'green':
        return 'Completed'
      case 'amber':
        return 'In Progress'
      case 'red':
        return 'Issue'
      default:
        return 'Unknown'
    }
  }

  const getTimeElapsed = (job) => {
    if (job.status === 'green') {
      return 'Completed'
    }
    
    if (job.status === 'amber') {
      if (job.dateAccepted) {
        const minutesSinceAccepted = differenceInMinutes(new Date(), job.dateAccepted)
        if (minutesSinceAccepted > 20) {
          return `${minutesSinceAccepted}m (Overdue)`
        }
        return `${minutesSinceAccepted}m`
      }
      return 'Pending Acceptance'
    }
    
    if (job.status === 'red') {
      if (job.dateAccepted) {
        const minutesSinceAccepted = differenceInMinutes(new Date(), job.dateAccepted)
        return `${minutesSinceAccepted}m (Critical)`
      }
      return 'Critical'
    }
    
    return '-'
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical':
        return 'priority-critical'
      case 'High':
        return 'priority-high'
      case 'Medium':
        return 'priority-medium'
      case 'Low':
        return 'priority-low'
      default:
        return ''
    }
  }

  const handleStatusUpdate = (jobId, newStatus) => {
    let reason = null
    
    if (newStatus === 'red') {
      reason = prompt('Please provide a reason for the status change:')
      if (!reason) return
    }
    
    onUpdateStatus(jobId, newStatus, reason)
  }

  const handleCall = (phoneNumber) => {
    window.open(`tel:${phoneNumber}`)
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h2>Job Dashboard</h2>
          <p>Track and manage all active jobs</p>
        </div>
        
        <div className="dashboard-controls">
          <div className="search-container">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Statuses</option>
            <option value="green">Completed</option>
            <option value="amber">In Progress</option>
            <option value="red">Issues</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="dateLogged">Sort by Date</option>
            <option value="priority">Sort by Priority</option>
            <option value="customer">Sort by Customer</option>
            <option value="status">Sort by Status</option>
          </select>
        </div>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon green">
            <CheckCircle size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{jobs.filter(j => j.status === 'green').length}</span>
            <span className="stat-label">Completed</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon amber">
            <AlertCircle size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{jobs.filter(j => j.status === 'amber').length}</span>
            <span className="stat-label">In Progress</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon red">
            <XCircle size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{jobs.filter(j => j.status === 'red').length}</span>
            <span className="stat-label">Issues</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{jobs.length}</span>
            <span className="stat-label">Total Jobs</span>
          </div>
        </div>
      </div>

      <div className="jobs-table-container">
        <table className="jobs-table">
          <thead>
            <tr>
              <th>Status</th>
              <th>Job Details</th>
              <th>Customer & Site</th>
              <th>Contact</th>
              <th>Engineer</th>
              <th>Priority</th>
              <th>Time Elapsed</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredJobs.map(job => (
              <tr key={job.id} className={`job-row job-${job.status}`}>
                <td className="status-cell">
                  <div className="status-indicator">
                    {getStatusIcon(job.status)}
                    <span className="status-text">{getStatusLabel(job.status)}</span>
                  </div>
                </td>
                
                <td className="job-details-cell">
                  <div className="job-number">{job.jobNumber}</div>
                  <div className="job-description">{job.description}</div>
                  <div className="job-meta">
                    <span className="job-type">{job.jobType}</span>
                    <span className="job-category">{job.category}</span>
                  </div>
                  <div className="job-dates">
                    <span>Logged: {format(job.dateLogged, 'dd/MM HH:mm')}</span>
                    {job.dateAccepted && (
                      <span>Accepted: {format(job.dateAccepted, 'dd/MM HH:mm')}</span>
                    )}
                  </div>
                </td>
                
                <td className="customer-cell">
                  <div className="customer-name">{job.customer}</div>
                  <div className="site-name">
                    <MapPin size={14} />
                    {job.site}
                  </div>
                </td>
                
                <td className="contact-cell">
                  <div className="contact-name">{job.contact.name}</div>
                  <div className="contact-role">{job.contact.relationship}</div>
                  <div className="contact-phone">
                    <Phone size={14} />
                    {job.contact.number}
                  </div>
                  {job.contact.email && (
                    <div className="contact-email">{job.contact.email}</div>
                  )}
                </td>
                
                <td className="engineer-cell">
                  <div className="engineer-name">
                    <User size={14} />
                    {job.engineer}
                  </div>
                </td>
                
                <td className="priority-cell">
                  <span className={`priority-badge ${getPriorityColor(job.priority)}`}>
                    {job.priority}
                  </span>
                </td>
                
                <td className="time-cell">
                  <div className="time-elapsed">{getTimeElapsed(job)}</div>
                  {job.reason && (
                    <div className="status-reason">{job.reason}</div>
                  )}
                </td>
                
                <td className="actions-cell">
                  <div className="action-buttons">
                    <button
                      className="action-btn call-btn"
                      onClick={() => handleCall(job.contact.number)}
                      title="Call Contact"
                    >
                      <Phone size={14} />
                    </button>
                    
                    {job.status === 'green' && (
                      <button
                        className="action-btn status-btn amber"
                        onClick={() => handleStatusUpdate(job.id, 'amber')}
                        title="Mark as In Progress"
                      >
                        <AlertCircle size={14} />
                      </button>
                    )}
                    
                    {job.status === 'amber' && (
                      <>
                        <button
                          className="action-btn status-btn green"
                          onClick={() => handleStatusUpdate(job.id, 'green')}
                          title="Mark as Completed"
                        >
                          <CheckCircle size={14} />
                        </button>
                        <button
                          className="action-btn status-btn red"
                          onClick={() => handleStatusUpdate(job.id, 'red')}
                          title="Mark as Issue"
                        >
                          <XCircle size={14} />
                        </button>
                      </>
                    )}
                    
                    {job.status === 'red' && (
                      <button
                        className="action-btn status-btn amber"
                        onClick={() => handleStatusUpdate(job.id, 'amber')}
                        title="Resume Job"
                      >
                        <AlertCircle size={14} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredJobs.length === 0 && (
          <div className="no-jobs">
            <FileText size={48} />
            <h3>No jobs found</h3>
            <p>Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
