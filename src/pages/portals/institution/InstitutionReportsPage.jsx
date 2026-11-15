import { Download, FileText, Printer } from 'lucide-react';
import PortalLayout from '../../../components/layout/PortalLayout';
import Button from '../../../components/ui/Button';
import { useDemoAppState } from '../../../context/DemoAppStateContext';
import { useDemoSession } from '../../../context/DemoSessionContext';
import { downloadCsv, downloadTextReport } from '../../../utils/csvExport';
import { getPortalNavItems } from '../../../utils/roleRouting';

export default function InstitutionReportsPage() {
  const { activeMembership } = useDemoSession();
  const { state } = useDemoAppState();

  const institutionName = activeMembership?.institutionName || 'University of Westbridge';
  const inst =
    state.institutionsState[institutionName] ||
    state.institutionsState['University of Westbridge'];

  const handleExportCsv = () => {
    downloadCsv(
      `${inst.info.shortCode}_institutional_projects.csv`,
      ['Project Code', 'Project Title', 'Student', 'Department', 'Supervisor', 'Progress'],
      inst.projects.map((p) => [
        p.code,
        p.title,
        p.studentName,
        p.department,
        p.supervisorName,
        `${p.progress}%`,
      ])
    );
  };

  const handleExportMarkdown = () => {
    const lines = [
      `# ${inst.info.name} — Institutional Project Report`,
      `- **Domain:** ${inst.info.domain}`,
      `- **Generated:** ${new Date().toISOString().slice(0, 10)}`,
      '',
      '## Departments',
      ...inst.departments.map(
        (d) => `- **${d.name}**: ${d.students} students, ${d.supervisors} supervisors (${d.programmes.join(', ')})`
      ),
      '',
      '## Tracked Academic Projects',
      ...inst.projects.map(
        (p) => `- **${p.code}** — ${p.title} | Student: ${p.studentName} | Supervisor: ${p.supervisorName} (${p.progress}%)`
      ),
    ];
    downloadTextReport(`${inst.info.shortCode}_institutional_report.md`, lines.join('\n'));
  };

  return (
    <PortalLayout navItems={getPortalNavItems('institution_admin')}>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-8 space-y-6 print:border-0 print:p-0">
        <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-mono text-xs font-semibold text-[#2563EB]">
              INSTITUTIONAL REPORT · {inst.info.domain}
            </p>
            <h1 className="font-display text-2xl font-bold text-[#172554]">
              {inst.info.name} — Project Supervision Summary
            </h1>
          </div>

          <div className="flex flex-wrap gap-2 print:hidden">
            <Button type="button" variant="secondary" size="sm" onClick={handleExportMarkdown}>
              <FileText className="h-4 w-4 inline mr-1.5" aria-hidden="true" />
              Export MD
            </Button>
            <Button type="button" variant="secondary" size="sm" onClick={handleExportCsv}>
              <Download className="h-4 w-4 inline mr-1.5" aria-hidden="true" />
              Export CSV
            </Button>
            <Button type="button" variant="navy" size="sm" onClick={() => window.print()}>
              <Printer className="h-4 w-4 inline mr-1.5" aria-hidden="true" />
              Print institutional report
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-sm font-bold text-[#172554]">Department Summary</h2>
          <div className="divide-y divide-slate-100">
            {inst.departments.map((d) => (
              <div key={d.id} className="py-3 flex items-center justify-between gap-4 text-sm">
                <div>
                  <p className="font-semibold text-[#172554]">{d.name}</p>
                  <p className="text-xs text-[#64748B]">{d.programmes.join(' · ')}</p>
                </div>
                <p className="font-mono text-xs text-[#172554] tabular-nums shrink-0">
                  {d.students} students · {d.supervisors} supervisors
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3 border-t border-slate-100 pt-5">
          <h2 className="text-sm font-bold text-[#172554]">Tracked Institutional Projects</h2>
          <div className="divide-y divide-slate-100">
            {inst.projects.map((p) => (
              <div key={p.id} className="py-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm">
                <div>
                  <p className="font-semibold text-[#172554]">
                    {p.code} · {p.title}
                  </p>
                  <p className="text-xs text-[#64748B]">
                    Student: {p.studentName} · Supervisor: {p.supervisorName}
                  </p>
                </div>
                <span className="font-mono text-xs font-bold text-[#172554] tabular-nums">
                  {p.progress}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
