import { useMemo, useState } from 'react';
import { Download, FileText, MessageSquare, Printer, Send } from 'lucide-react';
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

export default function SupervisorMessagesReportsPage() {
  const { session, activeMembership } = useDemoSession();
  const { state, sendProjectMessage } = useDemoAppState();
  const [draft, setDraft] = useState('');

  const institutionName = resolveWorkspaceInstitution(activeMembership, session);
  const projectKey = resolveInstitutionKey(state.projectsByInstitution, institutionName);
  const liveProject = projectKey ? state.projectsByInstitution[projectKey] : null;
  const mutationInstitution = projectKey || institutionName;
  const isGraceTenant = institutionName === GRACE_INSTITUTION_NAME;

  const extraStudents = useMemo(
    () => (isGraceTenant ? state.supervisorExtraStudents : []),
    [isGraceTenant, state.supervisorExtraStudents]
  );

  if (!liveProject) {
    return (
      <PortalLayout navItems={getPortalNavItems('supervisor')}>
        <EmptyState
          icon={MessageSquare}
          title="No supervised messaging or report workspace"
          description={`No supervised project thread or cohort report is assigned under ${institutionName}. Switch institution membership or reset demo data if needed.`}
        />
      </PortalLayout>
    );
  }

  const todayIso = getCurrentIsoDate();
  const generatedLabel = formatDisplayDate(todayIso);
  const supervisorName = session?.fullName || liveProject.supervisorName;
  const doneCount = liveProject.tasks.filter((t) => t.completed).length;
  const livePct = liveProject.tasks.length
    ? Math.round((doneCount / liveProject.tasks.length) * 100)
    : 0;

  const handleSend = (e) => {
    e.preventDefault();
    if (!draft.trim()) return;
    sendProjectMessage(mutationInstitution, 'supervisor', supervisorName, draft.trim());
    setDraft('');
  };

  const handleExportCohortCsv = () => {
    const rows = [
      [liveProject.studentName, liveProject.code, liveProject.title, `${livePct}%`, 'Active'],
      ...extraStudents.map((s) => [
        s.name,
        s.studentCode,
        s.projectTitle,
        `${s.progress}%`,
        s.attentionStatus,
      ]),
    ];
    downloadCsv(
      'supervision_cohort_report.csv',
      ['Student', 'Code', 'Project Title', 'Progress', 'Status'],
      rows
    );
  };

  const handleExportCohortMarkdown = () => {
    const lines = [
      `# Supervision Cohort Report — ${supervisorName}`,
      `- **Institution:** ${institutionName}${isGraceTenant ? ` (${GRACE_POLYTECHNIC_BRAND.location})` : ''}`,
      `- **Generated:** ${generatedLabel} (${todayIso})`,
      '',
      '## Assigned Students',
      `- **${liveProject.studentName}** (${liveProject.code}) · ${liveProject.title} — ${livePct}%`,
      ...extraStudents.map(
        (s) => `- **${s.name}** (${s.studentCode}) · ${s.projectTitle} — ${s.progress}% (${s.attentionStatus})`
      ),
    ];
    downloadTextReport('supervision_cohort_report.md', lines.join('\n'));
  };

  return (
    <PortalLayout navItems={getPortalNavItems('supervisor')}>
      <div className="space-y-1 print:hidden">
        <p className="font-mono text-xs font-medium text-[var(--accent-primary)]">{institutionName}</p>
        <h1 className="font-display text-2xl font-bold text-[var(--text-primary)]">
          Student Messaging &amp; Cohort Reports
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Message supervised students and print or export a supervision cohort summary.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <section className="lg:col-span-5 flex flex-col spt-surface rounded-2xl overflow-hidden print:hidden">
          <div className="border-b border-[var(--border-subtle)] px-5 py-4">
            <h2 className="font-display text-base font-bold text-[var(--text-primary)]">
              Student Thread · {liveProject.studentName}
            </h2>
            <p className="text-xs text-[var(--text-muted)]">{liveProject.code}</p>
          </div>

          <div className="flex-1 max-h-96 overflow-y-auto p-4 space-y-3 bg-[var(--bg-elevated)]">
            {liveProject.messages.map((msg) => {
              const isMine = msg.senderRole === 'supervisor';
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
              placeholder="Write a message to student..."
              aria-label="Message text"
              className="flex-1 min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 text-base sm:text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-primary)] focus:outline-none"
            />
            <Button type="submit" variant="primary" size="md" aria-label="Send message">
              <Send className="h-4 w-4" aria-hidden="true" />
            </Button>
          </form>
        </section>

        <section className="lg:col-span-7 spt-surface spt-print-report rounded-2xl p-5 sm:p-7 space-y-5 print:col-span-12">
          <div className="flex flex-col gap-3 border-b border-[var(--border-subtle)] pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="font-mono text-xs font-semibold text-[var(--accent-primary)]">
                {institutionName.toUpperCase()}
                {isGraceTenant ? ` · ${GRACE_POLYTECHNIC_BRAND.location.toUpperCase()}` : ''}
              </p>
              <h2 className="font-display text-xl font-bold text-[var(--text-primary)]">
                Supervision Cohort Report · {supervisorName}
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                Assigned Cohort Summary · Generated {generatedLabel}
              </p>
            </div>

            <div className="flex flex-wrap gap-2 print:hidden">
              <Button type="button" variant="secondary" size="sm" onClick={handleExportCohortMarkdown}>
                <FileText className="h-4 w-4 inline mr-1.5" aria-hidden="true" />
                Export MD
              </Button>
              <Button type="button" variant="secondary" size="sm" onClick={handleExportCohortCsv}>
                <Download className="h-4 w-4 inline mr-1.5" aria-hidden="true" />
                Export CSV
              </Button>
              <Button type="button" variant="navy" size="sm" onClick={() => window.print()}>
                <Printer className="h-4 w-4 inline mr-1.5" aria-hidden="true" />
                Print cohort report
              </Button>
            </div>
          </div>

          <div className="spt-print-avoid-break divide-y divide-[var(--border-subtle)] text-sm">
            <div className="py-3 flex items-center justify-between gap-2">
              <div>
                <p className="font-semibold text-[var(--text-primary)]">{liveProject.studentName}</p>
                <p className="text-xs text-[var(--text-secondary)]">
                  {liveProject.code} · {liveProject.title}
                </p>
              </div>
              <span className="font-mono text-xs font-bold text-[var(--text-primary)] tabular-nums">
                {doneCount}/{liveProject.tasks.length} tasks ({livePct}%)
              </span>
            </div>
            {extraStudents.map((stu) => (
              <div key={stu.id} className="py-3 flex items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-[var(--text-primary)]">{stu.name}</p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {stu.studentCode} · {stu.projectTitle}
                  </p>
                </div>
                <span className="font-mono text-xs font-bold text-[var(--text-primary)] tabular-nums">
                  {stu.progress}% · {stu.attentionStatus}
                </span>
              </div>
            ))}
          </div>

          <p className="spt-print-avoid-break border-t border-[var(--border-subtle)] pt-3 text-xs text-[var(--text-muted)] tabular-nums">
            Generated {generatedLabel} ({todayIso}) · {GRACE_POLYTECHNIC_BRAND.appName}
          </p>
        </section>
      </div>
    </PortalLayout>
  );
}

