import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Search, X } from 'lucide-react';
import { useDemoAppState } from '../../context/DemoAppStateContext';
import { useAuthGuard } from '../../hooks/useAuthGuard';
import { getPortalNavItems } from '../../utils/roleRouting';

export default function SmartSearchBar() {
  const { activeMembership, isAuthenticated } = useAuthGuard();
  const { state } = useDemoAppState();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const roleKey = activeMembership?.roleKey || '';
  const institutionName = activeMembership?.institutionName || 'University of Westbridge';

  // Keyboard shortcut: "/" focuses smart search when not already typing in an input
  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = document.activeElement?.tagName?.toLowerCase();
      const isTyping = tag === 'input' || tag === 'textarea' || tag === 'select';
      if (e.key === '/' && !isTyping) {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      } else if (e.key === 'Escape') {
        setOpen(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchIndex = useMemo(() => {
    if (!isAuthenticated || !roleKey) return [];
    const items = [];

    // 1. Authorized Portal Pages
    getPortalNavItems(roleKey).forEach((nav) => {
      items.push({
        id: `nav-${nav.to}`,
        group: 'Portal Pages',
        title: nav.label,
        subtitle: `Navigate to ${nav.to}`,
        to: nav.to,
      });
    });

    const project =
      state.projectsByInstitution[institutionName] ||
      state.projectsByInstitution['University of Westbridge'];

    if (roleKey === 'student' && project) {
      project.tasks.forEach((t) => {
        items.push({
          id: `task-${t.id}`,
          group: 'Tasks',
          title: t.title,
          subtitle: `${t.priority || 'Medium'} priority · Due ${t.dueDate}`,
          to: '/student/tasks',
        });
      });
      project.milestones.forEach((m) => {
        items.push({
          id: `ms-${m.id}`,
          group: 'Milestones',
          title: m.title,
          subtitle: `${m.status} · Due ${m.dueDate}`,
          to: '/student/milestones',
        });
      });
      const office = state.officeHoursByInstitution?.[institutionName];
      (office?.availabilitySlots || [])
        .filter((s) => s.active)
        .forEach((s) => {
          items.push({
            id: `oh-${s.id}`,
            group: 'Office Hours',
            title: `${s.dayOfWeek} ${s.startTime}–${s.endTime}`,
            subtitle: `${s.supervisorName} · ${s.mode}`,
            to: '/student/office-hours',
          });
        });
      project.submissions.forEach((s) => {
        items.push({
          id: `sub-${s.id}`,
          group: 'Documents',
          title: `${s.title} (${s.version})`,
          subtitle: `${s.status} · ${s.fileName}`,
          to: '/student/documents',
        });
      });
      project.journals.forEach((j) => {
        items.push({
          id: `j-${j.id}`,
          group: 'Weekly Journals',
          title: `Week ${j.weekNumber} Journal (${j.date})`,
          subtitle: j.summary.slice(0, 72),
          to: '/student/journals',
        });
      });
    }

    if (roleKey === 'supervisor') {
      if (project) {
        items.push({
          id: 'sup-primary',
          group: 'Assigned Students',
          title: project.studentName,
          subtitle: project.title,
          to: '/supervisor/students',
        });
      }
      state.supervisorExtraStudents.forEach((stu) => {
        items.push({
          id: `stu-${stu.id}`,
          group: 'Assigned Students',
          title: `${stu.name} (${stu.studentCode})`,
          subtitle: `${stu.attentionStatus} · ${stu.projectTitle}`,
          to: '/supervisor/students',
        });
      });
      state.supervisorExtraSubmissions.forEach((rev) => {
        items.push({
          id: `rev-${rev.id}`,
          group: 'Review Queue',
          title: rev.documentTitle,
          subtitle: `${rev.studentName} · ${rev.status}`,
          to: '/supervisor/reviews',
        });
      });
    }

    if (roleKey === 'institution_admin') {
      const inst =
        state.institutionsState[institutionName] ||
        state.institutionsState['University of Westbridge'];
      if (inst) {
        inst.departments.forEach((d) => {
          items.push({
            id: `dept-${d.id}`,
            group: 'Departments',
            title: d.name,
            subtitle: `${d.students} students · ${d.supervisors} supervisors`,
            to: '/institution/structure',
          });
        });
        inst.membershipRequests.forEach((r) => {
          items.push({
            id: `req-${r.id}`,
            group: 'Membership Approvals',
            title: `${r.name} (${r.role})`,
            subtitle: `${r.status} · ${r.identifier}`,
            to: '/institution/approvals',
          });
        });
        inst.projects.forEach((p) => {
          items.push({
            id: `ip-${p.id}`,
            group: 'Institutional Projects',
            title: `${p.code}: ${p.title}`,
            subtitle: `${p.studentName} · Supervisor: ${p.supervisorName}`,
            to: '/institution/projects',
          });
        });
      }
    }

    if (roleKey === 'platform_admin') {
      state.platformState.institutions.forEach((inst) => {
        items.push({
          id: `plat-inst-${inst.id}`,
          group: 'Institutions',
          title: inst.institutionName,
          subtitle: `${inst.status} · ${inst.domain}`,
          to:
            inst.status === 'Pending Review'
              ? '/platform/applications'
              : '/platform/institutions',
        });
      });
    }

    return items;
  }, [isAuthenticated, roleKey, institutionName, state]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return searchIndex.slice(0, 6);
    return searchIndex
      .filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.subtitle.toLowerCase().includes(q) ||
          item.group.toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [searchIndex, query]);

  if (!isAuthenticated) return null;

  return (
    <div ref={containerRef} className="relative print:hidden">
      <div className="relative flex items-center">
        <Search
          className="pointer-events-none absolute left-3.5 h-4 w-4 text-[#64748B]"
          aria-hidden="true"
        />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          placeholder={`Smart search (${activeMembership.roleLabel} workspace)...`}
          aria-label="Smart workspace search"
          className="min-h-[44px] w-full rounded-xl border border-slate-200 bg-white pl-10 pr-20 text-base sm:text-sm text-[#172554] placeholder:text-slate-400 focus:border-[#2563EB] focus:outline-none"
        />
        <div className="absolute right-2.5 flex items-center gap-1.5">
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              aria-label="Clear search"
              className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-[#172554] cursor-pointer"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center rounded border border-slate-200 bg-[#F8FAFC] px-1.5 py-0.5 font-mono text-[11px] font-medium text-[#64748B]">
            /
          </kbd>
        </div>
      </div>

      {open && (
        <div
          role="listbox"
          aria-label="Smart search suggestions"
          className="absolute left-0 right-0 mt-2 max-h-80 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-xl z-30 space-y-1"
        >
          <p className="px-3 py-1 text-[11px] font-semibold text-[#64748B]">
            {query.trim()
              ? `Matching results in ${activeMembership.roleLabel} scope (${results.length})`
              : `Quick jump · ${activeMembership.roleLabel} workspace`}
          </p>

          {results.length === 0 ? (
            <p className="px-3 py-4 text-center text-xs text-[#64748B]">
              No items found for &ldquo;{query}&rdquo; in your current role scope.
            </p>
          ) : (
            results.map((item) => (
              <button
                key={item.id}
                type="button"
                role="option"
                onClick={() => {
                  setOpen(false);
                  setQuery('');
                  navigate(item.to);
                }}
                className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-[#F8FAFC] cursor-pointer"
              >
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-[#2563EB]">{item.group}</p>
                  <p className="text-sm font-semibold text-[#172554] truncate">{item.title}</p>
                  <p className="text-xs text-[#64748B] truncate">{item.subtitle}</p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
