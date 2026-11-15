import { useState } from 'react';
import { Check, MailPlus, X } from 'lucide-react';
import StatusLabel from '../../../components/dashboard/StatusLabel';
import PortalLayout from '../../../components/layout/PortalLayout';
import Button from '../../../components/ui/Button';
import FormField from '../../../components/ui/FormField';
import StatusAlert from '../../../components/ui/StatusAlert';
import { useDemoAppState } from '../../../context/DemoAppStateContext';
import { useDemoSession } from '../../../context/DemoSessionContext';
import { getPortalNavItems } from '../../../utils/roleRouting';

export default function InstitutionApprovalsPage() {
  const { activeMembership } = useDemoSession();
  const { state, decideMembershipRequest, createSupervisorInvite } = useDemoAppState();

  const institutionName = activeMembership?.institutionName || 'University of Westbridge';
  const inst =
    state.institutionsState[institutionName] ||
    state.institutionsState['University of Westbridge'];

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteDept, setInviteDept] = useState(inst.departments[0]?.name || '');
  const [banner, setBanner] = useState('');

  const handleDecision = (req, decision) => {
    decideMembershipRequest(institutionName, req.id, decision);
    setBanner(`${req.name} (${req.role}) marked as ${decision}.`);
  };

  const handleCreateInvite = (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    const code = createSupervisorInvite(
      institutionName,
      inviteEmail.trim(),
      inviteDept || inst.departments[0]?.name
    );
    setInviteEmail('');
    setBanner(`Generated supervisor invitation code ${code} for ${inviteEmail.trim()}.`);
  };

  return (
    <PortalLayout navItems={getPortalNavItems('institution_admin')}>
      <div className="space-y-1">
        <p className="font-mono text-xs font-medium text-[#2563EB]">{inst.info.domain}</p>
        <h1 className="font-display text-2xl font-bold text-[#172554]">
          Membership Approvals &amp; Supervisor Invitations
        </h1>
        <p className="text-sm text-[#64748B]">
          Verify pending student and supervisor membership requests and issue faculty invitations.
        </p>
      </div>

      {banner && (
        <StatusAlert type="success" title="Action recorded">
          {banner}
        </StatusAlert>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <section className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
          <h2 className="font-display text-lg font-bold text-[#172554]">
            Membership Queue ({inst.membershipRequests.length})
          </h2>

          <div className="divide-y divide-slate-100">
            {inst.membershipRequests.map((req) => (
              <div key={req.id} className="py-4 first:pt-0 last:pb-0 space-y-3">
                <div className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-bold text-[#172554]">
                      {req.name} · <span className="text-[#2563EB]">{req.role}</span>
                    </p>
                    <p className="font-mono text-xs text-[#64748B] tabular-nums">
                      {req.identifier} · {req.email}
                    </p>
                    <p className="text-xs text-[#64748B] mt-0.5">
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
        </section>

        <section className="lg:col-span-5 space-y-5">
          <form
            onSubmit={handleCreateInvite}
            className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4"
          >
            <div className="flex items-center gap-2 text-[#172554]">
              <MailPlus className="h-4 w-4 text-[#2563EB]" aria-hidden="true" />
              <h2 className="font-display text-base font-bold">Invite Faculty Supervisor</h2>
            </div>

            <FormField
              id="inv-email"
              type="email"
              label="Faculty institutional email"
              placeholder={`lecturer@${inst.info.domain}`}
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
              Generate invitation code
            </Button>
          </form>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
            <h2 className="font-display text-base font-bold text-[#172554]">
              Issued Invitations ({inst.invitations.length})
            </h2>
            {inst.invitations.length === 0 ? (
              <p className="text-xs text-[#64748B]">No invitations issued yet.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {inst.invitations.map((inv) => (
                  <div key={inv.id} className="py-2.5 text-xs space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-[#2563EB]">{inv.code}</span>
                      <span className="text-[#64748B]">{inv.status}</span>
                    </div>
                    <p className="font-medium text-[#172554]">{inv.email}</p>
                    <p className="text-[#64748B]">{inv.department}</p>
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
