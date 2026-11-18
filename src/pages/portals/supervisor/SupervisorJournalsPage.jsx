import { useState } from 'react';
import { BookText } from 'lucide-react';
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
import { getPortalNavItems } from '../../../utils/roleRouting';

export default function SupervisorJournalsPage() {
  const { session, activeMembership } = useDemoSession();
  const { state, addJournalFeedback } = useDemoAppState();
  const [drafts, setDrafts] = useState({});
  const [banner, setBanner] = useState('');

  const institutionName = resolveWorkspaceInstitution(activeMembership, session);
  const projectKey = resolveInstitutionKey(state.projectsByInstitution, institutionName);
  const liveProject = projectKey ? state.projectsByInstitution[projectKey] : null;
  const mutationInstitution = projectKey || institutionName;

  if (!liveProject) {
    return (
      <PortalLayout navItems={getPortalNavItems('supervisor')}>
        <EmptyState
          icon={BookText}
          title="No supervised weekly journals"
          description={`No student weekly journals are assigned under ${institutionName}. Switch institution membership or reset demo data if needed.`}
        />
      </PortalLayout>
    );
  }

  const handleSaveFeedback = (journalId) => {
    const text = (drafts[journalId] || '').trim();
    if (!text) return;
    addJournalFeedback(mutationInstitution, journalId, text);
    setDrafts((prev) => ({ ...prev, [journalId]: '' }));
    setBanner('Journal feedback recorded and student notified.');
  };

  return (
    <PortalLayout navItems={getPortalNavItems('supervisor')}>
      <div className="space-y-1">
        <p className="font-mono text-xs font-medium text-[var(--accent-primary)]">{institutionName}</p>
        <h1 className="font-display text-2xl font-bold text-[var(--text-primary)]">
          Weekly Progress Journals
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Review student weekly logs and provide written supervision guidance.
        </p>
      </div>

      {banner && (
        <StatusAlert type="success" title="Feedback saved">
          {banner}
        </StatusAlert>
      )}

      {liveProject.journals.length === 0 ? (
        <EmptyState
          icon={BookText}
          title="No weekly journals submitted yet"
          description={`${liveProject.studentName} has not logged a weekly progress journal yet.`}
        />
      ) : (
        <div className="space-y-4">
          {liveProject.journals.map((entry) => (
            <article
              key={entry.id}
              className="spt-surface rounded-2xl p-5 sm:p-6 space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-3">
                <div>
                  <p className="font-display text-base font-bold text-[var(--text-primary)]">
                    {liveProject.studentName} · Week {entry.weekNumber}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)]">{liveProject.title}</p>
                </div>
                <span className="font-mono text-xs text-[var(--text-muted)] tabular-nums">
                  {entry.date}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 text-sm">
                <div>
                  <p className="text-xs font-semibold text-[var(--text-secondary)]">Summary</p>
                  <p className="text-[var(--text-primary)] mt-0.5 leading-relaxed">{entry.summary}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-[var(--text-secondary)]">Blockers</p>
                  <p className="text-[var(--text-primary)] mt-0.5 leading-relaxed">{entry.blockers}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-[var(--text-secondary)]">Next Steps</p>
                  <p className="text-[var(--text-primary)] mt-0.5 leading-relaxed">{entry.nextSteps}</p>
                </div>
              </div>

              {entry.supervisorFeedback && (
                <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-3.5 space-y-1">
                  <p className="text-xs font-semibold text-[var(--text-primary)]">
                    Your Feedback · {entry.reviewedAt}
                  </p>
                  <p className="text-xs sm:text-sm text-[var(--text-primary)]">
                    {entry.supervisorFeedback}
                  </p>
                </div>
              )}

              <div className="border-t border-[var(--border-subtle)] pt-3 flex flex-col sm:flex-row gap-2.5">
                <input
                  type="text"
                  value={drafts[entry.id] || ''}
                  onChange={(e) => setDrafts((prev) => ({ ...prev, [entry.id]: e.target.value }))}
                  placeholder={
                    entry.supervisorFeedback
                      ? 'Update supervisor feedback...'
                      : 'Write feedback for this weekly journal...'
                  }
                  aria-label={`Feedback for week ${entry.weekNumber}`}
                  className="flex-1 min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 text-base sm:text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-primary)] focus:outline-none"
                />
                <Button
                  type="button"
                  variant="navy"
                  size="md"
                  onClick={() => handleSaveFeedback(entry.id)}
                >
                  Post feedback
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}
    </PortalLayout>
  );
}

