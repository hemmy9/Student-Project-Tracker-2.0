import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useDemoSession } from '../../context/DemoSessionContext';
import { getDashboardPathForRole } from '../../utils/roleRouting';

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
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-14 sm:h-16 max-w-6xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="font-display text-base sm:text-lg font-bold tracking-tight text-[#172554] whitespace-nowrap shrink-0"
        >
          Student Project Tracker
        </Link>

        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-6 text-sm font-medium text-[#64748B]"
        >
          <a
            href="#overview"
            onClick={(e) => handleSectionLink(e, 'overview')}
            className="hover:text-[#172554] transition-colors whitespace-nowrap shrink-0"
          >
            Overview
          </a>
          <a
            href="#features"
            onClick={(e) => handleSectionLink(e, 'features')}
            className="hover:text-[#172554] transition-colors whitespace-nowrap shrink-0"
          >
            Features
          </a>
          <a
            href="#portals"
            onClick={(e) => handleSectionLink(e, 'portals')}
            className="hover:text-[#172554] transition-colors whitespace-nowrap shrink-0"
          >
            Portals
          </a>
          <a
            href="#workflows"
            onClick={(e) => handleSectionLink(e, 'workflows')}
            className="hover:text-[#172554] transition-colors whitespace-nowrap shrink-0"
          >
            Workflows
          </a>
          <Link
            to="/register"
            className={`transition-colors whitespace-nowrap shrink-0 ${
              location.pathname.startsWith('/register')
                ? 'text-[#2563EB] font-semibold'
                : 'hover:text-[#172554]'
            }`}
          >
            Register
          </Link>
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            to={session ? portalTarget : '/login'}
            className="hidden md:inline-flex min-h-[40px] items-center justify-center rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-medium text-white hover:bg-[#1D4ED8] transition-colors whitespace-nowrap shrink-0"
          >
            {session ? 'Dashboard' : 'Sign in'}
          </Link>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="md:hidden inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-[#172554] hover:bg-slate-100 cursor-pointer"
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
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pb-5 pt-3 shadow-lg">
          <nav aria-label="Mobile navigation" className="flex flex-col gap-1">
            <a
              href="#overview"
              onClick={(e) => handleSectionLink(e, 'overview')}
              className="flex min-h-[44px] items-center rounded-lg px-3 text-base font-medium text-[#172554] hover:bg-slate-50"
            >
              Overview
            </a>
            <a
              href="#features"
              onClick={(e) => handleSectionLink(e, 'features')}
              className="flex min-h-[44px] items-center rounded-lg px-3 text-base font-medium text-[#172554] hover:bg-slate-50"
            >
              Features
            </a>
            <a
              href="#portals"
              onClick={(e) => handleSectionLink(e, 'portals')}
              className="flex min-h-[44px] items-center rounded-lg px-3 text-base font-medium text-[#172554] hover:bg-slate-50"
            >
              Portals
            </a>
            <a
              href="#workflows"
              onClick={(e) => handleSectionLink(e, 'workflows')}
              className="flex min-h-[44px] items-center rounded-lg px-3 text-base font-medium text-[#172554] hover:bg-slate-50"
            >
              Workflows
            </a>
            <Link
              to="/register"
              className="flex min-h-[44px] items-center rounded-lg px-3 text-base font-medium text-[#172554] hover:bg-slate-50"
            >
              Registration Hub
            </Link>
            <div className="mt-3 grid grid-cols-1 gap-2.5 border-t border-slate-200 pt-3">
              <Link
                to={session ? portalTarget : '/login'}
                className="flex min-h-[48px] items-center justify-center rounded-lg bg-[#2563EB] px-4 text-sm font-semibold text-white hover:bg-[#1D4ED8]"
              >
                {session ? 'Open dashboard' : 'Sign in to account'}
              </Link>
              <Link
                to="/register/student"
                className="flex min-h-[44px] items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-[#172554] hover:bg-slate-50"
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
