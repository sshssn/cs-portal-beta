# Engineer Action Alerts

This feature provides two separate action-based alerts for jobs:

## 1. Engineer Accept Alert
- **Triggered when**: A job is allocated to an engineer but not yet accepted
- **Status**: Job status is 'allocated' and `dateAccepted` is null
- **Action Required**: Engineer needs to accept the job

## 2. Engineer Onsite Alert
- **Triggered when**: A job is accepted by engineer but they haven't arrived on site
- **Status**: Job has `dateAccepted` but `dateOnSite` is null
- **Action Required**: Engineer needs to arrive on site

## Features

### Alert Display
- **Visual Indicators**: Different colors and icons for each alert type
- **Priority Badges**: Shows job priority (Critical, High, Medium, Low)
- **Job Information**: Job number, customer, site, and engineer details
- **Timestamp**: When the alert was triggered

### Interactive Functionality
- **Click to View**: Click on any alert to see detailed information
- **Engineer Details**: View complete engineer information including:
  - Contact details (phone, email)
  - Current status
  - Shift timing
  - Holiday status

### Action Buttons
- **Call Engineer**: Direct phone call to engineer (uses `tel:` protocol)
- **Email Engineer**: Opens email client with engineer's email address
- **Resolve Alert**: Mark alert as resolved with resolution notes

### Resolution Process
- **Automatic Status Update**: Resolving an alert automatically updates the job status
- **Engineer Accept Alert**: Sets `dateAccepted` and changes status to 'attended'
- **Engineer Onsite Alert**: Sets `dateOnSite` and changes status to 'attended'

## Navigation

### Access Methods
1. **Master Dashboard**: Click the "Engineer Alerts" button (blue button with User icon)
2. **Sidebar Navigation**: Use the "Engineer Alerts" menu item in the left sidebar
3. **Direct URL**: Navigate to `/engineer-alerts` (if using React Router)

### Integration
- **Existing Alert System**: Integrates with the current Global Alerts Portal
- **Job Management**: Updates job statuses automatically when alerts are resolved
- **Real-time Updates**: Alerts update in real-time as job statuses change

## Technical Implementation

### Components
- `EngineerActionAlerts.tsx`: Main alert display component
- `EngineerAlertsPage.tsx`: Page wrapper with navigation
- Updated `MasterDashboard.tsx`: Added Engineer Alerts button
- Updated `NavigationSidebar.tsx`: Added navigation menu item

### Data Flow
1. Jobs are loaded from localStorage
2. Alerts are generated based on job status and dates
3. User interactions update job statuses
4. Changes are saved back to localStorage
5. UI updates reflect current state

### Alert Generation Logic
```typescript
// Engineer Accept Alert
if (job.status === 'allocated' && !job.dateAccepted) {
  // Generate ENGINEER_ACCEPT alert
}

// Engineer Onsite Alert  
if (job.dateAccepted && !job.dateOnSite && job.status !== 'completed') {
  // Generate ENGINEER_ONSITE alert
}
```

## Usage Examples

### Scenario 1: New Job Allocation
1. Job is created and allocated to Engineer John Smith
2. Engineer Accept Alert appears in blue
3. Click alert to view details
4. Use "Call Engineer" to contact John
5. Resolve alert when John accepts the job

### Scenario 2: Engineer Accepted but Not Onsite
1. Job shows Engineer Onsite Alert in green
2. Click alert to view John's details
3. Use "Email Engineer" to send reminder
4. Resolve alert when John arrives on site

## Customization

### Alert Colors
- **Engineer Accept**: Blue theme (`bg-blue-50 border-blue-200`)
- **Engineer Onsite**: Green theme (`bg-green-50 border-green-200`)

### Alert Icons
- **Engineer Accept**: User icon (`User`)
- **Engineer Onsite**: Map pin icon (`MapPin`)

### SLA Integration
- Alerts respect existing job SLA configurations
- Custom alert thresholds can be set per job
- Priority-based alert sorting

## Future Enhancements

### Planned Features
- **Push Notifications**: Real-time browser notifications
- **SMS Integration**: Text message alerts to engineers
- **Escalation Rules**: Automatic escalation for overdue alerts
- **Reporting**: Alert response time analytics
- **Mobile App**: Native mobile app integration

### Configuration Options
- **Alert Thresholds**: Customizable timing for alert generation
- **Notification Preferences**: User-configurable alert delivery methods
- **Auto-resolution**: Automatic alert resolution based on job updates
- **Integration APIs**: Webhook support for external systems

## Troubleshooting

### Common Issues
1. **Alerts Not Showing**: Check job status and date fields
2. **Phone Call Not Working**: Ensure `tel:` protocol is supported
3. **Email Not Opening**: Check browser email client configuration
4. **Status Not Updating**: Verify localStorage permissions

### Debug Information
- Check browser console for error messages
- Verify job data structure in localStorage
- Confirm engineer data exists in mockEngineers array
- Check component prop passing in React DevTools
