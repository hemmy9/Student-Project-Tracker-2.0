import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import ActivityFeedStream from '../../components/dashboard/ActivityFeedStream';
import AiProjectCopilot from '../../components/dashboard/AiProjectCopilot';
import { BreakdownDonut, HorizontalBarChart } from '../../components/dashboard/AnalyticsPanel';
import DashboardSkeleton from '../../components/dashboard/DashboardSkeleton';
import SmartDashboardFilters from '../../components/dashboard/SmartDashboardFilters';
import Stage2Banner from '../../components/dashboard/Stage2Banner';
import StatCard from '../../components/dashboard/StatCard';
import StatusLabel from '../../components/dashboard/StatusLabel';
import PortalLayout from '../../components/layout/PortalLayout';
import EmptyState from '../../components/ui/EmptyState';
import { WidgetErrorBoundary } from '../../components/ui/ErrorBoundary';
import { useDemoAppState } from '../../context/DemoAppStateContext';
import { getPortalNavItems } from '../../utils/roleRouting';

const APP_FILTERS = ['All', 'Pending Review', 'Approved', 'Suspended', 'Rejected'];
const APP_SORTS = [
  { value: 'newest', label: 'Submitted (Newest)' },
  { value: 'seats_desc', label: 'Active Seats (Highest)' },
  { value: 'name_asc', label: 'Institution Name (A–Z)' },
];

export default function PlatformDashboardPage() {
  const { state } = useDemoAppState();
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [loadingPreview, setLoadingPreview] = useState(false);

  const { institutions, platformAdmins, auditLogs } = state.platformState;

  const approvedCount = institutions.filter((i) => i.status === 'Approved').length;
  const pendingCount = institutions.filter((i) => i.status === 'Pending Review').length;
  const suspendedCount = institutions.filter((i) => i.status === 'Suspended').length;
  const rejectedCount = institutions.filter((i) => i.status === 'Rejected').length;
  const totalSeats = institutions.reduce((sum, i) => sum + (i.activeUsers || 0), 0);

  const metrics = [
    {
      label: 'Registered Institutions',
      value: String(approvedCount),
      hint: 'Active verified academic tenants',
    },
    {
      label: 'Pending Applications',
      value: String(pendingCount),
      hint: 'Awaiting domain verification',
    },
    {
      label: 'Active Platform Seats',
      value: totalSeats.toLocaleString(),
      hint: 'Across approved institutions',
    },
    {
      label: 'Platform Admins',
      value: String(platformAdmins.length),
      hint: 'Isolated global governance scope',
    },
  ];

  const onboardingSegments = [
    { label: 'Approved', value: approvedCount, color: '#10B981' },
    { label: 'Pending Review', value: pendingCount, color: '#F59E0B' },
    { label: 'Suspended / Rejected', value: suspendedCount + rejectedCount, color: '#DC2626' },
  ];

  const seatBars = useMemo(() => {
    const activeInsts = institutions.filter((i) => i.activeUsers > 0);
    const maxSeats = Math.max(1, ...activeInsts.map((i) => i.activeUsers));
    return activeInsts.map((i) => ({
      label: i.institutionName,
      percent: Math.round((i.activeUsers / maxSeats) * 100),
      valueLabel: `${i.activeUsers} seats`,
      color: '#2563EB',
    }));
  }, [institutions]);

  const filteredApplications = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = institutions.filter((app) => {
      const matchesStatus = statusFilter === 'All' || app.status === statusFilter;
      const matchesQuery =
        !q ||
        app.institutionName.toLowerCase().includes(q) ||
        app.domain.toLowerCase().includes(q) ||
        app.applicantName.toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
    return [...list].sort((a, b) => {
      if (sortBy === 'seats_desc') return (b.activeUsers || 0) - (a.activeUsers || 0);
      if (sortBy === 'name_asc') return a.institutionName.localeCompare(b.institutionName);
      return b.submittedAt.localeCompare(a.submittedAt);
    });
  }, [institutions, statusFilter, searchQuery, sortBy]);

  const hasActiveAppFilters =
    statusFilter !== 'All' || searchQuery.trim() !== '' || sortBy !== 'newest';

  const aiContextData = useMemo(
    () => ({
      approvedInstitutions: approvedCount,
      pendingApplications: pendingCount,
      suspendedOrRejected: suspendedCount + rejectedCount,
      totalSeats,
      pendingList: institutions
        .filter((i) => i.status === 'Pending Review')
        .map((i) => ({ name: i.institutionName, domain: i.domain, submittedAt: i.submittedAt })),
      recentAuditLogs: auditLogs.slice(0, 5),
    }),
    [approvedCount, pendingCount, suspendedCount, rejectedCount, totalSeats, institutions, auditLogs]
  );

  return (
    <PortalLayout navItems={getPortalNavItems('platform_admin')}>
      <Stage2Banner
        portalName="Platform Administrator Portal"
        tenantLabel="Platform-Wide Governance"
        loadingPreview={loadingPreview}
        onToggleLoadingPreview={setLoadingPreview}
      />

      {loadingPreview ? (
        <DashboardSkeleton variant="full" />
      ) : (
        <>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono text-[#2563EB]">
              <Shield className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>PRIVILEGED PLATFORM SCOPE</span>
            </div>
            <h1 className="font-display text-2xl font-bold text-[#172554]">
              Platform Governance &amp; Institution Onboarding
            </h1>
            <p className="text-sm text-[#64748B]">
              Separated from institutional roles. Verify incoming universities and audit critical actions.
            </p>
          </div>

          <section
            aria-label="Platform metrics"
            className="grid grid-cols-1 gap-4 sm:grid-cols-6 lg:grid-cols-12"
          >
            {metrics.map((metric) => (
              <div key={metric.label} className="sm:col-span-3 lg:col-span-3">
                <StatCard label={metric.label} value={metric.value} hint={metric.hint} />
              </div>
            ))}
          </section>

          <section
            aria-label="Platform analytics"
            className="grid grid-cols-1 gap-4 lg:grid-cols-12"
          >
            <div className="lg:col-span-6">
              <BreakdownDonut
                title="Tenant Onboarding Standing"
                subtitle="Status breakdown across all institutional records"
                segments={onboardingSegments}
              />
            </div>
            <div className="lg:col-span-6">
              <HorizontalBarChart
                title="Active Seat Distribution"
                subtitle="Verified academic accounts per active institution"
                items={seatBars}
              />
            </div>
          </section>

          <WidgetErrorBoundary title="AI Platform Governance Copilot unavailable">
            <AiProjectCopilot
              roleKey="platform_admin"
              institutionName="Platform-Wide Governance"
              contextData={aiContextData}
              title="AI Platform Governance Copilot"
              subtitle="Domain verification triage, tenant health overview, and audit summary powered by Gemini."
            />
          </WidgetErrorBoundary>

          {/* Institution Applications & Directory */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-display text-lg font-bold text-[#172554]">
                  Institution Applications &amp; Registry
                </h2>
                <p className="text-xs text-[#64748B]">
                  Review institutional domains and registration applications across the platform.
                </p>
              </div>

              <Link
                to="/platform/applications"
                className="text-xs font-semibold text-[#2563EB] hover:underline whitespace-nowrap"
              >
                Review queue →
              </Link>
            </div>

            <SmartDashboardFilters
              searchValue={searchQuery}
              onSearchChange={setSearchQuery}
              searchPlaceholder="Search institution, domain, or applicant..."
              filterOptions={APP_FILTERS}
              activeFilter={statusFilter}
              onFilterChange={setStatusFilter}
              sortOptions={APP_SORTS}
              activeSort={sortBy}
              onSortChange={setSortBy}
              summaryText={`Showing ${filteredApplications.length} of ${institutions.length} institutions`}
              hasActiveFilters={hasActiveAppFilters}
              onReset={() => {
                setStatusFilter('All');
                setSearchQuery('');
                setSortBy('newest');
              }}
            />

            {filteredApplications.length === 0 ? (
              <EmptyState
                title={`No institutions marked "${statusFilter}"`}
                description="Reset the filter to view all registered and pending institutions."
                actionLabel="Show all institutions"
                onAction={() => setStatusFilter('All')}
              />
            ) : (
              <>
                <div className="divide-y divide-slate-100 md:hidden">
                  {filteredApplications.map((app) => (
                    <div key={app.id} className="py-3.5 first:pt-0 last:pb-0 space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-bold text-[#172554]">
                            {app.institutionName}
                          </p>
                          <p className="font-mono text-xs text-[#64748B]">
                            {app.domain} · {app.country}
                          </p>
                        </div>
                        <StatusLabel status={app.status} />
                      </div>
                      <p className="text-xs text-[#64748B] tabular-nums">
                        Contact: {app.applicantName} · Submitted {app.submittedAt}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-xs font-semibold text-[#64748B]">
                        <th className="py-2.5 pr-4">Institution</th>
                        <th className="py-2.5 px-4">Domain</th>
                        <th className="py-2.5 px-4">Primary Applicant</th>
                        <th className="py-2.5 px-4">Submitted</th>
                        <th className="py-2.5 pl-4 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredApplications.map((app) => (
                        <tr key={app.id} className="hover:bg-slate-50/70">
                          <td className="py-3 pr-4">
                            <p className="font-semibold text-[#172554]">{app.institutionName}</p>
                            <p className="text-xs text-[#64748B]">{app.country}</p>
                          </td>
                          <td className="py-3 px-4 font-mono text-xs text-[#172554]">
                            {app.domain}
                          </td>
                          <td className="py-3 px-4">
                            <p className="text-xs font-medium text-[#172554]">{app.applicantName}</p>
                            <p className="text-xs text-[#64748B]">{app.applicantEmail}</p>
                          </td>
                          <td className="py-3 px-4 font-mono text-xs text-[#64748B] tabular-nums">
                            {app.submittedAt}
                          </td>
                          <td className="py-3 pl-4 text-right">
                            <StatusLabel status={app.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </section>

          {/* Platform Governance Audit Log */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-display text-lg font-bold text-[#172554]">
                Recent Governance Audit Trail
              </h2>
              <Link
                to="/platform/governance"
                className="text-xs font-semibold text-[#2563EB] hover:underline whitespace-nowrap"
              >
                Open governance settings →
              </Link>
            </div>
            <div className="divide-y divide-slate-100">
              {auditLogs.slice(0, 5).map((log) => (
                <div
                  key={log.id}
                  className="py-3 first:pt-0 last:pb-0 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold text-[#172554]">{log.action}</p>
                    <p className="text-xs text-[#64748B]">
                      Actor: {log.actor} · Target: {log.target}
                    </p>
                  </div>
                  <p className="font-mono text-xs text-[#64748B] tabular-nums shrink-0">
                    {log.timestamp}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <ActivityFeedStream
            title="Platform Activity Feed & Recent Logs"
            subtitle="Cross-system governance stream and institutional onboarding events."
          />
        </>
      )}
    </PortalLayout>
  );
}
