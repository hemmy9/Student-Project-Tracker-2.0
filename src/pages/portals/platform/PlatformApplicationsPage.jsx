import { useMemo, useState } from 'react';
import { Check, Globe, ShieldAlert, X } from 'lucide-react';
import StatusLabel from '../../../components/dashboard/StatusLabel';
import PortalLayout from '../../../components/layout/PortalLayout';
import Button from '../../../components/ui/Button';
import EmptyState from '../../../components/ui/EmptyState';
import StatusAlert from '../../../components/ui/StatusAlert';
import { useDemoAppState } from '../../../context/DemoAppStateContext';
import { useDemoSession } from '../../../context/DemoSessionContext';
import { getPortalNavItems } from '../../../utils/roleRouting';

const QUEUE_FILTERS = ['Pending Review', 'Approved', 'Rejected', 'All'];

export default function PlatformApplicationsPage() {
  const { session } = useDemoSession();
  const { state, decideInstitutionApplication } = useDemoAppState();
  const [filter, setFilter] = useState('Pending Review');
  const [notice, setNotice] = useState('');

  const applications = state.platformState.institutions;

  const filteredApps = useMemo(() => {
    if (filter === 'All') return applications;
    return applications.filter((a) => a.status === filter);
  }, [applications, filter]);

  const pendingCount = applications.filter((a) => a.status === 'Pending Review').length;

  const handleDecision = (app, decision) => {
    decideInstitutionApplication(app.id, decision, session?.fullName);
    setNotice(
      `${app.institutionName} (${app.domain}) was marked ${decision} and recorded in the platform audit log.`
    );
  };

  return (
    <PortalLayout navItems={getPortalNavItems('platform_admin')}>
      <div className="space-y-1">
        <p className="font-mono text-xs font-medium text-[#2563EB]">
          ONBOARDING VERIFICATION · {pendingCount} PENDING
        </p>
        <h1 className="font-display text-2xl font-bold text-[#172554]">
          Institution Applications Queue
        </h1>
        <p className="text-sm text-[#64748B]">
          Verify official academic domains and institutional contacts before approving new tenants onto Student Project Tracker.
        </p>
      </div>

      {notice && (
        <StatusAlert type="success" title="Application decision logged">
          {notice}
        </StatusAlert>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-display text-lg font-bold text-[#172554]">
            Registration Applications ({filteredApps.length})
          </h2>

          <div
            role="tablist"
            aria-label="Filter institution applications"
            className="flex items-center gap-1 overflow-x-auto rounded-lg border border-slate-200 bg-slate-100 p-1"
          >
            {QUEUE_FILTERS.map((tab) => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={filter === tab}
                onClick={() => setFilter(tab)}
                className={`min-h-[36px] rounded-md px-3 py-1.5 text-xs font-medium whitespace-nowrap cursor-pointer ${
                  filter === tab
                    ? 'bg-white text-[#172554] shadow-xs'
                    : 'text-[#64748B] hover:text-[#172554]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {filteredApps.length === 0 ? (
          <EmptyState
            icon={ShieldAlert}
            title={`No applications marked "${filter}"`}
            description="Switch to All to review previously processed institution applications."
            actionLabel="View all applications"
            onAction={() => setFilter('All')}
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredApps.map((app) => {
              const domainMatchesEmail = app.applicantEmail
                .toLowerCase()
                .endsWith(`@${app.domain.toLowerCase()}`);

              return (
                <article key={app.id} className="py-4 first:pt-0 last:pb-0 space-y-3">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-display text-base font-bold text-[#172554]">
                          {app.institutionName}
                        </h3>
                        <StatusLabel status={app.status} />
                      </div>
                      <p className="flex items-center gap-1.5 font-mono text-xs text-[#64748B]">
                        <Globe className="h-3.5 w-3.5 text-[#2563EB]" aria-hidden="true" />
                        <span>
                          {app.domain} · {app.country}
                        </span>
                      </p>
                      <p className="text-xs text-[#64748B] tabular-nums">
                        Primary Applicant: <strong className="text-[#172554]">{app.applicantName}</strong> ({app.applicantEmail}) · Submitted {app.submittedAt}
                      </p>
                      <p
                        className={`text-xs font-medium ${
                          domainMatchesEmail ? 'text-emerald-700' : 'text-amber-700'
                        }`}
                      >
                        {domainMatchesEmail
                          ? 'Domain check: Applicant email matches official domain.'
                          : 'Domain check: Applicant email uses an external domain — manual verification advised.'}
                      </p>
                    </div>

                    {app.status === 'Pending Review' && (
                      <div className="flex flex-wrap gap-2 shrink-0 pt-1 sm:pt-0">
                        <Button
                          type="button"
                          variant="primary"
                          size="sm"
                          onClick={() => handleDecision(app, 'Approved')}
                        >
                          <Check className="h-3.5 w-3.5 inline mr-1" aria-hidden="true" />
                          Approve institution
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => handleDecision(app, 'Rejected')}
                        >
                          <X className="h-3.5 w-3.5 inline mr-1" aria-hidden="true" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </PortalLayout>
  );
}
