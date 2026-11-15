import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import DashboardSkeleton from '../../components/dashboard/DashboardSkeleton';
import PortalLayout from '../../components/layout/PortalLayout';
import StatusAlert from '../../components/ui/StatusAlert';
import { useDemoSession } from '../../context/DemoSessionContext';
import { getDashboardPathForRole, getPortalNavItems } from '../../utils/roleRouting';

export default function PortalModuleSkeletonPage({ title, description, stage3Features = [] }) {
  const { activeMembership } = useDemoSession();

  if (!activeMembership) return null;

  const navItems = getPortalNavItems(activeMembership.roleKey);
  const dashboardPath = getDashboardPathForRole(activeMembership.roleKey);

  return (
    <PortalLayout navItems={navItems}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="font-mono text-xs font-medium text-[#2563EB]">
            {activeMembership.roleLabel.toUpperCase()} · {activeMembership.institutionName}
          </p>
          <h1 className="font-display text-2xl font-bold text-[#172554]">{title}</h1>
          <p className="text-sm text-[#64748B]">{description}</p>
        </div>

        <Link
          to={dashboardPath}
          className="inline-flex min-h-[40px] items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-[#172554] hover:bg-slate-50 whitespace-nowrap self-start sm:self-auto"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Back to overview</span>
        </Link>
      </div>

      <StatusAlert type="info" title="Stage 2 Navigation & Skeleton Layout">
        <p>
          This workspace route is wired into the portal navigation shell. Interactive forms and actions for this module will be built in Stage 3:
        </p>
        {stage3Features.length > 0 && (
          <ul className="mt-2 list-disc pl-5 space-y-1 text-xs">
            {stage3Features.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        )}
      </StatusAlert>

      <DashboardSkeleton variant="module" />
    </PortalLayout>
  );
}
