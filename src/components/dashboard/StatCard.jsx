export default function StatCard({ label, value, hint }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-1.5">
      <p className="text-xs font-medium text-[#64748B]">{label}</p>
      <p className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#172554] tabular-nums">
        {value}
      </p>
      {hint && <p className="text-xs text-[#64748B] leading-snug">{hint}</p>}
    </div>
  );
}
