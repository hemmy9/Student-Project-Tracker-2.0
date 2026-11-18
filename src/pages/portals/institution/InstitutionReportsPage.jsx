import { Download, FileText, Printer } from 'lucide-react';
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

export default function InstitutionReportsPage() {
  const { activeMembership, session } = useDemoSession();
  const { state } = useDemoAppState();

  const institutionName = resolveWorkspaceInstitution(activeMembership, session);
  const instKey = resolveInstitutionKey(state.institutionsState, institutionName);
  const inst = instKey ? state.institutionsState[instKey] : null;

  if (!inst) {
    return (
      <PortalLayout navItems={getPortalNavItems('institution_admin')}>
        <div className="spt-surface rounded-2xl p-6">
          <EmptyState
            title="Institutional reports unavailable"
            description="No institutional record matches the active workspace scope."
          />
        </div>
      </PortalLayout>
    );
  }

  const isGraceWorkspace = inst.info.name === GRACE_INSTITUTION_NAME;
  const activeSession =
    inst.sessions.find((s) => s.active)?.name || inst.sessions[0]?.name || 'Active Session';
  const generatedIso = getCurrentIsoDate();
  const generatedLabel = formatDisplayDate(generatedIso);

  const assignedProjects = inst.projects.filter((p) => p.supervisorName !== 'Unassigned').length;
  const unassignedProjects = inst.projects.length - assignedProjects;

  const schoolGroups = (() => {
    const map = new Map();
    inst.departments.forEach((d) => {
      const label = d.schoolName || 'Academic Departments';
      if (!map.has(label)) map.set(label, []);
      map.get(label).push(d);
    });
    return Array.from(map.entries()).map(([schoolName, items]) => ({ schoolName, items }));
  })();

  const handleExportCsv = () => {
    downloadCsv(
      `${inst.info.shortCode || 'GP'}_institutional_projects.csv`,
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
      `- **Academic Session:** ${activeSession}`,
      `- **Generated:** ${generatedIso}`,
      '',
      '## Departments',
      ...inst.departments.map(
        (d) =>
          `- **${d.code ? `[${d.code}] ` : ''}${d.name}**${d.schoolName ? ` (${d.schoolName})` : ''}: ${d.students} students, ${d.supervisors} supervisors (${d.programmes.join(', ')})`
      ),
      '',
      '## Tracked Academic Projects',
      ...inst.projects.map(
        (p) =>
          `- **${p.code}** — ${p.title} | Student: ${p.studentName} | Supervisor: ${p.supervisorName} (${p.progress}%)`
      ),
    ];
    downloadTextReport(`${inst.info.shortCode || 'GP'}_institutional_report.md`, lines.join('\n'));
  };

  return (
    <PortalLayout navItems={getPortalNavItems('institution_admin')}>
      <div className="spt-surface spt-print-report rounded-2xl p-5 sm:p-8 space-y-6 print:border-0 print:p-0">
        {/* Printable Official Letterhead */}
        <div className="spt-print-avoid-break border-b border-[var(--border-subtle)] pb-5 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <p className="font-mono text-xs font-semibold uppercase tracking-wide text-[var(--accent-primary)]">
                INSTITUTIONAL REPORT · {inst.info.domain}
                {isGraceWorkspace ? ` · ${GRACE_POLYTECHNIC_BRAND.location}` : ''}
              </p>
              <h1 className="font-display text-2xl font-bold text-[var(--text-primary)]">
                {inst.info.name} — Project Supervision Summary
              </h1>
              <p className="text-xs text-[var(--text-muted)]">
                {activeSession} · Generated {generatedLabel} ({generatedIso})
              </p>
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

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-3.5 text-xs">
            <div>
              <span className="text-[var(--text-muted)] block">Departments</span>
              <strong className="font-display text-base text-[var(--text-primary)] tabular-nums">
                {inst.departments.length}
              </strong>
            </div>
            <div>
              <span className="text-[var(--text-muted)] block">Tracked Projects</span>
              <strong className="font-display text-base text-[var(--text-primary)] tabular-nums">
                {inst.projects.length}
              </strong>
            </div>
            <div>
              <span className="text-[var(--text-muted)] block">Assigned</span>
              <strong className="font-display text-base text-emerald-700 dark:text-emerald-400 tabular-nums">
                {assignedProjects}
              </strong>
            </div>
            <div>
              <span className="text-[var(--text-muted)] block">Unassigned</span>
              <strong className="font-display text-base text-amber-700 dark:text-amber-400 tabular-nums">
                {unassignedProjects}
              </strong>
            </div>
          </div>

          {isGraceWorkspace && (
            <p className="text-[11px] text-[var(--text-muted)] italic">
              Note: Departmental structure and academic programme catalogue figures reflect the provisional
              Grace Polytechnic demo dataset pending Academic Affairs sign-off.
            </p>
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-sm font-bold text-[var(--text-primary)]">
            Schools &amp; Department Summary
          </h2>
          <div className="space-y-4">
            {schoolGroups.map((group) => (
              <div
                key={group.schoolName}
                className="spt-print-avoid-break rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4 space-y-2.5"
              >
                <h3 className="font-display text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]">
                  {group.schoolName}
                </h3>
                <div className="divide-y divide-[var(--border-subtle)]">
                  {group.items.map((d) => (
                    <div
                      key={d.id}
                      className="py-2.5 first:pt-0 last:pb-0 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between text-sm"
                    >
                      <div>
                        <p className="font-semibold text-[var(--text-primary)]">
                          {d.code ? `${d.code} · ` : ''}
                          {d.name}
                          {d.provisional ? ' (Provisional)' : ''}
                        </p>
                        <p className="text-xs text-[var(--text-muted)]">
                          {d.programmes.join(' · ')}
                          {d.qualificationLevels?.length ? ` · ${d.qualificationLevels.join('/')}` : ''}
                          {d.studyModes?.length ? ` · ${d.studyModes.join(' / ')}` : ''}
                        </p>
                      </div>
                      <p className="font-mono text-xs text-[var(--text-primary)] tabular-nums shrink-0">
                        {d.students} students · {d.supervisors} supervisors
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="spt-print-avoid-break space-y-3 border-t border-[var(--border-subtle)] pt-5">
          <h2 className="text-sm font-bold text-[var(--text-primary)]">Tracked Institutional Projects</h2>
          <div className="divide-y divide-[var(--border-subtle)]">
            {inst.projects.map((p) => (
              <div
                key={p.id}
                className="py-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm"
              >
                <div>
                  <p className="font-semibold text-[var(--text-primary)]">
                    {p.code} · {p.title}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    Student: {p.studentName} · Supervisor: {p.supervisorName}
                  </p>
                </div>
                <span className="font-mono text-xs font-bold text-[var(--text-primary)] tabular-nums">
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

