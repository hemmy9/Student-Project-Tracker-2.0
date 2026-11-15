import { Database } from 'lucide-react';

export default function StageNotice({
  title = 'Stage 1 Frontend Preview Mode',
  description,
  simulateError = false,
  onToggleSimulateError,
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs text-[#64748B]">
      <div className="flex items-start gap-2.5">
        <Database className="h-4 w-4 mt-0.5 shrink-0 text-[#2563EB]" aria-hidden="true" />
        <div className="min-w-0 flex-1 space-y-1.5">
          <p className="font-semibold text-[#172554]">{title}</p>
          <p className="leading-relaxed">
            {description ||
              'Supabase authentication and database persistence will be connected in Stage 4. Submitting this form validates your input and demonstrates the workflow locally without writing to a database or creating a real session.'}
          </p>
          {typeof onToggleSimulateError === 'function' && (
            <label className="inline-flex items-center gap-2 pt-1 text-xs font-medium text-[#172554] cursor-pointer select-none min-h-[32px]">
              <input
                type="checkbox"
                checked={simulateError}
                onChange={(e) => onToggleSimulateError(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB]"
              />
              <span>Test server error feedback on submit</span>
            </label>
          )}
        </div>
      </div>
    </div>
  );
}
