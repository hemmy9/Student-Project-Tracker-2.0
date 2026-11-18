import { Link } from 'react-router-dom';
import { Building2 } from 'lucide-react';
import PortalLoginShell from '../../components/auth/PortalLoginShell';

export default function AdminLoginPage() {
  return (
    <PortalLoginShell
      expectedRole="institution_admin"
      portalBadge="INSTITUTION ADMIN PORTAL"
      title="Institution Administrator Sign In"
      subtitle="Authorized Grace Polytechnic portal for managing departments, academic sessions, supervisor assignments, and membership approvals."
      accent="admin"
      PortalIcon={Building2}
      identifierMode="email"
      identifierLabel="Administrator Email Address"
      identifierPlaceholder="admin@gracepolytechnic.edu.ng"
      identifierHelper="Restricted to authorized Grace Polytechnic administrative coordinators."
      contextHeading="Institutional governance & role administration"
      contextPoints={[
        'Verify student and supervisor onboarding requests and manage department structures.',
        'Provision supervisor roles, assign student projects, and oversee active academic sessions.',
        'Strict role enforcement prevents non-administrative accounts from accessing institutional controls.',
      ]}
      accessNotice={{
        title: 'Looking for Student or Supervisor sign-in?',
        body: 'Administrative credentials cannot be self-assigned during public registration. Students and supervisors should sign in through their dedicated portals.',
        linkTo: '/login',
        linkLabel: 'Return to Portal Gateway',
      }}
      secondaryAction={
        <span>
          Not an administrator?{' '}
          <Link to="/login" className="font-semibold text-[#8B5CF6] hover:underline">
            Switch to Student or Supervisor sign-in
          </Link>
        </span>
      }
    />
  );
}
