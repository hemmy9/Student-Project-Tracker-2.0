import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import ProtectedDemoRoute from '../components/auth/ProtectedDemoRoute';
import HomePage from '../pages/HomePage';
import InstitutionRegisterPage from '../pages/InstitutionRegisterPage';
import LoginPage from '../pages/LoginPage';
import NotFoundPage from '../pages/NotFoundPage';
import PortalPreviewPage from '../pages/PortalPreviewPage';
import RegisterHubPage from '../pages/RegisterHubPage';
import StudentRegisterPage from '../pages/StudentRegisterPage';
import SupervisorRegisterPage from '../pages/SupervisorRegisterPage';
import InstitutionDashboardPage from '../pages/dashboards/InstitutionDashboardPage';
import PlatformDashboardPage from '../pages/dashboards/PlatformDashboardPage';
import StudentDashboardPage from '../pages/dashboards/StudentDashboardPage';
import SupervisorDashboardPage from '../pages/dashboards/SupervisorDashboardPage';
import InstitutionApprovalsPage from '../pages/portals/institution/InstitutionApprovalsPage';
import InstitutionProjectsPage from '../pages/portals/institution/InstitutionProjectsPage';
import InstitutionReportsPage from '../pages/portals/institution/InstitutionReportsPage';
import InstitutionStructurePage from '../pages/portals/institution/InstitutionStructurePage';
import PlatformApplicationsPage from '../pages/portals/platform/PlatformApplicationsPage';
import PlatformGovernancePage from '../pages/portals/platform/PlatformGovernancePage';
import PlatformInstitutionsPage from '../pages/portals/platform/PlatformInstitutionsPage';
import StudentDocumentsPage from '../pages/portals/student/StudentDocumentsPage';
import StudentJournalsPage from '../pages/portals/student/StudentJournalsPage';
import StudentMessagesReportsPage from '../pages/portals/student/StudentMessagesReportsPage';
import StudentMilestonesPage from '../pages/portals/student/StudentMilestonesPage';
import StudentOfficeHoursPage from '../pages/portals/student/StudentOfficeHoursPage';
import StudentTasksPage from '../pages/portals/student/StudentTasksPage';
import SupervisorJournalsPage from '../pages/portals/supervisor/SupervisorJournalsPage';
import SupervisorMessagesReportsPage from '../pages/portals/supervisor/SupervisorMessagesReportsPage';
import SupervisorMilestonesPage from '../pages/portals/supervisor/SupervisorMilestonesPage';
import SupervisorOfficeHoursPage from '../pages/portals/supervisor/SupervisorOfficeHoursPage';
import SupervisorReviewsPage from '../pages/portals/supervisor/SupervisorReviewsPage';
import SupervisorStudentsPage from '../pages/portals/supervisor/SupervisorStudentsPage';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);

  return null;
}

export default function AppRoutes() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/portal-preview"
          element={
            <ProtectedDemoRoute>
              <PortalPreviewPage />
            </ProtectedDemoRoute>
          }
        />

        {/* Student Portal Routes */}
        <Route
          path="/student"
          element={
            <ProtectedDemoRoute allowedRoles={['student']}>
              <StudentDashboardPage />
            </ProtectedDemoRoute>
          }
        />
        <Route
          path="/student/tasks"
          element={
            <ProtectedDemoRoute allowedRoles={['student']}>
              <StudentTasksPage />
            </ProtectedDemoRoute>
          }
        />
        <Route
          path="/student/journals"
          element={
            <ProtectedDemoRoute allowedRoles={['student']}>
              <StudentJournalsPage />
            </ProtectedDemoRoute>
          }
        />
        <Route
          path="/student/documents"
          element={
            <ProtectedDemoRoute allowedRoles={['student']}>
              <StudentDocumentsPage />
            </ProtectedDemoRoute>
          }
        />
        <Route
          path="/student/milestones"
          element={
            <ProtectedDemoRoute allowedRoles={['student']}>
              <StudentMilestonesPage />
            </ProtectedDemoRoute>
          }
        />
        <Route
          path="/student/office-hours"
          element={
            <ProtectedDemoRoute allowedRoles={['student']}>
              <StudentOfficeHoursPage />
            </ProtectedDemoRoute>
          }
        />
        <Route
          path="/student/messages"
          element={
            <ProtectedDemoRoute allowedRoles={['student']}>
              <StudentMessagesReportsPage />
            </ProtectedDemoRoute>
          }
        />

        {/* Supervisor Portal Routes */}
        <Route
          path="/supervisor"
          element={
            <ProtectedDemoRoute allowedRoles={['supervisor']}>
              <SupervisorDashboardPage />
            </ProtectedDemoRoute>
          }
        />
        <Route
          path="/supervisor/students"
          element={
            <ProtectedDemoRoute allowedRoles={['supervisor']}>
              <SupervisorStudentsPage />
            </ProtectedDemoRoute>
          }
        />
        <Route
          path="/supervisor/milestones"
          element={
            <ProtectedDemoRoute allowedRoles={['supervisor']}>
              <SupervisorMilestonesPage />
            </ProtectedDemoRoute>
          }
        />
        <Route
          path="/supervisor/reviews"
          element={
            <ProtectedDemoRoute allowedRoles={['supervisor']}>
              <SupervisorReviewsPage />
            </ProtectedDemoRoute>
          }
        />
        <Route
          path="/supervisor/journals"
          element={
            <ProtectedDemoRoute allowedRoles={['supervisor']}>
              <SupervisorJournalsPage />
            </ProtectedDemoRoute>
          }
        />
        <Route
          path="/supervisor/office-hours"
          element={
            <ProtectedDemoRoute allowedRoles={['supervisor']}>
              <SupervisorOfficeHoursPage />
            </ProtectedDemoRoute>
          }
        />
        <Route
          path="/supervisor/reports"
          element={
            <ProtectedDemoRoute allowedRoles={['supervisor']}>
              <SupervisorMessagesReportsPage />
            </ProtectedDemoRoute>
          }
        />

        {/* Institution Admin Portal Routes */}
        <Route
          path="/institution"
          element={
            <ProtectedDemoRoute allowedRoles={['institution_admin']}>
              <InstitutionDashboardPage />
            </ProtectedDemoRoute>
          }
        />
        <Route
          path="/institution/structure"
          element={
            <ProtectedDemoRoute allowedRoles={['institution_admin']}>
              <InstitutionStructurePage />
            </ProtectedDemoRoute>
          }
        />
        <Route
          path="/institution/approvals"
          element={
            <ProtectedDemoRoute allowedRoles={['institution_admin']}>
              <InstitutionApprovalsPage />
            </ProtectedDemoRoute>
          }
        />
        <Route
          path="/institution/projects"
          element={
            <ProtectedDemoRoute allowedRoles={['institution_admin']}>
              <InstitutionProjectsPage />
            </ProtectedDemoRoute>
          }
        />
        <Route
          path="/institution/reports"
          element={
            <ProtectedDemoRoute allowedRoles={['institution_admin']}>
              <InstitutionReportsPage />
            </ProtectedDemoRoute>
          }
        />

        {/* Platform Admin Portal Routes */}
        <Route
          path="/platform"
          element={
            <ProtectedDemoRoute allowedRoles={['platform_admin']}>
              <PlatformDashboardPage />
            </ProtectedDemoRoute>
          }
        />
        <Route
          path="/platform/institutions"
          element={
            <ProtectedDemoRoute allowedRoles={['platform_admin']}>
              <PlatformInstitutionsPage />
            </ProtectedDemoRoute>
          }
        />
        <Route
          path="/platform/applications"
          element={
            <ProtectedDemoRoute allowedRoles={['platform_admin']}>
              <PlatformApplicationsPage />
            </ProtectedDemoRoute>
          }
        />
        <Route
          path="/platform/governance"
          element={
            <ProtectedDemoRoute allowedRoles={['platform_admin']}>
              <PlatformGovernancePage />
            </ProtectedDemoRoute>
          }
        />

        <Route path="/register" element={<RegisterHubPage />} />
        <Route path="/register/institution" element={<InstitutionRegisterPage />} />
        <Route path="/register/student" element={<StudentRegisterPage />} />
        <Route path="/register/supervisor" element={<SupervisorRegisterPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}
