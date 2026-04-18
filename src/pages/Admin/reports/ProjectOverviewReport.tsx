// src/pages/Admin/reports/ProjectOverviewReport.tsx
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
import { useMeetings } from 'context/MeetingContext';
import { useProjects } from 'context/ProjectContext';
import { useTasks } from 'context/TaskContext';

interface ProjectOverview {
  id: string;
  projectName: string;
  clientName: string;
  projectPhase: string;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  meetingMinutes: number;
}

const ProjectOverviewReport = () => {
  const { projects } = useProjects();
  const { tasks } = useTasks();
  const { meetings } = useMeetings();

  const projectOverviewData = useMemo<ProjectOverview[]>(() => {
    return projects.map((project) => {
      const projectTasks = tasks.filter((t) => t.projectId === project.id);
      const totalTasks = projectTasks.length;
      const completedTasks = projectTasks.filter((t) => t.status === 'Done').length;
      const pendingTasks = totalTasks - completedTasks;
      const meetingMinutes = meetings
        .filter((m) => m.projectId === project.id)
        .reduce((sum, m) => sum + (m.duration || 0), 0);

      return {
        id: project.id,
        projectName: project.projectName,
        clientName: project.clientName,
        projectPhase: project.projectPhase,
        totalTasks,
        completedTasks,
        pendingTasks,
        meetingMinutes,
      };
    });
  }, [projects, tasks, meetings]);

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h4" gutterBottom>
        Project Overview
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Summary of all projects with task completion and meeting time.
      </Typography>

      <Card>
        <CardContent>
          {projectOverviewData.length === 0 ? (
            <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
              No projects available.
            </Typography>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Project Name</TableCell>
                    <TableCell>Client</TableCell>
                    <TableCell>Phase</TableCell>
                    <TableCell align="center">Total Tasks</TableCell>
                    <TableCell align="center">Completed</TableCell>
                    <TableCell align="center">Pending</TableCell>
                    <TableCell align="right">Meeting Time (min)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {projectOverviewData.map((project) => (
                    <TableRow key={project.id} hover>
                      <TableCell>{project.projectName}</TableCell>
                      <TableCell>{project.clientName}</TableCell>
                      <TableCell>
                        <Chip label={project.projectPhase} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell align="center">{project.totalTasks}</TableCell>
                      <TableCell align="center">{project.completedTasks}</TableCell>
                      <TableCell align="center">{project.pendingTasks}</TableCell>
                      <TableCell align="right">{project.meetingMinutes}</TableCell>
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

export default ProjectOverviewReport;
