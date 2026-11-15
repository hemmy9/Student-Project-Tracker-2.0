import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import ImageWithFallback from '../ui/ImageWithFallback';

export default function HeroSection() {
  return (
    <section id="overview" className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-stretch lg:gap-12">
          <div className="lg:col-span-6 flex flex-col justify-center space-y-6">
            <div className="space-y-4">
              <p className="text-xs font-semibold tracking-wide text-[#2563EB]">
                Academic Project Progress &amp; Supervision Platform
              </p>
              <h1 className="font-display text-3xl sm:text-4xl lg:text-[46px] font-bold tracking-tight text-[#172554] leading-[1.12] text-balance">
                Structured project tracking for students, supervisors, and universities.
              </h1>
              <p className="text-base sm:text-lg text-[#64748B] leading-relaxed max-w-xl">
                Replace scattered emails and lost document drafts with an auditable academic workspace. Manage tasks, milestones, weekly journals, and chapter reviews inside isolated institutional portals.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-1">
              <Link
                to="/register"
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-6 py-3 text-sm sm:text-base font-semibold text-white hover:bg-[#1D4ED8] transition-colors whitespace-nowrap shrink-0"
              >
                <span>Start registration</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                to="/login"
                className="inline-flex min-h-[48px] items-center justify-center rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm sm:text-base font-medium text-[#172554] hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
              >
                Sign in with demo roles
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 pt-2 text-xs sm:text-sm text-[#64748B]">
              <span>Multi-institution isolation</span>
              <span aria-hidden="true">·</span>
              <span>Four role-scoped portals</span>
              <span aria-hidden="true">·</span>
              <span>Mobile &amp; desktop ready</span>
            </div>
          </div>

          <div className="lg:col-span-6 flex">
            <div className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
              <ImageWithFallback
                src="/src/assets/images/academic_research_hero_1794715034248.jpg"
                alt="Graduate students collaborating around a table with laptops and thesis chapters in a university research library"
                aspectClass="aspect-[4/3] lg:h-full lg:aspect-auto"
                className="h-full border-0 rounded-none"
              />
            </div>
          </div>
        </div>

        {/* Full-width 4-column governance summary strip below hero split */}
        <div className="mt-10 sm:mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-slate-200 bg-slate-200 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white p-5 space-y-1">
            <p className="font-mono text-xs font-medium text-[#2563EB] tabular-nums">01 / PORTALS</p>
            <p className="font-display text-lg font-bold text-[#172554]">4 Dedicated Workspaces</p>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Tailored interfaces for students, supervisors, institution admins, and platform operators.
            </p>
          </div>
          <div className="bg-white p-5 space-y-1">
            <p className="font-mono text-xs font-medium text-[#2563EB] tabular-nums">02 / TENANCY</p>
            <p className="font-display text-lg font-bold text-[#172554]">Strict Tenant Isolation</p>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Each university’s students, projects, and documents remain private to that institution.
            </p>
          </div>
          <div className="bg-white p-5 space-y-1">
            <p className="font-mono text-xs font-medium text-[#2563EB] tabular-nums">03 / ACCESS</p>
            <p className="font-display text-lg font-bold text-[#172554]">Verified Approvals</p>
            <p className="text-xs text-[#64748B] leading-relaxed">
              No self-assigned admin access; institutional and platform approvals control every role.
            </p>
          </div>
          <div className="bg-white p-5 space-y-1">
            <p className="font-mono text-xs font-medium text-[#2563EB] tabular-nums">04 / AUDIT</p>
            <p className="font-display text-lg font-bold text-[#172554]">Preserved Submissions</p>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Historical chapter uploads, weekly journals, and supervisor reviews remain traceable.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
