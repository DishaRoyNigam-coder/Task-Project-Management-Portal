import { Suspense, lazy } from 'react';
import { Outlet, RouteObject, createBrowserRouter, useLocation } from 'react-router';
import App from 'App';
import AuthLayout from 'layouts/auth-layout';
import MainLayout from 'layouts/main-layout';
import AllProjects from 'pages/Admin/AllProjects/AllProject';
import AdminDashboard from 'pages/Admin/dashboard/AdminDashboard';
import ProjectDetailPage from 'pages/Admin/projects/ProjectDetailPage';
import ProjectFormPage from 'pages/Admin/projects/ProjectFormPage';
import TaskFormPage from 'pages/Admin/tasks/TaskFormPage';
import EmployeeDashboard from 'pages/employee/EmployeeDashboard';
import PageLoader from 'components/loading/PageLoader';
import paths, { rootPaths } from './paths';

const UserList = lazy(() => import('pages/users/UserList'));
const Starter = lazy(() => import('pages/others/Starter'));
const Account = lazy(() => import('pages/others/Account'));

const Login = lazy(() => import('pages/authentication/Login'));
const Signup = lazy(() => import('pages/authentication/Signup'));

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
            path: paths.employeeDashboard,
            element: <EmployeeDashboard />,
          },
          {
            path: paths.projects.detail,
            element: <ProjectDetailPage />,
          },
          { path: paths.projects.edit, element: <ProjectFormPage /> },
          {
            path: paths.users,
            element: <UserList />,
          },
          {
            path: paths.account,
            element: <Account />,
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
