import { Link } from 'react-router-dom';
import { UserCheck } from 'lucide-react';
import PortalLoginShell from '../../components/auth/PortalLoginShell';

export default function SupervisorLoginPage() {
  return (
    <PortalLoginShell
      expectedRole="supervisor"
      portalBadge="SUPERVISOR PORTAL"
      title="Supervisor Portal Sign In"
      subtitle="Sign in as a Grace Polytechnic project supervisor to review chapter submissions, inspect weekly journals, and host office hours."
      accent="supervisor"
      PortalIcon={UserCheck}
      identifierMode="email"
      identifierLabel="Institutional Email Address"
      identifierPlaceholder="supervisor@gracepolytechnic.edu.ng"
      identifierHelper="Supervisor accounts are provisioned by authorised Grace Polytechnic Institution Administrators."
      contextHeading="Structured academic supervision & review queue"
      contextPoints={[
        'Monitor assigned student cohorts across Computer Science, Engineering, and Management departments.',
        'Review chapter uploads, request targeted revisions, and sign off on project milestones.',
        'Publish weekly office-hour availability slots and manage student consultation bookings.',
      ]}
      accessNotice={{
        title: 'Supervisor access is administrator-provisioned',
        body: 'Public supervisor self-registration is disabled. Contact a Grace Polytechnic Institution Administrator if you require a supervisor account. Verified invitation onboarding is planned for Stage D.',
        linkTo: '/login',
        linkLabel: 'View all portal gateways',
      }}
      secondaryAction={
        <span>
          Not a supervisor?{' '}
          <Link to="/login" className="font-semibold text-[#14B8A6] hover:underline">
            Switch to Student or Institution Admin sign-in
          </Link>
        </span>
      }
    />
  );
}
