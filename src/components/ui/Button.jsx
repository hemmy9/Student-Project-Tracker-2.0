import { Loader2 } from 'lucide-react';

const VARIANT_CLASSES = {
  primary:
    'bg-[#2563EB] text-white hover:bg-[#1D4ED8] active:bg-[#1E40AF] border border-transparent shadow-sm',
  navy:
    'bg-[#172554] text-white hover:bg-[#0F172A] active:bg-[#0F172A] border border-transparent shadow-sm',
  secondary:
    'bg-white text-[#172554] hover:bg-slate-50 active:bg-slate-100 border border-slate-300',
  ghost:
    'bg-transparent text-[#64748B] hover:text-[#172554] hover:bg-slate-100 border border-transparent',
};

const SIZE_CLASSES = {
  md: 'min-h-[44px] px-5 py-2.5 text-sm',
  lg: 'min-h-[48px] px-6 py-3 text-sm sm:text-base',
  sm: 'min-h-[40px] px-4 py-2 text-xs sm:text-sm',
};

export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  loading = false,
  loadingText = 'Processing...',
  disabled = false,
  fullWidth = false,
  className = '',
  onClick,
  ...rest
}) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium whitespace-nowrap shrink-0 transition-colors duration-150 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed',
        VARIANT_CLASSES[variant] || VARIANT_CLASSES.primary,
        SIZE_CLASSES[size] || SIZE_CLASSES.md,
        fullWidth ? 'w-full' : '',
        className,
      ].join(' ')}
      {...rest}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden="true" />}
      <span>{loading ? loadingText : children}</span>
    </button>
  );
}
