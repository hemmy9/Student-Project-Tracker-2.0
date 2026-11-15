import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  BookText,
  CheckSquare,
  FileText,
  MessageSquare,
  Search,
  ShieldCheck,
} from 'lucide-react';
import { useDemoAppState } from '../../context/DemoAppStateContext';
import { useDemoSession } from '../../context/DemoSessionContext';

const CATEGORIES = ['All', 'Tasks', 'Documents', 'Journals', 'Messages', 'Governance'];

const CATEGORY_ICON = {
  Tasks: CheckSquare,
  Documents: FileText,
  Journals: BookText,
  Messages: MessageSquare,
  Governance: ShieldCheck,
};

export default function ActivityFeedStream({
  title = 'Live Activity Feed & Recent Logs',
  subtitle = 'Real-time audit stream of tasks, chapter versions, reviews, and governance actions.',
  defaultLimit = 6,
}) {
  const { activeMembership } = useDemoSession();
  const { state } = useDemoAppState();
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState(false);

  const roleKey = activeMembership?.roleKey || 'student';
  const institutionName = activeMembership?.institutionName || '';

  const scopedFeed = useMemo(() => {
    const raw = state.activityFeed || [];
    return raw.filter((item) => {
      if (roleKey === 'platform_admin') return true;
      const matchesInst =
        !item.institutionName ||
        item.institutionName === institutionName ||
        item.roleScope === 'all';
      const matchesRole = item.roleScope === 'all' || item.roleScope === roleKey;
      return matchesInst && matchesRole;
    });
  }, [state.activityFeed, roleKey, institutionName]);

  const filteredFeed = useMemo(() => {
    const q = query.trim().toLowerCase();
    return scopedFeed.filter((item) => {
      const matchesCat = categoryFilter === 'All' || item.category === categoryFilter;
      const matchesQuery =
        !q ||
        item.action.toLowerCase().includes(q) ||
        item.detail.toLowerCase().includes(q) ||
        item.actor.toLowerCase().includes(q);
      return matchesCat && matchesQuery;
    });
  }, [scopedFeed, categoryFilter, query]);

  const visibleItems = expanded ? filteredFeed : filteredFeed.slice(0, defaultLimit);

  return (
    <section
      aria-label="Activity feed stream"
      className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-[#2563EB]" aria-hidden="true" />
            <h2 className="font-display text-lg font-bold text-[#172554]">{title}</h2>
          </div>
          <p className="text-xs text-[#64748B]">{subtitle}</p>
        </div>

        <div className="relative w-full sm:w-56">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#64748B]"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter logs or actor..."
            aria-label="Filter activity logs"
            className="min-h-[38px] w-full rounded-lg border border-slate-200 bg-[#F8FAFC] pl-8 pr-3 text-base sm:text-xs text-[#172554] placeholder:text-slate-400 focus:border-[#2563EB] focus:bg-white focus:outline-none"
          />
        </div>
      </div>

      <div
        role="tablist"
        aria-label="Filter activity stream by category"
        className="flex items-center gap-1 overflow-x-auto rounded-lg border border-slate-200 bg-slate-100 p-1"
      >
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            role="tab"
            aria-selected={categoryFilter === cat}
            onClick={() => setCategoryFilter(cat)}
            className={`min-h-[34px] rounded-md px-3 py-1 text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              categoryFilter === cat
                ? 'bg-white text-[#172554] shadow-xs'
                : 'text-[#64748B] hover:text-[#172554]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {visibleItems.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-[#F8FAFC] p-6 text-center space-y-2">
          <p className="text-sm font-semibold text-[#172554]">No matching activity logs</p>
          <p className="text-xs text-[#64748B]">
            Try clearing your search term or switching back to All categories.
          </p>
          {(categoryFilter !== 'All' || query) && (
            <button
              type="button"
              onClick={() => {
                setCategoryFilter('All');
                setQuery('');
              }}
              className="text-xs font-semibold text-[#2563EB] hover:underline cursor-pointer"
            >
              Reset log filters
            </button>
          )}
        </div>
      ) : (
        <ol className="divide-y divide-slate-100">
          {visibleItems.map((item) => {
            const Icon = CATEGORY_ICON[item.category] || Activity;
            return (
              <li
                key={item.id}
                className="py-3.5 first:pt-0 last:pb-0 flex items-start justify-between gap-3"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-[#F8FAFC] text-[#2563EB]">
                    <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-[#64748B]">
                      <span className="font-semibold text-[#172554]">{item.category}</span>
                      <span aria-hidden="true">·</span>
                      <span>
                        {item.actor} ({item.actorRole})
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">{item.timestamp}</span>
                    </div>
                    <p className="text-sm font-semibold text-[#172554] leading-snug">
                      {item.action}
                    </p>
                    <p className="text-xs text-[#64748B] leading-relaxed">{item.detail}</p>
                  </div>
                </div>

                {item.targetPath && (
                  <Link
                    to={item.targetPath}
                    className="shrink-0 text-xs font-semibold text-[#2563EB] hover:underline whitespace-nowrap mt-1"
                  >
                    Open →
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      )}

      {filteredFeed.length > defaultLimit && (
        <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs">
          <span className="text-[#64748B] tabular-nums">
            Showing {visibleItems.length} of {filteredFeed.length} recent events
          </span>
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className="font-semibold text-[#2563EB] hover:underline cursor-pointer"
          >
            {expanded ? 'Show fewer logs' : `View all ${filteredFeed.length} events`}
          </button>
        </div>
      )}
    </section>
  );
}
