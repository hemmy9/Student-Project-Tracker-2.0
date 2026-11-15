-- Stage 4: Private Storage Bucket & Scoped Access Policies for Chapter Submissions

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'project-submissions',
  'project-submissions',
  false,
  26214400,
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
on conflict (id) do nothing;

-- Folder convention: <institution_id>/<project_id>/<timestamp>_<filename>
create policy "Project student and supervisor read private submissions"
  on storage.objects for select
  using (
    bucket_id = 'project-submissions'
    and exists (
      select 1 from public.projects p
      where p.id::text = (storage.foldername(name))[2]
        and p.institution_id::text = (storage.foldername(name))[1]
        and (
          p.student_id = auth.uid()
          or p.supervisor_id = auth.uid()
          or public.has_institution_role(p.institution_id, 'institution_admin')
        )
    )
  );

create policy "Project student uploads chapter drafts"
  on storage.objects for insert
  with check (
    bucket_id = 'project-submissions'
    and exists (
      select 1 from public.projects p
      where p.id::text = (storage.foldername(name))[2]
        and p.institution_id::text = (storage.foldername(name))[1]
        and p.student_id = auth.uid()
    )
  );
