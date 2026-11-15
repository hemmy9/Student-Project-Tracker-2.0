import { useMemo, useState } from 'react';
import { Building2, PauseCircle, PlayCircle, Search, ShieldCheck } from 'lucide-react';
import StatusLabel from '../../../components/dashboard/StatusLabel';
import PortalLayout from '../../../components/layout/PortalLayout';
import Button from '../../../components/ui/Button';
import EmptyState from '../../../components/ui/EmptyState';
import StatusAlert from '../../../components/ui/StatusAlert';
import { useDemoAppState } from '../../../context/DemoAppStateContext';
import { useDemoSession } from '../../../context/DemoSessionContext';
import { getPortalNavItems } from '../../../utils/roleRouting';

const DIR_FILTERS = ['All', 'Approved', 'Pending Review', 'Suspended', 'Rejected'];

export default function PlatformInstitutionsPage() {
  const { session } = useDemoSession();
  const { state, decideInstitutionApplication } = useDemoAppState();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [notice, setNotice] = useState('');

  const institutions = state.platformState.institutions;

  const filteredInstitutions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return institutions.filter((inst) => {
      const matchesStatus = statusFilter === 'All' || inst.status === statusFilter;
      const matchesQuery =
        !q ||
        inst.institutionName.toLowerCase().includes(q) ||
        inst.domain.toLowerCase().includes(q) ||
        inst.country.toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [institutions, searchQuery, statusFilter]);

  const handleStatusChange = (inst, nextStatus) => {
    decideInstitutionApplication(inst.id, nextStatus, session?.fullName);
    setNotice(`${inst.institutionName} account status updated to ${nextStatus} and logged to audit trail.`);
  };

  return (
    <PortalLayout navItems={getPortalNavItems('platform_admin')}>
      <div className="space-y-1">
        <p className="font-mono text-xs font-medium text-[#2563EB]">
          PLATFORM DIRECTORY · TENANT ACCOUNTS
        </p>
        <h1 className="font-display text-2xl font-bold text-[#172554]">
          Registered Institutions Directory
        </h1>
        <p className="text-sm text-[#64748B]">
          Manage institutional tenant account statuses without exposing private student or supervisor academic records.
        </p>
      </div>

      {notice && (
        <StatusAlert type="success" title="Institutional account updated">
          {notice}
        </StatusAlert>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search institution, domain, or country..."
              aria-label="Search registered institutions"
              className="min-h-[44px] w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-base sm:text-sm text-[#172554] placeholder:text-slate-400 focus:border-[#2563EB] focus:outline-none"
            />
          </div>

          <div
            role="tablist"
            aria-label="Filter institutions by status"
            className="flex items-center gap-1 overflow-x-auto rounded-lg border border-slate-200 bg-slate-100 p-1"
          >
            {DIR_FILTERS.map((filter) => (
              <button
                key={filter}
                type="button"
                role="tab"
                aria-selected={statusFilter === filter}
                onClick={() => setStatusFilter(filter)}
                className={`min-h-[36px] rounded-md px-3 py-1.5 text-xs font-medium whitespace-nowrap cursor-pointer ${
                  statusFilter === filter
                    ? 'bg-white text-[#172554] shadow-xs'
                    : 'text-[#64748B] hover:text-[#172554]'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {filteredInstitutions.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="No matching institutions"
            description="Adjust your search term or status filter to view registered institutions."
            actionLabel="Show all institutions"
            onAction={() => {
              setSearchQuery('');
              setStatusFilter('All');
            }}
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredInstitutions.map((inst) => (
              <div
                key={inst.id}
                className="py-4 first:pt-0 last:pb-0 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <p className="font-display text-base font-bold text-[#172554]">
                      {inst.institutionName}
                    </p>
                    <StatusLabel status={inst.status} />
                  </div>
                  <p className="font-mono text-xs text-[#64748B] tabular-nums">
                    {inst.domain} · {inst.country} · Primary contact: {inst.applicantName} (
                    {inst.applicantEmail})
                  </p>
                  <p className="text-xs text-[#64748B] tabular-nums">
                    Onboarded {inst.submittedAt} · Active seats: {inst.activeUsers}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {inst.status === 'Approved' && (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => handleStatusChange(inst, 'Suspended')}
                    >
                      <PauseCircle className="h-3.5 w-3.5 inline mr-1" aria-hidden="true" />
                      Suspend tenant
                    </Button>
                  )}
                  {inst.status === 'Suspended' && (
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={() => handleStatusChange(inst, 'Approved')}
                    >
                      <PlayCircle className="h-3.5 w-3.5 inline mr-1" aria-hidden="true" />
                      Reactivate tenant
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 text-[#2563EB] shrink-0 mt-0.5" aria-hidden="true" />
        <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
          Multi-tenant boundary notice: Platform administrators govern institution onboarding, domain verification, and account standing. Private chapters, journals, and grading feedback remain strictly isolated inside each institution’s scope.
        </p>
      </div>
    </PortalLayout>
  );
}
