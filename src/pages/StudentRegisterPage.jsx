import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  BookOpen,
  Building2,
  CheckCircle2,
  Database,
  Eye,
  EyeOff,
  GraduationCap,
  Info,
  ShieldCheck,
} from 'lucide-react';
import AuthLayout from '../components/layout/AuthLayout';
import {
  GRACE_POLYTECHNIC_BRAND,
  GRACE_POLYTECHNIC_PROVISIONAL_CATALOGUE,
} from '../config/gracePolytechnic';
import { useToast } from '../context/ToastContext';
import { useSupabaseService } from '../hooks/useSupabaseService';
import { normalizeAppError } from '../utils/errorHandler';
import {
  getPasswordStrength,
  validateConfirmPassword,
  validateEmail,
  validateMinLength,
  validatePassword,
  validateRequired,
} from '../utils/validation';

const STRENGTH_BAR_COLORS = [
  'bg-[var(--bg-subtle)]',
  'bg-red-500',
  'bg-amber-500',
  'bg-[#2563EB]',
  'bg-emerald-500',
];

export default function StudentRegisterPage() {
  const { showToast } = useToast();
  const { isConfigured: supabaseReady, signUp, submitMembershipRequest } = useSupabaseService();

  const catalogue = GRACE_POLYTECHNIC_PROVISIONAL_CATALOGUE;
  const defaultSchool = catalogue.schools[0];
  const defaultDept =
    catalogue.departments.find((d) => d.schoolId === defaultSchool.id) || catalogue.departments[0];
  const defaultProgramme =
    catalogue.programmes.find((p) => p.departmentId === defaultDept.id) || catalogue.programmes[0];
  const defaultQualId = defaultProgramme.qualificationLevelIds[0] || catalogue.qualificationLevels[0].id;
  const defaultModeId = defaultProgramme.studyModeIds[0] || catalogue.studyModes[0].id;
  const defaultSession =
    catalogue.academicSessions.find((s) => s.isActive) || catalogue.academicSessions[0];

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    schoolId: defaultSchool.id,
    departmentId: defaultDept.id,
    programmeId: defaultProgramme.id,
    qualificationLevelId: defaultQualId,
    studyModeId: defaultModeId,
    academicSessionId: defaultSession.id,
    studentNumber: '',
    expectedCompletionYear: '2027',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [simulateError, setSimulateError] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);

  const selectedSchool = useMemo(
    () => catalogue.schools.find((s) => s.id === form.schoolId) || catalogue.schools[0],
    [catalogue.schools, form.schoolId]
  );

  const availableDepartments = useMemo(
    () => catalogue.departments.filter((d) => d.schoolId === selectedSchool.id),
    [catalogue.departments, selectedSchool.id]
  );

  const selectedDepartment = useMemo(
    () =>
      availableDepartments.find((d) => d.id === form.departmentId) ||
      availableDepartments[0] ||
      catalogue.departments[0],
    [availableDepartments, catalogue.departments, form.departmentId]
  );

  const availableProgrammes = useMemo(
    () => catalogue.programmes.filter((p) => p.departmentId === selectedDepartment.id),
    [catalogue.programmes, selectedDepartment.id]
  );

  const selectedProgramme = useMemo(
    () =>
      availableProgrammes.find((p) => p.id === form.programmeId) ||
      availableProgrammes[0] ||
      catalogue.programmes[0],
    [availableProgrammes, catalogue.programmes, form.programmeId]
  );

  const availableQualificationLevels = useMemo(() => {
    const allowedIds = selectedProgramme?.qualificationLevelIds || [];
    const matched = catalogue.qualificationLevels.filter((q) => allowedIds.includes(q.id));
    return matched.length > 0 ? matched : catalogue.qualificationLevels;
  }, [catalogue.qualificationLevels, selectedProgramme]);

  const selectedQualificationLevel = useMemo(
    () =>
      availableQualificationLevels.find((q) => q.id === form.qualificationLevelId) ||
      availableQualificationLevels[0],
    [availableQualificationLevels, form.qualificationLevelId]
  );

  const availableStudyModes = useMemo(() => {
    const allowedIds = selectedProgramme?.studyModeIds || [];
    const matched = catalogue.studyModes.filter((m) => allowedIds.includes(m.id));
    return matched.length > 0 ? matched : catalogue.studyModes;
  }, [catalogue.studyModes, selectedProgramme]);

  const selectedStudyMode = useMemo(
    () =>
      availableStudyModes.find((m) => m.id === form.studyModeId) || availableStudyModes[0],
    [availableStudyModes, form.studyModeId]
  );

  const selectedSession = useMemo(
    () =>
      catalogue.academicSessions.find((s) => s.id === form.academicSessionId) ||
      catalogue.academicSessions[0],
    [catalogue.academicSessions, form.academicSessionId]
  );

  const passwordStrength = useMemo(() => getPasswordStrength(form.password), [form.password]);

  const validateField = (name, value, currentForm = form) => {
    switch (name) {
      case 'fullName':
        return validateMinLength(value, 2, 'Full name');
      case 'email':
        return validateEmail(value, 'Institutional email address');
      case 'schoolId':
        return validateRequired(value, 'School');
      case 'departmentId':
        return validateRequired(value, 'Department');
      case 'programmeId':
        return validateRequired(value, 'Academic programme');
      case 'qualificationLevelId':
        return validateRequired(value, 'Qualification level');
      case 'studyModeId':
        return validateRequired(value, 'Study mode');
      case 'academicSessionId':
        return validateRequired(value, 'Academic session');
      case 'studentNumber':
        return validateMinLength(value, 4, 'Student / Matriculation ID');
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

  const handleSchoolChange = (e) => {
    const nextSchoolId = e.target.value;
    const nextDepts = catalogue.departments.filter((d) => d.schoolId === nextSchoolId);
    const nextDept = nextDepts[0] || catalogue.departments[0];
    const nextProgs = catalogue.programmes.filter((p) => p.departmentId === nextDept.id);
    const nextProg = nextProgs[0] || catalogue.programmes[0];
    const nextQualId =
      nextProg.qualificationLevelIds[0] || catalogue.qualificationLevels[0].id;
    const nextModeId = nextProg.studyModeIds[0] || catalogue.studyModes[0].id;

    setForm((prev) => ({
      ...prev,
      schoolId: nextSchoolId,
      departmentId: nextDept.id,
      programmeId: nextProg.id,
      qualificationLevelId: nextQualId,
      studyModeId: nextModeId,
    }));
    setSubmitResult(null);
  };

  const handleDepartmentChange = (e) => {
    const nextDeptId = e.target.value;
    const nextProgs = catalogue.programmes.filter((p) => p.departmentId === nextDeptId);
    const nextProg = nextProgs[0] || catalogue.programmes[0];
    const nextQualId =
      nextProg.qualificationLevelIds[0] || catalogue.qualificationLevels[0].id;
    const nextModeId = nextProg.studyModeIds[0] || catalogue.studyModes[0].id;

    setForm((prev) => ({
      ...prev,
      departmentId: nextDeptId,
      programmeId: nextProg.id,
      qualificationLevelId: nextQualId,
      studyModeId: nextModeId,
    }));
    setSubmitResult(null);
  };

  const handleProgrammeChange = (e) => {
    const nextProgId = e.target.value;
    const nextProg =
      catalogue.programmes.find((p) => p.id === nextProgId) || catalogue.programmes[0];

    setForm((prev) => {
      const keepQual = nextProg.qualificationLevelIds.includes(prev.qualificationLevelId);
      const keepMode = nextProg.studyModeIds.includes(prev.studyModeId);
      return {
        ...prev,
        programmeId: nextProgId,
        qualificationLevelId: keepQual
          ? prev.qualificationLevelId
          : nextProg.qualificationLevelIds[0] || catalogue.qualificationLevels[0].id,
        studyModeId: keepMode
          ? prev.studyModeId
          : nextProg.studyModeIds[0] || catalogue.studyModes[0].id,
      };
    });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fields = [
      'fullName',
      'email',
      'schoolId',
      'departmentId',
      'programmeId',
      'qualificationLevelId',
      'studyModeId',
      'academicSessionId',
      'studentNumber',
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
        title: 'Please fix the highlighted fields',
        message: 'All required Grace Polytechnic academic and account fields must be valid before submitting.',
      });
      return;
    }

    setLoading(true);
    setSubmitResult(null);

    const studentCode = form.studentNumber.trim().toUpperCase();
    const summaryDetails = {
      student: form.fullName.trim(),
      studentNumber: studentCode,
      institution: GRACE_POLYTECHNIC_BRAND.institutionName,
      school: selectedSchool.name,
      department: `${selectedDepartment.name} (${selectedDepartment.code})`,
      programme: selectedProgramme.name,
      qualificationAndMode: `${selectedQualificationLevel.code} · ${selectedStudyMode.label}`,
      academicSession: selectedSession.label,
    };

    if (supabaseReady && !simulateError) {
      try {
        // Store enriched Grace Polytechnic intake fields inside Supabase Auth user_metadata.
        // These intake values are provisional onboarding attributes only and are NEVER used
        // for role enforcement, approval state, or authorization.
        const data = await signUp({
          email: form.email.trim(),
          password: form.password,
          fullName: form.fullName.trim(),
          roleKey: 'student',
          metadata: {
            institution_code: 'grace-polytechnic',
            institution_name: GRACE_POLYTECHNIC_BRAND.institutionName,
            school: selectedSchool.name,
            department: selectedDepartment.name,
            department_code: selectedDepartment.code,
            programme: selectedProgramme.name,
            qualification_level: selectedQualificationLevel.code,
            academic_level: selectedQualificationLevel.label,
            study_mode: selectedStudyMode.label,
            academic_session: selectedSession.label,
            student_number: studentCode,
            expected_completion_year: form.expectedCompletionYear,
            catalogue_status: catalogue.catalogueStatus,
          },
        });

        // Case 1: Email confirmation enabled (no active session returned yet)
        if (!data?.session || !data?.user) {
          setLoading(false);
          setSubmitResult({
            type: 'info',
            title: 'Account creation started — email confirmation required',
            message:
              'Your Supabase Auth signup has started and a confirmation email was requested, so no active session was returned yet. Confirm your email first; institutional membership in Grace Polytechnic has NOT yet been confirmed or approved.',
            summary: {
              ...summaryDetails,
              authStatus: 'Account Created (Awaiting Email Confirmation)',
              membershipStatus: 'Not Yet Confirmed (Requires Link & Admin Approval)',
            },
          });
          return;
        }

        // Case 2: Active session returned — preserve existing submitMembershipRequest call
        // without passing nonexistent academic placement fields into institution_memberships.
        try {
          await submitMembershipRequest({
            userId: data.user.id,
            institutionId: null,
            roleKey: 'student',
            department: selectedDepartment.name,
            academicIdentifier: studentCode,
          });

          setLoading(false);
          setSubmitResult({
            type: 'success',
            title: 'Auth account created and membership request submitted',
            message:
              'Your Supabase Auth account was created and your Grace Polytechnic membership request was recorded. Access remains restricted until an Institution Administrator approves your membership.',
            summary: {
              ...summaryDetails,
              authStatus: 'Created (Active Session)',
              membershipStatus: 'Submitted — Pending Institution Administrator Approval',
            },
          });
        } catch (membershipErr) {
          // Transparently handle known Stage D schema/service incompatibility (status/metadata/institution_id UUID).
          // NEVER claim membership was submitted or approved when insertion fails.
          setLoading(false);
          setSubmitResult({
            type: 'info',
            title: 'Supabase Auth account created — institutional activation pending reconciliation',
            message: `Your Supabase Auth account was created with your provisional Grace Polytechnic intake details, but the institutional membership record could not be created yet (${normalizeAppError(
              membershipErr,
              'membership schema/institution record pending Stage D reconciliation'
            )}). Your institutional activation is NOT yet complete and portal access remains disabled until linked and approved by an Institution Administrator.`,
            summary: {
              ...summaryDetails,
              authStatus: 'Created in Supabase Auth',
              membershipStatus: 'Not Yet Linked — Pending Reconciliation',
            },
          });
        }
        return;
      } catch (err) {
        setLoading(false);
        setSubmitResult({
          type: 'error',
          title: 'Supabase student registration failed',
          message: normalizeAppError(err, 'Unable to complete student registration.'),
        });
        return;
      }
    }

    // Demo Preview path
    setTimeout(() => {
      setLoading(false);
      if (simulateError) {
        setSubmitResult({
          type: 'error',
          title: 'Simulated registration error',
          message:
            'This previews how network, duplicate-email, or validation rejections appear without clearing your form.',
        });
        return;
      }

      showToast({
        type: 'info',
        title: 'Preview validation passed',
        message: 'Configure Supabase env vars to create live Grace Polytechnic accounts.',
      });

      setSubmitResult({
        type: 'success',
        title: 'Preview mode: Grace Polytechnic student intake validated (not persisted)',
        message:
          'Your Grace Polytechnic academic placement and credentials passed client validation locally. Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to register in Supabase Auth.',
        summary: {
          ...summaryDetails,
          authStatus: 'Validated Locally (Demo Preview)',
          membershipStatus: 'Not Persisted — Pending Live Submission & Admin Approval',
        },
      });
    }, 450);
  };

  const renderResultBanner = (result) => {
    const styleMap = {
      error: {
        box: 'border-red-500/35 bg-red-500/10 text-red-700 dark:text-red-200',
        Icon: AlertCircle,
      },
      success: {
        box: 'border-emerald-500/35 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200',
        Icon: CheckCircle2,
      },
      info: {
        box: 'border-blue-500/35 bg-blue-500/10 text-[var(--text-primary)]',
        Icon: Info,
      },
    };
    const cfg = styleMap[result.type] || styleMap.info;
    const StatusIcon = cfg.Icon;

    return (
      <div
        role={result.type === 'error' ? 'alert' : 'status'}
        className={`rounded-xl border p-4 text-sm space-y-3 ${cfg.box}`}
      >
        <div className="flex items-start gap-3">
          <StatusIcon className="h-5 w-5 mt-0.5 shrink-0" aria-hidden="true" />
          <div className="min-w-0 flex-1 space-y-1">
            <p className="font-semibold leading-snug">{result.title}</p>
            <p className="text-xs sm:text-sm leading-relaxed opacity-90">{result.message}</p>
          </div>
        </div>

        {result.summary && (
          <dl className="grid grid-cols-1 gap-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-3.5 text-xs sm:grid-cols-2">
            <div>
              <dt className="text-[var(--text-muted)]">Student Name</dt>
              <dd className="font-semibold text-[var(--text-primary)]">{result.summary.student}</dd>
            </div>
            <div>
              <dt className="text-[var(--text-muted)]">Student / Matric ID</dt>
              <dd className="font-mono text-[var(--text-primary)]">{result.summary.studentNumber}</dd>
            </div>
            <div>
              <dt className="text-[var(--text-muted)]">School &amp; Department</dt>
              <dd className="font-medium text-[var(--text-primary)]">
                {result.summary.school} · {result.summary.department}
              </dd>
            </div>
            <div>
              <dt className="text-[var(--text-muted)]">Programme &amp; Level</dt>
              <dd className="font-medium text-[var(--text-primary)]">
                {result.summary.programme} ({result.summary.qualificationAndMode})
              </dd>
            </div>
            <div>
              <dt className="text-[var(--text-muted)]">Supabase Auth Status</dt>
              <dd className="font-semibold text-[var(--text-primary)]">
                {result.summary.authStatus}
              </dd>
            </div>
            <div>
              <dt className="text-[var(--text-muted)]">Institutional Membership</dt>
              <dd className="font-semibold text-amber-600 dark:text-amber-300">
                {result.summary.membershipStatus}
              </dd>
            </div>
          </dl>
        )}
      </div>
    );
  };

  const controlClass = (hasError) =>
    [
      'w-full min-h-[46px] rounded-xl border bg-[var(--bg-elevated)] px-3.5 py-2.5 text-base sm:text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] transition-colors focus:outline-none',
      hasError
        ? 'border-red-500 focus:ring-2 focus:ring-red-500/20'
        : 'border-[var(--border-strong)] focus:border-[var(--accent-primary)] focus:ring-2 focus:ring-blue-500/20',
    ].join(' ');

  return (
    <AuthLayout
      title="Grace Polytechnic Student Registration"
      subtitle="Submit your academic placement and create your student account for Grace Polytechnic project supervision."
      backTo="/login/student"
      backLabel="Back to Student Sign In"
      contextHeading="Grace Polytechnic student onboarding governance"
      contextPoints={[
        'Account registration records your provisional Grace Polytechnic intake details in Supabase Auth.',
        'Student portal access is granted ONLY after institutional membership is linked and approved by an Institution Administrator.',
        'Provisional schools, departments, ND/HND levels, and study modes await official Grace Polytechnic Academic Affairs verification.',
      ]}
    >
      <div className="space-y-6">
        {/* Fixed Grace Polytechnic Institution Identity */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-blue-500/25 bg-blue-500/8 px-4 py-3.5">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-500/25 bg-blue-500/15 text-[#3B82F6]">
              <Building2 className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="font-display text-sm font-bold text-[var(--text-primary)]">
                {GRACE_POLYTECHNIC_BRAND.institutionName}
              </p>
              <p className="text-xs text-[var(--text-muted)] truncate">
                {GRACE_POLYTECHNIC_BRAND.location} · {GRACE_POLYTECHNIC_BRAND.officialDomain}
              </p>
            </div>
          </div>
          <span className="font-mono text-[11px] font-semibold text-[#3B82F6]">
            SINGLE-INSTITUTION PORTAL
          </span>
        </div>

        {/* Provisional Catalogue Notice */}
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/8 p-3.5 text-xs text-[var(--text-secondary)]">
          <div className="flex items-start gap-2.5">
            <BookOpen className="h-4 w-4 mt-0.5 shrink-0 text-amber-500" aria-hidden="true" />
            <div className="space-y-1">
              <p className="font-semibold text-[var(--text-primary)]">
                Provisional Academic Catalogue Notice
              </p>
              <p className="leading-relaxed text-[var(--text-muted)]">
                {catalogue.verificationNote}{' '}
                <a
                  href={catalogue.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-[var(--accent-primary)] hover:underline"
                >
                  gracepolytechnic.edu.ng
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Auth Environment Mode Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-4 py-3 text-xs">
          <div className="flex items-center gap-2 font-semibold text-[var(--text-primary)]">
            {supabaseReady ? (
              <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" aria-hidden="true" />
            ) : (
              <Database className="h-4 w-4 text-[var(--accent-primary)] shrink-0" aria-hidden="true" />
            )}
            <span>
              {supabaseReady
                ? 'Live Supabase Auth Connected'
                : 'Preview Mode · Local Validation Only'}
            </span>
          </div>
          <label className="inline-flex items-center gap-2 text-xs text-[var(--text-muted)] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={simulateError}
              onChange={(e) => setSimulateError(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-[var(--border-strong)] accent-[#2563EB]"
            />
            <span>Simulate registration error</span>
          </label>
        </div>

        {submitResult && renderResultBanner(submitResult)}

        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          {/* 01. Academic Placement */}
          <fieldset className="space-y-4">
            <legend className="flex items-center gap-2 w-full border-b border-[var(--border-subtle)] pb-2 text-sm font-bold text-[var(--text-primary)]">
              <GraduationCap className="h-4 w-4 text-[#3B82F6]" aria-hidden="true" />
              <span>01. Grace Polytechnic Academic Placement (Provisional)</span>
            </legend>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label
                  htmlFor="stu-session"
                  className="block text-sm font-medium text-[var(--text-primary)]"
                >
                  Academic session <span className="text-red-500">*</span>
                </label>
                <select
                  id="stu-session"
                  name="academicSessionId"
                  value={form.academicSessionId}
                  onChange={handleChange}
                  className={controlClass(errors.academicSessionId)}
                >
                  {catalogue.academicSessions.map((sess) => (
                    <option key={sess.id} value={sess.id}>
                      {sess.label}
                      {sess.isActive ? ' (Active)' : ''}
                    </option>
                  ))}
                </select>
                {errors.academicSessionId && (
                  <p role="alert" className="text-xs font-medium text-red-500">
                    {errors.academicSessionId}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="stu-school"
                  className="block text-sm font-medium text-[var(--text-primary)]"
                >
                  School <span className="text-red-500">*</span>
                </label>
                <select
                  id="stu-school"
                  name="schoolId"
                  value={form.schoolId}
                  onChange={handleSchoolChange}
                  className={controlClass(errors.schoolId)}
                >
                  {catalogue.schools.map((school) => (
                    <option key={school.id} value={school.id}>
                      {school.name}
                    </option>
                  ))}
                </select>
                {errors.schoolId && (
                  <p role="alert" className="text-xs font-medium text-red-500">
                    {errors.schoolId}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="stu-department"
                  className="block text-sm font-medium text-[var(--text-primary)]"
                >
                  Department <span className="text-red-500">*</span>
                </label>
                <select
                  id="stu-department"
                  name="departmentId"
                  value={form.departmentId}
                  onChange={handleDepartmentChange}
                  className={controlClass(errors.departmentId)}
                >
                  {availableDepartments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name} ({dept.code})
                    </option>
                  ))}
                </select>
                {errors.departmentId && (
                  <p role="alert" className="text-xs font-medium text-red-500">
                    {errors.departmentId}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="stu-programme"
                  className="block text-sm font-medium text-[var(--text-primary)]"
                >
                  Programme <span className="text-red-500">*</span>
                </label>
                <select
                  id="stu-programme"
                  name="programmeId"
                  value={form.programmeId}
                  onChange={handleProgrammeChange}
                  className={controlClass(errors.programmeId)}
                >
                  {availableProgrammes.map((prog) => (
                    <option key={prog.id} value={prog.id}>
                      {prog.name}
                    </option>
                  ))}
                </select>
                {errors.programmeId && (
                  <p role="alert" className="text-xs font-medium text-red-500">
                    {errors.programmeId}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="stu-level"
                  className="block text-sm font-medium text-[var(--text-primary)]"
                >
                  Qualification level <span className="text-red-500">*</span>
                </label>
                <select
                  id="stu-level"
                  name="qualificationLevelId"
                  value={form.qualificationLevelId}
                  onChange={handleChange}
                  className={controlClass(errors.qualificationLevelId)}
                >
                  {availableQualificationLevels.map((lvl) => (
                    <option key={lvl.id} value={lvl.id}>
                      {lvl.label}
                    </option>
                  ))}
                </select>
                {errors.qualificationLevelId && (
                  <p role="alert" className="text-xs font-medium text-red-500">
                    {errors.qualificationLevelId}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="stu-mode"
                  className="block text-sm font-medium text-[var(--text-primary)]"
                >
                  Study mode <span className="text-red-500">*</span>
                </label>
                <select
                  id="stu-mode"
                  name="studyModeId"
                  value={form.studyModeId}
                  onChange={handleChange}
                  className={controlClass(errors.studyModeId)}
                >
                  {availableStudyModes.map((mode) => (
                    <option key={mode.id} value={mode.id}>
                      {mode.label}
                    </option>
                  ))}
                </select>
                {errors.studyModeId && (
                  <p role="alert" className="text-xs font-medium text-red-500">
                    {errors.studyModeId}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="stu-number"
                  className="block text-sm font-medium text-[var(--text-primary)]"
                >
                  Student / Matriculation ID <span className="text-red-500">*</span>
                </label>
                <input
                  id="stu-number"
                  name="studentNumber"
                  type="text"
                  value={form.studentNumber}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="e.g. GP/CSC/2025/001"
                  aria-invalid={Boolean(errors.studentNumber)}
                  className={controlClass(errors.studentNumber)}
                />
                {errors.studentNumber && (
                  <p role="alert" className="text-xs font-medium text-red-500">
                    {errors.studentNumber}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="stu-grad-year"
                  className="block text-sm font-medium text-[var(--text-primary)]"
                >
                  Expected completion year <span className="text-red-500">*</span>
                </label>
                <input
                  id="stu-grad-year"
                  name="expectedCompletionYear"
                  type="number"
                  value={form.expectedCompletionYear}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="2027"
                  aria-invalid={Boolean(errors.expectedCompletionYear)}
                  className={controlClass(errors.expectedCompletionYear)}
                />
                {errors.expectedCompletionYear && (
                  <p role="alert" className="text-xs font-medium text-red-500">
                    {errors.expectedCompletionYear}
                  </p>
                )}
              </div>
            </div>
          </fieldset>

          {/* 02. Personal Account Credentials */}
          <fieldset className="space-y-4">
            <legend className="w-full border-b border-[var(--border-subtle)] pb-2 text-sm font-bold text-[var(--text-primary)]">
              02. Personal Account Credentials
            </legend>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label
                  htmlFor="stu-name"
                  className="block text-sm font-medium text-[var(--text-primary)]"
                >
                  Full name <span className="text-red-500">*</span>
                </label>
                <input
                  id="stu-name"
                  name="fullName"
                  type="text"
                  value={form.fullName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="e.g. Toluwani Adeyemi"
                  autoComplete="name"
                  aria-invalid={Boolean(errors.fullName)}
                  className={controlClass(errors.fullName)}
                />
                {errors.fullName && (
                  <p role="alert" className="text-xs font-medium text-red-500">
                    {errors.fullName}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="stu-email"
                  className="block text-sm font-medium text-[var(--text-primary)]"
                >
                  Email address <span className="text-red-500">*</span>
                </label>
                <input
                  id="stu-email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder={`student@${GRACE_POLYTECHNIC_BRAND.officialDomain}`}
                  autoComplete="email"
                  aria-invalid={Boolean(errors.email)}
                  className={controlClass(errors.email)}
                />
                {errors.email && (
                  <p role="alert" className="text-xs font-medium text-red-500">
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="stu-password"
                  className="block text-sm font-medium text-[var(--text-primary)]"
                >
                  Create password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="stu-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Minimum 8 characters"
                    autoComplete="new-password"
                    aria-invalid={Boolean(errors.password)}
                    className={`${controlClass(errors.password)} pr-12`}
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

                {form.password && (
                  <div className="space-y-1.5 pt-1" aria-live="polite">
                    <div className="grid grid-cols-4 gap-1.5">
                      {[1, 2, 3, 4].map((segment) => (
                        <div
                          key={segment}
                          className={`h-1.5 rounded-full transition-colors ${
                            passwordStrength.score >= segment
                              ? STRENGTH_BAR_COLORS[passwordStrength.score]
                              : 'bg-[var(--bg-subtle)]'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-[var(--text-muted)]">
                      Password strength:{' '}
                      <span className="font-medium text-[var(--text-primary)]">
                        {passwordStrength.label}
                      </span>
                    </p>
                  </div>
                )}

                {errors.password && (
                  <p role="alert" className="text-xs font-medium text-red-500">
                    {errors.password}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="stu-confirm-password"
                  className="block text-sm font-medium text-[var(--text-primary)]"
                >
                  Confirm password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="stu-confirm-password"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={form.confirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Re-enter password"
                    autoComplete="new-password"
                    aria-invalid={Boolean(errors.confirmPassword)}
                    className={`${controlClass(errors.confirmPassword)} pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                    className="absolute inset-y-0 right-0 flex min-w-[44px] items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Eye className="h-4 w-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p role="alert" className="text-xs font-medium text-red-500">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>
          </fieldset>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex min-h-[48px] w-full items-center justify-center rounded-xl bg-[#2563EB] px-6 py-3 text-sm sm:text-base font-semibold text-white hover:bg-[#1D4ED8] transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading
              ? supabaseReady
                ? 'Creating Supabase student account...'
                : 'Validating registration...'
              : 'Submit student registration'}
          </button>

          <p className="text-center text-sm text-[var(--text-muted)]">
            Already have a Grace Polytechnic student account?{' '}
            <Link
              to="/login/student"
              className="font-semibold text-[var(--accent-primary)] hover:underline"
            >
              Sign in to Student Portal
            </Link>
          </p>
        </form>
      </div>
    </AuthLayout>
  );
}
