import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material';
import { useAuth } from 'context/AuthContext';
import { useProjects } from 'context/ProjectContext';
import { useTasks } from 'context/TaskContext';

const EmployeeTaskList = () => {
  const { user } = useAuth();
  const { tasks } = useTasks();
  const { projects } = useProjects();

  // Filter tasks assigned to the current employee
  const myTasks = tasks.filter((task) => task.assignedTo.id === user?.id);

  // Helper to get project name
  const getProjectName = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId);
    return project?.projectName || 'Unknown Project';
  };

  // Helper for status chip color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Done':
        return 'success';
      case 'In progress':
        return 'primary';
      case 'Pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  // Helper for priority chip color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'error';
      case 'Medium':
        return 'warning';
      case 'Low':
        return 'info';
      default:
        return 'default';
    }
  };

  // Calculate completion percentage for the employee
  const completedTasks = myTasks.filter((t) => t.status === 'Done').length;
  const completionRate = myTasks.length ? (completedTasks / myTasks.length) * 100 : 0;

  if (myTasks.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          No Tasks Assigned
        </Typography>
        <Typography variant="body2" color="text.secondary">
          You currently have no tasks. Check back later or contact your admin.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header with progress summary */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3 }}
      >
        <Typography variant="h4" gutterBottom>
          My Tasks
        </Typography>
        <Box sx={{ minWidth: 200 }}>
          <Typography variant="body2" color="text.secondary">
            Overall Completion
          </Typography>
          <Stack direction="row" alignItems="center" spacing={1}>
            <LinearProgress
              variant="determinate"
              value={completionRate}
              sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
            />
            <Typography variant="body2">{Math.round(completionRate)}%</Typography>
          </Stack>
        </Box>
      </Stack>

      {/* Task Grid */}
      <Grid container spacing={3}>
        {myTasks.map((task) => (
          <Grid size={{ xs: 12, md: 6, lg: 4 }} key={task.id}>
            <Card
              elevation={2}
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                {/* Task Title */}
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  {task.title}
                </Typography>

                {/* Project Name */}
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Project: {getProjectName(task.projectId)}
                </Typography>

                {/* Status & Priority Chips */}
                <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                  <Chip
                    label={task.status || 'Pending'}
                    size="small"
                    color={getStatusColor(task.status || 'Pending')}
                  />
                  <Chip
                    label={task.priority}
                    size="small"
                    color={getPriorityColor(task.priority)}
                  />
                </Stack>

                {/* Due Date */}
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Due:</strong> {new Date(task.dueDate).toLocaleDateString()}
                </Typography>

                {/* Assigned To (redundant but shows info) */}
                <Typography variant="body2" color="text.secondary">
                  Assigned to: {task.assignedTo.name}
                </Typography>

                {/* Optional: Show a progress indicator per task (if status is not Done) */}
                {task.status !== 'Done' && (
                  <LinearProgress
                    variant="determinate"
                    value={task.status === 'In progress' ? 50 : 10}
                    sx={{ mt: 2, height: 4, borderRadius: 2 }}
                  />
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default EmployeeTaskList;
