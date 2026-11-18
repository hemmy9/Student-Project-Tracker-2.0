import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import ProtectedDemoRoute from '../components/auth/ProtectedDemoRoute';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import NotFoundPage from '../pages/NotFoundPage';
import PortalPreviewPage from '../pages/PortalPreviewPage';
import StudentRegisterPage from '../pages/StudentRegisterPage';
import SupervisorRegisterPage from '../pages/SupervisorRegisterPage';
import AdminLoginPage from '../pages/auth/AdminLoginPage';
import StudentLoginPage from '../pages/auth/StudentLoginPage';
import SupervisorLoginPage from '../pages/auth/SupervisorLoginPage';
import InstitutionDashboardPage from '../pages/dashboards/InstitutionDashboardPage';
import StudentDashboardPage from '../pages/dashboards/StudentDashboardPage';
import SupervisorDashboardPage from '../pages/dashboards/SupervisorDashboardPage';
import InstitutionApprovalsPage from '../pages/portals/institution/InstitutionApprovalsPage';
import InstitutionProjectsPage from '../pages/portals/institution/InstitutionProjectsPage';
import InstitutionProfilePage from '../pages/portals/institution/InstitutionProfilePage';
import InstitutionReportsPage from '../pages/portals/institution/InstitutionReportsPage';
import InstitutionStructurePage from '../pages/portals/institution/InstitutionStructurePage';
import StudentDocumentsPage from '../pages/portals/student/StudentDocumentsPage';
import StudentJournalsPage from '../pages/portals/student/StudentJournalsPage';
import StudentMessagesReportsPage from '../pages/portals/student/StudentMessagesReportsPage';
import StudentMilestonesPage from '../pages/portals/student/StudentMilestonesPage';
import StudentOfficeHoursPage from '../pages/portals/student/StudentOfficeHoursPage';
import StudentProfilePage from '../pages/portals/student/StudentProfilePage';
import StudentTasksPage from '../pages/portals/student/StudentTasksPage';
import SupervisorJournalsPage from '../pages/portals/supervisor/SupervisorJournalsPage';
import SupervisorMessagesReportsPage from '../pages/portals/supervisor/SupervisorMessagesReportsPage';
import SupervisorMilestonesPage from '../pages/portals/supervisor/SupervisorMilestonesPage';
import SupervisorOfficeHoursPage from '../pages/portals/supervisor/SupervisorOfficeHoursPage';
import SupervisorProfilePage from '../pages/portals/supervisor/SupervisorProfilePage';
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
        <Route path="/login/student" element={<StudentLoginPage />} />
        <Route path="/login/supervisor" element={<SupervisorLoginPage />} />
        <Route path="/login/admin" element={<AdminLoginPage />} />
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
        <Route
          path="/student/profile"
          element={
            <ProtectedDemoRoute allowedRoles={['student']}>
              <StudentProfilePage />
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
        <Route
          path="/supervisor/profile"
          element={
            <ProtectedDemoRoute allowedRoles={['supervisor']}>
              <SupervisorProfilePage />
            </ProtectedDemoRoute>
          }
        />

        {/* Institution Admin Portal Routes (/admin/*) */}
        <Route
          path="/admin"
          element={
            <ProtectedDemoRoute allowedRoles={['institution_admin']}>
              <InstitutionDashboardPage />
            </ProtectedDemoRoute>
          }
        />
        <Route
          path="/admin/structure"
          element={
            <ProtectedDemoRoute allowedRoles={['institution_admin']}>
              <InstitutionStructurePage />
            </ProtectedDemoRoute>
          }
        />
        <Route
          path="/admin/approvals"
          element={
            <ProtectedDemoRoute allowedRoles={['institution_admin']}>
              <InstitutionApprovalsPage />
            </ProtectedDemoRoute>
          }
        />
        <Route
          path="/admin/projects"
          element={
            <ProtectedDemoRoute allowedRoles={['institution_admin']}>
              <InstitutionProjectsPage />
            </ProtectedDemoRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedDemoRoute allowedRoles={['institution_admin']}>
              <InstitutionReportsPage />
            </ProtectedDemoRoute>
          }
        />
        <Route
          path="/admin/profile"
          element={
            <ProtectedDemoRoute allowedRoles={['institution_admin']}>
              <InstitutionProfilePage />
            </ProtectedDemoRoute>
          }
        />

        {/* Legacy /institution/* Compatibility Redirects */}
        <Route path="/institution" element={<Navigate to="/admin" replace />} />
        <Route
          path="/institution/structure"
          element={<Navigate to="/admin/structure" replace />}
        />
        <Route
          path="/institution/approvals"
          element={<Navigate to="/admin/approvals" replace />}
        />
        <Route
          path="/institution/projects"
          element={<Navigate to="/admin/projects" replace />}
        />
        <Route
          path="/institution/reports"
          element={<Navigate to="/admin/reports" replace />}
        />
        <Route path="/institution/*" element={<Navigate to="/admin" replace />} />

        {/* Retired Platform Admin Routes (safely routed through ProtectedDemoRoute via /portal-preview) */}
        <Route path="/platform" element={<Navigate to="/portal-preview" replace />} />
        <Route path="/platform/*" element={<Navigate to="/portal-preview" replace />} />

        {/* Registration Routes */}
        <Route path="/register" element={<Navigate to="/register/student" replace />} />
        <Route path="/register/institution" element={<Navigate to="/" replace />} />
        <Route path="/register/student" element={<StudentRegisterPage />} />
        <Route path="/register/supervisor" element={<SupervisorRegisterPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}
