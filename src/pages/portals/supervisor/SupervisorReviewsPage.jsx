import { useState } from 'react';
import { CheckCircle2, FileWarning } from 'lucide-react';
import StatusLabel from '../../../components/dashboard/StatusLabel';
import PortalLayout from '../../../components/layout/PortalLayout';
import Button from '../../../components/ui/Button';
import StatusAlert from '../../../components/ui/StatusAlert';
import { useDemoAppState } from '../../../context/DemoAppStateContext';
import { useDemoSession } from '../../../context/DemoSessionContext';
import { getPortalNavItems } from '../../../utils/roleRouting';

export default function SupervisorReviewsPage() {
  const { activeMembership } = useDemoSession();
  const { state, reviewSubmission } = useDemoAppState();
  const [feedbackDrafts, setFeedbackDrafts] = useState({});
  const [banner, setBanner] = useState('');
  const [errorBanner, setErrorBanner] = useState('');

  const institutionName = activeMembership?.institutionName || 'University of Westbridge';
  const liveProject = state.projectsByInstitution['University of Westbridge'];

  const queueItems = [
    ...liveProject.submissions.map((sub) => ({
      id: sub.id,
      studentName: liveProject.studentName,
      documentTitle: `${sub.title} (${sub.version})`,
      fileName: sub.fileName,
      submittedAt: sub.submittedAt,
      status: sub.status,
      studentNote: sub.studentNote,
      studentResponse: sub.studentResponse,
      supervisorFeedback: sub.supervisorFeedback,
      isExtra: false,
    })),
    ...state.supervisorExtraSubmissions.map((sub) => ({
      ...sub,
      isExtra: true,
    })),
  ];

  const handleDecision = (item, decision) => {
    const notes = (feedbackDrafts[item.id] || '').trim();
    if (decision === 'Revision Requested' && notes.length < 10) {
      setErrorBanner('Provide clear revision instructions (at least 10 characters) when requesting revisions.');
      setBanner('');
      return;
    }
    setErrorBanner('');
    reviewSubmission(
      'University of Westbridge',
      item.id,
      decision,
      notes || (decision === 'Approved' ? 'Approved by supervisor.' : ''),
      item.isExtra
    );
    setFeedbackDrafts((prev) => ({ ...prev, [item.id]: '' }));
    setBanner(`Marked "${item.documentTitle}" as ${decision}. Student notification sent.`);
  };

  return (
    <PortalLayout navItems={getPortalNavItems('supervisor')}>
      <div className="space-y-1">
        <p className="font-mono text-xs font-medium text-[#2563EB]">{institutionName}</p>
        <h1 className="font-display text-2xl font-bold text-[#172554]">
          Document Review Queue
        </h1>
        <p className="text-sm text-[#64748B]">
          Review submitted chapters, approve completed milestones, or request targeted revisions.
        </p>
      </div>

      {errorBanner && (
        <StatusAlert type="error" title="Feedback required">
          {errorBanner}
        </StatusAlert>
      )}
      {banner && (
        <StatusAlert type="success" title="Review recorded">
          {banner}
        </StatusAlert>
      )}

      <div className="space-y-4">
        {queueItems.map((item) => (
          <article
            key={item.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1">
                <p className="font-display text-base sm:text-lg font-bold text-[#172554]">
                  {item.documentTitle}
                </p>
                <p className="font-mono text-xs text-[#64748B] tabular-nums">
                  {item.studentName} · {item.fileName} · Submitted {item.submittedAt}
                </p>
              </div>
              <StatusLabel status={item.status} />
            </div>

            {item.studentNote && (
              <p className="text-sm text-[#64748B]">
                <strong className="text-[#172554]">Student note:</strong> {item.studentNote}
              </p>
            )}

            {item.studentResponse && (
              <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-3.5 text-xs sm:text-sm text-[#172554]">
                <strong className="block mb-0.5">Student Revision Response:</strong>
                {item.studentResponse}
              </div>
            )}

            {item.supervisorFeedback && (
              <div className="rounded-xl border border-slate-200 bg-[#F8FAFC] p-3.5 text-xs sm:text-sm text-[#172554]">
                <strong className="block mb-0.5">Recorded Review Feedback:</strong>
                {item.supervisorFeedback}
              </div>
            )}

            <div className="border-t border-slate-100 pt-4 space-y-3">
              <label htmlFor={`rev-fb-${item.id}`} className="block text-xs font-semibold text-[#172554]">
                Supervisor feedback / review decision note
              </label>
              <textarea
                id={`rev-fb-${item.id}`}
                rows={2}
                value={feedbackDrafts[item.id] || ''}
                onChange={(e) =>
                  setFeedbackDrafts((prev) => ({ ...prev, [item.id]: e.target.value }))
                }
                placeholder="Write constructive feedback or revision instructions..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-base sm:text-sm text-[#172554] focus:border-[#2563EB] focus:outline-none"
              />
              <div className="flex flex-col sm:flex-row gap-2.5">
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => handleDecision(item, 'Approved')}
                >
                  <CheckCircle2 className="h-4 w-4 inline mr-1" aria-hidden="true" />
                  Approve submission
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => handleDecision(item, 'Revision Requested')}
                >
                  <FileWarning className="h-4 w-4 inline mr-1" aria-hidden="true" />
                  Request revisions
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </PortalLayout>
  );
}
