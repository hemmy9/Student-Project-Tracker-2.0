import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  BellOff,
  BellRing,
  CalendarClock,
  CheckCircle2,
  SlidersHorizontal,
} from 'lucide-react';
import { useDemoAppState } from '../../context/DemoAppStateContext';
import { useDemoSession } from '../../context/DemoSessionContext';
import { formatDisplayDate } from '../../utils/dateHelper';
import {
  DEFAULT_OFFICE_HOUR_LEAD_DAYS,
  evaluateDeadlineReminders,
  resolveNotificationPreferences,
  resolveScopedInstitution,
} from '../../utils/deadlineReminderEngine';
import { getProfilePathForRole } from '../../utils/roleRouting';

function getSeverityMeta(severity) {
  if (severity === 'overdue') {
    return {
      label: 'Overdue',
      textClass: 'text-red-700 dark:text-red-400',
      borderClass: 'border-red-200 dark:border-red-900/60',
      bgClass: 'bg-red-50/70 dark:bg-red-950/30',
    };
  }
  if (severity === 'due_today') {
    return {
      label: 'Due Today',
      textClass: 'text-amber-700 dark:text-amber-400',
      borderClass: 'border-amber-200 dark:border-amber-900/60',
      bgClass: 'bg-amber-50/70 dark:bg-amber-950/30',
    };
  }
  return {
    label: 'Upcoming',
    textClass: 'text-[var(--accent-primary)]',
    borderClass: 'border-[var(--border-subtle)]',
    bgClass: 'bg-[var(--bg-elevated)]',
  };
}

export default function DeadlineRemindersBanner() {
  const { session, activeMembership } = useDemoSession();
  const { state } = useDemoAppState();

  const institutionName = resolveScopedInstitution(activeMembership, session);

  const prefs = useMemo(
    () =>
      resolveNotificationPreferences(
        state.notificationPreferences,
        activeMembership,
        session
      ),
    [state.notificationPreferences, activeMembership, session]
  );

  const reminders = useMemo(
    () =>
      evaluateDeadlineReminders({
        state,
        activeMembership,
        session,
        preferences: prefs,
      }),
    [state, activeMembership, session, prefs]
  );

  if (!session || !activeMembership || activeMembership.roleKey === 'platform_admin') {
    return null;
  }

  const roleKey = activeMembership.roleKey;
  const isAdmin = roleKey === 'institution_admin';
  const profilePath = getProfilePathForRole(roleKey);
  const isPaused = !prefs.remindersEnabled;

  const overdueCount = reminders.filter((r) => r.severity === 'overdue').length;
  const dueTodayCount = reminders.filter((r) => r.severity === 'due_today').length;
  const upcomingCount = reminders.filter((r) => r.severity === 'upcoming').length;
  const topItems = reminders.slice(0, 4);

  return (
    <section
      aria-label="Automated deadline reminders"
      className="spt-surface rounded-2xl p-5 sm:p-6 space-y-4 print:hidden"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--accent-primary)]">
            {isPaused ? (
              <BellOff className="h-5 w-5 text-[var(--text-muted)]" aria-hidden="true" />
            ) : overdueCount > 0 ? (
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" aria-hidden="true" />
            ) : (
              <BellRing className="h-5 w-5" aria-hidden="true" />
            )}
          </div>
          <div className="space-y-0.5">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-display text-base font-bold text-[var(--text-primary)]">
                Deadline &amp; Schedule Reminders
              </h2>
              <span className="font-mono text-[11px] font-semibold text-[var(--text-muted)]">
                {institutionName || activeMembership.roleLabel}
              </span>
            </div>
            <p className="text-xs text-[var(--text-muted)]">
              {isPaused
                ? `Reminders are paused for ${activeMembership.roleLabel} (${institutionName || 'Active Workspace'}).`
                : isAdmin
                  ? `Date-bound institutional project deadlines (${prefs.leadWindowDays}-day lookahead).`
                  : `Automated alerts (${prefs.leadWindowDays}-day deadline lookahead${
                      prefs.categories.officeHours
                        ? ` · ${DEFAULT_OFFICE_HOUR_LEAD_DAYS}-day office hours`
                        : ''
                    }).`}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {!isPaused && (
            <div className="flex flex-wrap items-center gap-2 font-mono text-xs tabular-nums">
              <span className="rounded-lg border border-red-200 dark:border-red-900/60 bg-red-50/70 dark:bg-red-950/30 px-2.5 py-1 font-semibold text-red-700 dark:text-red-400">
                Overdue: {overdueCount}
              </span>
              <span className="rounded-lg border border-amber-200 dark:border-amber-900/60 bg-amber-50/70 dark:bg-amber-950/30 px-2.5 py-1 font-semibold text-amber-700 dark:text-amber-400">
                Due Today: {dueTodayCount}
              </span>
              <span className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-2.5 py-1 font-semibold text-[var(--text-primary)]">
                Upcoming: {upcomingCount}
              </span>
            </div>
          )}

          {profilePath && (
            <Link
              to={profilePath}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-2.5 py-1 text-xs font-semibold text-[var(--accent-primary)] hover:border-[var(--accent-primary)]"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Preferences</span>
            </Link>
          )}
        </div>
      </div>

      {isPaused ? (
        <div className="flex flex-col gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-3.5 text-xs text-[var(--text-muted)] sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-0.5">
            <p className="font-semibold text-[var(--text-primary)]">
              Automated reminders are currently paused
            </p>
            <p>
              Turn automated reminders back on in your profile notification preferences to resume
              dashboard deadline alerts for this workspace.
            </p>
          </div>
          {profilePath && (
            <Link
              to={profilePath}
              className="inline-flex shrink-0 items-center gap-1 font-semibold text-[var(--accent-primary)] hover:underline"
            >
              <span>Manage notification preferences</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          )}
        </div>
      ) : topItems.length === 0 ? (
        <div className="flex items-start gap-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-3.5 text-xs text-[var(--text-muted)]">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" aria-hidden="true" />
          <div className="space-y-1">
            <p className="font-semibold text-[var(--text-primary)]">
              No active deadline reminders right now
            </p>
            <p>
              {isAdmin
                ? `No enabled institutional project deadlines fall within the ${prefs.leadWindowDays}-day reminder window. Approval SLA reminders are excluded because no institutional approval SLA threshold is configured.`
                : `No enabled tasks, unapproved milestones, or office hours match your current reminder categories and ${prefs.leadWindowDays}-day window.`}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
          {topItems.map((item) => {
            const meta = getSeverityMeta(item.severity);
            return (
              <Link
                key={item.reminderKey}
                to={item.targetPath}
                className={`group flex flex-col justify-between gap-2 rounded-xl border p-3.5 transition-colors hover:border-[var(--accent-primary)] ${meta.borderClass} ${meta.bgClass}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs sm:text-sm font-semibold text-[var(--text-primary)] leading-snug">
                    {item.title}
                  </p>
                  <span className={`font-mono text-[11px] font-semibold shrink-0 ${meta.textClass}`}>
                    {meta.label}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">{item.body}</p>
                <div className="flex items-center justify-between gap-2 pt-1 text-[11px] font-mono text-[var(--text-muted)]">
                  <span className="inline-flex items-center gap-1">
                    <CalendarClock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    <span>Target: {formatDisplayDate(item.dueDate)}</span>
                  </span>
                  <span className="inline-flex items-center gap-1 font-sans font-semibold text-[var(--accent-primary)] group-hover:underline">
                    <span>Open</span>
                    <ArrowRight className="h-3 w-3" aria-hidden="true" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}

