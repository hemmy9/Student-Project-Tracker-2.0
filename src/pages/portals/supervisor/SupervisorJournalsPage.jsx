import { useState } from 'react';
import PortalLayout from '../../../components/layout/PortalLayout';
import Button from '../../../components/ui/Button';
import StatusAlert from '../../../components/ui/StatusAlert';
import { useDemoAppState } from '../../../context/DemoAppStateContext';
import { useDemoSession } from '../../../context/DemoSessionContext';
import { getPortalNavItems } from '../../../utils/roleRouting';

export default function SupervisorJournalsPage() {
  const { activeMembership } = useDemoSession();
  const { state, addJournalFeedback } = useDemoAppState();
  const [drafts, setDrafts] = useState({});
  const [banner, setBanner] = useState('');

  const institutionName = activeMembership?.institutionName || 'University of Westbridge';
  const liveProject = state.projectsByInstitution['University of Westbridge'];

  const handleSaveFeedback = (journalId) => {
    const text = (drafts[journalId] || '').trim();
    if (!text) return;
    addJournalFeedback('University of Westbridge', journalId, text);
    setDrafts((prev) => ({ ...prev, [journalId]: '' }));
    setBanner('Journal feedback recorded and student notified.');
  };

  return (
    <PortalLayout navItems={getPortalNavItems('supervisor')}>
      <div className="space-y-1">
        <p className="font-mono text-xs font-medium text-[#2563EB]">{institutionName}</p>
        <h1 className="font-display text-2xl font-bold text-[#172554]">
          Weekly Progress Journals
        </h1>
        <p className="text-sm text-[#64748B]">
          Review student weekly logs and provide written supervision guidance.
        </p>
      </div>

      {banner && (
        <StatusAlert type="success" title="Feedback saved">
          {banner}
        </StatusAlert>
      )}

      <div className="space-y-4">
        {liveProject.journals.map((entry) => (
          <article
            key={entry.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <p className="font-display text-base font-bold text-[#172554]">
                  {liveProject.studentName} · Week {entry.weekNumber}
                </p>
                <p className="text-xs text-[#64748B]">{liveProject.title}</p>
              </div>
              <span className="font-mono text-xs text-[#64748B] tabular-nums">{entry.date}</span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 text-sm">
              <div>
                <p className="text-xs font-semibold text-[#64748B]">Summary</p>
                <p className="text-[#172554] mt-0.5 leading-relaxed">{entry.summary}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-[#64748B]">Blockers</p>
                <p className="text-[#172554] mt-0.5 leading-relaxed">{entry.blockers}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-[#64748B]">Next Steps</p>
                <p className="text-[#172554] mt-0.5 leading-relaxed">{entry.nextSteps}</p>
              </div>
            </div>

            {entry.supervisorFeedback && (
              <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-3.5 space-y-1">
                <p className="text-xs font-semibold text-[#172554]">
                  Your Feedback · {entry.reviewedAt}
                </p>
                <p className="text-xs sm:text-sm text-[#172554]">{entry.supervisorFeedback}</p>
              </div>
            )}

            <div className="border-t border-slate-100 pt-3 flex flex-col sm:flex-row gap-2.5">
              <input
                type="text"
                value={drafts[entry.id] || ''}
                onChange={(e) => setDrafts((prev) => ({ ...prev, [entry.id]: e.target.value }))}
                placeholder={
                  entry.supervisorFeedback
                    ? 'Update supervisor feedback...'
                    : 'Write feedback for this weekly journal...'
                }
                className="flex-1 min-h-[44px] rounded-lg border border-slate-300 px-3 text-base sm:text-sm text-[#172554] focus:border-[#2563EB] focus:outline-none"
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
    </PortalLayout>
  );
}
