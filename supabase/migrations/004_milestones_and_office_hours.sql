-- Stage 4 Extension: Project Milestones Feedback & Supervisor Office Hours Scheduling
-- Run after 001_initial_schema.sql and 002_rls_policies.sql

-- 1. Enrich milestones for phase ordering, deliverable descriptions, weighting, and Pending Review workflow
alter table public.milestones
  add column if not exists description text not null default '',
  add column if not exists weight_percent int not null default 20,
  add column if not exists phase_number int not null default 1;

alter table public.milestones
  drop constraint if exists milestones_status_check;

alter table public.milestones
  add constraint milestones_status_check
  check (status in ('In Progress', 'Pending Review', 'Revision Requested', 'Approved'));

-- 2. Milestone Feedback & Student Reply Thread
create table if not exists public.milestone_feedback (
  id uuid primary key default gen_random_uuid(),
  milestone_id uuid not null references public.milestones(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  institution_id uuid not null references public.institutions(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  author_name text not null,
  author_role text not null check (author_role in ('student', 'supervisor')),
  status_snapshot text not null default 'In Progress',
  comment text not null,
  created_at timestamptz not null default now()
);

alter table public.milestone_feedback enable row level security;

create policy "Project participants access milestone feedback"
  on public.milestone_feedback for all
  using (
    exists (
      select 1 from public.projects p
      where p.id = milestone_feedback.project_id
        and (
          p.student_id = auth.uid()
          or p.supervisor_id = auth.uid()
          or public.has_institution_role(p.institution_id, 'institution_admin')
        )
    )
  )
  with check (
    author_id = auth.uid()
    and exists (
      select 1 from public.projects p
      where p.id = milestone_feedback.project_id
        and (p.student_id = auth.uid() or p.supervisor_id = auth.uid())
    )
  );

-- 3. Supervisor Weekly Office Hours Availability Slots
create table if not exists public.supervisor_office_hours (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id) on delete cascade,
  supervisor_id uuid not null references auth.users(id) on delete cascade,
  supervisor_name text not null,
  day_of_week text not null check (day_of_week in ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday')),
  start_time time not null,
  end_time time not null,
  slot_minutes int not null default 30,
  mode text not null default 'In-Person' check (mode in ('In-Person', 'Video Call', 'Hybrid')),
  location_or_link text not null default '',
  notes text not null default '',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.supervisor_office_hours enable row level security;

create policy "Institution participants view active office hours"
  on public.supervisor_office_hours for select
  using (
    supervisor_id = auth.uid()
    or public.has_institution_role(institution_id, 'student')
    or public.has_institution_role(institution_id, 'institution_admin')
  );

create policy "Supervisors manage own office hours"
  on public.supervisor_office_hours for all
  using (
    supervisor_id = auth.uid()
    and public.has_institution_role(institution_id, 'supervisor')
  )
  with check (
    supervisor_id = auth.uid()
    and public.has_institution_role(institution_id, 'supervisor')
  );

-- 4. Student Office Hour Bookings
create table if not exists public.office_hour_bookings (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  slot_id uuid not null references public.supervisor_office_hours(id) on delete cascade,
  milestone_id uuid references public.milestones(id) on delete set null,
  student_id uuid not null references auth.users(id) on delete cascade,
  supervisor_id uuid not null references auth.users(id) on delete cascade,
  meeting_date date not null,
  topic text not null,
  status text not null default 'Pending' check (status in ('Pending', 'Confirmed', 'Completed', 'Cancelled')),
  supervisor_note text not null default '',
  created_at timestamptz not null default now()
);

alter table public.office_hour_bookings enable row level security;

create policy "Booking participants read bookings"
  on public.office_hour_bookings for select
  using (
    student_id = auth.uid()
    or supervisor_id = auth.uid()
    or public.has_institution_role(institution_id, 'institution_admin')
  );

create policy "Students book office hours"
  on public.office_hour_bookings for insert
  with check (
    student_id = auth.uid()
    and public.has_institution_role(institution_id, 'student')
  );

create policy "Participants update office hour bookings"
  on public.office_hour_bookings for update
  using (student_id = auth.uid() or supervisor_id = auth.uid());
