import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, CheckCircle2, User } from 'lucide-react';
import ActivityFeedStream from '../../components/dashboard/ActivityFeedStream';
import AiProjectCopilot from '../../components/dashboard/AiProjectCopilot';
import {
  ActivityCadenceChart,
  BreakdownDonut,
  HorizontalBarChart,
} from '../../components/dashboard/AnalyticsPanel';
import DashboardSkeleton from '../../components/dashboard/DashboardSkeleton';
import DeadlineRemindersBanner from '../../components/dashboard/DeadlineRemindersBanner';
import OfficeHoursWidget from '../../components/dashboard/OfficeHoursWidget';
import ProgressTrackerWidget from '../../components/dashboard/ProgressTrackerWidget';
import ProjectStatsWidget from '../../components/dashboard/ProjectStatsWidget';
import SmartDashboardFilters from '../../components/dashboard/SmartDashboardFilters';
import Stage2Banner from '../../components/dashboard/Stage2Banner';
import StatCard from '../../components/dashboard/StatCard';
import StatusLabel from '../../components/dashboard/StatusLabel';
import PortalLayout from '../../components/layout/PortalLayout';
import EmptyState from '../../components/ui/EmptyState';
import { WidgetErrorBoundary } from '../../components/ui/ErrorBoundary';
import {
  resolveInstitutionKey,
  resolveWorkspaceInstitution,
  useDemoAppState,
} from '../../context/DemoAppStateContext';
import { useDemoSession } from '../../context/DemoSessionContext';
import { getDaysUntilDeadline, isPastDeadline } from '../../utils/dateHelper';
import { getPortalNavItems } from '../../utils/roleRouting';

const MILESTONE_FILTERS = ['All', 'In Progress', 'Revision Requested', 'Approved'];
const MILESTONE_SORTS = [
  { value: 'due_asc', label: 'Due Date (Earliest)' },
  { value: 'progress_desc', label: 'Completion (Highest)' },
  { value: 'title_asc', label: 'Title (A–Z)' },
];

export default function StudentDashboardPage() {
  const { session, activeMembership } = useDemoSession();
  const { state } = useDemoAppState();
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('due_asc');
  const [loadingPreview, setLoadingPreview] = useState(false);

  const institutionName = resolveWorkspaceInstitution(activeMembership, session);
  const projectKey = resolveInstitutionKey(state.projectsByInstitution, institutionName);
  const project = projectKey ? state.projectsByInstitution[projectKey] : null;

  const milestones = project?.milestones || [];
  const tasks = project?.tasks || [];
  const journals = project?.journals || [];
  const submissions = project?.submissions || [];

  const completedTasks = tasks.filter((t) => t.completed).length;
  const totalTasks = tasks.length;
  const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const approvedMilestones = milestones.filter((m) => m.status === 'Approved').length;
  const pendingRevisions = submissions.filter((s) => s.status === 'Revision Requested').length;

  const metrics = [
    {
      label: 'Milestones Approved',
      value: `${approvedMilestones} / ${milestones.length}`,
      hint: `${milestones.length - approvedMilestones} remaining`,
    },
    {
      label: 'Tasks Completed',
      value: `${completedTasks} / ${totalTasks}`,
      hint: `${overallProgress}% task completion`,
    },
    {
      label: 'Weekly Journals',
      value: String(journals.length),
      hint: journals[0] ? `Latest: Week ${journals[0].weekNumber}` : 'No entries yet',
    },
    {
      label: 'Revision Requests',
      value: String(pendingRevisions),
      hint: pendingRevisions > 0 ? 'Requires student response' : 'All submissions clear',
    },
  ];

  const milestonesWithTaskCounts = useMemo(() => {
    return milestones.map((ms) => {
      const msTasks = tasks.filter((t) => t.milestoneId === ms.id);
      const msDone = msTasks.filter((t) => t.completed).length;
      return { ...ms, tasksDone: msDone, tasksTotal: msTasks.length };
    });
  }, [milestones, tasks]);

  const filteredMilestones = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = milestonesWithTaskCounts.filter((m) => {
      const matchesStatus = statusFilter === 'All' || m.status === statusFilter;
      const matchesQuery =
        !q || m.title.toLowerCase().includes(q) || m.dueDate.toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });

    return [...list].sort((a, b) => {
      if (sortBy === 'progress_desc') {
        const pctA = a.tasksTotal > 0 ? a.tasksDone / a.tasksTotal : 0;
        const pctB = b.tasksTotal > 0 ? b.tasksDone / b.tasksTotal : 0;
        return pctB - pctA;
      }
      if (sortBy === 'title_asc') return a.title.localeCompare(b.title);
      return a.dueDate.localeCompare(b.dueDate);
    });
  }, [milestonesWithTaskCounts, statusFilter, searchQuery, sortBy]);

  const taskSegments = useMemo(() => {
    const overdue = tasks.filter((t) => !t.completed && isPastDeadline(t.dueDate)).length;
    const openOnTime = totalTasks - completedTasks - overdue;
    return [
      { label: 'Completed', value: completedTasks, color: '#10B981' },
      { label: 'Open On Track', value: Math.max(0, openOnTime), color: '#2563EB' },
      { label: 'Overdue', value: overdue, color: '#DC2626' },
    ];
  }, [tasks, totalTasks, completedTasks]);

  const milestoneBars = useMemo(() => {
    return milestonesWithTaskCounts.map((ms) => {
      const pct =
        ms.tasksTotal > 0
          ? Math.round((ms.tasksDone / ms.tasksTotal) * 100)
          : ms.status === 'Approved'
            ? 100
            : 0;
      return {
        label: ms.title,
        percent: pct,
        valueLabel: `${pct}%`,
        color: ms.status === 'Approved' ? '#10B981' : '#2563EB',
      };
    });
  }, [milestonesWithTaskCounts]);

  const cadenceBars = useMemo(() => {
    return [
      { label: 'W3', value: 1 },
      { label: 'W4', value: 2 },
      { label: 'W5', value: 1 },
      { label: 'W6', value: 2 },
      { label: 'W7', value: 2 },
      { label: 'W8+', value: journals.length + submissions.length },
    ];
  }, [journals.length, submissions.length]);

  const hasActiveMilestoneFilters =
    statusFilter !== 'All' || searchQuery.trim() !== '' || sortBy !== 'due_asc';

  const officeKey = resolveInstitutionKey(state.officeHoursByInstitution, institutionName);
  const officeHoursData = (officeKey && state.officeHoursByInstitution?.[officeKey]) || {
    availabilitySlots: [],
    bookings: [],
  };

  const daysUntilNextDeadline = getDaysUntilDeadline(project?.nextDeadline);
  const nextDeadlineLabel =
    daysUntilNextDeadline === null
      ? ''
      : daysUntilNextDeadline < 0
        ? `(${Math.abs(daysUntilNextDeadline)} days overdue)`
        : daysUntilNextDeadline === 0
          ? '(due today)'
          : `(${daysUntilNextDeadline} days left)`;

  const aiContextData = useMemo(
    () =>
      project
        ? {
            projectTitle: project.title,
            projectCode: project.code,
            nextDeadline: project.nextDeadline,
            overallTaskProgressPct: overallProgress,
            milestones: project.milestones.map((m) => ({
              phase: m.phaseNumber,
              title: m.title,
              status: m.status,
              dueDate: m.dueDate,
              weightPercent: m.weightPercent,
              latestFeedback: m.feedbackEntries?.[0]?.comment || '',
            })),
            openTasks: project.tasks
              .filter((t) => !t.completed)
              .map((t) => ({ title: t.title, status: t.status, priority: t.priority, dueDate: t.dueDate })),
            pendingRevisions,
            recentJournal: project.journals[0] || null,
            upcomingOfficeHours: officeHoursData.bookings.filter(
              (b) => b.status === 'Pending' || b.status === 'Confirmed'
            ),
          }
        : {},
    [project, overallProgress, pendingRevisions, officeHoursData.bookings]
  );

  return (
    <PortalLayout navItems={getPortalNavItems('student')}>
      <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-12">
          <Stage2Banner
            portalName="Student Portal"
            tenantLabel={institutionName || 'Student Workspace'}
            loadingPreview={loadingPreview}
            onToggleLoadingPreview={setLoadingPreview}
          />
        </div>

        {loadingPreview ? (
          <div className="lg:col-span-12">
            <DashboardSkeleton variant="full" />
          </div>
        ) : !project ? (
          <div className="lg:col-span-12 spt-surface rounded-2xl p-6">
            <EmptyState
              title="No active student project record"
              description="No project workspace is currently mapped to this institution scope."
            />
          </div>
        ) : (
          <>
            {/* Assigned Academic Project Overview */}
            <section className="lg:col-span-12 spt-surface rounded-2xl p-5 sm:p-7 space-y-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1.5">
                  <p className="font-mono text-xs font-medium text-[var(--accent-primary)] tabular-nums">
                    {project.code} · {project.academicSession}
                  </p>
                  <h1 className="font-display text-xl sm:text-2xl font-bold text-[var(--text-primary)] leading-snug text-balance">
                    {project.title}
                  </h1>
                  <p className="text-xs sm:text-sm text-[var(--text-muted)]">
                    {project.department} · {project.programme}
                  </p>
                </div>
                <div className="shrink-0 sm:text-right">
                  <p className="text-xs text-[var(--text-muted)]">Task Completion</p>
                  <p className="font-display text-2xl font-bold text-[var(--text-primary)] tabular-nums">
                    {overallProgress}%
                  </p>
                </div>
              </div>

              <div className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--bg-subtle)]">
                <div
                  className="h-full rounded-full bg-[var(--accent-primary)] transition-all duration-300"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>

              <div className="grid grid-cols-1 gap-3 border-t border-[var(--border-subtle)] pt-4 text-xs sm:grid-cols-2 sm:text-sm">
                <div className="flex items-center gap-2 text-[var(--text-muted)]">
                  <User className="h-4 w-4 text-[var(--accent-primary)] shrink-0" aria-hidden="true" />
                  <span>
                    Supervisor: <strong className="text-[var(--text-primary)]">{project.supervisorName}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[var(--text-muted)] sm:justify-end">
                  <Calendar className="h-4 w-4 text-[var(--accent-primary)] shrink-0" aria-hidden="true" />
                  <span className="tabular-nums">
                    Next deadline:{' '}
                    <strong className="text-[var(--text-primary)]">{project.nextDeadline}</strong>{' '}
                    {nextDeadlineLabel && (
                      <span
                        className={`text-xs font-semibold ${
                          daysUntilNextDeadline !== null && daysUntilNextDeadline <= 0
                            ? 'text-amber-700 dark:text-amber-400'
                            : 'text-[var(--accent-primary)]'
                        }`}
                      >
                        {nextDeadlineLabel}
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </section>

            {/* Automated Deadline & Schedule Reminders */}
            <div className="lg:col-span-12">
              <DeadlineRemindersBanner />
            </div>

            {/* 4 KPI Summary Cards (12-column full width) */}
            <section
              aria-label="Project progress metrics"
              className="lg:col-span-12 grid grid-cols-1 gap-4 sm:grid-cols-6 lg:grid-cols-12"
            >
              {metrics.map((metric) => (
                <div key={metric.label} className="sm:col-span-3 lg:col-span-3">
                  <StatCard label={metric.label} value={metric.value} hint={metric.hint} />
                </div>
              ))}
            </section>

            {/* Project Stats Widget */}
            <div className="lg:col-span-12">
              <WidgetErrorBoundary title="Project Stats temporarily unavailable">
                <ProjectStatsWidget
                  mode="student"
                  project={project}
                  officeHoursData={officeHoursData}
                />
              </WidgetErrorBoundary>
            </div>

            {/* Side-by-Side Full Width on Desktop (>=1024px): Progress & Milestones Tracker + Supervisor Office Hours */}
            <div className="lg:col-span-7">
              <WidgetErrorBoundary title="Progress Tracker temporarily unavailable">
                <ProgressTrackerWidget
                  milestones={project.milestones}
                  tasks={project.tasks}
                  nextDeadline={project.nextDeadline}
                  managePath="/student/milestones"
                  manageLabel="Manage milestones & feedback"
                  tasksPath="/student/tasks"
                  tasksLabel="Kanban board"
                  compactPhaseGrid
                />
              </WidgetErrorBoundary>
            </div>

            <div className="lg:col-span-5">
              <WidgetErrorBoundary title="Office Hours temporarily unavailable">
                <OfficeHoursWidget
                  roleKey="student"
                  institutionName={institutionName}
                  userEmail={session?.email || project.studentEmail}
                  studentName={session?.fullName || project.studentName}
                />
              </WidgetErrorBoundary>
            </div>

            {/* Dashboard Analytics (12-column full width) */}
            <section
              aria-label="Student project analytics"
              className="lg:col-span-12 grid grid-cols-1 gap-4 lg:grid-cols-12"
            >
              <div className="lg:col-span-4">
                <BreakdownDonut
                  title="Task Status Breakdown"
                  subtitle="Completed vs. open and overdue tasks"
                  segments={taskSegments}
                />
              </div>
              <div className="lg:col-span-4">
                <HorizontalBarChart
                  title="Milestone Progress"
                  subtitle="Completion across project stages"
                  items={milestoneBars}
                />
              </div>
              <div className="lg:col-span-4">
                <ActivityCadenceChart
                  title="Weekly Research Activity"
                  subtitle="Journals & chapter submissions logged"
                  bars={cadenceBars}
                />
              </div>
            </section>

            {/* Milestones & Progress Breakdown (12-column full width) */}
            <section className="lg:col-span-12 spt-surface rounded-2xl p-5 sm:p-6 space-y-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-display text-lg font-bold text-[var(--text-primary)]">
                    Project Milestones
                  </h2>
                  <p className="text-xs text-[var(--text-muted)]">
                    Track deliverables, due dates, and supervisor sign-off status.
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs font-semibold">
                  <Link
                    to="/student/milestones"
                    className="text-[var(--accent-primary)] hover:underline whitespace-nowrap"
                  >
                    Open milestones →
                  </Link>
                  <Link
                    to="/student/tasks"
                    className="text-[var(--text-muted)] hover:text-[var(--text-primary)] whitespace-nowrap"
                  >
                    Manage tasks →
                  </Link>
                </div>
              </div>

              <SmartDashboardFilters
                searchValue={searchQuery}
                onSearchChange={setSearchQuery}
                searchPlaceholder="Search milestones or due dates..."
                filterOptions={MILESTONE_FILTERS}
                activeFilter={statusFilter}
                onFilterChange={setStatusFilter}
                sortOptions={MILESTONE_SORTS}
                activeSort={sortBy}
                onSortChange={setSortBy}
                summaryText={`Showing ${filteredMilestones.length} of ${milestonesWithTaskCounts.length} milestones`}
                hasActiveFilters={hasActiveMilestoneFilters}
                onReset={() => {
                  setStatusFilter('All');
                  setSearchQuery('');
                  setSortBy('due_asc');
                }}
              />

              {filteredMilestones.length === 0 ? (
                <EmptyState
                  icon={CheckCircle2}
                  title={`No milestones marked "${statusFilter}"`}
                  description="Switch back to All milestones to view your complete project schedule."
                  actionLabel="Show all milestones"
                  onAction={() => setStatusFilter('All')}
                />
              ) : (
                <>
                  <div className="divide-y divide-[var(--border-subtle)] md:hidden">
                    {filteredMilestones.map((ms) => (
                      <div key={ms.id} className="py-3.5 first:pt-0 last:pb-0 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-semibold text-[var(--text-primary)] leading-snug">
                            {ms.title}
                          </p>
                          <StatusLabel status={ms.status} />
                        </div>
                        <div className="flex items-center justify-between text-xs text-[var(--text-muted)] tabular-nums">
                          <span>Due {ms.dueDate}</span>
                          <span>
                            Tasks: {ms.tasksDone}/{ms.tasksTotal}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-muted)]">
                          <th className="py-2.5 pr-4">Milestone</th>
                          <th className="py-2.5 px-4">Due Date</th>
                          <th className="py-2.5 px-4 text-right">Tasks</th>
                          <th className="py-2.5 pl-4 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border-subtle)]">
                        {filteredMilestones.map((ms) => (
                          <tr key={ms.id} className="hover:bg-[var(--bg-elevated)]/60">
                            <td className="py-3 pr-4 font-medium text-[var(--text-primary)]">{ms.title}</td>
                            <td className="py-3 px-4 font-mono text-xs text-[var(--text-muted)] tabular-nums">
                              {ms.dueDate}
                            </td>
                            <td className="py-3 px-4 text-right font-mono text-xs text-[var(--text-primary)] tabular-nums">
                              {ms.tasksDone} / {ms.tasksTotal}
                            </td>
                            <td className="py-3 pl-4 text-right">
                              <StatusLabel status={ms.status} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </section>

            {/* AI Copilot & Live Activity Feed Stream (12-column grid) */}
            <div className="lg:col-span-6">
              <WidgetErrorBoundary title="AI Copilot temporarily unavailable">
                <AiProjectCopilot
                  roleKey="student"
                  institutionName={institutionName}
                  contextData={aiContextData}
                />
              </WidgetErrorBoundary>
            </div>

            <div className="lg:col-span-6">
              <WidgetErrorBoundary title="Activity Feed temporarily unavailable">
                <ActivityFeedStream
                  title="Recent Activity Stream & Feedback Logs"
                  subtitle="Live log of your task updates, chapter uploads, journals, and supervisor reviews."
                />
              </WidgetErrorBoundary>
            </div>
          </>
        )}
      </div>
    </PortalLayout>
  );
}

