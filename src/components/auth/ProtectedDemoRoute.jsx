import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Loader2, RefreshCw, ShieldAlert } from 'lucide-react';
import { useDemoSession } from '../../context/DemoSessionContext';
import { useAuthGuard } from '../../hooks/useAuthGuard';
import PortalHeader from '../layout/PortalHeader';
import PublicFooter from '../layout/PublicFooter';

export default function ProtectedDemoRoute({ allowedRoles, children }) {
  const { authLoading, authError, clearAuthError, refreshMemberships, signOutDemo } =
    useDemoSession();
  const {
    activeMembership,
    isAuthenticated,
    isAuthorized,
    denialReason,
    redirectPath,
  } = useAuthGuard({ allowedRoles });
  const location = useLocation();
  const navigate = useNavigate();

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#172554]">
        <PortalHeader />
        <main className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xs space-y-3">
            <Loader2
              className="mx-auto h-7 w-7 animate-spin text-[#2563EB]"
              aria-hidden="true"
            />
            <p className="font-display text-base font-bold text-[#172554]">
              Verifying workspace session...
            </p>
            <p className="text-xs text-[#64748B]">
              Synchronizing authentication state and institutional role permissions.
            </p>
          </div>
        </main>
        <PublicFooter fullWidth />
      </div>
    );
  }

  if (authError && !isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#172554]">
        <PortalHeader />
        <main className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-lg rounded-2xl border border-red-200 bg-white p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-2.5 text-red-700">
              <ShieldAlert className="h-5 w-5 shrink-0" aria-hidden="true" />
              <p className="font-mono text-xs font-semibold">AUTH SYNC ERROR</p>
            </div>
            <h1 className="font-display text-2xl font-bold text-[#172554]">
              Could not verify your session
            </h1>
            <p className="text-sm text-[#64748B] leading-relaxed">{authError}</p>
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => {
                  clearAuthError();
                  navigate('/login');
                }}
                className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1D4ED8] cursor-pointer"
              >
                Return to Sign In
              </button>
              <Link
                to="/"
                className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-[#172554] hover:bg-slate-50"
              >
                Return to Homepage
              </Link>
            </div>
          </div>
        </main>
        <PublicFooter fullWidth />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#172554]">
        <PortalHeader />
        <main className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="max-w-lg w-full rounded-2xl border border-red-200 bg-white p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-2.5 text-red-700">
              <ShieldAlert className="h-5 w-5 shrink-0" aria-hidden="true" />
              <p className="font-mono text-xs font-semibold">
                {denialReason === 'unapproved'
                  ? '403 · MEMBERSHIP PENDING APPROVAL'
                  : '403 · ROLE GUARD RESTRICTED'}
              </p>
            </div>
            <h1 className="font-display text-2xl font-bold text-[#172554]">
              {denialReason === 'unapproved'
                ? 'Institutional membership is not yet approved'
                : 'Access restricted for your current role'}
            </h1>
            <p className="text-sm text-[#64748B] leading-relaxed">
              Your active membership is{' '}
              <strong className="text-[#172554]">{activeMembership.roleLabel}</strong> at{' '}
              <strong className="text-[#172554]">{activeMembership.institutionName}</strong>. The
              route{' '}
              <code className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">
                {location.pathname}
              </code>{' '}
              requires {allowedRoles?.join(' or ')} authorization.
            </p>
            <p className="text-xs text-[#64748B] leading-relaxed">
              {denialReason === 'unapproved'
                ? 'An Institution Administrator must approve your institutional membership before portal workspaces and PostgreSQL Row Level Security (RLS) policies grant access.'
                : 'Client-side route guards pair with PostgreSQL Row Level Security (RLS) so unauthorized requests are blocked across both UI and database layers.'}
            </p>
            <div className="pt-2 flex flex-col sm:flex-row flex-wrap gap-3">
              {denialReason === 'unapproved' ? (
                <>
                  <button
                    type="button"
                    onClick={refreshMemberships}
                    className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1D4ED8] cursor-pointer"
                  >
                    <RefreshCw className="h-4 w-4" aria-hidden="true" />
                    Refresh Approval Status
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      await signOutDemo();
                      navigate('/login');
                    }}
                    className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-[#172554] hover:bg-slate-50 cursor-pointer"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to={redirectPath}
                    className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1D4ED8]"
                  >
                    Return to {activeMembership.roleLabel} Dashboard
                  </Link>
                  <Link
                    to="/portal-preview"
                    className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-[#172554] hover:bg-slate-50"
                  >
                    Inspect Workspace Scope
                  </Link>
                </>
              )}
            </div>
          </div>
        </main>
        <PublicFooter fullWidth />
      </div>
    );
  }

  return children;
}
