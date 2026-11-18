import { useEffect, useRef } from 'react';
import { useDemoAppState } from '../../context/DemoAppStateContext';
import { useDemoSession } from '../../context/DemoSessionContext';
import { useToast } from '../../context/ToastContext';
import {
  buildNotificationPreferenceKey,
  evaluateDeadlineReminders,
  evaluateOpenReminderCandidateKeys,
  reconcileActivityPreferencesState,
  reconcileDeadlineRemindersState,
  resolveNotificationPreferences,
  resolveScopedInstitution,
  selectScopedNotifications,
} from '../../utils/deadlineReminderEngine';

/**
 * Authoritative event-driven observer component bridging DemoSessionContext, DemoAppStateContext,
 * and ToastContext. Reconciles reminders & activity visibility on mount, membership switch,
 * domain updates, and scoped preference changes without replaying historical alerts as toasts.
 */
export default function DeadlineReminderSync() {
  const { session, activeMembership } = useDemoSession();
  const { state, syncDeadlineReminders } = useDemoAppState();
  const { showToast } = useToast();

  const seenIdsByScopeRef = useRef(new Map());
  const pendingBaselineScopeRef = useRef('');
  const lastScopeAndPrefsRef = useRef({ scopeKey: '', prefsSig: '' });

  const userId = session?.userId || '';
  const userEmail = session?.email || '';
  const membershipId = activeMembership?.id || '';
  const roleKey = activeMembership?.roleKey || '';
  const membershipInst = activeMembership?.institutionName || '';
  const membershipStatus = activeMembership?.status || '';

  const resolvedInstitution = resolveScopedInstitution(activeMembership, session);
  const scopeKey = buildNotificationPreferenceKey(userEmail, roleKey, resolvedInstitution);

  const prefs = resolveNotificationPreferences(
    state.notificationPreferences,
    activeMembership,
    session
  );
  const prefsSig = JSON.stringify({
    remindersEnabled: prefs.remindersEnabled,
    leadWindowDays: prefs.leadWindowDays,
    categories: prefs.categories,
    activityEnabled: prefs.activityEnabled,
    activityCategories: prefs.activityCategories,
    inAppToasts: prefs.inAppToasts,
  });

  // 1. Trigger authoritative reconciliation on mount, scope switches, domain updates, and preference updates.
  useEffect(() => {
    if (!session || !activeMembership || !scopeKey) return;

    const prev = lastScopeAndPrefsRef.current;
    if (prev.scopeKey !== scopeKey || prev.prefsSig !== prefsSig) {
      pendingBaselineScopeRef.current = scopeKey;
      lastScopeAndPrefsRef.current = { scopeKey, prefsSig };
    }

    syncDeadlineReminders({ session, activeMembership });
  }, [
    userId,
    userEmail,
    membershipId,
    roleKey,
    membershipInst,
    membershipStatus,
    scopeKey,
    prefsSig,
    state.projectsByInstitution,
    state.officeHoursByInstitution,
    state.institutionsState,
    state.userProfiles,
    state.notificationPreferences,
    session,
    activeMembership,
    syncDeadlineReminders,
  ]);

  // 2. Non-replay toast baseline seeding + concise live-session toast notifications.
  useEffect(() => {
    if (!session || !activeMembership || !scopeKey) return;

    const scopedVisible = selectScopedNotifications(
      state.notifications,
      activeMembership,
      session
    );

    let seenSet = seenIdsByScopeRef.current.get(scopeKey);
    if (!seenSet) {
      seenSet = new Set();
      seenIdsByScopeRef.current.set(scopeKey, seenSet);
    }

    const openCandidateKeys = evaluateOpenReminderCandidateKeys({
      state,
      activeMembership,
      session,
    });
    const evaluated = evaluateDeadlineReminders({
      state,
      activeMembership,
      session,
      preferences: prefs,
    });
    const reminderSyncCheck = reconcileDeadlineRemindersState({
      notifications: state.notifications,
      evaluatedReminders: evaluated,
      openCandidateKeys,
      activeMembership,
      session,
    });
    const activitySyncCheck = reconcileActivityPreferencesState({
      notifications: state.notifications,
      notificationPreferences: state.notificationPreferences,
      activeMembership,
      session,
    });

    const isSyncSettled = !reminderSyncCheck.changed && !activitySyncCheck.changed;

    // During mount, scope switching, or preference changes, absorb current visible alerts silently.
    if (pendingBaselineScopeRef.current === scopeKey) {
      for (const item of scopedVisible) {
        if (item?.id) seenSet.add(item.id);
      }
      if (isSyncSettled) {
        pendingBaselineScopeRef.current = '';
      }
      return;
    }

    // Wait until reconciliation catches up before evaluating new unseen notifications.
    if (!isSyncSettled) return;

    const unseenUnread = scopedVisible.filter(
      (item) =>
        item?.id &&
        (item.status || 'active') === 'active' &&
        !item.read &&
        !seenSet.has(item.id)
    );

    for (const item of scopedVisible) {
      if (item?.id) seenSet.add(item.id);
    }

    if (unseenUnread.length === 0 || !prefs.inAppToasts) return;

    if (unseenUnread.length === 1) {
      const single = unseenUnread[0];
      showToast({
        type:
          single.kind === 'deadline_reminder' && single.severity === 'overdue'
            ? 'warning'
            : 'info',
        title: single.title,
        message: single.body,
      });
    } else {
      showToast({
        type: 'info',
        title: `${unseenUnread.length} new workspace notifications`,
        message: `${unseenUnread[0].title} and ${unseenUnread.length - 1} more in your notification drawer.`,
      });
    }
  }, [
    scopeKey,
    prefs,
    prefsSig,
    state,
    state.notifications,
    session,
    activeMembership,
    showToast,
  ]);

  return null;
}

