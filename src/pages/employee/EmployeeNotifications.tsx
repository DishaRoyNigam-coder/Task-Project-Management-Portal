import { useMemo } from 'react';
import {
  Assignment as AssignmentIcon,
  CheckCircle as CompletedIcon,
  PriorityHigh as PriorityIcon,
  Block as RejectedIcon,
  Update as UpdateIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
} from '@mui/material';
import { useAuth } from 'context/AuthContext';
import { useProjects } from 'context/ProjectContext';
import { useTasks } from 'context/TaskContext';
import { useUpdates } from 'context/UpdateContext';

interface NotificationItem {
  id: string;
  type:
    | 'task_assigned'
    | 'priority_changed'
    | 'update_rejected'
    | 'task_completed'
    | 'task_delayed';
  title: string;
  description: string;
  timestamp: string;
  read?: boolean;
  taskId?: string;
  projectId?: string;
}

const EmployeeNotifications = () => {
  const { user } = useAuth();
  const { tasks } = useTasks();
  const { projects } = useProjects();
  const { updates } = useUpdates();

  // Build notifications from existing data (demo: last 7 days)
  const notifications = useMemo<NotificationItem[]>(() => {
    if (!user) return [];

    const now = new Date();
    const sevenDaysAgo = new Date(now.setDate(now.getDate() - 7));
    const notifs: NotificationItem[] = [];

    // 1. Task assignments (tasks assigned to this employee)
    tasks
      .filter((task) => task.assignedTo.id === user.id)
      .forEach((task) => {
        const project = projects.find((p) => p.id === task.projectId);
        notifs.push({
          id: `assign-${task.id}`,
          type: 'task_assigned',
          title: 'New Task Assigned',
          description: `You have been assigned "${task.title}" in project ${project?.projectName || 'Unknown'}. Due: ${new Date(task.dueDate).toLocaleDateString()}`,
          timestamp: task.createdAt || new Date().toISOString(),
          taskId: task.id,
          projectId: task.projectId,
        });
      });

    // 2. Priority changes (mock - in real app you'd store history)
    // For demo, we'll simulate by checking tasks updated within last 7 days
    tasks
      .filter((task) => task.assignedTo.id === user.id && task.updatedAt)
      .forEach((task) => {
        // In a real app, compare with previous priority. Here we just create an example.
        if (new Date(task.updatedAt) > sevenDaysAgo) {
          notifs.push({
            id: `priority-${task.id}`,
            type: 'priority_changed',
            title: 'Priority Changed',
            description: `Priority for task "${task.title}" has been updated to ${task.priority}.`,
            timestamp: task.updatedAt,
            taskId: task.id,
          });
        }
      });

    // 3. Rejected updates (from UpdateContext)
    updates
      .filter((up) => up.employeeId === String(user.id) && up.status === 'rejected')
      .forEach((update) => {
        const task = tasks.find((t) => t.id === update.taskId);
        notifs.push({
          id: `reject-${update.id}`,
          type: 'update_rejected',
          title: 'Update Rejected',
          description: `Your update for task "${task?.title || 'Unknown'}" was rejected by admin. Reason: ${update.description.substring(0, 100)}`,
          timestamp: update.createdAt,
          taskId: update.taskId,
        });
      });

    // 4. Task completed by employee (optional – can be shown as success)
    updates
      .filter((up) => up.employeeId === String(user.id) && up.type === 'Completed')
      .forEach((update) => {
        const task = tasks.find((t) => t.id === update.taskId);
        notifs.push({
          id: `completed-${update.id}`,
          type: 'task_completed',
          title: 'Task Completed',
          description: `You marked task "${task?.title || 'Unknown'}" as completed.`,
          timestamp: update.createdAt,
          taskId: update.taskId,
        });
      });

    // 5. Delayed tasks (tasks past due date and not completed)
    tasks
      .filter(
        (task) =>
          task.assignedTo.id === user.id &&
          new Date(task.dueDate) < new Date() &&
          task.status !== 'Done',
      )
      .forEach((task) => {
        notifs.push({
          id: `delayed-${task.id}`,
          type: 'task_delayed',
          title: 'Task Overdue',
          description: `Task "${task.title}" is overdue. Please update its status.`,
          timestamp: task.dueDate,
          taskId: task.id,
        });
      });

    // Sort by timestamp descending (newest first)
    return notifs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [user, tasks, projects, updates]);

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'task_assigned':
        return <AssignmentIcon color="primary" />;
      case 'priority_changed':
        return <PriorityIcon color="warning" />;
      case 'update_rejected':
        return <RejectedIcon color="error" />;
      case 'task_completed':
        return <CompletedIcon color="success" />;
      case 'task_delayed':
        return <WarningIcon color="error" />;
      default:
        return <UpdateIcon color="info" />;
    }
  };

  const getChipColor = (type: NotificationItem['type']) => {
    switch (type) {
      case 'task_assigned':
        return 'info';
      case 'priority_changed':
        return 'warning';
      case 'update_rejected':
        return 'error';
      case 'task_completed':
        return 'success';
      case 'task_delayed':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Notifications
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Task assignments, priority changes, update rejections, and overdue tasks.
      </Typography>

      {notifications.length === 0 ? (
        <Alert severity="info" icon={<UpdateIcon />}>
          <AlertTitle>No new notifications</AlertTitle>
          You're all caught up! Check back later for updates on your tasks.
        </Alert>
      ) : (
        <Stack spacing={2}>
          {notifications.map((notif) => (
            <Card key={notif.id} variant="outlined" sx={{ position: 'relative' }}>
              <CardContent>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                  {getIcon(notif.type)}
                  <Typography variant="subtitle1" fontWeight="bold">
                    {notif.title}
                  </Typography>
                  <Chip
                    label={notif.type.replace(/_/g, ' ')}
                    size="small"
                    color={getChipColor(notif.type)}
                    variant="outlined"
                  />
                </Stack>
                <Typography variant="body2" sx={{ mb: 1, whiteSpace: 'pre-wrap' }}>
                  {notif.description}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(notif.timestamp).toLocaleString()}
                </Typography>
                {notif.taskId && (
                  <Box sx={{ mt: 1 }}>
                    <Button size="small" href={`/employee/tasks?taskId=${notif.taskId}`}>
                      View Task
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default EmployeeNotifications;
