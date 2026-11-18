import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  Info,
  KeyRound,
  LockKeyhole,
  MailCheck,
  ShieldCheck,
} from 'lucide-react';
import { GRACE_POLYTECHNIC_BRAND } from '../../config/gracePolytechnic';
import { useDemoSession } from '../../context/DemoSessionContext';
import { useToast } from '../../context/ToastContext';
import { DEMO_ACCOUNTS, verifyDemoCredentials } from '../../data/demoAccounts';
import { useSupabaseService } from '../../hooks/useSupabaseService';
import { normalizeAppError } from '../../utils/errorHandler';
import { getDashboardPathForRole } from '../../utils/roleRouting';
import { validateEmail, validateRequired } from '../../utils/validation';
import BrandLogo from '../brand/BrandLogo';
import PublicFooter from '../layout/PublicFooter';
import PublicHeader from '../layout/PublicHeader';

const PORTAL_THEMES = {
  student: {
    badgeColor: 'text-[#3B82F6]',
    accentBorder: 'border-t-[#2563EB]',
    iconBg: 'bg-blue-500/12 text-[#3B82F6] border-blue-500/25',
    primaryBtn:
      'bg-[#2563EB] hover:bg-[#1D4ED8] focus-visible:ring-2 focus-visible:ring-[#3B82F6]',
    glowStyle:
      'radial-gradient(circle at 20% 0%, rgba(37, 99, 235, 0.16), transparent 55%)',
    panelBorder: 'border-blue-500/25',
  },
  supervisor: {
    badgeColor: 'text-[#14B8A6]',
    accentBorder: 'border-t-[#0D9488]',
    iconBg: 'bg-teal-500/12 text-[#14B8A6] border-teal-500/25',
    primaryBtn:
      'bg-[#0D9488] hover:bg-[#0F766E] focus-visible:ring-2 focus-visible:ring-[#14B8A6]',
    glowStyle:
      'radial-gradient(circle at 20% 0%, rgba(20, 184, 166, 0.16), transparent 55%)',
    panelBorder: 'border-teal-500/25',
  },
  admin: {
    badgeColor: 'text-[#8B5CF6]',
    accentBorder: 'border-t-[#6366F1]',
    iconBg: 'bg-violet-500/12 text-[#8B5CF6] border-violet-500/25',
    primaryBtn:
      'bg-[#6366F1] hover:bg-[#4F46E5] focus-visible:ring-2 focus-visible:ring-[#8B5CF6]',
    glowStyle:
      'radial-gradient(circle at 20% 0%, rgba(139, 92, 246, 0.18), transparent 55%)',
    panelBorder: 'border-violet-500/25',
  },
};

const PORTAL_SWITCHER = [
  { roleKey: 'student', label: 'Student', to: '/login/student' },
  { roleKey: 'supervisor', label: 'Supervisor', to: '/login/supervisor' },
  { roleKey: 'institution_admin', label: 'Institution Admin', to: '/login/admin' },
];

const ROLE_LABELS = {
  student: 'Student',
  supervisor: 'Supervisor',
  institution_admin: 'Institution Admin',
};

const DEMO_STUDENT_ID_ALIASES = {
  'gp/csc/2025/001': 'student.demo@westbridge.edu',
  '2025/001': 'student.demo@westbridge.edu',
};

export default function PortalLoginShell({
  expectedRole,
  portalBadge,
  title,
  subtitle,
  accent = 'student',
  PortalIcon,
  identifierMode = 'email',
  identifierLabel = 'Institutional Email Address',
  identifierPlaceholder = 'name@gracepolytechnic.edu.ng',
  identifierHelper = '',
  contextHeading,
  contextPoints = [],
  accessNotice,
  secondaryAction = null,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const prefersReduced = useReducedMotion();
  const themeStyle = PORTAL_THEMES[accent] || PORTAL_THEMES.student;

  const { signInDemo, switchMembership, signOutDemo, authError, clearAuthError } =
    useDemoSession();
  const { showToast } = useToast();
  const {
    isConfigured: supabaseReady,
    signIn,
    resetPassword,
    loadMemberships,
  } = useSupabaseService();

  const [form, setForm] = useState({
    identifier: '',
    password: '',
    rememberDevice: true,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [simulateError, setSimulateError] = useState(false);
  const [submitState, setSubmitState] = useState(null);
  const [showResetPanel, setShowResetPanel] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  const eligibleDemoAccounts = useMemo(
    () =>
      DEMO_ACCOUNTS.filter((account) =>
        account.memberships.some(
          (m) =>
            m.roleKey === expectedRole && String(m.status).toLowerCase() === 'approved'
        )
      ),
    [expectedRole]
  );

  const validateIdentifier = (value) => {
    const trimmed = (value || '').trim();
    if (!trimmed) {
      return identifierMode === 'emailOrStudentId'
        ? 'Enter your email address or Grace Polytechnic Student ID.'
        : 'Email address is required.';
    }
    if (identifierMode === 'emailOrStudentId') {
      if (trimmed.includes('@')) {
        return validateEmail(trimmed, 'Email address');
      }
      if (trimmed.length < 4) {
        return 'Enter a valid Grace Polytechnic Student ID or email address.';
      }
      return '';
    }
    return validateEmail(trimmed, 'Email address');
  };

  const validateField = (name, value) => {
    if (name === 'identifier') return validateIdentifier(value);
    if (name === 'password') return validateRequired(value, 'Password');
    return '';
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const nextValue = type === 'checkbox' ? checked : value;
    setForm((prev) => ({ ...prev, [name]: nextValue }));
    setSubmitState(null);
    if (authError) clearAuthError();
    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: validateField(name, nextValue) }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleFillDemoAccount = (account) => {
    setForm((prev) => ({
      ...prev,
      identifier: account.email,
      password: account.password,
    }));
    setErrors({});
    setSubmitState({
      type: 'info',
      title: `Filled ${ROLE_LABELS[expectedRole] || account.roleLabel} demo credentials`,
      message: `Tap "Sign in to ${ROLE_LABELS[expectedRole]} Portal" below to open the workspace as ${account.fullName}.`,
    });
  };

  const handleSendPasswordReset = async () => {
    const targetEmail = (resetEmail || (form.identifier.includes('@') ? form.identifier : '')).trim();
    const emailErr = validateEmail(targetEmail, 'Email address');
    if (emailErr) {
      setSubmitState({
        type: 'error',
        title: 'Valid email required for password reset',
        message: emailErr,
      });
      return;
    }

    if (!supabaseReady) {
      setSubmitState({
        type: 'info',
        title: 'Password recovery requires live Supabase Auth',
        message:
          'Recovery links are dispatched via Supabase Auth once VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are configured. Password reset emails cannot be sent in local preview mode.',
      });
      return;
    }

    setResetLoading(true);
    setSubmitState(null);
    try {
      await resetPassword(targetEmail);
      setSubmitState({
        type: 'success',
        title: 'Password recovery email sent',
        message: `If an account exists for ${targetEmail}, a recovery link returning to /login has been dispatched.`,
      });
      setShowResetPanel(false);
    } catch (err) {
      setSubmitState({
        type: 'error',
        title: 'Password reset failed',
        message: normalizeAppError(err, 'Unable to send password recovery email.'),
      });
    } finally {
      setResetLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = {
      identifier: validateField('identifier', form.identifier),
      password: validateField('password', form.password),
    };
    setErrors(nextErrors);
    setTouched({ identifier: true, password: true });

    if (Object.values(nextErrors).some(Boolean)) {
      setSubmitState({
        type: 'error',
        title: 'Please check the highlighted fields',
        message: 'Provide your valid portal credentials before signing in.',
      });
      return;
    }

    const rawIdentifier = form.identifier.trim();
    setLoading(true);
    setSubmitState(null);
    clearAuthError();

    // Live Supabase Authentication path
    if (supabaseReady && !simulateError) {
      if (identifierMode === 'emailOrStudentId' && !rawIdentifier.includes('@')) {
        setLoading(false);
        setSubmitState({
          type: 'info',
          title: 'Use your registered email address',
          message:
            'Server-side Student ID authentication is scheduled for the backend security release to prevent account enumeration. Please sign in with your registered email address.',
        });
        return;
      }

      try {
        const { user } = await signIn(rawIdentifier, form.password);
        let memberships = [];
        try {
          memberships = await loadMemberships(user.id);
        } catch (membershipErr) {
          await signOutDemo();
          setLoading(false);
          setSubmitState({
            type: 'error',
            title: 'Could not verify institutional permissions',
            message: normalizeAppError(
              membershipErr,
              'Your session was closed because membership verification failed.'
            ),
          });
          return;
        }

        const expectedMatches = (memberships || []).filter(
          (m) => m.roleKey === expectedRole
        );
        const approvedExpected = expectedMatches.find(
          (m) => String(m.status).toLowerCase() === 'approved'
        );

        if (!approvedExpected) {
          // Ensure unauthorized or unapproved sessions are never left active
          await signOutDemo();
          setLoading(false);

          if (expectedMatches.length > 0) {
            setSubmitState({
              type: 'info',
              title: 'Account awaiting institutional approval',
              message: `Your Grace Polytechnic ${ROLE_LABELS[expectedRole]} account is currently pending administrator approval. Your session was not activated.`,
            });
            return;
          }

          setSubmitState({
            type: 'error',
            title: `Access restricted to ${ROLE_LABELS[expectedRole]} Portal`,
            message:
              'Your credentials do not hold an approved membership for this portal. Sign in through the portal assigned to your institutional role.',
          });
          return;
        }

        if (memberships.length > 1) {
          switchMembership(approvedExpected.id);
        }

        setLoading(false);
        showToast({
          type: 'success',
          title: `Signed in to ${ROLE_LABELS[expectedRole]} Portal`,
          message: `Welcome back to ${approvedExpected.institutionName || GRACE_POLYTECHNIC_BRAND.institutionName}.`,
        });

        const destination =
          location.state?.from || getDashboardPathForRole(expectedRole);
        navigate(destination);
        return;
      } catch (err) {
        setLoading(false);
        setSubmitState({
          type: 'error',
          title: 'Sign-in failed',
          message: normalizeAppError(err, 'Invalid credentials or unable to reach Supabase Auth.'),
        });
        return;
      }
    }

    // Demo Preview Authentication path
    setTimeout(() => {
      setLoading(false);
      if (simulateError) {
        setSubmitState({
          type: 'error',
          title: 'Simulated authentication error',
          message:
            'This previews how authentication errors appear when credentials are rejected or rate limited.',
        });
        return;
      }

      const resolvedDemoIdentifier =
        identifierMode === 'emailOrStudentId' && !rawIdentifier.includes('@')
          ? DEMO_STUDENT_ID_ALIASES[rawIdentifier.toLowerCase()] || rawIdentifier
          : rawIdentifier;

      const matchedAccount = verifyDemoCredentials(resolvedDemoIdentifier, form.password);
      if (!matchedAccount) {
        setSubmitState({
          type: 'error',
          title: 'Credentials did not match this portal',
          message:
            'Use one of the portal demonstration credentials below, or configure Supabase Auth environment variables for live sign-in.',
        });
        return;
      }

      const targetMembership = matchedAccount.memberships.find(
        (m) =>
          m.roleKey === expectedRole && String(m.status).toLowerCase() === 'approved'
      );

      if (!targetMembership) {
        setSubmitState({
          type: 'error',
          title: `Account is not authorized for ${ROLE_LABELS[expectedRole]} Portal`,
          message: `Those credentials belong to ${matchedAccount.roleLabel}. Please use the matching portal sign-in page instead.`,
        });
        return;
      }

      signInDemo(matchedAccount);
      if (matchedAccount.memberships[0]?.id !== targetMembership.id) {
        switchMembership(targetMembership.id);
      }

      showToast({
        type: 'success',
        title: `Signed in as ${matchedAccount.fullName}`,
        message: `Opened ${ROLE_LABELS[expectedRole]} Portal`,
      });
      const destination =
        location.state?.from || getDashboardPathForRole(expectedRole);
      navigate(destination);
    }, 300);
  };

  const renderFormAlert = (state) => {
    const styleMap = {
      error: {
        box: 'border-red-500/35 bg-red-500/10 text-red-700 dark:text-red-200',
        icon: AlertCircle,
      },
      success: {
        box: 'border-emerald-500/35 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200',
        icon: CheckCircle2,
      },
      info: {
        box: 'border-blue-500/35 bg-blue-500/10 text-[var(--text-primary)]',
        icon: Info,
      },
    };
    const cfg = styleMap[state.type] || styleMap.info;
    const AlertIcon = cfg.icon;

    return (
      <div
        role={state.type === 'error' ? 'alert' : 'status'}
        className={`rounded-xl border p-4 text-sm ${cfg.box}`}
      >
        <div className="flex items-start gap-3">
          <AlertIcon className="h-5 w-5 mt-0.5 shrink-0" aria-hidden="true" />
          <div className="min-w-0 flex-1 space-y-1">
            {state.title && <p className="font-semibold leading-snug">{state.title}</p>}
            <p className="text-xs sm:text-sm leading-relaxed opacity-90">{state.message}</p>
          </div>
        </div>
      </div>
    );
  };

  const cardBody = (
    <div
      className={`relative overflow-hidden rounded-2xl spt-surface border-t-4 ${themeStyle.accentBorder} p-5 sm:p-8`}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: themeStyle.glowStyle }}
      />

      <div className="relative space-y-6">
        {/* Top portal header */}
        <div className="space-y-3 border-b border-[var(--border-subtle)] pb-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <BrandLogo size="xs" showInstitution />
            <span className={`font-mono text-xs font-semibold tracking-wider ${themeStyle.badgeColor}`}>
              {portalBadge}
            </span>
          </div>

          <div className="flex items-start gap-3.5 pt-1">
            {PortalIcon && (
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${themeStyle.iconBg}`}
              >
                <PortalIcon className="h-5 w-5" aria-hidden="true" />
              </div>
            )}
            <div className="space-y-1 min-w-0">
              <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)] text-balance">
                {title}
              </h1>
              <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
                {subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Portal Switcher Strip */}
        <nav aria-label="Switch portal sign-in" className="grid grid-cols-3 gap-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-1.5">
          {PORTAL_SWITCHER.map((item) => {
            const active = item.roleKey === expectedRole;
            return (
              <Link
                key={item.roleKey}
                to={item.to}
                className={`flex min-h-[38px] items-center justify-center rounded-lg px-2 py-1.5 text-center text-xs font-semibold transition-colors ${
                  active
                    ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-xs border border-[var(--border-subtle)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Auth mode & error simulation toggle */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-4 py-3 text-xs">
          <div className="flex items-center gap-2 font-semibold text-[var(--text-primary)]">
            <ShieldCheck
              className={`h-4 w-4 shrink-0 ${supabaseReady ? 'text-emerald-500' : themeStyle.badgeColor}`}
              aria-hidden="true"
            />
            <span>
              {supabaseReady
                ? 'Live Supabase Auth Connected'
                : 'Preview Mode · Grace Polytechnic Portal'}
            </span>
          </div>
          <label className="inline-flex items-center gap-2 text-xs text-[var(--text-muted)] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={simulateError}
              onChange={(e) => setSimulateError(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-[var(--border-strong)] accent-[#2563EB]"
            />
            <span>Simulate auth error</span>
          </label>
        </div>

        {authError && renderFormAlert({ type: 'error', title: 'Session verification notice', message: authError })}
        {submitState && renderFormAlert(submitState)}

        {/* Portal Login Form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <div className="space-y-1.5">
            <label
              htmlFor="portal-identifier"
              className="block text-sm font-medium text-[var(--text-primary)]"
            >
              {identifierLabel}
              <span className="ml-1 text-red-500" aria-hidden="true">
                *
              </span>
            </label>
            <input
              id="portal-identifier"
              name="identifier"
              type={identifierMode === 'email' ? 'email' : 'text'}
              value={form.identifier}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder={identifierPlaceholder}
              autoComplete={identifierMode === 'email' ? 'email' : 'username'}
              aria-invalid={Boolean(errors.identifier)}
              aria-describedby={errors.identifier ? 'portal-identifier-err' : 'portal-identifier-hint'}
              className={`w-full min-h-[46px] rounded-xl border bg-[var(--bg-elevated)] px-3.5 py-2.5 text-base sm:text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] transition-colors focus:outline-none ${
                errors.identifier
                  ? 'border-red-500 focus:ring-2 focus:ring-red-500/20'
                  : 'border-[var(--border-strong)] focus:border-[var(--accent-primary)] focus:ring-2 focus:ring-blue-500/20'
              }`}
            />
            {errors.identifier ? (
              <p
                id="portal-identifier-err"
                role="alert"
                className="flex items-start gap-1.5 text-xs font-medium text-red-500"
              >
                <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" aria-hidden="true" />
                <span>{errors.identifier}</span>
              </p>
            ) : identifierHelper ? (
              <p id="portal-identifier-hint" className="text-xs text-[var(--text-muted)]">
                {identifierHelper}
              </p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="portal-password"
              className="block text-sm font-medium text-[var(--text-primary)]"
            >
              Password
              <span className="ml-1 text-red-500" aria-hidden="true">
                *
              </span>
            </label>
            <div className="relative">
              <input
                id="portal-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter your password"
                autoComplete="current-password"
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? 'portal-password-err' : undefined}
                className={`w-full min-h-[46px] rounded-xl border bg-[var(--bg-elevated)] px-3.5 py-2.5 pr-12 text-base sm:text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] transition-colors focus:outline-none ${
                  errors.password
                    ? 'border-red-500 focus:ring-2 focus:ring-red-500/20'
                    : 'border-[var(--border-strong)] focus:border-[var(--accent-primary)] focus:ring-2 focus:ring-blue-500/20'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute inset-y-0 right-0 flex min-w-[44px] items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            </div>
            {errors.password && (
              <p
                id="portal-password-err"
                role="alert"
                className="flex items-start gap-1.5 text-xs font-medium text-red-500"
              >
                <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" aria-hidden="true" />
                <span>{errors.password}</span>
              </p>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <label className="inline-flex min-h-[40px] items-center gap-2 text-xs sm:text-sm text-[var(--text-muted)] cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="rememberDevice"
                  checked={form.rememberDevice}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-[var(--border-strong)] accent-[#2563EB]"
                />
                <span>Keep me signed in on this browser</span>
              </label>

              <button
                type="button"
                onClick={() => {
                  setResetEmail((prev) =>
                    prev || (form.identifier.includes('@') ? form.identifier : '')
                  );
                  setShowResetPanel((prev) => !prev);
                }}
                className="min-h-[40px] text-xs sm:text-sm font-medium text-[var(--accent-primary)] hover:underline cursor-pointer whitespace-nowrap"
              >
                Forgot password?
              </button>
            </div>
          </div>

          {showResetPanel && (
            <div className="rounded-xl border border-[var(--border-strong)] bg-[var(--bg-elevated)] p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-primary)]">
                <MailCheck className="h-4 w-4 text-[var(--accent-primary)]" aria-hidden="true" />
                <span>Password Recovery</span>
              </div>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                {supabaseReady
                  ? 'Enter your institutional email below to receive a Supabase Auth password reset link (redirects to /login).'
                  : 'Password recovery email dispatch requires live Supabase Auth credentials (VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY).'}
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="name@gracepolytechnic.edu.ng"
                  aria-label="Recovery email address"
                  disabled={!supabaseReady}
                  className="min-h-[42px] flex-1 rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] disabled:opacity-60 focus:border-[var(--accent-primary)] focus:outline-none"
                />
                <button
                  type="button"
                  disabled={!supabaseReady || resetLoading}
                  onClick={handleSendPasswordReset}
                  className="inline-flex min-h-[42px] items-center justify-center rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-4 py-2 text-xs sm:text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
                >
                  {resetLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm sm:text-base font-semibold text-white shadow-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer ${themeStyle.primaryBtn}`}
          >
            {loading ? 'Verifying portal credentials...' : `Sign in to ${ROLE_LABELS[expectedRole]} Portal`}
          </button>
        </form>

        {/* Demo Credentials for this specific portal */}
        {!supabaseReady && eligibleDemoAccounts.length > 0 && (
          <section
            aria-label={`${ROLE_LABELS[expectedRole]} demo credentials`}
            className="border-t border-[var(--border-subtle)] pt-5 space-y-3"
          >
            <div className="flex items-center gap-2 text-[var(--text-primary)]">
              <KeyRound className={`h-4 w-4 shrink-0 ${themeStyle.badgeColor}`} aria-hidden="true" />
              <h2 className="font-display text-sm font-bold">
                {ROLE_LABELS[expectedRole]} Preview Credentials
              </h2>
            </div>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Tap below to populate test credentials authorized for the {ROLE_LABELS[expectedRole]} Portal.
            </p>

            <div className="grid grid-cols-1 gap-2.5">
              {eligibleDemoAccounts.map((account) => (
                <div
                  key={account.id}
                  className="flex flex-col gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-3.5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-x-2 text-xs">
                      <span className="font-bold text-[var(--text-primary)]">
                        {account.fullName}
                      </span>
                      <span aria-hidden="true" className="text-[var(--text-muted)]">
                        ·
                      </span>
                      <span className="text-[var(--text-muted)]">{account.roleLabel}</span>
                    </div>
                    <p className="font-mono text-xs text-[var(--text-primary)] break-all">
                      {account.email}
                    </p>
                    <p className="font-mono text-xs text-[var(--text-muted)]">
                      Password: <span className="text-[var(--text-primary)]">{account.password}</span>
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleFillDemoAccount(account)}
                    className="inline-flex min-h-[40px] items-center justify-center rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3.5 py-2 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] cursor-pointer whitespace-nowrap shrink-0"
                  >
                    Use credentials
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {secondaryAction && (
          <div className="border-t border-[var(--border-subtle)] pt-4 text-center text-sm text-[var(--text-muted)]">
            {secondaryAction}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-canvas)] text-[var(--text-primary)] transition-colors duration-200">
      <PublicHeader />

      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/"
            className="inline-flex min-h-[40px] items-center gap-2 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span>Back to Grace Polytechnic homepage</span>
          </Link>

          <Link
            to="/login"
            className="text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            View all portal gateways
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-7">
            {prefersReduced ? (
              cardBody
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
              >
                {cardBody}
              </motion.div>
            )}
          </div>

          <aside className="lg:col-span-5 space-y-5">
            <div
              className={`rounded-2xl border ${themeStyle.panelBorder} bg-[#0E172D] p-6 text-white shadow-lg`}
            >
              <div className={`flex items-center gap-2.5 mb-3 ${themeStyle.badgeColor}`}>
                <LockKeyhole className="h-5 w-5 shrink-0" aria-hidden="true" />
                <span className="font-mono text-xs font-semibold tracking-wide">
                  GRACE POLYTECHNIC · ACCESS GOVERNANCE
                </span>
              </div>
              <h2 className="font-display text-lg font-semibold leading-snug mb-4 text-white">
                {contextHeading}
              </h2>
              <ul className="space-y-3.5 text-sm text-slate-200">
                {contextPoints.map((point, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className={`font-mono text-xs mt-0.5 tabular-nums ${themeStyle.badgeColor}`}>
                      0{index + 1}.
                    </span>
                    <span className="leading-relaxed">{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {accessNotice && (
              <div className="rounded-2xl spt-surface p-5 space-y-2.5">
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  {accessNotice.title}
                </p>
                <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                  {accessNotice.body}
                </p>
                {accessNotice.linkTo && (
                  <Link
                    to={accessNotice.linkTo}
                    className="inline-flex min-h-[38px] items-center text-xs sm:text-sm font-semibold text-[var(--accent-primary)] hover:underline"
                  >
                    {accessNotice.linkLabel}
                  </Link>
                )}
              </div>
            )}
          </aside>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
