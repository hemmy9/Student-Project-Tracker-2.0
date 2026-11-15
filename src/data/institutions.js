// Stage 1 frontend preview dataset of approved institutions.
// Replaced by live Supabase PostgreSQL queries in Stage 4.

export const DEMO_INSTITUTIONS = [
  {
    id: 'inst-westbridge',
    name: 'University of Westbridge',
    shortCode: 'UWB',
    domain: 'westbridge.edu',
    location: 'United Kingdom',
    departments: [
      {
        id: 'dept-cs',
        name: 'Department of Computer Science',
        programmes: [
          'B.Sc. Software Engineering',
          'B.Sc. Computer Science',
          'M.Sc. Artificial Intelligence & Data Systems',
        ],
      },
      {
        id: 'dept-ee',
        name: 'Department of Electrical & Electronic Engineering',
        programmes: [
          'B.Eng. Embedded Systems',
          'M.Eng. Power & Renewable Systems',
        ],
      },
      {
        id: 'dept-info',
        name: 'School of Information Systems',
        programmes: [
          'B.Sc. Information Technology',
          'M.Sc. Cybersecurity Governance',
        ],
      },
    ],
  },
  {
    id: 'inst-northfield',
    name: 'Northfield Institute of Technology',
    shortCode: 'NIT',
    domain: 'northfieldtech.edu',
    location: 'Canada',
    departments: [
      {
        id: 'dept-se',
        name: 'Faculty of Computing & Software Systems',
        programmes: [
          'B.Tech. Cloud & Distributed Computing',
          'B.Sc. Human-Computer Interaction',
        ],
      },
      {
        id: 'dept-mech',
        name: 'Department of Mechanical & Mechatronic Engineering',
        programmes: [
          'B.Eng. Robotics & Automation',
          'M.Sc. Sustainable Manufacturing',
        ],
      },
    ],
  },
  {
    id: 'inst-stjude',
    name: 'St. Jude University of Applied Sciences',
    shortCode: 'SJUAS',
    domain: 'stjude-uas.ac',
    location: 'Ghana',
    departments: [
      {
        id: 'dept-cis',
        name: 'Department of Computer & Information Studies',
        programmes: [
          'B.Sc. Information Technology',
          'B.Sc. Computer Science',
          'B.Sc. Management Information Systems',
        ],
      },
      {
        id: 'dept-bus',
        name: 'School of Business & Project Analytics',
        programmes: [
          'B.B.A. Operations & Project Management',
          'M.B.A. Technology Management',
        ],
      },
    ],
  },
];

export const INSTITUTION_TYPES = [
  'Public University',
  'Private University',
  'Polytechnic / Technical Institute',
  'Research College / Graduate School',
];

export const ACADEMIC_LEVELS = [
  'Undergraduate — Year 3 (Junior)',
  'Undergraduate — Final Year (Capstone / Thesis)',
  'Postgraduate Diploma',
  'Master’s Degree (M.Sc. / M.Eng. / M.A.)',
  'Doctoral Candidate (Ph.D.)',
];

export const SUPERVISOR_TITLES = [
  'Professor',
  'Associate Professor',
  'Senior Lecturer',
  'Lecturer',
  'Research Fellow',
  'Adjunct Supervisor',
];

export const SAMPLE_INVITE_CODES = ['SPT-UWB-2026', 'SPT-NIT-4810', 'SPT-SJU-9042'];
