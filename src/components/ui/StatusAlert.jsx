import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

const STYLES = {
  error: {
    container: 'border-red-200 bg-red-50 text-red-900',
    iconColor: 'text-red-600',
    Icon: AlertCircle,
  },
  success: {
    container: 'border-emerald-200 bg-emerald-50 text-emerald-950',
    iconColor: 'text-emerald-600',
    Icon: CheckCircle2,
  },
  info: {
    container: 'border-blue-200 bg-blue-50/70 text-[#172554]',
    iconColor: 'text-[#2563EB]',
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
