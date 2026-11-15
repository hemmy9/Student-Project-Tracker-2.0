import { Link, useLocation } from 'react-router-dom';
import SmartSearchBar from '../dashboard/SmartSearchBar';
import PortalHeader from './PortalHeader';
import PublicFooter from './PublicFooter';

export default function PortalLayout({ navItems = [], children }) {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#172554]">
      <PortalHeader />

      <div className="flex-1 mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {navItems.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
            {/* Mobile horizontal scrollable navigation strip */}
            <nav
              aria-label="Portal sections"
              className="lg:hidden flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1"
            >
              {navItems.map((item) => {
                const isActive = location.pathname === item.to;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`inline-flex min-h-[44px] items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
                      isActive
                        ? 'border-[#172554] bg-[#172554] text-white'
                        : 'border-slate-200 bg-white text-[#64748B] hover:text-[#172554]'
                    }`}
                  >
                    {Icon && <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />}
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Desktop sidebar navigation */}
            <aside className="hidden lg:block lg:col-span-3">
              <nav
                aria-label="Portal sidebar"
                className="rounded-2xl border border-slate-200 bg-white p-2.5 space-y-1"
              >
                {navItems.map((item) => {
                  const isActive = location.pathname === item.to;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={`flex min-h-[44px] items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-[#172554] text-white'
                          : 'text-[#64748B] hover:bg-slate-50 hover:text-[#172554]'
                      }`}
                    >
                      {Icon && <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />}
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </aside>

            <main className="lg:col-span-9 min-w-0 space-y-6">
              <SmartSearchBar />
              {children}
            </main>
          </div>
        ) : (
          <main className="min-w-0 space-y-6">
            <SmartSearchBar />
            {children}
          </main>
        )}
      </div>

      <PublicFooter />
    </div>
  );
}
