import { useState } from 'react';
import PortalLayout from '../../../components/layout/PortalLayout';
import Button from '../../../components/ui/Button';
import FormField from '../../../components/ui/FormField';
import StatusAlert from '../../../components/ui/StatusAlert';
import { useDemoAppState } from '../../../context/DemoAppStateContext';
import { useDemoSession } from '../../../context/DemoSessionContext';
import { getPortalNavItems } from '../../../utils/roleRouting';

export default function InstitutionStructurePage() {
  const { activeMembership } = useDemoSession();
  const {
    state,
    updateInstitutionInfo,
    addInstitutionDepartment,
    addAcademicSession,
  } = useDemoAppState();

  const institutionName = activeMembership?.institutionName || 'University of Westbridge';
  const inst =
    state.institutionsState[institutionName] ||
    state.institutionsState['University of Westbridge'];

  const [contactEmail, setContactEmail] = useState(inst.info.contactEmail);
  const [country, setCountry] = useState(inst.info.country);
  const [deptName, setDeptName] = useState('');
  const [programmeName, setProgrammeName] = useState('');
  const [sessionName, setSessionName] = useState('');
  const [banner, setBanner] = useState('');

  const handleSaveInfo = (e) => {
    e.preventDefault();
    updateInstitutionInfo(institutionName, { contactEmail, country });
    setBanner('Institution profile details updated.');
  };

  const handleAddDepartment = (e) => {
    e.preventDefault();
    if (!deptName.trim()) return;
    addInstitutionDepartment(institutionName, deptName.trim(), programmeName.trim());
    setDeptName('');
    setProgrammeName('');
    setBanner('New department and programme added.');
  };

  const handleAddSession = (e) => {
    e.preventDefault();
    if (!sessionName.trim()) return;
    addAcademicSession(institutionName, sessionName.trim());
    setSessionName('');
    setBanner('New academic session created and marked active.');
  };

  return (
    <PortalLayout navItems={getPortalNavItems('institution_admin')}>
      <div className="space-y-1">
        <p className="font-mono text-xs font-medium text-[#2563EB]">{inst.info.domain}</p>
        <h1 className="font-display text-2xl font-bold text-[#172554]">
          Departments, Programmes &amp; Sessions
        </h1>
        <p className="text-sm text-[#64748B]">
          Manage institutional configuration scoped exclusively to {inst.info.name}.
        </p>
      </div>

      {banner && (
        <StatusAlert type="success" title="Saved">
          {banner}
        </StatusAlert>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <form
          onSubmit={handleSaveInfo}
          className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-5 space-y-4 self-start"
        >
          <h2 className="font-display text-base font-bold text-[#172554]">
            Institution Information
          </h2>
          <FormField
            id="inst-info-name"
            label="Institution name"
            value={inst.info.name}
            onChange={() => {}}
            disabled
          />
          <FormField
            id="inst-info-email"
            type="email"
            label="Projects office email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            required
          />
          <FormField
            id="inst-info-country"
            label="Country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            required
          />
          <Button type="submit" variant="primary" size="md">
            Save institution profile
          </Button>
        </form>

        <section className="lg:col-span-7 space-y-6">
          <form
            onSubmit={handleAddDepartment}
            className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4"
          >
            <h2 className="font-display text-base font-bold text-[#172554]">
              Add Department &amp; Programme
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                id="new-dept-name"
                label="Department name"
                placeholder="e.g. Department of Data Science"
                value={deptName}
                onChange={(e) => setDeptName(e.target.value)}
                required
              />
              <FormField
                id="new-prog-name"
                label="Initial academic programme"
                placeholder="e.g. B.Sc. Data Analytics"
                value={programmeName}
                onChange={(e) => setProgrammeName(e.target.value)}
              />
            </div>
            <Button type="submit" variant="navy" size="sm">
              Add department
            </Button>

            <div className="border-t border-slate-100 pt-3 divide-y divide-slate-100">
              {inst.departments.map((dept) => (
                <div key={dept.id} className="py-2.5 text-sm">
                  <p className="font-semibold text-[#172554]">{dept.name}</p>
                  <p className="text-xs text-[#64748B]">
                    Programmes: {dept.programmes.join(' · ') || 'None yet'}
                  </p>
                </div>
              ))}
            </div>
          </form>

          <form
            onSubmit={handleAddSession}
            className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4"
          >
            <h2 className="font-display text-base font-bold text-[#172554]">
              Academic Sessions
            </h2>
            <div className="flex flex-col sm:flex-row gap-2.5">
              <input
                type="text"
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                placeholder="e.g. 2026/2027 Academic Session"
                className="flex-1 min-h-[44px] rounded-lg border border-slate-300 px-3 text-base sm:text-sm text-[#172554] focus:border-[#2563EB] focus:outline-none"
              />
              <Button type="submit" variant="primary" size="md">
                Activate new session
              </Button>
            </div>
            <div className="divide-y divide-slate-100">
              {inst.sessions.map((ses) => (
                <div key={ses.id} className="py-2.5 flex items-center justify-between text-sm">
                  <span className="font-medium text-[#172554]">{ses.name}</span>
                  <span
                    className={`text-xs font-semibold ${
                      ses.active ? 'text-emerald-700' : 'text-[#64748B]'
                    }`}
                  >
                    {ses.active ? 'Active Session' : 'Archived'}
                  </span>
                </div>
              ))}
            </div>
          </form>
        </section>
      </div>
    </PortalLayout>
  );
}
