import { Link } from 'react-router-dom';
import { GRACE_POLYTECHNIC_BRAND } from '../../config/gracePolytechnic';
import BrandLogo from '../brand/BrandLogo';

export default function PublicFooter({ fullWidth = false }) {
  return (
    <footer className="border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] transition-colors duration-200">
      <div
        className={
          fullWidth
            ? 'w-full px-4 py-8 sm:px-6 lg:px-6'
            : 'mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8'
        }
      >
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
          <div className="md:col-span-5 space-y-3">
            <BrandLogo size="sm" showInstitution />
            <p className="text-sm text-[var(--text-muted)] max-w-sm leading-relaxed">
              {GRACE_POLYTECHNIC_BRAND.tagline}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 md:col-span-7 sm:grid-cols-3">
            <div className="space-y-2.5">
              <p className="text-xs font-semibold text-[var(--text-primary)]">Portals</p>
              <ul className="space-y-2 text-sm text-[var(--text-muted)]">
                <li>
                  <Link
                    to="/login/student"
                    className="hover:text-[var(--text-primary)] transition-colors"
                  >
                    Student sign in
                  </Link>
                </li>
                <li>
                  <Link
                    to="/login/supervisor"
                    className="hover:text-[var(--text-primary)] transition-colors"
                  >
                    Supervisor sign in
                  </Link>
                </li>
                <li>
                  <Link
                    to="/login/admin"
                    className="hover:text-[var(--text-primary)] transition-colors"
                  >
                    Institution Admin sign in
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="hover:text-[var(--text-primary)] transition-colors">
                    Portal gateway
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-2.5">
              <p className="text-xs font-semibold text-[var(--text-primary)]">Onboarding</p>
              <ul className="space-y-2 text-sm text-[var(--text-muted)]">
                <li>
                  <Link to="/" className="hover:text-[var(--text-primary)] transition-colors">
                    Homepage
                  </Link>
                </li>
                <li>
                  <Link
                    to="/register/student"
                    className="hover:text-[var(--text-primary)] transition-colors"
                  >
                    Student registration
                  </Link>
                </li>
              </ul>
            </div>

            <div className="col-span-2 sm:col-span-1 space-y-2.5">
              <p className="text-xs font-semibold text-[var(--text-primary)]">Institution</p>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                {GRACE_POLYTECHNIC_BRAND.institutionName} ({GRACE_POLYTECHNIC_BRAND.location}).
                Academic project supervision, milestones, office hours, and review portal.
              </p>
              <a
                href={GRACE_POLYTECHNIC_BRAND.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-xs font-medium text-[var(--accent-primary)] hover:underline"
              >
                {GRACE_POLYTECHNIC_BRAND.officialDomain}
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-[var(--border-subtle)] pt-6 text-xs text-[var(--text-muted)] sm:flex-row sm:items-center sm:justify-between">
          <p>
            {GRACE_POLYTECHNIC_BRAND.institutionName} · {GRACE_POLYTECHNIC_BRAND.appName}
          </p>
          <p>Role-based academic supervision &amp; progress tracking</p>
        </div>
      </div>
    </footer>
  );
}
