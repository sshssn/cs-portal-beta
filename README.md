# 🚀 Customer Service Portal

A modern, responsive Customer Service Portal built with React, TypeScript, and Tailwind CSS. This application provides comprehensive job management, alert systems, and customer service tools for field service operations.

## 🌟 Live Demo

**🔗 [View Live Application](https://flophero.github.io/customer-service-portal)**

## ✨ Features

### 🎯 Core Functionality
- **📋 Job Management**: Create, view, edit, and track service jobs
- **🧙‍♂️ 5-Step Job Logging Wizard**: Streamlined job creation process
- **🚨 Real-time Alerts**: Inline alert system with toast notifications
- **👥 Customer Dashboard**: Customer-specific job views and management
- **👨‍🔧 Engineer Management**: Track engineer availability and assignments
- **⏱️ SLA Monitoring**: Automated status tracking (Green/Amber/Red)

### 🎨 User Experience
- **📱 Responsive Design**: Works on desktop, tablet, and mobile devices
- **🎨 Modern UI**: Built with Shadcn/UI components and Tailwind CSS
- **🔍 Advanced Filtering**: Search and filter jobs by multiple criteria
- **📊 Dashboard Analytics**: Real-time job statistics and insights
- **🔄 Real-time Updates**: Live status updates and notifications

### 🚨 Alert System
- **Inline Alerts**: No more disruptive browser popups
- **Toast Notifications**: Elegant, non-intrusive user feedback
- **Alert Management**: Acknowledge and track alert status
- **SLA Violations**: Automatic alerts for missed deadlines

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **UI Components**: Shadcn/UI, Radix UI
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **State Management**: React Hooks
- **Notifications**: Sonner
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Package Manager**: pnpm

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/flophero/customer-service-portal.git
   cd customer-service-portal
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

4. **Open your browser**
   Navigate to `http://localhost:5173`

## 📦 Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm run dev` | Start development server |
| `pnpm run build` | Build for production |
| `pnpm run preview` | Preview production build |
| `pnpm run lint` | Run ESLint |
| `pnpm run deploy` | Deploy to GitHub Pages |

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Shadcn/UI components
│   ├── MasterDashboard.tsx
│   ├── CustomerDashboard.tsx
│   ├── JobLogWizard.tsx
│   ├── CustomerAlertsPortal.tsx
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

### Alert System
1. **Create Alerts**: Use the Customer Alerts Portal to trigger SLA alerts
2. **View Alerts**: Alerts appear inline on job cards with red highlighting
3. **Acknowledge Alerts**: Mark alerts as resolved to clear them

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

### Customizing Styles
- Modify `src/index.css` for global styles
- Update Tailwind classes in components for specific styling
- Customize Shadcn/UI components in `src/components/ui/`

## 🚀 Deployment

### GitHub Pages (Current)
The application is currently deployed on GitHub Pages:
- **Live URL**: https://flophero.github.io/customer-service-portal
- **Repository**: https://github.com/flophero/customer-service-portal

### Deploy to Other Platforms

#### Vercel
1. Connect your GitHub repository to Vercel
2. Deploy automatically with each push

#### Netlify
1. Drag and drop the `dist` folder to Netlify
2. Or connect your GitHub repository

#### Manual Deployment
```bash
pnpm run build
# Upload the dist/ folder to any web hosting service
```

## 🔄 Updating Your Deployment

### Quick Update Workflow
```bash
# 1. Make your changes
# 2. Add and commit changes
git add .
git commit -m "Add new feature: describe your changes"
git push origin main

# 3. Deploy to GitHub Pages
pnpm run deploy
```

### Common Update Commands
```bash
# Check what changed
git status

# Add all changes
git add .

# Commit with message
git commit -m "Your descriptive message"

# Push to GitHub
git push origin main

# Deploy to live site
pnpm run deploy
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Shadcn/UI](https://ui.shadcn.com/) for the beautiful component library
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Vite](https://vitejs.dev/) for the fast build tool
- [React](https://react.dev/) for the amazing frontend library
- [Lucide React](https://lucide.dev/) for the beautiful icons

## 📞 Support

If you have any questions or need help:

- **Open an issue** on GitHub
- **Check the documentation** above
- **Review the code comments** for implementation details

## 🎉 Features Showcase

### 🎨 Modern UI Components
- Responsive card layouts
- Interactive buttons and forms
- Beautiful color-coded status indicators
- Smooth animations and transitions

### 📊 Dashboard Analytics
- Real-time job statistics
- Status distribution charts
- Performance metrics
- End-of-shift reports

### 🔍 Advanced Search & Filtering
- Search by job number, customer, or description
- Filter by status, priority, or category
- Sort by date, priority, or status
- Quick filter buttons

### 📱 Mobile-First Design
- Touch-friendly interface
- Responsive grid layouts
- Mobile-optimized navigation
- Cross-device compatibility

---

**Built with ❤️ for better customer service management**

*Last updated: January 2025*