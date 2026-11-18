import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  GRACE_POLYTECHNIC_BRAND,
  GRACE_POLYTECHNIC_PROVISIONAL_CATALOGUE,
} from '../config/gracePolytechnic';
import { getCurrentIsoDate, getCurrentLocalTimestamp } from '../utils/dateHelper';
import {
  buildNotificationPreferenceKey,
  DEFAULT_NOTIFICATION_PREFERENCES,
  evaluateDeadlineReminders,
  evaluateOpenReminderCandidateKeys,
  reconcileActivityPreferencesState,
  reconcileDeadlineRemindersState,
  resolveNotificationPreferences,
  sanitizeNotificationPreferences,
} from '../utils/deadlineReminderEngine';

const STORAGE_KEY = 'spt_stage3_demo_state_v1';

export const GRACE_INSTITUTION_NAME = GRACE_POLYTECHNIC_BRAND.institutionName;
const LEGACY_WESTBRIDGE_NAME = 'University of Westbridge';

const LEGACY_INSTITUTION_ALIASES = {
  [LEGACY_WESTBRIDGE_NAME]: GRACE_INSTITUTION_NAME,
};

const SCHOOL_NAME_BY_ID = Object.fromEntries(
  GRACE_POLYTECHNIC_PROVISIONAL_CATALOGUE.schools.map((s) => [s.id, s.name])
);
const LEVEL_CODE_BY_ID = Object.fromEntries(
  GRACE_POLYTECHNIC_PROVISIONAL_CATALOGUE.qualificationLevels.map((l) => [l.id, l.code])
);
const MODE_LABEL_BY_ID = Object.fromEntries(
  GRACE_POLYTECHNIC_PROVISIONAL_CATALOGUE.studyModes.map((m) => [m.id, m.label])
);

const DEMO_DEPT_COUNTS = {
  'dept-acc': { students: 42, supervisors: 6 },
  'dept-bam': { students: 56, supervisors: 8 },
  'dept-bf': { students: 28, supervisors: 4 },
  'dept-cet': { students: 38, supervisors: 6 },
  'dept-eee': { students: 34, supervisors: 5 },
  'dept-csc': { students: 64, supervisors: 9 },
  'dept-otm': { students: 30, supervisors: 5 },
  'dept-sta': { students: 22, supervisors: 4 },
};

export function buildGraceCatalogueDepartments() {
  return GRACE_POLYTECHNIC_PROVISIONAL_CATALOGUE.departments.map((dept) => {
    const linkedProgrammes = GRACE_POLYTECHNIC_PROVISIONAL_CATALOGUE.programmes.filter(
      (p) => p.departmentId === dept.id
    );
    const levelIds = [...new Set(linkedProgrammes.flatMap((p) => p.qualificationLevelIds || []))];
    const modeIds = [...new Set(linkedProgrammes.flatMap((p) => p.studyModeIds || []))];
    const counts = DEMO_DEPT_COUNTS[dept.id] || { students: 18, supervisors: 3 };

    return {
      id: dept.id,
      code: dept.code,
      schoolId: dept.schoolId,
      schoolName: SCHOOL_NAME_BY_ID[dept.schoolId] || 'Grace Polytechnic School',
      name: dept.name,
      programmes: linkedProgrammes.map((p) => p.name),
      qualificationLevels: levelIds.map((id) => LEVEL_CODE_BY_ID[id] || id),
      studyModes: modeIds.map((id) => MODE_LABEL_BY_ID[id] || id),
      students: counts.students,
      supervisors: counts.supervisors,
      provisional: Boolean(dept.provisional),
    };
  });
}

export function buildGraceCatalogueSessions() {
  return GRACE_POLYTECHNIC_PROVISIONAL_CATALOGUE.academicSessions.map((ses) => ({
    id: ses.id,
    name: ses.label,
    active: Boolean(ses.isActive),
    provisional: Boolean(ses.provisional),
  }));
}

export function canonicalizeInstitutionName(institutionName) {
  if (typeof institutionName !== 'string') return '';
  const trimmed = institutionName.trim();
  if (!trimmed) return '';
  return LEGACY_INSTITUTION_ALIASES[trimmed] || trimmed;
}

export function resolveInstitutionKey(
  collection,
  institutionName,
  { allowGraceFallback = false } = {}
) {
  const trimmed = typeof institutionName === 'string' ? institutionName.trim() : '';
  if (!trimmed) {
    if (allowGraceFallback && collection && Object.prototype.hasOwnProperty.call(collection, GRACE_INSTITUTION_NAME)) {
      return GRACE_INSTITUTION_NAME;
    }
    return '';
  }

  const canonical = canonicalizeInstitutionName(trimmed);
  if (collection && Object.prototype.hasOwnProperty.call(collection, canonical)) {
    return canonical;
  }
  if (collection && Object.prototype.hasOwnProperty.call(collection, trimmed)) {
    return trimmed;
  }
  return '';
}

export function resolveWorkspaceInstitution(activeMembership, session = null) {
  const raw = typeof activeMembership?.institutionName === 'string'
    ? activeMembership.institutionName.trim()
    : '';
  if (raw) {
    return canonicalizeInstitutionName(raw);
  }
  const email = (session?.email || '').toLowerCase();
  if (
    activeMembership &&
    (email.endsWith(`@${GRACE_POLYTECHNIC_BRAND.officialDomain}`) ||
      email.endsWith('@westbridge.edu') ||
      ['student', 'supervisor', 'institution_admin'].includes(activeMembership.roleKey))
  ) {
    return GRACE_INSTITUTION_NAME;
  }
  return '';
}

export const ALLOWED_SHARED_PROFILE_FIELDS = [
  'phone',
  'bio',
  'emailNotifications',
  'preferredDisplayTitle',
  'alternativeContact',
];

export const ALLOWED_ROLE_SCOPED_PROFILE_FIELDS = [
  'roleNote',
  'researchFocus',
  'officeLocation',
  'consultationLink',
  'availabilityNote',
];

export const PROTECTED_SYSTEM_PROFILE_FIELDS = [
  'id',
  'userId',
  'fullName',
  'email',
  'roleKey',
  'roleLabel',
  'institution',
  'institutionName',
  'department',
  'programme',
  'studentCode',
  'scopeLabel',
  'status',
  'memberships',
  'isDemoPreview',
];

export function buildProfileScopeKey(roleKey, institutionName) {
  const cleanRole = typeof roleKey === 'string' ? roleKey.trim() : '';
  const cleanInst = canonicalizeInstitutionName(institutionName || '');
  if (!cleanRole || cleanRole === 'platform_admin' || !cleanInst) return '';
  return `${cleanRole}::${cleanInst}`;
}

function sanitizeFieldSet(rawObj, allowedFields) {
  if (!rawObj || typeof rawObj !== 'object') return {};
  const result = {};
  for (const key of allowedFields) {
    if (!Object.prototype.hasOwnProperty.call(rawObj, key)) continue;
    const val = rawObj[key];
    if (key === 'emailNotifications') {
      result[key] = Boolean(val);
    } else if (val !== undefined && val !== null) {
      result[key] = String(val).slice(0, 500);
    }
  }
  return result;
}

export function sanitizeProfileUpdates(updates = {}) {
  return sanitizeFieldSet(updates, ALLOWED_SHARED_PROFILE_FIELDS);
}

export function sanitizeRoleScopedProfileUpdates(updates = {}) {
  return sanitizeFieldSet(updates, ALLOWED_ROLE_SCOPED_PROFILE_FIELDS);
}

function normalizeScopeKey(rawKey) {
  if (typeof rawKey !== 'string') return '';
  const sepIdx = rawKey.indexOf('::');
  if (sepIdx <= 0) return '';
  const rolePart = rawKey.slice(0, sepIdx).trim();
  const instPart = rawKey.slice(sepIdx + 2).trim();
  return buildProfileScopeKey(rolePart, instPart);
}

function migrateUserProfiles(savedProfiles, defaultProfiles) {
  const base = defaultProfiles || {};
  const result = {};

  for (const [email, defProfile] of Object.entries(base)) {
    result[email] = {
      ...sanitizeProfileUpdates(defProfile),
      roleProfiles: {},
    };
  }

  if (!savedProfiles || typeof savedProfiles !== 'object') {
    return result;
  }

  for (const [email, rawEntry] of Object.entries(savedProfiles)) {
    if (!email || !rawEntry || typeof rawEntry !== 'object') continue;
    const existingBase = result[email] || { roleProfiles: {} };
    const mergedShared = {
      ...existingBase,
      ...sanitizeProfileUpdates(rawEntry),
    };

    const migratedRoleProfiles = { ...(existingBase.roleProfiles || {}) };
    if (rawEntry.roleProfiles && typeof rawEntry.roleProfiles === 'object') {
      for (const [rawScopeKey, rawScopedVal] of Object.entries(rawEntry.roleProfiles)) {
        const normalizedKey = normalizeScopeKey(rawScopeKey);
        if (!normalizedKey) continue;
        const sanitizedScoped = sanitizeRoleScopedProfileUpdates(rawScopedVal);
        const isLegacyWestbridgeKey = rawScopeKey.includes(`::${LEGACY_WESTBRIDGE_NAME}`);
        if (isLegacyWestbridgeKey && Object.prototype.hasOwnProperty.call(rawEntry.roleProfiles, normalizedKey)) {
          continue;
        }
        migratedRoleProfiles[normalizedKey] = {
          ...(migratedRoleProfiles[normalizedKey] || {}),
          ...sanitizedScoped,
        };
      }
    }

    result[email] = {
      ...mergedShared,
      roleProfiles: migratedRoleProfiles,
    };
  }

  return result;
}

export function getScopedUserProfile(userProfiles, email, roleKey = '', institutionName = '') {
  const cleanEmail = typeof email === 'string' ? email.trim() : '';
  const entry = (cleanEmail && userProfiles?.[cleanEmail]) || {};
  const shared = sanitizeProfileUpdates(entry);
  const scopeKey = buildProfileScopeKey(roleKey, institutionName);
  const scoped =
    scopeKey && entry.roleProfiles && entry.roleProfiles[scopeKey]
      ? sanitizeRoleScopedProfileUpdates(entry.roleProfiles[scopeKey])
      : {};

  return {
    phone: '',
    bio: '',
    emailNotifications: true,
    preferredDisplayTitle: '',
    alternativeContact: '',
    roleNote: '',
    researchFocus: '',
    officeLocation: '',
    consultationLink: '',
    availabilityNote: '',
    ...shared,
    ...scoped,
    scopeKey,
  };
}

const INITIAL_STATE = {
  userProfiles: {
    'student.demo@westbridge.edu': {
      phone: 'Demo Profile Placeholder',
      bio: 'Final-year Computer Science demo student researching flood telemetry.',
      emailNotifications: true,
    },
    'supervisor.demo@westbridge.edu': {
      phone: 'Demo Profile Placeholder',
      bio: 'Demo faculty supervisor overseeing embedded systems and computing projects.',
      emailNotifications: true,
    },
    'admin.demo@westbridge.edu': {
      phone: 'Demo Profile Placeholder',
      bio: `Demo Academic Projects Coordinator for ${GRACE_INSTITUTION_NAME}.`,
      emailNotifications: true,
    },
    'platform.demo@projecttracker.app': {
      phone: 'Demo Profile Placeholder',
      bio: 'Retired Platform Governance demo operator.',
      emailNotifications: true,
    },
    'multi.demo@westbridge.edu': {
      phone: 'Demo Profile Placeholder',
      bio: 'Multi-role demonstration account across isolated workspace scopes.',
      emailNotifications: true,
    },
  },
  notificationPreferences: {},
  projectsByInstitution: {
    [GRACE_INSTITUTION_NAME]: {
      id: 'proj-gp-1',
      code: 'GP-CSC-2026-014',
      title: 'Adaptive Flood Early-Warning Telemetry Network Using Edge Sensors',
      studentName: 'Kwame Boateng',
      studentEmail: 'student.demo@westbridge.edu',
      supervisorName: 'Dr. Samuel Osei',
      supervisorEmail: 'supervisor.demo@westbridge.edu',
      department: 'Computer Science',
      programme: 'HND Computer Science (Full-Time · Demo)',
      academicSession: '2025/2026 Academic Session',
      nextDeadline: '2026-11-28',
      milestones: [
        {
          id: 'ms-1',
          phaseNumber: 1,
          title: 'Project Proposal & Ethics Sign-off',
          description:
            'Submit final problem statement, research objectives, risk assessment, and signed departmental ethics clearance.',
          weightPercent: 15,
          dueDate: '2026-09-18',
          status: 'Approved',
          feedbackEntries: [
            {
              id: 'mfb-1',
              authorName: 'Dr. Samuel Osei',
              authorRole: 'supervisor',
              statusSnapshot: 'Approved',
              comment:
                'Clear problem scope and well-documented field safety protocol. Ethics clearance verified.',
              createdAt: '2026-09-19 11:20',
            },
          ],
        },
        {
          id: 'ms-2',
          phaseNumber: 2,
          title: 'Chapter 1 & 2: Literature Review',
          description:
            'Synthesize at least 25 peer-reviewed papers comparing flood telemetry sensor networks and edge alert protocols.',
          weightPercent: 25,
          dueDate: '2026-10-14',
          status: 'Approved',
          feedbackEntries: [
            {
              id: 'mfb-2',
              authorName: 'Dr. Samuel Osei',
              authorRole: 'supervisor',
              statusSnapshot: 'Approved',
              comment:
                'Strong comparative matrix across LoRaWAN and 2G GSM gateways. Approved to transition into architecture design.',
              createdAt: '2026-10-15 16:05',
            },
          ],
        },
        {
          id: 'ms-3',
          phaseNumber: 3,
          title: 'Chapter 3: System Architecture & Methodology',
          description:
            'Deliver system block diagram, MQTT broker topology, database ER schema, and packet-loss fallback methodology.',
          weightPercent: 30,
          dueDate: '2026-11-04',
          status: 'Revision Requested',
          feedbackEntries: [
            {
              id: 'mfb-3',
              authorName: 'Dr. Samuel Osei',
              authorRole: 'supervisor',
              statusSnapshot: 'Revision Requested',
              comment:
                'Expand Section 3.4 on offline store-and-forward queuing during 2G outages and attach the updated ER diagram.',
              createdAt: '2026-11-10 09:45',
            },
          ],
        },
        {
          id: 'ms-4',
          phaseNumber: 4,
          title: 'Chapter 4: Prototype Implementation',
          description:
            'Build ultrasonic sensor node firmware, MQTT telemetry ingestion service, and field calibration benchmark logs.',
          weightPercent: 30,
          dueDate: '2026-11-28',
          status: 'In Progress',
          feedbackEntries: [],
        },
      ],
      tasks: [
        {
          id: 't-1',
          milestoneId: 'ms-1',
          title: 'Submit signed ethics clearance form',
          dueDate: '2026-09-15',
          priority: 'High',
          status: 'done',
          completed: true,
        },
        {
          id: 't-2',
          milestoneId: 'ms-2',
          title: 'Synthesize 25 peer-reviewed sensor network papers',
          dueDate: '2026-10-10',
          priority: 'Medium',
          status: 'done',
          completed: true,
        },
        {
          id: 't-3',
          milestoneId: 'ms-3',
          title: 'Revise Section 3.4 packet-loss fallback diagram',
          dueDate: '2026-11-12',
          priority: 'High',
          status: 'in_review',
          completed: false,
        },
        {
          id: 't-4',
          milestoneId: 'ms-4',
          title: 'Benchmark MQTT broker under intermittent 2G link',
          dueDate: '2026-11-22',
          priority: 'Medium',
          status: 'done',
          completed: true,
        },
        {
          id: 't-5',
          milestoneId: 'ms-4',
          title: 'Complete solar battery telemetry logging module',
          dueDate: '2026-11-26',
          priority: 'High',
          status: 'in_progress',
          completed: false,
        },
      ],
      journals: [
        {
          id: 'j-8',
          weekNumber: 8,
          date: '2026-11-10',
          summary:
            'Completed MQTT broker benchmark tests under packet loss. Unit tests for battery telemetry parser now pass.',
          blockers: 'Need clarification on expected alert latency threshold in Chapter 3.',
          nextSteps: 'Update ER diagram and submit revised Chapter 3 v3.',
          supervisorFeedback:
            'Good test coverage. Keep alert latency target under 4 seconds in Section 3.4.',
          reviewedAt: '2026-11-11',
        },
        {
          id: 'j-7',
          weekNumber: 7,
          date: '2026-11-03',
          summary: 'Assembled two waterproof ultrasonic node prototypes for lab tank calibration.',
          blockers: 'None.',
          nextSteps: 'Begin MQTT stress tests.',
          supervisorFeedback: 'Proceed with calibration logs and attach sensor photos to Chapter 4.',
          reviewedAt: '2026-11-04',
        },
      ],
      submissions: [
        {
          id: 'sub-3',
          documentGroupId: 'doc-uwb-ch3',
          milestoneId: 'ms-3',
          title: 'Chapter 3: System Architecture & Methodology',
          version: 'v2',
          fileName: 'Kwame_Boateng_Chapter3_v2.pdf',
          fileSize: '2.4 MB',
          submittedAt: '2026-11-09',
          status: 'Revision Requested',
          studentNote: 'Added edge gateway sequence diagram and sensor schema.',
          supervisorFeedback:
            'Expand section 3.4 on sensor packet-loss fallback and include the updated ER diagram.',
          studentResponse: '',
        },
        {
          id: 'sub-3-v1',
          documentGroupId: 'doc-uwb-ch3',
          milestoneId: 'ms-3',
          title: 'Chapter 3: System Architecture & Methodology',
          version: 'v1',
          fileName: 'Kwame_Boateng_Chapter3_v1.pdf',
          fileSize: '1.8 MB',
          submittedAt: '2026-10-30',
          status: 'Revision Requested',
          studentNote: 'Initial architecture draft with MQTT topology.',
          supervisorFeedback: 'Please add sequence diagrams and database schema before sign-off.',
          studentResponse: 'Added sequence diagram and schema in v2.',
        },
        {
          id: 'sub-2',
          documentGroupId: 'doc-uwb-lit',
          milestoneId: 'ms-2',
          title: 'Chapter 1 & 2: Literature Review',
          version: 'v2',
          fileName: 'Kwame_Boateng_LitReview_v2.pdf',
          fileSize: '3.1 MB',
          submittedAt: '2026-10-13',
          status: 'Approved',
          studentNote: 'Updated comparative matrix with 2025 references.',
          supervisorFeedback: 'Approved. Strong synthesis and clear research gap justification.',
          studentResponse: '',
        },
      ],
      messages: [
        {
          id: 'msg-1',
          senderRole: 'supervisor',
          senderName: 'Dr. Samuel Osei',
          sentAt: '2026-11-11 10:15',
          body: 'Kwame, please review my comments on Chapter 3 v2 before Friday so we can sign off Milestone 3.',
        },
        {
          id: 'msg-2',
          senderRole: 'student',
          senderName: 'Kwame Boateng',
          sentAt: '2026-11-11 14:40',
          body: 'Thank you Dr. Osei. I am updating the ER diagram and Section 3.4 tonight and will upload v3.',
        },
      ],
    },
    'Northfield Institute of Technology': {
      id: 'proj-nit-1',
      code: 'NIT-HCI-2026-009',
      title: 'Accessible Voice-Guided Interface Patterns for Low-Bandwidth Rural Clinics',
      studentName: 'Dr. Daniel Kwarteng',
      studentEmail: 'multi.demo@westbridge.edu',
      supervisorName: 'Prof. Claire Vance',
      supervisorEmail: 'c.vance@northfieldtech.edu',
      department: 'Faculty of Computing & Software Systems',
      programme: 'M.Sc. Research Candidate',
      academicSession: '2025/2026 Graduate Cohort',
      nextDeadline: '2026-12-05',
      milestones: [
        {
          id: 'ms-nit-1',
          phaseNumber: 1,
          title: 'Research Thesis Topic Approval',
          description: 'Define scope, target clinic bandwidth constraints, and evaluation protocol.',
          weightPercent: 25,
          dueDate: '2026-09-22',
          status: 'Approved',
          feedbackEntries: [
            {
              id: 'mfb-nit-1',
              authorName: 'Prof. Claire Vance',
              authorRole: 'supervisor',
              statusSnapshot: 'Approved',
              comment: 'Scope approved for graduate research track.',
              createdAt: '2026-09-23 10:00',
            },
          ],
        },
        {
          id: 'ms-nit-2',
          phaseNumber: 2,
          title: 'Systematic Usability Literature Synthesis',
          description: 'PRISMA screening and voice accessibility heuristics benchmark.',
          weightPercent: 35,
          dueDate: '2026-10-25',
          status: 'Approved',
          feedbackEntries: [],
        },
        {
          id: 'ms-nit-3',
          phaseNumber: 3,
          title: 'Field Study Ethics & Prototype Wireframes',
          description: 'Prepare audio consent script and low-bitrate voice prompt prototype.',
          weightPercent: 40,
          dueDate: '2026-12-05',
          status: 'In Progress',
          feedbackEntries: [],
        },
      ],
      tasks: [
        {
          id: 't-nit-1',
          milestoneId: 'ms-nit-1',
          title: 'Finalize thesis scope statement',
          dueDate: '2026-09-20',
          priority: 'Medium',
          status: 'done',
          completed: true,
        },
        {
          id: 't-nit-2',
          milestoneId: 'ms-nit-3',
          title: 'Record low-bitrate voice prompt samples',
          dueDate: '2026-11-29',
          priority: 'High',
          status: 'in_progress',
          completed: false,
        },
      ],
      journals: [
        {
          id: 'j-nit-6',
          weekNumber: 6,
          date: '2026-11-08',
          summary: 'Finalized audio compression comparison across 3 rural clinic bandwidth profiles.',
          blockers: 'Awaiting ethics board signature on consent audio script.',
          nextSteps: 'Complete interactive wireframe prototype.',
          supervisorFeedback: '',
          reviewedAt: '',
        },
      ],
      submissions: [
        {
          id: 'sub-nit-1',
          documentGroupId: 'doc-nit-lit',
          milestoneId: 'ms-nit-2',
          title: 'Systematic Usability Literature Synthesis',
          version: 'v1',
          fileName: 'Kwarteng_Literature_Synthesis_v1.pdf',
          fileSize: '1.9 MB',
          submittedAt: '2026-10-24',
          status: 'Approved',
          studentNote: 'Includes PRISMA screening table.',
          supervisorFeedback: 'Approved to proceed to prototype testing protocol.',
          studentResponse: '',
        },
      ],
      messages: [
        {
          id: 'msg-nit-1',
          senderRole: 'supervisor',
          senderName: 'Prof. Claire Vance',
          sentAt: '2026-11-09 09:20',
          body: 'Let me know as soon as the clinic consent script is ready for review.',
        },
      ],
    },
  },

  supervisorExtraStudents: [
    {
      id: 'stu-2',
      name: 'Amara Okafor',
      studentCode: 'GP/CSC/2026/039',
      programme: 'HND Computer Science (Demo)',
      projectTitle: 'Automated Timetable Conflict Solver Using Constraint Search',
      progress: 41,
      lastJournal: '2026-10-26',
      attentionStatus: 'Needs Attention',
      pendingItem: '2 missed weekly journals · Milestone overdue',
    },
    {
      id: 'stu-3',
      name: 'Liam Gallagher',
      studentCode: 'GP/CET/2026/051',
      programme: 'HND Computer Engineering Technology (Demo)',
      projectTitle: 'Interpretable Medical Triage Classification on Edge Devices',
      progress: 82,
      lastJournal: '2026-11-12',
      attentionStatus: 'Review Ready',
      pendingItem: 'Chapter 5 Evaluation Draft awaiting review',
    },
    {
      id: 'stu-4',
      name: 'Zainab Bello',
      studentCode: 'GP/CSC/2026/044',
      programme: 'ND Computer Science (Demo)',
      projectTitle: 'Offline-First Attendance Verification for Field Labs',
      progress: 34,
      lastJournal: '2026-10-29',
      attentionStatus: 'Needs Attention',
      pendingItem: 'Chapter 2 draft overdue by 6 days',
    },
  ],

  supervisorExtraSubmissions: [
    {
      id: 'rev-extra-1',
      studentName: 'Liam Gallagher',
      documentTitle: 'Chapter 5: Experimental Results & Bias Audit (v1)',
      fileName: 'Liam_Gallagher_Chapter5_v1.pdf',
      submittedAt: '2026-11-13',
      status: 'Pending Review',
      supervisorFeedback: '',
    },
    {
      id: 'rev-extra-2',
      studentName: 'Amara Okafor',
      documentTitle: 'Chapter 2: Constraint Modeling Survey (v1)',
      fileName: 'Amara_Okafor_Chapter2_v1.pdf',
      submittedAt: '2026-11-02',
      status: 'Pending Review',
      supervisorFeedback: '',
    },
  ],

  institutionsState: {
    [GRACE_INSTITUTION_NAME]: {
      info: {
        name: GRACE_POLYTECHNIC_BRAND.institutionName,
        shortCode: 'GP',
        domain: GRACE_POLYTECHNIC_BRAND.officialDomain,
        website: GRACE_POLYTECHNIC_BRAND.website,
        location: GRACE_POLYTECHNIC_BRAND.location,
        country: 'Nigeria',
        contactEmail: `demo-workspace@${GRACE_POLYTECHNIC_BRAND.officialDomain}`,
        isProvisionalCatalogue: GRACE_POLYTECHNIC_PROVISIONAL_CATALOGUE.isProvisional,
        catalogueNote: GRACE_POLYTECHNIC_PROVISIONAL_CATALOGUE.verificationNote,
      },
      schools: GRACE_POLYTECHNIC_PROVISIONAL_CATALOGUE.schools,
      qualificationLevels: GRACE_POLYTECHNIC_PROVISIONAL_CATALOGUE.qualificationLevels,
      studyModes: GRACE_POLYTECHNIC_PROVISIONAL_CATALOGUE.studyModes,
      sessions: buildGraceCatalogueSessions(),
      departments: buildGraceCatalogueDepartments(),
      membershipRequests: [
        {
          id: 'req-gp-1',
          name: 'Nadia Mensah (Demo Request)',
          email: 'n.mensah.demo@gracepolytechnic.edu.ng',
          role: 'Student',
          department: 'Computer Science',
          identifier: 'GP/CSC/2026/061',
          requestedAt: '2026-11-13',
          status: 'Pending Approval',
        },
        {
          id: 'req-gp-2',
          name: 'Dr. Henry Addo (Demo Request)',
          email: 'h.addo.demo@gracepolytechnic.edu.ng',
          role: 'Supervisor',
          department: 'Computer Engineering Technology',
          identifier: 'GP-FAC-2190 (Demo)',
          requestedAt: '2026-11-12',
          status: 'Pending Approval',
        },
        {
          id: 'req-gp-3',
          name: 'Tunde Adeyemi (Demo Request)',
          email: 't.adeyemi.demo@gracepolytechnic.edu.ng',
          role: 'Student',
          department: 'Electrical & Electronics Engineering Technology',
          identifier: 'GP/EEE/2026/039',
          requestedAt: '2026-11-11',
          status: 'Pending Approval',
        },
      ],
      invitations: [
        {
          id: 'inv-1',
          email: 'supervisor-invite.demo@gracepolytechnic.edu.ng',
          department: 'Computer Science',
          code: 'SPT-GP-8831',
          status: 'Demo Invite (Stage D Verification Deferred)',
          createdAt: '2026-11-10',
        },
      ],
      projects: [
        {
          id: 'ip-1',
          code: 'GP-CSC-2026-014',
          title: 'Adaptive Flood Early-Warning Telemetry Network',
          studentName: 'Kwame Boateng',
          department: 'Computer Science',
          supervisorName: 'Dr. Samuel Osei',
          progress: 68,
        },
        {
          id: 'ip-2',
          code: 'GP-CSC-2026-029',
          title: 'Tamper-Evident Polytechnic Project Verification Archive',
          studentName: 'Kofi Asante (Demo)',
          department: 'Computer Science',
          supervisorName: 'Unassigned',
          progress: 10,
        },
        {
          id: 'ip-3',
          code: 'GP-EEE-2026-011',
          title: 'Smart Microgrid Load Balancing Controller',
          studentName: 'Fatima Al-Mansoor (Demo)',
          department: 'Electrical & Electronics Engineering Technology',
          supervisorName: 'Unassigned',
          progress: 15,
        },
      ],
      verifiedSupervisors: [
        'Dr. Samuel Osei',
        'Dr. Clara Hughes (Demo)',
        'Prof. Isaac Boateng (Demo)',
      ],
    },
    'St. Jude University of Applied Sciences': {
      info: {
        name: 'St. Jude University of Applied Sciences',
        shortCode: 'SJUAS',
        domain: 'stjude-uas.ac',
        country: 'Ghana',
        contactEmail: 'registry@stjude-uas.ac',
      },
      sessions: [{ id: 'ses-sju-1', name: '2025/2026 Capstone Cohort', active: true }],
      departments: [
        {
          id: 'd-sju-1',
          name: 'Department of Computer & Information Studies',
          programmes: ['B.Sc. Information Technology', 'B.Sc. Computer Science'],
          students: 54,
          supervisors: 9,
        },
        {
          id: 'd-sju-2',
          name: 'School of Business & Project Analytics',
          programmes: ['B.B.A. Operations & Project Management', 'M.B.A. Technology Management'],
          students: 32,
          supervisors: 6,
        },
      ],
      membershipRequests: [
        {
          id: 'req-sju-1',
          name: 'Beatrice Owusu',
          email: 'b.owusu@stjude-uas.ac',
          role: 'Student',
          department: 'Department of Computer & Information Studies',
          identifier: 'SJU-2026-0194',
          requestedAt: '2026-11-14',
          status: 'Pending Approval',
        },
        {
          id: 'req-sju-2',
          name: 'Prof. Kofi Asare',
          email: 'k.asare@stjude-uas.ac',
          role: 'Supervisor',
          department: 'School of Business & Project Analytics',
          identifier: 'STAFF-088',
          requestedAt: '2026-11-10',
          status: 'Pending Approval',
        },
      ],
      invitations: [],
      projects: [
        {
          id: 'ip-sju-1',
          code: 'SJU-CIS-2026-004',
          title: 'Mobile Agricultural Supply Forecasting Portal',
          studentName: 'Yaw Mensah',
          department: 'Department of Computer & Information Studies',
          supervisorName: 'Unassigned',
          progress: 20,
        },
      ],
      verifiedSupervisors: ['Dr. Grace Hammond', 'Prof. Daniel Kwarteng'],
    },
  },

  platformState: {
    institutions: [
      {
        id: 'app-3',
        institutionName: 'University of Westbridge',
        domain: 'westbridge.edu',
        country: 'United Kingdom',
        applicantName: 'Dr. Evelyn Mensah',
        applicantEmail: 'admin.demo@westbridge.edu',
        submittedAt: '2026-08-19',
        status: 'Approved',
        activeUsers: 480,
      },
      {
        id: 'app-4',
        institutionName: 'Northfield Institute of Technology',
        domain: 'northfieldtech.edu',
        country: 'Canada',
        applicantName: 'Dean Arthur Chen',
        applicantEmail: 'achen@northfieldtech.edu',
        submittedAt: '2026-09-02',
        status: 'Approved',
        activeUsers: 610,
      },
      {
        id: 'app-6',
        institutionName: 'St. Jude University of Applied Sciences',
        domain: 'stjude-uas.ac',
        country: 'Ghana',
        applicantName: 'Dr. Daniel Kwarteng',
        applicantEmail: 'multi.demo@westbridge.edu',
        submittedAt: '2026-10-01',
        status: 'Approved',
        activeUsers: 390,
      },
      {
        id: 'app-1',
        institutionName: 'Kestrel Polytechnic Institute',
        domain: 'kestrelpoly.edu',
        country: 'Kenya',
        applicantName: 'Dr. Grace Wanjiku',
        applicantEmail: 'registrar@kestrelpoly.edu',
        submittedAt: '2026-11-13',
        status: 'Pending Review',
        activeUsers: 0,
      },
      {
        id: 'app-2',
        institutionName: 'Harborview College of Engineering',
        domain: 'harborview-eng.ac.uk',
        country: 'United Kingdom',
        applicantName: 'Prof. Martin Ellis',
        applicantEmail: 'm.ellis@harborview-eng.ac.uk',
        submittedAt: '2026-11-11',
        status: 'Pending Review',
        activeUsers: 0,
      },
      {
        id: 'app-5',
        institutionName: 'Unverified Coaching Hub',
        domain: 'fast-degree-example.net',
        country: 'Unknown',
        applicantName: 'J. Carter',
        applicantEmail: 'contact@fast-degree-example.net',
        submittedAt: '2026-11-05',
        status: 'Rejected',
        activeUsers: 0,
      },
    ],
    platformAdmins: [
      {
        id: 'pa-1',
        name: 'Adaeze Nwosu',
        email: 'platform.demo@projecttracker.app',
        addedAt: '2026-08-01',
        status: 'Active',
      },
      {
        id: 'pa-2',
        name: 'Marcus Vance',
        email: 'm.vance@projecttracker.app',
        addedAt: '2026-08-15',
        status: 'Active',
      },
    ],
    settings: {
      requireDomainVerification: true,
      allowOpenInstitutionApplications: true,
      maxUploadSizeMb: 25,
      defaultSessionRetentionDays: 30,
    },
    auditLogs: [
      {
        id: 'log-1',
        timestamp: '2026-11-13 14:22 UTC',
        actor: 'Adaeze Nwosu',
        action: 'Rejected unverified application domain',
        target: 'fast-degree-example.net',
      },
      {
        id: 'log-2',
        timestamp: '2026-11-10 09:45 UTC',
        actor: 'Adaeze Nwosu',
        action: 'Approved institutional onboarding',
        target: 'St. Jude University of Applied Sciences',
      },
    ],
  },

  notifications: [
    {
      id: 'n-1',
      roleKey: 'student',
      kind: 'activity',
      category: 'Documents',
      title: 'Revision requested on Chapter 3 v2',
      body: 'Dr. Samuel Osei requested updates to Section 3.4 and your ER diagram.',
      time: '2 hours ago',
      read: false,
      targetPath: '/student/documents',
    },
    {
      id: 'n-2',
      roleKey: 'student',
      kind: 'activity',
      category: 'Journals',
      title: 'Week 8 Journal Reviewed',
      body: 'Your supervisor left feedback on your Week 8 progress journal.',
      time: '1 day ago',
      read: true,
      targetPath: '/student/journals',
    },
    {
      id: 'n-3',
      roleKey: 'supervisor',
      kind: 'activity',
      category: 'Documents',
      title: 'New chapter uploaded for review',
      body: 'Liam Gallagher uploaded Chapter 5: Experimental Results & Bias Audit (v1).',
      time: '3 hours ago',
      read: false,
      targetPath: '/supervisor/reviews',
    },
    {
      id: 'n-4',
      roleKey: 'supervisor',
      kind: 'system',
      category: 'System',
      title: '2 students flagged for attention',
      body: 'Amara Okafor and Zainab Bello have overdue deliverables.',
      time: '1 day ago',
      read: false,
      targetPath: '/supervisor/students',
    },
    {
      id: 'n-5',
      roleKey: 'institution_admin',
      kind: 'activity',
      category: 'Governance',
      title: 'Pending membership approvals',
      body: '3 new student and supervisor requests require institutional verification.',
      time: '5 hours ago',
      read: false,
      targetPath: '/admin/approvals',
    },
    {
      id: 'n-6',
      roleKey: 'platform_admin',
      kind: 'system',
      category: 'System',
      title: '2 institution applications awaiting review',
      body: 'Kestrel Polytechnic Institute and Harborview College submitted applications.',
      time: '4 hours ago',
      read: false,
      targetPath: '/platform/applications',
    },
  ],

  activityFeed: [
    {
      id: 'af-1',
      roleScope: 'supervisor',
      institutionName: GRACE_INSTITUTION_NAME,
      category: 'Documents',
      actor: 'Liam Gallagher',
      actorRole: 'Student',
      action: 'Uploaded Chapter 5: Experimental Results & Bias Audit (v1)',
      detail: 'Submitted 2.1 MB PDF for supervisor milestone review.',
      timestamp: '2026-11-13 16:40',
      targetPath: '/supervisor/reviews',
    },
    {
      id: 'af-2',
      roleScope: 'platform_admin',
      institutionName: 'Retired Scope',
      category: 'Governance',
      actor: 'Adaeze Nwosu',
      actorRole: 'Platform Admin',
      action: 'Archived historical onboarding log',
      detail: 'Historical pre-cleanup log entry.',
      timestamp: '2026-11-13 14:22',
      targetPath: '/portal-preview',
    },
    {
      id: 'af-3',
      roleScope: 'institution_admin',
      institutionName: GRACE_INSTITUTION_NAME,
      category: 'Governance',
      actor: 'Nadia Mensah (Demo Request)',
      actorRole: 'Applicant',
      action: 'Submitted student membership verification request',
      detail: 'Computer Science · ID GP/CSC/2026/061.',
      timestamp: '2026-11-13 09:15',
      targetPath: '/admin/approvals',
    },
    {
      id: 'af-4',
      roleScope: 'student',
      institutionName: GRACE_INSTITUTION_NAME,
      category: 'Journals',
      actor: 'Dr. Samuel Osei',
      actorRole: 'Supervisor',
      action: 'Reviewed Week 8 Progress Journal',
      detail: 'Keep alert latency target under 4 seconds in Section 3.4.',
      timestamp: '2026-11-11 15:10',
      targetPath: '/student/journals',
    },
    {
      id: 'af-5',
      roleScope: 'student',
      institutionName: GRACE_INSTITUTION_NAME,
      category: 'Messages',
      actor: 'Kwame Boateng',
      actorRole: 'Student',
      action: 'Sent message to Dr. Samuel Osei',
      detail: 'Updating ER diagram and Section 3.4 tonight for Chapter 3 v3.',
      timestamp: '2026-11-11 14:40',
      targetPath: '/student/messages',
    },
    {
      id: 'af-6',
      roleScope: 'student',
      institutionName: GRACE_INSTITUTION_NAME,
      category: 'Documents',
      actor: 'Kwame Boateng',
      actorRole: 'Student',
      action: 'Uploaded Chapter 3: System Architecture & Methodology (v2)',
      detail: 'Added edge gateway sequence diagram and sensor schema.',
      timestamp: '2026-11-09 11:25',
      targetPath: '/student/documents',
    },
  ],

  officeHoursByInstitution: {
    [GRACE_INSTITUTION_NAME]: {
      availabilitySlots: [
        {
          id: 'oh-uwb-1',
          supervisorName: 'Dr. Samuel Osei',
          supervisorEmail: 'supervisor.demo@westbridge.edu',
          dayOfWeek: 'Tuesday',
          startTime: '10:00',
          endTime: '12:00',
          slotMinutes: 30,
          mode: 'In-Person',
          locationOrLink: 'Computer Science Project Lab (Demo)',
          notes: 'Chapter architecture reviews and hardware prototype demos.',
          active: true,
        },
        {
          id: 'oh-uwb-2',
          supervisorName: 'Dr. Samuel Osei',
          supervisorEmail: 'supervisor.demo@westbridge.edu',
          dayOfWeek: 'Thursday',
          startTime: '14:00',
          endTime: '16:00',
          slotMinutes: 30,
          mode: 'Video Call',
          locationOrLink: 'Virtual Supervision Room (Demo Link)',
          notes: 'Remote check-ins, milestone feedback clarifications, and thesis editing.',
          active: true,
        },
        {
          id: 'oh-uwb-3',
          supervisorName: 'Dr. Samuel Osei',
          supervisorEmail: 'supervisor.demo@westbridge.edu',
          dayOfWeek: 'Friday',
          startTime: '09:30',
          endTime: '11:00',
          slotMinutes: 20,
          mode: 'Hybrid',
          locationOrLink: 'CS Studio or Virtual Room (Demo)',
          notes: 'Quick blocker triage before weekend sprint.',
          active: true,
        },
      ],
      bookings: [
        {
          id: 'bk-uwb-1',
          slotId: 'oh-uwb-1',
          studentName: 'Kwame Boateng',
          studentEmail: 'student.demo@westbridge.edu',
          supervisorName: 'Dr. Samuel Osei',
          meetingDate: '2026-11-17',
          dayOfWeek: 'Tuesday',
          timeRange: '10:00 – 10:30',
          mode: 'In-Person',
          locationOrLink: 'Computer Science Project Lab (Demo)',
          topic: 'Walk through Chapter 3 Section 3.4 packet-loss fallback diagram',
          milestoneId: 'ms-3',
          status: 'Confirmed',
          supervisorNote: 'Bring printed ER schema and MQTT sequence diagram.',
          createdAt: '2026-11-13',
        },
        {
          id: 'bk-uwb-2',
          slotId: 'oh-uwb-2',
          studentName: 'Liam Gallagher',
          studentEmail: 'l.gallagher.demo@gracepolytechnic.edu.ng',
          supervisorName: 'Dr. Samuel Osei',
          meetingDate: '2026-11-19',
          dayOfWeek: 'Thursday',
          timeRange: '14:30 – 15:00',
          mode: 'Video Call',
          locationOrLink: 'Virtual Supervision Room (Demo Link)',
          topic: 'Discuss Chapter 5 Bias Audit metrics before defense prep',
          milestoneId: '',
          status: 'Pending',
          supervisorNote: '',
          createdAt: '2026-11-14',
        },
      ],
    },
    'Northfield Institute of Technology': {
      availabilitySlots: [
        {
          id: 'oh-nit-1',
          supervisorName: 'Prof. Claire Vance',
          supervisorEmail: 'c.vance@northfieldtech.edu',
          dayOfWeek: 'Wednesday',
          startTime: '13:00',
          endTime: '15:00',
          slotMinutes: 30,
          mode: 'Video Call',
          locationOrLink: 'https://meet.northfieldtech.edu/claire-vance',
          notes: 'Graduate thesis consultation and ethics review.',
          active: true,
        },
      ],
      bookings: [],
    },
  },
};

function normalizeLegacyTargetPath(targetPath) {
  if (targetPath === '/institution') return '/admin';
  if (typeof targetPath === 'string' && targetPath.startsWith('/institution/')) {
    return `/admin/${targetPath.slice('/institution/'.length)}`;
  }
  return targetPath;
}

function mergeUniqueByIdOrName(existingList, defaultList) {
  const existing = Array.isArray(existingList) ? existingList : [];
  const defaults = Array.isArray(defaultList) ? defaultList : [];
  const defaultsById = new Map(defaults.map((item) => [item.id, item]));
  const defaultsByName = new Map(
    defaults
      .filter((item) => typeof item?.name === 'string')
      .map((item) => [item.name.trim().toLowerCase(), item])
  );

  const seenIds = new Set();
  const seenNames = new Set();

  const merged = existing.map((item) => {
    const idKey = item?.id;
    const nameKey = typeof item?.name === 'string' ? item.name.trim().toLowerCase() : '';
    const match = (idKey && defaultsById.get(idKey)) || (nameKey && defaultsByName.get(nameKey));
    if (idKey) seenIds.add(idKey);
    if (nameKey) seenNames.add(nameKey);

    if (!match) return item;
    // Preserve user edits while filling missing catalogue metadata fields (code, schoolId, levels, modes, provisional)
    return {
      ...match,
      ...item,
      programmes: Array.isArray(item.programmes) && item.programmes.length > 0 ? item.programmes : match.programmes,
    };
  });

  for (const def of defaults) {
    const idKey = def?.id;
    const nameKey = typeof def?.name === 'string' ? def.name.trim().toLowerCase() : '';
    if ((idKey && seenIds.has(idKey)) || (nameKey && seenNames.has(nameKey))) {
      continue;
    }
    if (idKey) seenIds.add(idKey);
    if (nameKey) seenNames.add(nameKey);
    merged.push(def);
  }

  return merged;
}

function mergeGraceInstitutionRecord(legacyOrExistingInst) {
  const graceDefault = INITIAL_STATE.institutionsState[GRACE_INSTITUTION_NAME];
  if (!legacyOrExistingInst || typeof legacyOrExistingInst !== 'object') {
    return graceDefault;
  }

  const rawInfo = legacyOrExistingInst.info || {};
  const isUntouchedLegacyInfo =
    !rawInfo.name || rawInfo.name === LEGACY_WESTBRIDGE_NAME || rawInfo.name === GRACE_INSTITUTION_NAME;

  const mergedInfo = {
    ...graceDefault.info,
    ...rawInfo,
    name: isUntouchedLegacyInfo ? graceDefault.info.name : rawInfo.name,
    shortCode:
      !rawInfo.shortCode || rawInfo.shortCode === 'UWB'
        ? graceDefault.info.shortCode
        : rawInfo.shortCode,
    domain:
      !rawInfo.domain || rawInfo.domain === 'westbridge.edu'
        ? graceDefault.info.domain
        : rawInfo.domain,
    country:
      !rawInfo.country || rawInfo.country === 'United Kingdom'
        ? graceDefault.info.country
        : rawInfo.country,
    contactEmail:
      !rawInfo.contactEmail || rawInfo.contactEmail === 'projects-office@westbridge.edu'
        ? graceDefault.info.contactEmail
        : rawInfo.contactEmail,
  };

  return {
    ...graceDefault,
    ...legacyOrExistingInst,
    info: mergedInfo,
    schools: legacyOrExistingInst.schools || graceDefault.schools,
    qualificationLevels:
      legacyOrExistingInst.qualificationLevels || graceDefault.qualificationLevels,
    studyModes: legacyOrExistingInst.studyModes || graceDefault.studyModes,
    departments: mergeUniqueByIdOrName(
      legacyOrExistingInst.departments,
      graceDefault.departments
    ),
    sessions: mergeUniqueByIdOrName(
      legacyOrExistingInst.sessions,
      graceDefault.sessions
    ),
    membershipRequests: Array.isArray(legacyOrExistingInst.membershipRequests)
      ? legacyOrExistingInst.membershipRequests
      : graceDefault.membershipRequests,
    invitations: Array.isArray(legacyOrExistingInst.invitations)
      ? legacyOrExistingInst.invitations
      : graceDefault.invitations,
    projects: Array.isArray(legacyOrExistingInst.projects)
      ? legacyOrExistingInst.projects
      : graceDefault.projects,
    verifiedSupervisors: Array.isArray(legacyOrExistingInst.verifiedSupervisors)
      ? legacyOrExistingInst.verifiedSupervisors
      : graceDefault.verifiedSupervisors,
  };
}

function migrateKeyedCollection(savedMap, defaultMap, graceMerger = null) {
  const result = { ...(defaultMap || {}) };
  if (!savedMap || typeof savedMap !== 'object') return result;

  for (const [key, value] of Object.entries(savedMap)) {
    if (key === LEGACY_WESTBRIDGE_NAME) {
      // Promote legacy Westbridge record only if Grace Polytechnic was not already saved
      if (!Object.prototype.hasOwnProperty.call(savedMap, GRACE_INSTITUTION_NAME)) {
        result[GRACE_INSTITUTION_NAME] = graceMerger ? graceMerger(value) : value;
      }
      continue;
    }
    if (key === GRACE_INSTITUTION_NAME) {
      result[GRACE_INSTITUTION_NAME] = graceMerger ? graceMerger(value) : value;
      continue;
    }
    // Preserve St. Jude, Northfield, and any other institution records untouched
    result[key] = value;
  }

  if (
    Object.prototype.hasOwnProperty.call(savedMap, LEGACY_WESTBRIDGE_NAME) &&
    !Object.prototype.hasOwnProperty.call(savedMap, GRACE_INSTITUTION_NAME) &&
    graceMerger &&
    !Object.prototype.hasOwnProperty.call(result, GRACE_INSTITUTION_NAME)
  ) {
    result[GRACE_INSTITUTION_NAME] = graceMerger(savedMap[LEGACY_WESTBRIDGE_NAME]);
  }

  return result;
}

const LEGACY_NOTIFICATION_META = {
  'n-1': { kind: 'activity', category: 'Documents' },
  'n-2': { kind: 'activity', category: 'Journals' },
  'n-3': { kind: 'activity', category: 'Documents' },
  'n-4': { kind: 'system', category: 'System' },
  'n-5': { kind: 'activity', category: 'Governance' },
  'n-6': { kind: 'system', category: 'System' },
};

function migrateNotificationPreferences(savedPrefs) {
  if (!savedPrefs || typeof savedPrefs !== 'object') return {};
  const result = {};

  for (const [rawKey, rawVal] of Object.entries(savedPrefs)) {
    if (typeof rawKey !== 'string' || !rawVal || typeof rawVal !== 'object') continue;
    const parts = rawKey.split('::');
    if (parts.length !== 3) continue;
    const [rawEmail, rawRole, rawInst] = parts;
    const canonicalKey = buildNotificationPreferenceKey(rawEmail, rawRole, rawInst);
    if (!canonicalKey) continue;

    const isLegacyWestbridgeKey = rawInst.trim() === LEGACY_WESTBRIDGE_NAME;
    if (
      isLegacyWestbridgeKey &&
      Object.prototype.hasOwnProperty.call(savedPrefs, canonicalKey)
    ) {
      continue;
    }

    result[canonicalKey] = sanitizeNotificationPreferences(rawVal);
  }

  return result;
}

export function migratePersistedState(parsed) {
  if (!parsed || typeof parsed !== 'object') return INITIAL_STATE;

  const rawNotifications = Array.isArray(parsed.notifications)
    ? parsed.notifications
    : INITIAL_STATE.notifications;
  const rawActivityFeed = Array.isArray(parsed.activityFeed)
    ? parsed.activityFeed
    : INITIAL_STATE.activityFeed;

  return {
    ...INITIAL_STATE,
    ...parsed,
    projectsByInstitution: migrateKeyedCollection(
      parsed.projectsByInstitution,
      INITIAL_STATE.projectsByInstitution
    ),
    institutionsState: migrateKeyedCollection(
      parsed.institutionsState,
      INITIAL_STATE.institutionsState,
      mergeGraceInstitutionRecord
    ),
    officeHoursByInstitution: migrateKeyedCollection(
      parsed.officeHoursByInstitution,
      INITIAL_STATE.officeHoursByInstitution
    ),
    userProfiles: migrateUserProfiles(parsed.userProfiles, INITIAL_STATE.userProfiles),
    notificationPreferences: migrateNotificationPreferences(parsed.notificationPreferences),
    notifications: rawNotifications.map((item) => {
      if (!item || typeof item !== 'object') return item;
      const legacyMeta = LEGACY_NOTIFICATION_META[item.id];
      const nextKind =
        item.kind || (legacyMeta ? legacyMeta.kind : item.reminderKey ? 'deadline_reminder' : 'activity');
      const nextCategory =
        item.category || (legacyMeta ? legacyMeta.category : nextKind === 'system' ? 'System' : undefined);

      return {
        ...item,
        kind: nextKind,
        ...(nextCategory ? { category: nextCategory } : {}),
        targetPath: normalizeLegacyTargetPath(item.targetPath),
        ...(item.institutionName
          ? { institutionName: canonicalizeInstitutionName(item.institutionName) }
          : {}),
      };
    }),
    activityFeed: rawActivityFeed.map((item) => ({
      ...item,
      targetPath: normalizeLegacyTargetPath(item.targetPath),
      institutionName:
        item.institutionName === LEGACY_WESTBRIDGE_NAME
          ? GRACE_INSTITUTION_NAME
          : item.institutionName,
    })),
  };
}

function emitActivityNotificationPure(
  prevState,
  {
    roleKey,
    institutionName,
    recipientEmail,
    category,
    title,
    body,
    targetPath,
    eventKey,
  }
) {
  const existingNotifications = Array.isArray(prevState?.notifications)
    ? prevState.notifications
    : [];
  const cleanRole = String(roleKey || '').trim();
  const cleanInst = canonicalizeInstitutionName(institutionName || '');
  const cleanEventKey = String(eventKey || '').trim();
  const cleanRecipient = String(recipientEmail || '').trim().toLowerCase();

  if (
    !cleanInst ||
    !cleanEventKey ||
    !['student', 'supervisor', 'institution_admin'].includes(cleanRole)
  ) {
    return existingNotifications;
  }

  const dedupeKey = `${cleanEventKey}::${cleanRole}::${cleanInst}::${cleanRecipient || '*'}`;
  if (existingNotifications.some((n) => n?.dedupeKey === dedupeKey)) {
    return existingNotifications;
  }

  if (cleanRecipient) {
    const recipientPrefs = resolveNotificationPreferences(
      prevState.notificationPreferences,
      { roleKey: cleanRole, institutionName: cleanInst, status: 'Approved' },
      { email: cleanRecipient }
    );
    if (
      !recipientPrefs.activityEnabled ||
      (category &&
        Object.prototype.hasOwnProperty.call(recipientPrefs.activityCategories, category) &&
        !recipientPrefs.activityCategories[category])
    ) {
      return existingNotifications;
    }
  }

  const nextEntry = {
    id: `n-act-${dedupeKey}`,
    roleKey: cleanRole,
    recipientEmail: cleanRecipient,
    institutionName: cleanInst,
    kind: 'activity',
    category: category || 'Tasks',
    dedupeKey,
    status: 'active',
    title,
    body,
    time: 'Just now',
    createdAtIso: getCurrentIsoDate(new Date()),
    read: false,
    targetPath: normalizeLegacyTargetPath(targetPath),
  };

  return [nextEntry, ...existingNotifications];
}

const DemoAppStateContext = createContext(null);

export function DemoAppStateProvider({ children }) {
  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return INITIAL_STATE;
      const parsed = JSON.parse(saved);
      return migratePersistedState(parsed);
    } catch {
      return INITIAL_STATE;
    }
  });

  const nextSeqRef = useRef(1);
  const nextUid = useCallback((prefix) => {
    const seq = nextSeqRef.current;
    nextSeqRef.current += 1;
    return `${prefix}-${Date.now()}-${seq}`;
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage quota errors
    }
  }, [state]);

  const resetDemoState = () => {
    setState(INITIAL_STATE);
  };

  const recordActivity = (entry) => {
    const now = getCurrentLocalTimestamp(new Date());
    const afId = nextUid('af');
    setState((prev) => ({
      ...prev,
      activityFeed: [
        {
          id: afId,
          timestamp: now,
          roleScope: 'all',
          ...entry,
          institutionName: canonicalizeInstitutionName(entry?.institutionName) || entry?.institutionName,
        },
        ...(prev.activityFeed || []),
      ].slice(0, 50),
    }));
  };

  const markNotificationRead = (id) => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }));
  };

  const markAllNotificationsRead = (roleKey, scope = null) => {
    const scopeInst = canonicalizeInstitutionName(scope?.institutionName || '');
    const scopeEmail = String(scope?.recipientEmail || '').trim().toLowerCase();

    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => {
        if (n.roleKey !== roleKey) return n;
        if (n.status === 'resolved' || n.status === 'suppressed') return n;
        if (n.institutionName && scopeInst && canonicalizeInstitutionName(n.institutionName) !== scopeInst) {
          return n;
        }
        if (n.recipientEmail && scopeEmail && String(n.recipientEmail).trim().toLowerCase() !== scopeEmail) {
          return n;
        }
        return { ...n, read: true };
      }),
    }));
  };

  const getScopedNotificationPreferences = useCallback(
    (email, roleKey, institutionName) =>
      resolveNotificationPreferences(
        state.notificationPreferences,
        { roleKey, institutionName, status: 'Approved' },
        { email }
      ),
    [state.notificationPreferences]
  );

  const updateNotificationPreferences = useCallback((scope, updates = {}) => {
    if (!scope || typeof scope !== 'object' || !updates || typeof updates !== 'object') return;
    const scopeKey = buildNotificationPreferenceKey(
      scope.email,
      scope.roleKey,
      scope.institutionName
    );
    if (!scopeKey) return;

    const updatedAt = getCurrentLocalTimestamp(new Date());
    setState((prev) => {
      const existing = prev.notificationPreferences?.[scopeKey];
      const base = updates.reset
        ? DEFAULT_NOTIFICATION_PREFERENCES
        : sanitizeNotificationPreferences(existing);

      const merged = updates.reset
        ? { ...DEFAULT_NOTIFICATION_PREFERENCES, updatedAt }
        : sanitizeNotificationPreferences({
            ...base,
            ...updates,
            categories: {
              ...base.categories,
              ...(updates.categories || {}),
            },
            activityCategories: {
              ...base.activityCategories,
              ...(updates.activityCategories || {}),
            },
            updatedAt,
          });

      return {
        ...prev,
        notificationPreferences: {
          ...(prev.notificationPreferences || {}),
          [scopeKey]: merged,
        },
      };
    });
  }, []);

  const syncDeadlineReminders = useCallback((syncContext = {}, referenceDate = new Date()) => {
    const { activeMembership, session } = syncContext || {};
    if (!activeMembership || !session) return;

    setState((prev) => {
      const openCandidateKeys = evaluateOpenReminderCandidateKeys({
        state: prev,
        activeMembership,
        session,
        referenceDate,
      });
      const evaluated = evaluateDeadlineReminders({
        state: prev,
        activeMembership,
        session,
        referenceDate,
      });
      const reconciledDeadlines = reconcileDeadlineRemindersState({
        notifications: prev.notifications,
        evaluatedReminders: evaluated,
        openCandidateKeys,
        activeMembership,
        session,
        referenceDate,
      });
      const reconciledActivity = reconcileActivityPreferencesState({
        notifications: reconciledDeadlines.notifications,
        notificationPreferences: prev.notificationPreferences,
        activeMembership,
        session,
        referenceDate,
      });

      if (!reconciledDeadlines.changed && !reconciledActivity.changed) return prev;
      return {
        ...prev,
        notifications: reconciledActivity.notifications,
      };
    });
  }, []);

  const updateUserProfile = (email, updates, scope = null) => {
    const cleanEmail = typeof email === 'string' ? email.trim() : '';
    if (!cleanEmail || !updates || typeof updates !== 'object') return;

    const sharedUpdates = sanitizeProfileUpdates(updates);
    const scopeKey = scope
      ? buildProfileScopeKey(scope.roleKey, scope.institutionName)
      : '';
    const scopedUpdates = scopeKey
      ? sanitizeRoleScopedProfileUpdates(updates)
      : {};

    if (
      Object.keys(sharedUpdates).length === 0 &&
      Object.keys(scopedUpdates).length === 0
    ) {
      return;
    }

    setState((prev) => {
      const existing = prev.userProfiles?.[cleanEmail] || {};
      const existingRoleProfiles =
        existing.roleProfiles && typeof existing.roleProfiles === 'object'
          ? existing.roleProfiles
          : {};

      const nextRoleProfiles =
        scopeKey && Object.keys(scopedUpdates).length > 0
          ? {
              ...existingRoleProfiles,
              [scopeKey]: {
                ...(existingRoleProfiles[scopeKey] || {}),
                ...scopedUpdates,
              },
            }
          : existingRoleProfiles;

      return {
        ...prev,
        userProfiles: {
          ...prev.userProfiles,
          [cleanEmail]: {
            ...existing,
            ...sharedUpdates,
            roleProfiles: nextRoleProfiles,
          },
        },
      };
    });
  };

  // Student project actions
  const addProjectTask = (institutionName, task) => {
    const taskId = nextUid('t');
    setState((prev) => {
      const targetKey = resolveInstitutionKey(prev.projectsByInstitution, institutionName);
      const proj = targetKey ? prev.projectsByInstitution[targetKey] : null;
      if (!proj) return prev;
      return {
        ...prev,
        projectsByInstitution: {
          ...prev.projectsByInstitution,
          [targetKey]: {
            ...proj,
            tasks: [
              {
                id: taskId,
                completed: false,
                status: 'todo',
                priority: 'Medium',
                ...task,
              },
              ...proj.tasks,
            ],
          },
        },
      };
    });
    recordActivity({
      roleScope: 'student',
      institutionName,
      category: 'Tasks',
      actor: 'Student',
      actorRole: 'Student',
      action: `Created task "${task.title}"`,
      detail: `Priority: ${task.priority || 'Medium'} · Due ${task.dueDate}`,
      targetPath: '/student/tasks',
    });
  };

  const toggleProjectTask = (institutionName, taskId) => {
    setState((prev) => {
      const targetKey = resolveInstitutionKey(prev.projectsByInstitution, institutionName);
      const proj = targetKey ? prev.projectsByInstitution[targetKey] : null;
      if (!proj) return prev;
      return {
        ...prev,
        projectsByInstitution: {
          ...prev.projectsByInstitution,
          [targetKey]: {
            ...proj,
            tasks: proj.tasks.map((t) => {
              if (t.id !== taskId) return t;
              const nextCompleted = !t.completed;
              return {
                ...t,
                completed: nextCompleted,
                status: nextCompleted ? 'done' : 'todo',
              };
            }),
          },
        },
      };
    });
  };

  const moveProjectTaskStatus = (institutionName, taskId, nextStatus) => {
    let movedTitle = 'Task';
    setState((prev) => {
      const targetKey = resolveInstitutionKey(prev.projectsByInstitution, institutionName);
      const proj = targetKey ? prev.projectsByInstitution[targetKey] : null;
      if (!proj) return prev;
      const target = proj.tasks.find((t) => t.id === taskId);
      if (target) movedTitle = target.title;
      return {
        ...prev,
        projectsByInstitution: {
          ...prev.projectsByInstitution,
          [targetKey]: {
            ...proj,
            tasks: proj.tasks.map((t) =>
              t.id === taskId
                ? { ...t, status: nextStatus, completed: nextStatus === 'done' }
                : t
            ),
          },
        },
      };
    });
    recordActivity({
      roleScope: 'student',
      institutionName,
      category: 'Tasks',
      actor: 'Student',
      actorRole: 'Student',
      action: `Moved "${movedTitle}" to ${nextStatus.replace('_', ' ')}`,
      detail: 'Kanban board status synchronized.',
      targetPath: '/student/tasks',
    });
  };

  const updateProjectTask = (institutionName, taskId, updates) => {
    setState((prev) => {
      const targetKey = resolveInstitutionKey(prev.projectsByInstitution, institutionName);
      const proj = targetKey ? prev.projectsByInstitution[targetKey] : null;
      if (!proj) return prev;
      return {
        ...prev,
        projectsByInstitution: {
          ...prev.projectsByInstitution,
          [targetKey]: {
            ...proj,
            tasks: proj.tasks.map((t) => (t.id === taskId ? { ...t, ...updates } : t)),
          },
        },
      };
    });
  };

  const deleteProjectTask = (institutionName, taskId) => {
    setState((prev) => {
      const targetKey = resolveInstitutionKey(prev.projectsByInstitution, institutionName);
      const proj = targetKey ? prev.projectsByInstitution[targetKey] : null;
      if (!proj) return prev;
      return {
        ...prev,
        projectsByInstitution: {
          ...prev.projectsByInstitution,
          [targetKey]: {
            ...proj,
            tasks: proj.tasks.filter((t) => t.id !== taskId),
          },
        },
      };
    });
  };

  const addMilestone = (institutionName, milestone, options = {}) => {
    const msId = nextUid('ms');
    const eventKey = options?.eventKey || `milestone-add-${msId}`;
    setState((prev) => {
      const targetKey = resolveInstitutionKey(prev.projectsByInstitution, institutionName);
      const proj = targetKey ? prev.projectsByInstitution[targetKey] : null;
      if (!proj) return prev;
      const nextPhase = proj.milestones.length + 1;
      const nextNotifications = proj.supervisorEmail
        ? emitActivityNotificationPure(prev, {
            roleKey: 'supervisor',
            institutionName: targetKey,
            recipientEmail: proj.supervisorEmail,
            category: 'Tasks',
            title: `New milestone added: ${milestone.title}`,
            body: `${proj.studentName || 'Student'} added a project milestone due ${milestone.dueDate}.`,
            targetPath: '/supervisor/milestones',
            eventKey,
          })
        : prev.notifications;

      return {
        ...prev,
        projectsByInstitution: {
          ...prev.projectsByInstitution,
          [targetKey]: {
            ...proj,
            milestones: [
              ...proj.milestones,
              {
                id: msId,
                phaseNumber: nextPhase,
                description: '',
                weightPercent: 20,
                status: 'In Progress',
                feedbackEntries: [],
                ...milestone,
              },
            ],
          },
        },
        notifications: nextNotifications,
      };
    });
    recordActivity({
      roleScope: 'all',
      institutionName,
      category: 'Tasks',
      actor: 'Student',
      actorRole: 'Student',
      action: `Defined milestone phase "${milestone.title}"`,
      detail: `Due ${milestone.dueDate} · Weight ${milestone.weightPercent || 20}%`,
      targetPath: '/student/milestones',
    });
  };

  const addMilestoneFeedback = (
    institutionName,
    milestoneId,
    { authorName, authorRole, comment, nextStatus },
    options = {}
  ) => {
    const now = getCurrentLocalTimestamp(new Date());
    const mfbId = nextUid('mfb');
    const eventKey = options?.eventKey || `milestone-feedback-${milestoneId}-${mfbId}`;
    let msTitle = 'Project Milestone';
    setState((prev) => {
      const targetKey = resolveInstitutionKey(prev.projectsByInstitution, institutionName);
      const proj = targetKey ? prev.projectsByInstitution[targetKey] : null;
      if (!proj) return prev;

      const targetMs = proj.milestones.find((m) => m.id === milestoneId);
      if (!targetMs) return prev;
      msTitle = targetMs.title;

      const isSupervisorAuthor = authorRole === 'supervisor';
      const recipientRole = isSupervisorAuthor ? 'student' : 'supervisor';
      const recipientEmail = isSupervisorAuthor ? proj.studentEmail : proj.supervisorEmail;
      const targetPath = isSupervisorAuthor ? '/student/milestones' : '/supervisor/milestones';

      const nextNotifications = recipientEmail
        ? emitActivityNotificationPure(prev, {
            roleKey: recipientRole,
            institutionName: targetKey,
            recipientEmail,
            category: 'Documents',
            title: isSupervisorAuthor
              ? `Milestone feedback: ${msTitle}`
              : `Student commented on milestone: ${msTitle}`,
            body: String(comment || '').slice(0, 95),
            targetPath,
            eventKey,
          })
        : prev.notifications;

      return {
        ...prev,
        projectsByInstitution: {
          ...prev.projectsByInstitution,
          [targetKey]: {
            ...proj,
            milestones: proj.milestones.map((m) => {
              if (m.id !== milestoneId) return m;
              const resolvedStatus = nextStatus || m.status;
              const entry = {
                id: mfbId,
                authorName,
                authorRole,
                statusSnapshot: resolvedStatus,
                comment,
                createdAt: now,
              };
              return {
                ...m,
                status: resolvedStatus,
                feedbackEntries: [entry, ...(m.feedbackEntries || [])],
              };
            }),
          },
        },
        notifications: nextNotifications,
      };
    });
    recordActivity({
      roleScope: 'all',
      institutionName,
      category: 'Documents',
      actor: authorName,
      actorRole: authorRole === 'supervisor' ? 'Supervisor' : 'Student',
      action: `Posted feedback on "${msTitle}"`,
      detail: `${nextStatus ? `Status: ${nextStatus} · ` : ''}${comment.slice(0, 80)}`,
      targetPath: authorRole === 'supervisor' ? '/supervisor/milestones' : '/student/milestones',
    });
  };

  const updateMilestoneStatus = (institutionName, milestoneId, nextStatus, options = {}) => {
    const nonce = nextUid('msstat');
    const eventKey = options?.eventKey || `milestone-status-${milestoneId}-${nextStatus}-${nonce}`;
    setState((prev) => {
      const targetKey = resolveInstitutionKey(prev.projectsByInstitution, institutionName);
      const proj = targetKey ? prev.projectsByInstitution[targetKey] : null;
      if (!proj) return prev;
      const targetMs = proj.milestones.find((m) => m.id === milestoneId);
      if (!targetMs || targetMs.status === nextStatus) return prev;

      const actorRole =
        options?.actorRole || (nextStatus === 'Pending Review' ? 'student' : 'supervisor');
      const isStudentActor = actorRole === 'student';
      const recipientRole = isStudentActor ? 'supervisor' : 'student';
      const recipientEmail = isStudentActor ? proj.supervisorEmail : proj.studentEmail;

      const nextNotifications = recipientEmail
        ? emitActivityNotificationPure(prev, {
            roleKey: recipientRole,
            institutionName: targetKey,
            recipientEmail,
            category: 'Tasks',
            title: isStudentActor
              ? `Milestone approval requested: ${targetMs.title}`
              : `Milestone marked ${nextStatus}: ${targetMs.title}`,
            body: isStudentActor
              ? `${proj.studentName || 'Student'} requested review for Phase ${targetMs.phaseNumber || ''}.`.trim()
              : `${proj.supervisorName || 'Supervisor'} updated a project milestone status to ${nextStatus}.`,
            targetPath: isStudentActor ? '/supervisor/milestones' : '/student/milestones',
            eventKey,
          })
        : prev.notifications;

      return {
        ...prev,
        projectsByInstitution: {
          ...prev.projectsByInstitution,
          [targetKey]: {
            ...proj,
            milestones: proj.milestones.map((m) =>
              m.id === milestoneId ? { ...m, status: nextStatus } : m
            ),
          },
        },
        notifications: nextNotifications,
      };
    });
  };

  const updateMilestoneDueDate = (institutionName, milestoneId, dueDate) => {
    setState((prev) => {
      const targetKey = resolveInstitutionKey(prev.projectsByInstitution, institutionName);
      const proj = targetKey ? prev.projectsByInstitution[targetKey] : null;
      if (!proj) return prev;
      return {
        ...prev,
        projectsByInstitution: {
          ...prev.projectsByInstitution,
          [targetKey]: {
            ...proj,
            milestones: proj.milestones.map((m) =>
              m.id === milestoneId ? { ...m, dueDate } : m
            ),
          },
        },
      };
    });
  };

  const addWeeklyJournal = (institutionName, entry, options = {}) => {
    const today = getCurrentIsoDate(new Date());
    const jId = nextUid('j');
    const eventKey = options?.eventKey || `journal-add-${jId}`;
    setState((prev) => {
      const targetKey = resolveInstitutionKey(prev.projectsByInstitution, institutionName);
      const proj = targetKey ? prev.projectsByInstitution[targetKey] : null;
      if (!proj) return prev;
      const nextWeek = (proj.journals[0]?.weekNumber || 0) + 1;
      const nextNotifications = proj.supervisorEmail
        ? emitActivityNotificationPure(prev, {
            roleKey: 'supervisor',
            institutionName: targetKey,
            recipientEmail: proj.supervisorEmail,
            category: 'Journals',
            title: `New Week ${nextWeek} journal submitted`,
            body: `${proj.studentName || 'Student'} logged a new weekly progress journal for ${targetKey}.`,
            targetPath: '/supervisor/journals',
            eventKey,
          })
        : prev.notifications;

      return {
        ...prev,
        projectsByInstitution: {
          ...prev.projectsByInstitution,
          [targetKey]: {
            ...proj,
            journals: [
              {
                id: jId,
                weekNumber: nextWeek,
                date: today,
                supervisorFeedback: '',
                reviewedAt: '',
                ...entry,
              },
              ...proj.journals,
            ],
          },
        },
        notifications: nextNotifications,
      };
    });
    recordActivity({
      roleScope: 'all',
      institutionName,
      category: 'Journals',
      actor: 'Student',
      actorRole: 'Student',
      action: 'Logged new weekly progress journal',
      detail: entry.summary.slice(0, 100),
      targetPath: '/student/journals',
    });
  };

  const submitDocumentChapter = (institutionName, submission, options = {}) => {
    const today = getCurrentIsoDate(new Date());
    const subId = nextUid('sub');
    const docGroupId = submission.documentGroupId || nextUid('doc');
    const eventKey = options?.eventKey || `doc-submit-${subId}`;
    setState((prev) => {
      const targetKey = resolveInstitutionKey(prev.projectsByInstitution, institutionName);
      const proj = targetKey ? prev.projectsByInstitution[targetKey] : null;
      if (!proj) return prev;
      const nextNotifications = proj.supervisorEmail
        ? emitActivityNotificationPure(prev, {
            roleKey: 'supervisor',
            institutionName: targetKey,
            recipientEmail: proj.supervisorEmail,
            category: 'Documents',
            title: 'New chapter version awaiting review',
            body: `${submission.title} (${submission.version}) was submitted by ${proj.studentName || 'Student'}.`,
            targetPath: '/supervisor/reviews',
            eventKey,
          })
        : prev.notifications;

      return {
        ...prev,
        projectsByInstitution: {
          ...prev.projectsByInstitution,
          [targetKey]: {
            ...proj,
            submissions: [
              {
                id: subId,
                documentGroupId: docGroupId,
                submittedAt: today,
                status: 'Pending Review',
                supervisorFeedback: '',
                studentResponse: '',
                ...submission,
              },
              ...proj.submissions,
            ],
          },
        },
        notifications: nextNotifications,
      };
    });
    recordActivity({
      roleScope: 'all',
      institutionName,
      category: 'Documents',
      actor: 'Student',
      actorRole: 'Student',
      action: `Uploaded ${submission.title} (${submission.version})`,
      detail: submission.fileName || 'Document queued for review.',
      targetPath: '/student/documents',
    });
  };

  const respondToRevision = (institutionName, submissionId, responseText, options = {}) => {
    const nonce = nextUid('revresp');
    const eventKey = options?.eventKey || `doc-rev-response-${submissionId}-${nonce}`;
    setState((prev) => {
      const targetKey = resolveInstitutionKey(prev.projectsByInstitution, institutionName);
      const proj = targetKey ? prev.projectsByInstitution[targetKey] : null;
      if (!proj) return prev;
      const targetSub = proj.submissions.find((s) => s.id === submissionId);
      if (!targetSub) return prev;

      const nextNotifications = proj.supervisorEmail
        ? emitActivityNotificationPure(prev, {
            roleKey: 'supervisor',
            institutionName: targetKey,
            recipientEmail: proj.supervisorEmail,
            category: 'Documents',
            title: `Revision response posted: ${targetSub.title}`,
            body: `${proj.studentName || 'Student'} responded to feedback and requested re-review.`,
            targetPath: '/supervisor/reviews',
            eventKey,
          })
        : prev.notifications;

      return {
        ...prev,
        projectsByInstitution: {
          ...prev.projectsByInstitution,
          [targetKey]: {
            ...proj,
            submissions: proj.submissions.map((sub) =>
              sub.id === submissionId
                ? { ...sub, studentResponse: responseText, status: 'Pending Review' }
                : sub
            ),
          },
        },
        notifications: nextNotifications,
      };
    });
    recordActivity({
      roleScope: 'all',
      institutionName,
      category: 'Documents',
      actor: 'Student',
      actorRole: 'Student',
      action: 'Responded to supervisor revision request',
      detail: responseText.slice(0, 100),
      targetPath: '/student/documents',
    });
  };

  const sendProjectMessage = (institutionName, senderRole, senderName, body, options = {}) => {
    const now = getCurrentLocalTimestamp(new Date());
    const msgId = nextUid('msg');
    const eventKey = options?.eventKey || `msg-${msgId}`;
    setState((prev) => {
      const targetKey = resolveInstitutionKey(prev.projectsByInstitution, institutionName);
      const proj = targetKey ? prev.projectsByInstitution[targetKey] : null;
      if (!proj) return prev;

      const isStudentSender = senderRole === 'student';
      const recipientRole = isStudentSender ? 'supervisor' : 'student';
      const recipientEmail = isStudentSender ? proj.supervisorEmail : proj.studentEmail;

      const nextNotifications = recipientEmail
        ? emitActivityNotificationPure(prev, {
            roleKey: recipientRole,
            institutionName: targetKey,
            recipientEmail,
            category: 'Messages',
            title: `New message from ${senderName}`,
            body: String(body || '').slice(0, 90),
            targetPath: isStudentSender ? '/supervisor/reports' : '/student/messages',
            eventKey,
          })
        : prev.notifications;

      return {
        ...prev,
        projectsByInstitution: {
          ...prev.projectsByInstitution,
          [targetKey]: {
            ...proj,
            messages: [
              ...proj.messages,
              { id: msgId, senderRole, senderName, sentAt: now, body },
            ],
          },
        },
        notifications: nextNotifications,
      };
    });
    recordActivity({
      roleScope: 'all',
      institutionName,
      category: 'Messages',
      actor: senderName,
      actorRole: senderRole === 'student' ? 'Student' : 'Supervisor',
      action: 'Posted project thread message',
      detail: body.slice(0, 100),
      targetPath: senderRole === 'student' ? '/student/messages' : '/supervisor/reports',
    });
  };

  // Supervisor actions
  const reviewSubmission = (
    institutionName,
    submissionId,
    decision,
    feedback,
    isExtra = false,
    options = {}
  ) => {
    const nonce = nextUid('subrev');
    const eventKey = options?.eventKey || `doc-review-${submissionId}-${decision}-${nonce}`;
    setState((prev) => {
      if (isExtra) {
        // Extra supervisees (e.g., Liam Gallagher / Amara Okafor) do not have a scoped user account
        // in DemoAppStateContext; update queue without broadcasting to unrelated student accounts.
        return {
          ...prev,
          supervisorExtraSubmissions: prev.supervisorExtraSubmissions.map((s) =>
            s.id === submissionId ? { ...s, status: decision, supervisorFeedback: feedback } : s
          ),
        };
      }
      const targetKey = resolveInstitutionKey(prev.projectsByInstitution, institutionName);
      const proj = targetKey ? prev.projectsByInstitution[targetKey] : null;
      if (!proj) return prev;
      const targetSub = proj.submissions.find((s) => s.id === submissionId);
      if (!targetSub) return prev;

      const nextNotifications = proj.studentEmail
        ? emitActivityNotificationPure(prev, {
            roleKey: 'student',
            institutionName: targetKey,
            recipientEmail: proj.studentEmail,
            category: 'Documents',
            title: `Submission ${decision}: ${targetSub.title}`,
            body: feedback || `Your supervisor marked a submission as ${decision}.`,
            targetPath: '/student/documents',
            eventKey,
          })
        : prev.notifications;

      return {
        ...prev,
        projectsByInstitution: {
          ...prev.projectsByInstitution,
          [targetKey]: {
            ...proj,
            submissions: proj.submissions.map((s) =>
              s.id === submissionId ? { ...s, status: decision, supervisorFeedback: feedback } : s
            ),
            milestones: targetSub
              ? proj.milestones.map((m) =>
                  m.id === targetSub.milestoneId ? { ...m, status: decision } : m
                )
              : proj.milestones,
          },
        },
        notifications: nextNotifications,
      };
    });
    recordActivity({
      roleScope: 'all',
      institutionName,
      category: 'Documents',
      actor: 'Supervisor',
      actorRole: 'Supervisor',
      action: `Marked document submission as ${decision}`,
      detail: feedback || 'Review decision saved.',
      targetPath: '/supervisor/reviews',
    });
  };

  const addJournalFeedback = (institutionName, journalId, feedback, options = {}) => {
    const today = getCurrentIsoDate(new Date());
    const nonce = nextUid('jfb');
    const eventKey = options?.eventKey || `journal-feedback-${journalId}-${nonce}`;
    setState((prev) => {
      const targetKey = resolveInstitutionKey(prev.projectsByInstitution, institutionName);
      const proj = targetKey ? prev.projectsByInstitution[targetKey] : null;
      if (!proj) return prev;
      const targetJournal = proj.journals.find((j) => j.id === journalId);
      if (!targetJournal) return prev;

      const nextNotifications = proj.studentEmail
        ? emitActivityNotificationPure(prev, {
            roleKey: 'student',
            institutionName: targetKey,
            recipientEmail: proj.studentEmail,
            category: 'Journals',
            title: `Supervisor reviewed Week ${targetJournal.weekNumber || ''} journal`.trim(),
            body: String(feedback || '').slice(0, 90),
            targetPath: '/student/journals',
            eventKey,
          })
        : prev.notifications;

      return {
        ...prev,
        projectsByInstitution: {
          ...prev.projectsByInstitution,
          [targetKey]: {
            ...proj,
            journals: proj.journals.map((j) =>
              j.id === journalId ? { ...j, supervisorFeedback: feedback, reviewedAt: today } : j
            ),
          },
        },
        notifications: nextNotifications,
      };
    });
  };

  // Institution Admin actions
  const updateInstitutionInfo = (institutionName, updates) => {
    setState((prev) => {
      const targetKey = resolveInstitutionKey(prev.institutionsState, institutionName);
      const inst = targetKey ? prev.institutionsState[targetKey] : null;
      if (!inst) return prev;
      return {
        ...prev,
        institutionsState: {
          ...prev.institutionsState,
          [targetKey]: {
            ...inst,
            info: { ...inst.info, ...updates },
          },
        },
      };
    });
  };

  const addInstitutionDepartment = (
    institutionName,
    deptName,
    initialProgramme,
    metadata = {}
  ) => {
    setState((prev) => {
      const targetKey = resolveInstitutionKey(prev.institutionsState, institutionName);
      const inst = targetKey ? prev.institutionsState[targetKey] : null;
      if (!inst) return prev;
      const schoolId = metadata.schoolId || inst.schools?.[0]?.id || 'ssrt';
      const schoolName =
        inst.schools?.find((s) => s.id === schoolId)?.name ||
        SCHOOL_NAME_BY_ID[schoolId] ||
        'Academic School';
      const cleanCode =
        (metadata.code || deptName.slice(0, 3)).trim().toUpperCase().slice(0, 6) || 'DEPT';
      return {
        ...prev,
        institutionsState: {
          ...prev.institutionsState,
          [targetKey]: {
            ...inst,
            departments: [
              ...inst.departments,
              {
                id: `dept-${Date.now()}`,
                code: cleanCode,
                schoolId,
                schoolName,
                name: deptName,
                programmes: initialProgramme ? [initialProgramme] : [],
                qualificationLevels:
                  Array.isArray(metadata.qualificationLevels) &&
                  metadata.qualificationLevels.length > 0
                    ? metadata.qualificationLevels
                    : ['ND', 'HND'],
                studyModes:
                  Array.isArray(metadata.studyModes) && metadata.studyModes.length > 0
                    ? metadata.studyModes
                    : ['Full-Time'],
                students: 0,
                supervisors: 0,
                provisional: true,
              },
            ],
          },
        },
      };
    });
  };

  const addAcademicSession = (institutionName, sessionName) => {
    setState((prev) => {
      const targetKey = resolveInstitutionKey(prev.institutionsState, institutionName);
      const inst = targetKey ? prev.institutionsState[targetKey] : null;
      if (!inst) return prev;
      return {
        ...prev,
        institutionsState: {
          ...prev.institutionsState,
          [targetKey]: {
            ...inst,
            sessions: [
              { id: `ses-${Date.now()}`, name: sessionName, active: true, provisional: true },
              ...inst.sessions.map((s) => ({ ...s, active: false })),
            ],
          },
        },
      };
    });
  };

  const activateAcademicSession = (institutionName, sessionId) => {
    setState((prev) => {
      const targetKey = resolveInstitutionKey(prev.institutionsState, institutionName);
      const inst = targetKey ? prev.institutionsState[targetKey] : null;
      if (!inst) return prev;
      return {
        ...prev,
        institutionsState: {
          ...prev.institutionsState,
          [targetKey]: {
            ...inst,
            sessions: inst.sessions.map((s) => ({
              ...s,
              active: s.id === sessionId,
            })),
          },
        },
      };
    });
  };

  const decideMembershipRequest = (institutionName, requestId, decision) => {
    setState((prev) => {
      const targetKey = resolveInstitutionKey(prev.institutionsState, institutionName);
      const inst = targetKey ? prev.institutionsState[targetKey] : null;
      if (!inst) return prev;
      return {
        ...prev,
        institutionsState: {
          ...prev.institutionsState,
          [targetKey]: {
            ...inst,
            membershipRequests: inst.membershipRequests.map((r) =>
              r.id === requestId ? { ...r, status: decision } : r
            ),
          },
        },
      };
    });
    const labelName = canonicalizeInstitutionName(institutionName) || institutionName;
    recordActivity({
      roleScope: 'institution_admin',
      institutionName: labelName,
      category: 'Governance',
      actor: 'Institution Admin',
      actorRole: 'Institution Admin',
      action: `Marked membership request as ${decision}`,
      detail: `Scoped to ${labelName}.`,
      targetPath: '/admin/approvals',
    });
  };

  const createSupervisorInvite = (institutionName, email, department) => {
    const code = `SPT-${Math.floor(1000 + Math.random() * 9000)}`;
    const today = getCurrentIsoDate(new Date());
    setState((prev) => {
      const targetKey = resolveInstitutionKey(prev.institutionsState, institutionName);
      const inst = targetKey ? prev.institutionsState[targetKey] : null;
      if (!inst) return prev;
      return {
        ...prev,
        institutionsState: {
          ...prev.institutionsState,
          [targetKey]: {
            ...inst,
            invitations: [
              {
                id: `inv-${Date.now()}`,
                email,
                department,
                code,
                status: 'Demo Invite (Stage D Verification Deferred)',
                createdAt: today,
              },
              ...inst.invitations,
            ],
          },
        },
      };
    });
    return code;
  };

  const assignSupervisorToProject = (institutionName, projectId, supervisorName) => {
    setState((prev) => {
      const targetKey = resolveInstitutionKey(prev.institutionsState, institutionName);
      const inst = targetKey ? prev.institutionsState[targetKey] : null;
      if (!inst) return prev;
      return {
        ...prev,
        institutionsState: {
          ...prev.institutionsState,
          [targetKey]: {
            ...inst,
            projects: inst.projects.map((p) =>
              p.id === projectId ? { ...p, supervisorName } : p
            ),
          },
        },
      };
    });
  };

  const createInstitutionProject = (institutionName, project) => {
    setState((prev) => {
      const targetKey = resolveInstitutionKey(prev.institutionsState, institutionName);
      const inst = targetKey ? prev.institutionsState[targetKey] : null;
      if (!inst) return prev;
      const code =
        project.code?.trim() ||
        `${inst.info.shortCode || 'GP'}-2026-${String(inst.projects.length + 101)}`;
      return {
        ...prev,
        institutionsState: {
          ...prev.institutionsState,
          [targetKey]: {
            ...inst,
            projects: [
              {
                id: `ip-${Date.now()}`,
                code,
                progress: 0,
                supervisorName: 'Unassigned',
                ...project,
              },
              ...inst.projects,
            ],
          },
        },
      };
    });
  };

  // Platform Admin actions
  const decideInstitutionApplication = (instId, nextStatus, actorName) => {
    const now = new Date().toISOString().slice(0, 16).replace('T', ' ') + ' UTC';
    setState((prev) => {
      const target = prev.platformState.institutions.find((i) => i.id === instId);
      return {
        ...prev,
        platformState: {
          ...prev.platformState,
          institutions: prev.platformState.institutions.map((i) =>
            i.id === instId ? { ...i, status: nextStatus } : i
          ),
          auditLogs: [
            {
              id: `log-${Date.now()}`,
              timestamp: now,
              actor: actorName || 'Platform Admin',
              action: `Updated institution status to ${nextStatus}`,
              target: target ? target.institutionName : instId,
            },
            ...prev.platformState.auditLogs,
          ],
        },
      };
    });
    recordActivity({
      roleScope: 'platform_admin',
      institutionName: 'Platform-Wide Governance',
      category: 'Governance',
      actor: actorName || 'Platform Admin',
      actorRole: 'Platform Admin',
      action: `Updated institution application to ${nextStatus}`,
      detail: `Institution ID: ${instId}`,
      targetPath: '/platform/applications',
    });
  };

  const addPlatformAdmin = (name, email, actorName) => {
    const now = new Date().toISOString().slice(0, 16).replace('T', ' ') + ' UTC';
    setState((prev) => ({
      ...prev,
      platformState: {
        ...prev.platformState,
        platformAdmins: [
          ...prev.platformState.platformAdmins,
          {
            id: `pa-${Date.now()}`,
            name,
            email,
            addedAt: getCurrentIsoDate(),
            status: 'Active',
          },
        ],
        auditLogs: [
          {
            id: `log-${Date.now()}`,
            timestamp: now,
            actor: actorName || 'Platform Admin',
            action: 'Granted platform administrator privilege via trusted workflow',
            target: email,
          },
          ...prev.platformState.auditLogs,
        ],
      },
    }));
  };

  const updatePlatformSettings = (updates, actorName) => {
    const now = new Date().toISOString().slice(0, 16).replace('T', ' ') + ' UTC';
    setState((prev) => ({
      ...prev,
      platformState: {
        ...prev.platformState,
        settings: { ...prev.platformState.settings, ...updates },
        auditLogs: [
          {
            id: `log-${Date.now()}`,
            timestamp: now,
            actor: actorName || 'Platform Admin',
            action: 'Updated platform governance settings',
            target: 'Platform Configuration',
          },
          ...prev.platformState.auditLogs,
        ],
      },
    }));
  };

  // Supervisor Office Hours & Student Scheduling actions
  const addOfficeHourSlot = (institutionName, slot, options = {}) => {
    const ohId = nextUid('oh');
    const eventKey = options?.eventKey || `oh-slot-${ohId}`;
    setState((prev) => {
      const targetKey =
        resolveInstitutionKey(prev.officeHoursByInstitution, institutionName) ||
        canonicalizeInstitutionName(institutionName);
      if (!targetKey) return prev;
      const current = prev.officeHoursByInstitution?.[targetKey] || {
        availabilitySlots: [],
        bookings: [],
      };
      const projKey = resolveInstitutionKey(prev.projectsByInstitution, targetKey);
      const proj = projKey ? prev.projectsByInstitution[projKey] : null;
      const nextNotifications = proj?.studentEmail
        ? emitActivityNotificationPure(prev, {
            roleKey: 'student',
            institutionName: targetKey,
            recipientEmail: proj.studentEmail,
            category: 'Governance',
            title: 'New supervisor office hour slot published',
            body: `${slot.supervisorName} added ${slot.dayOfWeek} (${slot.startTime}–${slot.endTime}).`,
            targetPath: '/student/office-hours',
            eventKey,
          })
        : prev.notifications;

      return {
        ...prev,
        officeHoursByInstitution: {
          ...prev.officeHoursByInstitution,
          [targetKey]: {
            ...current,
            availabilitySlots: [
              {
                id: ohId,
                active: true,
                slotMinutes: 30,
                ...slot,
              },
              ...current.availabilitySlots,
            ],
          },
        },
        notifications: nextNotifications,
      };
    });
    recordActivity({
      roleScope: 'all',
      institutionName,
      category: 'Governance',
      actor: slot.supervisorName,
      actorRole: 'Supervisor',
      action: `Published weekly office hours (${slot.dayOfWeek} ${slot.startTime}–${slot.endTime})`,
      detail: `${slot.mode} · ${slot.locationOrLink}`,
      targetPath: '/supervisor/office-hours',
    });
  };

  const toggleOfficeHourSlot = (institutionName, slotId) => {
    setState((prev) => {
      const targetKey = resolveInstitutionKey(prev.officeHoursByInstitution, institutionName);
      const current = targetKey ? prev.officeHoursByInstitution?.[targetKey] : null;
      if (!current) return prev;
      return {
        ...prev,
        officeHoursByInstitution: {
          ...prev.officeHoursByInstitution,
          [targetKey]: {
            ...current,
            availabilitySlots: current.availabilitySlots.map((s) =>
              s.id === slotId ? { ...s, active: !s.active } : s
            ),
          },
        },
      };
    });
  };

  const deleteOfficeHourSlot = (institutionName, slotId) => {
    setState((prev) => {
      const targetKey = resolveInstitutionKey(prev.officeHoursByInstitution, institutionName);
      const current = targetKey ? prev.officeHoursByInstitution?.[targetKey] : null;
      if (!current) return prev;
      return {
        ...prev,
        officeHoursByInstitution: {
          ...prev.officeHoursByInstitution,
          [targetKey]: {
            ...current,
            availabilitySlots: current.availabilitySlots.filter((s) => s.id !== slotId),
          },
        },
      };
    });
  };

  const bookOfficeHourSlot = (institutionName, booking, options = {}) => {
    const today = getCurrentIsoDate(new Date());
    const bkId = nextUid('bk');
    const eventKey = options?.eventKey || `oh-book-${bkId}`;
    setState((prev) => {
      const targetKey =
        resolveInstitutionKey(prev.officeHoursByInstitution, institutionName) ||
        canonicalizeInstitutionName(institutionName);
      if (!targetKey) return prev;
      const current = prev.officeHoursByInstitution?.[targetKey] || {
        availabilitySlots: [],
        bookings: [],
      };
      const matchedSlot = (current.availabilitySlots || []).find(
        (s) => s.id === booking.slotId
      );
      const projKey = resolveInstitutionKey(prev.projectsByInstitution, targetKey);
      const proj = projKey ? prev.projectsByInstitution[projKey] : null;
      const recipientEmail = matchedSlot?.supervisorEmail || proj?.supervisorEmail || '';

      const nextNotifications = recipientEmail
        ? emitActivityNotificationPure(prev, {
            roleKey: 'supervisor',
            institutionName: targetKey,
            recipientEmail,
            category: 'Messages',
            title: 'New office hour booking request',
            body: `${booking.studentName} requested ${booking.meetingDate} (${booking.timeRange}): ${booking.topic}`,
            targetPath: '/supervisor/office-hours',
            eventKey,
          })
        : prev.notifications;

      return {
        ...prev,
        officeHoursByInstitution: {
          ...prev.officeHoursByInstitution,
          [targetKey]: {
            ...current,
            bookings: [
              {
                id: bkId,
                status: 'Pending',
                supervisorNote: '',
                createdAt: today,
                ...booking,
              },
              ...current.bookings,
            ],
          },
        },
        notifications: nextNotifications,
      };
    });
    recordActivity({
      roleScope: 'all',
      institutionName,
      category: 'Messages',
      actor: booking.studentName,
      actorRole: 'Student',
      action: `Booked supervisor office hour for ${booking.meetingDate}`,
      detail: `${booking.timeRange} · ${booking.topic}`,
      targetPath: '/student/office-hours',
    });
  };

  const updateOfficeHourBooking = (
    institutionName,
    bookingId,
    status,
    supervisorNote = '',
    options = {}
  ) => {
    const nonce = nextUid('bkstat');
    const eventKey = options?.eventKey || `oh-booking-${bookingId}-${status}-${nonce}`;
    let targetStudent = 'Student';
    let targetDate = '';
    setState((prev) => {
      const targetKey = resolveInstitutionKey(prev.officeHoursByInstitution, institutionName);
      const current = targetKey ? prev.officeHoursByInstitution?.[targetKey] : null;
      if (!current) return prev;
      const targetBooking = current.bookings.find((b) => b.id === bookingId);
      if (!targetBooking) return prev;
      if (
        targetBooking.status === status &&
        (!supervisorNote || targetBooking.supervisorNote === supervisorNote)
      ) {
        return prev;
      }

      targetStudent = targetBooking.studentName || 'Student';
      targetDate = targetBooking.meetingDate || '';

      const isStudentCancel =
        options?.actorRole === 'student' ||
        (status === 'Cancelled' && supervisorNote === 'Cancelled by student.');

      let nextNotifications = prev.notifications;
      if (isStudentCancel) {
        const matchedSlot = (current.availabilitySlots || []).find(
          (s) => s.id === targetBooking.slotId
        );
        const projKey = resolveInstitutionKey(prev.projectsByInstitution, targetKey);
        const proj = projKey ? prev.projectsByInstitution[projKey] : null;
        const supervisorEmail = matchedSlot?.supervisorEmail || proj?.supervisorEmail || '';
        if (supervisorEmail) {
          nextNotifications = emitActivityNotificationPure(prev, {
            roleKey: 'supervisor',
            institutionName: targetKey,
            recipientEmail: supervisorEmail,
            category: 'Governance',
            title: `Office hour cancelled by ${targetStudent}`,
            body: `${targetDate ? `${targetDate} (${targetBooking.timeRange || ''}): ` : ''}Student cancelled the scheduled consultation.`,
            targetPath: '/supervisor/office-hours',
            eventKey,
          });
        }
      } else if (targetBooking.studentEmail) {
        nextNotifications = emitActivityNotificationPure(prev, {
          roleKey: 'student',
          institutionName: targetKey,
          recipientEmail: targetBooking.studentEmail,
          category: 'Governance',
          title: `Office hour booking ${status}`,
          body: `${targetDate ? `${targetDate}: ` : ''}${supervisorNote || `Your appointment status is now ${status}.`}`,
          targetPath: '/student/office-hours',
          eventKey,
        });
      }

      return {
        ...prev,
        officeHoursByInstitution: {
          ...prev.officeHoursByInstitution,
          [targetKey]: {
            ...current,
            bookings: current.bookings.map((b) =>
              b.id === bookingId
                ? {
                    ...b,
                    status,
                    supervisorNote: supervisorNote || b.supervisorNote,
                  }
                : b
            ),
          },
        },
        notifications: nextNotifications,
      };
    });
    recordActivity({
      roleScope: 'all',
      institutionName,
      category: 'Governance',
      actor: supervisorNote === 'Cancelled by student.' ? targetStudent : 'Supervisor',
      actorRole: supervisorNote === 'Cancelled by student.' ? 'Student' : 'Supervisor',
      action: `Marked ${targetStudent}'s office hour booking as ${status}`,
      detail: supervisorNote || `Scheduled date: ${targetDate}`,
      targetPath: '/supervisor/office-hours',
    });
  };

  return (
    <DemoAppStateContext.Provider
      value={{
        state,
        resetDemoState,
        markNotificationRead,
        markAllNotificationsRead,
        getScopedNotificationPreferences,
        updateNotificationPreferences,
        syncDeadlineReminders,
        updateUserProfile,
        addProjectTask,
        toggleProjectTask,
        moveProjectTaskStatus,
        updateProjectTask,
        deleteProjectTask,
        addMilestone,
        addMilestoneFeedback,
        updateMilestoneStatus,
        updateMilestoneDueDate,
        addWeeklyJournal,
        submitDocumentChapter,
        respondToRevision,
        sendProjectMessage,
        reviewSubmission,
        addJournalFeedback,
        updateInstitutionInfo,
        addInstitutionDepartment,
        addAcademicSession,
        activateAcademicSession,
        decideMembershipRequest,
        createSupervisorInvite,
        assignSupervisorToProject,
        createInstitutionProject,
        decideInstitutionApplication,
        addPlatformAdmin,
        updatePlatformSettings,
        recordActivity,
        addOfficeHourSlot,
        toggleOfficeHourSlot,
        deleteOfficeHourSlot,
        bookOfficeHourSlot,
        updateOfficeHourBooking,
      }}
    >
      {children}
    </DemoAppStateContext.Provider>
  );
}

export function useDemoAppState() {
  const ctx = useContext(DemoAppStateContext);
  if (!ctx) {
    throw new Error('useDemoAppState must be used inside DemoAppStateProvider');
  }
  return ctx;
}
