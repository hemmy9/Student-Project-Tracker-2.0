import { useId } from 'react';
import { GRACE_POLYTECHNIC_BRAND } from '../../config/gracePolytechnic';

const SIZE_MAP = {
  xs: { box: 'h-6 w-6', icon: 24, title: 'text-sm', sub: 'text-[10px]' },
  sm: { box: 'h-8 w-8', icon: 32, title: 'text-base', sub: 'text-[11px]' },
  md: { box: 'h-10 w-10', icon: 40, title: 'text-lg', sub: 'text-xs' },
  lg: { box: 'h-12 w-12', icon: 48, title: 'text-xl', sub: 'text-xs' },
};

export default function BrandLogo({
  size = 'sm',
  showWordmark = true,
  showInstitution = true,
  compact = false,
  tone = 'auto',
  className = '',
}) {
  const uid = useId().replace(/:/g, '');
  const dims = SIZE_MAP[size] || SIZE_MAP.sm;

  const titleClass =
    tone === 'light'
      ? 'text-white'
      : tone === 'dark'
        ? 'text-slate-900'
        : 'text-[var(--text-primary)]';

  const subClass =
    tone === 'light'
      ? 'text-blue-200'
      : tone === 'dark'
        ? 'text-slate-600'
        : 'text-[var(--text-muted)]';

  return (
    <span className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <svg
        width={dims.icon}
        height={dims.icon}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${dims.box} shrink-0`}
        role="img"
        aria-label={`${GRACE_POLYTECHNIC_BRAND.appName} logo`}
      >
        <defs>
          <linearGradient id={`spt-bg-${uid}`} x1="4" y1="2" x2="36" y2="38" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1E3A8A" />
            <stop offset="55%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#0D9488" />
          </linearGradient>
          <linearGradient id={`spt-track-${uid}`} x1="10" y1="28" x2="30" y2="11" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#93C5FD" />
            <stop offset="100%" stopColor="#5EEAD4" />
          </linearGradient>
        </defs>

        {/* Precision rounded architectural frame */}
        <rect x="2" y="2" width="36" height="36" rx="10" fill={`url(#spt-bg-${uid})`} />
        <rect
          x="2.75"
          y="2.75"
          width="34.5"
          height="34.5"
          rx="9.25"
          stroke="rgba(255,255,255,0.22)"
          strokeWidth="1.5"
        />

        {/* Milestone trajectory path */}
        <path
          d="M11 26.5L17.5 20L22 23L29 13.5"
          stroke={`url(#spt-track-${uid})`}
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Three project progress nodes */}
        <circle cx="11" cy="26.5" r="2.3" fill="#FFFFFF" />
        <circle cx="17.5" cy="20" r="2.1" fill="#DBEAFE" />
        <circle cx="29" cy="13.5" r="2.7" fill="#5EEAD4" stroke="#FFFFFF" strokeWidth="1.2" />

        {/* Academic cap crest accent */}
        <path
          d="M12.5 12.2L20 9.2L27.5 12.2L20 15.2L12.5 12.2Z"
          fill="rgba(255,255,255,0.9)"
        />
      </svg>

      {showWordmark && (
        <span className="flex flex-col leading-none min-w-0">
          <span
            className={`font-display font-bold tracking-tight whitespace-nowrap ${dims.title} ${titleClass}`}
          >
            {compact ? 'Project Tracker' : GRACE_POLYTECHNIC_BRAND.appName}
          </span>
          {showInstitution && (
            <span
              className={`mt-0.5 font-medium tracking-wide whitespace-nowrap ${dims.sub} ${subClass}`}
            >
              {GRACE_POLYTECHNIC_BRAND.shortName}
            </span>
          )}
        </span>
      )}
    </span>
  );
}
