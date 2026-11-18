import { useEffect, useMemo, useState } from 'react';
import PortalLayout from '../../../components/layout/PortalLayout';
import Button from '../../../components/ui/Button';
import EmptyState from '../../../components/ui/EmptyState';
import FormField from '../../../components/ui/FormField';
import StatusAlert from '../../../components/ui/StatusAlert';
import {
  GRACE_POLYTECHNIC_BRAND,
  GRACE_POLYTECHNIC_PROVISIONAL_CATALOGUE,
} from '../../../config/gracePolytechnic';
import {
  GRACE_INSTITUTION_NAME,
  resolveInstitutionKey,
  resolveWorkspaceInstitution,
  useDemoAppState,
} from '../../../context/DemoAppStateContext';
import { useDemoSession } from '../../../context/DemoSessionContext';
import { getPortalNavItems } from '../../../utils/roleRouting';

const DEFAULT_LEVEL_OPTIONS = GRACE_POLYTECHNIC_PROVISIONAL_CATALOGUE.qualificationLevels.map(
  (l) => l.code
);
const DEFAULT_MODE_OPTIONS = GRACE_POLYTECHNIC_PROVISIONAL_CATALOGUE.studyModes.map(
  (m) => m.label
);

export default function InstitutionStructurePage() {
  const { activeMembership, session } = useDemoSession();
  const {
    state,
    updateInstitutionInfo,
    addInstitutionDepartment,
    addAcademicSession,
    activateAcademicSession,
  } = useDemoAppState();

  const institutionName = resolveWorkspaceInstitution(activeMembership, session);
  const instKey = resolveInstitutionKey(state.institutionsState, institutionName);
  const inst = instKey ? state.institutionsState[instKey] : null;
  const isGraceWorkspace = inst?.info?.name === GRACE_INSTITUTION_NAME;

  const schoolsList =
    inst?.schools?.length > 0 ? inst.schools : GRACE_POLYTECHNIC_PROVISIONAL_CATALOGUE.schools;

  const [contactEmail, setContactEmail] = useState(inst?.info?.contactEmail || '');
  const [country, setCountry] = useState(inst?.info?.country || '');
  const [deptName, setDeptName] = useState('');
  const [deptCode, setDeptCode] = useState('');
  const [schoolId, setSchoolId] = useState(schoolsList[0]?.id || 'ssrt');
  const [programmeName, setProgrammeName] = useState('');
  const [selectedLevels, setSelectedLevels] = useState(['ND', 'HND']);
  const [selectedModes, setSelectedModes] = useState(['Full-Time', 'Part-Time']);
  const [schoolFilter, setSchoolFilter] = useState('All');
  const [sessionName, setSessionName] = useState('');
  const [banner, setBanner] = useState('');

  useEffect(() => {
    if (inst?.info) {
      setContactEmail(inst.info.contactEmail || '');
      setCountry(inst.info.country || '');
    }
    if (inst?.schools?.length > 0) {
      setSchoolId(inst.schools[0].id);
    }
  }, [instKey, inst?.info, inst?.schools]);

  const filteredDepartments = useMemo(() => {
    const depts = inst?.departments || [];
    if (schoolFilter === 'All') return depts;
    return depts.filter((d) => (d.schoolName || d.schoolId) === schoolFilter);
  }, [inst?.departments, schoolFilter]);

  const schoolTabOptions = useMemo(() => {
    const names = Array.from(
      new Set((inst?.departments || []).map((d) => d.schoolName).filter(Boolean))
    );
    return ['All', ...names];
  }, [inst?.departments]);

  if (!inst) {
    return (
      <PortalLayout navItems={getPortalNavItems('institution_admin')}>
        <div className="spt-surface rounded-2xl p-6">
          <EmptyState
            title="Institutional structure unavailable"
            description="No institutional catalogue was found for the current account scope."
          />
        </div>
      </PortalLayout>
    );
  }

  const toggleSelection = (list, setList, value) => {
    if (list.includes(value)) {
      if (list.length === 1) return;
      setList(list.filter((item) => item !== value));
    } else {
      setList([...list, value]);
    }
  };

  const handleSaveInfo = (e) => {
    e.preventDefault();
    updateInstitutionInfo(instKey, { contactEmail, country });
    setBanner('Institution profile details updated.');
  };

  const handleAddDepartment = (e) => {
    e.preventDefault();
    if (!deptName.trim()) return;
    addInstitutionDepartment(instKey, deptName.trim(), programmeName.trim(), {
      code: deptCode.trim(),
      schoolId,
      qualificationLevels: selectedLevels,
      studyModes: selectedModes,
    });
    setDeptName('');
    setDeptCode('');
    setProgrammeName('');
    setBanner('New department and provisional programme structure added.');
  };

  const handleAddSession = (e) => {
    e.preventDefault();
    if (!sessionName.trim()) return;
    addAcademicSession(instKey, sessionName.trim());
    setSessionName('');
    setBanner('New academic session created and marked active.');
  };

  const handleActivateSession = (ses) => {
    activateAcademicSession(instKey, ses.id);
    setBanner(`Marked ${ses.name} as the active academic session.`);
  };

  return (
    <PortalLayout navItems={getPortalNavItems('institution_admin')}>
      <div className="space-y-1">
        <p className="font-mono text-xs font-medium text-[var(--accent-primary)]">
          {inst.info.domain}
          {isGraceWorkspace ? ` · ${GRACE_POLYTECHNIC_BRAND.location}` : ''}
        </p>
        <h1 className="font-display text-2xl font-bold text-[var(--text-primary)]">
          Academic Structure, Schools &amp; Sessions
        </h1>
        <p className="text-sm text-[var(--text-muted)]">
          Manage Schools, departments, qualification levels (Pre-ND, ND, HND), study modes, and sessions scoped to {inst.info.name}.
        </p>
      </div>

      {isGraceWorkspace && (
        <StatusAlert type="info" title="Provisional Grace Polytechnic Catalogue">
          {GRACE_POLYTECHNIC_PROVISIONAL_CATALOGUE.verificationNote} Records remain flagged as
          provisional until verified by Institutional Academic Affairs.
        </StatusAlert>
      )}

      {banner && (
        <StatusAlert type="success" title="Saved">
          {banner}
        </StatusAlert>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <form
          onSubmit={handleSaveInfo}
          className="lg:col-span-5 spt-surface rounded-2xl p-5 space-y-4 self-start"
        >
          <h2 className="font-display text-base font-bold text-[var(--text-primary)]">
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
            helperText="Demo contact placeholder for institutional project administration."
            required
          />
          <FormField
            id="inst-info-country"
            label="Country / Region"
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
            className="spt-surface rounded-2xl p-5 space-y-4"
          >
            <h2 className="font-display text-base font-bold text-[var(--text-primary)]">
              Add Department &amp; Programme
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <FormField
                  id="new-dept-name"
                  label="Department name"
                  placeholder="e.g. Science Laboratory Technology"
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  required
                />
              </div>
              <FormField
                id="new-dept-code"
                label="Short code"
                placeholder="e.g. SLT"
                value={deptCode}
                onChange={(e) => setDeptCode(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                id="new-dept-school"
                as="select"
                label="Parent School"
                value={schoolId}
                onChange={(e) => setSchoolId(e.target.value)}
                options={schoolsList.map((s) => ({ value: s.id, label: s.name }))}
              />
              <FormField
                id="new-prog-name"
                label="Initial academic programme"
                placeholder="e.g. Science Laboratory Technology"
                value={programmeName}
                onChange={(e) => setProgrammeName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-1">
              <fieldset className="space-y-2">
                <legend className="text-xs font-semibold text-[var(--text-primary)]">
                  Qualification Levels
                </legend>
                <div className="flex flex-wrap gap-2">
                  {DEFAULT_LEVEL_OPTIONS.map((code) => {
                    const checked = selectedLevels.includes(code);
                    return (
                      <button
                        key={code}
                        type="button"
                        onClick={() => toggleSelection(selectedLevels, setSelectedLevels, code)}
                        aria-pressed={checked}
                        className={`rounded-lg border px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                          checked
                            ? 'border-[var(--accent-primary)] bg-blue-50 dark:bg-blue-950/50 text-[var(--accent-primary)]'
                            : 'border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-muted)]'
                        }`}
                      >
                        {code}
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <fieldset className="space-y-2">
                <legend className="text-xs font-semibold text-[var(--text-primary)]">
                  Study Modes
                </legend>
                <div className="flex flex-wrap gap-2">
                  {DEFAULT_MODE_OPTIONS.map((mode) => {
                    const checked = selectedModes.includes(mode);
                    return (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => toggleSelection(selectedModes, setSelectedModes, mode)}
                        aria-pressed={checked}
                        className={`rounded-lg border px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                          checked
                            ? 'border-[var(--accent-primary)] bg-blue-50 dark:bg-blue-950/50 text-[var(--accent-primary)]'
                            : 'border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-muted)]'
                        }`}
                      >
                        {mode}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            </div>

            <Button type="submit" variant="navy" size="sm">
              Add department
            </Button>

            {schoolTabOptions.length > 2 && (
              <div
                role="tablist"
                aria-label="Filter departments by School"
                className="flex items-center gap-1 overflow-x-auto rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-1"
              >
                {schoolTabOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    role="tab"
                    aria-selected={schoolFilter === opt}
                    onClick={() => setSchoolFilter(opt)}
                    className={`min-h-[32px] rounded-md px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                      schoolFilter === opt
                        ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-xs'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}

            <div className="border-t border-[var(--border-subtle)] pt-3 divide-y divide-[var(--border-subtle)]">
              {filteredDepartments.map((dept) => (
                <div key={dept.id} className="py-3 text-sm space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {dept.code && (
                        <span className="font-mono text-xs font-bold text-[var(--accent-primary)]">
                          {dept.code}
                        </span>
                      )}
                      <p className="font-semibold text-[var(--text-primary)]">{dept.name}</p>
                      {dept.provisional && (
                        <span className="rounded border border-amber-300 dark:border-amber-700/70 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-amber-800 dark:text-amber-300">
                          Provisional
                        </span>
                      )}
                    </div>
                    {dept.schoolName && (
                      <span className="text-[11px] font-medium text-[var(--text-muted)]">
                        {dept.schoolName}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--text-muted)]">
                    Programmes: {(dept.programmes || []).join(' · ') || 'None yet'}
                    {dept.qualificationLevels?.length
                      ? ` · Levels: ${dept.qualificationLevels.join(', ')}`
                      : ''}
                    {dept.studyModes?.length ? ` · Modes: ${dept.studyModes.join(', ')}` : ''}
                  </p>
                </div>
              ))}
            </div>
          </form>

          <form
            onSubmit={handleAddSession}
            className="spt-surface rounded-2xl p-5 space-y-4"
          >
            <h2 className="font-display text-base font-bold text-[var(--text-primary)]">
              Academic Sessions
            </h2>
            <div className="flex flex-col sm:flex-row gap-2.5">
              <input
                type="text"
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                placeholder="e.g. 2027/2028 Academic Session"
                aria-label="New academic session name"
                className="flex-1 min-h-[44px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 text-base sm:text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-primary)] focus:outline-none"
              />
              <Button type="submit" variant="primary" size="md">
                Add &amp; activate session
              </Button>
            </div>
            <div className="divide-y divide-[var(--border-subtle)]">
              {inst.sessions.map((ses) => (
                <div
                  key={ses.id}
                  className="py-2.5 flex flex-wrap items-center justify-between gap-2 text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-[var(--text-primary)]">{ses.name}</span>
                    {ses.provisional && (
                      <span className="rounded border border-amber-300 dark:border-amber-700/70 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-amber-800 dark:text-amber-300">
                        Provisional
                      </span>
                    )}
                  </div>
                  {ses.active ? (
                    <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                      Active Session
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleActivateSession(ses)}
                      className="text-xs font-semibold text-[var(--accent-primary)] hover:underline cursor-pointer"
                    >
                      Set as active
                    </button>
                  )}
                </div>
              ))}
            </div>
          </form>
        </section>
      </div>
    </PortalLayout>
  );
}

