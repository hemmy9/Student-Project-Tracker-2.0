import { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Search } from 'lucide-react';
import StatusLabel from '../../../components/dashboard/StatusLabel';
import PortalLayout from '../../../components/layout/PortalLayout';
import EmptyState from '../../../components/ui/EmptyState';
import StatusAlert from '../../../components/ui/StatusAlert';
import { useDemoAppState } from '../../../context/DemoAppStateContext';
import { useDemoSession } from '../../../context/DemoSessionContext';
import { getPortalNavItems } from '../../../utils/roleRouting';

export default function SupervisorStudentsPage() {
  const { activeMembership } = useDemoSession();
  const { state, updateMilestoneStatus } = useDemoAppState();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [notice, setNotice] = useState('');

  const institutionName = activeMembership?.institutionName || 'University of Westbridge';
  const liveProject = state.projectsByInstitution['University of Westbridge'];
  const completedTasks = liveProject.tasks.filter((t) => t.completed).length;
  const livePct = liveProject.tasks.length
    ? Math.round((completedTasks / liveProject.tasks.length) * 100)
    : 68;

  const students = useMemo(() => {
    const primaryStudent = {
      id: 'stu-live-1',
      name: liveProject.studentName,
      studentCode: liveProject.code,
      programme: liveProject.programme,
      projectTitle: liveProject.title,
      progress: livePct,
      lastJournal: liveProject.journals[0]?.date || '2026-11-10',
      attentionStatus: liveProject.submissions.some((s) => s.status === 'Pending Review')
        ? 'Review Ready'
        : 'On Track',
      pendingItem: `${liveProject.submissions.length} submissions · ${completedTasks}/${liveProject.tasks.length} tasks`,
    };
    return [primaryStudent, ...state.supervisorExtraStudents];
  }, [liveProject, livePct, completedTasks, state.supervisorExtraStudents]);

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

  const handleMilestoneChange = (ms, nextStatus) => {
    updateMilestoneStatus('University of Westbridge', ms.id, nextStatus);
    setNotice(`Milestone "${ms.title}" updated to ${nextStatus} and student notified.`);
  };

  return (
    <PortalLayout navItems={getPortalNavItems('supervisor')}>
      <div className="space-y-1">
        <p className="font-mono text-xs font-medium text-[#2563EB]">{institutionName}</p>
        <h1 className="font-display text-2xl font-bold text-[#172554]">
          Assigned Students &amp; Milestone Sign-Off
        </h1>
        <p className="text-sm text-[#64748B]">
          Monitor supervised projects, update milestone approvals, and track students needing timely intervention.
        </p>
      </div>

      {notice && (
        <StatusAlert type="success" title="Milestone updated">
          {notice}
        </StatusAlert>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-xs">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]"
              aria-hidden="true"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search student or code..."
              className="w-full min-h-[44px] rounded-lg border border-slate-300 pl-9 pr-3 text-base sm:text-sm text-[#172554] focus:border-[#2563EB] focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto rounded-lg border border-slate-200 bg-slate-100 p-1">
            {['All', 'Needs Attention', 'Review Ready', 'On Track'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setFilter(tab)}
                className={`min-h-[36px] rounded-md px-3 text-xs font-medium whitespace-nowrap cursor-pointer ${
                  filter === tab ? 'bg-white text-[#172554] shadow-xs' : 'text-[#64748B]'
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
          <div className="divide-y divide-slate-100">
            {filtered.map((stu) => (
              <div key={stu.id} className="py-4 first:pt-0 last:pb-0 space-y-2">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-base font-bold text-[#172554]">{stu.name}</p>
                    <p className="font-mono text-xs text-[#64748B] tabular-nums">
                      {stu.studentCode} · {stu.programme}
                    </p>
                  </div>
                  <StatusLabel status={stu.attentionStatus} />
                </div>

                <p className="text-sm font-medium text-[#172554]">{stu.projectTitle}</p>

                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#64748B] tabular-nums">
                  <span>Progress: {stu.progress}% · Last journal: {stu.lastJournal}</span>
                  {stu.attentionStatus === 'Needs Attention' ? (
                    <span className="inline-flex items-center gap-1 font-semibold text-red-700">
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
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-[#2563EB]" aria-hidden="true" />
          <div>
            <h2 className="font-display text-lg font-bold text-[#172554]">
              Milestone Sign-Off Tracker · {liveProject.studentName}
            </h2>
            <p className="text-xs text-[#64748B]">
              Update milestone approval status directly; changes sync to {liveProject.studentName}’s Student Portal.
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {liveProject.milestones.map((ms) => (
            <div
              key={ms.id}
              className="py-3.5 first:pt-0 last:pb-0 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="space-y-0.5">
                <p className="text-sm font-semibold text-[#172554]">{ms.title}</p>
                <p className="font-mono text-xs text-[#64748B] tabular-nums">Due {ms.dueDate}</p>
              </div>
              <div className="flex items-center gap-3">
                <StatusLabel status={ms.status} />
                <select
                  aria-label={`Update status for ${ms.title}`}
                  value={ms.status}
                  onChange={(e) => handleMilestoneChange(ms, e.target.value)}
                  className="min-h-[40px] rounded-lg border border-slate-300 bg-white px-3 text-base sm:text-xs font-medium text-[#172554] focus:border-[#2563EB] focus:outline-none"
                >
                  <option value="In Progress">In Progress</option>
                  <option value="Revision Requested">Revision Requested</option>
                  <option value="Approved">Approved</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      </section>
    </PortalLayout>
  );
}
