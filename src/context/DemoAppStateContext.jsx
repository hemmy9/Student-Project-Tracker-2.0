import { createContext, useContext, useEffect, useState } from 'react';

const STORAGE_KEY = 'spt_stage3_demo_state_v1';

const INITIAL_STATE = {
  userProfiles: {
    'student.demo@westbridge.edu': {
      phone: '+44 7700 900418',
      bio: 'Final-year Software Engineering student researching edge flood telemetry.',
      emailNotifications: true,
    },
    'supervisor.demo@westbridge.edu': {
      phone: '+44 7700 900102',
      bio: 'Senior Lecturer supervising embedded systems and distributed architectures.',
      emailNotifications: true,
    },
    'admin.demo@westbridge.edu': {
      phone: '+44 7700 900880',
      bio: 'Academic Projects Coordinator at University of Westbridge.',
      emailNotifications: true,
    },
    'platform.demo@projecttracker.app': {
      phone: '+234 800 555 0190',
      bio: 'Platform Governance & Verification Lead.',
      emailNotifications: true,
    },
    'multi.demo@westbridge.edu': {
      phone: '+233 24 555 0144',
      bio: 'Visiting Faculty & Doctoral Researcher across partner institutions.',
      emailNotifications: true,
    },
  },
  projectsByInstitution: {
    'University of Westbridge': {
      id: 'proj-uwb-1',
      code: 'UWB-CS-2026-014',
      title: 'Adaptive Flood Early-Warning Telemetry Network Using Edge Sensors',
      studentName: 'Kwame Boateng',
      studentEmail: 'student.demo@westbridge.edu',
      supervisorName: 'Dr. Samuel Osei',
      supervisorEmail: 'supervisor.demo@westbridge.edu',
      department: 'Department of Computer Science',
      programme: 'B.Sc. Software Engineering',
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
      studentCode: 'UWB-2026-0392',
      programme: 'B.Sc. Computer Science',
      projectTitle: 'Automated Timetable Conflict Solver Using Constraint Search',
      progress: 41,
      lastJournal: '2026-10-26',
      attentionStatus: 'Needs Attention',
      pendingItem: '2 missed weekly journals · Milestone overdue',
    },
    {
      id: 'stu-3',
      name: 'Liam Gallagher',
      studentCode: 'UWB-2026-0511',
      programme: 'M.Sc. Artificial Intelligence',
      projectTitle: 'Interpretable Medical Triage Classification on Edge Devices',
      progress: 82,
      lastJournal: '2026-11-12',
      attentionStatus: 'Review Ready',
      pendingItem: 'Chapter 5 Evaluation Draft awaiting review',
    },
    {
      id: 'stu-4',
      name: 'Zainab Bello',
      studentCode: 'UWB-2026-0447',
      programme: 'B.Sc. Software Engineering',
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
    'University of Westbridge': {
      info: {
        name: 'University of Westbridge',
        shortCode: 'UWB',
        domain: 'westbridge.edu',
        country: 'United Kingdom',
        contactEmail: 'projects-office@westbridge.edu',
      },
      sessions: [
        { id: 'ses-1', name: '2025/2026 Academic Session', active: true },
        { id: 'ses-2', name: '2024/2025 Academic Session', active: false },
      ],
      departments: [
        {
          id: 'dept-cs',
          name: 'Department of Computer Science',
          programmes: [
            'B.Sc. Software Engineering',
            'B.Sc. Computer Science',
            'M.Sc. Artificial Intelligence',
          ],
          students: 78,
          supervisors: 12,
        },
        {
          id: 'dept-ee',
          name: 'Department of Electrical & Electronic Engineering',
          programmes: ['B.Eng. Embedded Systems', 'M.Eng. Power Systems'],
          students: 41,
          supervisors: 7,
        },
        {
          id: 'dept-info',
          name: 'School of Information Systems',
          programmes: ['B.Sc. Information Technology', 'M.Sc. Cybersecurity Governance'],
          students: 23,
          supervisors: 5,
        },
      ],
      membershipRequests: [
        {
          id: 'req-uwb-1',
          name: 'Nadia Mensah',
          email: 'n.mensah@westbridge.edu',
          role: 'Student',
          department: 'Department of Computer Science',
          identifier: 'UWB-2026-0612',
          requestedAt: '2026-11-13',
          status: 'Pending Approval',
        },
        {
          id: 'req-uwb-2',
          name: 'Dr. Henry Addo',
          email: 'h.addo@westbridge.edu',
          role: 'Supervisor',
          department: 'School of Information Systems',
          identifier: 'FAC-2190',
          requestedAt: '2026-11-12',
          status: 'Pending Approval',
        },
        {
          id: 'req-uwb-3',
          name: 'Tunde Adeyemi',
          email: 't.adeyemi@westbridge.edu',
          role: 'Student',
          department: 'Department of Electrical & Electronic Engineering',
          identifier: 'UWB-2026-0639',
          requestedAt: '2026-11-11',
          status: 'Pending Approval',
        },
      ],
      invitations: [
        {
          id: 'inv-1',
          email: 'dr.patel@westbridge.edu',
          department: 'Department of Computer Science',
          code: 'SPT-UWB-8831',
          status: 'Pending Acceptance',
          createdAt: '2026-11-10',
        },
      ],
      projects: [
        {
          id: 'ip-1',
          code: 'UWB-CS-2026-014',
          title: 'Adaptive Flood Early-Warning Telemetry Network',
          studentName: 'Kwame Boateng',
          department: 'Department of Computer Science',
          supervisorName: 'Dr. Samuel Osei',
          progress: 68,
        },
        {
          id: 'ip-2',
          code: 'UWB-CS-2026-029',
          title: 'Blockchain-Free Tamper-Evident Academic Transcript Ledger',
          studentName: 'Kofi Asante',
          department: 'Department of Computer Science',
          supervisorName: 'Unassigned',
          progress: 10,
        },
        {
          id: 'ip-3',
          code: 'UWB-EE-2026-011',
          title: 'Smart Microgrid Load Balancing Controller',
          studentName: 'Fatima Al-Mansoor',
          department: 'Department of Electrical & Electronic Engineering',
          supervisorName: 'Unassigned',
          progress: 15,
        },
      ],
      verifiedSupervisors: ['Dr. Samuel Osei', 'Dr. Clara Hughes', 'Prof. Isaac Boateng'],
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
      title: 'Revision requested on Chapter 3 v2',
      body: 'Dr. Samuel Osei requested updates to Section 3.4 and your ER diagram.',
      time: '2 hours ago',
      read: false,
      targetPath: '/student/documents',
    },
    {
      id: 'n-2',
      roleKey: 'student',
      title: 'Week 8 Journal Reviewed',
      body: 'Your supervisor left feedback on your Week 8 progress journal.',
      time: '1 day ago',
      read: true,
      targetPath: '/student/journals',
    },
    {
      id: 'n-3',
      roleKey: 'supervisor',
      title: 'New chapter uploaded for review',
      body: 'Liam Gallagher uploaded Chapter 5: Experimental Results & Bias Audit (v1).',
      time: '3 hours ago',
      read: false,
      targetPath: '/supervisor/reviews',
    },
    {
      id: 'n-4',
      roleKey: 'supervisor',
      title: '2 students flagged for attention',
      body: 'Amara Okafor and Zainab Bello have overdue deliverables.',
      time: '1 day ago',
      read: false,
      targetPath: '/supervisor/students',
    },
    {
      id: 'n-5',
      roleKey: 'institution_admin',
      title: 'Pending membership approvals',
      body: '3 new student and supervisor requests require institutional verification.',
      time: '5 hours ago',
      read: false,
      targetPath: '/institution/approvals',
    },
    {
      id: 'n-6',
      roleKey: 'platform_admin',
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
      institutionName: 'University of Westbridge',
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
      institutionName: 'Platform-Wide Governance',
      category: 'Governance',
      actor: 'Adaeze Nwosu',
      actorRole: 'Platform Admin',
      action: 'Rejected unverified application domain',
      detail: 'Blocked onboarding request from fast-degree-example.net.',
      timestamp: '2026-11-13 14:22',
      targetPath: '/platform/governance',
    },
    {
      id: 'af-3',
      roleScope: 'institution_admin',
      institutionName: 'University of Westbridge',
      category: 'Governance',
      actor: 'Nadia Mensah',
      actorRole: 'Applicant',
      action: 'Submitted student membership verification request',
      detail: 'Department of Computer Science · ID UWB-2026-0612.',
      timestamp: '2026-11-13 09:15',
      targetPath: '/institution/approvals',
    },
    {
      id: 'af-4',
      roleScope: 'student',
      institutionName: 'University of Westbridge',
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
      institutionName: 'University of Westbridge',
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
      institutionName: 'University of Westbridge',
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
    'University of Westbridge': {
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
          locationOrLink: 'Computer Science Block, Room 4.12',
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
          locationOrLink: 'https://meet.westbridge.edu/dr-osei-office-hours',
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
          locationOrLink: 'CS Lab B or Virtual Room',
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
          locationOrLink: 'Computer Science Block, Room 4.12',
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
          studentEmail: 'l.gallagher@westbridge.edu',
          supervisorName: 'Dr. Samuel Osei',
          meetingDate: '2026-11-19',
          dayOfWeek: 'Thursday',
          timeRange: '14:30 – 15:00',
          mode: 'Video Call',
          locationOrLink: 'https://meet.westbridge.edu/dr-osei-office-hours',
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

const DemoAppStateContext = createContext(null);

export function DemoAppStateProvider({ children }) {
  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return INITIAL_STATE;
      const parsed = JSON.parse(saved);
      return {
        ...INITIAL_STATE,
        ...parsed,
        officeHoursByInstitution:
          parsed.officeHoursByInstitution || INITIAL_STATE.officeHoursByInstitution,
        activityFeed: parsed.activityFeed || INITIAL_STATE.activityFeed,
      };
    } catch {
      return INITIAL_STATE;
    }
  });

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

  const pushNotification = (roleKey, title, body, targetPath) => {
    setState((prev) => ({
      ...prev,
      notifications: [
        {
          id: `n-${Date.now()}`,
          roleKey,
          title,
          body,
          time: 'Just now',
          read: false,
          targetPath,
        },
        ...prev.notifications,
      ],
    }));
  };

  const recordActivity = (entry) => {
    const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
    setState((prev) => ({
      ...prev,
      activityFeed: [
        {
          id: `af-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          timestamp: now,
          roleScope: 'all',
          ...entry,
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

  const markAllNotificationsRead = (roleKey) => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) =>
        n.roleKey === roleKey ? { ...n, read: true } : n
      ),
    }));
  };

  const updateUserProfile = (email, updates) => {
    setState((prev) => ({
      ...prev,
      userProfiles: {
        ...prev.userProfiles,
        [email]: {
          ...(prev.userProfiles[email] || {}),
          ...updates,
        },
      },
    }));
  };

  // Student project actions
  const addProjectTask = (institutionName, task) => {
    setState((prev) => {
      const proj = prev.projectsByInstitution[institutionName];
      if (!proj) return prev;
      return {
        ...prev,
        projectsByInstitution: {
          ...prev.projectsByInstitution,
          [institutionName]: {
            ...proj,
            tasks: [
              {
                id: `t-${Date.now()}`,
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
      const proj = prev.projectsByInstitution[institutionName];
      if (!proj) return prev;
      return {
        ...prev,
        projectsByInstitution: {
          ...prev.projectsByInstitution,
          [institutionName]: {
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
      const proj = prev.projectsByInstitution[institutionName];
      if (!proj) return prev;
      const target = proj.tasks.find((t) => t.id === taskId);
      if (target) movedTitle = target.title;
      return {
        ...prev,
        projectsByInstitution: {
          ...prev.projectsByInstitution,
          [institutionName]: {
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
      const proj = prev.projectsByInstitution[institutionName];
      if (!proj) return prev;
      return {
        ...prev,
        projectsByInstitution: {
          ...prev.projectsByInstitution,
          [institutionName]: {
            ...proj,
            tasks: proj.tasks.map((t) => (t.id === taskId ? { ...t, ...updates } : t)),
          },
        },
      };
    });
  };

  const deleteProjectTask = (institutionName, taskId) => {
    setState((prev) => {
      const proj = prev.projectsByInstitution[institutionName];
      if (!proj) return prev;
      return {
        ...prev,
        projectsByInstitution: {
          ...prev.projectsByInstitution,
          [institutionName]: {
            ...proj,
            tasks: proj.tasks.filter((t) => t.id !== taskId),
          },
        },
      };
    });
  };

  const addMilestone = (institutionName, milestone) => {
    setState((prev) => {
      const proj = prev.projectsByInstitution[institutionName];
      if (!proj) return prev;
      const nextPhase = proj.milestones.length + 1;
      return {
        ...prev,
        projectsByInstitution: {
          ...prev.projectsByInstitution,
          [institutionName]: {
            ...proj,
            milestones: [
              ...proj.milestones,
              {
                id: `ms-${Date.now()}`,
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
    { authorName, authorRole, comment, nextStatus }
  ) => {
    const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
    let msTitle = 'Project Milestone';
    setState((prev) => {
      const proj = prev.projectsByInstitution[institutionName];
      if (!proj) return prev;
      return {
        ...prev,
        projectsByInstitution: {
          ...prev.projectsByInstitution,
          [institutionName]: {
            ...proj,
            milestones: proj.milestones.map((m) => {
              if (m.id !== milestoneId) return m;
              msTitle = m.title;
              const resolvedStatus = nextStatus || m.status;
              const entry = {
                id: `mfb-${Date.now()}`,
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
      };
    });
    pushNotification(
      authorRole === 'supervisor' ? 'student' : 'supervisor',
      authorRole === 'supervisor'
        ? `Milestone feedback: ${msTitle}`
        : `Student updated milestone: ${msTitle}`,
      comment.slice(0, 95),
      authorRole === 'supervisor' ? '/student/milestones' : '/supervisor/milestones'
    );
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

  const updateMilestoneStatus = (institutionName, milestoneId, nextStatus) => {
    setState((prev) => {
      const proj = prev.projectsByInstitution[institutionName];
      if (!proj) return prev;
      return {
        ...prev,
        projectsByInstitution: {
          ...prev.projectsByInstitution,
          [institutionName]: {
            ...proj,
            milestones: proj.milestones.map((m) =>
              m.id === milestoneId ? { ...m, status: nextStatus } : m
            ),
          },
        },
      };
    });
    pushNotification(
      'student',
      `Milestone marked ${nextStatus}`,
      `Supervisor updated a project milestone status to ${nextStatus}.`,
      '/student/milestones'
    );
  };

  const updateMilestoneDueDate = (institutionName, milestoneId, dueDate) => {
    setState((prev) => {
      const proj = prev.projectsByInstitution[institutionName];
      if (!proj) return prev;
      return {
        ...prev,
        projectsByInstitution: {
          ...prev.projectsByInstitution,
          [institutionName]: {
            ...proj,
            milestones: proj.milestones.map((m) =>
              m.id === milestoneId ? { ...m, dueDate } : m
            ),
          },
        },
      };
    });
  };

  const addWeeklyJournal = (institutionName, entry) => {
    setState((prev) => {
      const proj = prev.projectsByInstitution[institutionName];
      if (!proj) return prev;
      const nextWeek = (proj.journals[0]?.weekNumber || 0) + 1;
      return {
        ...prev,
        projectsByInstitution: {
          ...prev.projectsByInstitution,
          [institutionName]: {
            ...proj,
            journals: [
              {
                id: `j-${Date.now()}`,
                weekNumber: nextWeek,
                date: new Date().toISOString().slice(0, 10),
                supervisorFeedback: '',
                reviewedAt: '',
                ...entry,
              },
              ...proj.journals,
            ],
          },
        },
      };
    });
    pushNotification(
      'supervisor',
      'New weekly journal submitted',
      `Student logged a new weekly progress journal for ${institutionName}.`,
      '/supervisor/journals'
    );
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

  const submitDocumentChapter = (institutionName, submission) => {
    setState((prev) => {
      const proj = prev.projectsByInstitution[institutionName];
      if (!proj) return prev;
      return {
        ...prev,
        projectsByInstitution: {
          ...prev.projectsByInstitution,
          [institutionName]: {
            ...proj,
            submissions: [
              {
                id: `sub-${Date.now()}`,
                documentGroupId:
                  submission.documentGroupId || `doc-${Date.now()}`,
                submittedAt: new Date().toISOString().slice(0, 10),
                status: 'Pending Review',
                supervisorFeedback: '',
                studentResponse: '',
                ...submission,
              },
              ...proj.submissions,
            ],
          },
        },
      };
    });
    pushNotification(
      'supervisor',
      'New chapter version awaiting review',
      `${submission.title} (${submission.version}) was submitted for review.`,
      '/supervisor/reviews'
    );
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

  const respondToRevision = (institutionName, submissionId, responseText) => {
    setState((prev) => {
      const proj = prev.projectsByInstitution[institutionName];
      if (!proj) return prev;
      return {
        ...prev,
        projectsByInstitution: {
          ...prev.projectsByInstitution,
          [institutionName]: {
            ...proj,
            submissions: proj.submissions.map((sub) =>
              sub.id === submissionId
                ? { ...sub, studentResponse: responseText, status: 'Pending Review' }
                : sub
            ),
          },
        },
      };
    });
    pushNotification(
      'supervisor',
      'Student responded to revision request',
      'A student posted a revision response and requested re-review.',
      '/supervisor/reviews'
    );
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

  const sendProjectMessage = (institutionName, senderRole, senderName, body) => {
    const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
    setState((prev) => {
      const proj = prev.projectsByInstitution[institutionName];
      if (!proj) return prev;
      return {
        ...prev,
        projectsByInstitution: {
          ...prev.projectsByInstitution,
          [institutionName]: {
            ...proj,
            messages: [
              ...proj.messages,
              { id: `msg-${Date.now()}`, senderRole, senderName, sentAt: now, body },
            ],
          },
        },
      };
    });
    pushNotification(
      senderRole === 'student' ? 'supervisor' : 'student',
      `New message from ${senderName}`,
      body.slice(0, 90),
      senderRole === 'student' ? '/supervisor/reports' : '/student/messages'
    );
    recordActivity({
      roleScope: 'all',
      institutionName,
      category: 'Messages',
      actor: senderName,
      actorRole: senderRole === 'student' ? 'Student' : 'Supervisor',
      action: `Posted project thread message`,
      detail: body.slice(0, 100),
      targetPath: senderRole === 'student' ? '/student/messages' : '/supervisor/reports',
    });
  };

  // Supervisor actions
  const reviewSubmission = (institutionName, submissionId, decision, feedback, isExtra = false) => {
    setState((prev) => {
      if (isExtra) {
        return {
          ...prev,
          supervisorExtraSubmissions: prev.supervisorExtraSubmissions.map((s) =>
            s.id === submissionId ? { ...s, status: decision, supervisorFeedback: feedback } : s
          ),
        };
      }
      const proj = prev.projectsByInstitution[institutionName];
      if (!proj) return prev;
      const targetSub = proj.submissions.find((s) => s.id === submissionId);
      return {
        ...prev,
        projectsByInstitution: {
          ...prev.projectsByInstitution,
          [institutionName]: {
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
      };
    });
    pushNotification(
      'student',
      `Submission ${decision}`,
      feedback || `Your supervisor marked a submission as ${decision}.`,
      '/student/documents'
    );
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

  const addJournalFeedback = (institutionName, journalId, feedback) => {
    const today = new Date().toISOString().slice(0, 10);
    setState((prev) => {
      const proj = prev.projectsByInstitution[institutionName];
      if (!proj) return prev;
      return {
        ...prev,
        projectsByInstitution: {
          ...prev.projectsByInstitution,
          [institutionName]: {
            ...proj,
            journals: proj.journals.map((j) =>
              j.id === journalId ? { ...j, supervisorFeedback: feedback, reviewedAt: today } : j
            ),
          },
        },
      };
    });
    pushNotification(
      'student',
      'Supervisor reviewed your weekly journal',
      feedback.slice(0, 90),
      '/student/journals'
    );
  };

  // Institution Admin actions
  const updateInstitutionInfo = (institutionName, updates) => {
    setState((prev) => {
      const inst = prev.institutionsState[institutionName];
      if (!inst) return prev;
      return {
        ...prev,
        institutionsState: {
          ...prev.institutionsState,
          [institutionName]: {
            ...inst,
            info: { ...inst.info, ...updates },
          },
        },
      };
    });
  };

  const addInstitutionDepartment = (institutionName, deptName, initialProgramme) => {
    setState((prev) => {
      const inst = prev.institutionsState[institutionName];
      if (!inst) return prev;
      return {
        ...prev,
        institutionsState: {
          ...prev.institutionsState,
          [institutionName]: {
            ...inst,
            departments: [
              ...inst.departments,
              {
                id: `dept-${Date.now()}`,
                name: deptName,
                programmes: initialProgramme ? [initialProgramme] : [],
                students: 0,
                supervisors: 0,
              },
            ],
          },
        },
      };
    });
  };

  const addAcademicSession = (institutionName, sessionName) => {
    setState((prev) => {
      const inst = prev.institutionsState[institutionName];
      if (!inst) return prev;
      return {
        ...prev,
        institutionsState: {
          ...prev.institutionsState,
          [institutionName]: {
            ...inst,
            sessions: [
              { id: `ses-${Date.now()}`, name: sessionName, active: true },
              ...inst.sessions.map((s) => ({ ...s, active: false })),
            ],
          },
        },
      };
    });
  };

  const decideMembershipRequest = (institutionName, requestId, decision) => {
    setState((prev) => {
      const inst = prev.institutionsState[institutionName];
      if (!inst) return prev;
      return {
        ...prev,
        institutionsState: {
          ...prev.institutionsState,
          [institutionName]: {
            ...inst,
            membershipRequests: inst.membershipRequests.map((r) =>
              r.id === requestId ? { ...r, status: decision } : r
            ),
          },
        },
      };
    });
    recordActivity({
      roleScope: 'institution_admin',
      institutionName,
      category: 'Governance',
      actor: 'Institution Admin',
      actorRole: 'Institution Admin',
      action: `Marked membership request as ${decision}`,
      detail: `Scoped to ${institutionName}.`,
      targetPath: '/institution/approvals',
    });
  };

  const createSupervisorInvite = (institutionName, email, department) => {
    const code = `SPT-${Math.floor(1000 + Math.random() * 9000)}`;
    setState((prev) => {
      const inst = prev.institutionsState[institutionName];
      if (!inst) return prev;
      return {
        ...prev,
        institutionsState: {
          ...prev.institutionsState,
          [institutionName]: {
            ...inst,
            invitations: [
              {
                id: `inv-${Date.now()}`,
                email,
                department,
                code,
                status: 'Pending Acceptance',
                createdAt: new Date().toISOString().slice(0, 10),
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
      const inst = prev.institutionsState[institutionName];
      if (!inst) return prev;
      return {
        ...prev,
        institutionsState: {
          ...prev.institutionsState,
          [institutionName]: {
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
      const inst = prev.institutionsState[institutionName];
      if (!inst) return prev;
      const code =
        project.code?.trim() ||
        `${inst.info.shortCode || 'PRJ'}-2026-${String(inst.projects.length + 101)}`;
      return {
        ...prev,
        institutionsState: {
          ...prev.institutionsState,
          [institutionName]: {
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
            addedAt: new Date().toISOString().slice(0, 10),
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
  const addOfficeHourSlot = (institutionName, slot) => {
    setState((prev) => {
      const current = prev.officeHoursByInstitution?.[institutionName] || {
        availabilitySlots: [],
        bookings: [],
      };
      return {
        ...prev,
        officeHoursByInstitution: {
          ...prev.officeHoursByInstitution,
          [institutionName]: {
            ...current,
            availabilitySlots: [
              {
                id: `oh-${Date.now()}`,
                active: true,
                slotMinutes: 30,
                ...slot,
              },
              ...current.availabilitySlots,
            ],
          },
        },
      };
    });
    pushNotification(
      'student',
      'New supervisor office hour slot published',
      `${slot.supervisorName} added ${slot.dayOfWeek} (${slot.startTime}–${slot.endTime}).`,
      '/student/office-hours'
    );
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
      const current = prev.officeHoursByInstitution?.[institutionName];
      if (!current) return prev;
      return {
        ...prev,
        officeHoursByInstitution: {
          ...prev.officeHoursByInstitution,
          [institutionName]: {
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
      const current = prev.officeHoursByInstitution?.[institutionName];
      if (!current) return prev;
      return {
        ...prev,
        officeHoursByInstitution: {
          ...prev.officeHoursByInstitution,
          [institutionName]: {
            ...current,
            availabilitySlots: current.availabilitySlots.filter((s) => s.id !== slotId),
          },
        },
      };
    });
  };

  const bookOfficeHourSlot = (institutionName, booking) => {
    setState((prev) => {
      const current = prev.officeHoursByInstitution?.[institutionName] || {
        availabilitySlots: [],
        bookings: [],
      };
      return {
        ...prev,
        officeHoursByInstitution: {
          ...prev.officeHoursByInstitution,
          [institutionName]: {
            ...current,
            bookings: [
              {
                id: `bk-${Date.now()}`,
                status: 'Pending',
                supervisorNote: '',
                createdAt: new Date().toISOString().slice(0, 10),
                ...booking,
              },
              ...current.bookings,
            ],
          },
        },
      };
    });
    pushNotification(
      'supervisor',
      'New office hour booking request',
      `${booking.studentName} requested ${booking.meetingDate} (${booking.timeRange}): ${booking.topic}`,
      '/supervisor/office-hours'
    );
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

  const updateOfficeHourBooking = (institutionName, bookingId, status, supervisorNote = '') => {
    let targetStudent = 'Student';
    let targetDate = '';
    setState((prev) => {
      const current = prev.officeHoursByInstitution?.[institutionName];
      if (!current) return prev;
      return {
        ...prev,
        officeHoursByInstitution: {
          ...prev.officeHoursByInstitution,
          [institutionName]: {
            ...current,
            bookings: current.bookings.map((b) => {
              if (b.id !== bookingId) return b;
              targetStudent = b.studentName;
              targetDate = b.meetingDate;
              return {
                ...b,
                status,
                supervisorNote: supervisorNote || b.supervisorNote,
              };
            }),
          },
        },
      };
    });
    pushNotification(
      'student',
      `Office hour booking ${status}`,
      `${targetDate ? `${targetDate}: ` : ''}${supervisorNote || `Your appointment status is now ${status}.`}`,
      '/student/office-hours'
    );
    recordActivity({
      roleScope: 'all',
      institutionName,
      category: 'Governance',
      actor: 'Supervisor',
      actorRole: 'Supervisor',
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
