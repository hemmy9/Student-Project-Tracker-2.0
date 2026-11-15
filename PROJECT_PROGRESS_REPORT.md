# Student Project Tracker — Complete Project Progress Report

**Project Title:** Design and Implementation of a Web-Based Student Project Progress Tracking System  
**Stack:** React + Vite + JavaScript/JSX + Tailwind CSS + React Router + Supabase (Auth, PostgreSQL + RLS, Storage, Edge Functions) + Vercel  
**Design System:** Deep Navy (`#172554`), Royal Blue (`#2563EB`), Slate (`#64748B`), Soft Canvas (`#F8FAFC`), White (`#FFFFFF`) | `Plus Jakarta Sans`, `DM Sans`, `JetBrains Mono`

---

## 1. Stage 1 — Public Website, Auth & Registration Flows
- **Public Homepage (`/`)**: Mobile-first SaaS landing page with responsive `PublicHeader`, `HeroSection`, `FeaturesHighlight`, role architecture overview, and `PublicFooter`.
- **Login Page (`/login`)**: Full client-side validation, loading/error states, password visibility/recovery preview, and 1-tap Demo Role Credential cards for testing all 4 roles (`Student`, `Supervisor`, `Institution Admin`, `Platform Admin`, plus a Multi-Role account). Automatically connects to live Supabase Auth when `VITE_SUPABASE_URL` & `VITE_SUPABASE_ANON_KEY` are configured.
- **Registration Hub (`/register`)**: Routes cleanly to:
  - **Institution Registration (`/register/institution`)** — institutional onboarding application (`pending_review` workflow, wired to `useSupabaseService`).
  - **Student Registration (`/register/student`)** — student enrollment tied to an institution & department.
  - **Supervisor Registration (`/register/supervisor`)** — faculty verification & invite-code validation.

---

## 2. Stage 2 — Multi-Tenant Portals, Navigation & Role Switching
- **Portal Layout & Header (`PortalLayout`, `PortalHeader`)**: Mobile-scrollable section bar + desktop sidebar navigation, active tenant badge, and **User / Role Switcher** (supporting multi-institution / multi-role switching plus demo account switching and workspace reset).
- **4 Role-Scoped Dashboards**:
  - **Student Dashboard (`/student`)**: Project progress %, live **next-deadline days-left countdown**, 4 KPI cards, dashboard analytics charts, filterable/sortable milestones table, and activity stream.
  - **Supervisor Dashboard (`/supervisor`)**: Cohort health breakdown, flagged "Needs Attention" queue, searchable/sortable student roster, review queue, and activity stream.
  - **Institution Admin Dashboard (`/institution`)**: Tenant isolation header, department capacity bars, supervisor allocation coverage, filterable membership approvals queue, and activity stream.
  - **Platform Admin Dashboard (`/platform`)**: Platform governance metrics, tenant onboarding standing, active seat distribution, searchable/sortable institution registry, audit log, and activity stream.
- **Loading & Empty States**: `DashboardSkeleton`, `EmptyState`, and `StatusLabel` components across dashboards.

---

## 3. Stage 3 — Interactive Features, Analytics, Kanban & Versioning
- **Notification Sidebar (`NotificationDrawer`)**: Unread counter in `PortalHeader`, role-scoped notifications, mark-read & mark-all-read actions, and direct navigation links.
- **Role Guarding (`useAuthGuard` + `ProtectedDemoRoute`)**: Enforces session authentication, `Approved` membership status, and role authorization with a `403` restricted view and safe dashboard redirect.
- **Profile Quick View (`ProfileQuickView`)**: Slide-over profile drawer for inspecting role memberships and updating contact/bio/notification preferences.
- **Task Creation, Kanban Board & Milestones Tracker (`/student/tasks`)**:
  - 4-column **Kanban Board** (`To Do`, `In Progress`, `In Review`, `Completed`) with desktop drag-and-drop AND mobile-friendly column selector dropdowns on every card.
  - Toggleable **List View**, milestone filter, overdue attention check, task creation form, and live **Milestones Tracker** with adjustable target dates.
- **Weekly Progress Journals (`/student/journals` & `/supervisor/journals`)**: Structured weekly progress/blocker logging and supervisor review feedback.
- **Document Versioning (`/student/documents` & `/supervisor/reviews`)**:
  - Grouped version stacks (`Latest: v2`, version counts), 1-tap `Upload v{N+1}` pre-fill, and expandable **Archived Version History (Immutable)** timeline.
  - Supervisor approval / revision-request queue with mandatory feedback checks and student revision replies.
- **Dashboard Analytics (`AnalyticsPanel`)**: `BreakdownDonut`, `HorizontalBarChart`, and `ActivityCadenceChart` integrated into all 4 dashboards.
- **Multi-Format Export Reports**: Export **Markdown (`.md`)**, **CSV (`.csv`)**, **JSON (`.json`)**, and **Print / Save as PDF** across Student, Supervisor, Institution, and Platform governance screens.
- **Institution & Platform Workflows**: Department/session builder, membership approvals, supervisor invites, project creation & supervisor allocation, institution onboarding decisions, and governance settings.

---

## 4. Stage 4 & Smart UI Upgrades
- **Custom Hooks**:
  - `src/hooks/useSupabaseService.js` — wraps Supabase Auth, Memberships, Tasks, Storage uploads, Signed URLs, and Realtime message subscriptions with `loading`, `error`, `lastSyncedAt`, and automatic toast feedback.
  - `src/hooks/useAuthGuard.js` — reusable hook for role, approval status, and route/component access checks.
- **Global Toast Notification System**:
  - `src/context/ToastContext.jsx` + `src/components/ui/ToastContainer.jsx` — accessible mobile-first global toast stack (`success`, `error`, `warning`, `info`) triggered across login, role switching, Kanban moves, task/milestone updates, document uploads, and Supabase actions.
- **Smart UI Components**:
  - **Smart Workspace Search (`SmartSearchBar`)**: Mounted across every portal page with `/` keyboard shortcut and instant search across authorized pages, tasks, milestones, documents, journals, students, departments, and institutions.
  - **Smart Dashboard Filters (`SmartDashboardFilters`)**: Search + status tabs + multi-criteria sorting + summary counters + 1-tap reset across all 4 dashboards.
  - **Live Activity Feed Stream (`ActivityFeedStream`)**: Category-filterable (`All`, `Tasks`, `Documents`, `Journals`, `Messages`, `Governance`), searchable live log stream automatically recording user actions across portals.
- **Supabase & Vercel Infrastructure**:
  - `src/lib/supabaseClient.js`, `src/services/supabaseService.js`, `.env.example`
  - `supabase/migrations/001_initial_schema.sql`, `002_rls_policies.sql`, `003_storage_buckets.sql`, `supabase/seed.sql`, and `supabase/functions/admin-actions/index.ts`
  - `vercel.json` (Vite build + React Router SPA rewrites) & `DEPLOYMENT_AND_SUPABASE_GUIDE.md`
