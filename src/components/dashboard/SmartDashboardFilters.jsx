import { RotateCcw, Search, SlidersHorizontal } from 'lucide-react';

export default function SmartDashboardFilters({
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Search records...',
  filterOptions = [],
  activeFilter = 'All',
  onFilterChange,
  sortOptions = [],
  activeSort = '',
  onSortChange,
  summaryText = '',
  hasActiveFilters = false,
  onReset,
}) {
  return (
    <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-3.5 space-y-3">
      <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
        {/* Search + Sort */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center flex-1">
          {typeof onSearchChange === 'function' && (
            <div className="relative flex-1 max-w-md">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]"
                aria-hidden="true"
              />
              <input
                type="search"
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                aria-label={searchPlaceholder}
                className="min-h-[40px] w-full rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] pl-9 pr-3 text-base sm:text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-primary)] focus:outline-none"
              />
            </div>
          )}

          {sortOptions.length > 0 && typeof onSortChange === 'function' && (
            <div className="flex items-center gap-2 shrink-0">
              <SlidersHorizontal className="h-3.5 w-3.5 text-[var(--text-muted)]" aria-hidden="true" />
              <select
                aria-label="Sort dashboard items"
                value={activeSort}
                onChange={(e) => onSortChange(e.target.value)}
                className="min-h-[40px] rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-2.5 text-base sm:text-xs font-medium text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-none"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    Sort: {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Status / Category Segmented Tabs */}
        {filterOptions.length > 0 && typeof onFilterChange === 'function' && (
          <div
            role="tablist"
            aria-label="Dashboard status filters"
            className="flex items-center gap-1 overflow-x-auto rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-subtle)] p-1"
          >
            {filterOptions.map((filter) => (
              <button
                key={filter}
                type="button"
                role="tab"
                aria-selected={activeFilter === filter}
                onClick={() => onFilterChange(filter)}
                className={`min-h-[34px] rounded-md px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  activeFilter === filter
                    ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-xs'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        )}
      </div>

      {(summaryText || hasActiveFilters) && (
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--text-muted)]">
          <span>{summaryText}</span>
          {hasActiveFilters && typeof onReset === 'function' && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1 font-semibold text-[var(--accent-primary)] hover:underline cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" aria-hidden="true" />
              <span>Reset filters</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

