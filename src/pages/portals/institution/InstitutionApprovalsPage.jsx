import { useEffect, useMemo, useState } from 'react';
import { Check, MailPlus, Search, X } from 'lucide-react';
import StatusLabel from '../../../components/dashboard/StatusLabel';
import PortalLayout from '../../../components/layout/PortalLayout';
import Button from '../../../components/ui/Button';
import EmptyState from '../../../components/ui/EmptyState';
import FormField from '../../../components/ui/FormField';
import StatusAlert from '../../../components/ui/StatusAlert';
import {
  resolveInstitutionKey,
  resolveWorkspaceInstitution,
  useDemoAppState,
} from '../../../context/DemoAppStateContext';
import { useDemoSession } from '../../../context/DemoSessionContext';
import { getPortalNavItems } from '../../../utils/roleRouting';

const STATUS_TABS = ['All', 'Pending Approval', 'Approved', 'Rejected'];

export default function InstitutionApprovalsPage() {
  const { activeMembership, session } = useDemoSession();
  const { state, decideMembershipRequest, createSupervisorInvite } = useDemoAppState();

  const institutionName = resolveWorkspaceInstitution(activeMembership, session);
  const instKey = resolveInstitutionKey(state.institutionsState, institutionName);
  const inst = instKey ? state.institutionsState[instKey] : null;

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteDept, setInviteDept] = useState(inst?.departments?.[0]?.name || '');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [banner, setBanner] = useState('');

  useEffect(() => {
    if (inst?.departments?.[0]?.name) {
      setInviteDept((prev) => prev || inst.departments[0].name);
    }
  }, [instKey, inst?.departments]);

  const filteredQueue = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return (inst?.membershipRequests || []).filter((req) => {
      const matchesStatus = statusFilter === 'All' || req.status === statusFilter;
      const matchesQuery =
        !q ||
        req.name.toLowerCase().includes(q) ||
        req.identifier.toLowerCase().includes(q) ||
        req.department.toLowerCase().includes(q) ||
        req.email.toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [inst?.membershipRequests, statusFilter, searchQuery]);

  if (!inst) {
    return (
      <PortalLayout navItems={getPortalNavItems('institution_admin')}>
        <div className="spt-surface rounded-2xl p-6">
          <EmptyState
            title="Approvals queue unavailable"
            description="No institutional approvals workspace matches the active session."
          />
        </div>
      </PortalLayout>
    );
  }

  const handleDecision = (req, decision) => {
    decideMembershipRequest(instKey, req.id, decision);
    setBanner(`${req.name} (${req.role}) marked as ${decision}.`);
  };

  const handleCreateInvite = (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    const code = createSupervisorInvite(
      instKey,
      inviteEmail.trim(),
      inviteDept || inst.departments[0]?.name
    );
    setInviteEmail('');
    setBanner(`Generated demo supervisor invitation code ${code} for ${inviteEmail.trim()}.`);
  };

  return (
    <PortalLayout navItems={getPortalNavItems('institution_admin')}>
      <div className="space-y-1">
        <p className="font-mono text-xs font-medium text-[var(--accent-primary)]">{inst.info.domain}</p>
        <h1 className="font-display text-2xl font-bold text-[var(--text-primary)]">
          Membership Approvals &amp; Supervisor Invitations
        </h1>
        <p className="text-sm text-[var(--text-muted)]">
          Verify pending student and supervisor membership requests and issue demo faculty invitations for {inst.info.name}.
        </p>
      </div>

      {banner && (
        <StatusAlert type="success" title="Action recorded">
          {banner}
        </StatusAlert>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <section className="lg:col-span-7 spt-surface rounded-2xl p-5 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="font-display text-lg font-bold text-[var(--text-primary)]">
              Membership Queue ({filteredQueue.length})
            </h2>

            <div className="relative w-full sm:w-56">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-muted)]"
                aria-hidden="true"
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter applicant or ID..."
                aria-label="Filter membership queue"
                className="min-h-[38px] w-full rounded-lg border border-[var(--border-strong)] bg-[var(--bg-elevated)] pl-8 pr-3 text-base sm:text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-primary)] focus:outline-none"
              />
            </div>
          </div>

          <div
            role="tablist"
            aria-label="Filter membership requests by status"
            className="flex items-center gap-1 overflow-x-auto rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-1"
          >
            {STATUS_TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={statusFilter === tab}
                onClick={() => setStatusFilter(tab)}
                className={`min-h-[32px] rounded-md px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  statusFilter === tab
                    ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-xs'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {filteredQueue.length === 0 ? (
            <EmptyState
              title="No matching membership requests"
              description="Try clearing your search term or switching back to All requests."
              actionLabel="Show all requests"
              onAction={() => {
                setStatusFilter('All');
                setSearchQuery('');
              }}
            />
          ) : (
            <div className="divide-y divide-[var(--border-subtle)]">
              {filteredQueue.map((req) => (
                <div key={req.id} className="py-4 first:pt-0 last:pb-0 space-y-3">
                  <div className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-bold text-[var(--text-primary)]">
                        {req.name} ·{' '}
                        <span className="text-[var(--accent-primary)]">{req.role}</span>
                      </p>
                      <p className="font-mono text-xs text-[var(--text-muted)] tabular-nums">
                        {req.identifier} · {req.email}
                      </p>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">
                        {req.department} · Requested {req.requestedAt}
                      </p>
                    </div>
                    <StatusLabel status={req.status} />
                  </div>

                  {req.status === 'Pending Approval' && (
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={() => handleDecision(req, 'Approved')}
                      >
                        <Check className="h-3.5 w-3.5 inline mr-1" aria-hidden="true" />
                        Approve
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => handleDecision(req, 'Rejected')}
                      >
                        <X className="h-3.5 w-3.5 inline mr-1" aria-hidden="true" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="lg:col-span-5 space-y-5">
          <form
            onSubmit={handleCreateInvite}
            className="spt-surface rounded-2xl p-5 space-y-4"
          >
            <div className="flex items-center gap-2 text-[var(--text-primary)]">
              <MailPlus className="h-4 w-4 text-[var(--accent-primary)]" aria-hidden="true" />
              <h2 className="font-display text-base font-bold">Invite Faculty Supervisor</h2>
            </div>

            <FormField
              id="inv-email"
              type="email"
              label="Faculty institutional email"
              placeholder={`lecturer@${inst.info.domain}`}
              helperText="Generates a local demo invite token; live email delivery and onboarding verification are deferred to Stage D."
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              required
            />

            <FormField
              id="inv-dept"
              as="select"
              label="Target department"
              value={inviteDept}
              onChange={(e) => setInviteDept(e.target.value)}
              options={inst.departments.map((d) => d.name)}
            />

            <Button type="submit" variant="navy" size="md" fullWidth>
              Generate demo invitation code
            </Button>
          </form>

          <div className="spt-surface rounded-2xl p-5 space-y-3">
            <h2 className="font-display text-base font-bold text-[var(--text-primary)]">
              Issued Invitations ({inst.invitations.length})
            </h2>
            {inst.invitations.length === 0 ? (
              <p className="text-xs text-[var(--text-muted)]">No invitations issued yet.</p>
            ) : (
              <div className="divide-y divide-[var(--border-subtle)]">
                {inst.invitations.map((inv) => (
                  <div key={inv.id} className="py-2.5 text-xs space-y-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono font-bold text-[var(--accent-primary)]">{inv.code}</span>
                      <span className="text-[var(--text-muted)]">{inv.status}</span>
                    </div>
                    <p className="font-medium text-[var(--text-primary)]">{inv.email}</p>
                    <p className="text-[var(--text-muted)]">{inv.department}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </PortalLayout>
  );
}

