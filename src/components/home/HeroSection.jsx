import { Component, Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { GRACE_POLYTECHNIC_BRAND } from '../../config/gracePolytechnic';
import { useTheme } from '../../context/ThemeContext';
import { FadeInSection } from '../ui/MotionPrimitives';

const Academic3DScene = lazy(() => import('../three/Academic3DScene'));

class SceneErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

function HeroShowcaseFallback() {
  const { isDark } = useTheme();
  return (
    <div
      className="relative flex h-full min-h-[300px] sm:min-h-[360px] lg:min-h-[420px] w-full flex-col justify-between overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-sm"
      role="img"
      aria-label="Grace Polytechnic three-portal academic supervision illustration"
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: isDark
            ? 'radial-gradient(circle at 68% 34%, rgba(37, 99, 235, 0.2), transparent 55%), radial-gradient(circle at 28% 72%, rgba(20, 184, 166, 0.14), transparent 52%)'
            : 'radial-gradient(circle at 68% 34%, rgba(37, 99, 235, 0.1), transparent 55%), radial-gradient(circle at 28% 72%, rgba(13, 148, 136, 0.08), transparent 52%)',
        }}
      />
      <div className="relative flex items-center justify-between text-xs font-mono text-[var(--text-muted)]">
        <span>GRACE POLYTECHNIC · SUPERVISION ENGINE</span>
        <span className="tabular-nums">3-PORTAL CORE</span>
      </div>
      <div className="relative my-auto flex items-center justify-center py-6">
        <svg
          viewBox="0 0 280 180"
          className="h-44 w-full max-w-[280px]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <ellipse cx="140" cy="90" rx="102" ry="38" transform="rotate(-14 140 90)" stroke="#3B82F6" strokeOpacity="0.45" strokeWidth="1.5" />
          <ellipse cx="140" cy="90" rx="88" ry="32" transform="rotate(24 140 90)" stroke="#14B8A6" strokeOpacity="0.5" strokeWidth="1.5" />
          <polygon
            points="140,42 180,66 180,114 140,138 100,114 100,66"
            fill={isDark ? '#16223B' : '#EFF6FF'}
            stroke="#3B82F6"
            strokeWidth="2"
          />
          <circle cx="232" cy="70" r="8" fill="#3B82F6" />
          <circle cx="64" cy="58" r="7" fill="#14B8A6" />
          <circle cx="172" cy="148" r="7" fill="#8B5CF6" />
        </svg>
      </div>
      <div className="relative grid grid-cols-3 gap-2 border-t border-[var(--border-subtle)] pt-3 text-[11px]">
        <div>
          <p className="font-mono font-semibold text-[#3B82F6]">STUDENT</p>
          <p className="text-[var(--text-muted)] truncate">Milestones &amp; drafts</p>
        </div>
        <div>
          <p className="font-mono font-semibold text-[#14B8A6]">SUPERVISOR</p>
          <p className="text-[var(--text-muted)] truncate">Reviews &amp; office hours</p>
        </div>
        <div>
          <p className="font-mono font-semibold text-[#8B5CF6]">ADMIN</p>
          <p className="text-[var(--text-muted)] truncate">Governance &amp; approvals</p>
        </div>
      </div>
    </div>
  );
}

const GOVERNANCE_HIGHLIGHTS = [
  {
    code: '01 / PORTALS',
    title: 'Three Scoped Portals',
    detail:
      'Dedicated workspaces for Grace Polytechnic students, supervisors, and institution administrators.',
  },
  {
    code: '02 / CATALOGUE',
    title: 'ND & HND Alignment',
    detail:
      'Structured around Polytechnic schools, departments, study modes, and active academic sessions.',
  },
  {
    code: '03 / SUPERVISION',
    title: 'Chapters & Office Hours',
    detail:
      'Keep weekly journals, chapter versions, revision feedback, and supervisor consultations connected.',
  },
  {
    code: '04 / GOVERNANCE',
    title: 'Verified Role Access',
    detail:
      'Administrator-approved student accounts and admin-provisioned supervisor access.',
  },
];

export default function HeroSection() {
  const scrollToPortals = (e) => {
    const el = document.getElementById('portals');
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="overview"
      className="relative overflow-hidden border-b border-[var(--border-subtle)] bg-[var(--bg-canvas)]"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[420px]"
        style={{
          background:
            'radial-gradient(ellipse 70% 60% at 75% 10%, rgba(37, 99, 235, 0.14), transparent 70%), radial-gradient(ellipse 55% 50% at 15% 20%, rgba(20, 184, 166, 0.08), transparent 70%)',
        }}
      />

      <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-stretch lg:gap-12">
          <FadeInSection className="lg:col-span-6 flex flex-col justify-center space-y-6">
            <div className="space-y-4">
              <p className="font-mono text-xs font-semibold tracking-wider text-[var(--accent-primary)]">
                {GRACE_POLYTECHNIC_BRAND.institutionName.toUpperCase()} · {GRACE_POLYTECHNIC_BRAND.location.toUpperCase()}
              </p>

              <h1 className="font-display text-3xl sm:text-4xl lg:text-[46px] font-bold tracking-tight text-[var(--text-primary)] leading-[1.12] text-balance">
                Structured academic project supervision for {GRACE_POLYTECHNIC_BRAND.institutionName}.
              </h1>

              <p className="text-base sm:text-lg text-[var(--text-muted)] leading-relaxed max-w-xl">
                Replace scattered emails and lost chapter drafts with a single institutional workspace. Coordinate ND and HND milestones, weekly progress journals, supervisor reviews, and office hours across three role-scoped portals.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-1">
              <a
                href="#portals"
                onClick={scrollToPortals}
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-6 py-3 text-sm sm:text-base font-semibold text-white hover:bg-[#1D4ED8] transition-colors whitespace-nowrap shrink-0 shadow-sm"
              >
                <span>Choose portal sign in</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
              <Link
                to="/register/student"
                className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] px-6 py-3 text-sm sm:text-base font-medium text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors whitespace-nowrap shrink-0"
              >
                Student registration
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 pt-2 text-xs sm:text-sm text-[var(--text-muted)]">
              <span>{GRACE_POLYTECHNIC_BRAND.officialDomain}</span>
              <span aria-hidden="true">·</span>
              <span>Student, Supervisor &amp; Admin portals</span>
              <span aria-hidden="true">·</span>
              <span>Mobile &amp; desktop ready</span>
            </div>
          </FadeInSection>

          <div className="lg:col-span-6 flex">
            <SceneErrorBoundary fallback={<HeroShowcaseFallback />}>
              <Suspense fallback={<HeroShowcaseFallback />}>
                <Academic3DScene />
              </Suspense>
            </SceneErrorBoundary>
          </div>
        </div>

        <div className="mt-10 sm:mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--border-subtle)] sm:grid-cols-2 lg:grid-cols-4">
          {GOVERNANCE_HIGHLIGHTS.map((item) => (
            <div key={item.code} className="bg-[var(--bg-surface)] p-5 space-y-1.5">
              <p className="font-mono text-xs font-medium text-[var(--accent-primary)] tabular-nums">
                {item.code}
              </p>
              <p className="font-display text-lg font-bold text-[var(--text-primary)]">
                {item.title}
              </p>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                {item.detail}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
