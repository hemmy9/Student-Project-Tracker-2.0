import { useMemo, useState } from 'react';
import { CheckCircle2, Flag, MessageSquare, Send, Sparkles } from 'lucide-react';
import StatusLabel from '../../../components/dashboard/StatusLabel';
import PortalLayout from '../../../components/layout/PortalLayout';
import Button from '../../../components/ui/Button';
import EmptyState from '../../../components/ui/EmptyState';
import StatusAlert from '../../../components/ui/StatusAlert';
import { useDemoAppState } from '../../../context/DemoAppStateContext';
import { useDemoSession } from '../../../context/DemoSessionContext';
import { useToast } from '../../../context/ToastContext';
import { useAiAssistant } from '../../../hooks/useAiAssistant';
import { getPortalNavItems } from '../../../utils/roleRouting';

const FILTERS = ['All', 'Pending Review', 'Revision Requested', 'In Progress', 'Approved'];

export default function SupervisorMilestonesPage() {
  const { session, activeMembership } = useDemoSession();
  const { showToast } = useToast();
  const { state, addMilestoneFeedback } = useDemoAppState();
  const { draftLoading, generateDraft } = useAiAssistant();

  const institutionName = activeMembership?.institutionName || 'University of Westbridge';
  const project =
    state.projectsByInstitution[institutionName] ||
    state.projectsByInstitution['University of Westbridge'];

  const [filter, setFilter] = useState('All');
  const [commentDrafts, setCommentDrafts] = useState({});
  const [statusDrafts, setStatusDrafts] = useState({});
  const [banner, setBanner] = useState('');
  const [errorBanner, setErrorBanner] = useState('');

  const enrichedMilestones = useMemo(() => {
    return project.milestones.map((ms, idx) => {
      const linkedTasks = project.tasks.filter((t) => t.milestoneId === ms.id);
      const doneTasks = linkedTasks.filter((t) => t.completed).length;
      const pct =
        linkedTasks.length > 0
          ? Math.round((doneTasks / linkedTasks.length) * 100)
          : ms.status === 'Approved'
            ? 100
            : 0;
      return {
        ...ms,
        phaseNumber: ms.phaseNumber || idx + 1,
        weightPercent: ms.weightPercent ?? 20,
        feedbackEntries: ms.feedbackEntries || [],
        doneTasks,
        totalTasks: linkedTasks.length,
        pct,
      };
    });
  }, [project.milestones, project.tasks]);

  const filteredMilestones = useMemo(() => {
    if (filter === 'All') return enrichedMilestones;
    return enrichedMilestones.filter((m) => m.status === filter);
  }, [enrichedMilestones, filter]);

  const handleSubmitFeedback = (ms, forcedStatus = null) => {
    const comment = (commentDrafts[ms.id] || '').trim();
    const nextStatus = forcedStatus || statusDrafts[ms.id] || ms.status;

    if (comment.length < 5) {
      setErrorBanner('Write at least 5 characters of supervisor feedback before saving.');
      setBanner('');
      return;
    }

    setErrorBanner('');
    addMilestoneFeedback(institutionName, ms.id, {
      authorName: session?.fullName || project.supervisorName,
      authorRole: 'supervisor',
      comment,
      nextStatus,
    });

    setCommentDrafts((prev) => ({ ...prev, [ms.id]: '' }));
    setBanner(`Feedback recorded on "${ms.title}" (${nextStatus}) and synced to ${project.studentName}.`);
    showToast({
      type: 'success',
      title: `Milestone feedback saved`,
      message: `${ms.title} → ${nextStatus}`,
    });
  };

  const handleDraftFeedback = async (ms) => {
    const draft = await generateDraft({
      draftType: 'milestone_feedback',
      contextData: {
        studentName: project.studentName,
        projectTitle: project.title,
        milestoneTitle: ms.title,
        phaseNumber: ms.phaseNumber,
        weightPercent: ms.weightPercent,
        dueDate: ms.dueDate,
        currentStatus: ms.status,
        completedTasks: ms.doneTasks,
        totalTasks: ms.totalTasks,
        previousNotes: ms.feedbackEntries.slice(0, 2),
      },
    });
    if (draft?.primaryText) {
      setCommentDrafts((prev) => ({ ...prev, [ms.id]: draft.primaryText }));
      setErrorBanner('');
    }
  };

  return (
    <PortalLayout navItems={getPortalNavItems('supervisor')}>
      <div className="space-y-1">
        <p className="font-mono text-xs font-medium text-[#2563EB]">
          {project.code} · {institutionName}
        </p>
        <h1 className="font-display text-2xl font-bold text-[#172554]">
          Project Milestones &amp; Supervisor Feedback
        </h1>
        <p className="text-sm text-[#64748B]">
          Evaluate each student-defined phase for {project.studentName}, post structured milestone feedback, and approve deliverables.
        </p>
      </div>

      {errorBanner && (
        <StatusAlert type="error" title="Feedback required">
          {errorBanner}
        </StatusAlert>
      )}
      {banner && (
        <StatusAlert type="success" title="Synced with Student Portal">
          {banner}
        </StatusAlert>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs text-[#64748B]">Supervised Project</p>
          <p className="font-display text-base font-bold text-[#172554]">{project.title}</p>
          <p className="text-xs text-[#64748B]">
            Student: <strong className="text-[#172554]">{project.studentName}</strong> ·{' '}
            {project.programme}
          </p>
        </div>

        <div className="flex items-center gap-1 overflow-x-auto rounded-lg border border-slate-200 bg-slate-100 p-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`min-h-[34px] rounded-md px-2.5 text-xs font-medium whitespace-nowrap cursor-pointer ${
                filter === f ? 'bg-white text-[#172554] shadow-xs' : 'text-[#64748B]'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {filteredMilestones.length === 0 ? (
        <EmptyState
          icon={Flag}
          title={`No milestones in "${filter}"`}
          description="Select All milestones to review every defined phase."
          actionLabel="Show all phases"
          onAction={() => setFilter('All')}
        />
      ) : (
        <div className="space-y-4">
          {filteredMilestones.map((ms) => {
            const selectedStatus = statusDrafts[ms.id] || ms.status;
            return (
              <article
                key={ms.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="inline-flex h-6 px-2 items-center rounded-md bg-[#172554] font-mono font-bold text-white tabular-nums">
                        Phase {ms.phaseNumber}
                      </span>
                      <span className="font-mono font-semibold text-[#2563EB] tabular-nums">
                        Weight: {ms.weightPercent}%
                      </span>
                      <span className="font-mono text-[#64748B] tabular-nums">
                        Due {ms.dueDate}
                      </span>
                    </div>
                    <h2 className="font-display text-lg font-bold text-[#172554]">{ms.title}</h2>
                  </div>
                  <StatusLabel status={ms.status} />
                </div>

                {ms.description && (
                  <p className="text-sm text-[#64748B] leading-relaxed">{ms.description}</p>
                )}

                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-[#F8FAFC] px-4 py-2.5 text-xs text-[#64748B] tabular-nums">
                  <span>
                    Task Progress: {ms.doneTasks} / {ms.totalTasks} linked tasks completed
                  </span>
                  <span className="font-mono font-bold text-[#172554]">{ms.pct}%</span>
                </div>

                {ms.feedbackEntries.length > 0 && (
                  <div className="space-y-2">
                    <p className="flex items-center gap-1.5 text-xs font-bold text-[#172554]">
                      <MessageSquare className="h-3.5 w-3.5 text-[#2563EB]" aria-hidden="true" />
                      <span>Recorded Milestone Thread ({ms.feedbackEntries.length})</span>
                    </p>
                    <div className="space-y-2">
                      {ms.feedbackEntries.map((fb) => (
                        <div
                          key={fb.id}
                          className={`rounded-xl border p-3 text-xs space-y-1 ${
                            fb.authorRole === 'supervisor'
                              ? 'border-blue-200 bg-blue-50/50'
                              : 'border-slate-200 bg-[#F8FAFC]'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-[#172554]">
                              {fb.authorName} · {fb.statusSnapshot}
                            </span>
                            <span className="font-mono text-[11px] text-[#64748B] tabular-nums">
                              {fb.createdAt}
                            </span>
                          </div>
                          <p className="text-[#172554] leading-relaxed">{fb.comment}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="border-t border-slate-100 pt-4 space-y-3">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <label
                      htmlFor={`ms-fb-${ms.id}`}
                      className="text-xs font-semibold text-[#172554]"
                    >
                      Supervisor feedback for {project.studentName}
                    </label>
                    <select
                      aria-label={`Milestone decision status for ${ms.title}`}
                      value={selectedStatus}
                      onChange={(e) =>
                        setStatusDrafts((prev) => ({ ...prev, [ms.id]: e.target.value }))
                      }
                      className="min-h-[38px] rounded-lg border border-slate-300 bg-white px-3 text-base sm:text-xs font-medium text-[#172554] focus:border-[#2563EB] focus:outline-none"
                    >
                      <option value="In Progress">Status: In Progress</option>
                      <option value="Pending Review">Status: Pending Review</option>
                      <option value="Revision Requested">Status: Revision Requested</option>
                      <option value="Approved">Status: Approved</option>
                    </select>
                  </div>

                  <textarea
                    id={`ms-fb-${ms.id}`}
                    rows={2}
                    value={commentDrafts[ms.id] || ''}
                    onChange={(e) =>
                      setCommentDrafts((prev) => ({ ...prev, [ms.id]: e.target.value }))
                    }
                    placeholder="Provide clear milestone evaluation feedback, strengths, or required revisions..."
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-base sm:text-sm text-[#172554] focus:border-[#2563EB] focus:outline-none"
                  />

                  <div className="flex flex-wrap gap-2.5">
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={() => handleSubmitFeedback(ms)}
                    >
                      <Send className="h-3.5 w-3.5 inline mr-1.5" aria-hidden="true" />
                      Save feedback &amp; status
                    </Button>
                    <Button
                      type="button"
                      variant="navy"
                      size="sm"
                      onClick={() => handleSubmitFeedback(ms, 'Approved')}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 inline mr-1.5" aria-hidden="true" />
                      Approve phase with feedback
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      disabled={draftLoading}
                      onClick={() => handleDraftFeedback(ms)}
                    >
                      <Sparkles className="h-3.5 w-3.5 inline mr-1.5 text-[#2563EB]" aria-hidden="true" />
                      {draftLoading ? 'Drafting...' : 'Draft feedback with AI'}
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </PortalLayout>
  );
}
