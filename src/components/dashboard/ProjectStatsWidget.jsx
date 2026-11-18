import { BarChart3, CheckCircle2, Clock, FileCheck2, MessageSquareText } from 'lucide-react';
import { isPastDeadline } from '../../utils/dateHelper';

export default function ProjectStatsWidget({
  mode = 'student',
  project = null,
  cohortStudents = [],
  reviewQueue = [],
  officeHoursData = { availabilitySlots: [], bookings: [] },
}) {
  if (mode === 'supervisor') {
    const totalStudents = cohortStudents.length;
    const avgProgress =
      totalStudents > 0
        ? Math.round(cohortStudents.reduce((sum, s) => sum + (s.progress || 0), 0) / totalStudents)
        : 0;
    const onTrackCount = cohortStudents.filter((s) => s.attentionStatus !== 'Needs Attention').length;
    const pendingDocs = reviewQueue.filter((r) => r.status === 'Pending Review').length;
    const completedOrConfirmedBookings = (officeHoursData.bookings || []).filter(
      (b) => b.status === 'Confirmed' || b.status === 'Completed'
    ).length;

    const stats = [
      {
        label: 'Cohort Average Progress',
        value: `${avgProgress}%`,
        detail: `${onTrackCount} of ${totalStudents} students on track`,
        percent: avgProgress,
        barColor: 'bg-[var(--accent-primary)]',
        Icon: BarChart3,
      },
      {
        label: 'Review Queue Throughput',
        value: `${reviewQueue.length - pendingDocs}/${reviewQueue.length}`,
        detail: `${pendingDocs} pending chapter review(s)`,
        percent:
          reviewQueue.length > 0
            ? Math.round(((reviewQueue.length - pendingDocs) / reviewQueue.length) * 100)
            : 100,
        barColor: pendingDocs > 0 ? 'bg-amber-500' : 'bg-emerald-600 dark:bg-emerald-500',
        Icon: FileCheck2,
      },
      {
        label: 'Active Office Hour Slots',
        value: String((officeHoursData.availabilitySlots || []).filter((s) => s.active).length),
        detail: `${completedOrConfirmedBookings} confirmed/completed bookings`,
        percent: Math.min(100, completedOrConfirmedBookings * 25 + 25),
        barColor: 'bg-slate-800 dark:bg-slate-400',
        Icon: Clock,
      },
      {
        label: 'Primary Milestone Health',
        value: `${
          (project?.milestones || []).filter((m) => m.status === 'Approved').length
        }/${(project?.milestones || []).length}`,
        detail: `Journals logged: ${(project?.journals || []).length}`,
        percent:
          (project?.milestones || []).length > 0
            ? Math.round(
                ((project.milestones.filter((m) => m.status === 'Approved').length || 0) /
                  project.milestones.length) *
                  100
              )
            : 0,
        barColor: 'bg-emerald-600 dark:bg-emerald-500',
        Icon: CheckCircle2,
      },
    ];

    return (
      <section
        aria-label="Supervision project statistics"
        className="spt-surface rounded-2xl p-5 sm:p-6 space-y-4"
      >
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-[var(--text-primary)]">
              Cohort &amp; Supervision Project Stats
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              Aggregated progress velocity, review turnaround, and consultation capacity across your supervised cohort.
            </p>
          </div>
          <span className="font-mono text-xs text-[var(--accent-primary)]">Live Computed Metrics</span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-12">
          {stats.map((item) => {
            const Icon = item.Icon;
            return (
              <div
                key={item.label}
                className="lg:col-span-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4 space-y-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-[var(--text-muted)]">{item.label}</span>
                  <Icon className="h-4 w-4 text-[var(--accent-primary)] shrink-0" aria-hidden="true" />
                </div>
                <p className="font-display text-2xl font-bold text-[var(--text-primary)] tabular-nums">
                  {item.value}
                </p>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--bg-subtle)]">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${item.barColor}`}
                    style={{ width: `${Math.min(100, Math.max(4, item.percent))}%` }}
                  />
                </div>
                <p className="text-[11px] text-[var(--text-muted)]">{item.detail}</p>
              </div>
            );
          })}
        </div>
      </section>
    );
  }

  const milestones = project?.milestones || [];
  const tasks = project?.tasks || [];
  const journals = project?.journals || [];
  const submissions = project?.submissions || [];
  const messages = project?.messages || [];

  const totalWeight = Math.max(
    1,
    milestones.reduce((sum, m) => sum + Number(m.weightPercent ?? 20), 0)
  );
  const weightedReadiness = Math.round(
    (milestones.reduce((sum, m) => {
      const linked = tasks.filter((t) => t.milestoneId === m.id);
      const ratio =
        m.status === 'Approved'
          ? 1
          : linked.length > 0
            ? linked.filter((t) => t.completed).length / linked.length
            : 0;
      return sum + Number(m.weightPercent ?? 20) * ratio;
    }, 0) /
      totalWeight) *
      100
  );

  const completedTasks = tasks.filter((t) => t.completed).length;
  const overdueTasks = tasks.filter((t) => !t.completed && isPastDeadline(t.dueDate)).length;
  const onTimeScore =
    tasks.length > 0 ? Math.round(((tasks.length - overdueTasks) / tasks.length) * 100) : 100;

  const approvedDocs = submissions.filter((s) => s.status === 'Approved').length;
  const revisionDocs = submissions.filter((s) => s.status === 'Revision Requested').length;
  const docApprovalRate =
    submissions.length > 0 ? Math.round((approvedDocs / submissions.length) * 100) : 0;

  const reviewedJournals = journals.filter((j) => Boolean(j.supervisorFeedback)).length;
  const journalReviewRate =
    journals.length > 0 ? Math.round((reviewedJournals / journals.length) * 100) : 0;
  const upcomingMeetings = (officeHoursData.bookings || []).filter(
    (b) => b.status === 'Confirmed' || b.status === 'Pending'
  ).length;

  const highTasks = tasks.filter((t) => t.priority === 'High');
  const medTasks = tasks.filter((t) => t.priority === 'Medium');
  const lowTasks = tasks.filter((t) => t.priority === 'Low');

  const statBlocks = [
    {
      label: 'Weighted Readiness',
      value: `${weightedReadiness}%`,
      detail: `${milestones.filter((m) => m.status === 'Approved').length} of ${milestones.length} phases signed off`,
      percent: weightedReadiness,
      barColor: 'bg-[var(--accent-primary)]',
      Icon: BarChart3,
    },
    {
      label: 'Schedule Compliance',
      value: `${onTimeScore}%`,
      detail: overdueTasks > 0 ? `${overdueTasks} overdue open task(s)` : `${completedTasks} tasks on schedule`,
      percent: onTimeScore,
      barColor: overdueTasks > 0 ? 'bg-amber-500' : 'bg-emerald-600 dark:bg-emerald-500',
      Icon: Clock,
    },
    {
      label: 'Submission Approval Rate',
      value: `${docApprovalRate}%`,
      detail: `${submissions.length} versions · ${revisionDocs} revision cycle(s)`,
      percent: docApprovalRate,
      barColor: revisionDocs > 0 ? 'bg-[var(--accent-primary)]' : 'bg-emerald-600 dark:bg-emerald-500',
      Icon: FileCheck2,
    },
    {
      label: 'Supervision Engagement',
      value: `${journalReviewRate}%`,
      detail: `${reviewedJournals}/${journals.length} journals reviewed · ${messages.length} msgs · ${upcomingMeetings} mtg(s)`,
      percent: journalReviewRate,
      barColor: 'bg-slate-800 dark:bg-slate-400',
      Icon: MessageSquareText,
    },
  ];

  return (
    <section
      aria-label="Project statistics"
      className="spt-surface rounded-2xl p-5 sm:p-6 space-y-4"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-lg font-bold text-[var(--text-primary)]">Project Stats</h2>
          <p className="text-xs text-[var(--text-muted)]">
            Real-time completion weightage, schedule adherence, document iteration rate, and supervision cadence.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-[var(--text-muted)] tabular-nums">
          <span>
            High priority: {highTasks.filter((t) => t.completed).length}/{highTasks.length}
          </span>
          <span>
            Medium: {medTasks.filter((t) => t.completed).length}/{medTasks.length}
          </span>
          <span>
            Low: {lowTasks.filter((t) => t.completed).length}/{lowTasks.length}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-6 lg:grid-cols-12">
        {statBlocks.map((stat) => {
          const Icon = stat.Icon;
          return (
            <div
              key={stat.label}
              className="sm:col-span-3 lg:col-span-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4 space-y-2.5"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-[var(--text-muted)]">{stat.label}</span>
                <Icon className="h-4 w-4 text-[var(--accent-primary)] shrink-0" aria-hidden="true" />
              </div>
              <p className="font-display text-2xl font-bold text-[var(--text-primary)] tabular-nums">
                {stat.value}
              </p>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--bg-subtle)]">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${stat.barColor}`}
                  style={{ width: `${Math.min(100, Math.max(4, stat.percent))}%` }}
                />
              </div>
              <p className="text-[11px] text-[var(--text-muted)] leading-snug">{stat.detail}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

