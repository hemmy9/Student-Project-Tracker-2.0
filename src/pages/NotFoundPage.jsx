import { Link } from 'react-router-dom';
import PublicFooter from '../components/layout/PublicFooter';
import PublicHeader from '../components/layout/PublicHeader';
import { GRACE_POLYTECHNIC_BRAND } from '../config/gracePolytechnic';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-canvas)]">
      <PublicHeader />
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full spt-surface rounded-2xl p-8 text-center space-y-4">
          <p className="font-mono text-xs font-semibold text-[var(--accent-primary)] tabular-nums">
            404
          </p>
          <h1 className="font-display text-2xl font-bold text-[var(--text-primary)]">
            Page not found
          </h1>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            The requested route is unavailable in {GRACE_POLYTECHNIC_BRAND.appName}. Return to the
            institution gateway or sign in to an active Student, Supervisor, or Administrator portal.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/"
              className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-[var(--accent-primary)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--accent-primary-hover)] transition-colors"
            >
              Return home
            </Link>
            <Link
              to="/login"
              className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-5 py-2.5 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}

