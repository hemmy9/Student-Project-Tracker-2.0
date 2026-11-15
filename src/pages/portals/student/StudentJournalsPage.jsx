import { useState } from 'react';
import { BookText } from 'lucide-react';
import PortalLayout from '../../../components/layout/PortalLayout';
import Button from '../../../components/ui/Button';
import EmptyState from '../../../components/ui/EmptyState';
import FormField from '../../../components/ui/FormField';
import StatusAlert from '../../../components/ui/StatusAlert';
import { useDemoAppState } from '../../../context/DemoAppStateContext';
import { useDemoSession } from '../../../context/DemoSessionContext';
import { getPortalNavItems } from '../../../utils/roleRouting';

export default function StudentJournalsPage() {
  const { activeMembership } = useDemoSession();
  const { state, addWeeklyJournal } = useDemoAppState();

  const institutionName = activeMembership?.institutionName || 'University of Westbridge';
  const project =
    state.projectsByInstitution[institutionName] ||
    state.projectsByInstitution['University of Westbridge'];

  const [summary, setSummary] = useState('');
  const [blockers, setBlockers] = useState('');
  const [nextSteps, setNextSteps] = useState('');
  const [error, setError] = useState('');
  const [submittedNotice, setSubmittedNotice] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (summary.trim().length < 15 || !nextSteps.trim()) {
      setError('Provide a progress summary (at least 15 characters) and planned next steps.');
      return;
    }

    addWeeklyJournal(institutionName, {
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

  return (
    <PortalLayout navItems={getPortalNavItems('student')}>
      <div className="space-y-1">
        <p className="font-mono text-xs font-medium text-[#2563EB]">
          {project.code} · {institutionName}
        </p>
        <h1 className="font-display text-2xl font-bold text-[#172554]">
          Weekly Progress Journals
        </h1>
        <p className="text-sm text-[#64748B]">
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
          className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4 self-start"
        >
          <h2 className="font-display text-lg font-bold text-[#172554]">
            Log Week {(project.journals[0]?.weekNumber || 0) + 1} Journal
          </h2>

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
          <h2 className="font-display text-lg font-bold text-[#172554]">
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
                  className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3"
                >
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                    <p className="font-display text-base font-bold text-[#172554]">
                      Week {entry.weekNumber}
                    </p>
                    <span className="font-mono text-xs text-[#64748B] tabular-nums">
                      {entry.date}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="text-xs font-semibold text-[#64748B]">Summary</p>
                      <p className="text-[#172554] leading-relaxed">{entry.summary}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[#64748B]">Blockers</p>
                      <p className="text-[#172554] leading-relaxed">{entry.blockers}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[#64748B]">Next Steps</p>
                      <p className="text-[#172554] leading-relaxed">{entry.nextSteps}</p>
                    </div>
                  </div>

                  {entry.supervisorFeedback ? (
                    <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-3.5 space-y-1">
                      <p className="text-xs font-semibold text-[#172554]">
                        Supervisor Feedback · {entry.reviewedAt}
                      </p>
                      <p className="text-xs sm:text-sm text-[#172554] leading-relaxed">
                        {entry.supervisorFeedback}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-[#64748B]">Awaiting supervisor review.</p>
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
