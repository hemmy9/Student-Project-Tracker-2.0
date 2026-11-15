import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { KeyRound } from 'lucide-react';
import AuthLayout from '../components/layout/AuthLayout';
import Button from '../components/ui/Button';
import FormField from '../components/ui/FormField';
import StageNotice from '../components/ui/StageNotice';
import StatusAlert from '../components/ui/StatusAlert';
import { useDemoSession } from '../context/DemoSessionContext';
import { useToast } from '../context/ToastContext';
import { DEMO_ACCOUNTS, verifyDemoCredentials } from '../data/demoAccounts';
import { useSupabaseService } from '../hooks/useSupabaseService';
import { getDashboardPathForRole } from '../utils/roleRouting';
import { validateEmail, validateRequired } from '../utils/validation';

export default function LoginPage() {
  const navigate = useNavigate();
  const { signInDemo } = useDemoSession();
  const { showToast } = useToast();
  const { isConfigured: supabaseReady, signIn, loadMemberships } = useSupabaseService();

  const [form, setForm] = useState({
    email: '',
    password: '',
    rememberDevice: true,
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [simulateError, setSimulateError] = useState(false);
  const [submitState, setSubmitState] = useState(null);
  const [showResetInfo, setShowResetInfo] = useState(false);

  const validateField = (fieldName, value) => {
    if (fieldName === 'email') return validateEmail(value, 'Email address');
    if (fieldName === 'password') return validateRequired(value, 'Password');
    return '';
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const nextValue = type === 'checkbox' ? checked : value;
    setForm((prev) => ({ ...prev, [name]: nextValue }));
    setSubmitState(null);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = {
      email: validateField('email', form.email),
      password: validateField('password', form.password),
    };
    setErrors(nextErrors);
    setTouched({ email: true, password: true });

    if (nextErrors.email || nextErrors.password) {
      setSubmitState({
        type: 'error',
        title: 'Please correct the highlighted fields',
        message: 'Enter a valid email address and password.',
      });
      return;
    }

    setLoading(true);
    setSubmitState(null);

    if (supabaseReady && !simulateError) {
      try {
        const { user } = await signIn(form.email.trim(), form.password);
        const memberships = await loadMemberships(user.id);
        setLoading(false);
        const initialRole = memberships[0]?.roleKey;
        if (!initialRole) {
          setSubmitState({
            type: 'info',
            title: 'Account awaiting institutional approval',
            message:
              'Your Supabase account is authenticated, but you do not yet have an approved institutional membership.',
          });
          return;
        }
        showToast({
          type: 'success',
          title: 'Signed in via Supabase',
          message: `Welcome back to ${memberships[0].institutionName}.`,
        });
        navigate(getDashboardPathForRole(initialRole));
        return;
      } catch (err) {
        setLoading(false);
        setSubmitState({
          type: 'error',
          title: 'Sign-in failed',
          message: err.message || 'Unable to authenticate with Supabase.',
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
            'This previews how authentication errors appear when Supabase returns invalid credentials or network failures.',
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
    }, 450);
  };

  return (
    <AuthLayout
      title="Sign in to your account"
      subtitle="Use a Stage 1 role demonstration account below to preview the portal header and role-scoped access."
      contextHeading="Unified account, scoped permissions"
      contextPoints={[
        'These Stage 1 test accounts demonstrate how Student, Supervisor, Institution Admin, and Platform Admin roles behave.',
        'Demo preview sessions run locally in your browser and are completely separate from real Supabase Authentication (Stage 4).',
        'Try the Multi-Role account to switch between Student, Supervisor, and Institution Admin across three different institutions.',
      ]}
    >
      <div className="space-y-6">
        <StageNotice
          title="Stage 1 Frontend Demo Credentials Mode"
          simulateError={simulateError}
          onToggleSimulateError={setSimulateError}
          description="Signing in with one of the test credentials below opens a frontend-only Demo Preview Session (not real database authentication). Real Supabase Auth + PostgreSQL RLS will replace this in Stage 4."
        />

        {submitState && (
          <StatusAlert type={submitState.type} title={submitState.title}>
            {submitState.message}
          </StatusAlert>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
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
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.password}
              autoComplete="current-password"
              required
            />

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
                onClick={() => setShowResetInfo((prev) => !prev)}
                className="min-h-[40px] text-xs sm:text-sm font-medium text-[#2563EB] hover:text-[#1D4ED8] cursor-pointer whitespace-nowrap"
              >
                Forgot password?
              </button>
            </div>
          </div>

          {showResetInfo && (
            <StatusAlert type="info" title="Password recovery">
              Self-service password reset links will be dispatched via Supabase Authentication email recovery once backend integration is completed in Stage 4.
            </StatusAlert>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
            loadingText="Signing in to demo preview..."
          >
            Sign in
          </Button>
        </form>

        {/* Demo Role Credentials Directory */}
        <section
          aria-label="Stage 1 Role Demo Credentials"
          className="border-t border-slate-200 pt-6 space-y-3"
        >
          <div className="flex items-center gap-2 text-[#172554]">
            <KeyRound className="h-4 w-4 text-[#2563EB] shrink-0" aria-hidden="true" />
            <h2 className="font-display text-sm font-bold">
              Role Test Credentials (Stage 1 Frontend Preview)
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
