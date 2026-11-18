import { useMemo, useState } from 'react';
import { Calendar, CheckCircle2, Flag, MessageSquare, Plus, Send } from 'lucide-react';
import StatusLabel from '../../../components/dashboard/StatusLabel';
import PortalLayout from '../../../components/layout/PortalLayout';
import Button from '../../../components/ui/Button';
import EmptyState from '../../../components/ui/EmptyState';
import FormField from '../../../components/ui/FormField';
import StatusAlert from '../../../components/ui/StatusAlert';
import {
  resolveInstitutionKey,
  resolveWorkspaceInstitution,
  useDemoAppState,
} from '../../../context/DemoAppStateContext';
import { useDemoSession } from '../../../context/DemoSessionContext';
import { useToast } from '../../../context/ToastContext';
import { isPastDeadline } from '../../../utils/dateHelper';
import { getPortalNavItems } from '../../../utils/roleRouting';

const STATUS_FILTERS = ['All', 'In Progress', 'Pending Review', 'Revision Requested', 'Approved'];

export default function StudentMilestonesPage() {
  const { session, activeMembership } = useDemoSession();
  const { showToast } = useToast();
  const {
    state,
    addMilestone,
    addMilestoneFeedback,
    updateMilestoneStatus,
    updateMilestoneDueDate,
  } = useDemoAppState();

  const institutionName = resolveWorkspaceInstitution(activeMembership, session);
  const projectKey = resolveInstitutionKey(state.projectsByInstitution, institutionName);
  const project = projectKey ? state.projectsByInstitution[projectKey] : null;
  const mutationInstitution = projectKey || institutionName;

  const [statusFilter, setStatusFilter] = useState('All');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [weightPercent, setWeightPercent] = useState('20');
  const [formError, setFormError] = useState('');
  const [banner, setBanner] = useState('');

  const [replyDrafts, setReplyDrafts] = useState({});
  const [editingDateId, setEditingDateId] = useState('');
  const [editingDateVal, setEditingDateVal] = useState('');

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
      const isOverdue = ms.status !== 'Approved' && isPastDeadline(ms.dueDate);
      return {
        ...ms,
        phaseNumber: ms.phaseNumber || idx + 1,
        weightPercent: ms.weightPercent ?? 20,
        feedbackEntries: ms.feedbackEntries || [],
        doneTasks,
        totalTasks: linkedTasks.length,
        pct,
        isOverdue,
      };
    });
  }, [milestones, tasks]);

  const filteredMilestones = useMemo(() => {
    if (statusFilter === 'All') return enrichedMilestones;
    return enrichedMilestones.filter((m) => m.status === statusFilter);
  }, [enrichedMilestones, statusFilter]);

  const totalWeight = enrichedMilestones.reduce((sum, m) => sum + Number(m.weightPercent || 0), 0);
  const approvedWeight = enrichedMilestones
    .filter((m) => m.status === 'Approved')
    .reduce((sum, m) => sum + Number(m.weightPercent || 0), 0);

  if (!project) {
    return (
      <PortalLayout navItems={getPortalNavItems('student')}>
        <EmptyState
          icon={Flag}
          title="No active student project workspace"
          description={`No student milestone record is assigned under ${institutionName}. Switch institution membership or reset demo data if needed.`}
        />
      </PortalLayout>
    );
  }

  const handleCreatePhase = (e) => {
    e.preventDefault();
    if (!title.trim() || !dueDate) {
      setFormError('Enter a project phase title and target completion date.');
      return;
    }

    const weightNum = Math.min(100, Math.max(5, Number(weightPercent) || 20));
    addMilestone(mutationInstitution, {
      title: title.trim(),
      description:
        description.trim() || 'Phase deliverables and documentation prepared for supervisor review.',
      dueDate,
      weightPercent: weightNum,
      phaseNumber: project.milestones.length + 1,
      status: 'In Progress',
    });

    showToast({
      type: 'success',
      title: 'Project phase added',
      message: `${title.trim()} (${weightNum}%)`,
    });
    setBanner(`Added Phase ${project.milestones.length + 1}: "${title.trim()}".`);
    setTitle('');
    setDescription('');
    setDueDate('');
    setWeightPercent('20');
    setFormError('');
  };

  const handleRequestReview = (ms) => {
    updateMilestoneStatus(mutationInstitution, ms.id, 'Pending Review');
    showToast({
      type: 'info',
      title: 'Review requested',
      message: `${ms.title} marked Pending Review.`,
    });
    setBanner(`Marked "${ms.title}" as Pending Review for ${project.supervisorName}.`);
  };

  const handlePostReply = (ms) => {
    const comment = (replyDrafts[ms.id] || '').trim();
    if (!comment) return;
    addMilestoneFeedback(mutationInstitution, ms.id, {
      authorName: session?.fullName || project.studentName,
      authorRole: 'student',
      comment,
      nextStatus: ms.status === 'Revision Requested' ? 'Pending Review' : ms.status,
    });
    setReplyDrafts((prev) => ({ ...prev, [ms.id]: '' }));
    showToast({
      type: 'success',
      title: 'Milestone update sent',
      message: `${project.supervisorName} was notified.`,
    });
    setBanner(`Posted update on "${ms.title}".`);
  };

  const handleSaveDate = (msId) => {
    if (!editingDateVal) return;
    updateMilestoneDueDate(mutationInstitution, msId, editingDateVal);
    setEditingDateId('');
    setEditingDateVal('');
    showToast({
      type: 'info',
      title: 'Target date updated',
      message: `Rescheduled to ${editingDateVal}.`,
    });
  };

  return (
    <PortalLayout navItems={getPortalNavItems('student')}>
      <div className="space-y-1">
        <p className="font-mono text-xs font-medium text-[var(--accent-primary)]">
          {project.code} · {institutionName}
        </p>
        <h1 className="font-display text-2xl font-bold text-[var(--text-primary)]">
          Project Milestones &amp; Phase Feedback
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Define your project phases, track weighted deliverables, and review supervisor feedback on each milestone.
        </p>
      </div>

      {banner && (
        <StatusAlert type="success" title="Milestone workspace updated">
          {banner}
        </StatusAlert>
      )}

      {/* Weighted Progress Overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="spt-surface rounded-2xl p-5 space-y-1">
          <p className="text-xs font-medium text-[var(--text-secondary)]">Defined Project Phases</p>
          <p className="font-display text-2xl font-bold text-[var(--text-primary)] tabular-nums">
            {enrichedMilestones.length}
          </p>
          <p className="text-xs text-[var(--text-muted)]">
            Total allocated weight: {totalWeight}%
          </p>
        </div>
        <div className="spt-surface rounded-2xl p-5 space-y-1">
          <p className="text-xs font-medium text-[var(--text-secondary)]">Approved Weightage</p>
          <p className="font-display text-2xl font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
            {approvedWeight}%
          </p>
          <p className="text-xs text-[var(--text-muted)]">
            {enrichedMilestones.filter((m) => m.status === 'Approved').length} signed off by supervisor
          </p>
        </div>
        <div className="spt-surface rounded-2xl p-5 space-y-1">
          <p className="text-xs font-medium text-[var(--text-secondary)]">Supervisor Reviewer</p>
          <p className="font-display text-lg font-bold text-[var(--text-primary)] truncate">
            {project.supervisorName}
          </p>
          <p className="text-xs text-[var(--text-muted)]">Synced with Supervisor Milestones Portal</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Define New Project Phase Form */}
        <form
          onSubmit={handleCreatePhase}
          className="lg:col-span-4 spt-surface rounded-2xl p-5 space-y-4 self-start"
        >
          <div className="flex items-center gap-2">
            <Flag className="h-4 w-4 text-[var(--accent-primary)]" aria-hidden="true" />
            <h2 className="font-display text-base font-bold text-[var(--text-primary)]">
              Define Project Phase
            </h2>
          </div>

          {formError && (
            <StatusAlert type="error" title="Incomplete phase details">
              {formError}
            </StatusAlert>
          )}

          <FormField
            id="ms-phase-title"
            label="Phase / milestone title"
            placeholder="e.g. Phase 5: System Evaluation & Defense"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <FormField
            id="ms-phase-desc"
            as="textarea"
            rows={3}
            label="Expected deliverables & scope"
            placeholder="Describe what artifacts or chapters must be completed for sign-off..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <FormField
              id="ms-phase-due"
              type="date"
              label="Target due date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
            <FormField
              id="ms-phase-weight"
              type="number"
              label="Weight (%)"
              min="5"
              max="100"
              value={weightPercent}
              onChange={(e) => setWeightPercent(e.target.value)}
            />
          </div>

          <Button type="submit" variant="primary" size="md" fullWidth>
            <Plus className="h-4 w-4 inline mr-1.5" aria-hidden="true" />
            Add project phase
          </Button>
        </form>

        {/* Project Phases & Feedback Thread List */}
        <section className="lg:col-span-8 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="font-display text-lg font-bold text-[var(--text-primary)]">
              Project Phases ({filteredMilestones.length})
            </h2>
            <div className="flex items-center gap-1 overflow-x-auto rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-1">
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setStatusFilter(f)}
                  className={`min-h-[34px] rounded-md px-2.5 text-xs font-medium whitespace-nowrap cursor-pointer transition-colors ${
                    statusFilter === f
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
              icon={CheckCircle2}
              title={`No phases marked "${statusFilter}"`}
              description="Switch back to All to inspect all defined project phases."
              actionLabel="Show all phases"
              onAction={() => setStatusFilter('All')}
            />
          ) : (
            <div className="space-y-4">
              {filteredMilestones.map((ms) => (
                <article
                  key={ms.id}
                  className="spt-surface rounded-2xl p-5 space-y-4"
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
                        <span
                          className={`font-mono tabular-nums ${
                            ms.isOverdue
                              ? 'font-semibold text-red-700 dark:text-red-400'
                              : 'text-[var(--text-muted)]'
                          }`}
                        >
                          Due {ms.dueDate}
                          {ms.isOverdue ? ' · Past due' : ''}
                        </span>
                      </div>
                      <h3 className="font-display text-base sm:text-lg font-bold text-[var(--text-primary)]">
                        {ms.title}
                      </h3>
                    </div>
                    <StatusLabel status={ms.status} />
                  </div>

                  {ms.description && (
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                      {ms.description}
                    </p>
                  )}

                  {/* Linked tasks completion */}
                  <div className="space-y-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-3.5">
                    <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] tabular-nums">
                      <span>
                        {ms.totalTasks > 0
                          ? `${ms.doneTasks} of ${ms.totalTasks} linked tasks completed`
                          : 'No tasks linked to this phase yet'}
                      </span>
                      <span className="font-mono font-bold text-[var(--text-primary)]">
                        {ms.pct}%
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--border-subtle)]">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          ms.status === 'Approved' ? 'bg-emerald-600' : 'bg-[var(--accent-primary)]'
                        }`}
                        style={{ width: `${ms.pct}%` }}
                      />
                    </div>
                  </div>

                  {/* Phase actions */}
                  {ms.status !== 'Approved' && (
                    <div className="flex flex-wrap items-center gap-2.5">
                      {ms.status !== 'Pending Review' && (
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => handleRequestReview(ms)}
                        >
                          Submit phase for supervisor review
                        </Button>
                      )}

                      {editingDateId === ms.id ? (
                        <div className="flex flex-wrap items-center gap-2">
                          <input
                            type="date"
                            value={editingDateVal}
                            onChange={(e) => setEditingDateVal(e.target.value)}
                            className="min-h-[36px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-2.5 text-xs text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-none"
                          />
                          <Button
                            type="button"
                            variant="primary"
                            size="sm"
                            onClick={() => handleSaveDate(ms.id)}
                          >
                            Save
                          </Button>
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => setEditingDateId('')}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingDateId(ms.id);
                            setEditingDateVal(ms.dueDate);
                          }}
                          className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-[var(--accent-primary)] hover:bg-[var(--bg-elevated)] cursor-pointer"
                        >
                          <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>Adjust due date</span>
                        </button>
                      )}
                    </div>
                  )}

                  {/* Feedback thread */}
                  <div className="border-t border-[var(--border-subtle)] pt-4 space-y-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-primary)]">
                      <MessageSquare className="h-3.5 w-3.5 text-[var(--accent-primary)]" aria-hidden="true" />
                      <span>
                        Milestone Feedback &amp; Notes ({ms.feedbackEntries.length})
                      </span>
                    </div>

                    {ms.feedbackEntries.length > 0 && (
                      <div className="space-y-2.5">
                        {ms.feedbackEntries.map((fb) => (
                          <div
                            key={fb.id}
                            className={`rounded-xl border p-3.5 text-xs space-y-1 ${
                              fb.authorRole === 'supervisor'
                                ? 'border-blue-500/30 bg-blue-500/10'
                                : 'border-[var(--border-subtle)] bg-[var(--bg-elevated)]'
                            }`}
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="font-semibold text-[var(--text-primary)]">
                                {fb.authorName} ({fb.authorRole === 'supervisor' ? 'Supervisor' : 'Student'})
                              </span>
                              <span className="font-mono text-[11px] text-[var(--text-muted)] tabular-nums">
                                {fb.createdAt}
                              </span>
                            </div>
                            <p className="text-xs sm:text-sm text-[var(--text-primary)] leading-relaxed">
                              {fb.comment}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={replyDrafts[ms.id] || ''}
                        onChange={(e) =>
                          setReplyDrafts((prev) => ({ ...prev, [ms.id]: e.target.value }))
                        }
                        placeholder="Add a phase update or reply to supervisor feedback..."
                        aria-label={`Reply to ${ms.title}`}
                        className="min-h-[42px] flex-1 rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 text-base sm:text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-primary)] focus:outline-none"
                      />
                      <Button
                        type="button"
                        variant="navy"
                        size="sm"
                        onClick={() => handlePostReply(ms)}
                      >
                        <Send className="h-3.5 w-3.5 inline mr-1" aria-hidden="true" />
                        Post note
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </PortalLayout>
  );
}

