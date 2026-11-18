import { useEffect, useMemo, useState } from 'react';
import { FolderPlus, Search } from 'lucide-react';
import PortalLayout from '../../../components/layout/PortalLayout';
import Button from '../../../components/ui/Button';
import EmptyState from '../../../components/ui/EmptyState';
import FormField from '../../../components/ui/FormField';
import StatusAlert from '../../../components/ui/StatusAlert';
import {
  resolveInstitutionKey,
  resolveWorkspaceInstitution,
  useDemoAppState,
} from '../../../context/DemoAppStateContext';
import { useDemoSession } from '../../../context/DemoSessionContext';
import { getPortalNavItems } from '../../../utils/roleRouting';

const ALLOCATION_FILTERS = ['All', 'Unassigned', 'Assigned'];

export default function InstitutionProjectsPage() {
  const { activeMembership, session } = useDemoSession();
  const { state, assignSupervisorToProject, createInstitutionProject } = useDemoAppState();

  const institutionName = resolveWorkspaceInstitution(activeMembership, session);
  const instKey = resolveInstitutionKey(state.institutionsState, institutionName);
  const inst = instKey ? state.institutionsState[instKey] : null;

  const [title, setTitle] = useState('');
  const [studentName, setStudentName] = useState('');
  const [department, setDepartment] = useState(inst?.departments?.[0]?.name || '');
  const [supervisorName, setSupervisorName] = useState('Unassigned');
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [allocationFilter, setAllocationFilter] = useState('All');
  const [banner, setBanner] = useState('');

  useEffect(() => {
    if (inst?.departments?.[0]?.name) {
      setDepartment((prev) => prev || inst.departments[0].name);
    }
  }, [instKey, inst?.departments]);

  const projects = inst?.projects || [];
  const unassignedCount = projects.filter((p) => p.supervisorName === 'Unassigned').length;
  const assignedCount = projects.length - unassignedCount;

  const filteredProjects = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return projects.filter((p) => {
      const matchesDept = deptFilter === 'All' || p.department === deptFilter;
      const matchesAlloc =
        allocationFilter === 'All' ||
        (allocationFilter === 'Unassigned'
          ? p.supervisorName === 'Unassigned'
          : p.supervisorName !== 'Unassigned');
      const matchesQuery =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        p.studentName.toLowerCase().includes(q) ||
        p.supervisorName.toLowerCase().includes(q);
      return matchesDept && matchesAlloc && matchesQuery;
    });
  }, [projects, deptFilter, allocationFilter, searchQuery]);

  if (!inst) {
    return (
      <PortalLayout navItems={getPortalNavItems('institution_admin')}>
        <div className="spt-surface rounded-2xl p-6">
          <EmptyState
            title="Institutional projects unavailable"
            description="No institutional project registry matches the active session."
          />
        </div>
      </PortalLayout>
    );
  }

  const handleAssign = (proj, supName) => {
    assignSupervisorToProject(instKey, proj.id, supName);
    setBanner(`Assigned ${supName} to project ${proj.code}.`);
  };

  const handleCreateProject = (e) => {
    e.preventDefault();
    if (!title.trim() || !studentName.trim()) return;
    createInstitutionProject(instKey, {
      title: title.trim(),
      studentName: studentName.trim(),
      department: department || inst.departments[0]?.name,
      supervisorName,
    });
    setBanner(`Created project "${title.trim()}" for ${studentName.trim()}.`);
    setTitle('');
    setStudentName('');
    setSupervisorName('Unassigned');
  };

  return (
    <PortalLayout navItems={getPortalNavItems('institution_admin')}>
      <div className="space-y-1">
        <p className="font-mono text-xs font-medium text-[var(--accent-primary)]">{inst.info.domain}</p>
        <h1 className="font-display text-2xl font-bold text-[var(--text-primary)]">
          Projects &amp; Supervisor Assignments
        </h1>
        <p className="text-sm text-[var(--text-muted)]">
          Register student academic projects, allocate verified supervisors, and monitor allocation coverage across {inst.info.name}.
        </p>
      </div>

      {banner && (
        <StatusAlert type="success" title="Project list updated">
          {banner}
        </StatusAlert>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="spt-surface rounded-2xl p-4">
          <p className="text-xs font-medium text-[var(--text-muted)]">Tracked Projects</p>
          <p className="font-display text-2xl font-bold text-[var(--text-primary)] tabular-nums mt-1">
            {projects.length}
          </p>
        </div>
        <div className="spt-surface rounded-2xl p-4">
          <p className="text-xs font-medium text-[var(--text-muted)]">Supervisor Assigned</p>
          <p className="font-display text-2xl font-bold text-emerald-700 dark:text-emerald-400 tabular-nums mt-1">
            {assignedCount}
          </p>
        </div>
        <div className="spt-surface rounded-2xl p-4">
          <p className="text-xs font-medium text-[var(--text-muted)]">Awaiting Supervisor</p>
          <p className="font-display text-2xl font-bold text-amber-700 dark:text-amber-400 tabular-nums mt-1">
            {unassignedCount}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <form
          onSubmit={handleCreateProject}
          className="lg:col-span-4 spt-surface rounded-2xl p-5 space-y-4 self-start"
        >
          <div className="flex items-center gap-2 text-[var(--text-primary)]">
            <FolderPlus className="h-4 w-4 text-[var(--accent-primary)]" aria-hidden="true" />
            <h2 className="font-display text-base font-bold">Register New Project</h2>
          </div>

          <FormField
            id="proj-title"
            label="Academic project title"
            placeholder="e.g. Solar Microgrid Fault Detector"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <FormField
            id="proj-student"
            label="Approved student name"
            placeholder="e.g. Chinedu Okafor"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            required
          />
          <FormField
            id="proj-dept"
            as="select"
            label="Department"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            options={inst.departments.map((d) => d.name)}
          />
          <FormField
            id="proj-sup"
            as="select"
            label="Assign supervisor"
            value={supervisorName}
            onChange={(e) => setSupervisorName(e.target.value)}
            options={['Unassigned', ...inst.verifiedSupervisors]}
          />
          <Button type="submit" variant="navy" size="md" fullWidth>
            Create project
          </Button>
        </form>

        <section className="lg:col-span-8 space-y-4 self-start">
          <div className="spt-surface rounded-2xl p-4 space-y-3">
            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search project code, title, student, or supervisor..."
                  aria-label="Search institutional projects"
                  className="min-h-[40px] w-full rounded-lg border border-[var(--border-strong)] bg-[var(--bg-elevated)] pl-9 pr-3 text-base sm:text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-primary)] focus:outline-none"
                />
              </div>

              <select
                aria-label="Filter projects by department"
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="min-h-[40px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-elevated)] px-2.5 text-base sm:text-xs font-medium text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-none"
              >
                <option value="All">All Departments</option>
                {inst.departments.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div
              role="tablist"
              aria-label="Filter projects by allocation status"
              className="flex items-center gap-1 overflow-x-auto rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-1 w-fit max-w-full"
            >
              {ALLOCATION_FILTERS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  aria-selected={allocationFilter === tab}
                  onClick={() => setAllocationFilter(tab)}
                  className={`min-h-[32px] rounded-md px-3 py-1 text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    allocationFilter === tab
                      ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-xs'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {filteredProjects.length === 0 ? (
            <div className="spt-surface rounded-2xl p-6">
              <EmptyState
                title="No matching projects"
                description="Try clearing your search or switching back to All allocation statuses."
                actionLabel="Reset project filters"
                onAction={() => {
                  setSearchQuery('');
                  setDeptFilter('All');
                  setAllocationFilter('All');
                }}
              />
            </div>
          ) : (
            <div className="spt-surface rounded-2xl divide-y divide-[var(--border-subtle)]">
              {filteredProjects.map((proj) => (
                <div
                  key={proj.id}
                  className="p-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="space-y-1 min-w-0">
                    <p className="font-mono text-xs font-medium text-[var(--accent-primary)] tabular-nums">
                      {proj.code} · Progress {proj.progress}%
                    </p>
                    <p className="font-display text-base font-bold text-[var(--text-primary)]">
                      {proj.title}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      Student: <strong className="text-[var(--text-primary)]">{proj.studentName}</strong> ·{' '}
                      {proj.department}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 shrink-0">
                    <label
                      htmlFor={`assign-${proj.id}`}
                      className="text-xs font-medium text-[var(--text-muted)]"
                    >
                      Supervisor:
                    </label>
                    <select
                      id={`assign-${proj.id}`}
                      value={proj.supervisorName}
                      onChange={(e) => handleAssign(proj, e.target.value)}
                      className="min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 text-base sm:text-xs font-medium text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-none"
                    >
                      <option value="Unassigned">Unassigned</option>
                      {inst.verifiedSupervisors.map((sup) => (
                        <option key={sup} value={sup}>
                          {sup}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </PortalLayout>
  );
}

