// src/routes/router.tsx
import { Suspense, lazy } from 'react';
import { Outlet, RouteObject, createBrowserRouter, useLocation } from 'react-router';
import App from 'App';
import AuthLayout from 'layouts/auth-layout';
import MainLayout from 'layouts/main-layout';
import AllProjects from 'pages/Admin/AllProjects/AllProject';
import AdminDashboard from 'pages/Admin/dashboard/AdminDashboard';
import ProjectFormPage from 'pages/Admin/projects/ProjectFormPage';
import TaskUpdatesReview from 'pages/Admin/taskUpdates/TaskUpdatesReview';
import TaskFormPage from 'pages/Admin/tasks/TaskFormPage';
import EmployeeDashboard from 'pages/employee/EmployeeDashboard';
import PageLoader from 'components/loading/PageLoader';
import ProjectLinksNotes from '../pages/Admin/projects/ProjectLinksNotes';
import paths, { rootPaths } from './paths';

// Lazy load user list and other pages
const Starter = lazy(() => import('pages/others/Starter'));
const Account = lazy(() => import('pages/others/Account'));
const SettingsPage = lazy(() => import('../pages/Admin/settings/SettingsPage'));
const Login = lazy(() => import('pages/authentication/Login'));
const Signup = lazy(() => import('pages/authentication/Signup'));
const AdminNotifications = lazy(() => import('../pages/Admin/notification/AdminNotifications'));
const MeetingTimeReport = lazy(() => import('../pages/Admin/reports/MeetingTimeByProject'));
const ProjectHealth = lazy(() => import('../pages/Admin/reports/ProjectHealth'));
const DelayedTasksReport = lazy(() => import('../pages/Admin/reports/DelayedTasksReport'));
const ProjectOverviewReport = lazy(() => import('../pages/Admin/reports/ProjectOverviewReport'));
const UserList = lazy(() => import('../pages/Admin/employeeList/UserList'));

// Lazy load employee pages
const EmployeeTaskList = lazy(() => import('../pages/employee/EmployeeTaskList'));
const EmployeeTaskUpdate = lazy(() => import('../pages/employee/EmployeeTaskUpdate'));
const EmployeeUpdateHistory = lazy(() => import('../pages/employee/EmployeeUpdateHistory'));
const EmployeeProjectList = lazy(() => import('../pages/employee/EmployeeProjectList'));
const EmployeeMeetingHistory = lazy(() => import('../pages/employee/EmployeeMeetingHistory'));
const EmployeeProjectDetail = lazy(() => import('../pages/employee/EmployeeProjectDetail'));
const EmployeeMeetingLog = lazy(() => import('../pages/employee/EmployeeMeetingLog'));
const EmployeeNotifications = lazy(() => import('../pages/employee/EmployeeNotifications'));
const EmployeeAccount = lazy(() => import('../pages/employee/EmployeeAccount'));
const EmployeeProfile = lazy(() => import('../pages/employee/EmployeeProfile'));

// ✅ Add this import for AdminTaskList
const AdminTaskList = lazy(() => import('../pages/Admin/tasks/AdminTaskList'));

export const SuspenseOutlet = () => {
  const location = useLocation();
  return (
    <Suspense key={location.pathname} fallback={<PageLoader />}>
      <Outlet />
    </Suspense>
  );
};

export const routes: RouteObject[] = [
  {
    element: <App />,
    children: [
      {
        path: '/',
        element: (
          <MainLayout>
            <SuspenseOutlet />
          </MainLayout>
        ),
        children: [
          // Admin routes
          {
            path: paths.admindashboard,
            element: <AdminDashboard />,
          },
          {
            index: true,
            element: <AllProjects />,
          },
          {
            path: paths.allProjects,
            element: <AllProjects />,
          },
          {
            path: paths.projects.edit,
            element: <ProjectFormPage />,
          },
          {
            path: paths.users,
            element: <UserList />,
          },
          {
            path: paths.account,
            element: <Account />,
          },
          {
            path: '/project-links-notes',
            element: <ProjectLinksNotes />,
          },
          {
            path: '/task-updates',
            element: <TaskUpdatesReview />,
          },
          {
            path: paths.starter,
            element: <Starter />,
          },

          {
            path: paths.projects.new,
            element: <ProjectFormPage />,
          },
          {
            path: paths.tasks.new,
            element: <TaskFormPage />,
          },
          {
            path: paths.tasks.edit,
            element: <TaskFormPage />,
          },
          // ✅ Admin Task List route – using paths.tasks.list
          {
            path: paths.tasks.list,
            element: <AdminTaskList />,
          },

          // Employee routes
          {
            path: paths.employee.dashboard,
            element: <EmployeeDashboard />,
          },
          {
            path: paths.employee.tasks,
            element: <EmployeeTaskList />,
          },
          {
            path: paths.employee.taskSubmitUpdate,
            element: <EmployeeTaskUpdate />,
          },
          {
            path: '/project-links-notes',
            element: <ProjectLinksNotes />,
          },
          {
            path: paths.employee.taskUpdateHistory,
            element: <EmployeeUpdateHistory />,
          },
          {
            path: paths.employee.projects,
            element: <EmployeeProjectList />,
          },
          {
            path: paths.employee.projectDetail,
            element: <EmployeeProjectDetail />,
          },
          {
            path: paths.employee.meetings,
            element: <EmployeeMeetingHistory />,
          },
          {
            path: paths.employee.meetingLog,
            element: <EmployeeMeetingLog />,
          },
          {
            path: paths.employee.meetingHistory,
            element: <EmployeeMeetingHistory />,
          },
          {
            path: paths.employee.notifications,
            element: <EmployeeNotifications />,
          },
          {
            path: paths.employee.profile,
            element: <EmployeeProfile />,
          },

          // Admin system routes
          {
            path: paths.system.settings,
            element: <SettingsPage />,
          },
          {
            path: paths.system.notifications,
            element: <AdminNotifications />,
          },

          // Report routes
          {
            path: paths.reports.projectOverview,
            element: <ProjectOverviewReport />,
          },
          {
            path: paths.reports.delayedTasks,
            element: <DelayedTasksReport />,
          },
          {
            path: paths.reports.projectHealth,
            element: <ProjectHealth />,
          },
          {
            path: paths.reports.meetingTime,
            element: <MeetingTimeReport />,
          },
          {
            path: paths.employee.account,
            element: <EmployeeAccount />,
          },
        ],
      },
      {
        path: rootPaths.authRoot,
        element: (
          <AuthLayout>
            <SuspenseOutlet />
          </AuthLayout>
        ),
        children: [
          {
            path: paths.login,
            element: <Login />,
          },
          {
            path: paths.signup,
            element: <Signup />,
          },
        ],
      },
    ],
  },
];

const router = createBrowserRouter(routes, {
  basename: import.meta.env.MODE === 'production' ? import.meta.env.VITE_BASENAME : '/',
});

export default router;
