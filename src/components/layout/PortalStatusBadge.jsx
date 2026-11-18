import { useDemoSession } from '../../context/DemoSessionContext';

const ROLE_META = {
  student: {
    label: 'Student Portal',
    dotStyle: 'var(--accent-student)',
    textClass: 'text-[#2563EB] dark:text-[#60A5FA]',
  },
  supervisor: {
    label: 'Supervisor Portal',
    dotStyle: 'var(--accent-supervisor)',
    textClass: 'text-teal-700 dark:text-teal-400',
  },
  institution_admin: {
    label: 'Institution Admin',
    dotStyle: 'var(--accent-admin)',
    textClass: 'text-indigo-700 dark:text-violet-400',
  },
  platform_admin: {
    label: 'Retired Portal Scope',
    dotStyle: '#f59e0b',
    textClass: 'text-amber-700 dark:text-amber-400',
  },
};

function resolveMembershipStanding(rawStatus) {
  const trimmed = typeof rawStatus === 'string' ? rawStatus.trim() : '';
  const normalized = trimmed.toLowerCase();

  if (normalized === 'approved') {
    return {
      label: 'Approved',
      textClass: 'text-emerald-700 dark:text-emerald-400',
    };
  }
  if (normalized === 'pending_approval' || normalized === 'pending') {
    return {
      label: 'Pending Approval',
      textClass: 'text-amber-700 dark:text-amber-400',
    };
  }
  if (normalized === 'rejected' || normalized === 'suspended') {
    return {
      label: trimmed || 'Restricted',
      textClass: 'text-red-700 dark:text-red-400',
    };
  }
  return {
    label: trimmed || 'Status Unknown',
    textClass: 'text-[var(--text-muted)]',
  };
}

export default function PortalStatusBadge({ compact = false, className = '' }) {
  const { session, activeMembership, isLiveSupabase } = useDemoSession();

  if (!session || !activeMembership) return null;

  const roleKey = activeMembership.roleKey;
  const roleMeta = ROLE_META[roleKey] || {
    label: 'Workspace Scope',
    dotStyle: '#64748b',
    textClass: 'text-[var(--text-secondary)]',
  };
  const standing = resolveMembershipStanding(activeMembership.status);
  const isGenuineLiveSession = Boolean(isLiveSupabase && session.isDemoPreview === false);
  const workspaceModeLabel = isGenuineLiveSession ? 'Live Session' : 'Demo Workspace';

  return (
    <div
      aria-label={`Portal status: ${roleMeta.label}, ${standing.label}, ${workspaceModeLabel}`}
      className={`inline-flex items-center gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-2.5 py-1 text-xs min-w-0 max-w-full ${className}`}
    >
      <span
        className="h-2 w-2 rounded-full shrink-0"
        style={{ backgroundColor: roleMeta.dotStyle }}
        aria-hidden="true"
      />
      <span className={`font-semibold whitespace-nowrap ${roleMeta.textClass}`}>
        {roleMeta.label}
      </span>

      <span className="text-[var(--border-strong)]" aria-hidden="true">
        ·
      </span>

      <span className={`font-medium whitespace-nowrap ${standing.textClass}`}>
        {standing.label}
      </span>

      {!compact && (
        <>
          <span className="text-[var(--border-strong)]" aria-hidden="true">
            ·
          </span>
          <span className="font-mono text-[11px] text-[var(--text-muted)] whitespace-nowrap">
            {workspaceModeLabel}
          </span>
        </>
      )}

      {compact && (
        <span className="hidden xl:inline-flex items-center gap-2">
          <span className="text-[var(--border-strong)]" aria-hidden="true">
            ·
          </span>
          <span className="font-mono text-[11px] text-[var(--text-muted)] whitespace-nowrap">
            {workspaceModeLabel}
          </span>
        </span>
      )}
    </div>
  );
}
