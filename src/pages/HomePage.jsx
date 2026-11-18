import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  FileCheck2,
  FolderKanban,
  GraduationCap,
  LockKeyhole,
  UserCheck,
  UserPlus,
} from 'lucide-react';
import FeaturesSection from '../components/home/FeaturesSection';
import HeroSection from '../components/home/HeroSection';
import PublicFooter from '../components/layout/PublicFooter';
import PublicHeader from '../components/layout/PublicHeader';
import { FadeInSection, PerspectiveCard, StaggerGroup, StaggerItem } from '../components/ui/MotionPrimitives';
import {
  GRACE_POLYTECHNIC_BRAND,
  GRACE_POLYTECHNIC_PROVISIONAL_CATALOGUE,
} from '../config/gracePolytechnic';

const PORTAL_CARDS = [
  {
    id: 'student',
    badge: '01 · STUDENT PORTAL',
    title: 'Student',
    audience: 'ND & HND Final-Year Candidates',
    loginPath: '/login/student',
    ctaLabel: 'Sign in as Student',
    secondaryPath: '/register/student',
    secondaryLabel: 'New student registration',
    icon: GraduationCap,
    accentBar: 'border-t-[#2563EB]',
    iconStyle: 'border-blue-500/25 bg-blue-500/12 text-[#3B82F6]',
    badgeColor: 'text-[#3B82F6]',
    ctaStyle: 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white',
    description:
      'Manage project milestones, log weekly progress journals, upload chapter drafts, and schedule supervisor office hours.',
    highlights: [
      'Track project tasks, milestones, and chapter review status',
      'Submit weekly journals and respond to revision comments',
      'Book available supervisor consultation slots',
    ],
  },
  {
    id: 'supervisor',
    badge: '02 · SUPERVISOR PORTAL',
    title: 'Supervisor',
    audience: 'Academic Advisors & Project Supervisors',
    loginPath: '/login/supervisor',
    ctaLabel: 'Sign in as Supervisor',
    secondaryPath: null,
    secondaryLabel: null,
    restrictedNote: 'Provisioned by Institution Administrators',
    icon: UserCheck,
    accentBar: 'border-t-[#0D9488]',
    iconStyle: 'border-teal-500/25 bg-teal-500/12 text-[#14B8A6]',
    badgeColor: 'text-[#14B8A6]',
    ctaStyle: 'bg-[#0D9488] hover:bg-[#0F766E] text-white',
    description:
      'Oversee assigned student cohorts, review submitted chapters, approve milestones, and host structured office hours.',
    highlights: [
      'Spot stalled student projects and overdue journals early',
      'Approve chapter drafts or request targeted revisions',
      'Publish weekly office hours and review bookings',
    ],
  },
  {
    id: 'institution_admin',
    badge: '03 · INSTITUTION ADMIN',
    title: 'Institution Administrator',
    audience: 'Department Coordinators & Academic Governance',
    loginPath: '/login/admin',
    ctaLabel: 'Sign in as Institution Admin',
    secondaryPath: null,
    secondaryLabel: null,
    restrictedNote: 'Restricted to authorized coordinators',
    icon: Building2,
    accentBar: 'border-t-[#6366F1]',
    iconStyle: 'border-violet-500/25 bg-violet-500/12 text-[#8B5CF6]',
    badgeColor: 'text-[#8B5CF6]',
    ctaStyle: 'bg-[#6366F1] hover:bg-[#4F46E5] text-white',
    description:
      'Configure Grace Polytechnic departments and sessions, verify student registrations, and provision supervisor accounts.',
    highlights: [
      'Manage Schools, Departments, ND/HND programmes & sessions',
      'Approve student accounts and create supervisor roles',
      'Assign supervisors to projects and export audit reports',
    ],
  },
];

const SYSTEM_STEPS = [
  {
    step: '01',
    icon: Building2,
    title: 'Academic Structure & Sessions',
    description:
      'Institution Administrators configure Grace Polytechnic schools, departments, ND/HND programmes, and active academic sessions.',
  },
  {
    step: '02',
    icon: UserPlus,
    title: 'Verified Student & Supervisor Onboarding',
    description:
      'Students register with their programme details for approval while Institution Administrators provision and assign supervisors.',
  },
  {
    step: '03',
    icon: FolderKanban,
    title: 'Milestones, Chapters & Office Hours',
    description:
      'Students execute project tasks, submit chapter drafts, log weekly journals, and book supervisor consultations.',
  },
  {
    step: '04',
    icon: ClipboardCheck,
    title: 'Structured Reviews & Defence Readiness',
    description:
      'Supervisors track cohort progress, issue feedback, and sign off on completed milestones for departmental reporting.',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-canvas)] text-[var(--text-primary)] transition-colors duration-200">
      <PublicHeader />

      <main className="flex-1">
        <HeroSection />

        {/* Three Dedicated Portal Selection Cards */}
        <section
          id="portals"
          className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-18 lg:px-8"
        >
          <FadeInSection className="max-w-2xl space-y-3 mb-10">
            <p className="font-mono text-xs font-semibold tracking-wider text-[var(--accent-primary)]">
              THREE DEDICATED PORTALS
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)] text-balance">
              Select your Grace Polytechnic portal to sign in.
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
              Every user enters through their designated portal with strict role-based access control across Student, Supervisor, and Institution Administrator workspaces.
            </p>
          </FadeInSection>

          <StaggerGroup className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {PORTAL_CARDS.map((card) => {
              const Icon = card.icon;
              return (
                <StaggerItem key={card.id}>
                  <PerspectiveCard maxTilt={3.5} hoverLift={-4} className="h-full">
                    <div
                      className={`flex h-full flex-col justify-between rounded-2xl spt-surface border-t-4 ${card.accentBar} p-6 space-y-6`}
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`font-mono text-xs font-semibold ${card.badgeColor}`}>
                            {card.badge}
                          </span>
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-xl border ${card.iconStyle}`}
                          >
                            <Icon className="h-5 w-5" aria-hidden="true" />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <h3 className="font-display text-xl font-bold text-[var(--text-primary)]">
                            {card.title}
                          </h3>
                          <p className="text-xs font-medium text-[var(--text-muted)]">
                            {card.audience}
                          </p>
                        </div>

                        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                          {card.description}
                        </p>

                        <ul className="space-y-2.5 border-t border-[var(--border-subtle)] pt-4">
                          {card.highlights.map((point, idx) => (
                            <li
                              key={idx}
                              className="flex items-start gap-2.5 text-xs sm:text-sm text-[var(--text-muted)]"
                            >
                              <CheckCircle2
                                className={`h-4 w-4 mt-0.5 shrink-0 ${card.badgeColor}`}
                                aria-hidden="true"
                              />
                              <span className="leading-relaxed">{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="space-y-2.5 pt-2">
                        <Link
                          to={card.loginPath}
                          className={`inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors shadow-xs ${card.ctaStyle}`}
                        >
                          <span>{card.ctaLabel}</span>
                          <ArrowRight className="h-4 w-4" aria-hidden="true" />
                        </Link>

                        {card.secondaryPath ? (
                          <Link
                            to={card.secondaryPath}
                            className="inline-flex min-h-[38px] w-full items-center justify-center rounded-lg text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                          >
                            {card.secondaryLabel}
                          </Link>
                        ) : (
                          <div className="flex min-h-[38px] items-center justify-center gap-1.5 text-xs text-[var(--text-muted)]">
                            <LockKeyhole className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                            <span>
                              {card.restrictedNote || 'Restricted to authorized coordinators'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </PerspectiveCard>
                </StaggerItem>
              );
            })}
          </StaggerGroup>
        </section>

        <FeaturesSection />

        {/* How the System Works */}
        <section
          id="workflows"
          className="border-t border-[var(--border-subtle)] bg-[var(--bg-canvas)]"
        >
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-18 lg:px-8">
            <FadeInSection className="max-w-2xl space-y-3 mb-10">
              <p className="font-mono text-xs font-semibold tracking-wider text-[var(--accent-primary)]">
                HOW THE SYSTEM WORKS
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)] text-balance">
                End-to-end project supervision from onboarding to final clearance.
              </h2>
              <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
                Every stage connects student deliverables, supervisor feedback, and departmental governance inside {GRACE_POLYTECHNIC_BRAND.institutionName}.
              </p>
            </FadeInSection>

            <StaggerGroup className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {SYSTEM_STEPS.map((item) => {
                const Icon = item.icon;
                return (
                  <StaggerItem key={item.step}>
                    <div className="flex h-full flex-col justify-between rounded-2xl spt-surface p-6 space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-semibold text-[var(--accent-primary)] tabular-nums">
                            STEP {item.step}
                          </span>
                          <Icon className="h-4 w-4 text-[var(--text-muted)]" aria-hidden="true" />
                        </div>
                        <h3 className="font-display text-base sm:text-lg font-bold text-[var(--text-primary)]">
                          {item.title}
                        </h3>
                        <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </StaggerItem>
                );
              })}
            </StaggerGroup>

            {/* Provisional Catalogue & Schools Strip */}
            <div className="mt-10 rounded-2xl spt-surface p-6 space-y-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-[var(--border-subtle)] pb-4">
                <div>
                  <p className="font-mono text-xs font-semibold text-[var(--accent-primary)]">
                    ACADEMIC SCHOOLS · PROVISIONAL REFERENCE
                  </p>
                  <h3 className="font-display text-lg font-bold text-[var(--text-primary)] mt-1">
                    Aligned with {GRACE_POLYTECHNIC_BRAND.institutionName} Academic Structure
                  </h3>
                </div>
                <span className="font-mono text-xs text-[var(--text-muted)]">
                  {GRACE_POLYTECHNIC_PROVISIONAL_CATALOGUE.schools.length} Schools ·{' '}
                  {GRACE_POLYTECHNIC_PROVISIONAL_CATALOGUE.departments.length} Departments
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {GRACE_POLYTECHNIC_PROVISIONAL_CATALOGUE.schools.map((school) => (
                  <div
                    key={school.id}
                    className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4 space-y-1"
                  >
                    <p className="font-display text-sm font-bold text-[var(--text-primary)]">
                      {school.name}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      ND &amp; HND Project Supervision Tracks
                    </p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                {GRACE_POLYTECHNIC_PROVISIONAL_CATALOGUE.verificationNote}
              </p>
            </div>
          </div>
        </section>

        {/* Bottom Onboarding & Portal CTA Band */}
        <section className="border-t border-[var(--border-subtle)] bg-[#0E172D] text-white">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-2 max-w-2xl">
                <p className="font-mono text-xs font-semibold text-blue-300">
                  GET STARTED · {GRACE_POLYTECHNIC_BRAND.institutionName.toUpperCase()}
                </p>
                <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-balance">
                  Ready to access your project workspace?
                </h2>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                  Sign in directly through your Student, Supervisor, or Institution Administrator portal, or register as a new student candidate.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row flex-wrap gap-3 shrink-0">
                <Link
                  to="/login/student"
                  className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-5 py-3 text-sm font-semibold text-white hover:bg-[#1D4ED8] transition-colors whitespace-nowrap"
                >
                  <span>Student sign in</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link
                  to="/login/supervisor"
                  className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-teal-400/40 bg-teal-500/15 px-5 py-3 text-sm font-medium text-teal-100 hover:bg-teal-500/25 transition-colors whitespace-nowrap"
                >
                  Supervisor sign in
                </Link>
                <Link
                  to="/login/admin"
                  className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-white/25 bg-white/10 px-5 py-3 text-sm font-medium text-white hover:bg-white/15 transition-colors whitespace-nowrap"
                >
                  Admin sign in
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
