import { Info } from 'lucide-react';
import { isSupabaseConfigured } from '../../lib/supabaseClient';

export default function Stage2Banner({
  portalName,
  tenantLabel,
  loadingPreview = false,
  onToggleLoadingPreview,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 mt-0.5 shrink-0 text-[#2563EB]" aria-hidden="true" />
          <div className="space-y-0.5 text-xs sm:text-sm">
            <p className="font-semibold text-[#172554]">
              {isSupabaseConfigured
                ? `Live Supabase Workspace · ${portalName} (${tenantLabel})`
                : `Stage 3 Interactive Workspace · ${portalName} (${tenantLabel})`}
            </p>
            <p className="text-[#64748B] leading-relaxed">
              {isSupabaseConfigured
                ? 'Connected to Supabase PostgreSQL, Authentication, and Private Storage.'
                : 'Tasks, milestones, analytics, reviews, and approvals persist locally in your browser. Stage 4 Supabase SQL migrations, RLS policies, and client services are bundled and activate automatically once VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are configured.'}
            </p>
          </div>
        </div>

        {typeof onToggleLoadingPreview === 'function' && (
          <button
            type="button"
            onClick={() => onToggleLoadingPreview(!loadingPreview)}
            className="inline-flex min-h-[40px] items-center justify-center rounded-lg border border-slate-300 bg-[#F8FAFC] px-3.5 py-2 text-xs font-medium text-[#172554] hover:bg-slate-100 cursor-pointer whitespace-nowrap shrink-0"
          >
            {loadingPreview ? 'Show populated view' : 'Preview loading state'}
          </button>
        )}
      </div>
    </div>
  );
}
