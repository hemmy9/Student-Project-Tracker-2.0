// Grace Polytechnic Official Brand Identity & Provisional Academic Catalogue
// NOTE: Programmes and departments below are derived from public gracepolytechnic.edu.ng records
// and remain explicitly marked PROVISIONAL until verified by Grace Polytechnic Academic Affairs.

export const GRACE_POLYTECHNIC_BRAND = {
  appName: 'Student Project Tracker',
  institutionName: 'Grace Polytechnic',
  shortName: 'Grace Polytechnic',
  location: 'Lagos, Nigeria',
  website: 'https://gracepolytechnic.edu.ng/',
  officialDomain: 'gracepolytechnic.edu.ng',
  tagline:
    'Unified academic project supervision, milestone governance, and progress tracking for Grace Polytechnic.',
};

export const GRACE_POLYTECHNIC_PROVISIONAL_CATALOGUE = {
  isProvisional: true,
  catalogueStatus: 'provisional_pending_institutional_verification',
  sourceUrl: 'https://gracepolytechnic.edu.ng/',
  verificationNote:
    'Provisional academic structure compiled from public Grace Polytechnic information. Separates departments, programmes, qualification levels, study modes, and academic sessions for administrative verification.',

  qualificationLevels: [
    { id: 'pre-nd', code: 'Pre-ND', label: 'Pre-National Diploma (Remedial)' },
    { id: 'nd', code: 'ND', label: 'National Diploma (ND)' },
    { id: 'hnd', code: 'HND', label: 'Higher National Diploma (HND)' },
  ],

  studyModes: [
    { id: 'full-time', label: 'Full-Time' },
    { id: 'part-time', label: 'Part-Time' },
  ],

  academicSessions: [
    { id: 'sess-2024-2025', label: '2024/2025 Academic Session', isActive: false, provisional: true },
    { id: 'sess-2025-2026', label: '2025/2026 Academic Session', isActive: true, provisional: true },
    { id: 'sess-2026-2027', label: '2026/2027 Academic Session', isActive: false, provisional: true },
  ],

  schools: [
    { id: 'smbs', name: 'School of Management & Business Studies' },
    { id: 'set', name: 'School of Engineering & Technologies' },
    { id: 'ssrt', name: 'School of Science & Related Technologies' },
  ],

  departments: [
    {
      id: 'dept-acc',
      code: 'ACC',
      schoolId: 'smbs',
      name: 'Accountancy',
      provisional: true,
    },
    {
      id: 'dept-bam',
      code: 'BAM',
      schoolId: 'smbs',
      name: 'Business Administration & Management',
      provisional: true,
    },
    {
      id: 'dept-bf',
      code: 'BNF',
      schoolId: 'smbs',
      name: 'Banking & Finance',
      provisional: true,
    },
    {
      id: 'dept-cet',
      code: 'CET',
      schoolId: 'set',
      name: 'Computer Engineering Technology',
      provisional: true,
    },
    {
      id: 'dept-eee',
      code: 'EEE',
      schoolId: 'set',
      name: 'Electrical & Electronics Engineering Technology',
      provisional: true,
    },
    {
      id: 'dept-csc',
      code: 'CSC',
      schoolId: 'ssrt',
      name: 'Computer Science',
      provisional: true,
    },
    {
      id: 'dept-otm',
      code: 'OTM',
      schoolId: 'ssrt',
      name: 'Office Technology & Management (OTM)',
      provisional: true,
    },
    {
      id: 'dept-sta',
      code: 'STA',
      schoolId: 'ssrt',
      name: 'Statistics',
      provisional: true,
    },
  ],

  programmes: [
    {
      id: 'prog-acc',
      departmentId: 'dept-acc',
      name: 'Accountancy',
      qualificationLevelIds: ['nd', 'hnd'],
      studyModeIds: ['full-time', 'part-time'],
      provisional: true,
    },
    {
      id: 'prog-bam',
      departmentId: 'dept-bam',
      name: 'Business Administration & Management',
      qualificationLevelIds: ['nd', 'hnd'],
      studyModeIds: ['full-time', 'part-time'],
      provisional: true,
    },
    {
      id: 'prog-bf',
      departmentId: 'dept-bf',
      name: 'Banking & Finance',
      qualificationLevelIds: ['nd'],
      studyModeIds: ['full-time', 'part-time'],
      provisional: true,
    },
    {
      id: 'prog-cet',
      departmentId: 'dept-cet',
      name: 'Computer Engineering Technology',
      qualificationLevelIds: ['nd', 'hnd'],
      studyModeIds: ['full-time', 'part-time'],
      provisional: true,
    },
    {
      id: 'prog-eee',
      departmentId: 'dept-eee',
      name: 'Electrical & Electronics Engineering Technology',
      qualificationLevelIds: ['nd'],
      studyModeIds: ['full-time', 'part-time'],
      provisional: true,
    },
    {
      id: 'prog-csc',
      departmentId: 'dept-csc',
      name: 'Computer Science',
      qualificationLevelIds: ['nd', 'hnd'],
      studyModeIds: ['full-time', 'part-time'],
      provisional: true,
    },
    {
      id: 'prog-otm',
      departmentId: 'dept-otm',
      name: 'Office Technology & Management',
      qualificationLevelIds: ['nd', 'hnd'],
      studyModeIds: ['full-time', 'part-time'],
      provisional: true,
    },
    {
      id: 'prog-sta',
      departmentId: 'dept-sta',
      name: 'Statistics',
      qualificationLevelIds: ['nd'],
      studyModeIds: ['full-time', 'part-time'],
      provisional: true,
    },
  ],
};
