import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, KeyRound, MailCheck, ShieldCheck } from 'lucide-react';
import AuthLayout from '../components/layout/AuthLayout';
import Button from '../components/ui/Button';
import FormField from '../components/ui/FormField';
import StageNotice from '../components/ui/StageNotice';
import StatusAlert from '../components/ui/StatusAlert';
import { useDemoSession } from '../context/DemoSessionContext';
import { useToast } from '../context/ToastContext';
import { DEMO_ACCOUNTS, verifyDemoCredentials } from '../data/demoAccounts';
import { useSupabaseService } from '../hooks/useSupabaseService';
import { normalizeAppError } from '../utils/errorHandler';
import { getDashboardPathForRole } from '../utils/roleRouting';
import { validateEmail, validateMinLength, validatePassword, validateRequired } from '../utils/validation';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signInDemo, authError, clearAuthError } = useDemoSession();
  const { showToast } = useToast();
  const {
    isConfigured: supabaseReady,
    signIn,
    signUp,
    resetPassword,
    loadMemberships,
  } = useSupabaseService();

  const [authMode, setAuthMode] = useState('signin'); // 'signin' | 'signup'
  const [form, setForm] = useState({
    fullName: '',
    roleKey: 'student',
    email: '',
    password: '',
    rememberDevice: true,
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [simulateError, setSimulateError] = useState(false);
  const [submitState, setSubmitState] = useState(null);
  const [showResetPanel, setShowResetPanel] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  const validateField = (fieldName, value) => {
    if (fieldName === 'fullName' && authMode === 'signup') {
      return validateMinLength(value, 2, 'Full name');
    }
    if (fieldName === 'email') return validateEmail(value, 'Email address');
    if (fieldName === 'password') {
      return authMode === 'signup'
        ? validatePassword(value)
        : validateRequired(value, 'Password');
    }
    return '';
  };

  const handleModeChange = (nextMode) => {
    setAuthMode(nextMode);
    setErrors({});
    setSubmitState(null);
    setShowResetPanel(false);
    clearAuthError();
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
    setAuthMode('signin');
    setForm((prev) => ({
      ...prev,
      email: account.email,
      password: account.password,
    }));
    setErrors({});
    setSubmitState({
      type: 'info',
      title: `Filled ${account.roleLabel} demo credentials`,
      message: `Tap "Sign in" below to open the ${account.roleLabel} Dashboard as ${account.fullName}.`,
    });
  };

  const handleSendPasswordReset = async () => {
    const targetEmail = (resetEmail || form.email).trim();
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
        title: 'Supabase Auth environment variables required',
        message:
          'Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to dispatch live password reset links via Supabase Authentication.',
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
        message: `Check ${targetEmail} for your Supabase Auth password reset link.`,
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
      email: validateField('email', form.email),
      password: validateField('password', form.password),
      ...(authMode === 'signup' ? { fullName: validateField('fullName', form.fullName) } : {}),
    };
    setErrors(nextErrors);
    setTouched({ email: true, password: true, fullName: authMode === 'signup' });

    if (Object.values(nextErrors).some(Boolean)) {
      setSubmitState({
        type: 'error',
        title: 'Please correct the highlighted fields',
        message:
          authMode === 'signup'
            ? 'Provide your full name, valid email, and a strong password.'
            : 'Enter a valid email address and password.',
      });
      return;
    }

    setLoading(true);
    setSubmitState(null);
    clearAuthError();

    if (supabaseReady && !simulateError) {
      try {
        if (authMode === 'signup') {
          const data = await signUp({
            email: form.email.trim(),
            password: form.password,
            fullName: form.fullName.trim(),
            roleKey: form.roleKey,
          });
          setLoading(false);

          if (data?.session && data?.user) {
            const memberships = await loadMemberships(data.user.id);
            const approved = memberships.find(
              (m) => String(m.status).toLowerCase() === 'approved'
            );
            if (approved) {
              navigate(getDashboardPathForRole(approved.roleKey));
              return;
            }
          }

          setSubmitState({
            type: 'success',
            title: 'Supabase account created',
            message:
              'Your account is registered in Supabase Auth. Verify your email (if required) and wait for an Institution Administrator to approve your institutional membership, or use the dedicated Student/Supervisor registration forms to include academic details.',
          });
          setAuthMode('signin');
          return;
        }

        const { user } = await signIn(form.email.trim(), form.password);
        const memberships = await loadMemberships(user.id);
        setLoading(false);

        const approvedMembership = memberships.find(
          (m) => String(m.status).toLowerCase() === 'approved'
        );

        if (!approvedMembership) {
          setSubmitState({
            type: 'info',
            title: 'Account awaiting institutional approval',
            message:
              'Your Supabase account is authenticated, but you do not yet have an approved institutional membership. Contact your Institution Administrator to activate your workspace.',
          });
          return;
        }

        showToast({
          type: 'success',
          title: 'Signed in via Supabase Auth',
          message: `Welcome back to ${approvedMembership.institutionName}.`,
        });

        const destination =
          location.state?.from || getDashboardPathForRole(approvedMembership.roleKey);
        navigate(destination);
        return;
      } catch (err) {
        setLoading(false);
        setSubmitState({
          type: 'error',
          title: authMode === 'signup' ? 'Supabase registration failed' : 'Supabase sign-in failed',
          message: normalizeAppError(err, 'Unable to authenticate with Supabase.'),
        });
        return;
      }
    }

    setTimeout(() => {
      setLoading(false);
      if (simulateError) {
        setSubmitState({
          type: 'error',
          title: 'Simulated authentication error',
          message:
            'This previews how authentication errors appear when Supabase Auth returns invalid credentials, rate limits, or network failures.',
        });
        return;
      }

      if (authMode === 'signup') {
        setSubmitState({
          type: 'info',
          title: 'Demo preview mode active',
          message:
            'Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to create live Supabase Auth accounts, or switch back to Sign In and choose one of the role test credentials below.',
        });
        return;
      }

      const matchedAccount = verifyDemoCredentials(form.email, form.password);
      if (!matchedAccount) {
        setSubmitState({
          type: 'error',
          title: 'Credentials did not match a demo account',
          message:
            'Use one of the role demonstration credentials listed below, or configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY for live Supabase Auth.',
        });
        return;
      }

      signInDemo(matchedAccount);
      const initialRole = matchedAccount.memberships[0]?.roleKey;
      showToast({
        type: 'success',
        title: `Signed in as ${matchedAccount.fullName}`,
        message: `Opened ${matchedAccount.roleLabel} Portal`,
      });
      navigate(getDashboardPathForRole(initialRole));
    }, 350);
  };

  return (
    <AuthLayout
      title={authMode === 'signup' ? 'Create your workspace account' : 'Sign in to your account'}
      subtitle={
        supabaseReady
          ? 'Live Supabase Authentication is connected. Sign in, register a new account, or reset your password securely.'
          : 'Sign in with Supabase Auth (when configured) or use a role demonstration account below to preview the portal.'
      }
      contextHeading="Unified account, scoped permissions"
      contextPoints={[
        supabaseReady
          ? 'Live Supabase Auth mode is active: credentials verify directly against Supabase Authentication and PostgreSQL Row Level Security.'
          : 'Demo preview sessions run locally in your browser until VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are configured.',
        'Role guards enforce Student, Supervisor, Institution Admin, and Platform Admin workspace separation.',
        'Try the Multi-Role demo account to switch between Student, Supervisor, and Institution Admin across three institutions.',
      ]}
    >
      <div className="space-y-6">
        {supabaseReady ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50/70 px-4 py-3 text-xs text-emerald-900">
            <div className="flex items-center gap-2 font-semibold">
              <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" aria-hidden="true" />
              <span>Supabase Auth Connected</span>
            </div>
            <label className="inline-flex items-center gap-2 text-xs text-emerald-800 cursor-pointer">
              <input
                type="checkbox"
                checked={simulateError}
                onChange={(e) => setSimulateError(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-emerald-400 text-[#2563EB]"
              />
              <span>Simulate auth error</span>
            </label>
          </div>
        ) : (
          <StageNotice
            title="Supabase Auth + Demo Fallback Mode"
            simulateError={simulateError}
            onToggleSimulateError={setSimulateError}
            description="Supabase Auth is wired in code and activates automatically when VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are present. In this preview, you can sign in immediately with the role test credentials below."
          />
        )}

        <div
          role="tablist"
          aria-label="Authentication mode"
          className="grid grid-cols-2 gap-1.5 rounded-xl border border-slate-200 bg-slate-100 p-1.5"
        >
          <button
            type="button"
            role="tab"
            aria-selected={authMode === 'signin'}
            onClick={() => handleModeChange('signin')}
            className={`min-h-[42px] rounded-lg px-3 py-2 text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
              authMode === 'signin'
                ? 'bg-[#172554] text-white shadow-xs'
                : 'text-[#64748B] hover:text-[#172554]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={authMode === 'signup'}
            onClick={() => handleModeChange('signup')}
            className={`min-h-[42px] rounded-lg px-3 py-2 text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
              authMode === 'signup'
                ? 'bg-[#172554] text-white shadow-xs'
                : 'text-[#64748B] hover:text-[#172554]'
            }`}
          >
            Create Account
          </button>
        </div>

        {authError && (
          <StatusAlert type="error" title="Session synchronization notice">
            {authError}
          </StatusAlert>
        )}

        {submitState && (
          <StatusAlert type={submitState.type} title={submitState.title}>
            {submitState.message}
          </StatusAlert>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {authMode === 'signup' && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                id="login-fullname"
                name="fullName"
                label="Full name"
                placeholder="e.g. Ama Mensah"
                value={form.fullName}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.fullName}
                autoComplete="name"
                required
              />
              <FormField
                id="login-role"
                name="roleKey"
                as="select"
                label="Requested role"
                value={form.roleKey}
                onChange={handleChange}
                options={[
                  { value: 'student', label: 'Student' },
                  { value: 'supervisor', label: 'Supervisor' },
                ]}
              />
            </div>
          )}

          <FormField
            id="login-email"
            name="email"
            type="email"
            label="Email address"
            placeholder="name@university.edu"
            value={form.email}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.email}
            autoComplete="email"
            required
          />

          <div className="space-y-2">
            <FormField
              id="login-password"
              name="password"
              type="password"
              label="Password"
              placeholder={authMode === 'signup' ? 'Minimum 8 characters' : 'Enter your password'}
              value={form.password}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.password}
              autoComplete={authMode === 'signup' ? 'new-password' : 'current-password'}
              required
            />

            {authMode === 'signin' && (
              <div className="flex items-center justify-between gap-3 pt-1">
                <label className="inline-flex min-h-[40px] items-center gap-2 text-xs sm:text-sm text-[#64748B] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    name="rememberDevice"
                    checked={form.rememberDevice}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB]"
                  />
                  <span>Keep me signed in on this browser</span>
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setResetEmail((prev) => prev || form.email);
                    setShowResetPanel((prev) => !prev);
                  }}
                  className="min-h-[40px] text-xs sm:text-sm font-medium text-[#2563EB] hover:text-[#1D4ED8] cursor-pointer whitespace-nowrap"
                >
                  Forgot password?
                </button>
              </div>
            )}
          </div>

          {showResetPanel && authMode === 'signin' && (
            <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#172554]">
                <MailCheck className="h-4 w-4 text-[#2563EB]" aria-hidden="true" />
                <span>Supabase Password Recovery</span>
              </div>
              <p className="text-xs text-[#64748B] leading-relaxed">
                {supabaseReady
                  ? 'Enter your account email below to receive a secure password recovery link via Supabase Auth.'
                  : 'Supabase Auth password reset dispatches recovery emails automatically once VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are configured.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="name@university.edu"
                  aria-label="Recovery email address"
                  className="min-h-[40px] flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-[#172554] focus:border-[#2563EB] focus:outline-none"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  loading={resetLoading}
                  loadingText="Sending..."
                  onClick={handleSendPasswordReset}
                >
                  Send Reset Link
                </Button>
              </div>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
            loadingText={
              authMode === 'signup'
                ? 'Creating Supabase account...'
                : supabaseReady
                  ? 'Authenticating with Supabase...'
                  : 'Signing in to preview...'
            }
          >
            {authMode === 'signup' ? 'Create Supabase account' : 'Sign in'}
          </Button>
        </form>

        {/* Demo Role Credentials Directory */}
        {!supabaseReady && (
          <section
            aria-label="Role Demo Credentials"
            className="border-t border-slate-200 pt-6 space-y-3"
          >
            <div className="flex items-center gap-2 text-[#172554]">
              <KeyRound className="h-4 w-4 text-[#2563EB] shrink-0" aria-hidden="true" />
              <h2 className="font-display text-sm font-bold">
                Role Test Credentials (Demo Preview)
              </h2>
            </div>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Tap any role below to auto-fill the form, or type the email and password manually.
            </p>

            <div className="grid grid-cols-1 gap-2.5">
              {DEMO_ACCOUNTS.map((account) => (
                <div
                  key={account.id}
                  className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-[#F8FAFC] p-3.5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
                      <span className="font-bold text-[#172554]">{account.roleLabel}</span>
                      <span className="text-slate-400" aria-hidden="true">
                        ·
                      </span>
                      <span className="text-[#64748B]">{account.fullName}</span>
                    </div>
                    <p className="font-mono text-xs text-[#172554] break-all">
                      {account.email}
                    </p>
                    <p className="font-mono text-xs text-[#64748B]">
                      Password: <span className="text-[#172554]">{account.password}</span>
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleFillDemoAccount(account)}
                    className="inline-flex min-h-[40px] items-center justify-center rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-[#172554] hover:bg-slate-100 cursor-pointer whitespace-nowrap shrink-0"
                  >
                    Use credentials
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {supabaseReady && (
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-[#64748B]">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" aria-hidden="true" />
            <span>
              Looking for full institutional onboarding? Use{' '}
              <Link to="/register" className="font-semibold text-[#2563EB] hover:underline">
                Student or Supervisor Registration
              </Link>{' '}
              with your academic ID.
            </span>
          </div>
        )}

        <p className="border-t border-slate-100 pt-4 text-center text-sm text-[#64748B]">
          New to Student Project Tracker?{' '}
          <Link to="/register" className="font-semibold text-[#2563EB] hover:text-[#1D4ED8]">
            Choose a registration path
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
