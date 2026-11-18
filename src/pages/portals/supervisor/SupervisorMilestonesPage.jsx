import { useMemo, useState } from 'react';
import { CheckCircle2, Flag, MessageSquare, Send, Sparkles } from 'lucide-react';
import StatusLabel from '../../../components/dashboard/StatusLabel';
import PortalLayout from '../../../components/layout/PortalLayout';
import Button from '../../../components/ui/Button';
import EmptyState from '../../../components/ui/EmptyState';
import StatusAlert from '../../../components/ui/StatusAlert';
import {
  resolveInstitutionKey,
  resolveWorkspaceInstitution,
  useDemoAppState,
} from '../../../context/DemoAppStateContext';
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

  const institutionName = resolveWorkspaceInstitution(activeMembership, session);
  const projectKey = resolveInstitutionKey(state.projectsByInstitution, institutionName);
  const project = projectKey ? state.projectsByInstitution[projectKey] : null;
  const mutationInstitution = projectKey || institutionName;

  const [filter, setFilter] = useState('All');
  const [commentDrafts, setCommentDrafts] = useState({});
  const [statusDrafts, setStatusDrafts] = useState({});
  const [banner, setBanner] = useState('');
  const [errorBanner, setErrorBanner] = useState('');

  const milestones = project?.milestones || [];
  const tasks = project?.tasks || [];

  const enrichedMilestones = useMemo(() => {
    return milestones.map((ms, idx) => {
      const linkedTasks = tasks.filter((t) => t.milestoneId === ms.id);
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
  }, [milestones, tasks]);

  const filteredMilestones = useMemo(() => {
    if (filter === 'All') return enrichedMilestones;
    return enrichedMilestones.filter((m) => m.status === filter);
  }, [enrichedMilestones, filter]);

  if (!project) {
    return (
      <PortalLayout navItems={getPortalNavItems('supervisor')}>
        <EmptyState
          icon={Flag}
          title="No supervised milestone workspace"
          description={`No project milestones are assigned to your supervision workspace under ${institutionName}. Switch institution membership or reset demo data if needed.`}
        />
      </PortalLayout>
    );
  }

  const handleSubmitFeedback = (ms, forcedStatus = null) => {
    const comment = (commentDrafts[ms.id] || '').trim();
    const nextStatus = forcedStatus || statusDrafts[ms.id] || ms.status;

    if (comment.length < 5) {
      setErrorBanner('Write at least 5 characters of supervisor feedback before saving.');
      setBanner('');
      return;
    }

    setErrorBanner('');
    addMilestoneFeedback(mutationInstitution, ms.id, {
      authorName: session?.fullName || project.supervisorName,
      authorRole: 'supervisor',
      comment,
      nextStatus,
    });

    setCommentDrafts((prev) => ({ ...prev, [ms.id]: '' }));
    setBanner(`Feedback recorded on "${ms.title}" (${nextStatus}) and synced to ${project.studentName}.`);
    showToast({
      type: 'success',
      title: 'Milestone feedback saved',
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
        <p className="font-mono text-xs font-medium text-[var(--accent-primary)]">
          {project.code} · {institutionName}
        </p>
        <h1 className="font-display text-2xl font-bold text-[var(--text-primary)]">
          Project Milestones &amp; Supervisor Feedback
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
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

      <div className="spt-surface rounded-2xl p-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs text-[var(--text-muted)]">Supervised Project</p>
          <p className="font-display text-base font-bold text-[var(--text-primary)]">{project.title}</p>
          <p className="text-xs text-[var(--text-secondary)]">
            Student: <strong className="text-[var(--text-primary)]">{project.studentName}</strong> ·{' '}
            {project.programme}
          </p>
        </div>

        <div className="flex items-center gap-1 overflow-x-auto rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`min-h-[34px] rounded-md px-2.5 text-xs font-medium whitespace-nowrap cursor-pointer transition-colors ${
                filter === f
                  ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
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
                className="spt-surface rounded-2xl p-5 sm:p-6 space-y-4"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="inline-flex h-6 px-2 items-center rounded-md bg-[var(--accent-primary)] font-mono font-bold text-white tabular-nums">
                        Phase {ms.phaseNumber}
                      </span>
                      <span className="font-mono font-semibold text-[var(--accent-primary)] tabular-nums">
                        Weight: {ms.weightPercent}%
                      </span>
                      <span className="font-mono text-[var(--text-muted)] tabular-nums">
                        Due {ms.dueDate}
                      </span>
                    </div>
                    <h2 className="font-display text-lg font-bold text-[var(--text-primary)]">
                      {ms.title}
                    </h2>
                  </div>
                  <StatusLabel status={ms.status} />
                </div>

                {ms.description && (
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    {ms.description}
                  </p>
                )}

                <div className="flex items-center justify-between rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-4 py-2.5 text-xs text-[var(--text-secondary)] tabular-nums">
                  <span>
                    Task Progress: {ms.doneTasks} / {ms.totalTasks} linked tasks completed
                  </span>
                  <span className="font-mono font-bold text-[var(--text-primary)]">{ms.pct}%</span>
                </div>

                {ms.feedbackEntries.length > 0 && (
                  <div className="space-y-2">
                    <p className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-primary)]">
                      <MessageSquare className="h-3.5 w-3.5 text-[var(--accent-primary)]" aria-hidden="true" />
                      <span>Recorded Milestone Thread ({ms.feedbackEntries.length})</span>
                    </p>
                    <div className="space-y-2">
                      {ms.feedbackEntries.map((fb) => (
                        <div
                          key={fb.id}
                          className={`rounded-xl border p-3 text-xs space-y-1 ${
                            fb.authorRole === 'supervisor'
                              ? 'border-blue-500/30 bg-blue-500/10'
                              : 'border-[var(--border-subtle)] bg-[var(--bg-elevated)]'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-[var(--text-primary)]">
                              {fb.authorName} · {fb.statusSnapshot}
                            </span>
                            <span className="font-mono text-[11px] text-[var(--text-muted)] tabular-nums">
                              {fb.createdAt}
                            </span>
                          </div>
                          <p className="text-[var(--text-primary)] leading-relaxed">{fb.comment}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="border-t border-[var(--border-subtle)] pt-4 space-y-3">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <label
                      htmlFor={`ms-fb-${ms.id}`}
                      className="text-xs font-semibold text-[var(--text-primary)]"
                    >
                      Supervisor feedback for {project.studentName}
                    </label>
                    <select
                      aria-label={`Milestone decision status for ${ms.title}`}
                      value={selectedStatus}
                      onChange={(e) =>
                        setStatusDrafts((prev) => ({ ...prev, [ms.id]: e.target.value }))
                      }
                      className="min-h-[38px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 text-base sm:text-xs font-medium text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-none"
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
                    className="w-full rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 py-2 text-base sm:text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-primary)] focus:outline-none"
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
                      <Sparkles className="h-3.5 w-3.5 inline mr-1.5 text-[var(--accent-primary)]" aria-hidden="true" />
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

