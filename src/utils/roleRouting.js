import {
  BookText,
  Building2,
  CalendarClock,
  CheckSquare,
  ClipboardList,
  FileCheck2,
  FileUp,
  Flag,
  FolderKanban,
  GraduationCap,
  LayoutDashboard,
  MessageSquare,
  Printer,
  Shield,
  UserCheck,
  Users,
} from 'lucide-react';

const PORTAL_CONFIG = {
  student: {
    portalLabel: 'Student Portal',
    dashboardPath: '/student',
    navItems: [
      { to: '/student', label: 'Overview', icon: LayoutDashboard },
      { to: '/student/milestones', label: 'Project Milestones', icon: Flag },
      { to: '/student/tasks', label: 'Tasks & Kanban', icon: CheckSquare },
      { to: '/student/journals', label: 'Weekly Journals', icon: BookText },
      { to: '/student/documents', label: 'Documents', icon: FileUp },
      { to: '/student/office-hours', label: 'Office Hours', icon: CalendarClock },
      { to: '/student/messages', label: 'Messages & Reports', icon: MessageSquare },
      { to: '/portal-preview', label: 'Workspace Scope', icon: GraduationCap },
    ],
    extraRoutes: {
      '/student/profile': 'My Profile',
    },
  },
  supervisor: {
    portalLabel: 'Supervisor Portal',
    dashboardPath: '/supervisor',
    navItems: [
      { to: '/supervisor', label: 'Overview', icon: LayoutDashboard },
      { to: '/supervisor/students', label: 'Assigned Students', icon: Users },
      { to: '/supervisor/milestones', label: 'Project Milestones', icon: Flag },
      { to: '/supervisor/reviews', label: 'Document Reviews', icon: FileCheck2 },
      { to: '/supervisor/journals', label: 'Weekly Journals', icon: BookText },
      { to: '/supervisor/office-hours', label: 'Office Hours', icon: CalendarClock },
      { to: '/supervisor/reports', label: 'Messages & Reports', icon: Printer },
      { to: '/portal-preview', label: 'Workspace Scope', icon: ClipboardList },
    ],
    extraRoutes: {
      '/supervisor/profile': 'My Profile',
    },
  },
  institution_admin: {
    portalLabel: 'Institution Admin',
    dashboardPath: '/admin',
    navItems: [
      { to: '/admin', label: 'Overview', icon: LayoutDashboard },
      { to: '/admin/structure', label: 'Departments & Sessions', icon: Building2 },
      { to: '/admin/approvals', label: 'Membership Approvals', icon: UserCheck },
      { to: '/admin/projects', label: 'Projects & Supervisors', icon: FolderKanban },
      { to: '/admin/reports', label: 'Institutional Reports', icon: Printer },
      { to: '/portal-preview', label: 'Workspace Scope', icon: Shield },
    ],
    extraRoutes: {
      '/admin/profile': 'My Profile',
    },
  },
};

export function getDashboardPathForRole(roleKey) {
  return PORTAL_CONFIG[roleKey]?.dashboardPath || '/portal-preview';
}

const PROFILE_PATH_BY_ROLE = {
  student: '/student/profile',
  supervisor: '/supervisor/profile',
  institution_admin: '/admin/profile',
};

export function getProfilePathForRole(roleKey) {
  return PROFILE_PATH_BY_ROLE[roleKey] || null;
}

export function getPortalNavItems(roleKey) {
  const config = PORTAL_CONFIG[roleKey];
  if (config) {
    return config.navItems.map((item) => ({ ...item }));
  }
  return [{ to: '/portal-preview', label: 'Workspace Scope', icon: FolderKanban }];
}

function normalizePathname(pathname) {
  if (!pathname || typeof pathname !== 'string') return '/';
  const cleaned = pathname.split('?')[0].split('#')[0].replace(/\/+$/, '');
  return cleaned || '/';
}

export function getBreadcrumbsForPath(pathname, activeMembership = null) {
  const normalizedPath = normalizePathname(pathname);
  const roleKey = activeMembership?.roleKey;
  const portal = PORTAL_CONFIG[roleKey];

  // Retired platform_admin or unrecognized roles never receive active portal or /platform links
  if (!portal) {
    if (normalizedPath === '/portal-preview') {
      return [
        { label: 'Portal Gateway', to: '/portal-preview' },
        { label: 'Workspace Scope', to: '/portal-preview', isCurrent: true },
      ];
    }
    return [
      { label: 'Workspace Scope', to: '/portal-preview' },
      { label: 'Route Unavailable', to: null, isCurrent: true },
    ];
  }

  const rootCrumb = { label: portal.portalLabel, to: portal.dashboardPath };

  if (normalizedPath === '/portal-preview') {
    return [
      rootCrumb,
      { label: 'Workspace Scope', to: '/portal-preview', isCurrent: true },
    ];
  }

  if (normalizedPath === portal.dashboardPath) {
    return [
      rootCrumb,
      { label: 'Overview', to: portal.dashboardPath, isCurrent: true },
    ];
  }

  const matchedNav = portal.navItems.find((item) => item.to === normalizedPath);
  if (matchedNav) {
    return [
      rootCrumb,
      { label: matchedNav.label, to: matchedNav.to, isCurrent: true },
    ];
  }

  const extraLabel = portal.extraRoutes?.[normalizedPath];
  if (extraLabel) {
    return [
      rootCrumb,
      { label: extraLabel, to: normalizedPath, isCurrent: true },
    ];
  }

  return [
    rootCrumb,
    { label: 'Unrecognized Route', to: null, isCurrent: true },
  ];
}
