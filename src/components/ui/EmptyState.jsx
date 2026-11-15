import { FolderOpen } from 'lucide-react';
import Button from './Button';

export default function EmptyState({
  icon: Icon = FolderOpen,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center ${className}`}
    >
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-[#64748B]">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <h3 className="font-display text-base font-bold text-[#172554]">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm text-[#64748B] leading-relaxed">{description}</p>
      )}
      {actionLabel && typeof onAction === 'function' && (
        <div className="mt-5">
          <Button variant="primary" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
