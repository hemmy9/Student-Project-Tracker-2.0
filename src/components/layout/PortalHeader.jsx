import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeftRight,
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  RotateCcw,
  User,
  X,
} from 'lucide-react';
import { useDemoAppState } from '../../context/DemoAppStateContext';
import { useDemoSession } from '../../context/DemoSessionContext';
import { useToast } from '../../context/ToastContext';
import { DEMO_ACCOUNTS } from '../../data/demoAccounts';
import { getDashboardPathForRole } from '../../utils/roleRouting';
import NotificationDrawer from './NotificationDrawer';
import ProfileQuickView from './ProfileQuickView';

export default function PortalHeader() {
  const { session, activeMembership, signInDemo, switchMembership, signOutDemo } =
    useDemoSession();
  const { state, resetDemoState } = useDemoAppState();
  const { showToast } = useToast();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();

  if (!session || !activeMembership) return null;

  const hasMultipleMemberships = session.memberships.length > 1;
  const activeDashboardPath = getDashboardPathForRole(activeMembership.roleKey);
  const unreadCount = state.notifications.filter(
    (n) => n.roleKey === activeMembership.roleKey && !n.read
  ).length;

  const handleSwitchMembership = (mem) => {
    switchMembership(mem.id);
    setSwitcherOpen(false);
    setMobileOpen(false);
    showToast({
      type: 'info',
      title: `Switched to ${mem.roleLabel}`,
      message: mem.institutionName,
    });
    navigate(getDashboardPathForRole(mem.roleKey));
  };

  const handleSwitchDemoUser = (account) => {
    signInDemo(account);
    setSwitcherOpen(false);
    setMobileOpen(false);
    const nextRole = account.memberships[0]?.roleKey;
    showToast({
      type: 'info',
      title: `Signed in as ${account.fullName}`,
      message: `${account.roleLabel} · ${account.institution}`,
    });
    navigate(getDashboardPathForRole(nextRole));
  };

  const handleSignOut = () => {
    signOutDemo();
    showToast({
      type: 'info',
      title: 'Signed out',
      message: 'Your session has been closed.',
    });
    navigate('/login');
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md print:hidden">
        <div className="flex h-14 sm:h-16 w-full items-center justify-between gap-3 px-4 sm:px-6 lg:px-6">
          {/* Zone 1: Brand + Active Scope */}
          <div className="flex items-center gap-3 min-w-0">
            <Link
              to={activeDashboardPath}
              className="font-display text-base sm:text-lg font-bold tracking-tight text-[#172554] whitespace-nowrap shrink-0"
            >
              Student Project Tracker
            </Link>
            <span className="hidden sm:inline text-slate-300" aria-hidden="true">
              /
            </span>
            <span className="hidden sm:inline truncate text-sm font-medium text-[#64748B] max-w-[200px]">
              {activeMembership.roleLabel} · {activeMembership.institutionName}
            </span>
          </div>

          {/* Zone 2 & 3: Desktop Controls */}
          <div className="hidden md:flex items-center gap-2.5 shrink-0">
            <div className="relative">
              <button
                type="button"
                onClick={() => setSwitcherOpen((prev) => !prev)}
                aria-expanded={switcherOpen}
                className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-[#172554] hover:bg-slate-50 cursor-pointer whitespace-nowrap"
              >
                <ArrowLeftRight className="h-3.5 w-3.5 text-[#2563EB]" aria-hidden="true" />
                <span>Switch User / Role</span>
                <ChevronDown className="h-3.5 w-3.5 text-[#64748B]" aria-hidden="true" />
              </button>

              {switcherOpen && (
                <div className="absolute right-0 mt-2 w-80 max-h-[80vh] overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 shadow-lg z-50 space-y-3">
                  {hasMultipleMemberships && (
                    <div className="space-y-1">
                      <p className="px-2.5 py-1 text-[11px] font-semibold text-[#64748B] border-b border-slate-100">
                        Current User Memberships ({session.memberships.length})
                      </p>
                      {session.memberships.map((mem) => {
                        const isCurrent = mem.id === activeMembership.id;
                        return (
                          <button
                            key={mem.id}
                            type="button"
                            onClick={() => handleSwitchMembership(mem)}
                            className={`w-full rounded-lg px-3 py-2 text-left transition-colors cursor-pointer ${
                              isCurrent
                                ? 'bg-[#172554] text-white'
                                : 'hover:bg-slate-50 text-[#172554]'
                            }`}
                          >
                            <p className="text-xs font-semibold">{mem.roleLabel}</p>
                            <p
                              className={`text-xs truncate ${
                                isCurrent ? 'text-slate-200' : 'text-[#64748B]'
                              }`}
                            >
                              {mem.institutionName}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  <div className="space-y-1">
                    <p className="px-2.5 py-1 text-[11px] font-semibold text-[#64748B] border-b border-slate-100">
                      Switch Demo User Account (Preview)
                    </p>
                    {DEMO_ACCOUNTS.map((account) => {
                      const isCurrentUser = session.userId === account.id;
                      return (
                        <button
                          key={account.id}
                          type="button"
                          onClick={() => handleSwitchDemoUser(account)}
                          className={`w-full rounded-lg px-3 py-2 text-left transition-colors cursor-pointer ${
                            isCurrentUser
                              ? 'bg-blue-50 border border-[#2563EB]/30 text-[#172554]'
                              : 'hover:bg-slate-50 text-[#172554]'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-semibold">{account.fullName}</span>
                            <span className="text-[11px] font-medium text-[#2563EB]">
                              {account.roleLabel}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#64748B] truncate">
                            {account.institution}
                          </p>
                        </button>
                      );
                    })}
                  </div>

                  <div className="border-t border-slate-100 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        resetDemoState();
                        setSwitcherOpen(false);
                        showToast({
                          type: 'success',
                          title: 'Demo workspace reset',
                          message: 'Local tasks, documents, journals, and logs restored.',
                        });
                      }}
                      className="flex w-full items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-[#64748B] hover:bg-slate-50 hover:text-[#172554] cursor-pointer"
                    >
                      <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Reset local demo data</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setNotificationsOpen(true)}
              aria-label={`Open notifications (${unreadCount} unread)`}
              className="relative inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-[#172554] hover:bg-slate-50 cursor-pointer whitespace-nowrap"
            >
              <Bell className="h-4 w-4 text-[#2563EB]" aria-hidden="true" />
              <span className="font-mono tabular-nums">{unreadCount}</span>
            </button>

            <button
              type="button"
              onClick={() => setProfileOpen(true)}
              aria-label="Open profile quick view"
              className="flex min-h-[40px] items-center gap-2 rounded-lg border border-slate-200 bg-[#F8FAFC] px-3 py-1.5 hover:bg-slate-100 cursor-pointer"
            >
              <User className="h-4 w-4 text-[#2563EB] shrink-0" aria-hidden="true" />
              <div className="text-left leading-tight">
                <p className="text-xs font-semibold text-[#172554] whitespace-nowrap">
                  {session.fullName}
                </p>
                <p className="text-[11px] text-[#64748B] whitespace-nowrap">
                  {activeMembership.roleLabel}
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={handleSignOut}
              aria-label="Sign out"
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-[#172554] hover:bg-slate-50 cursor-pointer whitespace-nowrap"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Sign out</span>
            </button>
          </div>

          {/* Mobile Action Bar: Notifications + Menu */}
          <div className="flex md:hidden items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setNotificationsOpen(true)}
              aria-label={`Open notifications (${unreadCount} unread)`}
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-1 rounded-lg px-2 text-xs font-semibold text-[#172554] hover:bg-slate-100 cursor-pointer"
            >
              <Bell className="h-5 w-5 text-[#2563EB]" aria-hidden="true" />
              {unreadCount > 0 && (
                <span className="font-mono text-xs text-[#2563EB] tabular-nums">
                  {unreadCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? 'Close portal menu' : 'Open portal menu'}
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-[#172554] hover:bg-slate-100 cursor-pointer"
            >
              {mobileOpen ? (
                <X className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Menu className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Portal Drawer */}
        {mobileOpen && (
          <div className="md:hidden max-h-[82vh] overflow-y-auto border-t border-slate-200 bg-white px-4 py-4 space-y-4 shadow-lg">
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                setProfileOpen(true);
              }}
              className="w-full rounded-xl border border-slate-200 bg-[#F8FAFC] p-3.5 text-left space-y-1 hover:bg-slate-100 cursor-pointer"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-[#172554]">{session.fullName}</p>
                <span className="text-xs font-semibold text-[#2563EB]">Profile Quick View</span>
              </div>
              <p className="text-xs text-[#64748B]">{session.email}</p>
              <p className="text-xs font-medium text-[#172554] pt-1">
                Active: {activeMembership.roleLabel} · {activeMembership.institutionName}
              </p>
            </button>

            {hasMultipleMemberships && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-[#64748B]">
                  Switch Role / Institution (Current User)
                </p>
                <div className="space-y-1.5">
                  {session.memberships.map((mem) => {
                    const isCurrent = mem.id === activeMembership.id;
                    return (
                      <button
                        key={mem.id}
                        type="button"
                        onClick={() => handleSwitchMembership(mem)}
                        className={`w-full min-h-[44px] rounded-lg border px-3.5 py-2 text-left cursor-pointer ${
                          isCurrent
                            ? 'border-[#172554] bg-[#172554] text-white'
                            : 'border-slate-200 bg-white text-[#172554]'
                        }`}
                      >
                        <p className="text-xs font-semibold">{mem.roleLabel}</p>
                        <p className={`text-xs ${isCurrent ? 'text-slate-200' : 'text-[#64748B]'}`}>
                          {mem.institutionName}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <p className="text-xs font-semibold text-[#64748B]">
                Switch Demo User Account (Preview)
              </p>
              <div className="space-y-1.5">
                {DEMO_ACCOUNTS.map((account) => {
                  const isCurrentUser = session.userId === account.id;
                  return (
                    <button
                      key={account.id}
                      type="button"
                      onClick={() => handleSwitchDemoUser(account)}
                      className={`w-full min-h-[44px] rounded-lg border px-3.5 py-2 text-left cursor-pointer ${
                        isCurrentUser
                          ? 'border-[#2563EB] bg-blue-50 text-[#172554]'
                          : 'border-slate-200 bg-white text-[#172554]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold">{account.fullName}</span>
                        <span className="text-[11px] font-medium text-[#2563EB]">
                          {account.roleLabel}
                        </span>
                      </div>
                      <p className="text-xs text-[#64748B] truncate">{account.institution}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-2 border-t border-slate-200 pt-3">
              <button
                type="button"
                onClick={() => {
                  resetDemoState();
                  setMobileOpen(false);
                  showToast({
                    type: 'success',
                    title: 'Demo workspace reset',
                    message: 'Local tasks, documents, journals, and logs restored.',
                  });
                }}
                className="flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-[#64748B]"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                <span>Reset local demo data</span>
              </button>
              <Link
                to="/"
                onClick={() => setMobileOpen(false)}
                className="flex min-h-[44px] items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-[#172554]"
              >
                View public homepage
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-[#172554] px-4 text-sm font-semibold text-white cursor-pointer"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        )}
      </header>

      <NotificationDrawer open={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
      <ProfileQuickView open={profileOpen} onClose={() => setProfileOpen(false)} />
    </>
  );
}
