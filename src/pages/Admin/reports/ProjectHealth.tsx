// src/pages/Admin/reports/ProjectHealth.tsx
import { useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  LinearProgress,
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

interface ProjectHealthData {
  id: string;
  name: string;
  status: string;
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  completionPercent: number;
  health: 'Healthy' | 'Attention Needed' | 'At Risk';
}

const ProjectHealth = () => {
  const { projects } = useProjects();
  const { tasks } = useTasks();

  const projectHealthData = useMemo<ProjectHealthData[]>(() => {
    return projects.map((project) => {
      const projectTasks = tasks.filter((t) => t.projectId === project.id);
      const totalTasks = projectTasks.length;
      const completedTasks = projectTasks.filter((t) => t.status === 'Done').length;
      const overdueTasks = projectTasks.filter(
        (t) => new Date(t.dueDate) < new Date() && t.status !== 'Done',
      ).length;
      const completionPercent = totalTasks ? (completedTasks / totalTasks) * 100 : 0;

      let health: ProjectHealthData['health'] = 'Healthy';
      if (overdueTasks > 0) health = 'Attention Needed';
      if (overdueTasks > 2 || (totalTasks > 0 && completionPercent < 30)) health = 'At Risk';

      return {
        id: project.id,
        name: project.projectName,
        status: project.status,
        totalTasks,
        completedTasks,
        overdueTasks,
        completionPercent,
        health,
      };
    });
  }, [projects, tasks]);

  const getHealthColor = (health: ProjectHealthData['health']) => {
    switch (health) {
      case 'Healthy':
        return 'success';
      case 'Attention Needed':
        return 'warning';
      case 'At Risk':
        return 'error';
      default:
        return 'default';
    }
  };

  const summary = {
    healthy: projectHealthData.filter((p) => p.health === 'Healthy').length,
    attention: projectHealthData.filter((p) => p.health === 'Attention Needed').length,
    atRisk: projectHealthData.filter((p) => p.health === 'At Risk').length,
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h4" gutterBottom>
        Project Health Report
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Automatic health classification based on overdue tasks and completion rate.
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ bgcolor: 'success.light', color: 'success.contrastText' }}>
            <CardContent>
              <Typography variant="h6">Healthy</Typography>
              <Typography variant="h3">{summary.healthy}</Typography>
              <Typography variant="body2">No delays</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ bgcolor: 'warning.light', color: 'warning.contrastText' }}>
            <CardContent>
              <Typography variant="h6">Attention Needed</Typography>
              <Typography variant="h3">{summary.attention}</Typography>
              <Typography variant="body2">Few delays</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ bgcolor: 'error.light', color: 'error.contrastText' }}>
            <CardContent>
              <Typography variant="h6">At Risk</Typography>
              <Typography variant="h3">{summary.atRisk}</Typography>
              <Typography variant="body2">Many delays or low completion</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Detailed Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Project Details
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Project Name</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Total Tasks</TableCell>
                  <TableCell align="center">Completed</TableCell>
                  <TableCell align="center">Overdue</TableCell>
                  <TableCell align="center">Completion %</TableCell>
                  <TableCell align="center">Health</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {projectHealthData.map((project) => (
                  <TableRow key={project.id} hover>
                    <TableCell>{project.name}</TableCell>
                    <TableCell>
                      <Chip
                        label={project.status}
                        size="small"
                        color={project.status === 'Active' ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell align="center">{project.totalTasks}</TableCell>
                    <TableCell align="center">{project.completedTasks}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={project.overdueTasks}
                        size="small"
                        color={project.overdueTasks > 0 ? 'error' : 'default'}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={project.completionPercent}
                          sx={{ width: 60, height: 8, borderRadius: 4 }}
                        />
                        <Typography variant="caption">
                          {Math.round(project.completionPercent)}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={project.health}
                        size="small"
                        color={getHealthColor(project.health)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
                {projectHealthData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No projects found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ProjectHealth;
