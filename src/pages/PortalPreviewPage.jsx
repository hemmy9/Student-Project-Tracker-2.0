import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Building2, CheckCircle2, Layers, ShieldAlert } from 'lucide-react';
import PortalLayout from '../components/layout/PortalLayout';
import StatusAlert from '../components/ui/StatusAlert';
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
    'Institution profile, departments, programmes, and academic session manager',
    'Pending student & supervisor membership approval queue',
    'Supervisor invitation generator and student project assignment matrix',
  ],
  platform_admin: [
    'Registered institutions directory and pending institution application queue',
    'Approve/reject institutional onboarding applications with audit logging',
    'Platform administrator roster and platform-wide governance settings',
  ],
};

export default function PortalPreviewPage() {
  const { session, activeMembership, switchMembership } = useDemoSession();
  const navigate = useNavigate();

  if (!session || !activeMembership) {
    return null;
  }

  const roadmapItems = NEXT_STAGE_ITEMS[activeMembership.roleKey] || [];
  const dashboardPath = getDashboardPathForRole(activeMembership.roleKey);

  return (
    <PortalLayout navItems={getPortalNavItems(activeMembership.roleKey)}>
      <StatusAlert
        type="info"
        title="Demo Preview Session (Not Real Database Authentication)"
      >
        <div className="flex items-start gap-2">
          <ShieldAlert className="h-4 w-4 mt-0.5 shrink-0 text-[#2563EB] hidden sm:block" aria-hidden="true" />
          <span>
            You are inspecting your workspace scope and multi-institution memberships using local demonstration credentials. Real Supabase Authentication and Row Level Security will replace this in Stage 4.
          </span>
        </div>
      </StatusAlert>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <section className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 space-y-5">
          <div className="space-y-1.5 border-b border-slate-100 pb-4">
            <p className="font-mono text-xs font-medium text-[#2563EB]">
              ACTIVE WORKSPACE CONTEXT
            </p>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#172554]">
              {activeMembership.roleLabel} Scope
            </h1>
            <p className="text-sm text-[#64748B]">
              Signed in as <strong className="text-[#172554]">{session.fullName}</strong> ({session.email})
            </p>
          </div>

          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-[#F8FAFC] p-4 space-y-1">
              <dt className="text-xs text-[#64748B]">Tenant / Scope</dt>
              <dd className="flex items-center gap-2 text-sm font-semibold text-[#172554]">
                <Building2 className="h-4 w-4 text-[#2563EB] shrink-0" aria-hidden="true" />
                <span>{activeMembership.institutionName}</span>
              </dd>
            </div>
            <div className="rounded-xl border border-slate-200 bg-[#F8FAFC] p-4 space-y-1">
              <dt className="text-xs text-[#64748B]">Assigned Role &amp; Status</dt>
              <dd className="text-sm font-semibold text-[#172554]">
                {activeMembership.roleLabel} · {activeMembership.status}
              </dd>
            </div>
            <div className="sm:col-span-2 rounded-xl border border-slate-200 bg-[#F8FAFC] p-4 space-y-1">
              <dt className="text-xs text-[#64748B]">Academic / Operational Placement</dt>
              <dd className="text-sm font-medium text-[#172554]">
                {activeMembership.scopeLabel}
              </dd>
            </div>
          </dl>

          <div className="space-y-3 pt-2">
            <h2 className="font-display text-base font-bold text-[#172554]">
              Available in this portal:
            </h2>
            <ul className="space-y-2.5">
              {roadmapItems.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-sm text-[#64748B]">
                  <CheckCircle2
                    className="h-4 w-4 mt-0.5 shrink-0 text-[#2563EB]"
                    aria-hidden="true"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-2">
            <Link
              to={dashboardPath}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1D4ED8] transition-colors"
            >
              <span>Open {activeMembership.roleLabel} Dashboard</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </section>

        <aside className="lg:col-span-5 space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2 text-[#172554]">
              <Layers className="h-4 w-4 text-[#2563EB]" aria-hidden="true" />
              <h2 className="font-display text-base font-bold">
                Approved Institutional Memberships ({session.memberships.length})
              </h2>
            </div>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Multi-institution architecture allows one account to hold distinct approved roles across separate universities without mixing tenant data.
            </p>

            <div className="space-y-2">
              {session.memberships.map((mem) => {
                const isActive = mem.id === activeMembership.id;
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
                        ? 'border-[#2563EB] bg-blue-50/70'
                        : 'border-slate-200 bg-[#F8FAFC] hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-bold text-[#172554]">{mem.roleLabel}</span>
                      <span className="text-xs font-medium text-[#2563EB]">
                        {isActive ? 'Active' : 'Open dashboard'}
                      </span>
                    </div>
                    <p className="text-xs text-[#64748B] mt-0.5">{mem.institutionName}</p>
                  </button>
                );
              })}
            </div>

            <div className="border-t border-slate-100 pt-3 flex flex-col gap-2">
              <Link
                to="/login"
                className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-[#172554] hover:bg-slate-50"
              >
                Test another role account
              </Link>
              <Link
                to="/"
                className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-[#172554] px-4 text-sm font-semibold text-white hover:bg-[#0F172A]"
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
