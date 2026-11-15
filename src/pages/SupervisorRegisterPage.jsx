import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../components/layout/AuthLayout';
import Button from '../components/ui/Button';
import FormField from '../components/ui/FormField';
import PasswordStrength from '../components/ui/PasswordStrength';
import StageNotice from '../components/ui/StageNotice';
import StatusAlert from '../components/ui/StatusAlert';
import {
  DEMO_INSTITUTIONS,
  SAMPLE_INVITE_CODES,
  SUPERVISOR_TITLES,
} from '../data/institutions';
import {
  validateConfirmPassword,
  validateEmail,
  validateInviteCode,
  validateMinLength,
  validatePassword,
  validateRequired,
} from '../utils/validation';

export default function SupervisorRegisterPage() {
  const defaultInst = DEMO_INSTITUTIONS[0];
  const [mode, setMode] = useState('request'); // 'request' | 'invite'

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    academicTitle: SUPERVISOR_TITLES[2],
    institutionId: defaultInst.id,
    departmentId: defaultInst.departments[0].id,
    staffId: '',
    specialization: '',
    inviteCode: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [simulateError, setSimulateError] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);

  const selectedInstitution = useMemo(
    () => DEMO_INSTITUTIONS.find((inst) => inst.id === form.institutionId) || DEMO_INSTITUTIONS[0],
    [form.institutionId]
  );

  const availableDepartments = selectedInstitution.departments;

  const validateField = (name, value, currentForm = form, activeMode = mode) => {
    switch (name) {
      case 'fullName':
        return validateMinLength(value, 2, 'Full name');
      case 'email':
        return validateEmail(value, 'Institutional email address');
      case 'academicTitle':
        return validateRequired(value, 'Academic title');
      case 'institutionId':
        return activeMode === 'request' ? validateRequired(value, 'Institution') : '';
      case 'departmentId':
        return activeMode === 'request' ? validateRequired(value, 'Department') : '';
      case 'staffId':
        return activeMode === 'request' ? validateMinLength(value, 3, 'Staff / Faculty ID') : '';
      case 'specialization':
        return validateMinLength(value, 4, 'Research & supervision area');
      case 'inviteCode':
        return activeMode === 'invite' ? validateInviteCode(value) : '';
      case 'password':
        return validatePassword(value);
      case 'confirmPassword':
        return validateConfirmPassword(currentForm.password, value);
      default:
        return '';
    }
  };

  const handleModeSwitch = (nextMode) => {
    setMode(nextMode);
    setErrors({});
    setSubmitResult(null);
  };

  const handleInstitutionChange = (e) => {
    const nextInstId = e.target.value;
    const nextInst = DEMO_INSTITUTIONS.find((item) => item.id === nextInstId) || DEMO_INSTITUTIONS[0];
    setForm((prev) => ({
      ...prev,
      institutionId: nextInstId,
      departmentId: nextInst.departments[0].id,
    }));
    setSubmitResult(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const nextForm = { ...form, [name]: value };
    setForm(nextForm);
    setSubmitResult(null);

    if (touched[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: validateField(name, value, nextForm, mode),
        ...(name === 'password' && touched.confirmPassword
          ? { confirmPassword: validateConfirmPassword(value, nextForm.confirmPassword) }
          : {}),
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value, form, mode) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const commonFields = [
      'fullName',
      'email',
      'academicTitle',
      'specialization',
      'password',
      'confirmPassword',
    ];
    const modeFields =
      mode === 'request' ? ['institutionId', 'departmentId', 'staffId'] : ['inviteCode'];
    const allFields = [...commonFields, ...modeFields];

    const nextErrors = {};
    const nextTouched = {};
    allFields.forEach((field) => {
      nextTouched[field] = true;
      const err = validateField(field, form[field], form, mode);
      if (err) nextErrors[field] = err;
    });

    setTouched((prev) => ({ ...prev, ...nextTouched }));
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setSubmitResult({
        type: 'error',
        title: 'Please correct the highlighted fields',
        message: 'Ensure all required supervisor details and credentials are completed accurately.',
      });
      return;
    }

    setLoading(true);
    setSubmitResult(null);

    setTimeout(() => {
      setLoading(false);
      if (simulateError) {
        setSubmitResult({
          type: 'error',
          title: 'Simulated verification failure',
          message:
            'This demonstrates how an expired invitation code or server error will appear in Stage 4.',
        });
        return;
      }

      if (mode === 'invite') {
        const normalizedCode = form.inviteCode.trim().toUpperCase();
        setSubmitResult({
          type: 'success',
          title: 'Stage 1 preview: Invitation onboarding validated (not saved to database)',
          message: `Invitation code ${normalizedCode} and supervisor credentials for ${form.fullName.trim()} passed format validation. In Stage 4, the backend will verify the cryptographic invitation token before linking your supervisor role.`,
          summary: {
            supervisor: `${form.academicTitle} ${form.fullName.trim()}`,
            path: `Invitation Code (${normalizedCode})`,
            specialization: form.specialization.trim(),
            status: 'Awaiting Backend Invitation Token Verification (Stage 4)',
          },
        });
      } else {
        const deptName =
          availableDepartments.find((d) => d.id === form.departmentId)?.name || 'Selected Department';
        setSubmitResult({
          type: 'success',
          title: 'Stage 1 preview: Supervisor membership request validated (not saved)',
          message: `Membership request for ${selectedInstitution.name} passed client validation. In Stage 4, this request will be created with status "pending_institution_approval" until approved by an Institution Administrator.`,
          summary: {
            supervisor: `${form.academicTitle} ${form.fullName.trim()}`,
            path: `${selectedInstitution.name} · ${deptName}`,
            specialization: form.specialization.trim(),
            status: 'Pending Institution Administrator Approval',
          },
        });
      }
    }, 700);
  };

  return (
    <AuthLayout
      title="Supervisor Registration"
      subtitle="Request faculty supervision membership at an approved institution or accept an administrator invitation."
      backTo="/register"
      backLabel="Back to registration hub"
      contextHeading="Supervisor onboarding & role safety"
      contextPoints={[
        'Selecting Supervisor Registration does not grant access to student records immediately.',
        'Membership requests must be approved by the target Institution Administrator before any student projects become visible.',
        'If your department coordinator already issued an invitation code, switch to "Accept Invitation Code" to link your account via verified token.',
      ]}
    >
      <div className="space-y-6">
        {/* Segmented mode selector */}
        <div
          role="tablist"
          aria-label="Supervisor registration method"
          className="grid grid-cols-2 gap-1.5 rounded-xl border border-slate-200 bg-slate-100 p-1.5"
        >
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'request'}
            onClick={() => handleModeSwitch('request')}
            className={`min-h-[44px] rounded-lg px-3 py-2 text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
              mode === 'request'
                ? 'bg-[#172554] text-white shadow-xs'
                : 'text-[#64748B] hover:text-[#172554]'
            }`}
          >
            Request Membership
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'invite'}
            onClick={() => handleModeSwitch('invite')}
            className={`min-h-[44px] rounded-lg px-3 py-2 text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
              mode === 'invite'
                ? 'bg-[#172554] text-white shadow-xs'
                : 'text-[#64748B] hover:text-[#172554]'
            }`}
          >
            Accept Invitation Code
          </button>
        </div>

        <StageNotice
          simulateError={simulateError}
          onToggleSimulateError={setSimulateError}
          description="Stage 1 frontend preview: both supervisor registration workflows validate inputs locally without writing to a database or verifying live invitation tokens yet."
        />

        {submitResult && (
          <StatusAlert type={submitResult.type} title={submitResult.title}>
            <p>{submitResult.message}</p>
            {submitResult.summary && (
              <dl className="mt-3 grid grid-cols-1 gap-2 rounded-lg border border-emerald-200 bg-white/80 p-3 text-xs sm:grid-cols-2">
                <div>
                  <dt className="text-[#64748B]">Supervisor</dt>
                  <dd className="font-semibold text-[#172554]">{submitResult.summary.supervisor}</dd>
                </div>
                <div>
                  <dt className="text-[#64748B]">Onboarding Path</dt>
                  <dd className="font-medium text-[#172554]">{submitResult.summary.path}</dd>
                </div>
                <div>
                  <dt className="text-[#64748B]">Supervision Focus</dt>
                  <dd className="text-[#172554]">{submitResult.summary.specialization}</dd>
                </div>
                <div>
                  <dt className="text-[#64748B]">Workflow Status</dt>
                  <dd className="font-semibold text-amber-700">{submitResult.summary.status}</dd>
                </div>
              </dl>
            )}
          </StatusAlert>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          {mode === 'invite' ? (
            <fieldset className="space-y-4">
              <legend className="text-sm font-bold text-[#172554] border-b border-slate-100 pb-2 w-full">
                01. Invitation Verification
              </legend>

              <FormField
                id="sup-invite-code"
                name="inviteCode"
                label="Institution invitation code"
                placeholder="e.g. SPT-UWB-2026"
                value={form.inviteCode}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.inviteCode}
                helperText={`Sample test format for Stage 1 preview: ${SAMPLE_INVITE_CODES[0]}`}
                required
              />
            </fieldset>
          ) : (
            <fieldset className="space-y-4">
              <legend className="text-sm font-bold text-[#172554] border-b border-slate-100 pb-2 w-full">
                01. Target Institution &amp; Faculty Details
              </legend>

              <FormField
                id="sup-institution"
                name="institutionId"
                as="select"
                label="Institution"
                value={form.institutionId}
                onChange={handleInstitutionChange}
                error={errors.institutionId}
                options={DEMO_INSTITUTIONS.map((inst) => ({
                  value: inst.id,
                  label: `${inst.name} (${inst.location})`,
                }))}
                required
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  id="sup-department"
                  name="departmentId"
                  as="select"
                  label="Department"
                  value={form.departmentId}
                  onChange={handleChange}
                  error={errors.departmentId}
                  options={availableDepartments.map((dept) => ({
                    value: dept.id,
                    label: dept.name,
                  }))}
                  required
                />

                <FormField
                  id="sup-staff-id"
                  name="staffId"
                  label="Staff / Faculty ID"
                  placeholder="e.g. FAC-1042"
                  value={form.staffId}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.staffId}
                  required
                />
              </div>
            </fieldset>
          )}

          <fieldset className="space-y-4">
            <legend className="text-sm font-bold text-[#172554] border-b border-slate-100 pb-2 w-full">
              02. Academic Profile &amp; Credentials
            </legend>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                id="sup-title"
                name="academicTitle"
                as="select"
                label="Academic title"
                value={form.academicTitle}
                onChange={handleChange}
                error={errors.academicTitle}
                options={SUPERVISOR_TITLES}
                required
              />

              <FormField
                id="sup-name"
                name="fullName"
                label="Full name"
                placeholder="e.g. Samuel Osei"
                value={form.fullName}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.fullName}
                autoComplete="name"
                required
              />

              <FormField
                id="sup-email"
                name="email"
                type="email"
                label="Institutional email address"
                placeholder={`faculty@${selectedInstitution.domain}`}
                value={form.email}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.email}
                autoComplete="email"
                required
              />

              <FormField
                id="sup-specialization"
                name="specialization"
                label="Research & supervision area"
                placeholder="e.g. Distributed Systems, HCI"
                value={form.specialization}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.specialization}
                required
              />

              <div>
                <FormField
                  id="sup-password"
                  name="password"
                  type="password"
                  label="Create password"
                  placeholder="Minimum 8 characters"
                  value={form.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.password}
                  autoComplete="new-password"
                  required
                />
                <PasswordStrength password={form.password} />
              </div>

              <FormField
                id="sup-confirm-password"
                name="confirmPassword"
                type="password"
                label="Confirm password"
                placeholder="Re-enter password"
                value={form.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.confirmPassword}
                autoComplete="new-password"
                required
              />
            </div>
          </fieldset>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
            loadingText={
              mode === 'invite' ? 'Validating invitation...' : 'Submitting request...'
            }
          >
            {mode === 'invite'
              ? 'Validate invitation & register'
              : 'Submit supervisor membership request'}
          </Button>

          <p className="text-center text-sm text-[#64748B]">
            Already registered?{' '}
            <Link to="/login" className="font-semibold text-[#2563EB] hover:text-[#1D4ED8]">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </AuthLayout>
  );
}
