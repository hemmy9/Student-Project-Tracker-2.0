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
import { selectUnreadNotificationCount } from '../../utils/deadlineReminderEngine';
import { getDashboardPathForRole, getProfilePathForRole } from '../../utils/roleRouting';
import BrandLogo from '../brand/BrandLogo';
import ThemeToggle from '../ui/ThemeToggle';
import NotificationDrawer from './NotificationDrawer';
import PortalStatusBadge from './PortalStatusBadge';
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
  const activeProfilePath = getProfilePathForRole(activeMembership.roleKey);
  const unreadCount = selectUnreadNotificationCount(
    state.notifications,
    activeMembership,
    session
  );

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

  const switcherDemoAccounts = DEMO_ACCOUNTS.filter(
    (account) =>
      account.roleKey !== 'platform_admin' &&
      !account.memberships.some((m) => m.roleKey === 'platform_admin')
  );

  const handleSignOut = async () => {
    await signOutDemo();
    showToast({
      type: 'info',
      title: 'Signed out',
      message: 'Your session has been closed.',
    });
    navigate('/login');
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b spt-glass print:hidden">
        <div className="flex h-14 sm:h-16 w-full items-center justify-between gap-3 px-4 sm:px-6 lg:px-6">
          {/* Zone 1: Brand + Portal Status Badge */}
          <div className="flex items-center gap-3 min-w-0">
            <Link to={activeDashboardPath} className="shrink-0">
              <BrandLogo size="sm" showInstitution compact />
            </Link>
            <span className="hidden sm:inline text-[var(--border-strong)]" aria-hidden="true">
              /
            </span>
            <PortalStatusBadge compact className="hidden sm:inline-flex" />
          </div>

          {/* Zone 2 & 3: Desktop Controls */}
          <div className="hidden md:flex items-center gap-2.5 shrink-0">
            <ThemeToggle compact />

            <div className="relative">
              <button
                type="button"
                onClick={() => setSwitcherOpen((prev) => !prev)}
                aria-expanded={switcherOpen}
                className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 py-2 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] cursor-pointer whitespace-nowrap"
              >
                <ArrowLeftRight className="h-3.5 w-3.5 text-[var(--accent-primary)]" aria-hidden="true" />
                <span>Switch User / Role</span>
                <ChevronDown className="h-3.5 w-3.5 text-[var(--text-muted)]" aria-hidden="true" />
              </button>

              {switcherOpen && (
                <div className="absolute right-0 mt-2 w-80 max-h-[80vh] overflow-y-auto rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-2 shadow-lg z-50 space-y-3">
                  {hasMultipleMemberships && (
                    <div className="space-y-1">
                      <p className="px-2.5 py-1 text-[11px] font-semibold text-[var(--text-muted)] border-b border-[var(--border-subtle)]">
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
                                ? 'bg-[#2563EB] text-white'
                                : 'hover:bg-[var(--bg-elevated)] text-[var(--text-primary)]'
                            }`}
                          >
                            <p className="text-xs font-semibold">{mem.roleLabel}</p>
                            <p
                              className={`text-xs truncate ${
                                isCurrent ? 'text-blue-100' : 'text-[var(--text-muted)]'
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
                    <p className="px-2.5 py-1 text-[11px] font-semibold text-[var(--text-muted)] border-b border-[var(--border-subtle)]">
                      Switch Demo User Account (Preview)
                    </p>
                    {switcherDemoAccounts.map((account) => {
                      const isCurrentUser = session.userId === account.id;
                      return (
                        <button
                          key={account.id}
                          type="button"
                          onClick={() => handleSwitchDemoUser(account)}
                          className={`w-full rounded-lg px-3 py-2 text-left transition-colors cursor-pointer ${
                            isCurrentUser
                              ? 'bg-[#2563EB]/15 border border-[#2563EB]/40 text-[var(--text-primary)]'
                              : 'hover:bg-[var(--bg-elevated)] text-[var(--text-primary)]'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-semibold">{account.fullName}</span>
                            <span className="text-[11px] font-medium text-[var(--accent-primary)]">
                              {account.roleLabel}
                            </span>
                          </div>
                          <p className="text-[11px] text-[var(--text-muted)] truncate">
                            {account.institution}
                          </p>
                        </button>
                      );
                    })}
                  </div>

                  <div className="border-t border-[var(--border-subtle)] pt-2">
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
                      className="flex w-full items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] cursor-pointer"
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
              className="relative inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 py-2 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] cursor-pointer whitespace-nowrap"
            >
              <Bell className="h-4 w-4 text-[var(--accent-primary)]" aria-hidden="true" />
              <span className="font-mono tabular-nums">{unreadCount}</span>
            </button>

            <button
              type="button"
              onClick={() => setProfileOpen(true)}
              aria-label="Open profile quick view"
              className="flex min-h-[40px] items-center gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-1.5 hover:opacity-90 cursor-pointer"
            >
              <User className="h-4 w-4 text-[var(--accent-primary)] shrink-0" aria-hidden="true" />
              <div className="text-left leading-tight">
                <p className="text-xs font-semibold text-[var(--text-primary)] whitespace-nowrap">
                  {session.fullName}
                </p>
                <p className="text-[11px] text-[var(--text-muted)] whitespace-nowrap">
                  {activeMembership.roleLabel}
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={handleSignOut}
              aria-label="Sign out"
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 py-2 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] cursor-pointer whitespace-nowrap"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Sign out</span>
            </button>
          </div>

          {/* Mobile Action Bar: Theme + Notifications + Menu */}
          <div className="flex md:hidden items-center gap-1 shrink-0">
            <ThemeToggle compact />

            <button
              type="button"
              onClick={() => setNotificationsOpen(true)}
              aria-label={`Open notifications (${unreadCount} unread)`}
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-1 rounded-lg px-2 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] cursor-pointer"
            >
              <Bell className="h-5 w-5 text-[var(--accent-primary)]" aria-hidden="true" />
              {unreadCount > 0 && (
                <span className="font-mono text-xs text-[var(--accent-primary)] tabular-nums">
                  {unreadCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? 'Close portal menu' : 'Open portal menu'}
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] cursor-pointer"
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
          <div className="md:hidden max-h-[82vh] overflow-y-auto border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-4 space-y-4 shadow-lg">
            <PortalStatusBadge className="w-full justify-start" />

            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                setProfileOpen(true);
              }}
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-3.5 text-left space-y-1 hover:opacity-90 cursor-pointer"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-[var(--text-primary)]">{session.fullName}</p>
                <span className="text-xs font-semibold text-[var(--accent-primary)]">Profile Quick View</span>
              </div>
              <p className="text-xs text-[var(--text-muted)]">{session.email}</p>
              <p className="text-xs font-medium text-[var(--text-primary)] pt-1">
                Active: {activeMembership.roleLabel} · {activeMembership.institutionName}
              </p>
            </button>

            {activeProfilePath && (
              <Link
                to={activeProfilePath}
                onClick={() => setMobileOpen(false)}
                className="flex min-h-[44px] items-center justify-between rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3.5 py-2 text-xs font-semibold text-[var(--accent-primary)] hover:bg-[var(--bg-elevated)]"
              >
                <span>Open Full {activeMembership.roleLabel} Profile</span>
                <span aria-hidden="true">→</span>
              </Link>
            )}

            {hasMultipleMemberships && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-[var(--text-muted)]">
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
                            ? 'border-[#2563EB] bg-[#2563EB] text-white'
                            : 'border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)]'
                        }`}
                      >
                        <p className="text-xs font-semibold">{mem.roleLabel}</p>
                        <p className={`text-xs ${isCurrent ? 'text-blue-100' : 'text-[var(--text-muted)]'}`}>
                          {mem.institutionName}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <p className="text-xs font-semibold text-[var(--text-muted)]">
                Switch Demo User Account (Preview)
              </p>
              <div className="space-y-1.5">
                {switcherDemoAccounts.map((account) => {
                  const isCurrentUser = session.userId === account.id;
                  return (
                    <button
                      key={account.id}
                      type="button"
                      onClick={() => handleSwitchDemoUser(account)}
                      className={`w-full min-h-[44px] rounded-lg border px-3.5 py-2 text-left cursor-pointer ${
                        isCurrentUser
                          ? 'border-[#2563EB] bg-[#2563EB]/15 text-[var(--text-primary)]'
                          : 'border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold">{account.fullName}</span>
                        <span className="text-[11px] font-medium text-[var(--accent-primary)]">
                          {account.roleLabel}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--text-muted)] truncate">{account.institution}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-2 border-t border-[var(--border-subtle)] pt-3">
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
                className="flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-4 text-sm font-medium text-[var(--text-muted)]"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                <span>Reset local demo data</span>
              </button>
              <Link
                to="/"
                onClick={() => setMobileOpen(false)}
                className="flex min-h-[44px] items-center justify-center rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-4 text-sm font-medium text-[var(--text-primary)]"
              >
                View public homepage
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-4 text-sm font-semibold text-white cursor-pointer"
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
