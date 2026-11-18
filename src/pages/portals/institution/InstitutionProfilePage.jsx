import { Building2 } from 'lucide-react';
import PortalLayout from '../../../components/layout/PortalLayout';
import ProfileWorkspaceShell from '../../../components/profile/ProfileWorkspaceShell';
import EmptyState from '../../../components/ui/EmptyState';
import StatusAlert from '../../../components/ui/StatusAlert';
import { GRACE_POLYTECHNIC_PROVISIONAL_CATALOGUE } from '../../../config/gracePolytechnic';
import {
  GRACE_INSTITUTION_NAME,
  resolveInstitutionKey,
  resolveWorkspaceInstitution,
  useDemoAppState,
} from '../../../context/DemoAppStateContext';
import { useDemoSession } from '../../../context/DemoSessionContext';
import { getPortalNavItems } from '../../../utils/roleRouting';

const ADMIN_EDITABLE_FIELDS = [
  {
    key: 'officeLocation',
    label: 'Registry / Coordinator Desk Location',
    placeholder: 'e.g., Registry Block, Office of Academic Projects',
    helperText: 'Optional internal coordinator desk note saved locally.',
  },
  {
    key: 'roleNote',
    label: 'Governance & Handover Note',
    as: 'textarea',
    rows: 2,
    placeholder: 'Optional operational note for institutional approvals and session sign-off...',
  },
];

const ADMIN_QUICK_LINKS = [
  { to: '/admin/structure', label: 'Departments & Sessions' },
  { to: '/admin/approvals', label: 'Membership Approvals' },
  { to: '/admin/projects', label: 'Projects & Supervisors' },
  { to: '/admin/reports', label: 'Institutional Reports' },
];

export default function InstitutionProfilePage() {
  const { session, activeMembership } = useDemoSession();
  const { state } = useDemoAppState();

  const institutionName = resolveWorkspaceInstitution(activeMembership, session);
  const instKey = resolveInstitutionKey(state.institutionsState, institutionName);
  const inst = instKey ? state.institutionsState[instKey] : null;

  const activeSession =
    inst?.sessions?.find((s) => s.active)?.name || inst?.sessions?.[0]?.name || 'Not configured';
  const pendingRequests = (inst?.membershipRequests || []).filter(
    (r) => r.status === 'Pending Approval'
  ).length;
  const unassignedProjects = (inst?.projects || []).filter(
    (p) => p.supervisorName === 'Unassigned'
  ).length;

  const isGraceWorkspace = inst?.info?.name === GRACE_INSTITUTION_NAME;

  const systemFields = inst
    ? [
        { label: 'Managed Institution', value: inst.info.name },
        { label: 'Official Domain', value: inst.info.domain, mono: true },
        {
          label: 'Location',
          value:
            [inst.info.location, inst.info.country].filter(Boolean).join(', ') || 'Not specified',
        },
        { label: 'Registry Contact Email', value: inst.info.contactEmail || 'Not configured' },
        { label: 'Active Academic Session', value: activeSession },
      ]
    : [];

  const roleStats = inst
    ? [
        {
          label: 'Academic Departments',
          value: String(inst.departments.length),
          hint: `${inst.sessions.length} academic session(s)`,
        },
        {
          label: 'Pending Approvals',
          value: String(pendingRequests),
          hint: 'Student & supervisor requests',
        },
        {
          label: 'Tracked Projects',
          value: String(inst.projects.length),
          hint: `${unassignedProjects} awaiting supervisor`,
        },
        {
          label: 'Verified Supervisors',
          value: String(inst.verifiedSupervisors.length),
          hint: 'Eligible for project allocation',
        },
      ]
    : [];

  return (
    <PortalLayout navItems={getPortalNavItems('institution_admin')}>
      <ProfileWorkspaceShell
        portalTitle="Institution Administrator Profile"
        portalSubtitle="Inspect your institutional governance authority, managed academic structure scope, and coordinator contact notes."
        systemFields={systemFields}
        roleStats={roleStats}
        roleEditableConfig={ADMIN_EDITABLE_FIELDS}
        quickLinks={ADMIN_QUICK_LINKS}
      >
        {!inst ? (
          <div className="spt-surface rounded-2xl p-6">
            <EmptyState
              icon={Building2}
              title="Institution workspace record unavailable"
              description={`No institutional governance record is mapped under ${institutionName || 'this membership'}.`}
            />
          </div>
        ) : (
          <section
            aria-label="Institutional governance overview"
            className="spt-surface rounded-2xl p-5 sm:p-6 space-y-4"
          >
            <h2 className="font-display text-base font-bold text-[var(--text-primary)] border-b border-[var(--border-subtle)] pb-2.5">
              Managed Institutional Workspace · {inst.info.name}
            </h2>
            {isGraceWorkspace && (
              <StatusAlert type="info" title="Provisional Institutional Catalogue">
                {GRACE_POLYTECHNIC_PROVISIONAL_CATALOGUE.verificationNote}
              </StatusAlert>
            )}
            <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">
              <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-3.5 space-y-1">
                <p className="text-[var(--text-muted)]">Schools &amp; Departments</p>
                <p className="font-semibold text-[var(--text-primary)]">
                  {inst.schools?.length ? `${inst.schools.length} Schools · ` : ''}
                  {inst.departments.length} Departments
                </p>
              </div>
              <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-3.5 space-y-1">
                <p className="text-[var(--text-muted)]">Allocation &amp; Approvals Backlog</p>
                <p className="font-semibold text-[var(--text-primary)] tabular-nums">
                  {pendingRequests} pending approval(s) · {unassignedProjects} unassigned project(s)
                </p>
              </div>
            </div>
          </section>
        )}
      </ProfileWorkspaceShell>
    </PortalLayout>
  );
}
