import { useState } from 'react';
import { FolderPlus } from 'lucide-react';
import PortalLayout from '../../../components/layout/PortalLayout';
import Button from '../../../components/ui/Button';
import FormField from '../../../components/ui/FormField';
import StatusAlert from '../../../components/ui/StatusAlert';
import { useDemoAppState } from '../../../context/DemoAppStateContext';
import { useDemoSession } from '../../../context/DemoSessionContext';
import { getPortalNavItems } from '../../../utils/roleRouting';

export default function InstitutionProjectsPage() {
  const { activeMembership } = useDemoSession();
  const { state, assignSupervisorToProject, createInstitutionProject } = useDemoAppState();

  const institutionName = activeMembership?.institutionName || 'University of Westbridge';
  const inst =
    state.institutionsState[institutionName] ||
    state.institutionsState['University of Westbridge'];

  const [title, setTitle] = useState('');
  const [studentName, setStudentName] = useState('');
  const [department, setDepartment] = useState(inst.departments[0]?.name || '');
  const [supervisorName, setSupervisorName] = useState('Unassigned');
  const [banner, setBanner] = useState('');

  const handleAssign = (proj, supName) => {
    assignSupervisorToProject(institutionName, proj.id, supName);
    setBanner(`Assigned ${supName} to project ${proj.code}.`);
  };

  const handleCreateProject = (e) => {
    e.preventDefault();
    if (!title.trim() || !studentName.trim()) return;
    createInstitutionProject(institutionName, {
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
        <p className="font-mono text-xs font-medium text-[#2563EB]">{inst.info.domain}</p>
        <h1 className="font-display text-2xl font-bold text-[#172554]">
          Projects &amp; Supervisor Assignments
        </h1>
        <p className="text-sm text-[#64748B]">
          Register student academic projects, allocate verified supervisors, and monitor progress across departments.
        </p>
      </div>

      {banner && (
        <StatusAlert type="success" title="Project list updated">
          {banner}
        </StatusAlert>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <form
          onSubmit={handleCreateProject}
          className="lg:col-span-4 rounded-2xl border border-slate-200 bg-white p-5 space-y-4 self-start"
        >
          <div className="flex items-center gap-2 text-[#172554]">
            <FolderPlus className="h-4 w-4 text-[#2563EB]" aria-hidden="true" />
            <h2 className="font-display text-base font-bold">Register New Project</h2>
          </div>

          <FormField
            id="proj-title"
            label="Academic project title"
            placeholder="e.g. Low-Cost IoT Grain Moisture Monitor"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <FormField
            id="proj-student"
            label="Approved student name"
            placeholder="e.g. Nadia Mensah"
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

        <div className="lg:col-span-8 rounded-2xl border border-slate-200 bg-white divide-y divide-slate-100 self-start">
          {inst.projects.map((proj) => (
            <div
              key={proj.id}
              className="p-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="space-y-1 min-w-0">
                <p className="font-mono text-xs font-medium text-[#2563EB] tabular-nums">
                  {proj.code} · Progress {proj.progress}%
                </p>
                <p className="font-display text-base font-bold text-[#172554]">{proj.title}</p>
                <p className="text-xs text-[#64748B]">
                  Student: <strong className="text-[#172554]">{proj.studentName}</strong> ·{' '}
                  {proj.department}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 shrink-0">
                <label htmlFor={`assign-${proj.id}`} className="text-xs font-medium text-[#64748B]">
                  Supervisor:
                </label>
                <select
                  id={`assign-${proj.id}`}
                  value={proj.supervisorName}
                  onChange={(e) => handleAssign(proj, e.target.value)}
                  className="min-h-[44px] rounded-lg border border-slate-300 bg-white px-3 text-base sm:text-xs font-medium text-[#172554] focus:border-[#2563EB] focus:outline-none"
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
      </div>
    </PortalLayout>
  );
}
