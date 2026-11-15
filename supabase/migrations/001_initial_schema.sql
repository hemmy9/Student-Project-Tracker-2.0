-- Stage 4: Multi-Tenant Student Project Tracker PostgreSQL Schema
-- Run in Supabase SQL Editor or via `supabase db push`

create extension if not exists "pgcrypto";

-- 1. Platform Administrators (strictly isolated from institutional memberships)
create table if not exists public.platform_admins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text not null,
  status text not null default 'active' check (status in ('active', 'revoked')),
  granted_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

-- 2. Institutions (Tenants)
create table if not exists public.institutions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  short_code text not null,
  domain text not null unique,
  country text not null,
  contact_email text not null,
  applicant_name text not null,
  status text not null default 'pending_review'
    check (status in ('pending_review', 'approved', 'suspended', 'rejected')),
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

-- 3. Profiles (1-to-1 with auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text default '',
  bio text default '',
  updated_at timestamptz not null default now()
);

-- 4. Multi-Institution Role Memberships (Users can hold multiple roles across institutions)
create table if not exists public.institution_memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  institution_id uuid not null references public.institutions(id) on delete cascade,
  role_key text not null check (role_key in ('student', 'supervisor', 'institution_admin')),
  department text default '',
  academic_identifier text default '',
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  approved_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  unique (user_id, institution_id, role_key)
);

-- 5. Departments, Programmes & Academic Sessions
create table if not exists public.departments (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id) on delete cascade,
  name text not null,
  programmes jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.academic_sessions (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id) on delete cascade,
  name text not null,
  is_active boolean not null default false,
  created_at timestamptz not null default now()
);

-- 6. Supervisor Invitation Codes
create table if not exists public.supervisor_invitations (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id) on delete cascade,
  email text not null,
  department text not null,
  invite_code text not null unique,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'revoked')),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

-- 7. Academic Projects
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id) on delete cascade,
  code text not null,
  title text not null,
  department text not null,
  programme text default '',
  academic_session text default '',
  student_id uuid references auth.users(id),
  supervisor_id uuid references auth.users(id),
  next_deadline date,
  created_at timestamptz not null default now(),
  unique (institution_id, code)
);

-- 8. Project Milestones
create table if not exists public.milestones (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  institution_id uuid not null references public.institutions(id) on delete cascade,
  title text not null,
  due_date date not null,
  status text not null default 'In Progress'
    check (status in ('In Progress', 'Revision Requested', 'Approved')),
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- 9. Tasks
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  institution_id uuid not null references public.institutions(id) on delete cascade,
  milestone_id uuid references public.milestones(id) on delete set null,
  title text not null,
  priority text not null default 'Medium' check (priority in ('High', 'Medium', 'Low')),
  due_date date not null,
  completed boolean not null default false,
  created_at timestamptz not null default now()
);

-- 10. Weekly Progress Journals
create table if not exists public.weekly_journals (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  institution_id uuid not null references public.institutions(id) on delete cascade,
  author_id uuid not null references auth.users(id),
  week_number int not null,
  entry_date date not null default current_date,
  summary text not null,
  blockers text default '',
  next_steps text default '',
  supervisor_feedback text default '',
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

-- 11. Document & Chapter Submissions (Immutable Submission History)
create table if not exists public.document_submissions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  institution_id uuid not null references public.institutions(id) on delete cascade,
  milestone_id uuid references public.milestones(id) on delete set null,
  uploaded_by uuid not null references auth.users(id),
  title text not null,
  version text not null default 'v1',
  file_name text not null,
  file_size text not null,
  storage_path text not null,
  student_note text default '',
  supervisor_feedback text default '',
  student_response text default '',
  status text not null default 'Pending Review'
    check (status in ('Pending Review', 'Revision Requested', 'Approved')),
  created_at timestamptz not null default now()
);

-- 12. Direct Project Messages
create table if not exists public.project_messages (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  institution_id uuid not null references public.institutions(id) on delete cascade,
  sender_id uuid not null references auth.users(id),
  sender_role text not null check (sender_role in ('student', 'supervisor')),
  body text not null,
  created_at timestamptz not null default now()
);

-- 13. Notifications & Audit Logs
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  institution_id uuid references public.institutions(id) on delete cascade,
  role_key text not null,
  title text not null,
  body text not null,
  target_path text not null default '/',
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id),
  actor_name text not null,
  action text not null,
  target text not null,
  created_at timestamptz not null default now()
);
