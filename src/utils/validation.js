const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const DOMAIN_REGEX = /^[a-z0-9]+([-.]{1}[a-z0-9]+)*\.[a-z]{2,}$/i;

export function validateEmail(value, label = 'Email address') {
  const trimmed = (value || '').trim();
  if (!trimmed) return `${label} is required.`;
  if (!EMAIL_REGEX.test(trimmed)) return `Enter a valid ${label.toLowerCase()}.`;
  return '';
}

export function validateRequired(value, label) {
  if (!value || !String(value).trim()) {
    return `${label} is required.`;
  }
  return '';
}

export function validateMinLength(value, min, label) {
  const trimmed = (value || '').trim();
  if (!trimmed) return `${label} is required.`;
  if (trimmed.length < min) {
    return `${label} must be at least ${min} characters.`;
  }
  return '';
}

export function validateDomain(value) {
  const trimmed = (value || '').trim().replace(/^https?:\/\//i, '').replace(/\/.*$/, '');
  if (!trimmed) return 'Official institutional domain is required.';
  if (!DOMAIN_REGEX.test(trimmed)) {
    return 'Enter a valid domain such as university.edu or institute.ac.uk.';
  }
  return '';
}

export function validatePassword(value) {
  if (!value) return 'Password is required.';
  if (value.length < 8) return 'Password must be at least 8 characters long.';
  if (!/[A-Z]/.test(value) || !/[0-9]/.test(value)) {
    return 'Include at least one uppercase letter and one number.';
  }
  return '';
}

export function validateConfirmPassword(password, confirmPassword) {
  if (!confirmPassword) return 'Please confirm your password.';
  if (password !== confirmPassword) return 'Passwords do not match.';
  return '';
}

export function validateInviteCode(value) {
  const trimmed = (value || '').trim().toUpperCase();
  if (!trimmed) return 'Invitation code is required.';
  if (!/^[A-Z0-9-]{6,24}$/.test(trimmed)) {
    return 'Enter a valid invitation code (e.g. SPT-UWB-2026).';
  }
  return '';
}

export function getPasswordStrength(password = '') {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (!password) return { score: 0, label: 'Enter a password' };
  if (score <= 1) return { score: 1, label: 'Weak' };
  if (score === 2) return { score: 2, label: 'Fair' };
  if (score === 3) return { score: 3, label: 'Strong' };
  return { score: 4, label: 'Very strong' };
}
