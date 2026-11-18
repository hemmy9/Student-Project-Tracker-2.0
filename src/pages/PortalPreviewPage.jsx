import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Building2, CheckCircle2, Layers, LogOut, ShieldAlert } from 'lucide-react';
import PortalLayout from '../components/layout/PortalLayout';
import StatusAlert from '../components/ui/StatusAlert';
import { GRACE_POLYTECHNIC_BRAND } from '../config/gracePolytechnic';
import {
  canonicalizeInstitutionName,
  resolveWorkspaceInstitution,
} from '../context/DemoAppStateContext';
import { useDemoSession } from '../context/DemoSessionContext';
import { getDashboardPathForRole, getPortalNavItems } from '../utils/roleRouting';

const NEXT_STAGE_ITEMS = {
  student: [
    'Personalised project overview, milestone progress bar, and task checklist',
    'Weekly progress journal editor and chapter document submission form',
    'Supervisor feedback threads, revision status, and printable progress report',
  ],
  supervisor: [
    'Assigned students roster with overdue milestone and inactivity alerts',
    'Document submission review queue (approve or request revisions)',
    'Weekly journal review feed and student communication workspace',
  ],
  institution_admin: [
    'Grace Polytechnic school, department, programme, and academic session structure',
    'Pending student & supervisor membership approval queue',
    'Supervisor assignment matrix and printable institutional cohort reports',
  ],
};

export default function PortalPreviewPage() {
  const { session, activeMembership, switchMembership, signOutDemo } = useDemoSession();
  const navigate = useNavigate();

  if (!session || !activeMembership) {
    return null;
  }

  const isRetiredPlatformAdmin = activeMembership.roleKey === 'platform_admin';
  const roadmapItems = NEXT_STAGE_ITEMS[activeMembership.roleKey] || [];
  const dashboardPath = getDashboardPathForRole(activeMembership.roleKey);
  const portalMemberships = session.memberships.filter((m) => m.roleKey !== 'platform_admin');
  const displayInstitution = isRetiredPlatformAdmin
    ? activeMembership.institutionName
    : resolveWorkspaceInstitution(activeMembership, session) || activeMembership.institutionName;

  const handleSignOut = async () => {
    await signOutDemo();
    navigate('/login');
  };

  return (
    <PortalLayout navItems={getPortalNavItems(activeMembership.roleKey)}>
      <StatusAlert
        type="info"
        title="Demo Preview Session (Not Real Database Authentication)"
      >
        <div className="flex items-start gap-2">
          <ShieldAlert
            className="h-4 w-4 mt-0.5 shrink-0 text-[var(--accent-primary)] hidden sm:block"
            aria-hidden="true"
          />
          <span>
            You are inspecting your {GRACE_POLYTECHNIC_BRAND.institutionName} workspace scope and portal memberships using local demonstration credentials.
          </span>
        </div>
      </StatusAlert>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <section className="lg:col-span-7 spt-surface rounded-2xl p-5 sm:p-7 space-y-5">
          <div className="space-y-1.5 border-b border-[var(--border-subtle)] pb-4">
            <p className="font-mono text-xs font-medium text-[var(--accent-primary)]">
              ACTIVE WORKSPACE CONTEXT
            </p>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
              {activeMembership.roleLabel} Scope
            </h1>
            <p className="text-sm text-[var(--text-secondary)]">
              Signed in as <strong className="text-[var(--text-primary)]">{session.fullName}</strong> ({session.email})
            </p>
          </div>

          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4 space-y-1">
              <dt className="text-xs text-[var(--text-muted)]">Tenant / Scope</dt>
              <dd className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
                <Building2 className="h-4 w-4 text-[var(--accent-primary)] shrink-0" aria-hidden="true" />
                <span>{displayInstitution}</span>
              </dd>
            </div>
            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4 space-y-1">
              <dt className="text-xs text-[var(--text-muted)]">Assigned Role &amp; Status</dt>
              <dd className="text-sm font-semibold text-[var(--text-primary)]">
                {activeMembership.roleLabel} · {activeMembership.status}
              </dd>
            </div>
            <div className="sm:col-span-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4 space-y-1">
              <dt className="text-xs text-[var(--text-muted)]">Academic / Operational Placement</dt>
              <dd className="text-sm font-medium text-[var(--text-primary)]">
                {activeMembership.scopeLabel}
              </dd>
            </div>
          </dl>

          {isRetiredPlatformAdmin ? (
            <StatusAlert
              type="warning"
              title="Platform Administrator portal retired for Grace Polytechnic"
            >
              Platform Dashboard, Institutions Registry, Applications Queue, and Platform Governance
              are retired in the Grace Polytechnic single-institution deployment. Sign out to return
              to the three-portal gateway, or switch to an approved institutional role if assigned.
            </StatusAlert>
          ) : (
            <div className="space-y-3 pt-2">
              <h2 className="font-display text-base font-bold text-[var(--text-primary)]">
                Available in this portal:
              </h2>
              <ul className="space-y-2.5">
                {roadmapItems.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-sm text-[var(--text-secondary)]">
                    <CheckCircle2
                      className="h-4 w-4 mt-0.5 shrink-0 text-[var(--accent-primary)]"
                      aria-hidden="true"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="pt-2">
            {isRetiredPlatformAdmin ? (
              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-[var(--accent-primary)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--accent-primary-hover)] transition-colors cursor-pointer"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                <span>Sign Out to Portal Gateway</span>
              </button>
            ) : (
              <Link
                to={dashboardPath}
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-[var(--accent-primary)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--accent-primary-hover)] transition-colors"
              >
                <span>Open {activeMembership.roleLabel} Dashboard</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            )}
          </div>
        </section>

        <aside className="lg:col-span-5 space-y-5">
          <div className="spt-surface rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2 text-[var(--text-primary)]">
              <Layers className="h-4 w-4 text-[var(--accent-primary)]" aria-hidden="true" />
              <h2 className="font-display text-base font-bold">
                Approved Portal Memberships ({portalMemberships.length})
              </h2>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Approved role assignments determine access across the Student, Supervisor, and
              Institution Administrator portals.
            </p>

            <div className="space-y-2">
              {portalMemberships.length === 0 ? (
                <p className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-3.5 text-xs text-[var(--text-secondary)]">
                  No active Student, Supervisor, or Institution Administrator memberships are
                  assigned to this session.
                </p>
              ) : (
                portalMemberships.map((mem) => {
                  const isActive = mem.id === activeMembership.id;
                  const memInstitution =
                    canonicalizeInstitutionName(mem.institutionName) || mem.institutionName;
                  return (
                    <button
                      key={mem.id}
                      type="button"
                      onClick={() => {
                        switchMembership(mem.id);
                        navigate(getDashboardPathForRole(mem.roleKey));
                      }}
                      className={`w-full min-h-[48px] rounded-xl border p-3.5 text-left transition-colors cursor-pointer ${
                        isActive
                          ? 'border-[var(--accent-primary)] bg-blue-500/10'
                          : 'border-[var(--border-subtle)] bg-[var(--bg-elevated)] hover:bg-[var(--bg-subtle)]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-bold text-[var(--text-primary)]">
                          {mem.roleLabel}
                        </span>
                        <span className="text-xs font-medium text-[var(--accent-primary)]">
                          {isActive ? 'Active' : 'Open dashboard'}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                        {memInstitution}
                      </p>
                    </button>
                  );
                })
              )}
            </div>

            <div className="border-t border-[var(--border-subtle)] pt-3 flex flex-col gap-2">
              <Link
                to="/login"
                className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-4 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
              >
                Test another role account
              </Link>
              <Link
                to="/"
                className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-[#0F2A56] px-4 text-sm font-semibold text-white hover:bg-[#17366B] transition-colors"
              >
                Back to public homepage
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </PortalLayout>
  );
}

