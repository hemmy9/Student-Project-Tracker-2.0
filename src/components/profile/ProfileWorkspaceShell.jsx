import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Building2,
  Check,
  KeyRound,
  Lock,
  Mail,
  RotateCcw,
  ShieldCheck,
  User,
} from 'lucide-react';
import {
  getScopedUserProfile,
  resolveWorkspaceInstitution,
  useDemoAppState,
} from '../../context/DemoAppStateContext';
import { useDemoSession } from '../../context/DemoSessionContext';
import { useToast } from '../../context/ToastContext';
import { getCurrentLocalTimestamp } from '../../utils/dateHelper';
import { getDashboardPathForRole, getProfilePathForRole } from '../../utils/roleRouting';
import PortalStatusBadge from '../layout/PortalStatusBadge';
import Button from '../ui/Button';
import FormField from '../ui/FormField';
import StatusAlert from '../ui/StatusAlert';
import NotificationPreferencesPanel from './NotificationPreferencesPanel';

export default function ProfileWorkspaceShell({
  portalTitle,
  portalSubtitle,
  systemFields = [],
  roleStats = [],
  roleEditableConfig = [],
  quickLinks = [],
  children,
}) {
  const { session, activeMembership, isLiveSupabase, switchMembership } = useDemoSession();
  const { state, updateUserProfile } = useDemoAppState();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const institutionName = resolveWorkspaceInstitution(activeMembership, session);
  const roleKey = activeMembership?.roleKey || '';
  const email = session?.email || '';

  const scopedProfile = getScopedUserProfile(
    state.userProfiles,
    email,
    roleKey,
    institutionName
  );

  const [preferredDisplayTitle, setPreferredDisplayTitle] = useState(
    scopedProfile.preferredDisplayTitle || ''
  );
  const [phone, setPhone] = useState(scopedProfile.phone || '');
  const [alternativeContact, setAlternativeContact] = useState(
    scopedProfile.alternativeContact || ''
  );
  const [bio, setBio] = useState(scopedProfile.bio || '');
  const [roleValues, setRoleValues] = useState(() => {
    const initial = {};
    roleEditableConfig.forEach((field) => {
      initial[field.key] = scopedProfile[field.key] || '';
    });
    return initial;
  });
  const [errors, setErrors] = useState({});
  const [savedAt, setSavedAt] = useState('');

  useEffect(() => {
    const nextScoped = getScopedUserProfile(
      state.userProfiles,
      email,
      roleKey,
      institutionName
    );
    setPreferredDisplayTitle(nextScoped.preferredDisplayTitle || '');
    setPhone(nextScoped.phone || '');
    setAlternativeContact(nextScoped.alternativeContact || '');
    setBio(nextScoped.bio || '');
    const nextRoleVals = {};
    roleEditableConfig.forEach((field) => {
      nextRoleVals[field.key] = nextScoped[field.key] || '';
    });
    setRoleValues(nextRoleVals);
    setErrors({});
  }, [email, roleKey, institutionName, activeMembership?.id, state.userProfiles, roleEditableConfig]);

  if (!session || !activeMembership) return null;

  const isGenuineLiveSession = Boolean(isLiveSupabase && session.isDemoPreview === false);
  const displayInstitution = institutionName || activeMembership.institutionName || 'Workspace Scope';

  const validateForm = () => {
    const nextErrors = {};
    if (preferredDisplayTitle.trim().length > 60) {
      nextErrors.preferredDisplayTitle = 'Display title must be 60 characters or fewer.';
    }
    if (phone.trim().length > 40) {
      nextErrors.phone = 'Contact phone must be 40 characters or fewer.';
    }
    if (alternativeContact.trim().length > 120) {
      nextErrors.alternativeContact = 'Secondary contact note must be 120 characters or fewer.';
    }
    if (bio.trim().length > 400) {
      nextErrors.bio = 'Academic profile bio must be 400 characters or fewer.';
    }
    roleEditableConfig.forEach((field) => {
      const val = (roleValues[field.key] || '').trim();
      if (val.length > 400) {
        nextErrors[field.key] = `${field.label} must be 400 characters or fewer.`;
      } else if (
        field.key === 'consultationLink' &&
        val &&
        !/^https?:\/\/\S+$/i.test(val)
      ) {
        nextErrors[field.key] =
          'Enter a valid http:// or https:// meeting link, or leave blank.';
      }
    });
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    updateUserProfile(
      email,
      {
        preferredDisplayTitle,
        phone,
        alternativeContact,
        bio,
        ...roleValues,
      },
      { roleKey, institutionName: displayInstitution }
    );

    const ts = getCurrentLocalTimestamp();
    setSavedAt(ts);
    showToast({
      type: 'success',
      title: 'Profile updated locally',
      message: `Saved editable details for ${activeMembership.roleLabel} (${displayInstitution}).`,
    });
  };

  const handleResetToSaved = () => {
    const current = getScopedUserProfile(state.userProfiles, email, roleKey, institutionName);
    setPreferredDisplayTitle(current.preferredDisplayTitle || '');
    setPhone(current.phone || '');
    setAlternativeContact(current.alternativeContact || '');
    setBio(current.bio || '');
    const resetRoleVals = {};
    roleEditableConfig.forEach((field) => {
      resetRoleVals[field.key] = current[field.key] || '';
    });
    setRoleValues(resetRoleVals);
    setErrors({});
    setSavedAt('');
  };

  const handleSwitchMembership = (mem) => {
    switchMembership(mem.id);
    const targetProfile = getProfilePathForRole(mem.roleKey);
    navigate(targetProfile || getDashboardPathForRole(mem.roleKey));
  };

  const portalMemberships = session.memberships.filter((m) => m.roleKey !== 'platform_admin');

  return (
    <div className="space-y-6">
      {/* Page Heading & Standing */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-semibold text-[var(--accent-primary)]">
              {displayInstitution}
            </span>
            <PortalStatusBadge compact />
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
            {portalTitle}
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">{portalSubtitle}</p>
        </div>

        <Link
          to={getDashboardPathForRole(roleKey)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--accent-primary)] hover:underline whitespace-nowrap"
        >
          <span>Return to {activeMembership.roleLabel} Overview</span>
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>

      {/* Persistence Mode Disclosure */}
      <StatusAlert
        type={isGenuineLiveSession ? 'success' : 'info'}
        title={
          isGenuineLiveSession
            ? 'Live Session Active · Local Preview Profile Controls'
            : 'Local Demo Profile Persistence (Not Live Supabase Auth)'
        }
      >
        Editable personal and role-scoped fields save only in your browser&apos;s local storage for
        this workspace preview. Password changes, primary authentication email updates, Multi-Factor
        Authentication (MFA), and institutional role approvals require Stage D Supabase Auth &amp;
        PostgreSQL Row Level Security (RLS).
      </StatusAlert>

      {/* Role-Specific Live Workspace Metrics (when available) */}
      {roleStats.length > 0 && (
        <section
          aria-label="Role workspace summary metrics"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {roleStats.map((stat) => (
            <div
              key={stat.label}
              className="spt-surface rounded-2xl p-4 sm:p-5 space-y-1"
            >
              <p className="text-xs font-medium text-[var(--text-muted)]">{stat.label}</p>
              <p className="font-display text-xl sm:text-2xl font-bold text-[var(--text-primary)] tabular-nums">
                {stat.value}
              </p>
              {stat.hint && (
                <p className="text-xs text-[var(--text-muted)]">{stat.hint}</p>
              )}
            </div>
          ))}
        </section>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
        {/* Left Column: System-Controlled Identity + Auth Boundaries + Memberships */}
        <div className="lg:col-span-5 space-y-6">
          <section
            aria-label="System-controlled identity and academic record"
            className="spt-surface rounded-2xl p-5 sm:p-6 space-y-4"
          >
            <div className="flex items-start justify-between gap-3 border-b border-[var(--border-subtle)] pb-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#2563EB] text-white">
                  <User className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <h2 className="font-display text-base font-bold text-[var(--text-primary)] truncate">
                    {session.fullName}
                  </h2>
                  <p className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] truncate">
                    <Mail className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    <span className="truncate">{session.email}</span>
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-2 py-1 font-mono text-[10px] font-semibold text-[var(--text-muted)] shrink-0">
                <Lock className="h-3 w-3" aria-hidden="true" />
                <span>System-Controlled</span>
              </span>
            </div>

            <dl className="space-y-3 text-xs sm:text-sm">
              <div className="flex items-start justify-between gap-3">
                <dt className="text-[var(--text-muted)]">Active Role</dt>
                <dd className="font-semibold text-[var(--text-primary)] text-right">
                  {activeMembership.roleLabel}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-3">
                <dt className="text-[var(--text-muted)]">Institution Scope</dt>
                <dd className="font-semibold text-[var(--text-primary)] text-right">
                  {displayInstitution}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-3">
                <dt className="text-[var(--text-muted)]">Membership Status</dt>
                <dd className="font-semibold text-emerald-700 dark:text-emerald-400 text-right">
                  {activeMembership.status || 'Unknown'}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-3">
                <dt className="text-[var(--text-muted)]">Scope Assignment</dt>
                <dd className="font-medium text-[var(--text-primary)] text-right">
                  {activeMembership.scopeLabel || 'Standard Portal Access'}
                </dd>
              </div>
              {systemFields.map((field) => (
                <div
                  key={field.label}
                  className="flex items-start justify-between gap-3 border-t border-[var(--border-subtle)] pt-2.5"
                >
                  <dt className="text-[var(--text-muted)]">{field.label}</dt>
                  <dd
                    className={`font-medium text-[var(--text-primary)] text-right break-words max-w-[60%] ${
                      field.mono ? 'font-mono text-xs tabular-nums' : ''
                    }`}
                  >
                    {field.value}
                  </dd>
                </div>
              ))}
            </dl>

            <p className="border-t border-[var(--border-subtle)] pt-3 text-[11px] text-[var(--text-muted)] leading-relaxed">
              Identity, institutional membership standing, role permissions, and verified academic
              records are governed by institutional administration and Stage D RLS policies and
              cannot be altered from this profile editor.
            </p>
          </section>

          {/* Authentication & Security Boundaries (Stage D Deferred) */}
          <section
            aria-label="Authentication and security settings"
            className="spt-surface rounded-2xl p-5 sm:p-6 space-y-3"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-[var(--accent-primary)]" aria-hidden="true" />
                <h2 className="font-display text-sm font-bold text-[var(--text-primary)]">
                  Authentication &amp; Security
                </h2>
              </div>
              <span className="font-mono text-[10px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                Stage D Deferred
              </span>
            </div>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Account security actions are intentionally locked in local demonstration mode and will
              activate once connected to live Supabase Auth:
            </p>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center justify-between gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3.5 py-2.5">
                <span className="font-medium text-[var(--text-secondary)]">
                  Primary Authentication Email
                </span>
                <span className="font-mono text-[11px] text-[var(--text-muted)]">
                  Requires Stage D
                </span>
              </li>
              <li className="flex items-center justify-between gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3.5 py-2.5">
                <span className="font-medium text-[var(--text-secondary)]">
                  Password Reset &amp; Rotation
                </span>
                <span className="font-mono text-[11px] text-[var(--text-muted)]">
                  Requires Stage D
                </span>
              </li>
              <li className="flex items-center justify-between gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3.5 py-2.5">
                <span className="font-medium text-[var(--text-secondary)]">
                  Multi-Factor Authentication (MFA)
                </span>
                <span className="font-mono text-[11px] text-[var(--text-muted)]">
                  Requires Stage D
                </span>
              </li>
            </ul>
          </section>

          {/* Institutional Memberships */}
          <section
            aria-label="Institutional memberships"
            className="spt-surface rounded-2xl p-5 sm:p-6 space-y-3"
          >
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-[var(--accent-primary)]" aria-hidden="true" />
              <h2 className="font-display text-sm font-bold text-[var(--text-primary)]">
                Institutional Memberships ({portalMemberships.length})
              </h2>
            </div>

            <div className="space-y-2">
              {portalMemberships.map((mem) => {
                const isActive = mem.id === activeMembership.id;
                return (
                  <button
                    key={mem.id}
                    type="button"
                    onClick={() => handleSwitchMembership(mem)}
                    className={`w-full min-h-[44px] rounded-xl border p-3 text-left transition-colors cursor-pointer ${
                      isActive
                        ? 'border-[#2563EB] bg-[#2563EB]/10 dark:bg-[#3B82F6]/15'
                        : 'border-[var(--border-subtle)] bg-[var(--bg-elevated)] hover:border-[var(--border-strong)]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-[var(--text-primary)]">
                        {mem.roleLabel}
                      </span>
                      <span className="text-[11px] font-semibold text-[var(--accent-primary)]">
                        {isActive ? 'Current Workspace' : 'Switch Workspace'}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">{mem.institutionName}</p>
                    <p className="text-[11px] text-[var(--text-muted)] mt-0.5">{mem.scopeLabel}</p>
                  </button>
                );
              })}
            </div>

            {quickLinks.length > 0 && (
              <div className="border-t border-[var(--border-subtle)] pt-3 flex flex-wrap gap-3">
                {quickLinks.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="text-xs font-semibold text-[var(--accent-primary)] hover:underline"
                  >
                    {item.label} →
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right Column: Editable Profile Form + Role-Specific Read-Only Workspace Summary */}
        <div className="lg:col-span-7 space-y-6">
          <section
            aria-label="Editable profile details"
            className="spt-surface rounded-2xl p-5 sm:p-7 space-y-5"
          >
            <div className="flex flex-col gap-2 border-b border-[var(--border-subtle)] pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <ShieldCheck
                    className="h-4 w-4 text-[var(--accent-primary)]"
                    aria-hidden="true"
                  />
                  <h2 className="font-display text-lg font-bold text-[var(--text-primary)]">
                    Profile Editor
                  </h2>
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Personal contact notes are shared across your account; role-specific workspace
                  notes are isolated to {activeMembership.roleLabel} at {displayInstitution}.
                </p>
              </div>
              {savedAt && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 shrink-0">
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Saved {savedAt}</span>
                </span>
              )}
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  id="profile-display-title"
                  label="Preferred Salutation / Title"
                  value={preferredDisplayTitle}
                  onChange={(e) => setPreferredDisplayTitle(e.target.value)}
                  placeholder="e.g., Mr., Ms., Dr., Engr."
                  error={errors.preferredDisplayTitle}
                  helperText="Optional display salutation note."
                />
                <FormField
                  id="profile-phone"
                  label="Contact Phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g., +234 800 000 0000"
                  error={errors.phone}
                  helperText="Stored locally in browser workspace."
                />
              </div>

              <FormField
                id="profile-alt-contact"
                label="Secondary / Backup Contact Note"
                value={alternativeContact}
                onChange={(e) => setAlternativeContact(e.target.value)}
                placeholder="e.g., Department desk extension or alternate contact hours"
                error={errors.alternativeContact}
              />

              <FormField
                id="profile-bio"
                label="Personal & Academic Summary"
                as="textarea"
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Brief overview of your academic background or project interests..."
                error={errors.bio}
              />

              {roleEditableConfig.length > 0 && (
                <div className="border-t border-[var(--border-subtle)] pt-4 space-y-4">
                  <div>
                    <h3 className="font-display text-sm font-bold text-[var(--text-primary)]">
                      {activeMembership.roleLabel} Preferences ({displayInstitution})
                    </h3>
                    <p className="text-xs text-[var(--text-muted)]">
                      Isolated to your {activeMembership.roleLabel} role at {displayInstitution}.
                    </p>
                  </div>

                  {roleEditableConfig.map((field) => (
                    <FormField
                      key={field.key}
                      id={`profile-role-${field.key}`}
                      label={field.label}
                      as={field.as || 'input'}
                      rows={field.rows || 2}
                      value={roleValues[field.key] || ''}
                      onChange={(e) =>
                        setRoleValues((prev) => ({ ...prev, [field.key]: e.target.value }))
                      }
                      placeholder={field.placeholder || ''}
                      helperText={field.helperText || ''}
                      error={errors[field.key]}
                    />
                  ))}
                </div>
              )}

              <div className="flex flex-col-reverse gap-3 border-t border-[var(--border-subtle)] pt-4 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={handleResetToSaved}
                  className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-4 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Discard Unsaved Edits</span>
                </button>

                <Button type="submit" variant="primary" size="md">
                  Save Profile Changes
                </Button>
              </div>
            </form>
          </section>

          <NotificationPreferencesPanel />

          {children}
        </div>
      </div>
    </div>
  );
}
