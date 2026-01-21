# Joblogic CS Portal Beta

A professional, high-performance Customer Service Portal architected with React, TypeScript, and Vite. This application provides a comprehensive suite of tools for managing service jobs, monitoring service level agreements (SLAs), and streamlining customer communication for field service operations.

## Core Capabilities

- **Unified Job Management**: Centralized state management for job lifecycles, ensuring data consistency across all application views.
- **SLA Monitoring System**: Real-time tracking of attendance and completion targets with automated alert escalation.
- **Standardized Search Infrastructure**: Unified search components with integrated filtering for efficient data retrieval.
- **Operational Dashboards**: Analytical views for both administrative oversight and customer-specific monitoring.
- **Job Lifecycle Wizard**: A structured, multi-step process for accurate job logging and validation.

## Technical Architecture

- **Core Framework**: React 19 (TypeScript)
- **Styling Engine**: Tailwind CSS
- **Component Bed**: Radix UI Primitives
- **State Orchestration**: React Context with LocalStorage persistence
- **Build Infrastructure**: Vite
- **Package Management**: pnpm

## Getting Started

### Prerequisites

- Node.js 18.0 or higher
- pnpm package manager

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/sshssn/cs-portal-beta.git
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Initialize development server:
   ```bash
   pnpm dev
   ```

### Production Build

To generate a production-ready bundle:
```bash
pnpm build
```

The output will be available in the `dist` directory.

