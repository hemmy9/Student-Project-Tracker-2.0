import { Link } from 'react-router-dom';
import PublicHeader from '../components/layout/PublicHeader';
import PublicFooter from '../components/layout/PublicFooter';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <PublicHeader />
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full rounded-2xl border border-slate-200 bg-white p-8 text-center space-y-4">
          <p className="font-mono text-xs font-semibold text-[#2563EB] tabular-nums">404</p>
          <h1 className="font-display text-2xl font-bold text-[#172554]">Page not found</h1>
          <p className="text-sm text-[#64748B] leading-relaxed">
            The route you requested does not exist in Stage 1. Portal dashboards will be introduced in Stage 2.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/"
              className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1D4ED8]"
            >
              Return home
            </Link>
            <Link
              to="/login"
              className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-[#172554] hover:bg-slate-50"
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
