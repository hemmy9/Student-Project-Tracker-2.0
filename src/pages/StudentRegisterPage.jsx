import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../components/layout/AuthLayout';
import Button from '../components/ui/Button';
import FormField from '../components/ui/FormField';
import PasswordStrength from '../components/ui/PasswordStrength';
import StageNotice from '../components/ui/StageNotice';
import StatusAlert from '../components/ui/StatusAlert';
import { ACADEMIC_LEVELS, DEMO_INSTITUTIONS } from '../data/institutions';
import {
  validateConfirmPassword,
  validateEmail,
  validateMinLength,
  validatePassword,
  validateRequired,
} from '../utils/validation';

export default function StudentRegisterPage() {
  const defaultInst = DEMO_INSTITUTIONS[0];
  const defaultDept = defaultInst.departments[0];

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    institutionId: defaultInst.id,
    departmentId: defaultDept.id,
    programme: defaultDept.programmes[0],
    studentNumber: '',
    academicLevel: ACADEMIC_LEVELS[1],
    expectedCompletionYear: '2027',
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

  const selectedDepartment = useMemo(
    () =>
      availableDepartments.find((dept) => dept.id === form.departmentId) ||
      availableDepartments[0],
    [availableDepartments, form.departmentId]
  );

  const availableProgrammes = selectedDepartment ? selectedDepartment.programmes : [];

  const validateField = (name, value, currentForm = form) => {
    switch (name) {
      case 'fullName':
        return validateMinLength(value, 2, 'Full name');
      case 'email':
        return validateEmail(value, 'Institutional email address');
      case 'institutionId':
        return validateRequired(value, 'Institution');
      case 'departmentId':
        return validateRequired(value, 'Department');
      case 'programme':
        return validateRequired(value, 'Academic programme');
      case 'studentNumber':
        return validateMinLength(value, 4, 'Student / Matriculation ID');
      case 'academicLevel':
        return validateRequired(value, 'Academic level');
      case 'expectedCompletionYear': {
        const yearNum = Number(value);
        if (!value || Number.isNaN(yearNum) || yearNum < 2025 || yearNum > 2035) {
          return 'Enter an expected completion year between 2025 and 2035.';
        }
        return '';
      }
      case 'password':
        return validatePassword(value);
      case 'confirmPassword':
        return validateConfirmPassword(currentForm.password, value);
      default:
        return '';
    }
  };

  const handleInstitutionChange = (e) => {
    const nextInstId = e.target.value;
    const nextInst = DEMO_INSTITUTIONS.find((item) => item.id === nextInstId) || DEMO_INSTITUTIONS[0];
    const nextDept = nextInst.departments[0];
    setForm((prev) => ({
      ...prev,
      institutionId: nextInstId,
      departmentId: nextDept.id,
      programme: nextDept.programmes[0],
    }));
    setSubmitResult(null);
  };

  const handleDepartmentChange = (e) => {
    const nextDeptId = e.target.value;
    const nextDept =
      availableDepartments.find((item) => item.id === nextDeptId) || availableDepartments[0];
    setForm((prev) => ({
      ...prev,
      departmentId: nextDeptId,
      programme: nextDept.programmes[0] || '',
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
        [name]: validateField(name, value, nextForm),
        ...(name === 'password' && touched.confirmPassword
          ? { confirmPassword: validateConfirmPassword(value, nextForm.confirmPassword) }
          : {}),
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value, form) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const fields = [
      'fullName',
      'email',
      'institutionId',
      'departmentId',
      'programme',
      'studentNumber',
      'academicLevel',
      'expectedCompletionYear',
      'password',
      'confirmPassword',
    ];

    const nextErrors = {};
    const nextTouched = {};
    fields.forEach((field) => {
      nextTouched[field] = true;
      const err = validateField(field, form[field], form);
      if (err) nextErrors[field] = err;
    });

    setTouched((prev) => ({ ...prev, ...nextTouched }));
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setSubmitResult({
        type: 'error',
        title: 'Please fix the errors below',
        message: 'All required academic and account fields must be valid before submitting.',
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
          title: 'Simulated registration error',
          message:
            'This demonstrates how network or duplicate-account errors are presented cleanly without losing your form input.',
        });
        return;
      }

      setSubmitResult({
        type: 'success',
        title: 'Stage 1 preview: Student registration validated (not saved to database)',
        message: `Your student details for ${selectedInstitution.name} passed validation. Once Supabase is connected in Stage 4, your institutional membership will be created with status "pending_institution_approval".`,
        summary: {
          student: form.fullName.trim(),
          institution: selectedInstitution.name,
          department: selectedDepartment.name,
          programme: form.programme,
          studentNumber: form.studentNumber.trim().toUpperCase(),
          membershipStatus: 'Pending Institution Administrator Approval',
        },
      });
    }, 700);
  };

  return (
    <AuthLayout
      title="Student Registration"
      subtitle="Select your institution and submit your academic profile to request student workspace access."
      backTo="/register"
      backLabel="Back to registration hub"
      contextHeading="Student membership approval flow"
      contextPoints={[
        'Choose from approved institutions currently listed on the platform (demonstration institutions shown for Stage 1 preview).',
        'Your institutional membership stays pending until an Institution Administrator verifies your student ID and department.',
        'Once approved and assigned to a project, you can track milestones, write weekly journals, and submit chapters to your supervisor.',
      ]}
    >
      <div className="space-y-6">
        <StageNotice
          simulateError={simulateError}
          onToggleSimulateError={setSimulateError}
          description="Stage 1 frontend preview: institution, department, and programme options use local demonstration records. No account or membership record is saved until Stage 4."
        />

        {submitResult && (
          <StatusAlert type={submitResult.type} title={submitResult.title}>
            <p>{submitResult.message}</p>
            {submitResult.summary && (
              <dl className="mt-3 grid grid-cols-1 gap-2 rounded-lg border border-emerald-200 bg-white/80 p-3 text-xs sm:grid-cols-2">
                <div>
                  <dt className="text-[#64748B]">Student</dt>
                  <dd className="font-semibold text-[#172554]">{submitResult.summary.student}</dd>
                </div>
                <div>
                  <dt className="text-[#64748B]">Student / Matric ID</dt>
                  <dd className="font-mono text-[#172554]">{submitResult.summary.studentNumber}</dd>
                </div>
                <div>
                  <dt className="text-[#64748B]">Institution &amp; Department</dt>
                  <dd className="font-medium text-[#172554]">
                    {submitResult.summary.institution} · {submitResult.summary.department}
                  </dd>
                </div>
                <div>
                  <dt className="text-[#64748B]">Membership Status</dt>
                  <dd className="font-semibold text-amber-700">
                    {submitResult.summary.membershipStatus}
                  </dd>
                </div>
              </dl>
            )}
          </StatusAlert>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          <fieldset className="space-y-4">
            <legend className="text-sm font-bold text-[#172554] border-b border-slate-100 pb-2 w-full">
              01. Institution &amp; Academic Placement
            </legend>

            <FormField
              id="stu-institution"
              name="institutionId"
              as="select"
              label="Select your institution"
              value={form.institutionId}
              onChange={handleInstitutionChange}
              error={errors.institutionId}
              options={DEMO_INSTITUTIONS.map((inst) => ({
                value: inst.id,
                label: `${inst.name} (${inst.location})`,
              }))}
              helperText={`Expected institutional domain: @${selectedInstitution.domain}`}
              required
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                id="stu-department"
                name="departmentId"
                as="select"
                label="Department"
                value={form.departmentId}
                onChange={handleDepartmentChange}
                error={errors.departmentId}
                options={availableDepartments.map((dept) => ({
                  value: dept.id,
                  label: dept.name,
                }))}
                required
              />

              <FormField
                id="stu-programme"
                name="programme"
                as="select"
                label="Academic programme"
                value={form.programme}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.programme}
                options={availableProgrammes}
                required
              />

              <FormField
                id="stu-number"
                name="studentNumber"
                label="Student / Matriculation ID"
                placeholder="e.g. UWB-2026-0418"
                value={form.studentNumber}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.studentNumber}
                required
              />

              <FormField
                id="stu-level"
                name="academicLevel"
                as="select"
                label="Academic level"
                value={form.academicLevel}
                onChange={handleChange}
                error={errors.academicLevel}
                options={ACADEMIC_LEVELS}
                required
              />
            </div>

            <div className="sm:w-1/2">
              <FormField
                id="stu-grad-year"
                name="expectedCompletionYear"
                type="number"
                label="Expected completion year"
                placeholder="2027"
                value={form.expectedCompletionYear}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.expectedCompletionYear}
                required
              />
            </div>
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="text-sm font-bold text-[#172554] border-b border-slate-100 pb-2 w-full">
              02. Personal Account Credentials
            </legend>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                id="stu-name"
                name="fullName"
                label="Full name"
                placeholder="e.g. Kwame Boateng"
                value={form.fullName}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.fullName}
                autoComplete="name"
                required
              />

              <FormField
                id="stu-email"
                name="email"
                type="email"
                label="Institutional email address"
                placeholder={`student@${selectedInstitution.domain}`}
                value={form.email}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.email}
                autoComplete="email"
                required
              />

              <div>
                <FormField
                  id="stu-password"
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
                id="stu-confirm-password"
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
            loadingText="Validating registration..."
          >
            Submit student registration
          </Button>

          <p className="text-center text-sm text-[#64748B]">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-[#2563EB] hover:text-[#1D4ED8]">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </AuthLayout>
  );
}
