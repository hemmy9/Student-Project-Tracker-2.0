import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Building2,
  GraduationCap,
  LockKeyhole,
  ShieldAlert,
  UserCheck,
} from 'lucide-react';
import PublicHeader from '../components/layout/PublicHeader';
import PublicFooter from '../components/layout/PublicFooter';
import { GRACE_POLYTECHNIC_BRAND } from '../config/gracePolytechnic';

const PATHS = [
  {
    to: '/register/student',
    icon: GraduationCap,
    title: 'Student Registration',
    subtitle: 'Join Grace Polytechnic supervision portal',
    description:
      'Create an account, select your provisional school, department, programme, ND/HND level, and study mode, and submit your Student ID for institutional approval.',
    statusNote: 'Membership starts as Pending Institutional Approval.',
    actionLabel: 'Continue as student',
    restricted: false,
  },
  {
    to: '/login/supervisor',
    icon: UserCheck,
    title: 'Supervisor Access (Restricted)',
    subtitle: 'Provisioned by Institution Administrators',
    description:
      'Public supervisor registration and unverified invitation code entry are disabled. Grace Polytechnic supervisor accounts are provisioned directly by authorised Institution Administrators.',
    statusNote: 'Verified invitation onboarding is deferred to Stage D.',
    actionLabel: 'Supervisor Portal Sign In',
    restricted: true,
  },
  {
    to: '/register/institution',
    icon: Building2,
    title: 'Institution Registration Application',
    subtitle: 'Register a university, college, or department',
    description:
      'Submit an institutional onboarding application with official domain and administrator contact details for platform verification.',
    statusNote: 'Requires Platform Administrator review before activation.',
    actionLabel: 'Apply for institution',
    restricted: false,
  },
];

export default function RegisterHubPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-canvas)] text-[var(--text-primary)] transition-colors duration-200">
      <PublicHeader />

      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-14 lg:px-8">
        <div className="max-w-2xl space-y-3 mb-8">
          <p className="font-mono text-xs font-semibold tracking-wide text-[var(--accent-primary)]">
            ONBOARDING &amp; REGISTRATION HUB · {GRACE_POLYTECHNIC_BRAND.institutionName.toUpperCase()}
          </p>
          <h1 className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)] text-balance">
            Select how you are joining Student Project Tracker.
          </h1>
          <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
            Every role is governed by institutional verification workflows. Students may self-register for approval; supervisor accounts are provisioned by authorised Institution Administrators.
          </p>
        </div>

        <div
          role="status"
          className="mb-8 rounded-2xl border border-blue-500/30 bg-blue-500/10 p-4 text-sm text-[var(--text-primary)]"
        >
          <div className="flex items-start gap-3">
            <ShieldAlert
              className="h-5 w-5 mt-0.5 shrink-0 text-[var(--accent-primary)]"
              aria-hidden="true"
            />
            <div className="space-y-1">
              <p className="font-semibold">Security rule: no self-assigned privileged roles</p>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                Public visitors cannot self-register as Supervisors, Institution Administrators, or
                Platform Administrators. Privileged roles are provisioned only after formal
                institutional verification.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {PATHS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="flex flex-col justify-between rounded-2xl spt-surface p-6 transition-colors"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl border ${
                        item.restricted
                          ? 'border-teal-500/25 bg-teal-500/12 text-[#14B8A6]'
                          : 'border-blue-500/25 bg-blue-500/12 text-[#3B82F6]'
                      }`}
                    >
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    {item.restricted && (
                      <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-[#14B8A6]">
                        <LockKeyhole className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        <span>ADMIN-PROVISIONED</span>
                      </span>
                    )}
                  </div>
                  <div className="space-y-1">
                    <h2 className="font-display text-xl font-bold text-[var(--text-primary)]">
                      {item.title}
                    </h2>
                    <p
                      className={`text-xs font-medium ${
                        item.restricted ? 'text-[#14B8A6]' : 'text-[var(--accent-primary)]'
                      }`}
                    >
                      {item.subtitle}
                    </p>
                  </div>
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 space-y-4 border-t border-[var(--border-subtle)] pt-4">
                  <p className="text-xs text-[var(--text-muted)]">{item.statusNote}</p>
                  <Link
                    to={item.to}
                    className={`inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-colors ${
                      item.restricted
                        ? 'bg-[#0D9488] hover:bg-[#0F766E]'
                        : 'bg-[#2563EB] hover:bg-[#1D4ED8]'
                    }`}
                  >
                    <span>{item.actionLabel}</span>
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-8 text-center text-sm text-[var(--text-muted)]">
          Already registered and approved?{' '}
          <Link
            to="/login"
            className="font-semibold text-[var(--accent-primary)] hover:underline"
          >
            Sign in to your portal
          </Link>
        </p>
      </main>

      <PublicFooter />
    </div>
  );
}
