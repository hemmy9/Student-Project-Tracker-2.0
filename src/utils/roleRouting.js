import {
  Activity,
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

export function getDashboardPathForRole(roleKey) {
  switch (roleKey) {
    case 'student':
      return '/student';
    case 'supervisor':
      return '/supervisor';
    case 'institution_admin':
      return '/institution';
    case 'platform_admin':
      return '/platform';
    default:
      return '/portal-preview';
  }
}

export function getPortalNavItems(roleKey) {
  switch (roleKey) {
    case 'student':
      return [
        { to: '/student', label: 'Overview', icon: LayoutDashboard },
        { to: '/student/milestones', label: 'Project Milestones', icon: Flag },
        { to: '/student/tasks', label: 'Tasks & Kanban', icon: CheckSquare },
        { to: '/student/journals', label: 'Weekly Journals', icon: BookText },
        { to: '/student/documents', label: 'Documents', icon: FileUp },
        { to: '/student/office-hours', label: 'Office Hours', icon: CalendarClock },
        { to: '/student/messages', label: 'Messages & Reports', icon: MessageSquare },
        { to: '/portal-preview', label: 'Workspace Scope', icon: GraduationCap },
      ];
    case 'supervisor':
      return [
        { to: '/supervisor', label: 'Overview', icon: LayoutDashboard },
        { to: '/supervisor/students', label: 'Assigned Students', icon: Users },
        { to: '/supervisor/milestones', label: 'Project Milestones', icon: Flag },
        { to: '/supervisor/reviews', label: 'Document Reviews', icon: FileCheck2 },
        { to: '/supervisor/journals', label: 'Weekly Journals', icon: BookText },
        { to: '/supervisor/office-hours', label: 'Office Hours', icon: CalendarClock },
        { to: '/supervisor/reports', label: 'Messages & Reports', icon: Printer },
        { to: '/portal-preview', label: 'Workspace Scope', icon: ClipboardList },
      ];
    case 'institution_admin':
      return [
        { to: '/institution', label: 'Overview', icon: LayoutDashboard },
        { to: '/institution/structure', label: 'Departments & Sessions', icon: Building2 },
        { to: '/institution/approvals', label: 'Membership Approvals', icon: UserCheck },
        { to: '/institution/projects', label: 'Projects & Supervisors', icon: FolderKanban },
        { to: '/institution/reports', label: 'Institutional Reports', icon: Printer },
        { to: '/portal-preview', label: 'Workspace Scope', icon: Shield },
      ];
    case 'platform_admin':
      return [
        { to: '/platform', label: 'Overview', icon: LayoutDashboard },
        { to: '/platform/institutions', label: 'Institutions Registry', icon: Building2 },
        { to: '/platform/applications', label: 'Applications Queue', icon: ClipboardList },
        { to: '/platform/governance', label: 'Audit & Settings', icon: Activity },
        { to: '/portal-preview', label: 'Workspace Scope', icon: Shield },
      ];
    default:
      return [{ to: '/portal-preview', label: 'Workspace Scope', icon: FolderKanban }];
  }
}
