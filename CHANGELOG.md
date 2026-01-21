# Changelog

All notable changes to the Joblogic CS Portal project are documented in this file.

## [1.2.0] - 2026-01-21

### System Standardization and State Unification

- **Global State Management**: Migrated job state to a unified React Context provider. This ensures real-time updates across the Dashboard, All Jobs list, and Job Detail pages.
- **Standardized Search Interface**: Replaced ad-hoc search implementations with a dedicated `SearchInput` component. This includes integrated clearing functionality and consistent visual styling.
- **Dashboard Filter Synchronization**: Restructured the mapping between Master Dashboard status cards and the Global Jobs list. Filtering by "Unassigned" or "SLA Breached" now yields precise, synchronized results.
- **Persistent Job Creation**: Improved the Job Log Wizard to ensure new jobs are immediately persisted to global state and local storage.
- **Priority Selection UI Refactor**: Redesigned the Priority selection interface from a standard radio group to professional button-styled controls for "Emergency" and "Standard" categories.
- **Resource Optimization**: Removed hardcoded assets and external favicon links to improve local development autonomy and loading performance.

## [1.1.0] - 2026-01-20

### UI Enhancements and Bug Fixes

- **Audit Trail Expansion**: Increased the font-size and vertical height of the Audit Trail section in the Job Detail view for improved readability and design balance.
- **Alert Resolution Logic**: Corrected a defect where accepted jobs failed to move to the "Resolved" section in the Global Alerts Portal.
- **Navigation Cleanup**: Removed redundant alert navigation elements from the Master Dashboard to streamline the user experience.
- **Typography Improvements**: Standardized font scales and weights across primary navigation components.

## [1.0.0] - 2026-01-05

### Initial Beta Deployment

- Core Job Management functionality.
- SLA tracking system.
- Customer-specific portals and dashboards.
- Multi-step job wizard implementation.
- Real-time alert notification system.

---

*Authored and maintained by sshssn@yahoo.com*