import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useDemoSession } from '../../context/DemoSessionContext';
import { getDashboardPathForRole } from '../../utils/roleRouting';
import BrandLogo from '../brand/BrandLogo';
import ThemeToggle from '../ui/ThemeToggle';

export default function PublicHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { session, activeMembership } = useDemoSession();
  const portalTarget = activeMembership
    ? getDashboardPathForRole(activeMembership.roleKey)
    : '/login';

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname, location.hash]);

  const handleSectionLink = (e, sectionId) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 80);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b spt-glass">
      <div className="mx-auto flex h-14 sm:h-16 max-w-6xl items-center justify-between gap-4 sm:gap-8 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="shrink-0">
          <BrandLogo size="sm" showInstitution />
        </Link>

        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-6 text-sm font-medium text-[var(--text-muted)]"
        >
          <a
            href="#overview"
            onClick={(e) => handleSectionLink(e, 'overview')}
            className="hover:text-[var(--text-primary)] transition-colors whitespace-nowrap shrink-0"
          >
            Overview
          </a>
          <a
            href="#features"
            onClick={(e) => handleSectionLink(e, 'features')}
            className="hover:text-[var(--text-primary)] transition-colors whitespace-nowrap shrink-0"
          >
            Features
          </a>
          <a
            href="#portals"
            onClick={(e) => handleSectionLink(e, 'portals')}
            className="hover:text-[var(--text-primary)] transition-colors whitespace-nowrap shrink-0"
          >
            Portals
          </a>
          <a
            href="#workflows"
            onClick={(e) => handleSectionLink(e, 'workflows')}
            className="hover:text-[var(--text-primary)] transition-colors whitespace-nowrap shrink-0"
          >
            How it works
          </a>
          <Link
            to="/register/student"
            className={`transition-colors whitespace-nowrap shrink-0 ${
              location.pathname.startsWith('/register')
                ? 'text-[var(--accent-primary)] font-semibold'
                : 'hover:text-[var(--text-primary)]'
            }`}
          >
            Register
          </Link>
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          <ThemeToggle compact />

          <Link
            to={session ? portalTarget : '/login'}
            className="hidden md:inline-flex min-h-[40px] items-center justify-center rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-medium text-white hover:bg-[#1D4ED8] transition-colors whitespace-nowrap shrink-0"
          >
            {session ? 'Dashboard' : 'Portal Sign In'}
          </Link>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="md:hidden inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] cursor-pointer"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 pb-5 pt-3 shadow-lg">
          <nav aria-label="Mobile navigation" className="flex flex-col gap-1">
            <a
              href="#overview"
              onClick={(e) => handleSectionLink(e, 'overview')}
              className="flex min-h-[44px] items-center rounded-lg px-3 text-base font-medium text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
            >
              Overview
            </a>
            <a
              href="#portals"
              onClick={(e) => handleSectionLink(e, 'portals')}
              className="flex min-h-[44px] items-center rounded-lg px-3 text-base font-medium text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
            >
              Portals
            </a>
            <a
              href="#features"
              onClick={(e) => handleSectionLink(e, 'features')}
              className="flex min-h-[44px] items-center rounded-lg px-3 text-base font-medium text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
            >
              Features
            </a>
            <a
              href="#workflows"
              onClick={(e) => handleSectionLink(e, 'workflows')}
              className="flex min-h-[44px] items-center rounded-lg px-3 text-base font-medium text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
            >
              How it works
            </a>
            <div className="mt-3 grid grid-cols-1 gap-2 border-t border-[var(--border-subtle)] pt-3">
              {session ? (
                <Link
                  to={portalTarget}
                  className="flex min-h-[46px] items-center justify-center rounded-lg bg-[#2563EB] px-4 text-sm font-semibold text-white hover:bg-[#1D4ED8]"
                >
                  Open dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/login/student"
                    className="flex min-h-[46px] items-center justify-center rounded-lg bg-[#2563EB] px-4 text-sm font-semibold text-white hover:bg-[#1D4ED8]"
                  >
                    Student Portal Sign In
                  </Link>
                  <Link
                    to="/login/supervisor"
                    className="flex min-h-[44px] items-center justify-center rounded-lg border border-teal-500/35 bg-teal-500/10 px-4 text-sm font-medium text-[var(--text-primary)]"
                  >
                    Supervisor Portal Sign In
                  </Link>
                  <Link
                    to="/login/admin"
                    className="flex min-h-[44px] items-center justify-center rounded-lg border border-violet-500/35 bg-violet-500/10 px-4 text-sm font-medium text-[var(--text-primary)]"
                  >
                    Institution Admin Sign In
                  </Link>
                </>
              )}
              <Link
                to="/register/student"
                className="flex min-h-[44px] items-center justify-center rounded-lg border border-[var(--border-strong)] bg-[var(--bg-elevated)] px-4 text-sm font-medium text-[var(--text-primary)] hover:opacity-90"
              >
                Register as student
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
