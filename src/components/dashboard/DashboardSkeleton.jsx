export default function DashboardSkeleton({ variant = 'full' }) {
  return (
    <div role="status" aria-label="Loading dashboard layout" className="space-y-6 animate-pulse">
      {/* Header Banner Skeleton */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-3">
        <div className="h-3 w-36 rounded bg-slate-200" />
        <div className="h-7 w-72 max-w-full rounded bg-slate-200" />
        <div className="h-3.5 w-96 max-w-full rounded bg-slate-100" />
      </div>

      {/* 4-Column KPI Grid Skeleton */}
      {variant === 'full' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-slate-200 bg-white p-5 space-y-2.5"
            >
              <div className="h-3 w-24 rounded bg-slate-200" />
              <div className="h-8 w-16 rounded bg-slate-200" />
              <div className="h-3 w-32 rounded bg-slate-100" />
            </div>
          ))}
        </div>
      )}

      {/* Primary Data Table / List Skeleton */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="h-5 w-44 rounded bg-slate-200" />
            <div className="h-3 w-64 max-w-full rounded bg-slate-100" />
          </div>
          <div className="h-9 w-48 rounded-lg bg-slate-100" />
        </div>

        <div className="divide-y divide-slate-100 border-t border-slate-100 pt-2">
          {[1, 2, 3, 4].map((row) => (
            <div key={row} className="flex items-center justify-between gap-4 py-3.5">
              <div className="space-y-2 flex-1">
                <div className="h-4 w-56 max-w-full rounded bg-slate-200" />
                <div className="h-3 w-80 max-w-full rounded bg-slate-100" />
              </div>
              <div className="h-5 w-20 rounded bg-slate-100 shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* Secondary Panel Skeleton */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-3">
        <div className="h-5 w-48 rounded bg-slate-200" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="h-20 rounded-xl bg-slate-100" />
          <div className="h-20 rounded-xl bg-slate-100" />
        </div>
      </div>
    </div>
  );
}
