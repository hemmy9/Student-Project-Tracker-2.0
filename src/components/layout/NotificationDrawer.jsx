import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, BellOff, CheckCheck, SlidersHorizontal, X } from 'lucide-react';
import { useDemoAppState } from '../../context/DemoAppStateContext';
import { useDemoSession } from '../../context/DemoSessionContext';
import {
  resolveNotificationPreferences,
  selectScopedNotifications,
  selectUnreadNotificationCount,
} from '../../utils/deadlineReminderEngine';
import { getProfilePathForRole } from '../../utils/roleRouting';

function getItemClassification(item) {
  if (!item) return { typeLabel: 'Notification', tag: null };

  if (item.kind === 'deadline_reminder') {
    if (item.status === 'resolved') {
      return {
        typeLabel: 'Reminder',
        tag: {
          label: 'Resolved',
          className: 'text-emerald-700 dark:text-emerald-400',
        },
      };
    }
    if (item.severity === 'overdue') {
      return {
        typeLabel: 'Reminder',
        tag: {
          label: 'Overdue',
          className: 'text-red-700 dark:text-red-400',
        },
      };
    }
    if (item.severity === 'due_today') {
      return {
        typeLabel: 'Reminder',
        tag: {
          label: 'Due Today',
          className: 'text-amber-700 dark:text-amber-400',
        },
      };
    }
    return {
      typeLabel: 'Reminder',
      tag: {
        label: 'Upcoming',
        className: 'text-[var(--accent-primary)]',
      },
    };
  }

  if (item.kind === 'system') {
    return {
      typeLabel: 'System Notice',
      tag: null,
    };
  }

  return {
    typeLabel: item.category ? `Activity · ${item.category}` : 'Activity',
    tag: null,
  };
}

export default function NotificationDrawer({ open, onClose }) {
  const { session, activeMembership } = useDemoSession();
  const { state, markNotificationRead, markAllNotificationsRead } = useDemoAppState();
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  if (!open || !activeMembership) return null;

  const roleNotifications = selectScopedNotifications(
    state.notifications,
    activeMembership,
    session
  );
  const unreadCount = selectUnreadNotificationCount(
    state.notifications,
    activeMembership,
    session
  );
  const prefs = resolveNotificationPreferences(
    state.notificationPreferences,
    activeMembership,
    session
  );
  const profilePath = getProfilePathForRole(activeMembership.roleKey);

  const unreadItems = roleNotifications.filter(
    (n) => (n.status || 'active') === 'active' && !n.read
  );
  const reminderItems = roleNotifications.filter((n) => n.kind === 'deadline_reminder');
  const activityItems = roleNotifications.filter(
    (n) => n.kind === 'activity' || n.kind === 'system' || !n.kind
  );

  const displayed =
    filter === 'unread'
      ? unreadItems
      : filter === 'reminders'
        ? reminderItems
        : filter === 'activity'
          ? activityItems
          : roleNotifications;

  const tabs = [
    { key: 'all', label: 'All', count: roleNotifications.length },
    { key: 'unread', label: 'Unread', count: unreadCount },
    { key: 'reminders', label: 'Reminders', count: reminderItems.length },
    { key: 'activity', label: 'Activity', count: activityItems.length },
  ];

  const handleNotificationClick = (item) => {
    markNotificationRead(item.id);
    onClose();
    if (item.targetPath) {
      navigate(item.targetPath);
    }
  };

  const handleOpenPreferences = () => {
    if (!profilePath) return;
    onClose();
    navigate(profilePath);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label="Notifications"
    >
      <div
        className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-xs"
        onClick={onClose}
        aria-hidden="true"
      />

      <aside className="relative z-10 flex h-full w-full max-w-md flex-col border-l border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-5 py-4">
          <div className="flex items-center gap-2.5">
            <Bell className="h-5 w-5 text-[var(--accent-primary)]" aria-hidden="true" />
            <div>
              <h2 className="font-display text-base font-bold text-[var(--text-primary)]">
                Notifications
              </h2>
              <p className="text-xs text-[var(--text-muted)] tabular-nums">
                {activeMembership.roleLabel} · {unreadCount} unread
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close notifications"
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-2 border-b border-[var(--border-subtle)] px-5 py-2.5 bg-[var(--bg-elevated)]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div
              role="tablist"
              aria-label="Filter notifications"
              className="flex flex-wrap items-center gap-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-0.5"
            >
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  role="tab"
                  aria-selected={filter === tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`min-h-[32px] rounded-md px-2.5 text-xs font-medium cursor-pointer transition-colors tabular-nums ${
                    filter === tab.key
                      ? 'bg-[#2563EB] text-white'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() =>
                  markAllNotificationsRead(activeMembership.roleKey, {
                    institutionName: activeMembership.institutionName,
                    recipientEmail: session?.email,
                  })
                }
                className="inline-flex min-h-[32px] items-center gap-1 text-xs font-semibold text-[var(--accent-primary)] hover:text-[var(--accent-primary-hover)] cursor-pointer"
              >
                <CheckCheck className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {!prefs.remindersEnabled && (
            <div className="flex items-center justify-between gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2 text-[11px]">
              <span className="inline-flex items-center gap-1.5 text-[var(--text-muted)]">
                <BellOff className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>Deadline reminders are paused for this workspace.</span>
              </span>
              {profilePath && (
                <button
                  type="button"
                  onClick={handleOpenPreferences}
                  className="inline-flex shrink-0 items-center gap-1 font-semibold text-[var(--accent-primary)] hover:underline cursor-pointer"
                >
                  <SlidersHorizontal className="h-3 w-3" aria-hidden="true" />
                  <span>Preferences</span>
                </button>
              )}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-[var(--border-subtle)] px-5 py-2">
          {displayed.length === 0 ? (
            <div className="py-12 text-center space-y-1.5">
              <p className="text-sm font-semibold text-[var(--text-primary)]">No notifications</p>
              <p className="text-xs text-[var(--text-muted)]">
                {filter === 'unread'
                  ? 'You have read all active alerts for this workspace.'
                  : filter === 'reminders'
                    ? prefs.remindersEnabled
                      ? 'No active or resolved deadline reminders match your current filter settings.'
                      : 'Automated deadline reminders are paused in your profile preferences.'
                    : filter === 'activity'
                      ? 'No activity updates or system notices match your current preferences.'
                      : 'Notifications from deadlines, submissions, reviews, and approvals appear here.'}
              </p>
            </div>
          ) : (
            displayed.map((item) => {
              const isResolved = item.status === 'resolved';
              const isUnreadActive = !isResolved && !item.read;
              const { typeLabel, tag } = getItemClassification(item);

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNotificationClick(item)}
                  className={`w-full py-4 text-left transition-colors cursor-pointer hover:bg-[var(--bg-elevated)] rounded-lg px-2 -mx-2 ${
                    isUnreadActive ? 'bg-[#2563EB]/8 dark:bg-[#3B82F6]/12' : ''
                  } ${isResolved ? 'opacity-80' : ''}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-[var(--text-primary)] leading-snug">
                      {item.title}
                    </p>
                    <div className="flex items-center gap-2 shrink-0">
                      {tag && (
                        <span className={`font-mono text-[11px] font-semibold ${tag.className}`}>
                          {tag.label}
                        </span>
                      )}
                      {isUnreadActive && (
                        <span className="text-[11px] font-semibold text-[var(--accent-primary)]">
                          Unread
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-[var(--text-muted)] leading-relaxed">{item.body}</p>
                  <div className="mt-1.5 flex items-center justify-between gap-2 font-mono text-[11px] text-[var(--text-muted)]">
                    <span>{typeLabel}</span>
                    <span>
                      {isResolved && item.resolvedAt
                        ? `Resolved ${item.resolvedAt}`
                        : item.time}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>
    </div>
  );
}

