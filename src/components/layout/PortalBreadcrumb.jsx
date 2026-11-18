import { ChevronRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useDemoSession } from '../../context/DemoSessionContext';
import { getBreadcrumbsForPath } from '../../utils/roleRouting';

export default function PortalBreadcrumb({ className = '' }) {
  const { pathname } = useLocation();
  const { activeMembership } = useDemoSession();

  const items = getBreadcrumbsForPath(pathname, activeMembership);

  if (!items || items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className={`print:hidden ${className}`}>
      <ol className="flex flex-wrap items-center gap-1.5 text-xs text-[var(--text-muted)]">
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1 || item.isCurrent;
          return (
            <li key={`${item.label}-${idx}`} className="inline-flex items-center gap-1.5 min-w-0">
              {idx > 0 && (
                <ChevronRight
                  className="h-3.5 w-3.5 shrink-0 text-[var(--text-muted)] opacity-70"
                  aria-hidden="true"
                />
              )}
              {isLast || !item.to ? (
                <span
                  aria-current={isLast ? 'page' : undefined}
                  className="font-semibold text-[var(--text-primary)] truncate max-w-[220px] sm:max-w-none"
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.to}
                  className="font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors truncate max-w-[180px] sm:max-w-none"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
