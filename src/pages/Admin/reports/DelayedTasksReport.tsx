// src/pages/Admin/reports/DelayedTasksReport.tsx
import { useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useProjects } from 'context/ProjectContext';
import { useTasks } from 'context/TaskContext';
import { useUpdates } from 'context/UpdateContext';

interface DelayedTask {
  id: string;
  taskTitle: string;
  projectId: string;
  projectName: string;
  assignedToName: string;
  dueDate: string;
  delayReason: string;
}

const DelayedTasksReport = () => {
  const { tasks } = useTasks();
  const { projects } = useProjects();
  const { updates } = useUpdates();

  const delayedTasks = useMemo<DelayedTask[]>(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Filter tasks that are overdue and not completed
    const overdueTasks = tasks.filter((task) => {
      const dueDate = new Date(task.dueDate);
      return dueDate < today && task.status !== 'Done';
    });

    // For each overdue task, find the most recent 'Delayed' update (if any)
    return overdueTasks.map((task) => {
      const project = projects.find((p) => p.id === task.projectId);
      const taskUpdates = updates
        .filter((up) => up.taskId === task.id && up.type === 'Delayed')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      const latestDelay = taskUpdates[0];
      const delayReason = latestDelay?.description || 'No reason provided';

      return {
        id: task.id,
        taskTitle: task.title,
        projectId: task.projectId,
        projectName: project?.projectName || 'Unknown',
        assignedToName: task.assignedTo.name,
        dueDate: new Date(task.dueDate).toLocaleDateString(),
        delayReason,
      };
    });
  }, [tasks, projects, updates]);

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h4" gutterBottom>
        Delayed Tasks Report
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Tasks that are past their due date and not yet completed.
      </Typography>

      <Card>
        <CardContent>
          {delayedTasks.length === 0 ? (
            <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
              No delayed tasks found. Good job!
            </Typography>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Project</TableCell>
                    <TableCell>Task</TableCell>
                    <TableCell>Employee</TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell>Delay Reason</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {delayedTasks.map((task) => (
                    <TableRow key={task.id} hover>
                      <TableCell>{task.projectName}</TableCell>
                      <TableCell>{task.taskTitle}</TableCell>
                      <TableCell>{task.assignedToName}</TableCell>
                      <TableCell>
                        <Chip label={task.dueDate} size="small" color="error" />
                      </TableCell>
                      <TableCell>{task.delayReason}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default DelayedTasksReport;
