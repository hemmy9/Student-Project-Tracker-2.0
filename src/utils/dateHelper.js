const ISO_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

const SHORT_MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

function pad2(num) {
  return String(num).padStart(2, '0');
}

/**
 * Parses a Date object or calendar date string into a local-midnight Date
 * without allowing UTC date-only strings ('YYYY-MM-DD') to shift backwards in negative timezones.
 * Rejects invalid dates (e.g. '2026-02-30', 'not-a-date', NaN Date).
 */
export function parseCalendarDate(input) {
  if (!input) return null;

  if (input instanceof Date) {
    if (Number.isNaN(input.getTime())) return null;
    return new Date(input.getFullYear(), input.getMonth(), input.getDate(), 0, 0, 0, 0);
  }

  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (!trimmed) return null;

    const match = ISO_DATE_RE.exec(trimmed);
    if (match) {
      const year = Number(match[1]);
      const month = Number(match[2]);
      const day = Number(match[3]);
      if (month < 1 || month > 12 || day < 1 || day > 31) return null;

      const candidate = new Date(year, month - 1, day, 0, 0, 0, 0);
      if (
        candidate.getFullYear() !== year ||
        candidate.getMonth() !== month - 1 ||
        candidate.getDate() !== day
      ) {
        return null;
      }
      return candidate;
    }

    const parsed = new Date(trimmed);
    if (Number.isNaN(parsed.getTime())) return null;
    return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate(), 0, 0, 0, 0);
  }

  return null;
}

export const parseIsoDate = parseCalendarDate;

/**
 * Formats a Date (or valid calendar date string) as local calendar 'YYYY-MM-DD'.
 */
export function getCurrentIsoDate(referenceDate = new Date()) {
  const local = parseCalendarDate(referenceDate);
  if (!local) return '';
  return `${local.getFullYear()}-${pad2(local.getMonth() + 1)}-${pad2(local.getDate())}`;
}

/**
 * Formats a Date (or valid input) as 'YYYY-MM-DD HH:MM' in local time.
 */
export function getCurrentLocalTimestamp(referenceDate = new Date()) {
  if (!(referenceDate instanceof Date) || Number.isNaN(referenceDate.getTime())) {
    return '';
  }
  const iso = getCurrentIsoDate(referenceDate);
  return `${iso} ${pad2(referenceDate.getHours())}:${pad2(referenceDate.getMinutes())}`;
}

/**
 * Returns signed integer calendar days from fromDate to toDate (toDate - fromDate).
 * Uses UTC day numbers derived strictly from local Y/M/D so DST transitions never cause off-by-one errors.
 */
export function getDaysBetween(fromDate, toDate) {
  const fromLocal = parseCalendarDate(fromDate);
  const toLocal = parseCalendarDate(toDate);
  if (!fromLocal || !toLocal) return null;

  const fromUtcDay = Date.UTC(
    fromLocal.getFullYear(),
    fromLocal.getMonth(),
    fromLocal.getDate()
  );
  const toUtcDay = Date.UTC(
    toLocal.getFullYear(),
    toLocal.getMonth(),
    toLocal.getDate()
  );

  return Math.round((toUtcDay - fromUtcDay) / MS_PER_DAY);
}

/**
 * Returns signed calendar days from referenceDate (defaults to live local today) to dueDate.
 * Negative = past due; 0 = due today; positive = days remaining.
 */
export function getDaysUntilDeadline(dueDate, referenceDate = new Date()) {
  return getDaysBetween(referenceDate, dueDate);
}

/**
 * True only when dueDate is a valid calendar date strictly before referenceDate's local calendar day.
 */
export function isPastDeadline(dueDate, referenceDate = new Date()) {
  const diff = getDaysUntilDeadline(dueDate, referenceDate);
  return diff !== null && diff < 0;
}

/**
 * Formats a valid calendar date as '17 Nov 2026', falling back safely on invalid input.
 */
export function formatDisplayDate(input, fallback = '—') {
  const local = parseCalendarDate(input);
  if (!local) return fallback;
  return `${pad2(local.getDate())} ${SHORT_MONTHS[local.getMonth()]} ${local.getFullYear()}`;
}
