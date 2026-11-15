import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../components/layout/AuthLayout';
import Button from '../components/ui/Button';
import FormField from '../components/ui/FormField';
import PasswordStrength from '../components/ui/PasswordStrength';
import StageNotice from '../components/ui/StageNotice';
import StatusAlert from '../components/ui/StatusAlert';
import { INSTITUTION_TYPES } from '../data/institutions';
import { useSupabaseService } from '../hooks/useSupabaseService';
import {
  validateConfirmPassword,
  validateDomain,
  validateEmail,
  validateMinLength,
  validatePassword,
  validateRequired,
} from '../utils/validation';

const INITIAL_FORM = {
  institutionName: '',
  institutionType: INSTITUTION_TYPES[0],
  officialDomain: '',
  countryCity: '',
  accreditationRef: '',
  estimatedStudents: '',
  adminFullName: '',
  adminTitle: '',
  adminEmail: '',
  password: '',
  confirmPassword: '',
  justification: '',
  declarationAccepted: false,
};

export default function InstitutionRegisterPage() {
  const { isConfigured: supabaseReady, submitInstitutionApplication } = useSupabaseService();
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [simulateError, setSimulateError] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);

  const validateField = (name, value, currentForm = form) => {
    switch (name) {
      case 'institutionName':
        return validateMinLength(value, 3, 'Institution name');
      case 'institutionType':
        return validateRequired(value, 'Institution type');
      case 'officialDomain':
        return validateDomain(value);
      case 'countryCity':
        return validateMinLength(value, 3, 'Country and city');
      case 'adminFullName':
        return validateMinLength(value, 2, 'Primary administrator name');
      case 'adminTitle':
        return validateRequired(value, 'Administrator job title');
      case 'adminEmail':
        return validateEmail(value, 'Official administrator email');
      case 'password':
        return validatePassword(value);
      case 'confirmPassword':
        return validateConfirmPassword(currentForm.password, value);
      case 'justification':
        return validateMinLength(value, 20, 'Application summary');
      case 'declarationAccepted':
        return value ? '' : 'Confirm that you are authorised to submit this application.';
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const nextValue = type === 'checkbox' ? checked : value;
    const nextForm = { ...form, [name]: nextValue };
    setForm(nextForm);

    if (touched[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: validateField(name, nextValue, nextForm),
        ...(name === 'password' && touched.confirmPassword
          ? { confirmPassword: validateConfirmPassword(nextValue, nextForm.confirmPassword) }
          : {}),
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, val, form) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fieldsToValidate = [
      'institutionName',
      'institutionType',
      'officialDomain',
      'countryCity',
      'adminFullName',
      'adminTitle',
      'adminEmail',
      'password',
      'confirmPassword',
      'justification',
      'declarationAccepted',
    ];

    const nextErrors = {};
    const nextTouched = {};
    fieldsToValidate.forEach((field) => {
      nextTouched[field] = true;
      const err = validateField(field, form[field], form);
      if (err) nextErrors[field] = err;
    });

    setTouched((prev) => ({ ...prev, ...nextTouched }));
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setSubmitResult({
        type: 'error',
        title: 'Incomplete or invalid application details',
        message: 'Review the highlighted fields below before submitting the institution application.',
      });
      return;
    }

    setLoading(true);
    setSubmitResult(null);

    if (supabaseReady && !simulateError) {
      try {
        const cleanDomain = form.officialDomain.trim().replace(/^https?:\/\//i, '');
        await submitInstitutionApplication({
          institutionName: form.institutionName.trim(),
          shortCode: cleanDomain.split('.')[0].slice(0, 6).toUpperCase(),
          domain: cleanDomain,
          country: form.countryCity.trim(),
          contactEmail: form.adminEmail.trim(),
          applicantName: `${form.adminFullName.trim()} (${form.adminTitle.trim()})`,
        });
        setLoading(false);
        setSubmitResult({
          type: 'success',
          title: 'Institution application submitted to Supabase',
          message: `Application for ${form.institutionName.trim()} (${cleanDomain}) was saved with status "pending_review" for Platform Administrator verification.`,
          summary: {
            institution: form.institutionName.trim(),
            domain: cleanDomain,
            applicant: `${form.adminFullName.trim()} (${form.adminTitle.trim()})`,
            contactEmail: form.adminEmail.trim(),
            initialStatus: 'Pending Platform Administrator Approval',
          },
        });
        return;
      } catch (err) {
        setLoading(false);
        setSubmitResult({
          type: 'error',
          title: 'Application submission failed',
          message: err.message || 'Unable to submit institution application to Supabase.',
        });
        return;
      }
    }

    setTimeout(() => {
      setLoading(false);
      if (simulateError) {
        setSubmitResult({
          type: 'error',
          title: 'Simulated submission error',
          message:
            'Could not reach the registration service (simulated test error). Your entered form values remain preserved.',
        });
        return;
      }

      setSubmitResult({
        type: 'success',
        title: 'Stage 1 preview: Institution application validated (not saved to database)',
        message: `Application preview prepared for ${form.institutionName.trim()} (${form.officialDomain.trim()}). Once Supabase environment keys are added, this submission writes directly to the institutions table with status "pending_review".`,
        summary: {
          institution: form.institutionName.trim(),
          domain: form.officialDomain.trim().replace(/^https?:\/\//i, ''),
          applicant: `${form.adminFullName.trim()} (${form.adminTitle.trim()})`,
          contactEmail: form.adminEmail.trim(),
          initialStatus: 'Pending Platform Administrator Approval',
        },
      });
    }, 650);
  };

  const handleReset = () => {
    setForm(INITIAL_FORM);
    setErrors({});
    setTouched({});
    setSubmitResult(null);
  };

  return (
    <AuthLayout
      title="Institution Registration Application"
      subtitle="Apply to onboard your university, faculty, or academic institute onto Student Project Tracker."
      backTo="/register"
      backLabel="Back to registration hub"
      contextHeading="How institution verification works"
      contextPoints={[
        'Institution registration is open, but applications remain pending until reviewed and approved by a Platform Administrator.',
        'Submitting this application does not activate an Institution Administrator portal immediately.',
        'Once approved, your institution receives an isolated multi-tenant workspace where departments, programmes, and memberships are managed privately.',
      ]}
    >
      <div className="space-y-6">
        <StageNotice
          simulateError={simulateError}
          onToggleSimulateError={setSimulateError}
          description="Stage 1 frontend preview: submitting validates your institutional application locally and shows the exact review workflow without writing to a database yet."
        />

        {submitResult && (
          <StatusAlert type={submitResult.type} title={submitResult.title}>
            <p>{submitResult.message}</p>
            {submitResult.summary && (
              <dl className="mt-3 grid grid-cols-1 gap-2 rounded-lg border border-emerald-200 bg-white/80 p-3 text-xs sm:grid-cols-2">
                <div>
                  <dt className="text-[#64748B]">Institution</dt>
                  <dd className="font-semibold text-[#172554]">{submitResult.summary.institution}</dd>
                </div>
                <div>
                  <dt className="text-[#64748B]">Official Domain</dt>
                  <dd className="font-mono text-[#172554]">{submitResult.summary.domain}</dd>
                </div>
                <div>
                  <dt className="text-[#64748B]">Primary Contact</dt>
                  <dd className="font-medium text-[#172554]">{submitResult.summary.applicant}</dd>
                </div>
                <div>
                  <dt className="text-[#64748B]">Workflow Status</dt>
                  <dd className="font-semibold text-amber-700">{submitResult.summary.initialStatus}</dd>
                </div>
              </dl>
            )}
          </StatusAlert>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          <fieldset className="space-y-4">
            <legend className="text-sm font-bold text-[#172554] border-b border-slate-100 pb-2 w-full">
              01. Institutional Details
            </legend>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <FormField
                  id="inst-name"
                  name="institutionName"
                  label="Official institution name"
                  placeholder="e.g. University of Westbridge"
                  value={form.institutionName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.institutionName}
                  required
                />
              </div>

              <FormField
                id="inst-type"
                name="institutionType"
                as="select"
                label="Institution category"
                value={form.institutionType}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.institutionType}
                options={INSTITUTION_TYPES}
                required
              />

              <FormField
                id="inst-domain"
                name="officialDomain"
                label="Official web domain"
                placeholder="westbridge.edu"
                value={form.officialDomain}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.officialDomain}
                helperText="Used to verify institutional email ownership."
                required
              />

              <FormField
                id="inst-location"
                name="countryCity"
                label="Country & city"
                placeholder="e.g. Accra, Ghana"
                value={form.countryCity}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.countryCity}
                required
              />

              <FormField
                id="inst-accreditation"
                name="accreditationRef"
                label="Accreditation or charter reference"
                placeholder="Optional registration code"
                value={form.accreditationRef}
                onChange={handleChange}
                helperText="Optional during Stage 1 preview."
              />
            </div>
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="text-sm font-bold text-[#172554] border-b border-slate-100 pb-2 w-full">
              02. Designated Administrator Contact
            </legend>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                id="inst-admin-name"
                name="adminFullName"
                label="Administrator full name"
                placeholder="Dr. Evelyn Mensah"
                value={form.adminFullName}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.adminFullName}
                required
              />

              <FormField
                id="inst-admin-title"
                name="adminTitle"
                label="Official role / job title"
                placeholder="e.g. Head of Department / Registrar"
                value={form.adminTitle}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.adminTitle}
                required
              />

              <FormField
                id="inst-admin-email"
                name="adminEmail"
                type="email"
                label="Official institutional email"
                placeholder="admin@westbridge.edu"
                value={form.adminEmail}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.adminEmail}
                required
              />

              <FormField
                id="inst-cohort"
                name="estimatedStudents"
                type="number"
                label="Estimated annual project cohort"
                placeholder="e.g. 250"
                value={form.estimatedStudents}
                onChange={handleChange}
                helperText="Approximate number of final-year / thesis students."
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <FormField
                  id="inst-password"
                  name="password"
                  type="password"
                  label="Create account password"
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
                id="inst-confirm-password"
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

            <FormField
              id="inst-justification"
              name="justification"
              as="textarea"
              rows={3}
              label="Academic scope & onboarding notes"
              placeholder="Briefly describe the departments or faculties planning to track student projects on the platform."
              value={form.justification}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.justification}
              required
            />
          </fieldset>

          <div className="space-y-1.5">
            <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-[#F8FAFC] p-3.5 text-xs sm:text-sm text-[#172554] cursor-pointer">
              <input
                type="checkbox"
                name="declarationAccepted"
                checked={form.declarationAccepted}
                onChange={handleChange}
                onBlur={handleBlur}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB] shrink-0"
              />
              <span className="leading-relaxed">
                I confirm that I am an authorised representative of this institution and understand that platform verification is required before institutional administrator access is granted.
              </span>
            </label>
            {errors.declarationAccepted && (
              <p role="alert" className="text-xs font-medium text-red-700">
                {errors.declarationAccepted}
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-1">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
              loadingText="Submitting application..."
            >
              Submit institution application
            </Button>
            {submitResult && (
              <Button type="button" variant="secondary" size="lg" onClick={handleReset}>
                Reset form
              </Button>
            )}
          </div>

          <p className="text-center text-sm text-[#64748B]">
            Already approved?{' '}
            <Link to="/login" className="font-semibold text-[#2563EB] hover:text-[#1D4ED8]">
              Sign in here
            </Link>
          </p>
        </form>
      </div>
    </AuthLayout>
  );
}
