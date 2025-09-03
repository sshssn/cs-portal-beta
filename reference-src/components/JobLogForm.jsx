import React, { useState } from 'react'
import { Search, User, MapPin, FileText, Clock, AlertTriangle, Save, X } from 'lucide-react'

const JobLogForm = ({ onSave }) => {
  const [formData, setFormData] = useState({
    customer: '',
    site: '',
    contact: {
      name: '',
      number: '',
      email: '',
      relationship: ''
    },
    description: '',
    jobType: 'Maintenance',
    category: 'Electrical',
    priority: 'Medium',
    targetCompletionTime: 60,
    engineer: '',
    project: '',
    tags: []
  })

  const [searchQuery, setSearchQuery] = useState('')
  const [showCustomerSearch, setShowCustomerSearch] = useState(false)
  const [showSiteSearch, setShowSiteSearch] = useState(false)

  // Mock data - in real app this would come from API
  const customers = [
    { id: 1, name: 'Acme Ltd', sites: ['Site A - Manchester', 'Site B - Birmingham'] },
    { id: 2, name: 'Beta Corp', sites: ['Site C - London', 'Site D - Edinburgh'] },
    { id: 3, name: 'Gamma Inc', sites: ['Site E - Bristol', 'Site F - Leeds'] },
    { id: 4, name: 'Delta Solutions', sites: ['Site G - Cardiff', 'Site H - Glasgow'] }
  ]

  const engineers = [
    'John Doe', 'Tom Brown', 'Sara Lee', 'Ali Hamza', 'Jane Smith', 'Mike Johnson'
  ]

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({ ...prev, [field]: value }))
    }
  }

  const handleCustomerSelect = (customer) => {
    setFormData(prev => ({ ...prev, customer: customer.name, site: '' }))
    setShowCustomerSearch(false)
    setSearchQuery('')
  }

  const handleSiteSelect = (site) => {
    setFormData(prev => ({ ...prev, site }))
    setShowSiteSearch(false)
    setSearchQuery('')
  }

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredSites = formData.customer ? 
    customers.find(c => c.name === formData.customer)?.sites.filter(site =>
      site.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [] : []

  const handleSubmit = (e) => {
    e.preventDefault()
    if (formData.customer && formData.site && formData.contact.name && formData.contact.number) {
      onSave(formData)
    }
  }

  const isFormValid = formData.customer && formData.site && formData.contact.name && formData.contact.number

  return (
    <div className="job-log-form">
      <div className="form-header">
        <h2>Log New Job</h2>
        <p>Capture customer details and job information</p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Customer & Site Selection */}
        <div className="form-section">
          <h3>Customer & Site Information</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Customer *</label>
              <div className="search-input-wrapper">
                <input
                  type="text"
                  placeholder="Search for customer..."
                  value={formData.customer}
                  onChange={(e) => setFormData(prev => ({ ...prev, customer: e.target.value }))}
                  onFocus={() => setShowCustomerSearch(true)}
                  required
                />
                <Search size={16} className="search-icon" />
                {showCustomerSearch && (
                  <div className="search-dropdown">
                    <div className="search-input">
                      <input
                        type="text"
                        placeholder="Type to search customers..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        autoFocus
                      />
                    </div>
                    <div className="search-results">
                      {filteredCustomers.map(customer => (
                        <div
                          key={customer.id}
                          className="search-result-item"
                          onClick={() => handleCustomerSelect(customer)}
                        >
                          <User size={16} />
                          <span>{customer.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label>Site *</label>
              <div className="search-input-wrapper">
                <input
                  type="text"
                  placeholder="Select site..."
                  value={formData.site}
                  onChange={(e) => setFormData(prev => ({ ...prev, site: e.target.value }))}
                  onFocus={() => formData.customer && setShowSiteSearch(true)}
                  disabled={!formData.customer}
                  required
                />
                <MapPin size={16} className="search-icon" />
                {showSiteSearch && formData.customer && (
                  <div className="search-dropdown">
                    <div className="search-input">
                      <input
                        type="text"
                        placeholder="Type to search sites..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        autoFocus
                      />
                    </div>
                    <div className="search-results">
                      {filteredSites.map(site => (
                        <div
                          key={site}
                          className="search-result-item"
                          onClick={() => handleSiteSelect(site)}
                        >
                          <MapPin size={16} />
                          <span>{site}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="form-section">
          <h3>Contact Information</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Contact Name *</label>
              <input
                type="text"
                placeholder="Enter contact name"
                value={formData.contact.name}
                onChange={(e) => handleInputChange('contact.name', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Phone Number *</label>
              <input
                type="tel"
                placeholder="Enter phone number"
                value={formData.contact.number}
                onChange={(e) => handleInputChange('contact.number', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="Enter email address"
                value={formData.contact.email}
                onChange={(e) => handleInputChange('contact.email', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Relationship</label>
              <input
                type="text"
                placeholder="e.g., Site Manager, Supervisor"
                value={formData.contact.relationship}
                onChange={(e) => handleInputChange('contact.relationship', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Job Details */}
        <div className="form-section">
          <h3>Job Details</h3>
          <div className="form-grid">
            <div className="form-group full-width">
              <label>Job Description *</label>
              <textarea
                placeholder="Describe the issue or work required..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                required
              />
            </div>

            <div className="form-group">
              <label>Job Type</label>
              <select
                value={formData.jobType}
                onChange={(e) => handleInputChange('jobType', e.target.value)}
              >
                <option value="Maintenance">Maintenance</option>
                <option value="Repair">Repair</option>
                <option value="Installation">Installation</option>
                <option value="Emergency">Emergency</option>
                <option value="Inspection">Inspection</option>
              </select>
            </div>

            <div className="form-group">
              <label>Category</label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
              >
                <option value="Electrical">Electrical</option>
                <option value="Mechanical">Mechanical</option>
                <option value="Plumbing">Plumbing</option>
                <option value="HVAC">HVAC</option>
                <option value="General">General</option>
              </select>
            </div>

            <div className="form-group">
              <label>Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value)}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            <div className="form-group">
              <label>Target Completion Time (minutes)</label>
              <input
                type="number"
                placeholder="60"
                value={formData.targetCompletionTime}
                onChange={(e) => handleInputChange('targetCompletionTime', parseInt(e.target.value))}
                min="15"
                max="480"
              />
            </div>

            <div className="form-group">
              <label>Engineer</label>
              <select
                value={formData.engineer}
                onChange={(e) => handleInputChange('engineer', e.target.value)}
              >
                <option value="">Select Engineer</option>
                {engineers.map(engineer => (
                  <option key={engineer} value={engineer}>{engineer}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Project</label>
              <input
                type="text"
                placeholder="Project name or number"
                value={formData.project}
                onChange={(e) => handleInputChange('project', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="submit"
            className={`btn btn-primary ${!isFormValid ? 'disabled' : ''}`}
            disabled={!isFormValid}
          >
            <Save size={16} />
            Log Job
          </button>
        </div>
      </form>

      {/* Click outside to close dropdowns */}
      {(showCustomerSearch || showSiteSearch) && (
        <div 
          className="dropdown-overlay"
          onClick={() => {
            setShowCustomerSearch(false)
            setShowSiteSearch(false)
          }}
        />
      )}
    </div>
  )
}

export default JobLogForm
