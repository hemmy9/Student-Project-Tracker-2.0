import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  GraduationCap,
  KeyRound,
  LockKeyhole,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import BrandLogo from '../components/brand/BrandLogo';
import PublicFooter from '../components/layout/PublicFooter';
import PublicHeader from '../components/layout/PublicHeader';
import { FadeInSection, PerspectiveCard } from '../components/ui/MotionPrimitives';
import { GRACE_POLYTECHNIC_BRAND } from '../config/gracePolytechnic';
import { useSupabaseService } from '../hooks/useSupabaseService';
import { supabase } from '../lib/supabaseClient';
import { normalizeAppError } from '../utils/errorHandler';
import { validatePassword } from '../utils/validation';

const PORTAL_GATEWAYS = [
  {
    id: 'student',
    badge: 'STUDENT PORTAL',
    title: 'Student Sign In',
    subtitle: 'Access ND & HND project tasks, weekly journals, chapters, and office hours.',
    to: '/login/student',
    icon: GraduationCap,
    border: 'border-t-[#2563EB]',
    badgeColor: 'text-[#3B82F6]',
    iconBox: 'border-blue-500/25 bg-blue-500/12 text-[#3B82F6]',
    btn: 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white',
    footerNote: 'Supports email or demo Student ID',
  },
  {
    id: 'supervisor',
    badge: 'SUPERVISOR PORTAL',
    title: 'Supervisor Sign In',
    subtitle: 'Review chapter submissions, leave milestone feedback, and host office hours.',
    to: '/login/supervisor',
    icon: UserCheck,
    border: 'border-t-[#0D9488]',
    badgeColor: 'text-[#14B8A6]',
    iconBox: 'border-teal-500/25 bg-teal-500/12 text-[#14B8A6]',
    btn: 'bg-[#0D9488] hover:bg-[#0F766E] text-white',
    footerNote: 'Admin-provisioned or invited faculty accounts',
  },
  {
    id: 'institution_admin',
    badge: 'INSTITUTION ADMIN',
    title: 'Institution Admin Sign In',
    subtitle: 'Manage Grace Polytechnic departments, sessions, approvals, and supervisor roles.',
    to: '/login/admin',
    icon: Building2,
    border: 'border-t-[#6366F1]',
    badgeColor: 'text-[#8B5CF6]',
    iconBox: 'border-violet-500/25 bg-violet-500/12 text-[#8B5CF6]',
    btn: 'bg-[#6366F1] hover:bg-[#4F46E5] text-white',
    footerNote: 'Restricted to authorized coordinators',
  },
];

export default function LoginPage() {
  const { isConfigured: supabaseReady, updatePassword } = useSupabaseService();
  const [recoveryMode, setRecoveryMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    const hash = window.location.hash || '';
    const search = window.location.search || '';
    return hash.includes('type=recovery') || search.includes('type=recovery');
  });
  const [newPassword, setNewPassword] = useState('');
  const [recoveryStatus, setRecoveryStatus] = useState(null);
  const [recoveryLoading, setRecoveryLoading] = useState(false);

  useEffect(() => {
    if (!supabaseReady || !supabase) return undefined;
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setRecoveryMode(true);
      }
    });
    return () => subscription.unsubscribe();
  }, [supabaseReady]);

  const handleCompleteRecovery = async (e) => {
    e.preventDefault();
    const err = validatePassword(newPassword);
    if (err) {
      setRecoveryStatus({ type: 'error', message: err });
      return;
    }

    if (!supabaseReady) {
      setRecoveryStatus({
        type: 'error',
        message: 'Live Supabase Auth must be configured to update your account password.',
      });
      return;
    }

    setRecoveryLoading(true);
    setRecoveryStatus(null);
    try {
      await updatePassword(newPassword);
      setRecoveryStatus({
        type: 'success',
        message: 'Your password has been updated. Choose your portal below to continue.',
      });
      setNewPassword('');
      setRecoveryMode(false);
    } catch (updateErr) {
      setRecoveryStatus({
        type: 'error',
        message: normalizeAppError(updateErr, 'Unable to update your password.'),
      });
    } finally {
      setRecoveryLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-canvas)] text-[var(--text-primary)] transition-colors duration-200">
      <PublicHeader />

      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex min-h-[40px] items-center gap-2 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span>Back to {GRACE_POLYTECHNIC_BRAND.institutionName} homepage</span>
          </Link>
        </div>

        <FadeInSection className="max-w-2xl space-y-3 mb-8">
          <BrandLogo size="sm" showInstitution />
          <p className="font-mono text-xs font-semibold tracking-wider text-[var(--accent-primary)] pt-2">
            PORTAL SIGN-IN GATEWAY
          </p>
          <h1 className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)] text-balance">
            Choose your {GRACE_POLYTECHNIC_BRAND.institutionName} portal.
          </h1>
          <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
            Each role uses a dedicated sign-in experience with role verification enforced across both the interface and Supabase permissions.
          </p>
        </FadeInSection>

        {recoveryMode && (
          <div className="mb-8 rounded-2xl spt-surface border-t-4 border-t-[#2563EB] p-6 space-y-4">
            <div className="flex items-center gap-2.5 text-[var(--accent-primary)]">
              <KeyRound className="h-5 w-5 shrink-0" aria-hidden="true" />
              <h2 className="font-display text-lg font-bold text-[var(--text-primary)]">
                Complete Password Recovery
              </h2>
            </div>
            <p className="text-sm text-[var(--text-muted)]">
              Enter a new strong password for your Grace Polytechnic account below.
            </p>
            {recoveryStatus && (
              <div
                role={recoveryStatus.type === 'error' ? 'alert' : 'status'}
                className={`rounded-xl border px-4 py-3 text-xs sm:text-sm ${
                  recoveryStatus.type === 'error'
                    ? 'border-red-500/35 bg-red-500/10 text-red-500'
                    : 'border-emerald-500/35 bg-emerald-500/10 text-emerald-500'
                }`}
              >
                {recoveryStatus.message}
              </div>
            )}
            <form onSubmit={handleCompleteRecovery} className="flex flex-col sm:flex-row gap-3">
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min 8 chars)"
                aria-label="New password"
                className="min-h-[44px] flex-1 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-elevated)] px-3.5 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-none"
              />
              <button
                type="submit"
                disabled={recoveryLoading}
                className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1D4ED8] disabled:opacity-60 cursor-pointer whitespace-nowrap"
              >
                {recoveryLoading ? 'Updating...' : 'Save new password'}
              </button>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {PORTAL_GATEWAYS.map((portal) => {
            const Icon = portal.icon;
            return (
              <PerspectiveCard key={portal.id} maxTilt={3.5} hoverLift={-4} className="h-full">
                <div
                  className={`flex h-full flex-col justify-between rounded-2xl spt-surface border-t-4 ${portal.border} p-6 space-y-6`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`font-mono text-xs font-semibold ${portal.badgeColor}`}>
                        {portal.badge}
                      </span>
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl border ${portal.iconBox}`}
                      >
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <h2 className="font-display text-xl font-bold text-[var(--text-primary)]">
                        {portal.title}
                      </h2>
                      <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                        {portal.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <Link
                      to={portal.to}
                      className={`inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${portal.btn}`}
                    >
                      <span>Open {portal.title}</span>
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                    <p className="text-center text-xs text-[var(--text-muted)]">
                      {portal.footerNote}
                    </p>
                  </div>
                </div>
              </PerspectiveCard>
            );
          })}
        </div>

        <div className="mt-8 rounded-2xl spt-surface p-5 sm:p-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            {supabaseReady ? (
              <ShieldCheck className="h-5 w-5 mt-0.5 text-emerald-500 shrink-0" aria-hidden="true" />
            ) : (
              <LockKeyhole className="h-5 w-5 mt-0.5 text-[var(--accent-primary)] shrink-0" aria-hidden="true" />
            )}
            <div className="space-y-1">
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                {supabaseReady
                  ? 'Live Supabase Authentication Active'
                  : 'New Student or Supervisor at Grace Polytechnic?'}
              </p>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                {supabaseReady
                  ? 'Select your portal above to sign in with verified Grace Polytechnic credentials, or register a new student account.'
                  : 'Each portal page includes role-specific preview credentials when Supabase environment variables are not configured.'}
              </p>
            </div>
          </div>

          <Link
            to="/register/student"
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-elevated)] px-5 py-2.5 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors whitespace-nowrap shrink-0"
          >
            <CheckCircle2 className="h-4 w-4 text-[var(--accent-primary)]" aria-hidden="true" />
            <span>Student Registration</span>
          </Link>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
