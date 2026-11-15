import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const TOAST_STYLES = {
  success: {
    border: 'border-emerald-200',
    accent: 'bg-emerald-600',
    icon: CheckCircle2,
    iconColor: 'text-emerald-600',
  },
  error: {
    border: 'border-red-200',
    accent: 'bg-red-600',
    icon: AlertCircle,
    iconColor: 'text-red-600',
  },
  warning: {
    border: 'border-amber-200',
    accent: 'bg-amber-500',
    icon: AlertTriangle,
    iconColor: 'text-amber-600',
  },
  info: {
    border: 'border-blue-200',
    accent: 'bg-[#2563EB]',
    icon: Info,
    iconColor: 'text-[#2563EB]',
  },
};

export default function ToastContainer() {
  const { toasts, dismissToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <aside
      aria-label="Global notifications"
      aria-live="polite"
      className="fixed bottom-4 inset-x-4 z-50 flex flex-col gap-2.5 sm:inset-x-auto sm:bottom-6 sm:right-6 sm:w-96 pointer-events-none print:hidden"
    >
      {toasts.map((toast) => {
        const style = TOAST_STYLES[toast.type] || TOAST_STYLES.info;
        const Icon = style.icon;

        return (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto relative overflow-hidden rounded-xl border ${style.border} bg-white shadow-lg`}
          >
            <span className={`absolute inset-y-0 left-0 w-1 ${style.accent}`} aria-hidden="true" />
            <div className="flex items-start gap-3 p-3.5 pl-4">
              <Icon className={`h-5 w-5 mt-0.5 shrink-0 ${style.iconColor}`} aria-hidden="true" />
              <div className="min-w-0 flex-1 space-y-0.5">
                {toast.title && (
                  <p className="font-display text-sm font-bold text-[#172554] leading-snug">
                    {toast.title}
                  </p>
                )}
                {toast.message && (
                  <p className="text-xs text-[#64748B] leading-relaxed">{toast.message}</p>
                )}
                {toast.actionLabel && typeof toast.onAction === 'function' && (
                  <button
                    type="button"
                    onClick={() => {
                      toast.onAction();
                      dismissToast(toast.id);
                    }}
                    className="mt-1.5 inline-flex text-xs font-semibold text-[#2563EB] hover:underline cursor-pointer"
                  >
                    {toast.actionLabel}
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                aria-label="Dismiss notification"
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-[#172554] cursor-pointer"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        );
      })}
    </aside>
  );
}
