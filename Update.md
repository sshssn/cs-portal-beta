Context

You are building a Tickets + Jobs Management module similar to Invida within a CAFM / FM system.

The goal is to allow users to:

Log a Service Ticket

Create and manage Jobs against a Ticket ( There is a module called all jobs this will be replicated to a new module called "create ticket" Image will be attached and restructure the app a little where needed to match this requirement file) 

Ticket Manager > New Ticket > Service Ticket ( All in one module neatly with CAFM logic)    

View SLA timelines

Assign Service Providers and Engineers

Add Notes

Filter Service Providers by Location

Replicate the existing Ticket form UX as closely as possible.

1. Tickets + Jobs View
Ticket Creation & Management

Implement a Ticket View that includes:

Ticket header:

Ticket reference (e.g. SRTK231)

SLA status (e.g. SLA Overdue)

Priority

Category

Tags (e.g. Health and Safety Issue)

Ticket details form:

Short description

Detailed description

Priority (dropdown)

Category (dropdown)

SLA (auto-selected, editable)

Reporter details (name, email, phone)

Location & Assets section:

Hierarchical location selector (Org → Site → Building → Area → Space)

Ability to add supplementary locations

✅ Ticket form layout and fields must match the existing ticket form (structure and behavior).

2. Log Job Against Ticket
Create Job Panel

From the Ticket view, provide a Create Job action with options:

Create Job

Create Job from Template

Link to Existing Job

Create Job Modal / Panel

Job creation must include:

Mandatory fields:

Short description

Location (pre-filled from Ticket, editable)

Priority

Workflow (default: CAFM Job – Reactive)

Optional fields:

Details

Pre-defined instructions

SLA (auto-selected)

Start Job:

“Straight away”

“Specific date”

Assignments (IMPORTANT)

Allow Job creation with Assignments only

Do NOT require scheduling at creation time

Allow assignment of:

Service Provider

Engineer (OOH engineers included if applicable)

3. Timeline Panel (Right Side)

Implement a right-hand Timeline Panel that shows:

SLA milestones:

Ticket Opened Before

SLA Contain Before

SLA Complete Before

Visual indicators:

Green = met

Red = breached

Timeline entries:

Ticket created

Job created

Tags added

Notes added

Timeline must update in real-time after actions (job creation, notes, status changes).

4. Service Provider View
Service Provider Panel

Implement a Service Providers Panel with:

List of Service Providers showing:

Name

Status (Active/Inactive)

Missing mandatory documents

Expired documents

Performance indicator

Location filter

Filter service providers by selected location

Data fetched via API using location ID

Engineer Selection

When a Service Provider is selected:

Show list of available engineers

Include Out of Hours (OOH) engineers

Engineers are filtered based on:

Service Provider

Location

Availability

5. Choose Location

Implement a Choose Location modal:

Tree-based structure

Multi-level hierarchy

Searchable

Checkbox selection

Ability to select:

Single location

Multiple locations (where applicable)

Selected location(s) must:

Update Ticket

Filter Service Providers

Pre-fill Job location

6. Notes
Add Note

Implement an Add Note modal that supports:

Rich text input

Visibility options:

Public note (visible to all)

Private note (permission-restricted)

Attachments (images/files)

Notes must appear in:

Ticket notes section

Timeline panel

7. API Expectations

Assume APIs exist for:

Fetching locations (hierarchical)

Fetching service providers by location

Fetching engineers by service provider + location

Creating tickets

Creating jobs

Adding notes

Fetching SLA timelines

Design components to be API-driven and async-ready.

8. Non-Goals

No invoicing logic

No payment processing

No SLA configuration (read-only usage)

9. UX & Technical Constraints

Match Invida-style UI/UX closely

Modular components

Reusable panels (Ticket, Job, Timeline, Service Providers)

Clean separation of concerns

React-based architecture preferred

State management suitable for complex forms (e.g. controlled forms)

10. Acceptance Criteria

User can log a Ticket

User can create a Job directly from a Ticket

Job can be created with Assignments only

Timeline updates correctly

Service Providers are filtered by location

Notes are added and visible in timeline

SLA indicators reflect correct state