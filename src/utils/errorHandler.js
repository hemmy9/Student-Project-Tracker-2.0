export function normalizeAppError(err, fallback = 'An unexpected error occurred.') {
  if (!err) return fallback;

  const raw =
    typeof err === 'string'
      ? err
      : err.message || err.error_description || err.error || fallback;
  const lower = String(raw).toLowerCase();

  if (err?.name === 'AbortError' || lower.includes('aborted') || lower.includes('timeout')) {
    return 'Request timed out. Please check your connection and try again.';
  }
  if (lower.includes('failed to fetch') || lower.includes('networkerror') || lower.includes('network error')) {
    return 'Network error: unable to reach the server. Verify your internet connection and retry.';
  }
  if (lower.includes('invalid login credentials')) {
    return 'Invalid email or password. Double-check your credentials and try again.';
  }
  if (lower.includes('email not confirmed')) {
    return 'Your email address has not been confirmed yet. Check your inbox for the Supabase verification link.';
  }
  if (lower.includes('user already registered') || lower.includes('already been registered')) {
    return 'An account with this email address already exists. Sign in or reset your password instead.';
  }
  if (lower.includes('rate limit') || err?.status === 429) {
    return 'Too many requests in a short period. Please wait a moment before retrying.';
  }
  if (err?.status === 401 || lower.includes('jwt') || lower.includes('not authenticated')) {
    return 'Your session has expired or is unauthorized. Please sign in again.';
  }
  if (err?.status === 403 || lower.includes('row-level security') || lower.includes('permission denied')) {
    return 'Access denied by role or tenant security policy.';
  }
  if (err?.status === 503 || err?.code === 'MISSING_API_KEY') {
    return raw;
  }

  return String(raw) || fallback;
}

export function extractErrorMeta(err, fallback = 'An unexpected error occurred.') {
  const status = typeof err?.status === 'number' ? err.status : null;
  const code = err?.code ? String(err.code) : 'APP_ERROR';
  const message = normalizeAppError(err, fallback);
  const retryable =
    status === 429 ||
    status === 502 ||
    status === 503 ||
    status === 504 ||
    err?.name === 'AbortError' ||
    message.toLowerCase().includes('network error') ||
    message.toLowerCase().includes('timed out');

  return { message, code, status, retryable };
}
