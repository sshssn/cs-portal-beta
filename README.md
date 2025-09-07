# 🚀 CS Portal Beta

A modern, responsive Customer Service Portal built with React, TypeScript, and Tailwind CSS. This application provides comprehensive job management, alert systems, and customer service tools for field service operations.

![CS Portal Main Screen](https://p37am1ix0e.ufs.sh/f/lBuQYLoY3PsQ5vncdp0OnrALxdUCskt6iN7GYODJlRzKgTwe)
## 🌟 Live Demo

**🔗 [View Live Application](https://sshssn.github.io/cs-portal-beta/)**

## 📋 Latest Updates (v1.1.0)

### ✨ Enhanced Audit Trail System
- **UI Enhancement**: Made Audit Trail section significantly bigger and taller with larger fonts
- **Improved Readability**: Increased font sizes throughout the Audit Trail for better visibility
- **Better Layout**: Made Audit Trail height parallel to Contact Information container for balanced design
- **Enhanced Spacing**: Improved padding and margins for better visual hierarchy

### 🔧 Engineer Alerts Resolution Fix
- **Bug Fix**: Fixed critical issue where accepted jobs weren't moving to "Resolved" section in Global Alerts Portal
- **Auto-Resolution**: Improved alert state management to properly preserve resolved alerts
- **Better UX**: Resolved alerts now properly appear in the "Resolved" section when jobs are accepted

### 🎨 UI/UX Improvements
- **Navigation Cleanup**: Removed redundant Engineer Alerts button from Master Dashboard navigation
- **Streamlined Interface**: Cleaner, more focused navigation experience
- **Better Visual Hierarchy**: Improved spacing and typography throughout the application

## 🚀 Features

### 📊 Master Dashboard
- **Real-time Job Monitoring**: Track all active jobs with live status updates
- **Customer Management**: Comprehensive customer information and contact details
- **Alert System**: Intelligent alert management with auto-resolution capabilities
- **Quick Actions**: Fast access to job creation and management tools

### 🔔 Global Alerts Portal
- **System Alerts**: Monitor system-wide issues and notifications
- **Engineer Action Alerts**: Track engineer responses and job acceptance
- **Auto-Resolution**: Smart alert resolution when jobs are accepted or completed
- **Alert History**: Complete audit trail of all alert activities

### 📋 Job Management
- **Job Creation**: Streamlined job logging with wizard interface
- **Status Tracking**: Real-time job status updates and progress monitoring
- **Customer Integration**: Seamless customer information integration
- **Audit Trail**: Comprehensive activity logging and communication history

### 👥 Customer Portal
- **Customer Dashboard**: Dedicated customer view with job status
- **Alert Management**: Customer-specific alert notifications
- **Contact Information**: Complete customer contact and site details
- **Job History**: Full job history and communication records

## 🛠️ Technology Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom components
- **UI Components**: Radix UI primitives with custom styling
- **Icons**: Lucide React icon library
- **Build Tool**: Vite for fast development and building
- **Package Manager**: pnpm for efficient dependency management

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm package manager

### Installation
```bash
# Clone the repository
git clone https://github.com/sshssn/cs-portal-beta.git

# Navigate to project directory
cd cs-portal-beta

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

### Building for Production
```bash
# Build the application
pnpm build

# Preview the build
pnpm preview
```

## 📁 Project Structure

```
cs-portal-beta/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # Base UI components (buttons, cards, etc.)
│   │   ├── Dashboard.tsx   # Main dashboard component
│   │   ├── JobLogForm.tsx  # Job logging form
│   │   └── ...
│   ├── pages/              # Page components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions and constants
│   ├── types/              # TypeScript type definitions
│   └── contexts/           # React contexts
├── public/                 # Static assets
├── dist/                   # Build output
└── docs/                   # Documentation
```

## 🎯 Key Features

### 🔄 Real-time Updates
- Live job status updates
- Instant alert notifications
- Real-time customer information sync

### 📱 Responsive Design
- Mobile-first approach
- Tablet and desktop optimized
- Touch-friendly interface

### 🎨 Modern UI/UX
- Clean, professional design
- Consistent color scheme
- Intuitive navigation

### 🔒 Type Safety
- Full TypeScript implementation
- Type-safe API interactions
- Compile-time error checking

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions, please open an issue in the [GitHub repository](https://github.com/sshssn/cs-portal-beta/issues).

---

**Built with ❤️ for efficient customer service management**