import { useState } from 'react';
import { Download, FileText, Printer, Send } from 'lucide-react';
import StatusLabel from '../../../components/dashboard/StatusLabel';
import PortalLayout from '../../../components/layout/PortalLayout';
import Button from '../../../components/ui/Button';
import { useDemoAppState } from '../../../context/DemoAppStateContext';
import { useDemoSession } from '../../../context/DemoSessionContext';
import { downloadCsv, downloadTextReport } from '../../../utils/csvExport';
import { getPortalNavItems } from '../../../utils/roleRouting';

export default function StudentMessagesReportsPage() {
  const { session, activeMembership } = useDemoSession();
  const { state, sendProjectMessage } = useDemoAppState();
  const [draft, setDraft] = useState('');

  const institutionName = activeMembership?.institutionName || 'University of Westbridge';
  const project =
    state.projectsByInstitution[institutionName] ||
    state.projectsByInstitution['University of Westbridge'];

  const completedTasks = project.tasks.filter((t) => t.completed).length;
  const progressPct = project.tasks.length
    ? Math.round((completedTasks / project.tasks.length) * 100)
    : 0;

  const handleSend = (e) => {
    e.preventDefault();
    if (!draft.trim()) return;
    sendProjectMessage(institutionName, 'student', session.fullName, draft.trim());
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
      `- **Institution:** ${institutionName}`,
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
      `Generated on ${new Date().toISOString().slice(0, 10)} via Student Project Tracker`,
    ];
    downloadTextReport(`${project.code}_summary_report.md`, lines.join('\n'));
  };

  return (
    <PortalLayout navItems={getPortalNavItems('student')}>
      <div className="space-y-1 print:hidden">
        <p className="font-mono text-xs font-medium text-[#2563EB]">
          {project.code} · {institutionName}
        </p>
        <h1 className="font-display text-2xl font-bold text-[#172554]">
          Supervisor Messaging &amp; Progress Report
        </h1>
        <p className="text-sm text-[#64748B]">
          Communicate directly with {project.supervisorName} and print or export your academic progress report.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Messaging Panel (Hidden on Print) */}
        <section className="lg:col-span-5 flex flex-col rounded-2xl border border-slate-200 bg-white overflow-hidden print:hidden">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="font-display text-base font-bold text-[#172554]">
              Direct Thread · {project.supervisorName}
            </h2>
            <p className="text-xs text-[#64748B]">{project.supervisorEmail}</p>
          </div>

          <div className="flex-1 max-h-96 overflow-y-auto p-4 space-y-3 bg-[#F8FAFC]">
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
              placeholder="Write a message to your supervisor..."
              aria-label="Message text"
              className="flex-1 min-h-[44px] rounded-lg border border-slate-300 px-3 text-base sm:text-sm text-[#172554] focus:border-[#2563EB] focus:outline-none"
            />
            <Button type="submit" variant="primary" size="md" aria-label="Send message">
              <Send className="h-4 w-4" aria-hidden="true" />
            </Button>
          </form>
        </section>

        {/* Printable Academic Project Progress Report */}
        <section className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 space-y-5 print:col-span-12 print:border-0 print:p-0">
          <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-mono text-xs font-semibold text-[#2563EB]">
                OFFICIAL PROGRESS SUMMARY
              </p>
              <h2 className="font-display text-xl font-bold text-[#172554]">
                Student Project Progress Report
              </h2>
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

          <dl className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-2 sm:text-sm">
            <div>
              <dt className="text-[#64748B]">Student</dt>
              <dd className="font-semibold text-[#172554]">{project.studentName}</dd>
            </div>
            <div>
              <dt className="text-[#64748B]">Institution &amp; Department</dt>
              <dd className="font-semibold text-[#172554]">
                {institutionName} · {project.department}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-[#64748B]">Project Title</dt>
              <dd className="font-semibold text-[#172554]">{project.title}</dd>
            </div>
            <div>
              <dt className="text-[#64748B]">Assigned Supervisor</dt>
              <dd className="font-medium text-[#172554]">{project.supervisorName}</dd>
            </div>
            <div>
              <dt className="text-[#64748B]">Task Completion Rate</dt>
              <dd className="font-mono font-bold text-[#172554] tabular-nums">
                {completedTasks} / {project.tasks.length} ({progressPct}%)
              </dd>
            </div>
          </dl>

          <div className="space-y-2 border-t border-slate-100 pt-4">
            <h3 className="text-xs font-bold text-[#172554]">Milestone Status</h3>
            <div className="divide-y divide-slate-100">
              {project.milestones.map((ms) => (
                <div key={ms.id} className="py-2 flex items-center justify-between gap-2 text-xs">
                  <span className="font-medium text-[#172554]">{ms.title}</span>
                  <StatusLabel status={ms.status} />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2 border-t border-slate-100 pt-4">
            <h3 className="text-xs font-bold text-[#172554]">
              Logged Weekly Journals: {project.journals.length} · Submitted Chapters:{' '}
              {project.submissions.length}
            </h3>
            <p className="text-xs text-[#64748B] tabular-nums">
              Generated {new Date().toISOString().slice(0, 10)} · Student Project Tracker
            </p>
          </div>
        </section>
      </div>
    </PortalLayout>
  );
}
