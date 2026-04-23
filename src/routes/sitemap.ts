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
            name: 'Create New Project',
            path: paths.projects.new,
            pathName: 'new-project',
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
        name: 'Tasks',
        icon: 'material-symbols:task-alt',
        pathName: 'admin-tasks-root',
        active: true,
        items: [
          {
            name: 'Task List',
            path: paths.tasks.list,
            pathName: 'admin-task-list',
            icon: 'material-symbols:format-list-bulleted',
            active: true, // set to true when page exists
          },
          {
            name: 'Create / Assign New Task',
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
            path: '/task-detail',
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
    id: 'attendance',
    icon: 'material-symbols:calendar-month',
    items: [
      {
        name: 'Attendance', // ✅ name goes inside the SubMenuItem
        path: paths.attendance,
        icon: 'material-symbols:calendar-month',
        pathName: 'attendance',
        active: true,
      },
    ],
  },

  {
    id: 'system',
    icon: 'material-symbols:settings',
    items: [
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
