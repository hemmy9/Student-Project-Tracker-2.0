import { Link } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, Clock, Flag, ArrowRight } from 'lucide-react';
import StatusLabel from './StatusLabel';
import { getDaysUntilDeadline, isPastDeadline } from '../../utils/dateHelper';

export default function ProgressTrackerWidget({
  title = 'Project Progress & Milestones Tracker',
  subtitle = 'Weighted milestone phases, linked task completion, and supervisor review pace.',
  milestones = [],
  tasks = [],
  nextDeadline = '',
  managePath = '/student/milestones',
  manageLabel = 'Open milestones workspace',
  tasksPath = '/student/tasks',
  tasksLabel = 'Kanban tasks',
  compactPhaseGrid = false,
}) {
  const enrichedPhases = milestones.map((ms, idx) => {
    const linked = tasks.filter((t) => t.milestoneId === ms.id);
    const done = linked.filter((t) => t.completed).length;
    const taskPct =
      linked.length > 0
        ? Math.round((done / linked.length) * 100)
        : ms.status === 'Approved'
          ? 100
          : 0;
    const weight = Number(ms.weightPercent ?? 20);
    const isOverdue = ms.status !== 'Approved' && isPastDeadline(ms.dueDate);
    const latestFeedback = (ms.feedbackEntries || [])[0] || null;

    return {
      ...ms,
      phaseNumber: ms.phaseNumber || idx + 1,
      weight,
      done,
      total: linked.length,
      taskPct,
      isOverdue,
      latestFeedback,
    };
  });

  const totalWeight = Math.max(
    1,
    enrichedPhases.reduce((sum, p) => sum + p.weight, 0)
  );
  const weightedApproved = enrichedPhases
    .filter((p) => p.status === 'Approved')
    .reduce((sum, p) => sum + p.weight, 0);
  const weightedEarned = Math.round(
    (enrichedPhases.reduce((sum, p) => sum + p.weight * (p.status === 'Approved' ? 1 : p.taskPct / 100), 0) /
      totalWeight) *
      100
  );
  const approvedWeightPct = Math.round((weightedApproved / totalWeight) * 100);
  const completedTasks = tasks.filter((t) => t.completed).length;
  const openTasks = Math.max(0, tasks.length - completedTasks);
  const overduePhases = enrichedPhases.filter((p) => p.isOverdue).length;

  const daysRemaining = getDaysUntilDeadline(nextDeadline);

  const scheduleText =
    overduePhases > 0
      ? `${overduePhases} phase needs revision`
      : daysRemaining === null
        ? 'On schedule'
        : daysRemaining < 0
          ? `${Math.abs(daysRemaining)}d overdue`
          : daysRemaining === 0
            ? 'Due today'
            : `${daysRemaining}d to deadline`;

  const scheduleToneClass =
    overduePhases > 0 || (daysRemaining !== null && daysRemaining <= 0)
      ? 'text-amber-700 dark:text-amber-400'
      : 'text-emerald-700 dark:text-emerald-400';

  return (
    <section
      aria-label="Project progress tracker widget"
      className="spt-surface h-full rounded-2xl p-5 sm:p-6 space-y-5 flex flex-col justify-between"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Flag className="h-4 w-4 text-[var(--accent-primary)]" aria-hidden="true" />
            <h2 className="font-display text-lg font-bold text-[var(--text-primary)]">{title}</h2>
          </div>
          <p className="text-xs text-[var(--text-muted)]">{subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
          {tasksPath && (
            <Link to={tasksPath} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
              {tasksLabel}
            </Link>
          )}
          <Link
            to={managePath}
            className="inline-flex items-center gap-1 text-[var(--accent-primary)] hover:underline"
          >
            <span>{manageLabel}</span>
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>

      {/* Executive Weighted Progress Summary Bar */}
      <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div>
            <p className="text-[11px] font-medium text-[var(--text-muted)]">Weighted Completion</p>
            <p className="font-display text-xl font-bold text-[var(--text-primary)] tabular-nums">
              {weightedEarned}%
            </p>
          </div>
          <div>
            <p className="text-[11px] font-medium text-[var(--text-muted)]">Signed-Off Weightage</p>
            <p className="font-display text-xl font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
              {approvedWeightPct}%
            </p>
          </div>
          <div>
            <p className="text-[11px] font-medium text-[var(--text-muted)]">Task Velocity</p>
            <p className="font-display text-xl font-bold text-[var(--text-primary)] tabular-nums">
              {completedTasks}/{tasks.length}
            </p>
            <p className="text-[11px] text-[var(--text-muted)]">{openTasks} remaining</p>
          </div>
          <div>
            <p className="text-[11px] font-medium text-[var(--text-muted)]">Schedule Standing</p>
            <p className={`font-display text-base font-bold tabular-nums mt-0.5 ${scheduleToneClass}`}>
              {scheduleText}
            </p>
          </div>
        </div>

        {/* Stacked segment bar */}
        <div className="space-y-1.5">
          <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-[var(--bg-subtle)] gap-0.5">
            {enrichedPhases.map((phase) => {
              const segWidth = `${(phase.weight / totalWeight) * 100}%`;
              const bgClass =
                phase.status === 'Approved'
                  ? 'bg-emerald-600 dark:bg-emerald-500'
                  : phase.status === 'Revision Requested'
                    ? 'bg-amber-500'
                    : phase.taskPct > 0
                      ? 'bg-[var(--accent-primary)]'
                      : 'bg-slate-400/50 dark:bg-slate-600';
              return (
                <div
                  key={phase.id}
                  style={{ width: segWidth }}
                  className={`h-full transition-all duration-300 ${bgClass}`}
                  title={`Phase ${phase.phaseNumber}: ${phase.title} (${phase.status})`}
                />
              );
            })}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-[var(--text-muted)]">
            <span>Segmented by milestone weight ({totalWeight}% total)</span>
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1">
                <span className="h-2 w-2 rounded-xs bg-emerald-600 dark:bg-emerald-500" /> Approved
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="h-2 w-2 rounded-xs bg-[var(--accent-primary)]" /> Active
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="h-2 w-2 rounded-xs bg-amber-500" /> Revision Needed
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stepped Milestone Phase Cards */}
      <div
        className={`grid grid-cols-1 gap-3 ${
          compactPhaseGrid ? 'sm:grid-cols-2' : 'md:grid-cols-2 xl:grid-cols-4'
        }`}
      >
        {enrichedPhases.map((phase) => {
          const Icon =
            phase.status === 'Approved'
              ? CheckCircle2
              : phase.status === 'Revision Requested' || phase.isOverdue
                ? AlertTriangle
                : Clock;
          const iconColor =
            phase.status === 'Approved'
              ? 'text-emerald-700 dark:text-emerald-400'
              : phase.status === 'Revision Requested' || phase.isOverdue
                ? 'text-amber-700 dark:text-amber-400'
                : 'text-[var(--accent-primary)]';

          return (
            <div
              key={phase.id}
              className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 flex flex-col justify-between gap-3 hover:border-[var(--border-strong)] transition-colors"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-[var(--text-primary)]">
                    <Icon className={`h-3.5 w-3.5 ${iconColor}`} aria-hidden="true" />
                    PHASE {phase.phaseNumber}
                  </span>
                  <span className="font-mono text-[11px] font-semibold text-[var(--text-muted)] tabular-nums">
                    {phase.weight}% wt
                  </span>
                </div>

                <h3 className="text-sm font-bold text-[var(--text-primary)] leading-snug line-clamp-2">
                  {phase.title}
                </h3>

                {phase.latestFeedback && (
                  <p className="rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] px-2.5 py-1.5 text-[11px] text-[var(--text-muted)] line-clamp-2">
                    <strong className="text-[var(--text-primary)]">{phase.latestFeedback.authorName}:</strong>{' '}
                    {phase.latestFeedback.comment}
                  </p>
                )}
              </div>

              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] tabular-nums">
                  <span>
                    Tasks {phase.done}/{phase.total}
                  </span>
                  <span className="font-mono font-semibold text-[var(--text-primary)]">{phase.taskPct}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--bg-subtle)]">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      phase.status === 'Approved'
                        ? 'bg-emerald-600 dark:bg-emerald-500'
                        : phase.status === 'Revision Requested'
                          ? 'bg-amber-500'
                          : 'bg-[var(--accent-primary)]'
                    }`}
                    style={{ width: `${phase.taskPct}%` }}
                  />
                </div>
                <div className="flex items-center justify-between gap-2 pt-0.5">
                  <span className="font-mono text-[11px] text-[var(--text-muted)] tabular-nums">
                    Due {phase.dueDate}
                  </span>
                  <StatusLabel status={phase.status} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

