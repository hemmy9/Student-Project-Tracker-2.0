import { useState } from 'react';
import { CalendarClock, CheckCircle2, Clock, MapPin, Plus, Trash2, Video } from 'lucide-react';
import StatusLabel from '../../../components/dashboard/StatusLabel';
import PortalLayout from '../../../components/layout/PortalLayout';
import Button from '../../../components/ui/Button';
import EmptyState from '../../../components/ui/EmptyState';
import FormField from '../../../components/ui/FormField';
import StatusAlert from '../../../components/ui/StatusAlert';
import { GRACE_POLYTECHNIC_BRAND } from '../../../config/gracePolytechnic';
import {
  resolveInstitutionKey,
  resolveWorkspaceInstitution,
  useDemoAppState,
} from '../../../context/DemoAppStateContext';
import { useDemoSession } from '../../../context/DemoSessionContext';
import { useToast } from '../../../context/ToastContext';
import { getPortalNavItems } from '../../../utils/roleRouting';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MODES = ['In-Person', 'Video Call', 'Hybrid'];

export default function SupervisorOfficeHoursPage() {
  const { session, activeMembership } = useDemoSession();
  const { showToast } = useToast();
  const {
    state,
    addOfficeHourSlot,
    toggleOfficeHourSlot,
    deleteOfficeHourSlot,
    updateOfficeHourBooking,
  } = useDemoAppState();

  const institutionName = resolveWorkspaceInstitution(activeMembership, session);
  const officeKey = resolveInstitutionKey(state.officeHoursByInstitution, institutionName);
  const officeData = (officeKey && state.officeHoursByInstitution?.[officeKey]) || {
    availabilitySlots: [],
    bookings: [],
  };
  const mutationInstitution = officeKey || institutionName;

  const [dayOfWeek, setDayOfWeek] = useState('Monday');
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('12:00');
  const [slotMinutes, setSlotMinutes] = useState('30');
  const [mode, setMode] = useState('In-Person');
  const [locationOrLink, setLocationOrLink] = useState('');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');
  const [banner, setBanner] = useState('');
  const [noteDrafts, setNoteDrafts] = useState({});

  const handleAddSlot = (e) => {
    e.preventDefault();
    if (!startTime || !endTime || endTime <= startTime || !locationOrLink.trim()) {
      setFormError(
        'Provide a valid start/end time window (end time after start time) and room location or meeting link.'
      );
      return;
    }

    addOfficeHourSlot(mutationInstitution, {
      supervisorName: session?.fullName || 'Dr. Samuel Osei',
      supervisorEmail:
        session?.email || `supervisor.demo@${GRACE_POLYTECHNIC_BRAND.officialDomain}`,
      dayOfWeek,
      startTime,
      endTime,
      slotMinutes: Number(slotMinutes) || 30,
      mode,
      locationOrLink: locationOrLink.trim(),
      notes: notes.trim() || 'Project progress consultation and draft review.',
    });

    showToast({
      type: 'success',
      title: 'Office hours published',
      message: `${dayOfWeek} ${startTime}–${endTime} is now visible to students.`,
    });
    setBanner(`Published ${dayOfWeek} (${startTime}–${endTime}) weekly slot to Student Scheduling UI.`);
    setLocationOrLink('');
    setNotes('');
    setFormError('');
  };

  const handleBookingDecision = (booking, nextStatus) => {
    const note = (noteDrafts[booking.id] || '').trim();
    updateOfficeHourBooking(mutationInstitution, booking.id, nextStatus, note);
    setNoteDrafts((prev) => ({ ...prev, [booking.id]: '' }));
    showToast({
      type: nextStatus === 'Cancelled' ? 'warning' : 'success',
      title: `Appointment ${nextStatus}`,
      message: `${booking.studentName} · ${booking.meetingDate}`,
    });
    setBanner(`Marked ${booking.studentName}'s appointment on ${booking.meetingDate} as ${nextStatus}.`);
  };

  return (
    <PortalLayout navItems={getPortalNavItems('supervisor')}>
      <div className="space-y-1">
        <p className="font-mono text-xs font-medium text-[var(--accent-primary)]">{institutionName}</p>
        <h1 className="font-display text-2xl font-bold text-[var(--text-primary)]">
          Supervisor Office Hours &amp; Availability
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Publish weekly consultation slots that sync immediately with the Student Scheduling UI, and confirm incoming bookings.
        </p>
      </div>

      {banner && (
        <StatusAlert type="success" title="Schedule synchronized">
          {banner}
        </StatusAlert>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Publish Weekly Availability Slot */}
        <form
          onSubmit={handleAddSlot}
          className="lg:col-span-5 spt-surface rounded-2xl p-5 sm:p-6 space-y-4 self-start"
        >
          <div className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-[var(--accent-primary)]" aria-hidden="true" />
            <h2 className="font-display text-lg font-bold text-[var(--text-primary)]">
              Add Weekly Availability Slot
            </h2>
          </div>

          {formError && (
            <StatusAlert type="error" title="Invalid time slot">
              {formError}
            </StatusAlert>
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormField
              id="oh-day"
              as="select"
              label="Recurring day"
              value={dayOfWeek}
              onChange={(e) => setDayOfWeek(e.target.value)}
              options={DAYS}
            />
            <FormField
              id="oh-duration"
              as="select"
              label="Slot length"
              value={slotMinutes}
              onChange={(e) => setSlotMinutes(e.target.value)}
              options={[
                { value: '20', label: '20 minutes' },
                { value: '30', label: '30 minutes' },
                { value: '45', label: '45 minutes' },
              ]}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField
              id="oh-start"
              type="time"
              label="Start time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
            />
            <FormField
              id="oh-end"
              type="time"
              label="End time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
            />
          </div>

          <FormField
            id="oh-mode"
            as="select"
            label="Consultation mode"
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            options={MODES}
          />

          <FormField
            id="oh-location"
            label={mode === 'Video Call' ? 'Video meeting URL' : 'Office room or meeting link'}
            placeholder={
              mode === 'Video Call'
                ? `https://meet.${GRACE_POLYTECHNIC_BRAND.officialDomain}/dr-osei`
                : 'e.g. SET Block, Room 2.04'
            }
            value={locationOrLink}
            onChange={(e) => setLocationOrLink(e.target.value)}
            required
          />

          <FormField
            id="oh-notes"
            as="textarea"
            rows={2}
            label="Session focus / preparation notes"
            placeholder="e.g. Bring prototype logs or latest chapter draft."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <Button type="submit" variant="primary" size="lg" fullWidth>
            <Plus className="h-4 w-4 inline mr-1.5" aria-hidden="true" />
            Publish weekly slot
          </Button>
        </form>

        {/* Weekly Slots + Bookings Queue */}
        <div className="lg:col-span-7 space-y-6">
          <section className="spt-surface rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-[var(--text-primary)]">
                Published Weekly Slots ({officeData.availabilitySlots.length})
              </h2>
              <span className="font-mono text-xs font-semibold text-[var(--accent-primary)]">
                Synced to Student UI
              </span>
            </div>

            {officeData.availabilitySlots.length === 0 ? (
              <EmptyState
                icon={Clock}
                title="No weekly office hours published"
                description="Add a recurring weekly slot on the left so students can schedule consultations."
              />
            ) : (
              <div className="space-y-3">
                {officeData.availabilitySlots.map((slot) => (
                  <div
                    key={slot.id}
                    className={`rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4 space-y-2.5 ${
                      slot.active ? '' : 'opacity-70'
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="font-display text-sm sm:text-base font-bold text-[var(--text-primary)]">
                          {slot.dayOfWeek} · {slot.startTime} – {slot.endTime}
                        </p>
                        <p className="text-xs text-[var(--text-secondary)] flex flex-wrap items-center gap-2 mt-0.5">
                          <span className="inline-flex items-center gap-1">
                            {slot.mode === 'Video Call' ? (
                              <Video className="h-3.5 w-3.5 text-[var(--accent-primary)]" aria-hidden="true" />
                            ) : (
                              <MapPin className="h-3.5 w-3.5 text-[var(--accent-primary)]" aria-hidden="true" />
                            )}
                            {slot.mode}
                          </span>
                          <span>· {slot.slotMinutes} min sessions</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <StatusLabel status={slot.active ? 'Active' : 'Paused'} />
                        <button
                          type="button"
                          onClick={() => {
                            toggleOfficeHourSlot(mutationInstitution, slot.id);
                            showToast({
                              type: 'info',
                              title: slot.active ? 'Slot paused' : 'Slot reactivated',
                              message: `${slot.dayOfWeek} ${slot.startTime}–${slot.endTime}`,
                            });
                          }}
                          className="min-h-[34px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-2.5 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] cursor-pointer transition-colors"
                        >
                          {slot.active ? 'Pause' : 'Activate'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            deleteOfficeHourSlot(mutationInstitution, slot.id);
                            showToast({
                              type: 'info',
                              title: 'Slot removed',
                              message: `${slot.dayOfWeek} ${slot.startTime}–${slot.endTime}`,
                            });
                          }}
                          aria-label={`Delete ${slot.dayOfWeek} slot`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-muted)] hover:bg-red-500/10 hover:text-red-700 dark:hover:text-red-400 cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    </div>

                    <p className="font-mono text-xs text-[var(--text-primary)] break-all">
                      {slot.locationOrLink}
                    </p>
                    {slot.notes && <p className="text-xs text-[var(--text-muted)]">{slot.notes}</p>}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Student Bookings Queue */}
          <section className="spt-surface rounded-2xl p-5 sm:p-6 space-y-4">
            <h2 className="font-display text-lg font-bold text-[var(--text-primary)]">
              Student Appointment Requests ({officeData.bookings.length})
            </h2>

            {officeData.bookings.length === 0 ? (
              <EmptyState
                title="No student bookings yet"
                description="Student appointments booked from the Student Office Hours screen appear here."
              />
            ) : (
              <div className="space-y-3.5">
                {officeData.bookings.map((bk) => (
                  <article
                    key={bk.id}
                    className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4 space-y-3"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <p className="text-sm font-bold text-[var(--text-primary)]">{bk.studentName}</p>
                        <p className="font-mono text-xs text-[var(--text-muted)] tabular-nums">
                          {bk.dayOfWeek}, {bk.meetingDate} · {bk.timeRange} · {bk.mode}
                        </p>
                      </div>
                      <StatusLabel status={bk.status} />
                    </div>

                    <p className="text-xs sm:text-sm text-[var(--text-primary)]">
                      <strong className="font-semibold">Agenda:</strong> {bk.topic}
                    </p>

                    {bk.supervisorNote && (
                      <p className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2 text-xs text-[var(--text-secondary)]">
                        <strong className="text-[var(--text-primary)]">Supervisor Note:</strong>{' '}
                        {bk.supervisorNote}
                      </p>
                    )}

                    {(bk.status === 'Pending' || bk.status === 'Confirmed') && (
                      <div className="space-y-2 border-t border-[var(--border-subtle)] pt-3">
                        <input
                          type="text"
                          value={noteDrafts[bk.id] || ''}
                          onChange={(e) =>
                            setNoteDrafts((prev) => ({ ...prev, [bk.id]: e.target.value }))
                          }
                          placeholder="Optional note or meeting link reminder for student..."
                          aria-label={`Supervisor note for ${bk.studentName}`}
                          className="min-h-[38px] w-full rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 text-base sm:text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-primary)] focus:outline-none"
                        />
                        <div className="flex flex-wrap gap-2">
                          {bk.status === 'Pending' && (
                            <Button
                              type="button"
                              variant="primary"
                              size="sm"
                              onClick={() => handleBookingDecision(bk, 'Confirmed')}
                            >
                              <CheckCircle2 className="h-3.5 w-3.5 inline mr-1" aria-hidden="true" />
                              Confirm slot
                            </Button>
                          )}
                          {bk.status === 'Confirmed' && (
                            <Button
                              type="button"
                              variant="navy"
                              size="sm"
                              onClick={() => handleBookingDecision(bk, 'Completed')}
                            >
                              Mark completed
                            </Button>
                          )}
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => handleBookingDecision(bk, 'Cancelled')}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </PortalLayout>
  );
}

