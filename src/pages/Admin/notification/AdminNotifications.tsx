// src/pages/Admin/notifications/AdminNotifications.tsx
import { useEffect, useMemo, useState } from 'react';
import {
  Assignment as AssignmentIcon,
  DoneAll as DoneAllIcon,
  Warning as OverdueIcon,
  PriorityHigh as PriorityIcon,
  Block as RejectedIcon,
} from '@mui/icons-material';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { useProjects } from 'context/ProjectContext';
import { useTasks } from 'context/TaskContext';
import { useUpdates } from 'context/UpdateContext';

interface AdminNotification {
  id: string;
  type: 'task_assigned' | 'priority_changed' | 'update_rejected' | 'task_overdue';
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  taskId?: string;
  projectId?: string;
  employeeId?: string;
}

const AdminNotifications = () => {
  const { tasks } = useTasks();
  const { projects } = useProjects();
  const { updates } = useUpdates();

  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  // Load read status from localStorage
  useEffect(() => {
    const storedRead = localStorage.getItem('admin_notifications_read');
    const readIds = storedRead ? JSON.parse(storedRead) : [];

    // Build notifications from current data
    const generated: AdminNotification[] = [];

    // 1. Task assignments (each task assigned to any employee)
    tasks.forEach((task) => {
      const project = projects.find((p) => p.id === task.projectId);
      generated.push({
        id: `assign_${task.id}`,
        type: 'task_assigned',
        title: 'New Task Assigned',
        description: `Task "${task.title}" assigned to ${task.assignedTo.name} in project ${project?.projectName || 'Unknown'}. Due: ${new Date(task.dueDate).toLocaleDateString()}`,
        timestamp: task.createdAt || new Date().toISOString(),
        read: readIds.includes(`assign_${task.id}`),
        taskId: task.id,
        projectId: task.projectId,
        employeeId: String(task.assignedTo.id),
      });
    });

    // 2. Priority changes (simulate by checking tasks updated after creation)
    tasks.forEach((task) => {
      // If updatedAt exists and is newer than createdAt, assume priority changed (simplified)
      if (task.updatedAt && task.updatedAt !== task.createdAt) {
        generated.push({
          id: `priority_${task.id}`,
          type: 'priority_changed',
          title: 'Priority Changed',
          description: `Priority for task "${task.title}" changed to ${task.priority}.`,
          timestamp: task.updatedAt,
          read: readIds.includes(`priority_${task.id}`),
          taskId: task.id,
          projectId: task.projectId,
        });
      }
    });

    // 3. Rejected updates (from UpdateContext)
    updates
      .filter((up) => up.status === 'rejected')
      .forEach((update) => {
        const task = tasks.find((t) => t.id === update.taskId);
        generated.push({
          id: `reject_${update.id}`,
          type: 'update_rejected',
          title: 'Update Rejected',
          description: `Update for task "${task?.title || 'Unknown'}" was rejected. Reason: ${update.description.substring(0, 100)}`,
          timestamp: update.createdAt,
          read: readIds.includes(`reject_${update.id}`),
          taskId: update.taskId,
          employeeId: update.employeeId,
        });
      });

    // 4. Overdue tasks (tasks past due and not completed)
    const now = new Date();
    tasks
      .filter((task) => new Date(task.dueDate) < now && task.status !== 'Done')
      .forEach((task) => {
        generated.push({
          id: `overdue_${task.id}`,
          type: 'task_overdue',
          title: 'Task Overdue',
          description: `Task "${task.title}" assigned to ${task.assignedTo.name} is overdue.`,
          timestamp: task.dueDate,
          read: readIds.includes(`overdue_${task.id}`),
          taskId: task.id,
          projectId: task.projectId,
          employeeId: String(task.assignedTo.id),
        });
      });

    // Sort by timestamp descending (newest first)
    generated.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    setNotifications(generated);
  }, [tasks, projects, updates]);

  const markAsRead = (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    setNotifications(updated);
    const readIds = updated.filter((n) => n.read).map((n) => n.id);
    localStorage.setItem('admin_notifications_read', JSON.stringify(readIds));
    setSnackbar({ open: true, message: 'Marked as read' });
  };

  const markAllAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    const allIds = updated.map((n) => n.id);
    localStorage.setItem('admin_notifications_read', JSON.stringify(allIds));
    setSnackbar({ open: true, message: 'All notifications marked as read' });
  };

  const filteredNotifications = useMemo(() => {
    if (tabValue === 0) return notifications;
    return notifications.filter((n) => !n.read);
  }, [notifications, tabValue]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIcon = (type: AdminNotification['type']) => {
    switch (type) {
      case 'task_assigned':
        return <AssignmentIcon color="primary" />;
      case 'priority_changed':
        return <PriorityIcon color="warning" />;
      case 'update_rejected':
        return <RejectedIcon color="error" />;
      case 'task_overdue':
        return <OverdueIcon color="error" />;
      default:
        return <AssignmentIcon />;
    }
  };

  const getChip = (type: AdminNotification['type']) => {
    switch (type) {
      case 'task_assigned':
        return <Chip label="Assigned" size="small" color="info" />;
      case 'priority_changed':
        return <Chip label="Priority" size="small" color="warning" />;
      case 'update_rejected':
        return <Chip label="Rejected" size="small" color="error" />;
      case 'task_overdue':
        return <Chip label="Overdue" size="small" color="error" />;
      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 900, mx: 'auto' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h4"> Notifications</Typography>
        {unreadCount > 0 && (
          <Button startIcon={<DoneAllIcon />} onClick={markAllAsRead} variant="outlined">
            Mark all as read ({unreadCount})
          </Button>
        )}
      </Stack>

      <Card>
        {/* Tabs with light blue border on active tab */}
        <Tabs
          value={tabValue}
          onChange={(_, v) => setTabValue(v)}
          slotProps={{ indicator: { style: { display: 'none' } } }} // Hide default underline
        >
          <Tab
            label={`All (${notifications.length})`}
            sx={{
              '&.Mui-selected': {
                // border: '1px solid lightblue',
                // borderRadius: '16px',
              },
            }}
          />
          <Tab
            label={`Unread (${unreadCount})`}
            sx={{
              '&.Mui-selected': {
                // border: '1px solid lightblue',
                // borderRadius: '16px',
              },
            }}
          />
        </Tabs>
        <Divider />
        <CardContent>
          {filteredNotifications.length === 0 ? (
            <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
              No notifications to display.
            </Typography>
          ) : (
            <List>
              {filteredNotifications.map((notif, idx) => (
                <div key={notif.id}>
                  {idx > 0 && <Divider />}
                  <ListItem
                    sx={{
                      bgcolor: notif.read ? 'transparent' : 'action.hover',
                      borderRadius: 1,
                    }}
                    secondaryAction={
                      !notif.read && (
                        <Button size="small" onClick={() => markAsRead(notif.id)}>
                          Mark read
                        </Button>
                      )
                    }
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'background.paper' }}>{getIcon(notif.type)}</Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                          <Typography variant="subtitle1">{notif.title}</Typography>
                          {getChip(notif.type)}
                        </Stack>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" sx={{ mt: 0.5 }}>
                            {notif.description}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(notif.timestamp).toLocaleString()}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                </div>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="success">{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminNotifications;
