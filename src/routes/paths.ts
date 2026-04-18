import { documentationPath } from 'lib/constants';

export const rootPaths = {
  root: '/',
  authRoot: 'auth',
};

const paths = {
  root: rootPaths.root,
  admindashboard: 'admin/dashboard',
  reports: {
    root: '/reports',
    projectOverview: '/reports/project-overview',
    delayedTasks: '/reports/delayed-tasks',
    projectHealth: '/reports/project-health',
    meetingTime: '/reports/meeting-time',
  },
  system: {
    root: '/system',
    notifications: '/system/notifications',
    settings: '/system/settings',
  },
  starter: `/starter`,
  users: `/users`,
  account: `/account`,
  login: `/${rootPaths.authRoot}/login`,
  signup: `/${rootPaths.authRoot}/sign-up`,
  notifications: `/notifications`,
  documentation: documentationPath,
  allProjects: `/projects`,
  employeeDashboard: `/employee/dashboard`,
  employeeProjects: `/employee/projects/:id`,
  projects: {
    new: '/projects/new',
    edit: '/projects/:id/edit',
    links: '/projects/:projectId/links',
    detail: '/projects/:projectId',
    meetings: '/projects/:projectId/meetings',
  },
  tasks: {
    new: '/tasks/new',
    edit: '/tasks/:taskId/edit',
  },
  404: `/404`,
  // inside paths object
  employee: {
    dashboard: '/employee/dashboard',
    tasks: '/employee/tasks',
    taskSubmitUpdate: '/employee/tasks/submit-update',
    taskUpdateHistory: '/employee/tasks/history',
    projects: '/employee/projects',
    projectDetail: '/employee/projects/:id',
    meetings: '/employee/meetings',
    meetingLog: '/employee/meetings/log',
    meetingHistory: '/employee/meetings/history',
    notifications: '/employee/notifications',
    profile: '/employee/profile',
    users: `/users`,
  },
};

export default paths;
