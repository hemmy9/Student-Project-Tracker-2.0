import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Building2,
  GraduationCap,
  LockKeyhole,
  ShieldAlert,
  UserCheck,
} from 'lucide-react';
import AuthLayout from '../components/layout/AuthLayout';
import { GRACE_POLYTECHNIC_BRAND } from '../config/gracePolytechnic';

const PROVISIONING_STEPS = [
  {
    step: '01',
    title: 'Authorised Administrator Provisioning',
    description:
      'Project supervisor and academic advisor accounts at Grace Polytechnic are provisioned and assigned exclusively by authorised Institution Administrators.',
  },
  {
    step: '02',
    title: 'Public Self-Registration Disabled',
    description:
      'Unrestricted public supervisor registration and self-service invitation code redemption are disabled to prevent unauthorised role assignment or unverified access to student projects.',
  },
  {
    step: '03',
    title: 'Future Verified Invitations (Stage D)',
    description:
      'Cryptographically verified administrator invitations and automated token redemption are planned for Stage D backend implementation and are not currently operational.',
  },
];

export default function SupervisorRegisterPage() {
  return (
    <AuthLayout
      title="Supervisor Access Is Administrator-Provisioned"
      subtitle={`Public supervisor self-registration is disabled for ${GRACE_POLYTECHNIC_BRAND.institutionName}. Academic supervisors must be provisioned by an authorised Institution Administrator.`}
      backTo="/login/supervisor"
      backLabel="Back to Supervisor Sign In"
      contextHeading="Grace Polytechnic supervisor access governance"
      contextPoints={[
        'Public users cannot self-register as Supervisors or redeem unverified invitation codes.',
        'Supervisor accounts are provisioned directly by authorised Grace Polytechnic Institution Administrators.',
        'Verified invitation token redemption is deferred to Stage D and is not currently active.',
      ]}
    >
      <div className="space-y-6">
        {/* Institution Scope Banner */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-teal-500/25 bg-teal-500/8 px-4 py-3.5">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-teal-500/25 bg-teal-500/15 text-[#14B8A6]">
              <Building2 className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="font-display text-sm font-bold text-[var(--text-primary)]">
                {GRACE_POLYTECHNIC_BRAND.institutionName}
              </p>
              <p className="text-xs text-[var(--text-muted)] truncate">
                {GRACE_POLYTECHNIC_BRAND.location} · {GRACE_POLYTECHNIC_BRAND.officialDomain}
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold text-[#14B8A6]">
            <LockKeyhole className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>RESTRICTED ACCESS</span>
          </span>
        </div>

        {/* Restricted Access Policy Notice */}
        <div
          role="status"
          className="rounded-xl border border-amber-500/35 bg-amber-500/10 p-4 text-sm space-y-2"
        >
          <div className="flex items-start gap-3">
            <ShieldAlert
              className="h-5 w-5 mt-0.5 shrink-0 text-amber-500"
              aria-hidden="true"
            />
            <div className="space-y-1.5">
              <p className="font-semibold text-[var(--text-primary)]">
                No Public Supervisor Registration or Invitation Redemption
              </p>
              <p className="text-xs sm:text-sm leading-relaxed text-[var(--text-secondary)]">
                To protect student project records, chapter drafts, and academic governance,{' '}
                {GRACE_POLYTECHNIC_BRAND.institutionName} does not permit public self-signup or
                client-side invitation code claims for Supervisor accounts.
              </p>
            </div>
          </div>
        </div>

        {/* How Supervisors Receive Access */}
        <div className="space-y-3">
          <h2 className="font-display text-base font-bold text-[var(--text-primary)]">
            How supervisor onboarding works
          </h2>
          <div className="grid grid-cols-1 gap-3">
            {PROVISIONING_STEPS.map((item) => (
              <div
                key={item.step}
                className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4 space-y-1.5"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-[#14B8A6] tabular-nums">
                    {item.step}.
                  </span>
                  <h3 className="font-display text-sm font-bold text-[var(--text-primary)]">
                    {item.title}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Next Steps */}
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4 sm:p-5 space-y-4">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              Already provisioned as a Grace Polytechnic supervisor?
            </p>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
              Use the Supervisor Portal with credentials issued by your Institution Administrator, or
              contact your department coordinator / Institution Administrator to request account
              provisioning.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Link
              to="/login/supervisor"
              className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl bg-[#0D9488] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0F766E] transition-colors"
            >
              <UserCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Supervisor Portal Sign In</span>
              <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
            </Link>

            <Link
              to="/register/student"
              className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] px-4 py-2.5 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors"
            >
              <GraduationCap className="h-4 w-4 shrink-0 text-[#3B82F6]" aria-hidden="true" />
              <span>Student Registration</span>
            </Link>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
