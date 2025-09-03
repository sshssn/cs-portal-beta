# Out-of-Hours Customer Service Portal - MVP Todo

## Overview
Modern customer service portal with dashboard for tracking logged jobs and status escalation system.

## Core Features to Implement
1. **Dashboard View** - Track all logged jobs with color-coded status
2. **Customer Details Collection** - Name, email, company, site information
3. **Job Logging Form** - Based on JobLogic documentation structure
4. **Status Tracking System** - Green/Amber/Red with time-based triggers
5. **Modern UI** - Using Shadcn-UI components with contemporary design

## File Structure (Max 8 files)
1. **src/pages/Index.tsx** - Main application with routing and state management
2. **src/components/Dashboard.tsx** - Job tracking dashboard with status cards
3. **src/components/JobLogForm.tsx** - Multi-step form for logging new jobs
4. **src/components/CustomerDetailsForm.tsx** - First step: customer information collection
5. **src/components/JobCard.tsx** - Individual job display component with status indicators
6. **src/components/StatusBadge.tsx** - Color-coded status indicator component
7. **src/lib/jobUtils.ts** - Utility functions for job status calculations and time tracking
8. **src/types/job.ts** - TypeScript interfaces for job data structure

## Status Logic
- **Green**: Job completed or engineer on-site working normally
- **Amber**: Engineer accepted job and traveling (initial state)
- **Red**: Travel time >20min without arrival OR work time >1hr without completion

## Key Components Needed
- Modern sidebar navigation
- Real-time status updates
- Search and filter functionality
- Responsive design with contemporary aesthetics
- Time-based automatic status updates

## Implementation Priority
1. Basic layout and navigation
2. Dashboard with mock data
3. Job logging form with customer details
4. Status tracking system
5. Real-time updates and escalation logic