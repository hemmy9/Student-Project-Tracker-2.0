import { Bell, BellOff, Lock, RotateCcw, SlidersHorizontal } from 'lucide-react';
import {
  resolveWorkspaceInstitution,
  useDemoAppState,
} from '../../context/DemoAppStateContext';
import { useDemoSession } from '../../context/DemoSessionContext';
import { useToast } from '../../context/ToastContext';
import {
  ACTIVITY_CATEGORIES,
  ALLOWED_LEAD_WINDOW_DAYS,
  DEFAULT_OFFICE_HOUR_LEAD_DAYS,
  resolveNotificationPreferences,
} from '../../utils/deadlineReminderEngine';

const ROLE_REMINDER_CATEGORIES = {
  student: [
    {
      key: 'tasks',
      label: 'Project Tasks',
      description: 'Upcoming and due-today tasks inside your selected lookahead window.',
    },
    {
      key: 'milestones',
      label: 'Project Milestones',
      description: 'Unapproved milestone deliverables approaching their due dates.',
    },
    {
      key: 'overdue',
      label: 'Overdue Escalations',
      description: 'Independently enables overdue alerts for active task or milestone categories.',
    },
    {
      key: 'officeHours',
      label: 'Confirmed Office Hours',
      description: `Confirmed consultations scheduled within ${DEFAULT_OFFICE_HOUR_LEAD_DAYS} days.`,
    },
  ],
  supervisor: [
    {
      key: 'milestones',
      label: 'Supervisee Milestones',
      description: 'Pending or in-progress supervisee milestones within your lookahead window.',
    },
    {
      key: 'overdue',
      label: 'Overdue Milestone Escalations',
      description: 'Independently enables overdue alerts when Supervisee Milestones are enabled.',
    },
    {
      key: 'officeHours',
      label: 'Confirmed Office Hours',
      description: `Confirmed supervision consultations scheduled within ${DEFAULT_OFFICE_HOUR_LEAD_DAYS} days.`,
    },
  ],
  institution_admin: [
    {
      key: 'projectDeadlines',
      label: 'Institutional Project Deadlines',
      description: 'Date-bound institutional projects approaching completion milestones.',
    },
    {
      key: 'overdue',
      label: 'Overdue Project Escalations',
      description: 'Independently enables overdue alerts when Institutional Project Deadlines are enabled.',
    },
  ],
};

const ACTIVITY_CATEGORY_DESCRIPTIONS = {
  Tasks: 'Milestone submissions, approvals, and status updates',
  Documents: 'Chapter uploads, revision responses, and review feedback',
  Journals: 'Weekly progress logs and supervisor journal reviews',
  Messages: 'Direct project thread messages and booking requests',
  Governance: 'Office-hour slot publications and booking confirmations/cancellations',
};

function ToggleSwitch({ id, checked, onChange, disabled = false, label }) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-lg border transition-colors ${
        disabled
          ? 'cursor-not-allowed border-[var(--border-subtle)] bg-[var(--bg-elevated)] opacity-60'
          : checked
            ? 'cursor-pointer border-[#2563EB] bg-[#2563EB]'
            : 'cursor-pointer border-[var(--border-strong)] bg-[var(--bg-surface)]'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-md transition-transform ${
          checked
            ? 'translate-x-5 bg-white'
            : 'translate-x-1 bg-[var(--text-muted)]'
        }`}
      />
    </button>
  );
}

export default function NotificationPreferencesPanel() {
  const { session, activeMembership } = useDemoSession();
  const { state, updateNotificationPreferences } = useDemoAppState();
  const { showToast } = useToast();

  if (!session || !activeMembership || activeMembership.roleKey === 'platform_admin') {
    return null;
  }

  const institutionName = resolveWorkspaceInstitution(activeMembership, session);
  const roleKey = activeMembership.roleKey;
  const email = session.email || '';

  const prefs = resolveNotificationPreferences(
    state.notificationPreferences,
    activeMembership,
    session
  );

  const scopePayload = {
    email,
    roleKey,
    institutionName,
  };

  const roleReminderOptions = ROLE_REMINDER_CATEGORIES[roleKey] || [];
  const isAdmin = roleKey === 'institution_admin';

  const handleResetDefaults = () => {
    updateNotificationPreferences(scopePayload, { reset: true });
    showToast({
      type: 'info',
      title: 'Notification preferences reset',
      message: `Restored defaults for ${activeMembership.roleLabel} (${institutionName}).`,
    });
  };

  return (
    <section
      aria-label="Reminder and notification preferences"
      className="spt-surface rounded-2xl p-5 sm:p-7 space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-[var(--border-subtle)] pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal
              className="h-4 w-4 text-[var(--accent-primary)]"
              aria-hidden="true"
            />
            <h2 className="font-display text-lg font-bold text-[var(--text-primary)]">
              Reminder &amp; Notification Preferences
            </h2>
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Scoped strictly to {activeMembership.roleLabel} at {institutionName}. Changes apply
            immediately across your reminders, banners, and notification drawer.
          </p>
        </div>

        <button
          type="button"
          onClick={handleResetDefaults}
          className="inline-flex min-h-[40px] shrink-0 items-center justify-center gap-1.5 rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] cursor-pointer"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Reset to Defaults</span>
        </button>
      </div>

      {/* Section 1: Deadline Reminders */}
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 text-[var(--accent-primary)]">
              {prefs.remindersEnabled ? (
                <Bell className="h-4 w-4" aria-hidden="true" />
              ) : (
                <BellOff className="h-4 w-4 text-[var(--text-muted)]" aria-hidden="true" />
              )}
            </div>
            <div>
              <label
                htmlFor="pref-reminders-enabled"
                className="text-sm font-semibold text-[var(--text-primary)] cursor-pointer"
              >
                Automated Deadline Reminders
              </label>
              <p className="text-xs text-[var(--text-muted)] mt-0.5 leading-relaxed">
                Pause or resume automated due-date and schedule reminders for this workspace.
                Previously resolved items remain archived safely.
              </p>
            </div>
          </div>
          <ToggleSwitch
            id="pref-reminders-enabled"
            label="Automated Deadline Reminders"
            checked={prefs.remindersEnabled}
            onChange={(nextVal) =>
              updateNotificationPreferences(scopePayload, { remindersEnabled: nextVal })
            }
          />
        </div>

        {/* Lead Window */}
        <div
          className={`space-y-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 ${
            !prefs.remindersEnabled ? 'opacity-65' : ''
          }`}
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold text-[var(--text-primary)]">
                Deadline Reminder Lead Window
              </p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Controls upcoming project, task, and milestone alerts.
                {!isAdmin &&
                  ` Confirmed office hours use a fixed ${DEFAULT_OFFICE_HOUR_LEAD_DAYS}-day consultation lead window.`}
              </p>
            </div>
            <div
              role="group"
              aria-label="Deadline reminder lead window"
              className="inline-flex rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-1 shrink-0"
            >
              {ALLOWED_LEAD_WINDOW_DAYS.map((days) => {
                const selected = prefs.leadWindowDays === days;
                return (
                  <button
                    key={days}
                    type="button"
                    disabled={!prefs.remindersEnabled}
                    aria-pressed={selected}
                    onClick={() =>
                      updateNotificationPreferences(scopePayload, { leadWindowDays: days })
                    }
                    className={`min-h-[36px] rounded-md px-3 font-mono text-xs font-semibold transition-colors ${
                      !prefs.remindersEnabled
                        ? 'cursor-not-allowed text-[var(--text-muted)]'
                        : selected
                          ? 'cursor-pointer bg-[#2563EB] text-white'
                          : 'cursor-pointer text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {days} days
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Role-Scoped Reminder Categories */}
        <div
          className={`space-y-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 ${
            !prefs.remindersEnabled ? 'opacity-65' : ''
          }`}
        >
          <div>
            <p className="text-xs font-bold text-[var(--text-primary)]">
              Reminder Categories ({activeMembership.roleLabel})
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Only categories applicable to your active portal role are shown.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {roleReminderOptions.map((cat) => {
              const isChecked = Boolean(prefs.categories[cat.key]);
              return (
                <label
                  key={cat.key}
                  htmlFor={`pref-rem-cat-${cat.key}`}
                  className={`flex items-start gap-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-3 ${
                    prefs.remindersEnabled ? 'cursor-pointer hover:border-[var(--border-strong)]' : 'cursor-not-allowed'
                  }`}
                >
                  <input
                    id={`pref-rem-cat-${cat.key}`}
                    type="checkbox"
                    disabled={!prefs.remindersEnabled}
                    checked={isChecked}
                    onChange={(e) =>
                      updateNotificationPreferences(scopePayload, {
                        categories: { [cat.key]: e.target.checked },
                      })
                    }
                    className="mt-0.5 h-4 w-4 rounded border-[var(--border-strong)] text-[#2563EB] focus:ring-[#2563EB]"
                  />
                  <span className="space-y-0.5">
                    <span className="block text-xs font-semibold text-[var(--text-primary)]">
                      {cat.label}
                    </span>
                    <span className="block text-[11px] text-[var(--text-muted)] leading-snug">
                      {cat.description}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>

          {isAdmin && (
            <p className="text-[11px] text-[var(--text-muted)] border-t border-[var(--border-subtle)] pt-2.5">
              Membership approval SLA reminders remain excluded because no institutional approval
              SLA threshold policy is defined in this workspace.
            </p>
          )}
        </div>
      </div>

      {/* Section 2: Activity Notifications */}
      <div className="space-y-3 border-t border-[var(--border-subtle)] pt-5">
        <div className="flex items-start justify-between gap-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4">
          <div>
            <label
              htmlFor="pref-activity-enabled"
              className="text-sm font-semibold text-[var(--text-primary)] cursor-pointer"
            >
              Workspace Activity Notifications
            </label>
            <p className="text-xs text-[var(--text-muted)] mt-0.5 leading-relaxed">
              Receive real event-driven alerts from your supervisor or supervisee actions. System
              notices remain visible independently.
            </p>
          </div>
          <ToggleSwitch
            id="pref-activity-enabled"
            label="Workspace Activity Notifications"
            checked={prefs.activityEnabled}
            onChange={(nextVal) =>
              updateNotificationPreferences(scopePayload, { activityEnabled: nextVal })
            }
          />
        </div>

        <div
          className={`grid grid-cols-1 gap-2 sm:grid-cols-2 ${
            !prefs.activityEnabled ? 'opacity-65' : ''
          }`}
        >
          {ACTIVITY_CATEGORIES.map((category) => {
            const isChecked = Boolean(prefs.activityCategories[category]);
            return (
              <label
                key={category}
                htmlFor={`pref-act-cat-${category}`}
                className={`flex items-start gap-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-3 ${
                  prefs.activityEnabled ? 'cursor-pointer hover:border-[var(--border-strong)]' : 'cursor-not-allowed'
                }`}
              >
                <input
                  id={`pref-act-cat-${category}`}
                  type="checkbox"
                  disabled={!prefs.activityEnabled}
                  checked={isChecked}
                  onChange={(e) =>
                    updateNotificationPreferences(scopePayload, {
                      activityCategories: { [category]: e.target.checked },
                    })
                  }
                  className="mt-0.5 h-4 w-4 rounded border-[var(--border-strong)] text-[#2563EB] focus:ring-[#2563EB]"
                />
                <span className="space-y-0.5">
                  <span className="block text-xs font-semibold text-[var(--text-primary)]">
                    {category}
                  </span>
                  <span className="block text-[11px] text-[var(--text-muted)] leading-snug">
                    {ACTIVITY_CATEGORY_DESCRIPTIONS[category]}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Section 3: Delivery Channels */}
      <div className="space-y-3 border-t border-[var(--border-subtle)] pt-5">
        <div>
          <h3 className="font-display text-sm font-bold text-[var(--text-primary)]">
            Delivery Channels
          </h3>
          <p className="text-xs text-[var(--text-muted)]">
            In-app notifications are active locally. External delivery channels activate in Stage D.
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-3">
            <div>
              <label
                htmlFor="pref-inapp-toasts"
                className="text-xs font-semibold text-[var(--text-primary)] cursor-pointer"
              >
                In-App Alert Toasts
              </label>
              <p className="text-[11px] text-[var(--text-muted)]">
                Show a brief summary toast when new active unread alerts arrive in-session.
              </p>
            </div>
            <ToggleSwitch
              id="pref-inapp-toasts"
              label="In-App Alert Toasts"
              checked={prefs.inAppToasts}
              onChange={(nextVal) =>
                updateNotificationPreferences(scopePayload, { inAppToasts: nextVal })
              }
            />
          </div>

          <div className="flex items-center justify-between gap-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-4 py-3 opacity-80">
            <div className="flex items-start gap-2.5">
              <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--text-muted)]" aria-hidden="true" />
              <div>
                <p className="text-xs font-semibold text-[var(--text-secondary)]">
                  Email Delivery
                </p>
                <p className="text-[11px] text-[var(--text-muted)]">
                  Automated email digests require Stage D SMTP / Supabase Edge Functions.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="font-mono text-[10px] font-semibold text-[var(--text-muted)]">
                Unavailable until Stage D
              </span>
              <ToggleSwitch
                id="pref-email-locked"
                label="Email Delivery unavailable until Stage D"
                checked={false}
                disabled
                onChange={() => {}}
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-4 py-3 opacity-80">
            <div className="flex items-start gap-2.5">
              <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--text-muted)]" aria-hidden="true" />
              <div>
                <p className="text-xs font-semibold text-[var(--text-secondary)]">
                  Browser &amp; Mobile Push Delivery
                </p>
                <p className="text-[11px] text-[var(--text-muted)]">
                  Web Push subscriptions require Stage D backend VAPID key registration.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="font-mono text-[10px] font-semibold text-[var(--text-muted)]">
                Unavailable until Stage D
              </span>
              <ToggleSwitch
                id="pref-push-locked"
                label="Push Delivery unavailable until Stage D"
                checked={false}
                disabled
                onChange={() => {}}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer status */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--border-subtle)] pt-3 text-[11px] font-mono text-[var(--text-muted)]">
        <span>
          Local scope: {roleKey} · {institutionName}
        </span>
        <span>
          {prefs.updatedAt ? `Saved ${prefs.updatedAt}` : 'Using workspace defaults'}
        </span>
      </div>
    </section>
  );
}
