import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  FileCheck2,
  FolderKanban,
  GraduationCap,
  LockKeyhole,
  Shield,
  UserCheck,
} from 'lucide-react';
import FeaturesSection from '../components/home/FeaturesSection';
import HeroSection from '../components/home/HeroSection';
import PublicHeader from '../components/layout/PublicHeader';
import PublicFooter from '../components/layout/PublicFooter';
import ImageWithFallback from '../components/ui/ImageWithFallback';

const PORTAL_DETAILS = {
  student: {
    id: 'student',
    label: 'Student Portal',
    shortLabel: 'Student',
    icon: GraduationCap,
    audience: 'Undergraduate, Master’s & Doctoral Candidates',
    summary:
      'Keep every milestone, weekly progress journal, chapter upload, and supervisor revision request in a single structured workspace.',
    capabilities: [
      'Track assigned project milestones, task checklists, and target completion dates',
      'Submit weekly progress journals and chapter drafts directly to assigned supervisors',
      'Respond to revision feedback while preserving complete submission version history',
      'Generate and print formatted academic progress reports for department reviews',
    ],
    accessRule: 'Requires approved institutional membership before accessing project workspaces.',
  },
  supervisor: {
    id: 'supervisor',
    label: 'Supervisor Portal',
    shortLabel: 'Supervisor',
    icon: UserCheck,
    audience: 'Faculty Advisors, Thesis Supervisors & Co-Supervisors',
    summary:
      'Monitor student cohorts at a glance, spot stalled projects early, and deliver structured document reviews without losing feedback in email threads.',
    capabilities: [
      'View all assigned students, current milestone completion, and missed check-ins',
      'Review submitted documents and approve chapters or request targeted revisions',
      'Read weekly journals and respond with timestamped guidance and action items',
      'Identify students requiring attention based on overdue tasks or inactive journals',
    ],
    accessRule: 'Granted only via institution administrator approval or a verified faculty invitation.',
  },
  institution_admin: {
    id: 'institution_admin',
    label: 'Institution Admin',
    shortLabel: 'Institution',
    icon: Building2,
    audience: 'Department Heads, Coordinators & Academic Registrars',
    summary:
      'Operate an isolated institutional workspace with full control over departments, academic sessions, membership approvals, and project assignments.',
    capabilities: [
      'Configure departments, degree programmes, and active academic sessions',
      'Verify and approve pending student and supervisor membership requests',
      'Invite faculty supervisors and assign them to student academic projects',
      'Monitor institution-wide completion rates and export cohort progress reports',
    ],
    accessRule: 'Strictly scoped to a single institution; cannot access other institutions’ records.',
  },
  platform_admin: {
    id: 'platform_admin',
    label: 'Platform Admin',
    shortLabel: 'Platform',
    icon: Shield,
    audience: 'Platform Governance & Verification Operators',
    summary:
      'Review incoming university applications, enforce platform-wide trust standards, and audit privileged administrative actions across tenants.',
    capabilities: [
      'Review and approve or reject new institution registration applications',
      'Manage registered institutional account statuses and operational compliance',
      'Manage platform administrator privileges through a strict, auditable workflow',
      'Monitor platform-wide activity summaries and critical governance events',
    ],
    accessRule: 'Completely separated from institutional roles; never assigned during public signup.',
  },
};

const PORTAL_KEYS = ['student', 'supervisor', 'institution_admin', 'platform_admin'];

export default function HomePage() {
  const [activePortal, setActivePortal] = useState('student');
  const currentPortal = PORTAL_DETAILS[activePortal];
  const PortalIcon = currentPortal.icon;

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#172554]">
      <PublicHeader />

      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />

        {/* Four Portals Interactive Architecture Section */}
        <section id="portals" className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-18 lg:px-8">
          <div className="max-w-2xl space-y-3 mb-8">
            <p className="text-xs font-semibold tracking-wide text-[#2563EB]">
              Four Functional Portals
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#172554] text-balance">
              One platform, four role-specific workflows.
            </h2>
            <p className="text-sm sm:text-base text-[#64748B] leading-relaxed">
              A single user account can hold different approved roles across institutions—for example, supervising at one university while administrating another—with strict separation of duties.
            </p>
          </div>

          {/* Interactive Segmented Control (2x2 on mobile, 4-col on sm+) */}
          <div
            role="tablist"
            aria-label="Select portal preview"
            className="grid grid-cols-2 gap-1.5 rounded-xl border border-slate-200 bg-slate-100 p-1.5 sm:inline-grid sm:grid-cols-4 mb-6 w-full sm:w-auto"
          >
            {PORTAL_KEYS.map((key) => {
              const item = PORTAL_DETAILS[key];
              const isActive = activePortal === key;
              return (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActivePortal(key)}
                  className={`min-h-[44px] rounded-lg px-3.5 py-2 text-xs sm:text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-[#172554] text-white shadow-xs'
                      : 'text-[#64748B] hover:text-[#172554] hover:bg-white/60'
                  }`}
                >
                  <span className="sm:hidden">{item.shortLabel}</span>
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 gap-8 rounded-2xl border border-slate-200 bg-white p-5 sm:p-8 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7 space-y-5">
              <div className="space-y-2">
                <div className="flex items-center gap-2.5 text-[#2563EB]">
                  <PortalIcon className="h-5 w-5 shrink-0" aria-hidden="true" />
                  <span className="text-xs font-semibold">{currentPortal.audience}</span>
                </div>
                <h3 className="font-display text-xl sm:text-2xl font-bold text-[#172554]">
                  {currentPortal.label}
                </h3>
                <p className="text-sm sm:text-base text-[#64748B] leading-relaxed">
                  {currentPortal.summary}
                </p>
              </div>

              <ul className="space-y-3 border-t border-slate-100 pt-4">
                {currentPortal.capabilities.map((capability, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-[#172554]">
                    <CheckCircle2
                      className="h-4 w-4 mt-0.5 shrink-0 text-[#2563EB]"
                      aria-hidden="true"
                    />
                    <span className="leading-relaxed">{capability}</span>
                  </li>
                ))}
              </ul>

              <div className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-[#F8FAFC] p-3.5 text-xs text-[#64748B]">
                <LockKeyhole className="h-4 w-4 mt-0.5 shrink-0 text-[#172554]" aria-hidden="true" />
                <span>
                  <strong className="font-semibold text-[#172554]">Access Control: </strong>
                  {currentPortal.accessRule}
                </span>
              </div>
            </div>

            <div className="lg:col-span-5">
              <ImageWithFallback
                src="/src/assets/images/supervisor_review_desk_1794715034493.jpg"
                alt="Academic supervisor desk with thesis manuscript pages, laptop review screen, and annotated tablet"
                caption="Structured academic review workflow designed for clarity on both mobile and desktop screens."
              />
            </div>
          </div>
        </section>

        {/* Multi-Institution & Approval Workflow Section */}
        <section id="workflows" className="border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-18 lg:px-8">
            <div className="max-w-2xl space-y-3 mb-10">
              <p className="text-xs font-semibold tracking-wide text-[#2563EB]">
                Registration &amp; Approval Workflows
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#172554] text-balance">
                Authorised onboarding from institution verification to project submission.
              </h2>
              <p className="text-sm sm:text-base text-[#64748B] leading-relaxed">
                Every membership and administrative role follows a verified approval chain so institutions maintain complete control over academic data.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-[#F8FAFC] p-6 space-y-5">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono text-[#64748B] tabular-nums">
                    <span>01. INSTITUTION</span>
                    <Building2 className="h-4 w-4 text-[#2563EB]" aria-hidden="true" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-[#172554]">
                    Submit Institution Application
                  </h3>
                  <p className="text-sm text-[#64748B] leading-relaxed">
                    Universities and colleges apply openly with official domain details. Applications remain pending until verified and approved by a Platform Administrator.
                  </p>
                </div>
                <Link
                  to="/register/institution"
                  className="inline-flex min-h-[40px] items-center gap-1.5 text-sm font-semibold text-[#2563EB] hover:text-[#1D4ED8]"
                >
                  <span>Apply for institution</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>

              <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-[#F8FAFC] p-6 space-y-5">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono text-[#64748B] tabular-nums">
                    <span>02. MEMBERSHIP</span>
                    <FolderKanban className="h-4 w-4 text-[#2563EB]" aria-hidden="true" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-[#172554]">
                    Approve Students &amp; Supervisors
                  </h3>
                  <p className="text-sm text-[#64748B] leading-relaxed">
                    Students select their institution and academic programme, while supervisors request membership or redeem an administrator invitation. All pending requests await institutional approval.
                  </p>
                </div>
                <Link
                  to="/register/student"
                  className="inline-flex min-h-[40px] items-center gap-1.5 text-sm font-semibold text-[#2563EB] hover:text-[#1D4ED8]"
                >
                  <span>Register as student</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>

              <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-[#F8FAFC] p-6 space-y-5">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono text-[#64748B] tabular-nums">
                    <span>03. SUPERVISION</span>
                    <FileCheck2 className="h-4 w-4 text-[#2563EB]" aria-hidden="true" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-[#172554]">
                    Track Progress &amp; Reviews
                  </h3>
                  <p className="text-sm text-[#64748B] leading-relaxed">
                    Once assigned, students manage milestones, weekly journals, and chapter submissions while supervisors review work, request revisions, and track progress.
                  </p>
                </div>
                <Link
                  to="/register/supervisor"
                  className="inline-flex min-h-[40px] items-center gap-1.5 text-sm font-semibold text-[#2563EB] hover:text-[#1D4ED8]"
                >
                  <span>Register as supervisor</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom Onboarding CTA Band */}
        <section className="border-t border-slate-200 bg-[#172554] text-white">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-2 max-w-2xl">
                <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-balance">
                  Ready to set up your academic account or institutional workspace?
                </h2>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                  Choose the registration path that matches your role, or sign in if your institution has already provisioned your membership.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                <Link
                  to="/register"
                  className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-6 py-3 text-sm font-semibold text-white hover:bg-[#1D4ED8] transition-colors whitespace-nowrap"
                >
                  <span>Open registration hub</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex min-h-[48px] items-center justify-center rounded-lg border border-white/25 bg-white/10 px-6 py-3 text-sm font-medium text-white hover:bg-white/15 transition-colors whitespace-nowrap"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
