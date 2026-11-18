export default function SkeletonLoader({ rows = 3, variant = 'list', className = '' }) {
  if (variant === 'cards') {
    return (
      <div
        role="status"
        aria-label="Loading content"
        className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 ${className}`}
      >
        {Array.from({ length: rows }).map((_, index) => (
          <div
            key={index}
            className="rounded-2xl spt-surface p-5 space-y-3 animate-pulse"
          >
            <div className="h-3 w-24 rounded bg-[var(--bg-subtle)]" />
            <div className="h-7 w-16 rounded bg-[var(--bg-subtle)]" />
            <div className="h-3 w-36 rounded bg-[var(--bg-elevated)]" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-label="Loading records"
      className={`rounded-2xl spt-surface divide-y divide-[var(--border-subtle)] ${className}`}
    >
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex items-center justify-between gap-4 p-4 animate-pulse">
          <div className="space-y-2 flex-1">
            <div className="h-4 w-48 max-w-full rounded bg-[var(--bg-subtle)]" />
            <div className="h-3 w-72 max-w-full rounded bg-[var(--bg-elevated)]" />
          </div>
          <div className="h-6 w-20 rounded bg-[var(--bg-elevated)] shrink-0" />
        </div>
      ))}
    </div>
  );
}
