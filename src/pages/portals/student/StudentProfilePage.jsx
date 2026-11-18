import { Flag } from 'lucide-react';
import PortalLayout from '../../../components/layout/PortalLayout';
import ProfileWorkspaceShell from '../../../components/profile/ProfileWorkspaceShell';
import EmptyState from '../../../components/ui/EmptyState';
import {
  resolveInstitutionKey,
  resolveWorkspaceInstitution,
  useDemoAppState,
} from '../../../context/DemoAppStateContext';
import { useDemoSession } from '../../../context/DemoSessionContext';
import { getPortalNavItems } from '../../../utils/roleRouting';

const STUDENT_EDITABLE_FIELDS = [
  {
    key: 'researchFocus',
    label: 'Research Focus & Technical Keywords',
    placeholder: 'e.g., Edge MQTT telemetry, LoRaWAN fallback protocols, low-power sensing',
    helperText: 'Optional summary of your project focus within this institutional scope.',
  },
  {
    key: 'roleNote',
    label: 'Student Workspace Note',
    as: 'textarea',
    rows: 2,
    placeholder: 'Optional note on preferred supervision schedule or lab access...',
    helperText: 'Stored locally for this student workspace only.',
  },
];

const STUDENT_QUICK_LINKS = [
  { to: '/student/milestones', label: 'Project Milestones' },
  { to: '/student/tasks', label: 'Tasks & Kanban' },
  { to: '/student/journals', label: 'Weekly Journals' },
  { to: '/student/documents', label: 'Documents' },
];

export default function StudentProfilePage() {
  const { session, activeMembership } = useDemoSession();
  const { state } = useDemoAppState();

  const institutionName = resolveWorkspaceInstitution(activeMembership, session);
  const projectKey = resolveInstitutionKey(state.projectsByInstitution, institutionName);
  const project = projectKey ? state.projectsByInstitution[projectKey] : null;

  const milestones = project?.milestones || [];
  const tasks = project?.tasks || [];
  const journals = project?.journals || [];
  const submissions = project?.submissions || [];

  const completedTasks = tasks.filter((t) => t.completed).length;
  const approvedMilestones = milestones.filter((m) => m.status === 'Approved').length;

  const systemFields = project
    ? [
        { label: 'Project / Tracking Code', value: project.code, mono: true },
        { label: 'Department', value: project.department },
        { label: 'Programme', value: project.programme },
        { label: 'Academic Session', value: project.academicSession },
        {
          label: 'Assigned Supervisor',
          value: `${project.supervisorName} (${project.supervisorEmail})`,
        },
      ]
    : [
        {
          label: 'Department & Programme',
          value: activeMembership?.scopeLabel || 'Assigned upon institutional project mapping',
        },
      ];

  const roleStats = project
    ? [
        {
          label: 'Tasks Completed',
          value: `${completedTasks} / ${tasks.length}`,
          hint: tasks.length
            ? `${Math.round((completedTasks / tasks.length) * 100)}% task progress`
            : 'No tasks logged',
        },
        {
          label: 'Milestones Approved',
          value: `${approvedMilestones} / ${milestones.length}`,
          hint: `${milestones.length - approvedMilestones} remaining`,
        },
        {
          label: 'Weekly Journals',
          value: String(journals.length),
          hint: journals[0] ? `Latest: Week ${journals[0].weekNumber}` : 'No journals logged',
        },
        {
          label: 'Document Submissions',
          value: String(submissions.length),
          hint: project.nextDeadline ? `Next deadline: ${project.nextDeadline}` : 'No active deadline',
        },
      ]
    : [];

  return (
    <PortalLayout navItems={getPortalNavItems('student')}>
      <ProfileWorkspaceShell
        portalTitle="Student Profile & Preferences"
        portalSubtitle="Review your verified student identity, assigned capstone project scope, and editable personal contact details."
        systemFields={systemFields}
        roleStats={roleStats}
        roleEditableConfig={STUDENT_EDITABLE_FIELDS}
        quickLinks={STUDENT_QUICK_LINKS}
      >
        {!project ? (
          <div className="spt-surface rounded-2xl p-6">
            <EmptyState
              icon={Flag}
              title="No active student project assigned"
              description={`No student project record is currently mapped under ${institutionName || 'this institutional scope'}.`}
            />
          </div>
        ) : (
          <section
            aria-label="Assigned project record"
            className="spt-surface rounded-2xl p-5 sm:p-6 space-y-3"
          >
            <div className="flex items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-3">
              <div>
                <p className="font-mono text-xs font-semibold text-[var(--accent-primary)]">
                  {project.code} · {project.academicSession}
                </p>
                <h2 className="font-display text-base font-bold text-[var(--text-primary)] mt-0.5">
                  Assigned Capstone Project (Read-Only)
                </h2>
              </div>
            </div>
            <p className="text-sm font-semibold text-[var(--text-primary)] leading-snug">
              {project.title}
            </p>
            <div className="grid grid-cols-1 gap-2 text-xs text-[var(--text-muted)] sm:grid-cols-2">
              <p>
                Student: <strong className="text-[var(--text-primary)]">{project.studentName}</strong>
              </p>
              <p>
                Supervisor:{' '}
                <strong className="text-[var(--text-primary)]">{project.supervisorName}</strong>
              </p>
            </div>
          </section>
        )}
      </ProfileWorkspaceShell>
    </PortalLayout>
  );
}
