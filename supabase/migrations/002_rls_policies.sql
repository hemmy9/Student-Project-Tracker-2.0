-- Stage 4: Strict Multi-Tenant Row-Level Security (RLS) Policies

alter table public.platform_admins enable row level security;
alter table public.institutions enable row level security;
alter table public.profiles enable row level security;
alter table public.institution_memberships enable row level security;
alter table public.departments enable row level security;
alter table public.academic_sessions enable row level security;
alter table public.supervisor_invitations enable row level security;
alter table public.projects enable row level security;
alter table public.milestones enable row level security;
alter table public.tasks enable row level security;
alter table public.weekly_journals enable row level security;
alter table public.document_submissions enable row level security;
alter table public.project_messages enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_logs enable row level security;

-- Helper functions
create or replace function public.is_platform_admin()
returns boolean
language sql
stable
security definer
as $$
  select exists (
    select 1 from public.platform_admins
    where user_id = auth.uid() and status = 'active'
  );
$$;

create or replace function public.has_institution_role(inst_id uuid, required_role text)
returns boolean
language sql
stable
security definer
as $$
  select exists (
    select 1 from public.institution_memberships
    where user_id = auth.uid()
      and institution_id = inst_id
      and role_key = required_role
      and status = 'approved'
  );
$$;

-- Institutions: Public can view approved directory & submit registration applications
create policy "Public read approved institutions"
  on public.institutions for select
  using (status = 'approved' or public.is_platform_admin());

create policy "Anyone can submit institution application as pending"
  on public.institutions for insert
  with check (status = 'pending_review');

create policy "Platform admins manage institutions"
  on public.institutions for update
  using (public.is_platform_admin());

-- Profiles: Users read/update own profile
create policy "Users manage own profile"
  on public.profiles for all
  using (id = auth.uid())
  with check (id = auth.uid());

-- Memberships: Users read own; Institution Admins approve/reject within their institution only;
-- Self-registration is restricted to pending student/supervisor requests (never institution_admin).
create policy "Users and inst admins read memberships"
  on public.institution_memberships for select
  using (
    user_id = auth.uid()
    or public.has_institution_role(institution_id, 'institution_admin')
  );

create policy "Users request pending student or supervisor membership"
  on public.institution_memberships for insert
  with check (
    user_id = auth.uid()
    and status = 'pending'
    and role_key in ('student', 'supervisor')
  );

create policy "Institution admins manage tenant memberships"
  on public.institution_memberships for update
  using (public.has_institution_role(institution_id, 'institution_admin'));

-- Projects: Strictly scoped to tenant; students see own project, supervisors see assigned, inst admins manage all in tenant
create policy "Scoped project visibility"
  on public.projects for select
  using (
    student_id = auth.uid()
    or supervisor_id = auth.uid()
    or public.has_institution_role(institution_id, 'institution_admin')
  );

create policy "Institution admins create and assign projects"
  on public.projects for all
  using (public.has_institution_role(institution_id, 'institution_admin'))
  with check (public.has_institution_role(institution_id, 'institution_admin'));

-- Milestones & Tasks: Accessible to project student, assigned supervisor, and same-tenant institution admin
create policy "Project participants manage tasks"
  on public.tasks for all
  using (
    exists (
      select 1 from public.projects p
      where p.id = tasks.project_id
        and (
          p.student_id = auth.uid()
          or p.supervisor_id = auth.uid()
          or public.has_institution_role(p.institution_id, 'institution_admin')
        )
    )
  );

create policy "Project participants manage milestones"
  on public.milestones for all
  using (
    exists (
      select 1 from public.projects p
      where p.id = milestones.project_id
        and (
          p.student_id = auth.uid()
          or p.supervisor_id = auth.uid()
          or public.has_institution_role(p.institution_id, 'institution_admin')
        )
    )
  );

-- Journals, Submissions & Messages: Scoped strictly to project student + supervisor (+ inst admin read)
create policy "Project participants access journals"
  on public.weekly_journals for all
  using (
    exists (
      select 1 from public.projects p
      where p.id = weekly_journals.project_id
        and (p.student_id = auth.uid() or p.supervisor_id = auth.uid())
    )
  );

create policy "Project participants access submissions"
  on public.document_submissions for all
  using (
    exists (
      select 1 from public.projects p
      where p.id = document_submissions.project_id
        and (p.student_id = auth.uid() or p.supervisor_id = auth.uid())
    )
  );

create policy "Project participants access messages"
  on public.project_messages for all
  using (
    exists (
      select 1 from public.projects p
      where p.id = project_messages.project_id
        and (p.student_id = auth.uid() or p.supervisor_id = auth.uid())
    )
  );

-- Notifications & Audit Logs
create policy "Users manage own notifications"
  on public.notifications for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Platform admins read audit logs"
  on public.audit_logs for select
  using (public.is_platform_admin());
