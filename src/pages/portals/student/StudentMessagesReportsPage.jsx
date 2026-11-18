import { useState } from 'react';
import { Download, FileText, MessageSquare, Printer, Send } from 'lucide-react';
import StatusLabel from '../../../components/dashboard/StatusLabel';
import PortalLayout from '../../../components/layout/PortalLayout';
import Button from '../../../components/ui/Button';
import EmptyState from '../../../components/ui/EmptyState';
import { GRACE_POLYTECHNIC_BRAND } from '../../../config/gracePolytechnic';
import {
  GRACE_INSTITUTION_NAME,
  resolveInstitutionKey,
  resolveWorkspaceInstitution,
  useDemoAppState,
} from '../../../context/DemoAppStateContext';
import { useDemoSession } from '../../../context/DemoSessionContext';
import { downloadCsv, downloadTextReport } from '../../../utils/csvExport';
import { formatDisplayDate, getCurrentIsoDate } from '../../../utils/dateHelper';
import { getPortalNavItems } from '../../../utils/roleRouting';

export default function StudentMessagesReportsPage() {
  const { session, activeMembership } = useDemoSession();
  const { state, sendProjectMessage } = useDemoAppState();
  const [draft, setDraft] = useState('');

  const institutionName = resolveWorkspaceInstitution(activeMembership, session);
  const projectKey = resolveInstitutionKey(state.projectsByInstitution, institutionName);
  const project = projectKey ? state.projectsByInstitution[projectKey] : null;
  const mutationInstitution = projectKey || institutionName;
  const isGraceTenant = institutionName === GRACE_INSTITUTION_NAME;

  if (!project) {
    return (
      <PortalLayout navItems={getPortalNavItems('student')}>
        <EmptyState
          icon={MessageSquare}
          title="No active student messaging or report workspace"
          description={`No student project thread or progress report is assigned under ${institutionName}. Switch institution membership or reset demo data if needed.`}
        />
      </PortalLayout>
    );
  }

  const completedTasks = project.tasks.filter((t) => t.completed).length;
  const progressPct = project.tasks.length
    ? Math.round((completedTasks / project.tasks.length) * 100)
    : 0;
  const todayIso = getCurrentIsoDate();
  const generatedLabel = formatDisplayDate(todayIso);

  const handleSend = (e) => {
    e.preventDefault();
    if (!draft.trim()) return;
    sendProjectMessage(
      mutationInstitution,
      'student',
      session?.fullName || project.studentName,
      draft.trim()
    );
    setDraft('');
  };

  const handleExportCsv = () => {
    downloadCsv(
      `${project.code}_progress_report.csv`,
      ['Milestone', 'Due Date', 'Status', 'Completed Tasks', 'Total Tasks'],
      project.milestones.map((ms) => {
        const msTasks = project.tasks.filter((t) => t.milestoneId === ms.id);
        return [
          ms.title,
          ms.dueDate,
          ms.status,
          msTasks.filter((t) => t.completed).length,
          msTasks.length,
        ];
      })
    );
  };

  const handleExportSummary = () => {
    const lines = [
      `# Student Project Progress Report (${project.code})`,
      `- **Student:** ${project.studentName}`,
      `- **Institution:** ${institutionName}${isGraceTenant ? ` (${GRACE_POLYTECHNIC_BRAND.location})` : ''}`,
      `- **Department:** ${project.department}`,
      `- **Project Title:** ${project.title}`,
      `- **Assigned Supervisor:** ${project.supervisorName}`,
      `- **Task Completion:** ${completedTasks}/${project.tasks.length} (${progressPct}%)`,
      '',
      '## Milestones',
      ...project.milestones.map((m) => `- ${m.title} | Due ${m.dueDate} | Status: ${m.status}`),
      '',
      '## Submitted Document Versions',
      ...project.submissions.map(
        (s) => `- ${s.title} (${s.version}) | ${s.fileName} | ${s.submittedAt} | ${s.status}`
      ),
      '',
      `Generated on ${generatedLabel} (${todayIso}) via ${GRACE_POLYTECHNIC_BRAND.appName}`,
    ];
    downloadTextReport(`${project.code}_summary_report.md`, lines.join('\n'));
  };

  return (
    <PortalLayout navItems={getPortalNavItems('student')}>
      <div className="space-y-1 print:hidden">
        <p className="font-mono text-xs font-medium text-[var(--accent-primary)]">
          {project.code} · {institutionName}
        </p>
        <h1 className="font-display text-2xl font-bold text-[var(--text-primary)]">
          Supervisor Messaging &amp; Progress Report
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Communicate directly with {project.supervisorName} and print or export your academic progress report.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Messaging Panel (Hidden on Print) */}
        <section className="lg:col-span-5 flex flex-col spt-surface rounded-2xl overflow-hidden print:hidden">
          <div className="border-b border-[var(--border-subtle)] px-5 py-4">
            <h2 className="font-display text-base font-bold text-[var(--text-primary)]">
              Direct Thread · {project.supervisorName}
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">{project.supervisorEmail}</p>
          </div>

          <div className="flex-1 max-h-96 overflow-y-auto p-4 space-y-3 bg-[var(--bg-elevated)]">
            {project.messages.map((msg) => {
              const isMine = msg.senderRole === 'student';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      isMine
                        ? 'bg-[var(--accent-primary)] text-white'
                        : 'border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)]'
                    }`}
                  >
                    <p>{msg.body}</p>
                  </div>
                  <span className="mt-1 font-mono text-[11px] text-[var(--text-muted)]">
                    {msg.senderName} · {msg.sentAt}
                  </span>
                </div>
              );
            })}
          </div>

          <form
            onSubmit={handleSend}
            className="border-t border-[var(--border-subtle)] p-3 flex gap-2 bg-[var(--bg-surface)]"
          >
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Write a message to your supervisor..."
              aria-label="Message text"
              className="flex-1 min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 text-base sm:text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-primary)] focus:outline-none"
            />
            <Button type="submit" variant="primary" size="md" aria-label="Send message">
              <Send className="h-4 w-4" aria-hidden="true" />
            </Button>
          </form>
        </section>

        {/* Printable Academic Project Progress Report */}
        <section className="lg:col-span-7 spt-surface spt-print-report rounded-2xl p-5 sm:p-7 space-y-5 print:col-span-12">
          <div className="flex flex-col gap-3 border-b border-[var(--border-subtle)] pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="font-mono text-xs font-semibold text-[var(--accent-primary)]">
                {institutionName.toUpperCase()}
                {isGraceTenant ? ` · ${GRACE_POLYTECHNIC_BRAND.location.toUpperCase()}` : ''}
              </p>
              <h2 className="font-display text-xl font-bold text-[var(--text-primary)]">
                Student Project Progress Report
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                Official Academic Record · {project.code} · Generated {generatedLabel}
              </p>
            </div>

            <div className="flex flex-wrap gap-2 print:hidden">
              <Button type="button" variant="secondary" size="sm" onClick={handleExportSummary}>
                <FileText className="h-4 w-4 inline mr-1.5" aria-hidden="true" />
                Export MD
              </Button>
              <Button type="button" variant="secondary" size="sm" onClick={handleExportCsv}>
                <Download className="h-4 w-4 inline mr-1.5" aria-hidden="true" />
                Export CSV
              </Button>
              <Button type="button" variant="navy" size="sm" onClick={() => window.print()}>
                <Printer className="h-4 w-4 inline mr-1.5" aria-hidden="true" />
                Print report
              </Button>
            </div>
          </div>

          <dl className="spt-print-avoid-break grid grid-cols-1 gap-3 text-xs sm:grid-cols-2 sm:text-sm">
            <div>
              <dt className="text-[var(--text-muted)]">Student</dt>
              <dd className="font-semibold text-[var(--text-primary)]">{project.studentName}</dd>
            </div>
            <div>
              <dt className="text-[var(--text-muted)]">Institution &amp; Department</dt>
              <dd className="font-semibold text-[var(--text-primary)]">
                {institutionName} · {project.department}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-[var(--text-muted)]">Project Title</dt>
              <dd className="font-semibold text-[var(--text-primary)]">{project.title}</dd>
            </div>
            <div>
              <dt className="text-[var(--text-muted)]">Assigned Supervisor</dt>
              <dd className="font-medium text-[var(--text-primary)]">{project.supervisorName}</dd>
            </div>
            <div>
              <dt className="text-[var(--text-muted)]">Task Completion Rate</dt>
              <dd className="font-mono font-bold text-[var(--text-primary)] tabular-nums">
                {completedTasks} / {project.tasks.length} ({progressPct}%)
              </dd>
            </div>
          </dl>

          <div className="spt-print-avoid-break space-y-2 border-t border-[var(--border-subtle)] pt-4">
            <h3 className="text-xs font-bold text-[var(--text-primary)]">Milestone Status</h3>
            <div className="divide-y divide-[var(--border-subtle)]">
              {project.milestones.map((ms) => (
                <div key={ms.id} className="py-2 flex items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="font-medium text-[var(--text-primary)]">{ms.title}</span>
                    <span className="ml-2 font-mono text-[11px] text-[var(--text-muted)] tabular-nums">
                      Due {ms.dueDate}
                    </span>
                  </div>
                  <StatusLabel status={ms.status} />
                </div>
              ))}
            </div>
          </div>

          <div className="spt-print-avoid-break space-y-2 border-t border-[var(--border-subtle)] pt-4">
            <h3 className="text-xs font-bold text-[var(--text-primary)]">
              Logged Weekly Journals: {project.journals.length} · Submitted Chapters:{' '}
              {project.submissions.length}
            </h3>
            <p className="text-xs text-[var(--text-muted)] tabular-nums">
              Generated {generatedLabel} ({todayIso}) · {GRACE_POLYTECHNIC_BRAND.appName}
            </p>
          </div>
        </section>
      </div>
    </PortalLayout>
  );
}

