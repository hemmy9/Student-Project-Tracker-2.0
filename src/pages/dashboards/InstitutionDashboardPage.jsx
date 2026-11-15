import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Users } from 'lucide-react';
import ActivityFeedStream from '../../components/dashboard/ActivityFeedStream';
import { BreakdownDonut, HorizontalBarChart } from '../../components/dashboard/AnalyticsPanel';
import DashboardSkeleton from '../../components/dashboard/DashboardSkeleton';
import SmartDashboardFilters from '../../components/dashboard/SmartDashboardFilters';
import Stage2Banner from '../../components/dashboard/Stage2Banner';
import StatCard from '../../components/dashboard/StatCard';
import StatusLabel from '../../components/dashboard/StatusLabel';
import PortalLayout from '../../components/layout/PortalLayout';
import EmptyState from '../../components/ui/EmptyState';
import { useDemoAppState } from '../../context/DemoAppStateContext';
import { useDemoSession } from '../../context/DemoSessionContext';
import { getPortalNavItems } from '../../utils/roleRouting';

const REQUEST_FILTERS = ['All', 'Student', 'Supervisor'];
const REQUEST_SORTS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'name_asc', label: 'Applicant Name (A–Z)' },
];

export default function InstitutionDashboardPage() {
  const { activeMembership } = useDemoSession();
  const { state } = useDemoAppState();
  const [roleFilter, setRoleFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [loadingPreview, setLoadingPreview] = useState(false);

  const institutionName = activeMembership?.institutionName || 'University of Westbridge';
  const inst =
    state.institutionsState[institutionName] ||
    state.institutionsState['University of Westbridge'];

  const activeSession = inst.sessions.find((s) => s.active)?.name || inst.sessions[0]?.name || '—';
  const pendingRequests = inst.membershipRequests.filter((r) => r.status === 'Pending Approval');
  const unassignedProjects = inst.projects.filter((p) => p.supervisorName === 'Unassigned').length;
  const assignedProjects = inst.projects.length - unassignedProjects;

  const metrics = [
    {
      label: 'Departments',
      value: String(inst.departments.length),
      hint: `${inst.departments.reduce((sum, d) => sum + d.programmes.length, 0)} active programmes`,
    },
    {
      label: 'Pending Approvals',
      value: String(pendingRequests.length),
      hint: `${inst.invitations.length} supervisor invite(s)`,
    },
    {
      label: 'Institutional Projects',
      value: String(inst.projects.length),
      hint: `${unassignedProjects} awaiting supervisor assignment`,
    },
    {
      label: 'Verified Supervisors',
      value: String(inst.verifiedSupervisors.length),
      hint: 'Eligible for project allocation',
    },
  ];

  const allocationSegments = [
    { label: 'Supervisor Assigned', value: assignedProjects, color: '#10B981' },
    { label: 'Unassigned', value: unassignedProjects, color: '#F59E0B' },
  ];

  const departmentLoadBars = useMemo(() => {
    const maxStudents = Math.max(1, ...inst.departments.map((d) => d.students || 1));
    return inst.departments.map((d) => ({
      label: d.name,
      percent: Math.round(((d.students || 1) / maxStudents) * 100),
      valueLabel: `${d.students} students · ${d.supervisors} sup`,
      color: '#2563EB',
    }));
  }, [inst.departments]);

  const filteredRequests = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = inst.membershipRequests.filter((req) => {
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
  }, [inst.membershipRequests, roleFilter, searchQuery, sortBy]);

  const hasActiveRequestFilters =
    roleFilter !== 'All' || searchQuery.trim() !== '' || sortBy !== 'newest';

  return (
    <PortalLayout navItems={getPortalNavItems('institution_admin')}>
      <Stage2Banner
        portalName="Institution Administrator Portal"
        tenantLabel={inst.info.name}
        loadingPreview={loadingPreview}
        onToggleLoadingPreview={setLoadingPreview}
      />

      {loadingPreview ? (
        <DashboardSkeleton variant="full" />
      ) : (
        <>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-mono text-[#2563EB]">
                <Building2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{inst.info.domain}</span>
              </div>
              <h1 className="font-display text-2xl font-bold text-[#172554]">{inst.info.name}</h1>
              <p className="text-sm text-[#64748B]">
                Isolated Tenant Workspace · {activeSession}
              </p>
            </div>
          </div>

          <section
            aria-label="Institution metrics"
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            {metrics.map((metric) => (
              <StatCard
                key={metric.label}
                label={metric.label}
                value={metric.value}
                hint={metric.hint}
              />
            ))}
          </section>

          <section
            aria-label="Institutional analytics"
            className="grid grid-cols-1 gap-4 lg:grid-cols-2"
          >
            <BreakdownDonut
              title="Supervisor Allocation Coverage"
              subtitle="Assigned vs. unassigned student projects"
              segments={allocationSegments}
            />
            <HorizontalBarChart
              title="Department Enrollment Distribution"
              subtitle="Tracked students and faculty capacity per department"
              items={departmentLoadBars}
            />
          </section>

          {/* Membership Requests */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-display text-lg font-bold text-[#172554]">
                  Membership Approvals Queue
                </h2>
                <p className="text-xs text-[#64748B]">
                  Student and supervisor registrations awaiting institutional verification.
                </p>
              </div>

              <Link
                to="/institution/approvals"
                className="text-xs font-semibold text-[#2563EB] hover:underline whitespace-nowrap"
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
              summaryText={`Showing ${filteredRequests.length} of ${inst.membershipRequests.length} membership requests`}
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
                <div className="divide-y divide-slate-100 md:hidden">
                  {filteredRequests.map((req) => (
                    <div key={req.id} className="py-3.5 first:pt-0 last:pb-0 space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-bold text-[#172554]">{req.name}</p>
                          <p className="text-xs text-[#64748B]">
                            {req.role} · {req.identifier}
                          </p>
                        </div>
                        <StatusLabel status={req.status} />
                      </div>
                      <p className="text-xs text-[#64748B]">
                        {req.department} · Requested {req.requestedAt}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-xs font-semibold text-[#64748B]">
                        <th className="py-2.5 pr-4">Applicant</th>
                        <th className="py-2.5 px-4">Requested Role</th>
                        <th className="py-2.5 px-4">Department</th>
                        <th className="py-2.5 px-4">Submitted</th>
                        <th className="py-2.5 pl-4 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredRequests.map((req) => (
                        <tr key={req.id} className="hover:bg-slate-50/70">
                          <td className="py-3 pr-4">
                            <p className="font-semibold text-[#172554]">{req.name}</p>
                            <p className="font-mono text-xs text-[#64748B] tabular-nums">
                              {req.identifier}
                            </p>
                          </td>
                          <td className="py-3 px-4 text-xs font-medium text-[#172554]">
                            {req.role}
                          </td>
                          <td className="py-3 px-4 text-xs text-[#64748B]">{req.department}</td>
                          <td className="py-3 px-4 font-mono text-xs text-[#64748B] tabular-nums">
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

          {/* Departments & Programmes Breakdown */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="font-display text-lg font-bold text-[#172554]">
                  Departments &amp; Programmes
                </h2>
                <p className="text-xs text-[#64748B]">
                  Departmental breakdown scoped exclusively to {inst.info.name}.
                </p>
              </div>
              <Link
                to="/institution/structure"
                className="text-xs font-semibold text-[#2563EB] hover:underline whitespace-nowrap"
              >
                Manage structure →
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {inst.departments.map((dept) => (
                <div
                  key={dept.id}
                  className="py-3.5 first:pt-0 last:pb-0 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold text-[#172554]">{dept.name}</p>
                    <p className="text-xs text-[#64748B] tabular-nums">
                      {dept.programmes.length} programmes · {dept.students} students ·{' '}
                      {dept.supervisors} supervisors
                    </p>
                  </div>
                  <p className="text-xs text-[#64748B]">{dept.programmes.join(' · ')}</p>
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
