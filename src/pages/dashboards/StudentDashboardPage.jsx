import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, CheckCircle2, User } from 'lucide-react';
import ActivityFeedStream from '../../components/dashboard/ActivityFeedStream';
import {
  ActivityCadenceChart,
  BreakdownDonut,
  HorizontalBarChart,
} from '../../components/dashboard/AnalyticsPanel';
import DashboardSkeleton from '../../components/dashboard/DashboardSkeleton';
import SmartDashboardFilters from '../../components/dashboard/SmartDashboardFilters';
import Stage2Banner from '../../components/dashboard/Stage2Banner';
import StatCard from '../../components/dashboard/StatCard';
import StatusLabel from '../../components/dashboard/StatusLabel';
import PortalLayout from '../../components/layout/PortalLayout';
import EmptyState from '../../components/ui/EmptyState';
import { useDemoAppState } from '../../context/DemoAppStateContext';
import { useDemoSession } from '../../context/DemoSessionContext';
import { getPortalNavItems } from '../../utils/roleRouting';

const MILESTONE_FILTERS = ['All', 'In Progress', 'Revision Requested', 'Approved'];
const MILESTONE_SORTS = [
  { value: 'due_asc', label: 'Due Date (Earliest)' },
  { value: 'progress_desc', label: 'Completion (Highest)' },
  { value: 'title_asc', label: 'Title (A–Z)' },
];

export default function StudentDashboardPage() {
  const { activeMembership } = useDemoSession();
  const { state } = useDemoAppState();
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('due_asc');
  const [loadingPreview, setLoadingPreview] = useState(false);

  const institutionName = activeMembership?.institutionName || 'University of Westbridge';
  const project =
    state.projectsByInstitution[institutionName] ||
    state.projectsByInstitution['University of Westbridge'];

  const completedTasks = project.tasks.filter((t) => t.completed).length;
  const totalTasks = project.tasks.length;
  const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const approvedMilestones = project.milestones.filter((m) => m.status === 'Approved').length;
  const pendingRevisions = project.submissions.filter(
    (s) => s.status === 'Revision Requested'
  ).length;

  const metrics = [
    {
      label: 'Milestones Approved',
      value: `${approvedMilestones} / ${project.milestones.length}`,
      hint: `${project.milestones.length - approvedMilestones} remaining`,
    },
    {
      label: 'Tasks Completed',
      value: `${completedTasks} / ${totalTasks}`,
      hint: `${overallProgress}% task completion`,
    },
    {
      label: 'Weekly Journals',
      value: String(project.journals.length),
      hint: project.journals[0] ? `Latest: Week ${project.journals[0].weekNumber}` : 'No entries yet',
    },
    {
      label: 'Revision Requests',
      value: String(pendingRevisions),
      hint: pendingRevisions > 0 ? 'Requires student response' : 'All submissions clear',
    },
  ];

  const milestonesWithTaskCounts = useMemo(() => {
    return project.milestones.map((ms) => {
      const msTasks = project.tasks.filter((t) => t.milestoneId === ms.id);
      const msDone = msTasks.filter((t) => t.completed).length;
      return { ...ms, tasksDone: msDone, tasksTotal: msTasks.length };
    });
  }, [project.milestones, project.tasks]);

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
    const overdue = project.tasks.filter(
      (t) => !t.completed && t.dueDate && t.dueDate < '2026-11-14'
    ).length;
    const openOnTime = totalTasks - completedTasks - overdue;
    return [
      { label: 'Completed', value: completedTasks, color: '#10B981' },
      { label: 'Open On Track', value: Math.max(0, openOnTime), color: '#2563EB' },
      { label: 'Overdue', value: overdue, color: '#DC2626' },
    ];
  }, [project.tasks, totalTasks, completedTasks]);

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
      { label: 'W8+', value: project.journals.length + project.submissions.length },
    ];
  }, [project.journals.length, project.submissions.length]);

  const hasActiveMilestoneFilters =
    statusFilter !== 'All' || searchQuery.trim() !== '' || sortBy !== 'due_asc';

  return (
    <PortalLayout navItems={getPortalNavItems('student')}>
      <Stage2Banner
        portalName="Student Portal"
        tenantLabel={institutionName}
        loadingPreview={loadingPreview}
        onToggleLoadingPreview={setLoadingPreview}
      />

      {loadingPreview ? (
        <DashboardSkeleton variant="full" />
      ) : (
        <>
          {/* Assigned Academic Project Overview */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1.5">
                <p className="font-mono text-xs font-medium text-[#2563EB] tabular-nums">
                  {project.code} · {project.academicSession}
                </p>
                <h1 className="font-display text-xl sm:text-2xl font-bold text-[#172554] leading-snug text-balance">
                  {project.title}
                </h1>
                <p className="text-xs sm:text-sm text-[#64748B]">
                  {project.department} · {project.programme}
                </p>
              </div>
              <div className="shrink-0 sm:text-right">
                <p className="text-xs text-[#64748B]">Task Completion</p>
                <p className="font-display text-2xl font-bold text-[#172554] tabular-nums">
                  {overallProgress}%
                </p>
              </div>
            </div>

            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-[#2563EB] transition-all duration-300"
                style={{ width: `${overallProgress}%` }}
              />
            </div>

            <div className="grid grid-cols-1 gap-3 border-t border-slate-100 pt-4 text-xs sm:grid-cols-2 sm:text-sm">
              <div className="flex items-center gap-2 text-[#64748B]">
                <User className="h-4 w-4 text-[#2563EB] shrink-0" aria-hidden="true" />
                <span>
                  Supervisor: <strong className="text-[#172554]">{project.supervisorName}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2 text-[#64748B] sm:justify-end">
                <Calendar className="h-4 w-4 text-[#2563EB] shrink-0" aria-hidden="true" />
                <span className="tabular-nums">
                  Next deadline: <strong className="text-[#172554]">{project.nextDeadline}</strong>{' '}
                  <span className="text-xs text-[#2563EB] font-semibold">
                    (
                    {Math.max(
                      0,
                      Math.ceil(
                        (new Date(project.nextDeadline).getTime() -
                          new Date('2026-11-14').getTime()) /
                          (1000 * 60 * 60 * 24)
                      )
                    )}{' '}
                    days left)
                  </span>
                </span>
              </div>
            </div>
          </section>

          {/* 4 KPI Summary Cards */}
          <section
            aria-label="Project progress metrics"
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            {metrics.map((metric) => (
              <StatCard
                key={metric.label}
                label={metric.label}
                value={metric.value}
                hint={metric.hint}
              />
            ))}
          </section>

          {/* Dashboard Analytics */}
          <section
            aria-label="Student project analytics"
            className="grid grid-cols-1 gap-4 lg:grid-cols-3"
          >
            <BreakdownDonut
              title="Task Status Breakdown"
              subtitle="Completed vs. open and overdue tasks"
              segments={taskSegments}
            />
            <HorizontalBarChart
              title="Milestone Progress"
              subtitle="Completion across project stages"
              items={milestoneBars}
            />
            <ActivityCadenceChart
              title="Weekly Research Activity"
              subtitle="Journals & chapter submissions logged"
              bars={cadenceBars}
            />
          </section>

          {/* Milestones & Progress Breakdown */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-display text-lg font-bold text-[#172554]">
                  Project Milestones
                </h2>
                <p className="text-xs text-[#64748B]">
                  Track deliverables, due dates, and supervisor sign-off status.
                </p>
              </div>

              <Link
                to="/student/tasks"
                className="text-xs font-semibold text-[#2563EB] hover:underline whitespace-nowrap"
              >
                Manage tasks →
              </Link>
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
                <div className="divide-y divide-slate-100 md:hidden">
                  {filteredMilestones.map((ms) => (
                    <div key={ms.id} className="py-3.5 first:pt-0 last:pb-0 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-[#172554] leading-snug">
                          {ms.title}
                        </p>
                        <StatusLabel status={ms.status} />
                      </div>
                      <div className="flex items-center justify-between text-xs text-[#64748B] tabular-nums">
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
                      <tr className="border-b border-slate-200 text-xs font-semibold text-[#64748B]">
                        <th className="py-2.5 pr-4">Milestone</th>
                        <th className="py-2.5 px-4">Due Date</th>
                        <th className="py-2.5 px-4 text-right">Tasks</th>
                        <th className="py-2.5 pl-4 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredMilestones.map((ms) => (
                        <tr key={ms.id} className="hover:bg-slate-50/70">
                          <td className="py-3 pr-4 font-medium text-[#172554]">{ms.title}</td>
                          <td className="py-3 px-4 font-mono text-xs text-[#64748B] tabular-nums">
                            {ms.dueDate}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-xs text-[#172554] tabular-nums">
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

          {/* Live Activity Feed Stream */}
          <ActivityFeedStream
            title="Recent Activity Stream & Feedback Logs"
            subtitle="Live log of your task updates, chapter uploads, journals, and supervisor reviews."
          />
        </>
      )}
    </PortalLayout>
  );
}
