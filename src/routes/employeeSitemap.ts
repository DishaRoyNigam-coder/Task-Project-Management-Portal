// src/routes/employeeSitemap.ts
import { MenuItem } from './sitemap';

// reuse the same interface

const employeeSitemap: MenuItem[] = [
  {
    id: 'dashboard',
    icon: 'material-symbols:dashboard',
    items: [
      {
        name: 'Employee Dashboard',
        path: '/employee/dashboard',
        icon: 'material-symbols:dashboard',
        pathName: 'employee-dashboard',
        active: true,
      },
    ],
  },
  {
    id: 'tasks',
    icon: 'material-symbols:task-alt',
    items: [
      {
        name: 'My Tasks',
        path: '/employee/tasks',
        icon: 'material-symbols:task-alt',
        pathName: 'employee-tasks',
        active: true,
        items: [
          {
            name: 'All Tasks',
            path: '/employee/tasks',
            pathName: 'employee-tasks-all',
            icon: 'material-symbols:list-alt',
            active: true,
          },
          {
            name: 'Submit Update',
            path: '/employee/tasks/submit-update',
            pathName: 'employee-task-update',
            icon: 'material-symbols:edit-note',
            active: true,
          },
          {
            name: 'Update History',
            path: '/employee/tasks/history',
            pathName: 'employee-update-history',
            icon: 'material-symbols:history',
            active: true,
          },
        ],
      },
    ],
  },
  {
    id: 'projects',
    icon: 'material-symbols:folder-outline',
    items: [
      {
        name: 'My Projects',
        path: '/employee/projects',
        icon: 'material-symbols:folder-outline',
        pathName: 'employee-projects',
        active: true,
        items: [
          {
            name: 'Project List',
            path: '/employee/projects',
            pathName: 'employee-projects-list',
            icon: 'material-symbols:folder',
            active: true,
          },
          {
            name: 'Project Detail',
            path: '/employee/projects/:id', // dynamic, handled in router
            pathName: 'employee-project-detail',
            icon: 'material-symbols:article',
            active: false,
          },
          {
            name: 'Meeting Notes (View)',
            path: '/employee/meetings',
            pathName: 'employee-meeting-notes',
            icon: 'material-symbols:meeting-room',
            active: true,
          },
        ],
      },
    ],
  },
  {
    id: 'meetings',
    icon: 'material-symbols:calendar-month',
    items: [
      {
        name: 'Meetings',
        path: '/employee/meetings',
        icon: 'material-symbols:calendar-month',
        pathName: 'employee-meetings',
        active: true,
        items: [
          {
            name: 'Log a Meeting',
            path: '/employee/meetings/log',
            pathName: 'employee-meeting-log',
            icon: 'material-symbols:add',
            active: true,
          },
          {
            name: 'My Meeting History',
            path: '/employee/meetings/history',
            pathName: 'employee-meeting-history',
            icon: 'material-symbols:history',
            active: true,
          },
        ],
      },
    ],
  },
  {
    id: 'account',
    icon: 'material-symbols:account-circle',
    items: [
      {
        name: 'Account',
        path: '/employee/account',
        icon: 'material-symbols:account-circle',
        pathName: 'employee-account',
        active: true,
        items: [
          {
            name: 'Notifications',
            path: '/employee/notifications',
            pathName: 'employee-notifications',
            icon: 'material-symbols:notifications',
            active: true,
          },
          {
            name: 'My Profile',
            path: '/employee/profile',
            pathName: 'employee-profile',
            icon: 'material-symbols:manage-accounts',
            active: true,
          },
        ],
      },
    ],
  },
];

export default employeeSitemap;
