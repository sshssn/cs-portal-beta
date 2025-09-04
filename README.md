# Customer Service Portal

A comprehensive field service management application built with React, TypeScript, and modern UI components.

## Features

### Core Functionality
- **Master Dashboard**: Overview of all jobs and customers
- **Customer Management**: View and manage customer accounts
- **Job Management**: Create, track, and manage support jobs
- **Alerts Portal**: Monitor system alerts and notifications
- **Engineer Management**: Track engineer assignments and status
- **Site Management**: Monitor customer sites and locations
- **Reporting**: Generate end-of-shift reports

### New Features (Profile & Settings)

#### Profile Page
- **User Information**: Display and edit personal details
- **Role & Permissions**: View current role and system permissions
- **Account Status**: Monitor account status and last login
- **Department Info**: View department and location details
- **Profile Picture**: Upload and manage profile avatar

#### Settings Page
- **Company Setup**: Configure company information and branding
- **Logo Upload**: Upload company logo to replace default icons
- **Business Hours**: Set operating hours for each day of the week
- **Contact Information**: Manage company address, phone, email, website
- **Notification Preferences**: Configure alert and notification settings
- **Appearance Settings**: Customize theme and display preferences
- **Security Settings**: Manage authentication and security options

## Technical Details

### Storage
- Uses localStorage for persistent data storage
- Company logo and settings are automatically saved
- Profile information is persisted across sessions

### Logo Integration
- Company logo automatically replaces default dashboard icon
- Logo is stored as base64 data for offline access
- Updates in real-time when settings are changed

### Business Hours
- Configurable schedule for each day of the week
- Support for open/closed status per day
- Time-based scheduling with open/close times
- Automatic status detection (open/closed)

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Navigate to the Profile or Settings page to configure your company

## Usage

### Setting Company Logo
1. Go to Settings → Company Setup
2. Click on the logo upload area
3. Select an image file
4. Save changes to apply throughout the application

### Configuring Business Hours
1. Go to Settings → Business Hours
2. Toggle open/closed for each day
3. Set opening and closing times
4. Save changes to apply

### Managing Profile
1. Go to Profile page
2. Click "Edit Profile" to make changes
3. Update personal information
4. Save changes to persist

## File Structure

```
src/
├── pages/
│   ├── ProfilePage.tsx      # User profile management
│   ├── SettingsPage.tsx     # Company settings and configuration
│   └── ...
├── components/
│   ├── NavigationSidebar.tsx # Updated with profile/settings navigation
│   └── ...
├── lib/
│   ├── companyUtils.ts      # Company-related utility functions
│   └── ...
└── types/
    └── company.ts           # Company and user profile types
```

## Dependencies

- React 18+
- TypeScript
- Tailwind CSS
- Lucide React (icons)
- Radix UI components
- Local storage for data persistence

## Browser Support

- Modern browsers with ES6+ support
- Local storage support required
- File upload support for logo functionality