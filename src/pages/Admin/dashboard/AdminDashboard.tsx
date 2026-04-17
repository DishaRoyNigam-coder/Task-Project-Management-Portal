// src/pages/dashboard/AdminDashboard.tsx
import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { useMeetings } from 'context/MeetingContext';
import { useProjects } from 'context/ProjectContext';
import { useTasks } from 'context/TaskContext';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { projects } = useProjects();
  const { tasks } = useTasks();
  const { meetings } = useMeetings();

  // --- KPI calculations ---
  const activeProjects = projects.filter((p) => p.status === 'Active').length;
  const completedProjects = projects.filter((p) => p.status === 'Completed').length;
  const overdueTasks = tasks.filter(
    (t) => new Date(t.dueDate) < new Date() && t.status !== 'Done',
  ).length;
  const completionRate = tasks.length
    ? (tasks.filter((t) => t.status === 'Done').length / tasks.length) * 100
    : 0;

  // --- Task status distribution (for pie chart) ---
  const taskStatusData = useMemo(() => {
    const pending = tasks.filter((t) => t.status === 'Pending').length;
    const inProgress = tasks.filter((t) => t.status === 'In progress').length;
    const done = tasks.filter((t) => t.status === 'Done').length;
    return [
      { name: 'Pending', value: pending },
      { name: 'In Progress', value: inProgress },
      { name: 'Done', value: done },
    ].filter((d) => d.value > 0);
  }, [tasks]);

  // --- Project health (based on overdue tasks + completion) ---
  const projectHealth = useMemo(() => {
    return projects.map((project) => {
      const projectTasks = tasks.filter((t) => t.projectId === project.id);
      const total = projectTasks.length;
      const completed = projectTasks.filter((t) => t.status === 'Done').length;
      const overdue = projectTasks.filter(
        (t) => new Date(t.dueDate) < new Date() && t.status !== 'Done',
      ).length;
      let health = 'Healthy';
      if (overdue > 0) health = 'Attention';
      if (overdue > 2 || (total > 0 && completed / total < 0.3)) health = 'At Risk';
      return {
        name: project.projectName,
        health,
        overdue,
        completion: total ? (completed / total) * 100 : 0,
      };
    });
  }, [projects, tasks]);

  // --- Task priority distribution (bar chart) ---
  const priorityData = useMemo(() => {
    const high = tasks.filter((t) => t.priority === 'High').length;
    const medium = tasks.filter((t) => t.priority === 'Medium').length;
    const low = tasks.filter((t) => t.priority === 'Low').length;
    return [
      { priority: 'High', count: high },
      { priority: 'Medium', count: medium },
      { priority: 'Low', count: low },
    ];
  }, [tasks]);

  // --- Weekly task completion trend (last 7 days) ---
  const weeklyTrend = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().slice(0, 10);
    }).reverse();
    return last7Days.map((date) => {
      const completedOnDate = tasks.filter(
        (t) => t.status === 'Done' && t.updatedAt?.slice(0, 10) === date,
      ).length;
      return { date, completed: completedOnDate };
    });
  }, [tasks]);

  // --- Meetings per project (bar chart) ---
  const meetingsPerProject = useMemo(() => {
    const projectMap = new Map();
    meetings.forEach((m) => {
      if (m.projectId) {
        const project = projects.find((p) => p.id === m.projectId);
        if (project) {
          projectMap.set(project.projectName, (projectMap.get(project.projectName) || 0) + 1);
        }
      }
    });
    return Array.from(projectMap.entries()).map(([name, count]) => ({ name, count }));
  }, [meetings, projects]);

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h4" gutterBottom fontWeight="600">
        Admin Dashboard
      </Typography>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Active Projects
              </Typography>
              <Typography variant="h4">{activeProjects}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Completed Projects
              </Typography>
              <Typography variant="h4">{completedProjects}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Overdue Tasks
              </Typography>
              <Typography variant="h4" color="error.main">
                {overdueTasks}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Task Completion Rate
              </Typography>
              <Typography variant="h4">{Math.round(completionRate)}%</Typography>
              <LinearProgress
                variant="determinate"
                value={completionRate}
                sx={{ mt: 1, height: 8, borderRadius: 4 }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Row 1 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Task Status Distribution (Pie) */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Task Status Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={taskStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {taskStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Task Priority Distribution (Bar) */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Tasks by Priority
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={priorityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="priority" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Charts Row 2 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Weekly Completion Trend */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Daily Completed Tasks (Last 7 Days)
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="completed" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Meetings per Project */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Meetings per Project
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={meetingsPerProject} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="count" fill="#FFBB28" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Project Health Summary Table */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Project Health Summary
        </Typography>
        <Grid container spacing={2}>
          {projectHealth.map((project) => (
            <Grid size={{ xs: 12, md: 4 }} key={project.name}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1">{project.name}</Typography>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                    <Chip
                      label={project.health}
                      color={
                        project.health === 'Healthy'
                          ? 'success'
                          : project.health === 'Attention'
                            ? 'warning'
                            : 'error'
                      }
                      size="small"
                    />
                    <Typography variant="body2">Overdue tasks: {project.overdue}</Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={project.completion}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                  <Typography variant="caption">
                    Completion: {Math.round(project.completion)}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Quick Links to Reports */}
      <Paper sx={{ p: 2, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Detailed Reports
        </Typography>
        <Stack direction="row" spacing={2}>
          <Chip
            label="Project Overview"
            clickable
            onClick={() => navigate('/reports/project-overview')}
            color="primary"
          />
          <Chip
            label="Delayed Tasks"
            clickable
            onClick={() => navigate('/reports/delayed-tasks')}
            color="primary"
          />
          <Chip
            label="Project Health"
            clickable
            onClick={() => navigate('/reports/project-health')}
            color="primary"
          />
          <Chip
            label="Meeting Time"
            clickable
            onClick={() => navigate('/reports/meeting-time')}
            color="primary"
          />
        </Stack>
      </Paper>
    </Box>
  );
};

export default AdminDashboard;
