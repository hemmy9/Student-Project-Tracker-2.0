import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function ThemeToggle({ compact = false, className = '' }) {
  const { isDark, toggleTheme } = useTheme();
  const nextLabel = isDark ? 'Switch to light mode' : 'Switch to dark mode';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={nextLabel}
      aria-pressed={!isDark}
      title={nextLabel}
      className={`inline-flex min-h-[40px] items-center justify-center gap-2 rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 py-2 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer shrink-0 ${className}`}
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-amber-400 shrink-0" aria-hidden="true" />
      ) : (
        <Moon className="h-4 w-4 text-indigo-600 shrink-0" aria-hidden="true" />
      )}
      {!compact && <span>{isDark ? 'Light mode' : 'Dark mode'}</span>}
    </button>
  );
}
