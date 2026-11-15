export function BreakdownDonut({ title, subtitle, segments }) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const radius = 38;
  const circumference = 2 * Math.PI * radius;

  let cumulativeOffset = 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
      <div>
        <h3 className="font-display text-base font-bold text-[#172554]">{title}</h3>
        {subtitle && <p className="text-xs text-[#64748B] mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-5">
        <div className="relative h-28 w-28 shrink-0">
          <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" aria-hidden="true">
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              stroke="#F1F5F9"
              strokeWidth="12"
            />
            {total > 0 &&
              segments.map((seg) => {
                if (seg.value <= 0) return null;
                const dash = (seg.value / total) * circumference;
                const offset = cumulativeOffset;
                cumulativeOffset += dash;
                return (
                  <circle
                    key={seg.label}
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="transparent"
                    stroke={seg.color}
                    strokeWidth="12"
                    strokeDasharray={`${dash} ${circumference - dash}`}
                    strokeDashoffset={-offset}
                  />
                );
              })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="font-display text-xl font-bold text-[#172554] tabular-nums">
              {total}
            </span>
            <span className="text-[10px] font-medium text-[#64748B]">Total</span>
          </div>
        </div>

        <ul className="flex-1 w-full space-y-2">
          {segments.map((seg) => {
            const pct = total > 0 ? Math.round((seg.value / total) * 100) : 0;
            return (
              <li key={seg.label} className="flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: seg.color }}
                    aria-hidden="true"
                  />
                  <span className="truncate font-medium text-[#172554]">{seg.label}</span>
                </div>
                <span className="font-mono font-semibold text-[#64748B] tabular-nums shrink-0">
                  {seg.value} ({pct}%)
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export function HorizontalBarChart({ title, subtitle, items }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
      <div>
        <h3 className="font-display text-base font-bold text-[#172554]">{title}</h3>
        {subtitle && <p className="text-xs text-[#64748B] mt-0.5">{subtitle}</p>}
      </div>

      <div className="space-y-3">
        {items.map((item) => {
          const pct = Math.max(0, Math.min(100, item.percent ?? 0));
          return (
            <div key={item.label} className="space-y-1">
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="truncate font-medium text-[#172554]">{item.label}</span>
                <span className="font-mono font-semibold text-[#64748B] tabular-nums shrink-0">
                  {item.valueLabel || `${pct}%`}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: item.color || '#2563EB',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ActivityCadenceChart({ title, subtitle, bars }) {
  const maxVal = Math.max(1, ...bars.map((b) => b.value));

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
      <div>
        <h3 className="font-display text-base font-bold text-[#172554]">{title}</h3>
        {subtitle && <p className="text-xs text-[#64748B] mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-end justify-between gap-2 h-32 pt-2">
        {bars.map((bar) => {
          const heightPct = Math.max(8, Math.round((bar.value / maxVal) * 100));
          return (
            <div key={bar.label} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
              <span className="font-mono text-[10px] font-semibold text-[#64748B] tabular-nums">
                {bar.value}
              </span>
              <div className="w-full max-w-[32px] flex-1 flex items-end">
                <div
                  className="w-full rounded-t-md bg-[#2563EB] transition-all duration-300"
                  style={{ height: `${heightPct}%`, opacity: bar.value > 0 ? 1 : 0.2 }}
                  title={`${bar.label}: ${bar.value}`}
                />
              </div>
              <span className="font-mono text-[10px] text-[#64748B] tabular-nums whitespace-nowrap">
                {bar.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
