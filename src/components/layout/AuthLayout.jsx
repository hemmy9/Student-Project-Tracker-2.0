import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import BrandLogo from '../brand/BrandLogo';
import PublicFooter from './PublicFooter';
import PublicHeader from './PublicHeader';

export default function AuthLayout({
  title,
  subtitle,
  contextHeading,
  contextPoints = [],
  backTo = '/',
  backLabel = 'Back to homepage',
  children,
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-canvas)] text-[var(--text-primary)] transition-colors duration-200">
      <PublicHeader />

      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        <div className="mb-5">
          <Link
            to={backTo}
            className="inline-flex min-h-[40px] items-center gap-2 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span>{backLabel}</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-7">
            <div className="rounded-2xl spt-surface p-5 sm:p-8">
              <div className="mb-6 space-y-3 border-b border-[var(--border-subtle)] pb-5">
                <BrandLogo size="xs" showInstitution />
                <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)] text-balance">
                  {title}
                </h1>
                <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
                  {subtitle}
                </p>
              </div>
              {children}
            </div>
          </div>

          <aside className="lg:col-span-5 space-y-5">
            <div className="rounded-2xl border border-blue-500/25 bg-[#172554] p-6 text-white shadow-lg">
              <div className="flex items-center gap-2.5 text-blue-200 mb-3">
                <ShieldCheck className="h-5 w-5 shrink-0" aria-hidden="true" />
                <span className="text-xs font-semibold tracking-wide">
                  Role &amp; Access Governance
                </span>
              </div>
              <h2 className="font-display text-lg font-semibold leading-snug mb-4">
                {contextHeading}
              </h2>
              <ul className="space-y-3.5 text-sm text-slate-200">
                {contextPoints.map((point, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="font-mono text-xs text-blue-300 mt-0.5 tabular-nums">
                      0{index + 1}.
                    </span>
                    <span className="leading-relaxed">{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl spt-surface p-5 space-y-3">
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                Need a different onboarding path?
              </p>
              <div className="flex flex-col gap-2 text-sm">
                <Link
                  to="/register/student"
                  className="flex min-h-[40px] items-center justify-between rounded-lg border border-[var(--border-subtle)] px-3.5 py-2 text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
                >
                  <span>Student registration</span>
                  <span className="text-xs text-[var(--text-muted)]">Join institution</span>
                </Link>
                <Link
                  to="/login/supervisor"
                  className="flex min-h-[40px] items-center justify-between rounded-lg border border-[var(--border-subtle)] px-3.5 py-2 text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
                >
                  <span>Supervisor sign in</span>
                  <span className="text-xs text-[var(--text-muted)]">Admin-provisioned</span>
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
