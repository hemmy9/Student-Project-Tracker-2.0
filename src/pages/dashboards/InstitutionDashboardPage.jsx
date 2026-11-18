import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Building2,
  FileSpreadsheet,
  FolderKanban,
  Layers,
  UserCheck,
  Users,
} from 'lucide-react';
import ActivityFeedStream from '../../components/dashboard/ActivityFeedStream';
import AiProjectCopilot from '../../components/dashboard/AiProjectCopilot';
import { BreakdownDonut, HorizontalBarChart } from '../../components/dashboard/AnalyticsPanel';
import DashboardSkeleton from '../../components/dashboard/DashboardSkeleton';
import DeadlineRemindersBanner from '../../components/dashboard/DeadlineRemindersBanner';
import SmartDashboardFilters from '../../components/dashboard/SmartDashboardFilters';
import Stage2Banner from '../../components/dashboard/Stage2Banner';
import StatCard from '../../components/dashboard/StatCard';
import StatusLabel from '../../components/dashboard/StatusLabel';
import PortalLayout from '../../components/layout/PortalLayout';
import EmptyState from '../../components/ui/EmptyState';
import { WidgetErrorBoundary } from '../../components/ui/ErrorBoundary';
import StatusAlert from '../../components/ui/StatusAlert';
import {
  GRACE_POLYTECHNIC_BRAND,
  GRACE_POLYTECHNIC_PROVISIONAL_CATALOGUE,
} from '../../config/gracePolytechnic';
import {
  GRACE_INSTITUTION_NAME,
  resolveInstitutionKey,
  resolveWorkspaceInstitution,
  useDemoAppState,
} from '../../context/DemoAppStateContext';
import { useDemoSession } from '../../context/DemoSessionContext';
import { getPortalNavItems } from '../../utils/roleRouting';

const REQUEST_FILTERS = ['All', 'Student', 'Supervisor'];
const REQUEST_SORTS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'name_asc', label: 'Applicant Name (A–Z)' },
];

export default function InstitutionDashboardPage() {
  const { activeMembership, session } = useDemoSession();
  const { state } = useDemoAppState();
  const [roleFilter, setRoleFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [loadingPreview, setLoadingPreview] = useState(false);

  const institutionName = resolveWorkspaceInstitution(activeMembership, session);
  const instKey = resolveInstitutionKey(state.institutionsState, institutionName);
  const inst = instKey ? state.institutionsState[instKey] : null;

  const departments = inst?.departments || [];
  const sessions = inst?.sessions || [];
  const membershipRequests = inst?.membershipRequests || [];
  const invitations = inst?.invitations || [];
  const projects = inst?.projects || [];
  const verifiedSupervisors = inst?.verifiedSupervisors || [];
  const isGraceWorkspace = inst?.info?.name === GRACE_INSTITUTION_NAME;

  const activeSession = sessions.find((s) => s.active)?.name || sessions[0]?.name || '—';
  const pendingRequests = membershipRequests.filter((r) => r.status === 'Pending Approval');
  const unassignedProjects = projects.filter((p) => p.supervisorName === 'Unassigned').length;
  const assignedProjects = projects.length - unassignedProjects;

  const metrics = [
    {
      label: 'Departments',
      value: String(departments.length),
      hint: `${departments.reduce((sum, d) => sum + (d.programmes?.length || 0), 0)} tracked programmes`,
    },
    {
      label: 'Pending Approvals',
      value: String(pendingRequests.length),
      hint: `${invitations.length} supervisor invite(s)`,
    },
    {
      label: 'Institutional Projects',
      value: String(projects.length),
      hint: `${unassignedProjects} awaiting supervisor assignment`,
    },
    {
      label: 'Verified Supervisors',
      value: String(verifiedSupervisors.length),
      hint: 'Eligible for project allocation',
    },
  ];

  const allocationSegments = [
    { label: 'Supervisor Assigned', value: assignedProjects, color: '#10B981' },
    { label: 'Unassigned', value: unassignedProjects, color: '#F59E0B' },
  ];

  const departmentLoadBars = useMemo(() => {
    const maxStudents = Math.max(1, ...departments.map((d) => d.students || 1));
    return departments.map((d) => ({
      label: d.code ? `${d.code} · ${d.name}` : d.name,
      percent: Math.round(((d.students || 1) / maxStudents) * 100),
      valueLabel: `${d.students} students · ${d.supervisors} sup`,
      color: '#2563EB',
    }));
  }, [departments]);

  const departmentsBySchool = useMemo(() => {
    if (!departments.length) return [];
    const groups = new Map();
    departments.forEach((dept) => {
      const label = dept.schoolName || 'Academic Departments';
      if (!groups.has(label)) groups.set(label, []);
      groups.get(label).push(dept);
    });
    return Array.from(groups.entries()).map(([schoolName, items]) => ({ schoolName, items }));
  }, [departments]);

  const filteredRequests = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = membershipRequests.filter((req) => {
      const matchesRole = roleFilter === 'All' || req.role === roleFilter;
      const matchesQuery =
        !q ||
        req.name.toLowerCase().includes(q) ||
        req.identifier.toLowerCase().includes(q) ||
        req.department.toLowerCase().includes(q);
      return matchesRole && matchesQuery;
    });
    return [...list].sort((a, b) => {
      if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
      return b.requestedAt.localeCompare(a.requestedAt);
    });
  }, [membershipRequests, roleFilter, searchQuery, sortBy]);

  const hasActiveRequestFilters =
    roleFilter !== 'All' || searchQuery.trim() !== '' || sortBy !== 'newest';

  const operationsHub = [
    {
      title: 'Academic Structure',
      subtitle: 'Manage Schools, departments, ND/HND levels, study modes, and active sessions.',
      stat: `${departments.length} dept(s) · ${sessions.length} sessions`,
      to: '/admin/structure',
      Icon: Layers,
    },
    {
      title: 'Approvals & Invites',
      subtitle: 'Review pending student & supervisor memberships and issue faculty demo invites.',
      stat: `${pendingRequests.length} pending review`,
      to: '/admin/approvals',
      Icon: UserCheck,
    },
    {
      title: 'Projects & Allocation',
      subtitle: 'Assign verified supervisors to unassigned student projects and register topics.',
      stat: `${unassignedProjects} unassigned project(s)`,
      to: '/admin/projects',
      Icon: FolderKanban,
    },
    {
      title: 'Institutional Reports',
      subtitle: 'Generate print-ready institutional supervision summaries and export CSV/Markdown.',
      stat: `${projects.length} tracked projects`,
      to: '/admin/reports',
      Icon: FileSpreadsheet,
    },
  ];

  const aiContextData = useMemo(
    () =>
      inst
        ? {
            institution: inst.info.name,
            activeSession,
            pendingApprovalsCount: pendingRequests.length,
            unassignedProjects,
            assignedProjects,
            departments: departments.map((d) => ({
              name: d.name,
              students: d.students,
              supervisors: d.supervisors,
            })),
          }
        : {},
    [inst, activeSession, pendingRequests.length, unassignedProjects, assignedProjects, departments]
  );

  return (
    <PortalLayout navItems={getPortalNavItems('institution_admin')}>
      <Stage2Banner
        portalName="Institution Administrator Portal"
        tenantLabel={inst?.info?.name || institutionName || 'Institution Workspace'}
        loadingPreview={loadingPreview}
        onToggleLoadingPreview={setLoadingPreview}
      />

      {loadingPreview ? (
        <DashboardSkeleton variant="full" />
      ) : !inst ? (
        <div className="spt-surface rounded-2xl p-6">
          <EmptyState
            title="Institution workspace unavailable"
            description="No institutional structure record matches this active account scope."
          />
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[var(--accent-primary)]">
                <Building2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{inst.info.domain}</span>
                {isGraceWorkspace && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="text-[var(--text-muted)]">{GRACE_POLYTECHNIC_BRAND.location}</span>
                  </>
                )}
              </div>
              <h1 className="font-display text-2xl font-bold text-[var(--text-primary)]">
                {inst.info.name}
              </h1>
              <p className="text-sm text-[var(--text-muted)]">
                Institution Administration Workspace · {activeSession}
              </p>
            </div>

            <Link
              to="/admin/reports"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--accent-primary)] hover:underline whitespace-nowrap"
            >
              <FileSpreadsheet className="h-4 w-4" aria-hidden="true" />
              <span>Open institutional reports →</span>
            </Link>
          </div>

          {isGraceWorkspace && (
            <StatusAlert type="info" title="Provisional Academic Structure">
              {GRACE_POLYTECHNIC_PROVISIONAL_CATALOGUE.verificationNote}{' '}
              <Link to="/admin/structure" className="font-semibold underline ml-1">
                Review Schools &amp; Departments
              </Link>
            </StatusAlert>
          )}

          <DeadlineRemindersBanner />

          {/* Administrative Operations Hub */}
          <section
            aria-label="Administrative operations hub"
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            {operationsHub.map((card) => {
              const Icon = card.Icon;
              return (
                <Link
                  key={card.to}
                  to={card.to}
                  className="spt-surface rounded-2xl p-4 sm:p-5 flex flex-col justify-between gap-3 hover:border-[var(--accent-primary)] transition-colors group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--accent-primary)]">
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <ArrowRight
                        className="h-4 w-4 text-[var(--text-muted)] group-hover:text-[var(--accent-primary)] group-hover:translate-x-0.5 transition-all"
                        aria-hidden="true"
                      />
                    </div>
                    <h2 className="font-display text-base font-bold text-[var(--text-primary)]">
                      {card.title}
                    </h2>
                    <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                      {card.subtitle}
                    </p>
                  </div>
                  <p className="font-mono text-[11px] font-semibold text-[var(--accent-primary)] pt-1 border-t border-[var(--border-subtle)]">
                    {card.stat}
                  </p>
                </Link>
              );
            })}
          </section>

          <section
            aria-label="Institution metrics"
            className="grid grid-cols-1 gap-4 sm:grid-cols-6 lg:grid-cols-12"
          >
            {metrics.map((metric) => (
              <div key={metric.label} className="sm:col-span-3 lg:col-span-3">
                <StatCard label={metric.label} value={metric.value} hint={metric.hint} />
              </div>
            ))}
          </section>

          <section
            aria-label="Institutional analytics"
            className="grid grid-cols-1 gap-4 lg:grid-cols-12"
          >
            <div className="lg:col-span-6">
              <BreakdownDonut
                title="Supervisor Allocation Coverage"
                subtitle="Assigned vs. unassigned student projects"
                segments={allocationSegments}
              />
            </div>
            <div className="lg:col-span-6">
              <HorizontalBarChart
                title="Department Enrollment Distribution"
                subtitle="Tracked students and faculty capacity per department"
                items={departmentLoadBars}
              />
            </div>
          </section>

          <WidgetErrorBoundary title="AI Institutional Operations Copilot unavailable">
            <AiProjectCopilot
              roleKey="institution_admin"
              institutionName={inst.info.name}
              contextData={aiContextData}
              title="AI Institutional Operations Copilot"
              subtitle="Analyze supervisor allocation gaps, departmental workload, and verification bottlenecks."
            />
          </WidgetErrorBoundary>

          {/* Membership Requests */}
          <section className="spt-surface rounded-2xl p-5 sm:p-6 space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-display text-lg font-bold text-[var(--text-primary)]">
                  Membership Approvals Queue
                </h2>
                <p className="text-xs text-[var(--text-muted)]">
                  Student and supervisor registrations awaiting institutional verification.
                </p>
              </div>

              <Link
                to="/admin/approvals"
                className="text-xs font-semibold text-[var(--accent-primary)] hover:underline whitespace-nowrap"
              >
                Process requests →
              </Link>
            </div>

            <SmartDashboardFilters
              searchValue={searchQuery}
              onSearchChange={setSearchQuery}
              searchPlaceholder="Search applicant, ID, or department..."
              filterOptions={REQUEST_FILTERS}
              activeFilter={roleFilter}
              onFilterChange={setRoleFilter}
              sortOptions={REQUEST_SORTS}
              activeSort={sortBy}
              onSortChange={setSortBy}
              summaryText={`Showing ${filteredRequests.length} of ${membershipRequests.length} membership requests`}
              hasActiveFilters={hasActiveRequestFilters}
              onReset={() => {
                setRoleFilter('All');
                setSearchQuery('');
                setSortBy('newest');
              }}
            />

            {filteredRequests.length === 0 ? (
              <EmptyState
                icon={Users}
                title={`No ${roleFilter.toLowerCase()} requests`}
                description="All submitted membership requests for this filter have been processed."
                actionLabel="View all requests"
                onAction={() => setRoleFilter('All')}
              />
            ) : (
              <>
                <div className="divide-y divide-[var(--border-subtle)] md:hidden">
                  {filteredRequests.map((req) => (
                    <div key={req.id} className="py-3.5 first:pt-0 last:pb-0 space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-bold text-[var(--text-primary)]">{req.name}</p>
                          <p className="text-xs text-[var(--text-muted)]">
                            {req.role} · {req.identifier}
                          </p>
                        </div>
                        <StatusLabel status={req.status} />
                      </div>
                      <p className="text-xs text-[var(--text-muted)]">
                        {req.department} · Requested {req.requestedAt}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-muted)]">
                        <th className="py-2.5 pr-4">Applicant</th>
                        <th className="py-2.5 px-4">Requested Role</th>
                        <th className="py-2.5 px-4">Department</th>
                        <th className="py-2.5 px-4">Submitted</th>
                        <th className="py-2.5 pl-4 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-subtle)]">
                      {filteredRequests.map((req) => (
                        <tr key={req.id} className="hover:bg-[var(--bg-elevated)]/60">
                          <td className="py-3 pr-4">
                            <p className="font-semibold text-[var(--text-primary)]">{req.name}</p>
                            <p className="font-mono text-xs text-[var(--text-muted)] tabular-nums">
                              {req.identifier}
                            </p>
                          </td>
                          <td className="py-3 px-4 text-xs font-medium text-[var(--text-primary)]">
                            {req.role}
                          </td>
                          <td className="py-3 px-4 text-xs text-[var(--text-muted)]">{req.department}</td>
                          <td className="py-3 px-4 font-mono text-xs text-[var(--text-muted)] tabular-nums">
                            {req.requestedAt}
                          </td>
                          <td className="py-3 pl-4 text-right">
                            <StatusLabel status={req.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </section>

          {/* Schools, Departments & Programmes Breakdown */}
          <section className="spt-surface rounded-2xl p-5 sm:p-6 space-y-5">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="font-display text-lg font-bold text-[var(--text-primary)]">
                  Schools, Departments &amp; Programmes
                </h2>
                <p className="text-xs text-[var(--text-muted)]">
                  Departmental structure, qualification levels, and study modes scoped to {inst.info.name}.
                </p>
              </div>
              <Link
                to="/admin/structure"
                className="text-xs font-semibold text-[var(--accent-primary)] hover:underline whitespace-nowrap"
              >
                Manage structure →
              </Link>
            </div>

            <div className="space-y-5">
              {departmentsBySchool.map((group) => (
                <div
                  key={group.schoolName}
                  className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4 space-y-3"
                >
                  <div className="flex items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-2">
                    <h3 className="font-display text-sm font-bold text-[var(--text-primary)]">
                      {group.schoolName}
                    </h3>
                    <span className="font-mono text-[11px] text-[var(--text-muted)]">
                      {group.items.length} dept(s)
                    </span>
                  </div>

                  <div className="divide-y divide-[var(--border-subtle)]">
                    {group.items.map((dept) => (
                      <div
                        key={dept.id}
                        className="py-3 first:pt-0 last:pb-0 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            {dept.code && (
                              <span className="font-mono text-[11px] font-bold text-[var(--accent-primary)]">
                                {dept.code}
                              </span>
                            )}
                            <p className="text-sm font-semibold text-[var(--text-primary)]">
                              {dept.name}
                            </p>
                            {dept.provisional && (
                              <span className="rounded border border-amber-300 dark:border-amber-700/70 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-amber-800 dark:text-amber-300">
                                Provisional
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[var(--text-muted)] tabular-nums">
                            {dept.students} students · {dept.supervisors} supervisors
                            {dept.qualificationLevels?.length
                              ? ` · Levels: ${dept.qualificationLevels.join('/')}`
                              : ''}
                            {dept.studyModes?.length
                              ? ` · ${dept.studyModes.join(' & ')}`
                              : ''}
                          </p>
                        </div>
                        <p className="text-xs text-[var(--text-muted)]">
                          {(dept.programmes || []).join(' · ')}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <ActivityFeedStream
            title="Institutional Activity Feed & Recent Logs"
            subtitle="Live tenant activity across membership approvals, project reviews, and student submissions."
          />
        </>
      )}
    </PortalLayout>
  );
}

