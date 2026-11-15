import { Link } from 'react-router-dom';
import { CalendarClock, CheckCircle2, Clock, MapPin, Video, ArrowRight } from 'lucide-react';
import StatusLabel from './StatusLabel';
import { useDemoAppState } from '../../context/DemoAppStateContext';
import { useToast } from '../../context/ToastContext';

export default function OfficeHoursWidget({
  roleKey = 'student',
  institutionName = 'University of Westbridge',
  userEmail = '',
  studentName = '',
}) {
  const { state, updateOfficeHourBooking } = useDemoAppState();
  const { showToast } = useToast();

  const officeData =
    state.officeHoursByInstitution?.[institutionName] ||
    state.officeHoursByInstitution?.['University of Westbridge'] || {
      availabilitySlots: [],
      bookings: [],
    };

  const activeSlots = officeData.availabilitySlots.filter((s) => s.active);

  const relevantBookings =
    roleKey === 'supervisor'
      ? officeData.bookings
      : officeData.bookings.filter(
          (b) => !userEmail || b.studentEmail === userEmail || b.studentName === studentName
        );

  const upcomingBookings = relevantBookings.filter(
    (b) => b.status === 'Pending' || b.status === 'Confirmed'
  );

  const targetRoute = roleKey === 'supervisor' ? '/supervisor/office-hours' : '/student/office-hours';
  const actionText = roleKey === 'supervisor' ? 'Manage weekly slots' : 'Book consultation';

  const handleQuickConfirm = (booking) => {
    updateOfficeHourBooking(
      institutionName,
      booking.id,
      'Confirmed',
      'Confirmed via Supervision Overview.'
    );
    showToast({
      type: 'success',
      title: 'Office hour confirmed',
      message: `${booking.studentName} · ${booking.meetingDate} (${booking.timeRange})`,
    });
  };

  return (
    <section
      aria-label="Office hours dashboard widget"
      className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4 flex flex-col justify-between"
    >
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-[#2563EB]" aria-hidden="true" />
              <h2 className="font-display text-lg font-bold text-[#172554]">
                {roleKey === 'supervisor' ? 'Office Hours & Bookings' : 'Supervisor Office Hours'}
              </h2>
            </div>
            <p className="text-xs text-[#64748B]">
              {roleKey === 'supervisor'
                ? `${activeSlots.length} active weekly windows synced to students`
                : 'Synced supervisor consultation slots and scheduled meetings'}
            </p>
          </div>

          <Link
            to={targetRoute}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#2563EB] hover:underline whitespace-nowrap"
          >
            <span>{actionText}</span>
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>

        {/* Upcoming Scheduled Appointments */}
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">
            Upcoming Consultations ({upcomingBookings.length})
          </p>

          {upcomingBookings.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-[#F8FAFC] p-3.5 text-xs text-[#64748B]">
              {roleKey === 'supervisor'
                ? 'No pending or confirmed student appointments right now.'
                : 'No upcoming office hours booked yet. Choose a weekly slot to schedule a check-in.'}
            </div>
          ) : (
            <div className="space-y-2.5">
              {upcomingBookings.slice(0, 2).map((bk) => (
                <div
                  key={bk.id}
                  className="rounded-xl border border-slate-200 bg-[#F8FAFC] p-3.5 space-y-1.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs font-bold text-[#172554] tabular-nums">
                      {bk.dayOfWeek}, {bk.meetingDate} · {bk.timeRange}
                    </p>
                    <StatusLabel status={bk.status} />
                  </div>
                  <p className="text-xs text-[#172554] line-clamp-1">
                    {roleKey === 'supervisor' ? `${bk.studentName}: ` : ''}
                    {bk.topic}
                  </p>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#64748B]">
                    <span className="inline-flex items-center gap-1 truncate max-w-[240px]">
                      {bk.mode === 'Video Call' ? (
                        <Video className="h-3 w-3 text-[#2563EB] shrink-0" aria-hidden="true" />
                      ) : (
                        <MapPin className="h-3 w-3 text-[#2563EB] shrink-0" aria-hidden="true" />
                      )}
                      <span className="truncate">{bk.locationOrLink}</span>
                    </span>
                    {roleKey === 'supervisor' && bk.status === 'Pending' && (
                      <button
                        type="button"
                        onClick={() => handleQuickConfirm(bk)}
                        className="inline-flex items-center gap-1 rounded-md bg-[#2563EB] px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-[#1D4ED8] cursor-pointer"
                      >
                        <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                        Confirm slot
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active Weekly Availability Summary */}
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">
            Weekly Availability Windows ({activeSlots.length})
          </p>
          {activeSlots.length === 0 ? (
            <p className="text-xs text-[#64748B]">No active weekly windows published.</p>
          ) : (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {activeSlots.slice(0, 4).map((slot) => (
                <Link
                  key={slot.id}
                  to={targetRoute}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 hover:border-[#2563EB] transition-colors"
                >
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-semibold text-[#172554]">{slot.dayOfWeek}</span>
                    <span className="font-mono text-[11px] text-[#2563EB]">{slot.mode}</span>
                  </div>
                  <p className="mt-0.5 flex items-center gap-1 font-mono text-[11px] text-[#64748B] tabular-nums">
                    <Clock className="h-3 w-3 shrink-0" aria-hidden="true" />
                    <span>
                      {slot.startTime}–{slot.endTime} ({slot.slotMinutes}m)
                    </span>
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs text-[#64748B]">
        <span>Live tenant calendar synchronization</span>
        <Link to={targetRoute} className="font-semibold text-[#2563EB] hover:underline">
          View full schedule →
        </Link>
      </div>
    </section>
  );
}
