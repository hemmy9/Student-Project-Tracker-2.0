-- Stage 4 Optional Seed Data (Run AFTER 001_initial_schema.sql, 002_rls_policies.sql, 003_storage_buckets.sql)
-- Inserts initial approved institutions, departments, and active academic sessions.

insert into public.institutions (name, short_code, domain, country, contact_email, applicant_name, status)
values
  ('University of Westbridge', 'UWB', 'westbridge.edu', 'United Kingdom', 'projects-office@westbridge.edu', 'Dr. Evelyn Mensah', 'approved'),
  ('Northfield Institute of Technology', 'NIT', 'northfieldtech.edu', 'Canada', 'registry@northfieldtech.edu', 'Dean Arthur Chen', 'approved'),
  ('St. Jude University of Applied Sciences', 'SJUAS', 'stjude-uas.ac', 'Ghana', 'registry@stjude-uas.ac', 'Dr. Daniel Kwarteng', 'approved')
on conflict (domain) do nothing;

insert into public.departments (institution_id, name, programmes)
select id, 'Department of Computer Science', '["B.Sc. Software Engineering", "B.Sc. Computer Science", "M.Sc. Artificial Intelligence"]'::jsonb
from public.institutions where domain = 'westbridge.edu'
and not exists (
  select 1 from public.departments d where d.institution_id = public.institutions.id and d.name = 'Department of Computer Science'
);

insert into public.academic_sessions (institution_id, name, is_active)
select id, '2025/2026 Academic Session', true
from public.institutions where domain = 'westbridge.edu'
and not exists (
  select 1 from public.academic_sessions s where s.institution_id = public.institutions.id and s.name = '2025/2026 Academic Session'
);
