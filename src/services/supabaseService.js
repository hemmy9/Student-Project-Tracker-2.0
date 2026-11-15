import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';
import { normalizeAppError } from '../utils/errorHandler';

function requireSupabase() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error(
      'Supabase environment variables (VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY) are not configured yet.'
    );
  }
  return supabase;
}

export async function signInWithSupabasePassword(email, password) {
  const client = requireSupabase();
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw new Error(normalizeAppError(error, 'Unable to sign in with Supabase Auth.'));
  return data;
}

export async function signUpWithSupabasePassword({
  email,
  password,
  fullName,
  roleKey = 'student',
  metadata = {},
}) {
  const client = requireSupabase();
  const redirectTo =
    typeof window !== 'undefined' ? `${window.location.origin}/login` : undefined;
  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: redirectTo,
      data: {
        full_name: fullName,
        requested_role: roleKey,
        ...metadata,
      },
    },
  });
  if (error) throw new Error(normalizeAppError(error, 'Unable to register account in Supabase Auth.'));
  return data;
}

export async function resetSupabasePassword(email) {
  const client = requireSupabase();
  const redirectTo =
    typeof window !== 'undefined' ? `${window.location.origin}/login` : undefined;
  const { error } = await client.auth.resetPasswordForEmail(email, {
    redirectTo,
  });
  if (error) throw new Error(normalizeAppError(error, 'Failed to send password reset email.'));
  return true;
}

export async function updateSupabasePassword(newPassword) {
  const client = requireSupabase();
  const { data, error } = await client.auth.updateUser({ password: newPassword });
  if (error) throw new Error(normalizeAppError(error, 'Unable to update password.'));
  return data;
}

export async function signOutSupabase() {
  if (!isSupabaseConfigured || !supabase) return;
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(normalizeAppError(error, 'Unable to sign out cleanly.'));
}

export async function submitMembershipRequestRemote({
  userId,
  institutionId = null,
  roleKey = 'student',
  department = '',
  academicIdentifier = '',
  metadata = {},
}) {
  const client = requireSupabase();
  const { data, error } = await client
    .from('institution_memberships')
    .insert({
      user_id: userId,
      institution_id: institutionId,
      role_key: roleKey,
      status: 'pending_approval',
      department,
      academic_identifier: academicIdentifier,
      metadata,
    })
    .select()
    .single();
  if (error) throw new Error(normalizeAppError(error, 'Could not submit membership request.'));
  return data;
}

export async function fetchUserMemberships(userId) {
  const client = requireSupabase();
  const { data: memberships, error: memError } = await client
    .from('institution_memberships')
    .select(
      `
      id,
      role_key,
      status,
      department,
      academic_identifier,
      institution_id,
      institutions ( id, name, short_code, domain )
    `
    )
    .eq('user_id', userId);

  if (memError) throw new Error(normalizeAppError(memError, 'Unable to fetch institutional memberships.'));

  const { data: platformAdminRow } = await client
    .from('platform_admins')
    .select('id, status')
    .eq('user_id', userId)
    .eq('status', 'active')
    .maybeSingle();

  const roleLabels = {
    student: 'Student',
    supervisor: 'Supervisor',
    institution_admin: 'Institution Admin',
    platform_admin: 'Platform Admin',
  };

  const formatted = (memberships || []).map((m) => ({
    id: m.id,
    roleKey: m.role_key,
    roleLabel: roleLabels[m.role_key] || m.role_key,
    institutionId: m.institution_id,
    institutionName: m.institutions?.name || 'Registered Institution',
    status: m.status || 'pending_approval',
  }));

  if (platformAdminRow) {
    formatted.push({
      id: `pa-${platformAdminRow.id}`,
      roleKey: 'platform_admin',
      roleLabel: 'Platform Admin',
      institutionId: null,
      institutionName: 'Platform-Wide Governance',
      status: 'approved',
    });
  }

  // Prefer approved memberships first so activeMembership selects an authorized workspace automatically
  formatted.sort((a, b) => {
    const aApp = String(a.status).toLowerCase() === 'approved' ? 0 : 1;
    const bApp = String(b.status).toLowerCase() === 'approved' ? 0 : 1;
    return aApp - bApp;
  });

  return formatted;
}

export async function submitInstitutionApplicationRemote(payload) {
  const client = requireSupabase();
  const { data, error } = await client
    .from('institutions')
    .insert({
      name: payload.institutionName,
      short_code: payload.shortCode,
      domain: payload.domain,
      country: payload.country,
      contact_email: payload.contactEmail,
      applicant_name: payload.applicantName,
      status: 'pending_review',
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function createProjectTaskRemote(projectId, institutionId, task) {
  const client = requireSupabase();
  const { data, error } = await client
    .from('tasks')
    .insert({
      project_id: projectId,
      institution_id: institutionId,
      milestone_id: task.milestoneId || null,
      title: task.title,
      priority: task.priority || 'Medium',
      due_date: task.dueDate,
      completed: false,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function toggleProjectTaskRemote(taskId, completed) {
  const client = requireSupabase();
  const { data, error } = await client
    .from('tasks')
    .update({ completed })
    .eq('id', taskId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function uploadChapterDocumentRemote({
  institutionId,
  projectId,
  milestoneId,
  title,
  version,
  studentNote,
  file,
  uploadedBy,
}) {
  const client = requireSupabase();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storagePath = `${institutionId}/${projectId}/${Date.now()}_${safeName}`;

  const { error: uploadError } = await client.storage
    .from('project-submissions')
    .upload(storagePath, file, { upsert: false });

  if (uploadError) throw uploadError;

  const sizeMb = `${Math.max(0.1, file.size / (1024 * 1024)).toFixed(1)} MB`;
  const { data, error: insertError } = await client
    .from('document_submissions')
    .insert({
      project_id: projectId,
      institution_id: institutionId,
      milestone_id: milestoneId,
      uploaded_by: uploadedBy,
      title,
      version,
      file_name: file.name,
      file_size: sizeMb,
      storage_path: storagePath,
      student_note: studentNote,
      status: 'Pending Review',
    })
    .select()
    .single();

  if (insertError) throw insertError;
  return data;
}

export async function getSignedDocumentUrl(storagePath) {
  const client = requireSupabase();
  const { data, error } = await client.storage
    .from('project-submissions')
    .createSignedUrl(storagePath, 300);
  if (error) throw error;
  return data.signedUrl;
}

export function subscribeToProjectMessages(projectId, onMessage) {
  if (!isSupabaseConfigured || !supabase) return () => {};
  const channel = supabase
    .channel(`project-messages-${projectId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'project_messages',
        filter: `project_id=eq.${projectId}`,
      },
      (payload) => onMessage(payload.new)
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export async function createMilestoneRemote(projectId, institutionId, milestone) {
  const client = requireSupabase();
  const { data, error } = await client
    .from('milestones')
    .insert({
      project_id: projectId,
      institution_id: institutionId,
      title: milestone.title,
      description: milestone.description || '',
      weight_percent: milestone.weightPercent ?? 20,
      phase_number: milestone.phaseNumber ?? 1,
      due_date: milestone.dueDate,
      status: milestone.status || 'In Progress',
      sort_order: milestone.phaseNumber ?? 1,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function submitMilestoneFeedbackRemote({
  milestoneId,
  projectId,
  institutionId,
  authorId,
  authorName,
  authorRole,
  nextStatus,
  comment,
}) {
  const client = requireSupabase();
  if (nextStatus) {
    const { error: statusErr } = await client
      .from('milestones')
      .update({ status: nextStatus })
      .eq('id', milestoneId);
    if (statusErr) throw statusErr;
  }

  const { data, error } = await client
    .from('milestone_feedback')
    .insert({
      milestone_id: milestoneId,
      project_id: projectId,
      institution_id: institutionId,
      author_id: authorId,
      author_name: authorName,
      author_role: authorRole,
      status_snapshot: nextStatus || 'In Progress',
      comment,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function createOfficeHourSlotRemote(institutionId, supervisorId, slot) {
  const client = requireSupabase();
  const { data, error } = await client
    .from('supervisor_office_hours')
    .insert({
      institution_id: institutionId,
      supervisor_id: supervisorId,
      supervisor_name: slot.supervisorName,
      day_of_week: slot.dayOfWeek,
      start_time: slot.startTime,
      end_time: slot.endTime,
      slot_minutes: slot.slotMinutes || 30,
      mode: slot.mode || 'In-Person',
      location_or_link: slot.locationOrLink || '',
      notes: slot.notes || '',
      is_active: true,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function bookOfficeHourRemote({
  institutionId,
  projectId,
  slotId,
  milestoneId,
  studentId,
  supervisorId,
  meetingDate,
  topic,
}) {
  const client = requireSupabase();
  const { data, error } = await client
    .from('office_hour_bookings')
    .insert({
      institution_id: institutionId,
      project_id: projectId || null,
      slot_id: slotId,
      milestone_id: milestoneId || null,
      student_id: studentId,
      supervisor_id: supervisorId,
      meeting_date: meetingDate,
      topic,
      status: 'Pending',
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateOfficeHourBookingRemote(bookingId, status, supervisorNote = '') {
  const client = requireSupabase();
  const { data, error } = await client
    .from('office_hour_bookings')
    .update({ status, supervisor_note: supervisorNote })
    .eq('id', bookingId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

