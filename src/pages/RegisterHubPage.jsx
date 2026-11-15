import { Link } from 'react-router-dom';
import { ArrowRight, Building2, GraduationCap, ShieldAlert, UserCheck } from 'lucide-react';
import PublicHeader from '../components/layout/PublicHeader';
import PublicFooter from '../components/layout/PublicFooter';
import StatusAlert from '../components/ui/StatusAlert';

const PATHS = [
  {
    to: '/register/student',
    icon: GraduationCap,
    title: 'Student Registration',
    subtitle: 'Join an existing approved institution',
    description:
      'Create an account, select your university, department, and programme, and submit your student ID for institutional approval.',
    statusNote: 'Membership starts as Pending Institutional Approval.',
    actionLabel: 'Continue as student',
  },
  {
    to: '/register/supervisor',
    icon: UserCheck,
    title: 'Supervisor Registration',
    subtitle: 'Request membership or accept an invitation',
    description:
      'Apply to supervise academic projects at an approved institution or redeem an invitation code issued by your institution administrator.',
    statusNote: 'Requires admin approval or a valid invitation code.',
    actionLabel: 'Continue as supervisor',
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
  },
];

export default function RegisterHubPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <PublicHeader />

      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-14 lg:px-8">
        <div className="max-w-2xl space-y-3 mb-8">
          <p className="text-xs font-semibold tracking-wide text-[#2563EB]">
            Onboarding &amp; Registration Hub
          </p>
          <h1 className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-[#172554] text-balance">
            Select how you are joining Student Project Tracker.
          </h1>
          <p className="text-sm sm:text-base text-[#64748B] leading-relaxed">
            Every role is governed by institutional and platform verification workflows. Choose the registration form that matches your academic position.
          </p>
        </div>

        <StatusAlert type="info" title="Security rule: no self-assigned privileged roles" className="mb-8">
          <div className="flex items-start gap-2">
            <ShieldAlert className="h-4 w-4 mt-0.5 shrink-0 text-[#2563EB] hidden sm:block" aria-hidden="true" />
            <span>
              Submitting a registration form never grants instant Supervisor, Institution Admin, or Platform Admin privileges. Privileged roles are assigned only after formal verification.
            </span>
          </div>
        </StatusAlert>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {PATHS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.to}
                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition-colors hover:border-slate-300"
              >
                <div className="space-y-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#2563EB]">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div className="space-y-1">
                    <h2 className="font-display text-xl font-bold text-[#172554]">
                      {item.title}
                    </h2>
                    <p className="text-xs font-medium text-[#2563EB]">{item.subtitle}</p>
                  </div>
                  <p className="text-sm text-[#64748B] leading-relaxed">{item.description}</p>
                </div>

                <div className="mt-6 space-y-4 border-t border-slate-100 pt-4">
                  <p className="text-xs text-[#64748B]">{item.statusNote}</p>
                  <Link
                    to={item.to}
                    className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-[#172554] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0F172A] transition-colors"
                  >
                    <span>{item.actionLabel}</span>
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-8 text-center text-sm text-[#64748B]">
          Already registered and approved?{' '}
          <Link to="/login" className="font-semibold text-[#2563EB] hover:text-[#1D4ED8]">
            Sign in to your portal
          </Link>
        </p>
      </main>

      <PublicFooter />
    </div>
  );
}
