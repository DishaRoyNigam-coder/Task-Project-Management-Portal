import { documentationPath } from 'lib/constants';

export const rootPaths = {
  root: '/',
  authRoot: 'auth',
};

const paths = {
  root: rootPaths.root,
  starter: `/starter`,
  users: `/users`,
  account: `/account`,
  login: `/${rootPaths.authRoot}/login`,
  signup: `/${rootPaths.authRoot}/sign-up`,
  notifications: `/notifications`,
  documentation: documentationPath,
  adminDashboard: `/admin/dashboard`,
  employeeDashboard: `/employee/dashboard`,
  employeeProjects: `/employee/projects/:id`,
  projects: {
    new: '/projects/new',
    edit: '/projects/:id/edit',
    links: '/projects/:projectId/links',
    detail: '/projects/:projectId',
  },
  tasks: {
    new: '/tasks/new',
    edit: '/tasks/:taskId/edit',
  },
  404: `/404`,
};

export default paths;
