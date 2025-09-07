# 🚀 Customer Service Portal

A modern, responsive Customer Service Portal built with React, TypeScript, and Tailwind CSS. This application provides comprehensive job management, alert systems, and customer service tools for field service operations.

![Customer Service Portal Screenshot](https://pikwy.com/web/68b99e77e1a7ba5469357618)

## 🌟 Live Demo

**🔗 [View Live Application](https://cs-portal-beta.vercel.app/)**

## ✨ Features

### 🎯 Core Functionality

* **📋 Job Management**: Create, view, edit, and track service jobs
* **🧙‍♂️ 5-Step Job Logging Wizard**: Streamlined job creation process
* **🚨 Real-time Alerts**: Inline alert system with toast notifications
* **👥 Customer Dashboard**: Customer-specific job views and management
* **👨‍🔧 Engineer Management**: Track engineer availability and assignments
* **⏱️ SLA Monitoring**: Automated status tracking (Green/Amber/Red)
* **🔔 Global Alerts Portal**: Unified portal for all system alerts including engineer alerts
* **📊 End of Shift Reports**: Comprehensive end-of-day reporting

### 🎨 User Experience

* **📱 Responsive Design**: Works on desktop, tablet, and mobile devices
* **🎨 Modern UI**: Built with Shadcn/UI components and Tailwind CSS
* **🔍 Advanced Filtering**: Search and filter jobs by multiple criteria
* **📊 Dashboard Analytics**: Real-time job statistics and insights
* **🔄 Real-time Updates**: Live status updates and notifications

### 🚨 Enhanced Alert System (Latest Update)

* **🔄 Unified Alerts**: Integrated Engineer Alerts into Global Alerts Portal
* **🎨 Modern Card UI**: Sleek, color-coded alert cards with priority indicators
* **🏢 Customer Alerts**: Dedicated section for customer-specific alerts
* **👷‍♂️ Engineer Alerts**: Monitor engineer job acceptance and on-site status
* **🏗️ Site Alerts**: Track site-specific issues and maintenance
* **🔔 Alert Categories**: Organized by customer, job, and site for better management
* **📊 Dynamic Metrics**: KPIs that update based on selected alert view

## 🛠️ Tech Stack

* **Frontend**: React 19, TypeScript, Vite
* **UI Components**: Shadcn/UI, Radix UI
* **Styling**: Tailwind CSS
* **Routing**: React Router DOM
* **State Management**: React Hooks
* **Notifications**: Sonner
* **Icons**: Lucide React
* **Build Tool**: Vite
* **Package Manager**: pnpm

## 🚀 Quick Start

### Prerequisites

* Node.js 18+
* pnpm (recommended) or npm

### Installation

1. **Clone the repository**  
```bash
git clone https://github.com/flophero/cs-portal-beta.git
cd cs-portal-beta
```
2. **Install dependencies**  
```bash
pnpm install
# or
npm install
```

3. **Start development server**  
```bash
pnpm run dev
# or
npm run dev
```

4. **Open your browser**: Navigate to `http://localhost:5173`

## 📦 Available Scripts

| Script           | Description              |
| ---------------- | ------------------------ |
| pnpm run dev     | Start development server |
| pnpm run build   | Build for production     |
| pnpm run preview | Preview production build |
| pnpm run lint    | Run ESLint               |
| pnpm run deploy  | Deploy to GitHub Pages   |

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Shadcn/UI components
│   ├── MasterDashboard.tsx
│   ├── CustomerDashboard.tsx
│   ├── JobLogWizard.tsx
│   ├── GlobalAlertsPortal.tsx
│   └── ...
├── pages/              # Main application pages
│   ├── Index.tsx       # Main dashboard
│   └── JobDetailPage.tsx
├── types/              # TypeScript type definitions
│   └── job.ts
├── lib/                # Utility functions
│   ├── jobUtils.ts
│   └── utils.ts
├── hooks/              # Custom React hooks
└── App.tsx             # Main application component
```

## 🎯 Usage Guide

### Job Management

1. **Create Jobs**: Click "Log New Job" to start the 5-step wizard
2. **View Jobs**: Browse all jobs on the master dashboard
3. **Filter & Search**: Use the search bar and filters to find specific jobs
4. **Edit Jobs**: Click on any job card to view and edit details

### Global Alerts Portal (Latest Feature)

1. **Unified Alerts**: Access all alerts from a single portal
2. **Tabbed Interface**: Switch between System Alerts and Engineer Alerts
3. **Categorized View**: View alerts organized by customer, job, and site
4. **Modern UI**: Experience the sleek, color-coded card design with priority indicators
5. **Quick Resolution**: Easily resolve alerts with a single click
6. **Dynamic KPIs**: See metrics update based on the selected view

### Customer Portal

1. **Select Customer**: Choose a customer from the master dashboard
2. **View Customer Jobs**: See all jobs for the selected customer
3. **Manage Alerts**: Access customer-specific alert management

## 🔧 Configuration

### Adding New Job Categories

Edit `src/types/job.ts` to add new categories:

```typescript
category: 'Electrical' | 'Mechanical' | 'Plumbing' | 'HVAC' | 'General' | 'YourNewCategory';
```

### Modifying SLA Times

Update the `CustomAlerts` interface in `src/types/job.ts`:

```typescript
export interface CustomAlerts {
  acceptSLA: number; // minutes
  onsiteSLA: number; // minutes
  completedSLA: number; // minutes
}
```

### Customizing Alert Types

Add new alert types in `src/components/GlobalAlertsPortal.tsx`:

```typescript
// Add to the getSystemAlertIcon function
case 'YOUR_NEW_ALERT_TYPE':
  return <YourIcon className="h-4 w-4" />;
```

## 🚀 Deployment

### Vercel (Current)

The application is currently deployed on Vercel:

* **Live URL**: [https://cs-portal-beta.vercel.app/](https://cs-portal-beta.vercel.app/)
* **Repository**: [https://github.com/flophero/mock-portal](https://github.com/flophero/mock-portal)

### GitHub Repository

The source code is available on GitHub:

* **Repository**: [https://github.com/flophero/mock-portal](https://github.com/flophero/mock-portal)

## 📋 Latest Updates

See the [CHANGELOG.md](./CHANGELOG.md) for a complete version history and detailed list of changes.

### Latest Version (v1.0.0-beta)
- **Major Feature**: Integrated Engineer Alerts into Global Alerts Portal
- **UI Enhancement**: Redesigned alert cards with modern, horizontal layout
- **New Content**: Added customer alerts system with two example alerts
- **Navigation Update**: Removed redundant Engineer Alerts link from sidebar

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

* Shadcn/UI for the beautiful component library
* Tailwind CSS for the utility-first CSS framework
* Vite for the fast build tool
* React for the amazing frontend library
* Lucide React for the beautiful icons

---

**Built with ❤️ for better customer service management**

_Last updated: September 2025_
