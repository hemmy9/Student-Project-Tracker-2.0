import { useState } from 'react';
import { Download, History, Settings, ShieldPlus } from 'lucide-react';
import StatusLabel from '../../../components/dashboard/StatusLabel';
import PortalLayout from '../../../components/layout/PortalLayout';
import Button from '../../../components/ui/Button';
import FormField from '../../../components/ui/FormField';
import StatusAlert from '../../../components/ui/StatusAlert';
import { useDemoAppState } from '../../../context/DemoAppStateContext';
import { useDemoSession } from '../../../context/DemoSessionContext';
import { downloadCsv, downloadJsonReport } from '../../../utils/csvExport';
import { getPortalNavItems } from '../../../utils/roleRouting';

export default function PlatformGovernancePage() {
  const { session } = useDemoSession();
  const { state, addPlatformAdmin, updatePlatformSettings } = useDemoAppState();
  const { platformAdmins, settings, auditLogs } = state.platformState;

  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [requireDomainVerification, setRequireDomainVerification] = useState(
    settings.requireDomainVerification
  );
  const [allowOpenApplications, setAllowOpenApplications] = useState(
    settings.allowOpenInstitutionApplications
  );
  const [maxUploadSizeMb, setMaxUploadSizeMb] = useState(String(settings.maxUploadSizeMb));
  const [retentionDays, setRetentionDays] = useState(
    String(settings.defaultSessionRetentionDays)
  );
  const [notice, setNotice] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleAddAdmin = (e) => {
    e.preventDefault();
    const trimmedName = adminName.trim();
    const trimmedEmail = adminEmail.trim().toLowerCase();
    if (!trimmedName || !trimmedEmail.includes('@')) {
      setErrorMsg('Enter a valid full name and official platform administrator email address.');
      return;
    }
    if (platformAdmins.some((pa) => pa.email.toLowerCase() === trimmedEmail)) {
      setErrorMsg('This email already holds platform administrator privileges.');
      return;
    }
    addPlatformAdmin(trimmedName, trimmedEmail, session?.fullName);
    setAdminName('');
    setAdminEmail('');
    setErrorMsg('');
    setNotice(
      `Provisioned platform administrator preview entry for ${trimmedName}. In Stage 4, this executes exclusively through a privileged server-side workflow.`
    );
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    const uploadNum = Math.max(5, Math.min(100, Number(maxUploadSizeMb) || 25));
    const retentionNum = Math.max(7, Math.min(365, Number(retentionDays) || 30));
    updatePlatformSettings(
      {
        requireDomainVerification,
        allowOpenInstitutionApplications: allowOpenApplications,
        maxUploadSizeMb: uploadNum,
        defaultSessionRetentionDays: retentionNum,
      },
      session?.fullName
    );
    setErrorMsg('');
    setNotice('Platform governance settings updated and recorded in audit trail.');
  };

  const handleExportAuditCsv = () => {
    downloadCsv(
      'platform_audit_logs.csv',
      ['Timestamp', 'Actor', 'Action', 'Target'],
      auditLogs.map((l) => [l.timestamp, l.actor, l.action, l.target])
    );
  };

  const handleExportGovernanceJson = () => {
    downloadJsonReport('platform_governance_snapshot.json', {
      exportedAt: new Date().toISOString(),
      institutionsCount: state.platformState.institutions.length,
      platformAdmins,
      settings,
      auditLogs,
    });
  };

  return (
    <PortalLayout navItems={getPortalNavItems('platform_admin')}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <p className="font-mono text-xs font-medium text-[#2563EB]">
            TRUSTED GOVERNANCE · AUDIT &amp; CONFIGURATION
          </p>
          <h1 className="font-display text-2xl font-bold text-[#172554]">
            Platform Governance, Admins &amp; Audit Trail
          </h1>
          <p className="text-sm text-[#64748B]">
            Manage trusted platform administrators, enforce global onboarding policies, and export governance reports.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={handleExportAuditCsv}>
            <Download className="h-4 w-4 inline mr-1.5" aria-hidden="true" />
            Export Audit CSV
          </Button>
          <Button type="button" variant="navy" size="sm" onClick={handleExportGovernanceJson}>
            <Download className="h-4 w-4 inline mr-1.5" aria-hidden="true" />
            Export JSON
          </Button>
        </div>
      </div>

      {notice && (
        <StatusAlert type="success" title="Governance update recorded">
          {notice}
        </StatusAlert>
      )}
      {errorMsg && (
        <StatusAlert type="error" title="Validation error">
          {errorMsg}
        </StatusAlert>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Trusted Platform Administrators */}
        <section className="lg:col-span-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-5">
          <div className="flex items-center gap-2 text-[#172554]">
            <ShieldPlus className="h-5 w-5 text-[#2563EB]" aria-hidden="true" />
            <h2 className="font-display text-lg font-bold">
              Trusted Platform Administrators ({platformAdmins.length})
            </h2>
          </div>

          <div className="divide-y divide-slate-100">
            {platformAdmins.map((admin) => (
              <div key={admin.id} className="py-3 first:pt-0 flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-[#172554]">{admin.name}</p>
                  <p className="font-mono text-xs text-[#64748B] tabular-nums">
                    {admin.email} · Added {admin.addedAt}
                  </p>
                </div>
                <StatusLabel status={admin.status} />
              </div>
            ))}
          </div>

          <form onSubmit={handleAddAdmin} className="border-t border-slate-200 pt-4 space-y-3">
            <h3 className="text-sm font-bold text-[#172554]">
              Authorize Additional Platform Administrator
            </h3>
            <p className="text-xs text-[#64748B]">
              Platform administrator privileges are strictly separate from institutional roles and can only be granted by an existing platform administrator.
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FormField
                id="pa-name"
                label="Full name"
                placeholder="e.g. Dr. Musa Ibrahim"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                required
              />
              <FormField
                id="pa-email"
                type="email"
                label="Verified email"
                placeholder="name@projecttracker.app"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" variant="navy" size="md">
              Grant platform admin access
            </Button>
          </form>
        </section>

        {/* Global Platform Settings */}
        <section className="lg:col-span-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-5">
          <div className="flex items-center gap-2 text-[#172554]">
            <Settings className="h-5 w-5 text-[#2563EB]" aria-hidden="true" />
            <h2 className="font-display text-lg font-bold">Platform Policy Settings</h2>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <label className="flex min-h-[44px] items-start gap-3 rounded-xl border border-slate-200 bg-[#F8FAFC] p-3.5 cursor-pointer">
              <input
                type="checkbox"
                checked={requireDomainVerification}
                onChange={(e) => setRequireDomainVerification(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#2563EB]"
              />
              <div>
                <p className="text-sm font-semibold text-[#172554]">
                  Require academic domain verification
                </p>
                <p className="text-xs text-[#64748B]">
                  Flag institution applications whose primary applicant email differs from the submitted domain.
                </p>
              </div>
            </label>

            <label className="flex min-h-[44px] items-start gap-3 rounded-xl border border-slate-200 bg-[#F8FAFC] p-3.5 cursor-pointer">
              <input
                type="checkbox"
                checked={allowOpenApplications}
                onChange={(e) => setAllowOpenApplications(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#2563EB]"
              />
              <div>
                <p className="text-sm font-semibold text-[#172554]">
                  Keep open institution registration active
                </p>
                <p className="text-xs text-[#64748B]">
                  Allow universities and polytechnics to submit onboarding applications from the public registration hub.
                </p>
              </div>
            </label>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                id="set-upload"
                type="number"
                label="Max chapter upload size (MB)"
                value={maxUploadSizeMb}
                onChange={(e) => setMaxUploadSizeMb(e.target.value)}
                required
              />
              <FormField
                id="set-retention"
                type="number"
                label="Audit log retention window (days)"
                value={retentionDays}
                onChange={(e) => setRetentionDays(e.target.value)}
                required
              />
            </div>

            <Button type="submit" variant="primary" size="md">
              Save platform settings
            </Button>
          </form>
        </section>
      </div>

      {/* Platform-Wide Audit Trail */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2 text-[#172554]">
          <History className="h-5 w-5 text-[#2563EB]" aria-hidden="true" />
          <h2 className="font-display text-lg font-bold">
            Platform Governance Audit Trail ({auditLogs.length})
          </h2>
        </div>

        <div className="divide-y divide-slate-100">
          {auditLogs.map((log) => (
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
    </PortalLayout>
  );
}
