import { Link } from 'react-router-dom';

export default function PublicFooter({ fullWidth = false }) {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div
        className={
          fullWidth
            ? 'w-full px-4 py-8 sm:px-6 lg:px-6'
            : 'mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8'
        }
      >
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
          <div className="md:col-span-5 space-y-2.5">
            <p className="font-display text-base font-bold text-[#172554]">
              Student Project Tracker
            </p>
            <p className="text-sm text-[#64748B] max-w-sm leading-relaxed">
              Design and Implementation of a Web-Based Student Project Progress Tracking System for multi-institution academic supervision and governance.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 md:col-span-7 sm:grid-cols-3">
            <div className="space-y-2.5">
              <p className="text-xs font-semibold text-[#172554]">Platform</p>
              <ul className="space-y-2 text-sm text-[#64748B]">
                <li>
                  <Link to="/" className="hover:text-[#172554] transition-colors">
                    Homepage
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="hover:text-[#172554] transition-colors">
                    Sign in
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="hover:text-[#172554] transition-colors">
                    Registration Hub
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-2.5">
              <p className="text-xs font-semibold text-[#172554]">Onboarding</p>
              <ul className="space-y-2 text-sm text-[#64748B]">
                <li>
                  <Link to="/register/student" className="hover:text-[#172554] transition-colors">
                    Student registration
                  </Link>
                </li>
                <li>
                  <Link to="/register/supervisor" className="hover:text-[#172554] transition-colors">
                    Supervisor registration
                  </Link>
                </li>
                <li>
                  <Link to="/register/institution" className="hover:text-[#172554] transition-colors">
                    Institution application
                  </Link>
                </li>
              </ul>
            </div>

            <div className="col-span-2 sm:col-span-1 space-y-2.5">
              <p className="text-xs font-semibold text-[#172554]">Build Status</p>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Stage 1 — Frontend Foundation. Public interface, responsive navigation, and validated onboarding forms.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-slate-200 pt-6 text-xs text-[#64748B] sm:flex-row sm:items-center sm:justify-between">
          <p>Student Project Tracker · Academic Project Management Platform</p>
          <p>Multi-tenant architecture · Pending Stage 4 Supabase integration</p>
        </div>
      </div>
    </footer>
  );
}
