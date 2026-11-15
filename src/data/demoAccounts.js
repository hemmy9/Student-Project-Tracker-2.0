// Stage 1 frontend-only demonstration accounts for previewing role flows.
// These are NOT real database users and do NOT represent secure authentication.
// In Stage 4, these will be replaced entirely by Supabase Auth + PostgreSQL RLS.

export const DEMO_ACCOUNTS = [
  {
    id: 'demo-student-1',
    roleKey: 'student',
    roleLabel: 'Student',
    fullName: 'Kwame Boateng',
    email: 'student.demo@westbridge.edu',
    password: 'StudentDemo2026!',
    institution: 'University of Westbridge',
    department: 'Department of Computer Science',
    programme: 'B.Sc. Software Engineering',
    portalSummary:
      'Assigned to final-year capstone project tracking, milestone checklists, weekly journals, and chapter submissions.',
    memberships: [
      {
        id: 'mem-stu-1',
        roleKey: 'student',
        roleLabel: 'Student',
        institutionName: 'University of Westbridge',
        scopeLabel: 'B.Sc. Software Engineering · Final Year',
        status: 'Approved',
      },
    ],
  },
  {
    id: 'demo-supervisor-1',
    roleKey: 'supervisor',
    roleLabel: 'Supervisor',
    fullName: 'Dr. Samuel Osei',
    email: 'supervisor.demo@westbridge.edu',
    password: 'SupervisorDemo2026!',
    institution: 'University of Westbridge',
    department: 'Department of Computer Science',
    programme: 'Faculty Thesis Supervision',
    portalSummary:
      'Supervises assigned student projects, reviews submitted chapters, monitors weekly journals, and requests revisions.',
    memberships: [
      {
        id: 'mem-sup-1',
        roleKey: 'supervisor',
        roleLabel: 'Supervisor',
        institutionName: 'University of Westbridge',
        scopeLabel: 'Senior Lecturer · Distributed Systems',
        status: 'Approved',
      },
    ],
  },
  {
    id: 'demo-inst-admin-1',
    roleKey: 'institution_admin',
    roleLabel: 'Institution Admin',
    fullName: 'Dr. Evelyn Mensah',
    email: 'admin.demo@westbridge.edu',
    password: 'InstAdminDemo2026!',
    institution: 'University of Westbridge',
    department: 'Office of Academic Projects',
    programme: 'Institutional Governance',
    portalSummary:
      'Manages departments, academic sessions, pending student/supervisor approvals, supervisor invitations, and project assignments.',
    memberships: [
      {
        id: 'mem-admin-1',
        roleKey: 'institution_admin',
        roleLabel: 'Institution Admin',
        institutionName: 'University of Westbridge',
        scopeLabel: 'Institutional Coordinator',
        status: 'Approved',
      },
    ],
  },
  {
    id: 'demo-platform-admin-1',
    roleKey: 'platform_admin',
    roleLabel: 'Platform Admin',
    fullName: 'Adaeze Nwosu',
    email: 'platform.demo@projecttracker.app',
    password: 'PlatformDemo2026!',
    institution: 'Student Project Tracker Governance',
    department: 'Platform Operations',
    programme: 'Multi-Tenant Oversight',
    portalSummary:
      'Reviews university registration applications, manages registered institutional accounts, and audits platform-wide activity.',
    memberships: [
      {
        id: 'mem-plat-1',
        roleKey: 'platform_admin',
        roleLabel: 'Platform Admin',
        institutionName: 'Platform-Wide Scope',
        scopeLabel: 'Platform Governance Operator',
        status: 'Approved',
      },
    ],
  },
  {
    id: 'demo-multi-1',
    roleKey: 'student',
    roleLabel: 'Multi-Role (3 Roles)',
    fullName: 'Dr. Daniel Kwarteng',
    email: 'multi.demo@westbridge.edu',
    password: 'MultiRoleDemo2026!',
    institution: 'Northfield Institute · Westbridge · St. Jude UAS',
    department: 'Cross-Institution Demonstration',
    programme: 'Multi-Tenant Role Isolation Demo',
    portalSummary:
      'Demonstrates one account holding separate approved roles across multiple institutions: Student, Supervisor, and Institution Admin.',
    memberships: [
      {
        id: 'mem-multi-1',
        roleKey: 'student',
        roleLabel: 'Student',
        institutionName: 'Northfield Institute of Technology',
        scopeLabel: 'M.Sc. Research Candidate',
        status: 'Approved',
      },
      {
        id: 'mem-multi-2',
        roleKey: 'supervisor',
        roleLabel: 'Supervisor',
        institutionName: 'University of Westbridge',
        scopeLabel: 'Visiting Thesis Supervisor',
        status: 'Approved',
      },
      {
        id: 'mem-multi-3',
        roleKey: 'institution_admin',
        roleLabel: 'Institution Admin',
        institutionName: 'St. Jude University of Applied Sciences',
        scopeLabel: 'Programme Coordinator',
        status: 'Approved',
      },
    ],
  },
];

export function verifyDemoCredentials(email, password) {
  const normalizedEmail = (email || '').trim().toLowerCase();
  const account = DEMO_ACCOUNTS.find(
    (item) => item.email.toLowerCase() === normalizedEmail && item.password === password
  );
  return account || null;
}
