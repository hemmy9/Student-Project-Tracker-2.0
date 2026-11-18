import { useMemo, useState } from 'react';
import { CalendarCheck, CalendarClock, Clock, MapPin, Video } from 'lucide-react';
import StatusLabel from '../../../components/dashboard/StatusLabel';
import PortalLayout from '../../../components/layout/PortalLayout';
import Button from '../../../components/ui/Button';
import EmptyState from '../../../components/ui/EmptyState';
import FormField from '../../../components/ui/FormField';
import StatusAlert from '../../../components/ui/StatusAlert';
import {
  resolveInstitutionKey,
  resolveWorkspaceInstitution,
  useDemoAppState,
} from '../../../context/DemoAppStateContext';
import { useDemoSession } from '../../../context/DemoSessionContext';
import { useToast } from '../../../context/ToastContext';
import { getCurrentIsoDate } from '../../../utils/dateHelper';
import { getPortalNavItems } from '../../../utils/roleRouting';

export default function StudentOfficeHoursPage() {
  const { session, activeMembership } = useDemoSession();
  const { showToast } = useToast();
  const { state, bookOfficeHourSlot, updateOfficeHourBooking } = useDemoAppState();

  const institutionName = resolveWorkspaceInstitution(activeMembership, session);
  const projectKey = resolveInstitutionKey(state.projectsByInstitution, institutionName);
  const project = projectKey ? state.projectsByInstitution[projectKey] : null;
  const officeKey = resolveInstitutionKey(state.officeHoursByInstitution, institutionName);
  const officeData = (officeKey && state.officeHoursByInstitution?.[officeKey]) || {
    availabilitySlots: [],
    bookings: [],
  };
  const mutationInstitution = officeKey || projectKey || institutionName;

  const activeSlots = useMemo(
    () => officeData.availabilitySlots.filter((s) => s.active),
    [officeData.availabilitySlots]
  );

  const [selectedSlotId, setSelectedSlotId] = useState(activeSlots[0]?.id || '');
  const [meetingDate, setMeetingDate] = useState(() => getCurrentIsoDate());
  const [milestoneId, setMilestoneId] = useState('');
  const [topic, setTopic] = useState('');
  const [formError, setFormError] = useState('');
  const [banner, setBanner] = useState('');

  const selectedSlot =
    activeSlots.find((s) => s.id === selectedSlotId) || activeSlots[0] || null;

  const studentBookings = useMemo(() => {
    const email = session?.email || project?.studentEmail;
    return officeData.bookings.filter(
      (b) => b.studentEmail === email || (project?.studentName && b.studentName === project.studentName)
    );
  }, [officeData.bookings, session?.email, project?.studentEmail, project?.studentName]);

  if (!project) {
    return (
      <PortalLayout navItems={getPortalNavItems('student')}>
        <EmptyState
          icon={CalendarClock}
          title="No active student office hours"
          description={`No student supervision schedule is assigned under ${institutionName}. Switch institution membership or reset demo data if needed.`}
        />
      </PortalLayout>
    );
  }

  const handleBook = (e) => {
    e.preventDefault();
    if (!selectedSlot) {
      setFormError('No active supervisor office hour slots are currently available.');
      return;
    }
    if (!meetingDate || topic.trim().length < 6) {
      setFormError('Select a consultation date and describe your meeting agenda (at least 6 characters).');
      return;
    }

    const startParts = selectedSlot.startTime.split(':').map(Number);
    const totalStartMins = startParts[0] * 60 + startParts[1];
    const totalEndMins = totalStartMins + (selectedSlot.slotMinutes || 30);
    const endH = String(Math.floor(totalEndMins / 60) % 24).padStart(2, '0');
    const endM = String(totalEndMins % 60).padStart(2, '0');
    const timeRange = `${selectedSlot.startTime} – ${endH}:${endM}`;

    bookOfficeHourSlot(mutationInstitution, {
      slotId: selectedSlot.id,
      studentName: session?.fullName || project.studentName,
      studentEmail: session?.email || project.studentEmail,
      supervisorName: selectedSlot.supervisorName,
      meetingDate,
      dayOfWeek: selectedSlot.dayOfWeek,
      timeRange,
      mode: selectedSlot.mode,
      locationOrLink: selectedSlot.locationOrLink,
      topic: topic.trim(),
      milestoneId,
    });

    setTopic('');
    setMilestoneId('');
    setFormError('');
    setBanner(
      `Requested ${selectedSlot.dayOfWeek}, ${meetingDate} (${timeRange}) with ${selectedSlot.supervisorName}.`
    );
    showToast({
      type: 'success',
      title: 'Office hour requested',
      message: `${meetingDate} · ${timeRange}`,
    });
  };

  return (
    <PortalLayout navItems={getPortalNavItems('student')}>
      <div className="space-y-1">
        <p className="font-mono text-xs font-medium text-[var(--accent-primary)]">
          {project.code} · {institutionName}
        </p>
        <h1 className="font-display text-2xl font-bold text-[var(--text-primary)]">
          Supervisor Office Hours &amp; Scheduling
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Browse {project.supervisorName}’s live weekly availability slots and book consultation sessions.
        </p>
      </div>

      {banner && (
        <StatusAlert type="success" title="Appointment request sent">
          {banner}
        </StatusAlert>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Live Weekly Availability Picker + Booking Form */}
        <section className="lg:col-span-7 space-y-5">
          <div className="spt-surface rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <CalendarClock className="h-4 w-4 text-[var(--accent-primary)]" aria-hidden="true" />
                <h2 className="font-display text-lg font-bold text-[var(--text-primary)]">
                  Supervisor Weekly Availability ({activeSlots.length})
                </h2>
              </div>
              <span className="font-mono text-xs font-semibold text-[var(--accent-primary)]">
                Live Sync
              </span>
            </div>

            {activeSlots.length === 0 ? (
              <EmptyState
                icon={Clock}
                title="No active office hour slots"
                description="Your supervisor has paused or not yet published weekly office hours."
              />
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {activeSlots.map((slot) => {
                  const isSelected = selectedSlot?.id === slot.id;
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => setSelectedSlotId(slot.id)}
                      className={`w-full rounded-xl border p-4 text-left transition-colors cursor-pointer space-y-1.5 ${
                        isSelected
                          ? 'border-[var(--accent-primary)] bg-blue-500/10 ring-1 ring-[var(--accent-primary)]'
                          : 'border-[var(--border-subtle)] bg-[var(--bg-elevated)] hover:bg-[var(--bg-subtle)]'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-display text-sm sm:text-base font-bold text-[var(--text-primary)]">
                          {slot.dayOfWeek} · {slot.startTime} – {slot.endTime}
                        </p>
                        <span className="font-mono text-xs font-semibold text-[var(--accent-primary)]">
                          {slot.slotMinutes} min · {slot.mode}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] flex items-center gap-1.5 break-all">
                        {slot.mode === 'Video Call' ? (
                          <Video className="h-3.5 w-3.5 text-[var(--accent-primary)] shrink-0" aria-hidden="true" />
                        ) : (
                          <MapPin className="h-3.5 w-3.5 text-[var(--accent-primary)] shrink-0" aria-hidden="true" />
                        )}
                        <span>{slot.locationOrLink}</span>
                      </p>
                      {slot.notes && (
                        <p className="text-xs text-[var(--text-muted)]">{slot.notes}</p>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Booking Form */}
          <form
            onSubmit={handleBook}
            className="spt-surface rounded-2xl p-5 sm:p-6 space-y-4"
          >
            <h2 className="font-display text-base font-bold text-[var(--text-primary)]">
              Book Consultation Session
            </h2>

            {formError && (
              <StatusAlert type="error" title="Check booking details">
                {formError}
              </StatusAlert>
            )}

            {selectedSlot && (
              <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 px-3.5 py-2.5 text-xs text-[var(--text-primary)]">
                Selected Window:{' '}
                <strong>
                  {selectedSlot.dayOfWeek} ({selectedSlot.startTime}–{selectedSlot.endTime})
                </strong>{' '}
                with {selectedSlot.supervisorName}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                id="bk-date"
                type="date"
                label="Preferred date"
                value={meetingDate}
                onChange={(e) => setMeetingDate(e.target.value)}
                required
              />
              <FormField
                id="bk-milestone"
                as="select"
                label="Related milestone (optional)"
                value={milestoneId}
                onChange={(e) => setMilestoneId(e.target.value)}
                options={[
                  { value: '', label: 'General supervision check-in' },
                  ...project.milestones.map((m) => ({ value: m.id, label: m.title })),
                ]}
              />
            </div>

            <FormField
              id="bk-topic"
              as="textarea"
              rows={3}
              label="Meeting agenda / questions"
              placeholder="e.g. Review Chapter 3 ER schema revisions and verify latency benchmark..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={!selectedSlot}
            >
              <CalendarCheck className="h-4 w-4 inline mr-1.5" aria-hidden="true" />
              Request office hour slot
            </Button>
          </form>
        </section>

        {/* Student Bookings Status */}
        <section className="lg:col-span-5 spt-surface rounded-2xl p-5 sm:p-6 space-y-4 self-start">
          <h2 className="font-display text-lg font-bold text-[var(--text-primary)]">
            Your Scheduled Consultations ({studentBookings.length})
          </h2>

          {studentBookings.length === 0 ? (
            <EmptyState
              title="No bookings scheduled"
              description="Select one of your supervisor's active weekly slots to book a meeting."
            />
          ) : (
            <div className="space-y-3">
              {studentBookings.map((bk) => (
                <article
                  key={bk.id}
                  className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-bold text-[var(--text-primary)]">
                        {bk.dayOfWeek}, {bk.meetingDate}
                      </p>
                      <p className="font-mono text-xs text-[var(--text-secondary)] tabular-nums">
                        {bk.timeRange} · {bk.mode}
                      </p>
                    </div>
                    <StatusLabel status={bk.status} />
                  </div>

                  <p className="text-xs text-[var(--text-primary)] leading-relaxed">{bk.topic}</p>
                  <p className="font-mono text-[11px] text-[var(--text-muted)] break-all">
                    {bk.locationOrLink}
                  </p>

                  {bk.supervisorNote && (
                    <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-2.5 text-xs text-[var(--text-primary)]">
                      <strong>Supervisor Note:</strong> {bk.supervisorNote}
                    </div>
                  )}

                  {(bk.status === 'Pending' || bk.status === 'Confirmed') && (
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          updateOfficeHourBooking(
                            mutationInstitution,
                            bk.id,
                            'Cancelled',
                            'Cancelled by student.'
                          );
                          showToast({
                            type: 'info',
                            title: 'Appointment cancelled',
                            message: `${bk.meetingDate} · ${bk.timeRange}`,
                          });
                        }}
                        className="text-xs font-semibold text-red-700 dark:text-red-400 hover:underline cursor-pointer"
                      >
                        Cancel appointment
                      </button>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </PortalLayout>
  );
}

