export default function StatCard({ label, value, hint }) {
  return (
    <div className="spt-surface rounded-2xl p-5 space-y-1.5">
      <p className="text-xs font-medium text-[var(--text-muted)]">{label}</p>
      <p className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)] tabular-nums">
        {value}
      </p>
      {hint && <p className="text-xs text-[var(--text-muted)] leading-snug">{hint}</p>}
    </div>
  );
}

