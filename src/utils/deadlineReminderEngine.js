import { GRACE_POLYTECHNIC_BRAND } from '../config/gracePolytechnic';
import {
  formatDisplayDate,
  getCurrentIsoDate,
  getDaysUntilDeadline,
  parseCalendarDate,
} from './dateHelper';

export const DEFAULT_DEADLINE_LEAD_DAYS = 7;
export const DEFAULT_OFFICE_HOUR_LEAD_DAYS = 2;
export const ALLOWED_LEAD_WINDOW_DAYS = [3, 7, 14];
export const ACTIVITY_CATEGORIES = ['Tasks', 'Documents', 'Journals', 'Messages', 'Governance'];

export const DEFAULT_NOTIFICATION_PREFERENCES = {
  remindersEnabled: true,
  leadWindowDays: DEFAULT_DEADLINE_LEAD_DAYS,
  categories: {
    tasks: true,
    milestones: true,
    overdue: true,
    officeHours: true,
    projectDeadlines: true,
  },
  activityEnabled: true,
  activityCategories: {
    Tasks: true,
    Documents: true,
    Journals: true,
    Messages: true,
    Governance: true,
  },
  inAppToasts: true,
  emailEnabled: false,
  pushEnabled: false,
  updatedAt: '',
};

const GRACE_INSTITUTION_NAME = GRACE_POLYTECHNIC_BRAND.institutionName;
const LEGACY_WESTBRIDGE_NAME = 'University of Westbridge';
const VALID_PORTAL_ROLES = new Set(['student', 'supervisor', 'institution_admin']);
const SEVERITY_RANK = { overdue: 0, due_today: 1, upcoming: 2 };

export function canonicalizeInstitutionLabel(institutionName) {
  if (typeof institutionName !== 'string') return '';
  const trimmed = institutionName.trim();
  if (!trimmed) return '';
  return trimmed === LEGACY_WESTBRIDGE_NAME ? GRACE_INSTITUTION_NAME : trimmed;
}

export function resolveScopedInstitution(activeMembership, session = null) {
  const raw =
    typeof activeMembership?.institutionName === 'string'
      ? activeMembership.institutionName.trim()
      : '';
  if (raw) {
    return canonicalizeInstitutionLabel(raw);
  }
  const email = String(session?.email || '').trim().toLowerCase();
  if (
    activeMembership &&
    (email.endsWith(`@${GRACE_POLYTECHNIC_BRAND.officialDomain}`) ||
      email.endsWith('@westbridge.edu') ||
      VALID_PORTAL_ROLES.has(activeMembership.roleKey))
  ) {
    return GRACE_INSTITUTION_NAME;
  }
  return '';
}

export function resolveScopedCollectionKey(collection, institutionName) {
  if (!collection || typeof collection !== 'object') return '';
  const trimmed = typeof institutionName === 'string' ? institutionName.trim() : '';
  if (!trimmed) return '';
  const canonical = canonicalizeInstitutionLabel(trimmed);
  if (Object.prototype.hasOwnProperty.call(collection, canonical)) return canonical;
  if (Object.prototype.hasOwnProperty.call(collection, trimmed)) return trimmed;
  return '';
}

export function buildNotificationPreferenceKey(email, roleKey, institutionName) {
  const cleanEmail = String(email || '').trim().toLowerCase();
  const cleanRole = String(roleKey || '').trim();
  const cleanInst = canonicalizeInstitutionLabel(institutionName || '');
  if (!cleanEmail || !VALID_PORTAL_ROLES.has(cleanRole) || !cleanInst) return '';
  return `${cleanEmail}::${cleanRole}::${cleanInst}`;
}

export function normalizeLeadWindowDays(value) {
  const num = Number(value);
  return ALLOWED_LEAD_WINDOW_DAYS.includes(num) ? num : DEFAULT_DEADLINE_LEAD_DAYS;
}

export function sanitizeNotificationPreferences(raw) {
  const src = raw && typeof raw === 'object' ? raw : {};
  const rawCats = src.categories && typeof src.categories === 'object' ? src.categories : {};
  const rawActCats =
    src.activityCategories && typeof src.activityCategories === 'object'
      ? src.activityCategories
      : {};

  return {
    remindersEnabled:
      typeof src.remindersEnabled === 'boolean'
        ? src.remindersEnabled
        : DEFAULT_NOTIFICATION_PREFERENCES.remindersEnabled,
    leadWindowDays: normalizeLeadWindowDays(src.leadWindowDays),
    categories: {
      tasks:
        typeof rawCats.tasks === 'boolean'
          ? rawCats.tasks
          : DEFAULT_NOTIFICATION_PREFERENCES.categories.tasks,
      milestones:
        typeof rawCats.milestones === 'boolean'
          ? rawCats.milestones
          : DEFAULT_NOTIFICATION_PREFERENCES.categories.milestones,
      overdue:
        typeof rawCats.overdue === 'boolean'
          ? rawCats.overdue
          : DEFAULT_NOTIFICATION_PREFERENCES.categories.overdue,
      officeHours:
        typeof rawCats.officeHours === 'boolean'
          ? rawCats.officeHours
          : DEFAULT_NOTIFICATION_PREFERENCES.categories.officeHours,
      projectDeadlines:
        typeof rawCats.projectDeadlines === 'boolean'
          ? rawCats.projectDeadlines
          : DEFAULT_NOTIFICATION_PREFERENCES.categories.projectDeadlines,
    },
    activityEnabled:
      typeof src.activityEnabled === 'boolean'
        ? src.activityEnabled
        : DEFAULT_NOTIFICATION_PREFERENCES.activityEnabled,
    activityCategories: {
      Tasks:
        typeof rawActCats.Tasks === 'boolean'
          ? rawActCats.Tasks
          : DEFAULT_NOTIFICATION_PREFERENCES.activityCategories.Tasks,
      Documents:
        typeof rawActCats.Documents === 'boolean'
          ? rawActCats.Documents
          : DEFAULT_NOTIFICATION_PREFERENCES.activityCategories.Documents,
      Journals:
        typeof rawActCats.Journals === 'boolean'
          ? rawActCats.Journals
          : DEFAULT_NOTIFICATION_PREFERENCES.activityCategories.Journals,
      Messages:
        typeof rawActCats.Messages === 'boolean'
          ? rawActCats.Messages
          : DEFAULT_NOTIFICATION_PREFERENCES.activityCategories.Messages,
      Governance:
        typeof rawActCats.Governance === 'boolean'
          ? rawActCats.Governance
          : DEFAULT_NOTIFICATION_PREFERENCES.activityCategories.Governance,
    },
    inAppToasts:
      typeof src.inAppToasts === 'boolean'
        ? src.inAppToasts
        : DEFAULT_NOTIFICATION_PREFERENCES.inAppToasts,
    // Locked inactive until Stage D live backend delivery
    emailEnabled: false,
    pushEnabled: false,
    updatedAt: typeof src.updatedAt === 'string' ? src.updatedAt.slice(0, 64) : '',
  };
}

export function resolveNotificationPreferences(
  notificationPreferencesMap,
  activeMembership,
  session = null
) {
  const institutionName = resolveScopedInstitution(activeMembership, session);
  const scopeKey = buildNotificationPreferenceKey(
    session?.email,
    activeMembership?.roleKey,
    institutionName
  );
  const rawEntry =
    scopeKey &&
    notificationPreferencesMap &&
    typeof notificationPreferencesMap === 'object'
      ? notificationPreferencesMap[scopeKey]
      : null;

  return {
    ...sanitizeNotificationPreferences(rawEntry),
    scopeKey,
  };
}

function isApprovedMembership(activeMembership) {
  return String(activeMembership?.status || '').trim().toLowerCase() === 'approved';
}

function classifyDeadline(daysDelta, leadDays) {
  if (daysDelta === null || daysDelta === undefined) return null;
  if (daysDelta < 0) return 'overdue';
  if (daysDelta === 0) return 'due_today';
  if (daysDelta <= leadDays) return 'upcoming';
  return null;
}

function formatTimingPhrase(daysDelta) {
  if (daysDelta < 0) {
    const abs = Math.abs(daysDelta);
    return `${abs} ${abs === 1 ? 'day' : 'days'} overdue`;
  }
  if (daysDelta === 0) return 'due today';
  return `due in ${daysDelta} ${daysDelta === 1 ? 'day' : 'days'}`;
}

function buildReminderKey(roleKey, institutionName, recipientEmail, entityType, entityId) {
  return `deadline::${roleKey}::${institutionName}::${recipientEmail}::${entityType}::${entityId}`;
}

/**
 * Computes keys of all underlying entities in the active scope that remain genuinely open
 * (uncompleted, unapproved, confirmed future/today office hour within fixed 2-day cap, or
 * incomplete date-bound institutional project), irrespective of user reminder toggles or
 * 3/7/14-day window selection. Used strictly to distinguish 'suppressed' vs 'resolved'.
 */
export function evaluateOpenReminderCandidateKeys({
  state,
  activeMembership,
  session,
  referenceDate = new Date(),
  officeHourLeadDays = DEFAULT_OFFICE_HOUR_LEAD_DAYS,
} = {}) {
  const candidateKeys = new Set();
  if (!state || !activeMembership || !session) return candidateKeys;

  const roleKey = activeMembership.roleKey;
  if (!VALID_PORTAL_ROLES.has(roleKey) || !isApprovedMembership(activeMembership)) {
    return candidateKeys;
  }

  const institutionName = resolveScopedInstitution(activeMembership, session);
  const recipientEmail = String(session.email || '').trim().toLowerCase();
  const todayIso = getCurrentIsoDate(referenceDate);
  if (!institutionName || !recipientEmail || !todayIso) return candidateKeys;

  if (roleKey === 'student') {
    const projectKey = resolveScopedCollectionKey(state.projectsByInstitution, institutionName);
    const project = projectKey ? state.projectsByInstitution[projectKey] : null;
    if (project) {
      for (const task of project.tasks || []) {
        if (task.completed || task.status === 'done') continue;
        if (getDaysUntilDeadline(task.dueDate, referenceDate) === null) continue;
        candidateKeys.add(buildReminderKey(roleKey, institutionName, recipientEmail, 'task', task.id));
      }
      for (const ms of project.milestones || []) {
        if (ms.status === 'Approved') continue;
        if (getDaysUntilDeadline(ms.dueDate, referenceDate) === null) continue;
        candidateKeys.add(
          buildReminderKey(roleKey, institutionName, recipientEmail, 'milestone', ms.id)
        );
      }
    }

    const officeKey = resolveScopedCollectionKey(state.officeHoursByInstitution, institutionName);
    const bookings = (officeKey && state.officeHoursByInstitution[officeKey]?.bookings) || [];
    for (const booking of bookings) {
      if (booking.status !== 'Confirmed') continue;
      const bookingEmail = String(booking.studentEmail || '').trim().toLowerCase();
      const matchesStudent =
        (bookingEmail && bookingEmail === recipientEmail) ||
        (session.fullName && booking.studentName === session.fullName) ||
        (!bookingEmail && !booking.studentName);
      if (!matchesStudent) continue;
      const daysDelta = getDaysUntilDeadline(booking.meetingDate, referenceDate);
      if (daysDelta === null || daysDelta < 0 || daysDelta > officeHourLeadDays) continue;
      candidateKeys.add(
        buildReminderKey(roleKey, institutionName, recipientEmail, 'office_hour', booking.id)
      );
    }
  } else if (roleKey === 'supervisor') {
    const projectKey = resolveScopedCollectionKey(state.projectsByInstitution, institutionName);
    const project = projectKey ? state.projectsByInstitution[projectKey] : null;
    if (project) {
      for (const ms of project.milestones || []) {
        if (ms.status === 'Approved') continue;
        if (getDaysUntilDeadline(ms.dueDate, referenceDate) === null) continue;
        candidateKeys.add(
          buildReminderKey(roleKey, institutionName, recipientEmail, 'milestone', ms.id)
        );
      }
    }

    const officeKey = resolveScopedCollectionKey(state.officeHoursByInstitution, institutionName);
    const bookings = (officeKey && state.officeHoursByInstitution[officeKey]?.bookings) || [];
    for (const booking of bookings) {
      if (booking.status !== 'Confirmed') continue;
      const daysDelta = getDaysUntilDeadline(booking.meetingDate, referenceDate);
      if (daysDelta === null || daysDelta < 0 || daysDelta > officeHourLeadDays) continue;
      candidateKeys.add(
        buildReminderKey(roleKey, institutionName, recipientEmail, 'office_hour', booking.id)
      );
    }
  } else if (roleKey === 'institution_admin') {
    const instKey = resolveScopedCollectionKey(state.institutionsState, institutionName);
    const inst = instKey ? state.institutionsState[instKey] : null;
    for (const proj of inst?.projects || []) {
      if (!proj?.dueDate || !parseCalendarDate(proj.dueDate)) continue;
      if (Number(proj.progress) >= 100 || proj.status === 'Completed') continue;
      candidateKeys.add(
        buildReminderKey(roleKey, institutionName, recipientEmail, 'institution_project', proj.id)
      );
    }
  }

  return candidateKeys;
}

/**
 * Pure deadline evaluator scoped strictly to the active membership (role, institution, user)
 * and evaluated against a single supplied or live referenceDate, honoring scoped preferences.
 *
 * Approval SLA note:
 * Neither gracePolytechnic.js nor DemoAppStateContext membershipRequests defines an approval SLA
 * day threshold. Approval SLA reminders remain excluded rather than invented.
 */
export function evaluateDeadlineReminders({
  state,
  activeMembership,
  session,
  preferences = null,
  referenceDate = new Date(),
  leadDays,
  officeHourLeadDays = DEFAULT_OFFICE_HOUR_LEAD_DAYS,
} = {}) {
  if (!state || !activeMembership || !session) return [];
  const roleKey = activeMembership.roleKey;
  if (!VALID_PORTAL_ROLES.has(roleKey)) return [];
  if (!isApprovedMembership(activeMembership)) return [];

  const institutionName = resolveScopedInstitution(activeMembership, session);
  const recipientEmail = String(session.email || '').trim().toLowerCase();
  const todayIso = getCurrentIsoDate(referenceDate);
  if (!institutionName || !recipientEmail || !todayIso) return [];

  const prefs = preferences
    ? sanitizeNotificationPreferences(preferences)
    : resolveNotificationPreferences(state.notificationPreferences, activeMembership, session);

  if (!prefs.remindersEnabled) return [];

  const effectiveLeadDays =
    typeof leadDays === 'number' && !Number.isNaN(leadDays)
      ? leadDays
      : prefs.leadWindowDays;
  const allowOverdue = prefs.categories.overdue;
  const reminders = [];

  if (roleKey === 'student') {
    const projectKey = resolveScopedCollectionKey(state.projectsByInstitution, institutionName);
    const project = projectKey ? state.projectsByInstitution[projectKey] : null;

    if (project) {
      if (prefs.categories.tasks) {
        for (const task of project.tasks || []) {
          if (task.completed || task.status === 'done') continue;
          const daysDelta = getDaysUntilDeadline(task.dueDate, referenceDate);
          const severity = classifyDeadline(daysDelta, effectiveLeadDays);
          if (!severity) continue;
          if (severity === 'overdue' && !allowOverdue) continue;

          const timing = formatTimingPhrase(daysDelta);
          const prefix =
            severity === 'overdue'
              ? 'Overdue task'
              : severity === 'due_today'
                ? 'Task due today'
                : 'Upcoming task';

          reminders.push({
            reminderKey: buildReminderKey(roleKey, institutionName, recipientEmail, 'task', task.id),
            roleKey,
            recipientEmail,
            institutionName,
            category: 'task_deadline',
            entityType: 'task',
            entityId: task.id,
            severity,
            dueDate: task.dueDate,
            daysDelta,
            title: `${prefix}: ${task.title}`,
            body: `Due ${formatDisplayDate(task.dueDate)} (${timing}) · Priority: ${task.priority || 'Medium'}.`,
            targetPath: '/student/tasks',
          });
        }
      }

      if (prefs.categories.milestones) {
        for (const ms of project.milestones || []) {
          if (ms.status === 'Approved') continue;
          const daysDelta = getDaysUntilDeadline(ms.dueDate, referenceDate);
          const severity = classifyDeadline(daysDelta, effectiveLeadDays);
          if (!severity) continue;
          if (severity === 'overdue' && !allowOverdue) continue;

          const timing = formatTimingPhrase(daysDelta);
          const prefix =
            severity === 'overdue'
              ? 'Overdue milestone'
              : severity === 'due_today'
                ? 'Milestone due today'
                : 'Upcoming milestone';

          reminders.push({
            reminderKey: buildReminderKey(
              roleKey,
              institutionName,
              recipientEmail,
              'milestone',
              ms.id
            ),
            roleKey,
            recipientEmail,
            institutionName,
            category: 'milestone_deadline',
            entityType: 'milestone',
            entityId: ms.id,
            severity,
            dueDate: ms.dueDate,
            daysDelta,
            title: `${prefix}: ${ms.title}`,
            body: `Phase ${ms.phaseNumber || ''} due ${formatDisplayDate(ms.dueDate)} (${timing}) · Status: ${ms.status}.`.trim(),
            targetPath: '/student/milestones',
          });
        }
      }
    }

    if (prefs.categories.officeHours) {
      const officeKey = resolveScopedCollectionKey(state.officeHoursByInstitution, institutionName);
      const bookings = (officeKey && state.officeHoursByInstitution[officeKey]?.bookings) || [];
      for (const booking of bookings) {
        if (booking.status !== 'Confirmed') continue;
        const bookingEmail = String(booking.studentEmail || '').trim().toLowerCase();
        const matchesStudent =
          (bookingEmail && bookingEmail === recipientEmail) ||
          (session.fullName && booking.studentName === session.fullName) ||
          (!bookingEmail && !booking.studentName);
        if (!matchesStudent) continue;

        const daysDelta = getDaysUntilDeadline(booking.meetingDate, referenceDate);
        if (daysDelta === null || daysDelta < 0 || daysDelta > officeHourLeadDays) continue;

        const severity = daysDelta === 0 ? 'due_today' : 'upcoming';
        const timing =
          daysDelta === 0
            ? 'today'
            : `in ${daysDelta} ${daysDelta === 1 ? 'day' : 'days'}`;

        reminders.push({
          reminderKey: buildReminderKey(
            roleKey,
            institutionName,
            recipientEmail,
            'office_hour',
            booking.id
          ),
          roleKey,
          recipientEmail,
          institutionName,
          category: 'office_hour',
          entityType: 'office_hour',
          entityId: booking.id,
          severity,
          dueDate: booking.meetingDate,
          daysDelta,
          title: `Confirmed office hour ${timing}: ${booking.supervisorName || 'Supervisor'}`,
          body: `${formatDisplayDate(booking.meetingDate)} (${booking.timeRange || 'Scheduled'}) · ${booking.topic || 'Supervision consultation'}.`,
          targetPath: '/student/office-hours',
        });
      }
    }
  } else if (roleKey === 'supervisor') {
    const projectKey = resolveScopedCollectionKey(state.projectsByInstitution, institutionName);
    const project = projectKey ? state.projectsByInstitution[projectKey] : null;

    if (project && prefs.categories.milestones) {
      for (const ms of project.milestones || []) {
        if (ms.status === 'Approved') continue;
        const daysDelta = getDaysUntilDeadline(ms.dueDate, referenceDate);
        const severity = classifyDeadline(daysDelta, effectiveLeadDays);
        if (!severity) continue;
        if (severity === 'overdue' && !allowOverdue) continue;

        const timing = formatTimingPhrase(daysDelta);
        const prefix =
          severity === 'overdue'
            ? 'Milestone overdue'
            : severity === 'due_today'
              ? 'Milestone due today'
              : 'Upcoming milestone';

        reminders.push({
          reminderKey: buildReminderKey(
            roleKey,
            institutionName,
            recipientEmail,
            'milestone',
            ms.id
          ),
          roleKey,
          recipientEmail,
          institutionName,
          category: 'milestone_deadline',
          entityType: 'milestone',
          entityId: ms.id,
          severity,
          dueDate: ms.dueDate,
          daysDelta,
          title: `${prefix} (${project.studentName}): ${ms.title}`,
          body: `Due ${formatDisplayDate(ms.dueDate)} (${timing}) · Current status: ${ms.status}.`,
          targetPath: '/supervisor/milestones',
        });
      }
    }

    if (prefs.categories.officeHours) {
      const officeKey = resolveScopedCollectionKey(state.officeHoursByInstitution, institutionName);
      const bookings = (officeKey && state.officeHoursByInstitution[officeKey]?.bookings) || [];
      for (const booking of bookings) {
        if (booking.status !== 'Confirmed') continue;
        const daysDelta = getDaysUntilDeadline(booking.meetingDate, referenceDate);
        if (daysDelta === null || daysDelta < 0 || daysDelta > officeHourLeadDays) continue;

        const severity = daysDelta === 0 ? 'due_today' : 'upcoming';
        const timing =
          daysDelta === 0
            ? 'today'
            : `in ${daysDelta} ${daysDelta === 1 ? 'day' : 'days'}`;

        reminders.push({
          reminderKey: buildReminderKey(
            roleKey,
            institutionName,
            recipientEmail,
            'office_hour',
            booking.id
          ),
          roleKey,
          recipientEmail,
          institutionName,
          category: 'office_hour',
          entityType: 'office_hour',
          entityId: booking.id,
          severity,
          dueDate: booking.meetingDate,
          daysDelta,
          title: `Confirmed session ${timing}: ${booking.studentName || 'Student'}`,
          body: `${formatDisplayDate(booking.meetingDate)} (${booking.timeRange || 'Scheduled'}) · ${booking.topic || 'Office hours consultation'}.`,
          targetPath: '/supervisor/office-hours',
        });
      }
    }
  } else if (roleKey === 'institution_admin') {
    // Only surface explicit date-bound institutional project deadlines if enabled;
    // do not synthesize approval SLA reminders when no SLA policy is configured.
    if (prefs.categories.projectDeadlines) {
      const instKey = resolveScopedCollectionKey(state.institutionsState, institutionName);
      const inst = instKey ? state.institutionsState[instKey] : null;
      for (const proj of inst?.projects || []) {
        if (!proj?.dueDate || !parseCalendarDate(proj.dueDate)) continue;
        if (Number(proj.progress) >= 100 || proj.status === 'Completed') continue;

        const daysDelta = getDaysUntilDeadline(proj.dueDate, referenceDate);
        const severity = classifyDeadline(daysDelta, effectiveLeadDays);
        if (!severity) continue;
        if (severity === 'overdue' && !allowOverdue) continue;

        const timing = formatTimingPhrase(daysDelta);
        const prefix =
          severity === 'overdue'
            ? 'Overdue institutional project'
            : severity === 'due_today'
              ? 'Institutional project due today'
              : 'Upcoming institutional project';

        reminders.push({
          reminderKey: buildReminderKey(
            roleKey,
            institutionName,
            recipientEmail,
            'institution_project',
            proj.id
          ),
          roleKey,
          recipientEmail,
          institutionName,
          category: 'project_deadline',
          entityType: 'institution_project',
          entityId: proj.id,
          severity,
          dueDate: proj.dueDate,
          daysDelta,
          title: `${prefix}: ${proj.code || proj.title}`,
          body: `${proj.studentName || 'Student'} · Due ${formatDisplayDate(proj.dueDate)} (${timing}).`,
          targetPath: '/admin/projects',
        });
      }
    }
  }

  return reminders.sort((a, b) => {
    const rankDiff = (SEVERITY_RANK[a.severity] ?? 9) - (SEVERITY_RANK[b.severity] ?? 9);
    if (rankDiff !== 0) return rankDiff;
    const deltaDiff = (a.daysDelta ?? 0) - (b.daysDelta ?? 0);
    if (deltaDiff !== 0) return deltaDiff;
    return a.reminderKey.localeCompare(b.reminderKey);
  });
}

function isSameScopeReminder(item, roleKey, institutionName, recipientEmail) {
  if (!item || item.kind !== 'deadline_reminder') return false;
  if (item.roleKey !== roleKey) return false;
  if (canonicalizeInstitutionLabel(item.institutionName || '') !== institutionName) return false;
  if (String(item.recipientEmail || '').trim().toLowerCase() !== recipientEmail) return false;
  return true;
}

/**
 * Single authoritative reconciliation function for deadline reminders.
 * - Preserves all existing non-deadline notifications and other-scope reminders untouched.
 * - Deduplicates by reminderKey (id: `n-${reminderKey}`).
 * - Suppresses previously active reminders that are still open in domain state when preferences
 *   disable them or narrow the lead window (preserving read state & history).
 * - Never creates records for open entities that have never qualified.
 * - Never transitions already-resolved reminders back to suppressed on preference changes.
 * - Resolves active or suppressed reminders when the underlying entity completes/approves/cancels.
 * - Reactivates suppressed reminders (preserving read state) and reopens resolved ones if reopened.
 * - Returns `changed: false` and the original array reference when already in sync.
 */
export function reconcileDeadlineRemindersState({
  notifications = [],
  evaluatedReminders = [],
  openCandidateKeys = null,
  activeMembership,
  session,
  referenceDate = new Date(),
} = {}) {
  const sourceList = Array.isArray(notifications) ? notifications : [];
  if (!activeMembership || !session) {
    return {
      notifications: sourceList,
      changed: false,
      generatedCount: 0,
      resolvedCount: 0,
      suppressedCount: 0,
      reactivatedCount: 0,
      reopenedCount: 0,
    };
  }

  const roleKey = activeMembership.roleKey;
  if (!VALID_PORTAL_ROLES.has(roleKey) || !isApprovedMembership(activeMembership)) {
    return {
      notifications: sourceList,
      changed: false,
      generatedCount: 0,
      resolvedCount: 0,
      suppressedCount: 0,
      reactivatedCount: 0,
      reopenedCount: 0,
    };
  }

  const institutionName = resolveScopedInstitution(activeMembership, session);
  const recipientEmail = String(session.email || '').trim().toLowerCase();
  const todayIso = getCurrentIsoDate(referenceDate);
  if (!institutionName || !recipientEmail || !todayIso) {
    return {
      notifications: sourceList,
      changed: false,
      generatedCount: 0,
      resolvedCount: 0,
      suppressedCount: 0,
      reactivatedCount: 0,
      reopenedCount: 0,
    };
  }

  const desiredByKey = new Map();
  for (const rem of evaluatedReminders || []) {
    if (rem?.reminderKey) {
      desiredByKey.set(rem.reminderKey, rem);
    }
  }

  const candidateSet = openCandidateKeys instanceof Set ? openCandidateKeys : null;
  const seenKeys = new Set();
  let changed = false;
  let generatedCount = 0;
  let resolvedCount = 0;
  let suppressedCount = 0;
  let reactivatedCount = 0;
  let reopenedCount = 0;

  const updatedExisting = [];
  for (const item of sourceList) {
    if (!isSameScopeReminder(item, roleKey, institutionName, recipientEmail)) {
      updatedExisting.push(item);
      continue;
    }

    const key = item.reminderKey;
    if (!key) {
      updatedExisting.push(item);
      continue;
    }

    if (seenKeys.has(key)) {
      changed = true;
      continue;
    }
    seenKeys.add(key);

    const desired = desiredByKey.get(key);
    const currentStatus = item.status || 'active';

    if (!desired) {
      // Never mutate already-resolved reminders on preference changes
      if (currentStatus === 'resolved') {
        updatedExisting.push(item);
        continue;
      }

      const stillOpenInDomain = candidateSet ? candidateSet.has(key) : false;

      if (stillOpenInDomain) {
        // Underlying entity still open, excluded by user preferences -> suppress without deleting
        if (currentStatus === 'active') {
          changed = true;
          suppressedCount += 1;
          updatedExisting.push({
            ...item,
            status: 'suppressed',
            suppressedAt: todayIso,
          });
        } else {
          updatedExisting.push(item);
        }
      } else {
        // Underlying entity genuinely completed / approved / cancelled / past -> resolve
        changed = true;
        resolvedCount += 1;
        const resolvedNext = {
          ...item,
          status: 'resolved',
          resolvedAt: todayIso,
        };
        delete resolvedNext.suppressedAt;
        updatedExisting.push(resolvedNext);
      }
      continue;
    }

    // Item IS currently desired
    if (currentStatus === 'resolved') {
      changed = true;
      reopenedCount += 1;
      const next = {
        ...item,
        status: 'active',
        read: false,
        severity: desired.severity,
        dueDate: desired.dueDate,
        daysDelta: desired.daysDelta,
        title: desired.title,
        body: desired.body,
        targetPath: desired.targetPath,
        time: 'Just now',
      };
      delete next.resolvedAt;
      delete next.suppressedAt;
      updatedExisting.push(next);
      continue;
    }

    if (currentStatus === 'suppressed') {
      changed = true;
      reactivatedCount += 1;
      const next = {
        ...item,
        status: 'active',
        severity: desired.severity,
        dueDate: desired.dueDate,
        daysDelta: desired.daysDelta,
        title: desired.title,
        body: desired.body,
        targetPath: desired.targetPath,
      };
      delete next.suppressedAt;
      updatedExisting.push(next);
      continue;
    }

    const needsFieldUpdate =
      item.severity !== desired.severity ||
      item.dueDate !== desired.dueDate ||
      item.daysDelta !== desired.daysDelta ||
      item.title !== desired.title ||
      item.body !== desired.body ||
      item.targetPath !== desired.targetPath;

    if (needsFieldUpdate) {
      changed = true;
      updatedExisting.push({
        ...item,
        status: 'active',
        severity: desired.severity,
        dueDate: desired.dueDate,
        daysDelta: desired.daysDelta,
        title: desired.title,
        body: desired.body,
        targetPath: desired.targetPath,
      });
    } else {
      updatedExisting.push(item);
    }
  }

  const newEntries = [];
  for (const desired of evaluatedReminders || []) {
    if (!desired?.reminderKey || seenKeys.has(desired.reminderKey)) continue;
    seenKeys.add(desired.reminderKey);
    changed = true;
    generatedCount += 1;
    newEntries.push({
      id: `n-${desired.reminderKey}`,
      roleKey: desired.roleKey,
      recipientEmail: desired.recipientEmail,
      institutionName: desired.institutionName,
      kind: 'deadline_reminder',
      category: desired.category,
      reminderKey: desired.reminderKey,
      entityType: desired.entityType,
      entityId: desired.entityId,
      severity: desired.severity,
      status: 'active',
      dueDate: desired.dueDate,
      daysDelta: desired.daysDelta,
      title: desired.title,
      body: desired.body,
      time: 'Just now',
      createdAtIso: todayIso,
      read: false,
      targetPath: desired.targetPath,
    });
  }

  if (!changed) {
    return {
      notifications: sourceList,
      changed: false,
      generatedCount: 0,
      resolvedCount: 0,
      suppressedCount: 0,
      reactivatedCount: 0,
      reopenedCount: 0,
    };
  }

  return {
    notifications: [...newEntries, ...updatedExisting],
    changed: true,
    generatedCount,
    resolvedCount,
    suppressedCount,
    reactivatedCount,
    reopenedCount,
  };
}

/**
 * Reconciles active/suppressed status on scoped `kind === 'activity'` notifications according to the
 * active user's activity preferences without touching `kind === 'system'` or other tenants/users.
 */
export function reconcileActivityPreferencesState({
  notifications = [],
  notificationPreferences = null,
  activeMembership,
  session,
  referenceDate = new Date(),
} = {}) {
  const sourceList = Array.isArray(notifications) ? notifications : [];
  if (!activeMembership || !session) {
    return { notifications: sourceList, changed: false };
  }

  const roleKey = activeMembership.roleKey;
  if (!VALID_PORTAL_ROLES.has(roleKey) || !isApprovedMembership(activeMembership)) {
    return { notifications: sourceList, changed: false };
  }

  const institutionName = resolveScopedInstitution(activeMembership, session);
  const recipientEmail = String(session.email || '').trim().toLowerCase();
  const todayIso = getCurrentIsoDate(referenceDate);
  if (!institutionName || !recipientEmail || !todayIso) {
    return { notifications: sourceList, changed: false };
  }

  const prefs = resolveNotificationPreferences(
    notificationPreferences,
    activeMembership,
    session
  );
  let changed = false;

  const nextList = sourceList.map((item) => {
    if (!item || item.kind !== 'activity' || item.roleKey !== roleKey) return item;

    if (
      item.institutionName &&
      canonicalizeInstitutionLabel(item.institutionName) !== institutionName
    ) {
      return item;
    }
    if (
      item.recipientEmail &&
      String(item.recipientEmail).trim().toLowerCase() !== recipientEmail
    ) {
      return item;
    }

    const cat = item.category;
    const isAllowed =
      prefs.activityEnabled &&
      (!cat ||
        !Object.prototype.hasOwnProperty.call(prefs.activityCategories, cat) ||
        prefs.activityCategories[cat]);

    const currentStatus = item.status || 'active';

    if (!isAllowed && currentStatus === 'active') {
      changed = true;
      return {
        ...item,
        status: 'suppressed',
        suppressedAt: todayIso,
      };
    }

    if (isAllowed && currentStatus === 'suppressed') {
      changed = true;
      const next = {
        ...item,
        status: 'active',
      };
      delete next.suppressedAt;
      return next;
    }

    return item;
  });

  if (!changed) {
    return { notifications: sourceList, changed: false };
  }

  return { notifications: nextList, changed: true };
}

export function selectScopedNotifications(notifications = [], activeMembership, session = null) {
  if (!Array.isArray(notifications) || !activeMembership) return [];
  const roleKey = activeMembership.roleKey;
  if (!VALID_PORTAL_ROLES.has(roleKey)) return [];

  const activeInst = resolveScopedInstitution(activeMembership, session);
  const activeEmail = String(session?.email || '').trim().toLowerCase();

  return notifications.filter((item) => {
    if (!item || item.roleKey !== roleKey) return false;
    if (item.status === 'suppressed') return false;
    if (
      item.institutionName &&
      activeInst &&
      canonicalizeInstitutionLabel(item.institutionName) !== activeInst
    ) {
      return false;
    }
    if (
      item.recipientEmail &&
      activeEmail &&
      String(item.recipientEmail).trim().toLowerCase() !== activeEmail
    ) {
      return false;
    }
    return true;
  });
}

export function selectUnreadNotificationCount(notifications = [], activeMembership, session = null) {
  return selectScopedNotifications(notifications, activeMembership, session).filter(
    (item) => (item.status || 'active') === 'active' && !item.read
  ).length;
}
