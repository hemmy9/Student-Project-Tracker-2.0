import { useState } from 'react';
import { BookText, Sparkles } from 'lucide-react';
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
import { useAiAssistant } from '../../../hooks/useAiAssistant';
import { getPortalNavItems } from '../../../utils/roleRouting';

export default function StudentJournalsPage() {
  const { session, activeMembership } = useDemoSession();
  const { state, addWeeklyJournal } = useDemoAppState();
  const { draftLoading, generateDraft } = useAiAssistant();

  const institutionName = resolveWorkspaceInstitution(activeMembership, session);
  const projectKey = resolveInstitutionKey(state.projectsByInstitution, institutionName);
  const project = projectKey ? state.projectsByInstitution[projectKey] : null;
  const mutationInstitution = projectKey || institutionName;

  const [summary, setSummary] = useState('');
  const [blockers, setBlockers] = useState('');
  const [nextSteps, setNextSteps] = useState('');
  const [error, setError] = useState('');
  const [submittedNotice, setSubmittedNotice] = useState(false);

  if (!project) {
    return (
      <PortalLayout navItems={getPortalNavItems('student')}>
        <EmptyState
          icon={BookText}
          title="No active student journal workspace"
          description={`No student weekly journal record is provisioned under ${institutionName}. Switch institution membership or reset demo data if needed.`}
        />
      </PortalLayout>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (summary.trim().length < 15 || !nextSteps.trim()) {
      setError('Provide a progress summary (at least 15 characters) and planned next steps.');
      return;
    }

    addWeeklyJournal(mutationInstitution, {
      summary: summary.trim(),
      blockers: blockers.trim() || 'None reported.',
      nextSteps: nextSteps.trim(),
    });

    setSummary('');
    setBlockers('');
    setNextSteps('');
    setError('');
    setSubmittedNotice(true);
    setTimeout(() => setSubmittedNotice(false), 3500);
  };

  const handleDraftWithAi = async () => {
    const draft = await generateDraft({
      draftType: 'weekly_journal',
      contextData: {
        projectTitle: project.title,
        completedTasks: project.tasks.filter((t) => t.completed).map((t) => t.title),
        openTasks: project.tasks.filter((t) => !t.completed).map((t) => t.title),
        activeMilestones: project.milestones.map((m) => ({
          title: m.title,
          status: m.status,
          dueDate: m.dueDate,
        })),
        previousJournal: project.journals[0] || null,
      },
    });
    if (draft) {
      if (draft.primaryText) setSummary(draft.primaryText);
      if (draft.secondaryText) setBlockers(draft.secondaryText);
      if (draft.tertiaryText) setNextSteps(draft.tertiaryText);
      setError('');
    }
  };

  return (
    <PortalLayout navItems={getPortalNavItems('student')}>
      <div className="space-y-1">
        <p className="font-mono text-xs font-medium text-[var(--accent-primary)]">
          {project.code} · {institutionName}
        </p>
        <h1 className="font-display text-2xl font-bold text-[var(--text-primary)]">
          Weekly Progress Journals
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Log weekly achievements, blockers, and next steps for {project.supervisorName} to review.
        </p>
      </div>

      {submittedNotice && (
        <StatusAlert type="success" title="Weekly journal logged">
          Your new weekly journal entry has been saved locally and triggered a notification for your supervisor.
        </StatusAlert>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-5 spt-surface rounded-2xl p-5 sm:p-6 space-y-4 self-start"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-lg font-bold text-[var(--text-primary)]">
              Log Week {(project.journals[0]?.weekNumber || 0) + 1} Journal
            </h2>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleDraftWithAi}
              disabled={draftLoading}
            >
              <Sparkles className="h-3.5 w-3.5 inline mr-1.5 text-[var(--accent-primary)]" aria-hidden="true" />
              {draftLoading ? 'Drafting...' : 'Draft with AI'}
            </Button>
          </div>

          {error && (
            <StatusAlert type="error" title="Incomplete journal entry">
              {error}
            </StatusAlert>
          )}

          <FormField
            id="journal-summary"
            as="textarea"
            rows={4}
            label="Work completed this week"
            placeholder="Summarize experiments, coding, data collection, or chapter drafting completed..."
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            required
          />

          <FormField
            id="journal-blockers"
            as="textarea"
            rows={2}
            label="Challenges or blockers"
            placeholder="Optional: note any technical or methodological blockers"
            value={blockers}
            onChange={(e) => setBlockers(e.target.value)}
          />

          <FormField
            id="journal-next"
            as="textarea"
            rows={2}
            label="Planned next steps"
            placeholder="What will you deliver before next week's check-in?"
            value={nextSteps}
            onChange={(e) => setNextSteps(e.target.value)}
            required
          />

          <Button type="submit" variant="primary" size="lg" fullWidth>
            Submit weekly journal
          </Button>
        </form>

        <section className="lg:col-span-7 space-y-4">
          <h2 className="font-display text-lg font-bold text-[var(--text-primary)]">
            Journal History ({project.journals.length})
          </h2>

          {project.journals.length === 0 ? (
            <EmptyState
              icon={BookText}
              title="No weekly journals logged yet"
              description="Submit your first weekly progress journal on the left."
            />
          ) : (
            <div className="space-y-4">
              {project.journals.map((entry) => (
                <article
                  key={entry.id}
                  className="spt-surface rounded-2xl p-5 space-y-3"
                >
                  <div className="flex items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-2.5">
                    <p className="font-display text-base font-bold text-[var(--text-primary)]">
                      Week {entry.weekNumber}
                    </p>
                    <span className="font-mono text-xs text-[var(--text-muted)] tabular-nums">
                      {entry.date}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="text-xs font-semibold text-[var(--text-secondary)]">Summary</p>
                      <p className="text-[var(--text-primary)] leading-relaxed">{entry.summary}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[var(--text-secondary)]">Blockers</p>
                      <p className="text-[var(--text-primary)] leading-relaxed">{entry.blockers}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[var(--text-secondary)]">Next Steps</p>
                      <p className="text-[var(--text-primary)] leading-relaxed">{entry.nextSteps}</p>
                    </div>
                  </div>

                  {entry.supervisorFeedback ? (
                    <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-3.5 space-y-1">
                      <p className="text-xs font-semibold text-[var(--text-primary)]">
                        Supervisor Feedback · {entry.reviewedAt}
                      </p>
                      <p className="text-xs sm:text-sm text-[var(--text-primary)] leading-relaxed">
                        {entry.supervisorFeedback}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-[var(--text-muted)]">Awaiting supervisor review.</p>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </PortalLayout>
  );
}

