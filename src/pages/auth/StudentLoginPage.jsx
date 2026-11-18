import { Link } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import PortalLoginShell from '../../components/auth/PortalLoginShell';

export default function StudentLoginPage() {
  return (
    <PortalLoginShell
      expectedRole="student"
      portalBadge="STUDENT PORTAL"
      title="Student Portal Sign In"
      subtitle="Access your Grace Polytechnic ND/HND project workspace, submit chapters, log weekly journals, and book supervisor office hours."
      accent="student"
      PortalIcon={GraduationCap}
      identifierMode="emailOrStudentId"
      identifierLabel="Email Address or Student ID"
      identifierPlaceholder="student@gracepolytechnic.edu.ng or GP/CSC/2025/001"
      identifierHelper="Use your registered Grace Polytechnic email address (or GP/CSC/2025/001 in Demo Preview mode)."
      contextHeading="Dedicated workspace for Grace Polytechnic candidates"
      contextPoints={[
        'Track assigned ND and HND project milestones, deadlines, and revision checklists in one view.',
        'Submit chapter drafts, log weekly progress journals, and book supervisor office hours.',
        'Only accounts with an approved Student membership can enter the Student workspace.',
      ]}
      accessNotice={{
        title: 'New ND or HND student at Grace Polytechnic?',
        body: 'Create your student onboarding profile with your department, programme, and academic session for Institution Administrator approval.',
        linkTo: '/register/student',
        linkLabel: 'Open Student Registration',
      }}
      secondaryAction={
        <span>
          Do not have a student account yet?{' '}
          <Link to="/register/student" className="font-semibold text-[var(--accent-primary)] hover:underline">
            Register as a Student
          </Link>
        </span>
      }
    />
  );
}
