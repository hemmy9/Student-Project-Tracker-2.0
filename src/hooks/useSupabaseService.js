import { useCallback, useState } from 'react';
import { useToast } from '../context/ToastContext';
import { isSupabaseConfigured } from '../lib/supabaseClient';
import {
  bookOfficeHourRemote,
  createMilestoneRemote,
  createOfficeHourSlotRemote,
  createProjectTaskRemote,
  fetchUserMemberships,
  getSignedDocumentUrl,
  signInWithSupabasePassword,
  signOutSupabase,
  submitInstitutionApplicationRemote,
  submitMilestoneFeedbackRemote,
  subscribeToProjectMessages,
  toggleProjectTaskRemote,
  updateOfficeHourBookingRemote,
  uploadChapterDocumentRemote,
} from '../services/supabaseService';

export function useSupabaseService() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastSyncedAt, setLastSyncedAt] = useState(null);

  const clearError = useCallback(() => setError(''), []);

  const runAction = useCallback(
    async (
      asyncFn,
      {
        successTitle = '',
        successMessage = '',
        errorTitle = 'Supabase request failed',
        showSuccessToast = false,
        showErrorToast = true,
      } = {}
    ) => {
      setLoading(true);
      setError('');
      try {
        const result = await asyncFn();
        setLastSyncedAt(new Date().toISOString());
        if (showSuccessToast && (successTitle || successMessage)) {
          showToast({
            type: 'success',
            title: successTitle || 'Saved to Supabase',
            message: successMessage,
          });
        }
        return result;
      } catch (err) {
        const msg = err?.message || 'Unexpected error communicating with Supabase.';
        setError(msg);
        if (showErrorToast) {
          showToast({
            type: 'error',
            title: errorTitle,
            message: msg,
          });
        }
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [showToast]
  );

  const signIn = useCallback(
    (email, password) =>
      runAction(() => signInWithSupabasePassword(email, password), {
        errorTitle: 'Sign-in failed',
      }),
    [runAction]
  );

  const signOut = useCallback(
    () =>
      runAction(() => signOutSupabase(), {
        errorTitle: 'Sign-out failed',
      }),
    [runAction]
  );

  const loadMemberships = useCallback(
    (userId) =>
      runAction(() => fetchUserMemberships(userId), {
        errorTitle: 'Unable to load institutional memberships',
      }),
    [runAction]
  );

  const submitInstitutionApplication = useCallback(
    (payload) =>
      runAction(() => submitInstitutionApplicationRemote(payload), {
        successTitle: 'Application submitted to Supabase',
        successMessage: `${payload.institutionName} is queued for platform review.`,
        errorTitle: 'Application submission failed',
        showSuccessToast: true,
      }),
    [runAction]
  );

  const createTask = useCallback(
    (projectId, institutionId, task) =>
      runAction(() => createProjectTaskRemote(projectId, institutionId, task), {
        successTitle: 'Task saved to Supabase',
        errorTitle: 'Could not save task',
        showSuccessToast: true,
      }),
    [runAction]
  );

  const toggleTask = useCallback(
    (taskId, completed) =>
      runAction(() => toggleProjectTaskRemote(taskId, completed), {
        errorTitle: 'Could not update task status',
      }),
    [runAction]
  );

  const uploadDocument = useCallback(
    (params) =>
      runAction(() => uploadChapterDocumentRemote(params), {
        successTitle: 'Chapter uploaded to Supabase Storage',
        successMessage: `${params.title} (${params.version}) is now queued for review.`,
        errorTitle: 'Document upload failed',
        showSuccessToast: true,
      }),
    [runAction]
  );

  const fetchSignedUrl = useCallback(
    (storagePath) =>
      runAction(() => getSignedDocumentUrl(storagePath), {
        errorTitle: 'Could not open private document link',
      }),
    [runAction]
  );

  const createMilestone = useCallback(
    (projectId, institutionId, milestone) =>
      runAction(() => createMilestoneRemote(projectId, institutionId, milestone), {
        successTitle: 'Milestone saved to Supabase',
        errorTitle: 'Could not save milestone',
        showSuccessToast: true,
      }),
    [runAction]
  );

  const submitMilestoneFeedback = useCallback(
    (params) =>
      runAction(() => submitMilestoneFeedbackRemote(params), {
        successTitle: 'Milestone feedback saved',
        errorTitle: 'Could not save milestone feedback',
        showSuccessToast: true,
      }),
    [runAction]
  );

  const createOfficeHourSlot = useCallback(
    (institutionId, supervisorId, slot) =>
      runAction(() => createOfficeHourSlotRemote(institutionId, supervisorId, slot), {
        successTitle: 'Office hour slot published',
        errorTitle: 'Could not publish availability slot',
        showSuccessToast: true,
      }),
    [runAction]
  );

  const bookOfficeHour = useCallback(
    (params) =>
      runAction(() => bookOfficeHourRemote(params), {
        successTitle: 'Office hour booked',
        errorTitle: 'Could not complete booking',
        showSuccessToast: true,
      }),
    [runAction]
  );

  const updateOfficeHourBooking = useCallback(
    (bookingId, status, supervisorNote) =>
      runAction(() => updateOfficeHourBookingRemote(bookingId, status, supervisorNote), {
        successTitle: `Booking marked ${status}`,
        errorTitle: 'Could not update booking',
        showSuccessToast: true,
      }),
    [runAction]
  );

  return {
    isConfigured: isSupabaseConfigured,
    loading,
    error,
    lastSyncedAt,
    clearError,
    runAction,
    signIn,
    signOut,
    loadMemberships,
    submitInstitutionApplication,
    createTask,
    toggleTask,
    uploadDocument,
    fetchSignedUrl,
    subscribeMessages: subscribeToProjectMessages,
    createMilestone,
    submitMilestoneFeedback,
    createOfficeHourSlot,
    bookOfficeHour,
    updateOfficeHourBooking,
  };
}
