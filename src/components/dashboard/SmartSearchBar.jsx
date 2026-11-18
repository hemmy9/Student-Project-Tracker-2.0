import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Search, X } from 'lucide-react';
import {
  GRACE_INSTITUTION_NAME,
  resolveInstitutionKey,
  resolveWorkspaceInstitution,
  useDemoAppState,
} from '../../context/DemoAppStateContext';
import { useDemoSession } from '../../context/DemoSessionContext';
import { useAuthGuard } from '../../hooks/useAuthGuard';
import { getPortalNavItems, getProfilePathForRole } from '../../utils/roleRouting';

export default function SmartSearchBar() {
  const { activeMembership, isAuthenticated } = useAuthGuard();
  const { session } = useDemoSession();
  const { state } = useDemoAppState();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const roleKey = activeMembership?.roleKey || '';
  const institutionName = resolveWorkspaceInstitution(activeMembership, session);

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

    const profilePath = getProfilePathForRole(roleKey);
    if (profilePath) {
      items.push({
        id: 'nav-profile',
        group: 'Portal Pages',
        title: 'My Profile',
        subtitle: `Navigate to ${profilePath} · Identity & editable contact info`,
        to: profilePath,
      });
    }

    const projectKey = resolveInstitutionKey(state.projectsByInstitution, institutionName);
    const project = projectKey ? state.projectsByInstitution[projectKey] : null;
    const officeKey = resolveInstitutionKey(state.officeHoursByInstitution, institutionName);
    const office = officeKey ? state.officeHoursByInstitution[officeKey] : null;

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
      if (institutionName === GRACE_INSTITUTION_NAME) {
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
    }

    if (roleKey === 'institution_admin') {
      const instKey = resolveInstitutionKey(state.institutionsState, institutionName);
      const inst = instKey ? state.institutionsState[instKey] : null;
      if (inst) {
        inst.departments.forEach((d) => {
          items.push({
            id: `dept-${d.id}`,
            group: 'Departments',
            title: d.name,
            subtitle: `${d.students} students · ${d.supervisors} supervisors`,
            to: '/admin/structure',
          });
        });
        inst.membershipRequests.forEach((r) => {
          items.push({
            id: `req-${r.id}`,
            group: 'Membership Approvals',
            title: `${r.name} (${r.role})`,
            subtitle: `${r.status} · ${r.identifier}`,
            to: '/admin/approvals',
          });
        });
        inst.projects.forEach((p) => {
          items.push({
            id: `ip-${p.id}`,
            group: 'Institutional Projects',
            title: `${p.code}: ${p.title}`,
            subtitle: `${p.studentName} · Supervisor: ${p.supervisorName}`,
            to: '/admin/projects',
          });
        });
      }
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
          className="pointer-events-none absolute left-3.5 h-4 w-4 text-[var(--text-muted)]"
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
          className="min-h-[44px] w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] pl-10 pr-20 text-base sm:text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-primary)] focus:outline-none"
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
              className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center rounded border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-1.5 py-0.5 font-mono text-[11px] font-medium text-[var(--text-muted)]">
            /
          </kbd>
        </div>
      </div>

      {open && (
        <div
          role="listbox"
          aria-label="Smart search suggestions"
          className="absolute left-0 right-0 mt-2 max-h-80 overflow-y-auto rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-2 shadow-xl z-30 space-y-1"
        >
          <p className="px-3 py-1 text-[11px] font-semibold text-[var(--text-muted)]">
            {query.trim()
              ? `Matching results in ${activeMembership.roleLabel} scope (${results.length})`
              : `Quick jump · ${activeMembership.roleLabel} workspace`}
          </p>

          {results.length === 0 ? (
            <p className="px-3 py-4 text-center text-xs text-[var(--text-muted)]">
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
                className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-[var(--bg-elevated)] cursor-pointer transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-[var(--accent-primary)]">{item.group}</p>
                  <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{item.title}</p>
                  <p className="text-xs text-[var(--text-muted)] truncate">{item.subtitle}</p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-[var(--text-muted)]" aria-hidden="true" />
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
