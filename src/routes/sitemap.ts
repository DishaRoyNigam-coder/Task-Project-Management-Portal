// src/routes/sitemap.ts
import { HTMLAttributeAnchorTarget } from 'react';
import { SxProps } from '@mui/material';
import paths from './paths';

export interface SubMenuItem {
  name: string;
  pathName: string;
  key?: string;
  selectionPrefix?: string;
  path?: string;
  target?: HTMLAttributeAnchorTarget;
  active?: boolean;
  icon?: string;
  iconSx?: SxProps;
  items?: SubMenuItem[];
}

export interface MenuItem {
  id: string;
  icon: string;
  subheader?: string;
  items: SubMenuItem[];
}

const sitemap: MenuItem[] = [
  {
    id: 'dashboard',
    icon: 'material-symbols:dashboard',
    items: [
      {
        name: 'Dashboard',
        path: paths.admindashboard,
        icon: 'material-symbols:dashboard',
        pathName: 'dashboard',
        active: true,
      },
    ],
  },
  {
    id: 'projects',
    icon: 'material-symbols:folder-outline',
    items: [
      {
        name: 'Projects',
        icon: 'material-symbols:folder-outline',
        pathName: 'all-projects',
        active: true,
        items: [
          {
            name: 'Project List',
            path: paths.allProjects,
            pathName: 'all-projects',
            icon: 'material-symbols:list-alt',
            active: true,
          },
          {
            name: 'Create / Edit Project',
            path: paths.projects.new,
            pathName: 'project-links-notes',
            icon: 'material-symbols:edit',
            active: true,
          },
          {
            name: 'Project Detail',
            path: paths.projects.detail,
            pathName: 'project-detail',
            icon: 'material-symbols:article',
            active: false,
          },
          {
            name: 'Project Links & Notes',
            path: '/project-links-notes',
            pathName: 'project-links',
            icon: 'material-symbols:link',
            active: false,
          },
          {
            name: 'Meeting Log',
            path: '#',
            pathName: 'project-meetings',
            icon: 'material-symbols:meeting-room',
            active: false,
          },
        ],
      },
    ],
  },
  // ─── NEW: All Tasks section (dropdown) ──────────────────────────
  {
    id: 'tasks',
    icon: 'material-symbols:task-alt',
    items: [
      {
        name: 'All Tasks',
        icon: 'material-symbols:task-alt',
        pathName: 'admin-tasks-root',
        active: true,
        items: [
          {
            name: 'Task List',
            path: '/admin/tasks', // new page to be created
            pathName: 'admin-task-list',
            icon: 'material-symbols:list-alt',
            active: true, // set to true when page exists
          },
          {
            name: 'Create / Assign Task',
            path: paths.tasks.new,
            pathName: 'task-create',
            icon: 'material-symbols:add-task',
            active: true,
          },
          {
            name: 'Task Updates Review',
            path: '/task-updates',
            pathName: 'task-updates',
            icon: 'material-symbols:update',
            active: true,
          },
          {
            name: 'Task Details',
            path: '/admin/tasks/:id',
            pathName: 'admin-task-detail',
            icon: 'material-symbols:article',
            active: false, // future use
          },
        ],
      },
    ],
  },
  // ─── End of All Tasks section ──────────────────────────────────
  {
    id: 'employees',
    icon: 'material-symbols:groups',
    items: [
      {
        name: 'Employee List',
        path: paths.users,
        icon: 'material-symbols:groups',
        pathName: 'employee-list',
        active: true,
      },
    ],
  },
  {
    id: 'reports',
    icon: 'material-symbols:bar-chart',
    items: [
      {
        name: 'Project Overview',
        path: paths.reports.projectOverview,
        pathName: 'project-overview',
        icon: 'material-symbols:overview',
        active: true,
      },
      {
        name: 'Delayed Tasks',
        path: paths.reports.delayedTasks,
        icon: 'material-symbols:warning',
        pathName: 'delayed-tasks',
        active: true,
      },
      {
        name: 'Project Health',
        path: paths.reports.projectHealth,
        pathName: 'project-health',
        icon: 'material-symbols:health-and-safety',
        active: true,
      },
      {
        name: 'Meeting Time by Project',
        path: paths.reports.meetingTime,
        icon: 'material-symbols:meeting-room',
        pathName: 'meeting-time',
        active: true,
      },
    ],
  },
  {
    id: 'system',
    icon: 'material-symbols:settings',
    items: [
      {
        name: 'Notifications',
        path: paths.system.notifications,
        icon: 'material-symbols:notifications',
        pathName: 'notifications',
        active: true,
      },
      {
        name: 'Settings',
        path: paths.system.settings,
        icon: 'material-symbols:settings',
        pathName: 'settings',
        active: true,
      },
    ],
  },
];

export default sitemap;
