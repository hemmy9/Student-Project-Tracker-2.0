import { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Search, Users } from 'lucide-react';
import StatusLabel from '../../../components/dashboard/StatusLabel';
import PortalLayout from '../../../components/layout/PortalLayout';
import EmptyState from '../../../components/ui/EmptyState';
import StatusAlert from '../../../components/ui/StatusAlert';
import {
  GRACE_INSTITUTION_NAME,
  resolveInstitutionKey,
  resolveWorkspaceInstitution,
  useDemoAppState,
} from '../../../context/DemoAppStateContext';
import { useDemoSession } from '../../../context/DemoSessionContext';
import { getPortalNavItems } from '../../../utils/roleRouting';

export default function SupervisorStudentsPage() {
  const { session, activeMembership } = useDemoSession();
  const { state, updateMilestoneStatus } = useDemoAppState();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [notice, setNotice] = useState('');

  const institutionName = resolveWorkspaceInstitution(activeMembership, session);
  const projectKey = resolveInstitutionKey(state.projectsByInstitution, institutionName);
  const liveProject = projectKey ? state.projectsByInstitution[projectKey] : null;
  const mutationInstitution = projectKey || institutionName;
  const extraStudents = useMemo(
    () => (institutionName === GRACE_INSTITUTION_NAME ? state.supervisorExtraStudents : []),
    [institutionName, state.supervisorExtraStudents]
  );

  const tasks = liveProject?.tasks || [];
  const completedTasks = tasks.filter((t) => t.completed).length;
  const livePct = tasks.length
    ? Math.round((completedTasks / tasks.length) * 100)
    : 0;

  const students = useMemo(() => {
    if (!liveProject) return extraStudents;
    const primaryStudent = {
      id: 'stu-live-1',
      name: liveProject.studentName,
      studentCode: liveProject.code,
      programme: liveProject.programme,
      projectTitle: liveProject.title,
      progress: livePct,
      lastJournal: liveProject.journals[0]?.date || 'No entries yet',
      attentionStatus: liveProject.submissions.some((s) => s.status === 'Pending Review')
        ? 'Review Ready'
        : 'On Track',
      pendingItem: `${liveProject.submissions.length} submissions · ${completedTasks}/${liveProject.tasks.length} tasks`,
    };
    return [primaryStudent, ...extraStudents];
  }, [liveProject, livePct, completedTasks, extraStudents]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return students.filter((s) => {
      const matchFilter = filter === 'All' || s.attentionStatus === filter;
      const matchQuery =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.studentCode.toLowerCase().includes(q) ||
        s.projectTitle.toLowerCase().includes(q);
      return matchFilter && matchQuery;
    });
  }, [students, search, filter]);

  if (!liveProject && extraStudents.length === 0) {
    return (
      <PortalLayout navItems={getPortalNavItems('supervisor')}>
        <EmptyState
          icon={Users}
          title="No supervised student projects assigned"
          description={`No student projects are assigned to your supervisor workspace under ${institutionName}. Switch institution membership or reset demo data if needed.`}
        />
      </PortalLayout>
    );
  }

  const handleMilestoneChange = (ms, nextStatus) => {
    updateMilestoneStatus(mutationInstitution, ms.id, nextStatus);
    setNotice(`Milestone "${ms.title}" updated to ${nextStatus} and student notified.`);
  };

  return (
    <PortalLayout navItems={getPortalNavItems('supervisor')}>
      <div className="space-y-1">
        <p className="font-mono text-xs font-medium text-[var(--accent-primary)]">{institutionName}</p>
        <h1 className="font-display text-2xl font-bold text-[var(--text-primary)]">
          Assigned Students &amp; Milestone Sign-Off
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Monitor supervised projects, update milestone approvals, and track students needing timely intervention.
        </p>
      </div>

      {notice && (
        <StatusAlert type="success" title="Milestone updated">
          {notice}
        </StatusAlert>
      )}

      <div className="spt-surface rounded-2xl p-5 space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-xs">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]"
              aria-hidden="true"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search student or code..."
              aria-label="Search assigned students"
              className="w-full min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] pl-9 pr-3 text-base sm:text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-primary)] focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-1">
            {['All', 'Needs Attention', 'Review Ready', 'On Track'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setFilter(tab)}
                className={`min-h-[36px] rounded-md px-3 text-xs font-medium whitespace-nowrap cursor-pointer transition-colors ${
                  filter === tab
                    ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            title="No assigned students match"
            description="Adjust your search or status filter."
            actionLabel="Reset filters"
            onAction={() => {
              setSearch('');
              setFilter('All');
            }}
          />
        ) : (
          <div className="divide-y divide-[var(--border-subtle)]">
            {filtered.map((stu) => (
              <div key={stu.id} className="py-4 first:pt-0 last:pb-0 space-y-2">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-base font-bold text-[var(--text-primary)]">{stu.name}</p>
                    <p className="font-mono text-xs text-[var(--text-muted)] tabular-nums">
                      {stu.studentCode} · {stu.programme}
                    </p>
                  </div>
                  <StatusLabel status={stu.attentionStatus} />
                </div>

                <p className="text-sm font-medium text-[var(--text-primary)]">{stu.projectTitle}</p>

                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--text-secondary)] tabular-nums">
                  <span>Progress: {stu.progress}% · Last journal: {stu.lastJournal}</span>
                  {stu.attentionStatus === 'Needs Attention' ? (
                    <span className="inline-flex items-center gap-1 font-semibold text-red-700 dark:text-red-400">
                      <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                      {stu.pendingItem}
                    </span>
                  ) : (
                    <span>{stu.pendingItem}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Live Supervised Project Milestones Sign-off */}
      {liveProject && (
        <section className="spt-surface rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-[var(--accent-primary)]" aria-hidden="true" />
            <div>
              <h2 className="font-display text-lg font-bold text-[var(--text-primary)]">
                Milestone Sign-Off Tracker · {liveProject.studentName}
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Update milestone approval status directly; changes sync to {liveProject.studentName}’s Student Portal.
              </p>
            </div>
          </div>

          <div className="divide-y divide-[var(--border-subtle)]">
            {liveProject.milestones.map((ms) => (
              <div
                key={ms.id}
                className="py-3.5 first:pt-0 last:pb-0 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="space-y-0.5">
                  <p className="text-sm font-semibold text-[var(--text-primary)]">{ms.title}</p>
                  <p className="font-mono text-xs text-[var(--text-muted)] tabular-nums">
                    Due {ms.dueDate}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusLabel status={ms.status} />
                  <select
                    aria-label={`Update status for ${ms.title}`}
                    value={ms.status}
                    onChange={(e) => handleMilestoneChange(ms, e.target.value)}
                    className="min-h-[40px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 text-base sm:text-xs font-medium text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-none"
                  >
                    <option value="In Progress">In Progress</option>
                    <option value="Pending Review">Pending Review</option>
                    <option value="Revision Requested">Revision Requested</option>
                    <option value="Approved">Approved</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </PortalLayout>
  );
}

