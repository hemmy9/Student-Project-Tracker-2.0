import { useState } from 'react';
import { Download, FileText, Printer, Send } from 'lucide-react';
import PortalLayout from '../../../components/layout/PortalLayout';
import Button from '../../../components/ui/Button';
import { useDemoAppState } from '../../../context/DemoAppStateContext';
import { useDemoSession } from '../../../context/DemoSessionContext';
import { downloadCsv, downloadTextReport } from '../../../utils/csvExport';
import { getPortalNavItems } from '../../../utils/roleRouting';

export default function SupervisorMessagesReportsPage() {
  const { session, activeMembership } = useDemoSession();
  const { state, sendProjectMessage } = useDemoAppState();
  const [draft, setDraft] = useState('');

  const institutionName = activeMembership?.institutionName || 'University of Westbridge';
  const liveProject = state.projectsByInstitution['University of Westbridge'];

  const handleSend = (e) => {
    e.preventDefault();
    if (!draft.trim()) return;
    sendProjectMessage('University of Westbridge', 'supervisor', session.fullName, draft.trim());
    setDraft('');
  };

  const handleExportCohortCsv = () => {
    const doneCount = liveProject.tasks.filter((t) => t.completed).length;
    const livePct = liveProject.tasks.length
      ? Math.round((doneCount / liveProject.tasks.length) * 100)
      : 0;
    const rows = [
      [liveProject.studentName, liveProject.code, liveProject.title, `${livePct}%`, 'Active'],
      ...state.supervisorExtraStudents.map((s) => [
        s.name,
        s.studentCode,
        s.projectTitle,
        `${s.progress}%`,
        s.attentionStatus,
      ]),
    ];
    downloadCsv('supervision_cohort_report.csv', ['Student', 'Code', 'Project Title', 'Progress', 'Status'], rows);
  };

  const handleExportCohortMarkdown = () => {
    const doneCount = liveProject.tasks.filter((t) => t.completed).length;
    const livePct = liveProject.tasks.length
      ? Math.round((doneCount / liveProject.tasks.length) * 100)
      : 0;
    const lines = [
      `# Supervision Cohort Report — ${session.fullName}`,
      `- **Institution:** ${institutionName}`,
      `- **Generated:** ${new Date().toISOString().slice(0, 10)}`,
      '',
      '## Assigned Students',
      `- **${liveProject.studentName}** (${liveProject.code}) · ${liveProject.title} — ${livePct}%`,
      ...state.supervisorExtraStudents.map(
        (s) => `- **${s.name}** (${s.studentCode}) · ${s.projectTitle} — ${s.progress}% (${s.attentionStatus})`
      ),
    ];
    downloadTextReport('supervision_cohort_report.md', lines.join('\n'));
  };

  return (
    <PortalLayout navItems={getPortalNavItems('supervisor')}>
      <div className="space-y-1 print:hidden">
        <p className="font-mono text-xs font-medium text-[#2563EB]">{institutionName}</p>
        <h1 className="font-display text-2xl font-bold text-[#172554]">
          Student Messaging &amp; Cohort Reports
        </h1>
        <p className="text-sm text-[#64748B]">
          Message supervised students and print or export a supervision cohort summary.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <section className="lg:col-span-5 flex flex-col rounded-2xl border border-slate-200 bg-white overflow-hidden print:hidden">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="font-display text-base font-bold text-[#172554]">
              Student Thread · {liveProject.studentName}
            </h2>
            <p className="text-xs text-[#64748B]">{liveProject.code}</p>
          </div>

          <div className="flex-1 max-h-96 overflow-y-auto p-4 space-y-3 bg-[#F8FAFC]">
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
                        ? 'bg-[#172554] text-white'
                        : 'border border-slate-200 bg-white text-[#172554]'
                    }`}
                  >
                    <p>{msg.body}</p>
                  </div>
                  <span className="mt-1 font-mono text-[11px] text-[#64748B]">
                    {msg.senderName} · {msg.sentAt}
                  </span>
                </div>
              );
            })}
          </div>

          <form onSubmit={handleSend} className="border-t border-slate-200 p-3 flex gap-2 bg-white">
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Write a message to student..."
              className="flex-1 min-h-[44px] rounded-lg border border-slate-300 px-3 text-base sm:text-sm text-[#172554] focus:border-[#2563EB] focus:outline-none"
            />
            <Button type="submit" variant="primary" size="md" aria-label="Send message">
              <Send className="h-4 w-4" aria-hidden="true" />
            </Button>
          </form>
        </section>

        <section className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 space-y-5 print:col-span-12 print:border-0 print:p-0">
          <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-mono text-xs font-semibold text-[#2563EB]">
                SUPERVISION COHORT REPORT
              </p>
              <h2 className="font-display text-xl font-bold text-[#172554]">
                {session.fullName} · Assigned Projects
              </h2>
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

          <div className="divide-y divide-slate-100 text-sm">
            <div className="py-3 flex items-center justify-between gap-2">
              <div>
                <p className="font-semibold text-[#172554]">{liveProject.studentName}</p>
                <p className="text-xs text-[#64748B]">{liveProject.title}</p>
              </div>
              <span className="font-mono text-xs font-bold text-[#172554] tabular-nums">
                {liveProject.tasks.filter((t) => t.completed).length}/{liveProject.tasks.length} tasks
              </span>
            </div>
            {state.supervisorExtraStudents.map((stu) => (
              <div key={stu.id} className="py-3 flex items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-[#172554]">{stu.name}</p>
                  <p className="text-xs text-[#64748B]">{stu.projectTitle}</p>
                </div>
                <span className="font-mono text-xs font-bold text-[#172554] tabular-nums">
                  {stu.progress}% · {stu.attentionStatus}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </PortalLayout>
  );
}
