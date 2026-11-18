import { AlertCircle, AlertTriangle, CheckCircle2, Info } from 'lucide-react';

const STYLES = {
  error: {
    container:
      'border-red-200 bg-red-50 text-red-900 dark:border-red-500/35 dark:bg-red-950/45 dark:text-red-100',
    iconColor: 'text-red-600 dark:text-red-400',
    Icon: AlertCircle,
  },
  warning: {
    container:
      'border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-500/35 dark:bg-amber-950/45 dark:text-amber-100',
    iconColor: 'text-amber-600 dark:text-amber-400',
    Icon: AlertTriangle,
  },
  success: {
    container:
      'border-emerald-200 bg-emerald-50 text-emerald-950 dark:border-emerald-500/35 dark:bg-emerald-950/45 dark:text-emerald-100',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    Icon: CheckCircle2,
  },
  info: {
    container:
      'border-blue-200 bg-blue-50/70 text-[#172554] dark:border-blue-500/35 dark:bg-blue-950/45 dark:text-blue-100',
    iconColor: 'text-[#2563EB] dark:text-[#60A5FA]',
    Icon: Info,
  },
};

export default function StatusAlert({ type = 'info', title, children, className = '' }) {
  const config = STYLES[type] || STYLES.info;
  const Icon = config.Icon;

  return (
    <div
      role={type === 'error' ? 'alert' : 'status'}
      className={`rounded-xl border p-4 text-sm ${config.container} ${className}`}
    >
      <div className="flex items-start gap-3">
        <Icon className={`h-5 w-5 mt-0.5 shrink-0 ${config.iconColor}`} aria-hidden="true" />
        <div className="min-w-0 flex-1 space-y-1">
          {title && <p className="font-semibold leading-snug">{title}</p>}
          <div className="text-xs sm:text-sm leading-relaxed opacity-90">{children}</div>
        </div>
      </div>
    </div>
  );
}
