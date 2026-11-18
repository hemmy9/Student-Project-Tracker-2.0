import { Users } from 'lucide-react';
import PortalLayout from '../../../components/layout/PortalLayout';
import ProfileWorkspaceShell from '../../../components/profile/ProfileWorkspaceShell';
import EmptyState from '../../../components/ui/EmptyState';
import {
  GRACE_INSTITUTION_NAME,
  resolveInstitutionKey,
  resolveWorkspaceInstitution,
  useDemoAppState,
} from '../../../context/DemoAppStateContext';
import { useDemoSession } from '../../../context/DemoSessionContext';
import { getPortalNavItems } from '../../../utils/roleRouting';

const SUPERVISOR_EDITABLE_FIELDS = [
  {
    key: 'officeLocation',
    label: 'Default Consultation Room / Office',
    placeholder: 'e.g., SET Block, Room 2.04 · Computer Science Project Lab',
    helperText: 'Visible as your workspace supervision note for this institution.',
  },
  {
    key: 'consultationLink',
    label: 'Preferred Video Consultation URL',
    placeholder: 'https://meet.gracepolytechnic.edu.ng/supervisor-room',
    helperText: 'Optional reference link for virtual office hours.',
  },
  {
    key: 'availabilityNote',
    label: 'Supervision Hours Note',
    placeholder: 'e.g., Priority chapter feedback reviews every Tuesday & Thursday afternoon',
  },
  {
    key: 'roleNote',
    label: 'Faculty Supervision Focus',
    as: 'textarea',
    rows: 2,
    placeholder: 'Optional note on supervised research areas and review expectations...',
  },
];

const SUPERVISOR_QUICK_LINKS = [
  { to: '/supervisor/students', label: 'Assigned Students' },
  { to: '/supervisor/reviews', label: 'Document Reviews' },
  { to: '/supervisor/office-hours', label: 'Office Hours' },
  { to: '/supervisor/reports', label: 'Messages & Reports' },
];

export default function SupervisorProfilePage() {
  const { session, activeMembership } = useDemoSession();
  const { state } = useDemoAppState();

  const institutionName = resolveWorkspaceInstitution(activeMembership, session);
  const projectKey = resolveInstitutionKey(state.projectsByInstitution, institutionName);
  const primaryProj = projectKey ? state.projectsByInstitution[projectKey] : null;
  const officeKey = resolveInstitutionKey(state.officeHoursByInstitution, institutionName);
  const officeData = (officeKey && state.officeHoursByInstitution?.[officeKey]) || {
    availabilitySlots: [],
    bookings: [],
  };

  const isGraceWorkspace = institutionName === GRACE_INSTITUTION_NAME;

  const extraStudents = isGraceWorkspace ? state.supervisorExtraStudents : [];
  const extraReviews = isGraceWorkspace ? state.supervisorExtraSubmissions : [];

  const totalStudents = (primaryProj ? 1 : 0) + extraStudents.length;
  const pendingReviewsCount =
    (primaryProj?.submissions || []).filter((s) => s.status === 'Pending Review').length +
    extraReviews.filter((r) => r.status === 'Pending Review').length;
  const activeOfficeSlots = officeData.availabilitySlots.filter((s) => s.active).length;
  const confirmedBookings = officeData.bookings.filter((b) => b.status === 'Confirmed').length;

  const systemFields = [
    {
      label: 'Supervised Department',
      value: primaryProj?.department || 'Faculty Supervision Workspace',
    },
    {
      label: 'Primary Tracked Project',
      value: primaryProj ? `${primaryProj.code} · ${primaryProj.studentName}` : 'None assigned in tenant',
      mono: Boolean(primaryProj),
    },
    {
      label: 'Academic Session',
      value: primaryProj?.academicSession || 'Active institutional cohort',
    },
  ];

  const roleStats = [
    {
      label: 'Assigned Students',
      value: String(totalStudents),
      hint: isGraceWorkspace
        ? 'Primary + Grace Polytechnic cohort'
        : 'Isolated to active institutional scope',
    },
    {
      label: 'Pending Document Reviews',
      value: String(pendingReviewsCount),
      hint: 'Awaiting supervisor evaluation',
    },
    {
      label: 'Active Office Hour Windows',
      value: String(activeOfficeSlots),
      hint: `${confirmedBookings} confirmed booking(s)`,
    },
    {
      label: 'Tracked Project Journals',
      value: String(primaryProj?.journals?.length || 0),
      hint: primaryProj ? `Latest for ${primaryProj.studentName}` : 'No journals in workspace',
    },
  ];

  return (
    <PortalLayout navItems={getPortalNavItems('supervisor')}>
      <ProfileWorkspaceShell
        portalTitle="Supervisor Profile & Consultation Details"
        portalSubtitle="Inspect your faculty standing, supervised student cohort scope, and editable consultation notes."
        systemFields={systemFields}
        roleStats={roleStats}
        roleEditableConfig={SUPERVISOR_EDITABLE_FIELDS}
        quickLinks={SUPERVISOR_QUICK_LINKS}
      >
        {!primaryProj && !isGraceWorkspace && officeData.availabilitySlots.length === 0 ? (
          <div className="spt-surface rounded-2xl p-6">
            <EmptyState
              icon={Users}
              title="No supervised cohort mapped"
              description={`No student projects or office hours are currently assigned under ${institutionName || 'this institutional scope'}.`}
            />
          </div>
        ) : (
          <section
            aria-label="Supervision scope summary"
            className="spt-surface rounded-2xl p-5 sm:p-6 space-y-3"
          >
            <h2 className="font-display text-base font-bold text-[var(--text-primary)] border-b border-[var(--border-subtle)] pb-2.5">
              Active Supervision Cohort ({institutionName || activeMembership?.institutionName})
            </h2>
            {primaryProj && (
              <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-3.5 space-y-1">
                <p className="font-mono text-xs font-semibold text-[var(--accent-primary)]">
                  {primaryProj.code} · {primaryProj.programme}
                </p>
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  {primaryProj.studentName} — {primaryProj.title}
                </p>
              </div>
            )}
            <p className="text-xs text-[var(--text-muted)]">
              Showing {totalStudents} supervised student(s) and {activeOfficeSlots} active office
              hour slot(s) scoped strictly to {institutionName || 'this tenant'}.
            </p>
          </section>
        )}
      </ProfileWorkspaceShell>
    </PortalLayout>
  );
}
