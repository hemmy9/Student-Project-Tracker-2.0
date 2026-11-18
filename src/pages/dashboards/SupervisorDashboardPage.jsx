import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, FileCheck2 } from 'lucide-react';
import ActivityFeedStream from '../../components/dashboard/ActivityFeedStream';
import AiProjectCopilot from '../../components/dashboard/AiProjectCopilot';
import { BreakdownDonut, HorizontalBarChart } from '../../components/dashboard/AnalyticsPanel';
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
  GRACE_INSTITUTION_NAME,
  resolveInstitutionKey,
  resolveWorkspaceInstitution,
  useDemoAppState,
} from '../../context/DemoAppStateContext';
import { useDemoSession } from '../../context/DemoSessionContext';
import { getPortalNavItems } from '../../utils/roleRouting';

const COHORT_FILTERS = ['All', 'Needs Attention', 'Review Ready', 'On Track'];
const COHORT_SORTS = [
  { value: 'progress_asc', label: 'Progress (Lowest First)' },
  { value: 'progress_desc', label: 'Progress (Highest First)' },
  { value: 'name_asc', label: 'Student Name (A–Z)' },
];

export default function SupervisorDashboardPage() {
  const { activeMembership, session } = useDemoSession();
  const { state } = useDemoAppState();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('progress_asc');
  const [loadingPreview, setLoadingPreview] = useState(false);

  const institutionName = resolveWorkspaceInstitution(activeMembership, session);
  const projectKey = resolveInstitutionKey(state.projectsByInstitution, institutionName);
  const primaryProj = projectKey ? state.projectsByInstitution[projectKey] : null;
  const isGraceWorkspace = institutionName === GRACE_INSTITUTION_NAME;

  const assignedStudents = useMemo(() => {
    const list = [];
    if (primaryProj) {
      const doneTasks = primaryProj.tasks.filter((t) => t.completed).length;
      const progress =
        primaryProj.tasks.length > 0
          ? Math.round((doneTasks / primaryProj.tasks.length) * 100)
          : 0;
      const hasPendingReview = primaryProj.submissions.some((s) => s.status === 'Pending Review');
      list.push({
        id: 'stu-1',
        name: primaryProj.studentName,
        studentCode: primaryProj.code || 'GP-CSC-2026-014',
        programme: primaryProj.programme,
        projectTitle: primaryProj.title,
        progress,
        lastJournal: primaryProj.journals[0]?.date || '—',
        attentionStatus: hasPendingReview ? 'Review Ready' : 'On Track',
        pendingItem: hasPendingReview
          ? 'Submitted chapter awaiting supervisor decision'
          : 'Progressing on schedule',
      });
    }
    if (isGraceWorkspace) {
      list.push(...state.supervisorExtraStudents);
    }
    return list;
  }, [primaryProj, isGraceWorkspace, state.supervisorExtraStudents]);

  const reviewQueue = useMemo(() => {
    const liveQueue = (primaryProj?.submissions || []).map((s) => ({
      id: s.id,
      studentName: primaryProj.studentName,
      documentTitle: `${s.title} (${s.version})`,
      submittedAt: s.submittedAt,
      status: s.status,
    }));
    return isGraceWorkspace ? [...liveQueue, ...state.supervisorExtraSubmissions] : liveQueue;
  }, [primaryProj, isGraceWorkspace, state.supervisorExtraSubmissions]);

  const pendingReviewsCount = reviewQueue.filter((r) => r.status === 'Pending Review').length;
  const studentsNeedingAttention = assignedStudents.filter(
    (s) => s.attentionStatus === 'Needs Attention'
  );

  const cohortSegments = useMemo(() => {
    const onTrack = assignedStudents.filter((s) => s.attentionStatus === 'On Track').length;
    const reviewReady = assignedStudents.filter((s) => s.attentionStatus === 'Review Ready').length;
    return [
      { label: 'On Track', value: onTrack, color: '#10B981' },
      { label: 'Review Ready', value: reviewReady, color: '#2563EB' },
      { label: 'Needs Attention', value: studentsNeedingAttention.length, color: '#DC2626' },
    ];
  }, [assignedStudents, studentsNeedingAttention.length]);

  const cohortBars = useMemo(() => {
    return assignedStudents.map((s) => ({
      label: s.name,
      percent: s.progress,
      valueLabel: `${s.progress}%`,
      color: s.attentionStatus === 'Needs Attention' ? '#DC2626' : '#2563EB',
    }));
  }, [assignedStudents]);

  const metrics = [
    {
      label: 'Assigned Students',
      value: String(assignedStudents.length),
      hint: 'Active academic projects in cohort',
    },
    {
      label: 'Pending Reviews',
      value: String(pendingReviewsCount),
      hint: 'Submitted drafts awaiting decision',
    },
    {
      label: 'Need Attention',
      value: String(studentsNeedingAttention.length),
      hint: 'Missed journals or overdue drafts',
    },
    {
      label: 'Journal Entries',
      value: String(primaryProj?.journals?.length || 0),
      hint: 'Logged for primary supervised project',
    },
  ];

  const filteredStudents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = assignedStudents.filter((stu) => {
      const matchesStatus = statusFilter === 'All' || stu.attentionStatus === statusFilter;
      const matchesQuery =
        !q ||
        stu.name.toLowerCase().includes(q) ||
        stu.studentCode.toLowerCase().includes(q) ||
        stu.projectTitle.toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
    return [...list].sort((a, b) => {
      if (sortBy === 'progress_desc') return b.progress - a.progress;
      if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
      return a.progress - b.progress;
    });
  }, [assignedStudents, searchQuery, statusFilter, sortBy]);

  const hasActiveCohortFilters =
    statusFilter !== 'All' || searchQuery.trim() !== '' || sortBy !== 'progress_asc';

  const officeKey = resolveInstitutionKey(state.officeHoursByInstitution, institutionName);
  const officeHoursData = (officeKey && state.officeHoursByInstitution?.[officeKey]) || {
    availabilitySlots: [],
    bookings: [],
  };

  const aiContextData = useMemo(
    () => ({
      institutionName,
      assignedStudents: assignedStudents.map((s) => ({
        name: s.name,
        progress: s.progress,
        status: s.attentionStatus,
        pendingItem: s.pendingItem,
        lastJournal: s.lastJournal,
      })),
      pendingDocumentReviews: reviewQueue.filter((r) => r.status === 'Pending Review'),
      primaryProjectMilestones: (primaryProj?.milestones || []).map((m) => ({
        title: m.title,
        status: m.status,
        dueDate: m.dueDate,
      })),
      officeHourBookings: officeHoursData.bookings,
    }),
    [institutionName, assignedStudents, reviewQueue, primaryProj, officeHoursData.bookings]
  );

  return (
    <PortalLayout navItems={getPortalNavItems('supervisor')}>
      <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-12">
          <Stage2Banner
            portalName="Supervisor Portal"
            tenantLabel={institutionName || 'Supervisor Workspace'}
            loadingPreview={loadingPreview}
            onToggleLoadingPreview={setLoadingPreview}
          />
        </div>

        {loadingPreview ? (
          <div className="lg:col-span-12">
            <DashboardSkeleton variant="full" />
          </div>
        ) : (
          <>
            <div className="lg:col-span-12 space-y-1">
              <h1 className="font-display text-2xl font-bold text-[var(--text-primary)]">
                Supervision Overview
              </h1>
              <p className="text-sm text-[var(--text-muted)]">
                {institutionName || 'Academic Tenant'} · {primaryProj?.department || 'Faculty Supervision'}
              </p>
            </div>

            <div className="lg:col-span-12">
              <DeadlineRemindersBanner />
            </div>

            <section
              aria-label="Supervision KPIs"
              className="lg:col-span-12 grid grid-cols-1 gap-4 sm:grid-cols-6 lg:grid-cols-12"
            >
              {metrics.map((metric) => (
                <div key={metric.label} className="sm:col-span-3 lg:col-span-3">
                  <StatCard label={metric.label} value={metric.value} hint={metric.hint} />
                </div>
              ))}
            </section>

            <div className="lg:col-span-12">
              <WidgetErrorBoundary title="Supervision Stats temporarily unavailable">
                <ProjectStatsWidget
                  mode="supervisor"
                  project={primaryProj}
                  cohortStudents={assignedStudents}
                  reviewQueue={reviewQueue}
                  officeHoursData={officeHoursData}
                />
              </WidgetErrorBoundary>
            </div>

            {/* Side-by-side Full Width on PC (>=1024px) */}
            <div className="lg:col-span-7">
              <WidgetErrorBoundary title="Milestones Progress temporarily unavailable">
                <ProgressTrackerWidget
                  title={
                    primaryProj
                      ? `Milestones Progress — ${primaryProj.studentName}`
                      : 'Milestones Progress'
                  }
                  subtitle="Track student-defined phases, weighted progress, and supervisor sign-off status."
                  milestones={primaryProj?.milestones || []}
                  tasks={primaryProj?.tasks || []}
                  nextDeadline={primaryProj?.nextDeadline || ''}
                  managePath="/supervisor/milestones"
                  manageLabel="Review & post milestone feedback"
                  tasksPath="/supervisor/reviews"
                  tasksLabel="Document reviews"
                  compactPhaseGrid
                />
              </WidgetErrorBoundary>
            </div>

            <div className="lg:col-span-5">
              <WidgetErrorBoundary title="Office Hours temporarily unavailable">
                <OfficeHoursWidget roleKey="supervisor" institutionName={institutionName} />
              </WidgetErrorBoundary>
            </div>

            <section
              aria-label="Supervision cohort analytics"
              className="lg:col-span-12 grid grid-cols-1 gap-4 lg:grid-cols-12"
            >
              <div className="lg:col-span-6">
                <BreakdownDonut
                  title="Cohort Health Distribution"
                  subtitle="Students on track, awaiting review, or flagged"
                  segments={cohortSegments}
                />
              </div>
              <div className="lg:col-span-6">
                <HorizontalBarChart
                  title="Student Progress Comparison"
                  subtitle="Completion percentage across assigned cohort"
                  items={cohortBars}
                />
              </div>
            </section>

            {/* Priority Attention Queue */}
            <section className="lg:col-span-12 spt-surface rounded-2xl border-red-200 dark:border-red-900/60 p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                  <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <h2 className="font-display text-base font-bold text-[var(--text-primary)]">
                    Students Needing Attention ({studentsNeedingAttention.length})
                  </h2>
                </div>
                <Link
                  to="/supervisor/students"
                  className="text-xs font-semibold text-[var(--accent-primary)] hover:underline"
                >
                  Inspect cohort →
                </Link>
              </div>

              {studentsNeedingAttention.length === 0 ? (
                <p className="text-xs text-[var(--text-muted)]">
                  No students are currently flagged for overdue journals or stalled deliverables.
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {studentsNeedingAttention.map((stu) => (
                    <div
                      key={stu.id}
                      className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4 space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-bold text-[var(--text-primary)]">{stu.name}</p>
                        <span className="font-mono text-xs text-[var(--text-muted)] tabular-nums">
                          {stu.progress}%
                        </span>
                      </div>
                      <p className="text-xs text-[var(--text-muted)]">{stu.projectTitle}</p>
                      <p className="text-xs font-semibold text-red-700 dark:text-red-400 pt-1">
                        {stu.pendingItem}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Assigned Students Cohort */}
            <section className="lg:col-span-12 spt-surface rounded-2xl p-5 sm:p-6 space-y-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-display text-lg font-bold text-[var(--text-primary)]">
                    Assigned Students &amp; Projects
                  </h2>
                  <p className="text-xs text-[var(--text-muted)]">
                    Monitor milestone progress, weekly check-ins, and review readiness.
                  </p>
                </div>
                <Link
                  to="/supervisor/students"
                  className="text-xs font-semibold text-[var(--accent-primary)] hover:underline whitespace-nowrap"
                >
                  Open cohort workspace →
                </Link>
              </div>

              <SmartDashboardFilters
                searchValue={searchQuery}
                onSearchChange={setSearchQuery}
                searchPlaceholder="Search student, code, or project title..."
                filterOptions={COHORT_FILTERS}
                activeFilter={statusFilter}
                onFilterChange={setStatusFilter}
                sortOptions={COHORT_SORTS}
                activeSort={sortBy}
                onSortChange={setSortBy}
                summaryText={`Showing ${filteredStudents.length} of ${assignedStudents.length} assigned students`}
                hasActiveFilters={hasActiveCohortFilters}
                onReset={() => {
                  setSearchQuery('');
                  setStatusFilter('All');
                  setSortBy('progress_asc');
                }}
              />

              {filteredStudents.length === 0 ? (
                <EmptyState
                  title="No matching students found"
                  description="Try clearing your search term or selecting All students."
                  actionLabel="Reset filters"
                  onAction={() => {
                    setSearchQuery('');
                    setStatusFilter('All');
                  }}
                />
              ) : (
                <>
                  <div className="divide-y divide-[var(--border-subtle)] md:hidden">
                    {filteredStudents.map((stu) => (
                      <div key={stu.id} className="py-4 first:pt-0 last:pb-0 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-bold text-[var(--text-primary)]">{stu.name}</p>
                            <p className="font-mono text-xs text-[var(--text-muted)] tabular-nums">
                              {stu.studentCode} · {stu.programme}
                            </p>
                          </div>
                          <StatusLabel status={stu.attentionStatus} />
                        </div>
                        <p className="text-xs text-[var(--text-primary)] leading-relaxed">
                          {stu.projectTitle}
                        </p>
                        <div className="flex items-center justify-between text-xs text-[var(--text-muted)] tabular-nums">
                          <span>Progress: {stu.progress}%</span>
                          <span>Last journal: {stu.lastJournal}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-muted)]">
                          <th className="py-2.5 pr-4">Student</th>
                          <th className="py-2.5 px-4">Project</th>
                          <th className="py-2.5 px-4 text-right">Progress</th>
                          <th className="py-2.5 px-4">Last Journal</th>
                          <th className="py-2.5 pl-4 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border-subtle)]">
                        {filteredStudents.map((stu) => (
                          <tr key={stu.id} className="hover:bg-[var(--bg-elevated)]/60">
                            <td className="py-3 pr-4">
                              <p className="font-semibold text-[var(--text-primary)]">{stu.name}</p>
                              <p className="font-mono text-xs text-[var(--text-muted)] tabular-nums">
                                {stu.studentCode}
                              </p>
                            </td>
                            <td className="py-3 px-4 max-w-xs">
                              <p className="text-xs font-medium text-[var(--text-primary)] line-clamp-2">
                                {stu.projectTitle}
                              </p>
                            </td>
                            <td className="py-3 px-4 text-right font-mono text-xs font-semibold text-[var(--text-primary)] tabular-nums">
                              {stu.progress}%
                            </td>
                            <td className="py-3 px-4 font-mono text-xs text-[var(--text-muted)] tabular-nums">
                              {stu.lastJournal}
                            </td>
                            <td className="py-3 pl-4 text-right">
                              <StatusLabel status={stu.attentionStatus} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </section>

            {/* Document Review Queue */}
            <section className="lg:col-span-12 spt-surface rounded-2xl p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileCheck2 className="h-4 w-4 text-[var(--accent-primary)]" aria-hidden="true" />
                  <h2 className="font-display text-lg font-bold text-[var(--text-primary)]">
                    Submitted Document Review Queue
                  </h2>
                </div>
                <Link
                  to="/supervisor/reviews"
                  className="text-xs font-semibold text-[var(--accent-primary)] hover:underline"
                >
                  Open review queue →
                </Link>
              </div>

              {reviewQueue.length === 0 ? (
                <p className="text-xs text-[var(--text-muted)]">No submitted documents awaiting review.</p>
              ) : (
                <div className="divide-y divide-[var(--border-subtle)]">
                  {reviewQueue.slice(0, 4).map((doc) => (
                    <div
                      key={doc.id}
                      className="py-3.5 first:pt-0 last:pb-0 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="space-y-0.5">
                        <p className="text-sm font-semibold text-[var(--text-primary)]">
                          {doc.documentTitle}
                        </p>
                        <p className="text-xs text-[var(--text-muted)] tabular-nums">
                          Submitted by {doc.studentName} · {doc.submittedAt}
                        </p>
                      </div>
                      <StatusLabel status={doc.status} />
                    </div>
                  ))}
                </div>
              )}
            </section>

            <div className="lg:col-span-6">
              <WidgetErrorBoundary title="AI Supervision Copilot temporarily unavailable">
                <AiProjectCopilot
                  roleKey="supervisor"
                  institutionName={institutionName}
                  contextData={aiContextData}
                  title="AI Supervision Copilot"
                  subtitle="Cohort risk triage, review queue prioritization, and consultation prep powered by Gemini."
                />
              </WidgetErrorBoundary>
            </div>

            <div className="lg:col-span-6">
              <WidgetErrorBoundary title="Cohort Activity Feed temporarily unavailable">
                <ActivityFeedStream
                  title="Cohort Activity Feed & Recent Logs"
                  subtitle="Live student uploads, journal logs, and supervision events."
                />
              </WidgetErrorBoundary>
            </div>
          </>
        )}
      </div>
    </PortalLayout>
  );
}

