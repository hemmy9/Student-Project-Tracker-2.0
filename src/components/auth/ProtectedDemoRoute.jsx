import { Link, Navigate, useLocation } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useAuthGuard } from '../../hooks/useAuthGuard';
import PortalHeader from '../layout/PortalHeader';
import PublicFooter from '../layout/PublicFooter';

export default function ProtectedDemoRoute({ allowedRoles, children }) {
  const {
    activeMembership,
    isAuthenticated,
    isAuthorized,
    denialReason,
    redirectPath,
  } = useAuthGuard({ allowedRoles });
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#172554]">
        <PortalHeader />
        <main className="flex-1 flex items-center justify-center px-4 py-12">
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
              In Stage 4, this client-side route guard is paired with PostgreSQL Row Level Security
              (RLS) so unauthorized requests are also blocked at the database layer.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
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
            </div>
          </div>
        </main>
        <PublicFooter />
      </div>
    );
  }

  return children;
}
