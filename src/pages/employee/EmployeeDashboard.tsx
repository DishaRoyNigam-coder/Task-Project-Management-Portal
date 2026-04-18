import { useMemo } from 'react';
import {
  CheckCircle as CompletedIcon,
  MeetingRoom as MeetingIcon,
  TaskAlt as TaskIcon,
  Update as UpdateIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import {
  Avatar,
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
import { useMeetings } from 'context/MeetingContext';
import { useProjects } from 'context/ProjectContext';
import { useTasks } from 'context/TaskContext';
import { useUpdates } from 'context/UpdateContext';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const COLORS = ['#0088FE', '#FFBB28', '#00C49F', '#FF8042'];

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const { tasks } = useTasks();
  const { updates } = useUpdates();
  const { getMeetingsByEmployee } = useMeetings();
  const { projects } = useProjects();

  // Filter data for current employee
  const myTasks = tasks.filter((t) => t.assignedTo.id === user?.id);
  const myUpdates = updates.filter((u) => u.employeeId === String(user?.id));
  const myMeetings = user ? getMeetingsByEmployee(user.id) : [];

  // Task status counts
  const taskStatusCounts = useMemo(() => {
    const counts = { Pending: 0, 'In progress': 0, Done: 0 };
    myTasks.forEach((task) => {
      if (task.status === 'Pending') counts.Pending++;
      else if (task.status === 'In progress') counts['In progress']++;
      else if (task.status === 'Done') counts.Done++;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [myTasks]);

  // Task priority counts
  const taskPriorityData = useMemo(() => {
    const counts = { High: 0, Medium: 0, Low: 0 };
    myTasks.forEach((task) => {
      counts[task.priority]++;
    });
    return Object.entries(counts).map(([priority, count]) => ({ priority, count }));
  }, [myTasks]);

  // Update activity over last 7 days
  const updateActivity = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().slice(0, 10);
    }).reverse();

    return last7Days.map((date) => ({
      date,
      updates: myUpdates.filter((u) => u.createdAt.startsWith(date)).length,
    }));
  }, [myUpdates]);

  // Meeting hours per project
  const meetingHoursPerProject = useMemo(() => {
    const projMap: Record<string, number> = {};
    myMeetings.forEach((m) => {
      const projId = m.projectId || 'No Project';
      projMap[projId] = (projMap[projId] || 0) + m.duration / 60;
    });
    return Object.entries(projMap).map(([projectId, hours]) => {
      let name = projectId;
      if (projectId !== 'No Project') {
        const proj = projects.find((p) => p.id === projectId);
        name = proj ? proj.projectName : projectId;
      }
      return { project: name, hours: parseFloat(hours.toFixed(1)) };
    });
  }, [myMeetings, projects]);

  // Pending updates (not yet approved/rejected? In your system updates have status 'pending')
  const pendingUpdates = myUpdates.filter((u) => u.status === 'pending').length;
  const rejectedUpdates = myUpdates.filter((u) => u.status === 'rejected').length;
  const completedTasks = myTasks.filter((t) => t.status === 'Done').length;
  const totalTasks = myTasks.length;
  const totalMeetings = myMeetings.length;
  const totalMeetingHours = myMeetings.reduce((sum, m) => sum + m.duration, 0) / 60;

  // Task completion rate
  const completionRate = totalTasks ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <Box sx={{ p: 3, bgcolor: 'background.default', minHeight: '100vh' }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Employee Dashboard
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Welcome back, {user?.name || 'Employee'} 👋
      </Typography>

      {/* Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card elevation={2} sx={{ borderRadius: 3 }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'primary.light', width: 48, height: 48 }}>
                  <TaskIcon />
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Tasks
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {totalTasks}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card elevation={2} sx={{ borderRadius: 3 }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'success.light', width: 48, height: 48 }}>
                  <CompletedIcon />
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Completed Tasks
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {completedTasks}
                  </Typography>
                </Box>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={completionRate}
                sx={{ mt: 1, height: 8, borderRadius: 4 }}
              />
              <Typography variant="caption" color="text.secondary">
                {completionRate.toFixed(0)}% completion
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card elevation={2} sx={{ borderRadius: 3 }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'warning.light', width: 48, height: 48 }}>
                  <UpdateIcon />
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Pending Updates
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {pendingUpdates}
                  </Typography>
                  {rejectedUpdates > 0 && (
                    <Chip
                      size="small"
                      label={`${rejectedUpdates} rejected`}
                      color="error"
                      variant="outlined"
                      sx={{ mt: 0.5 }}
                    />
                  )}
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card elevation={2} sx={{ borderRadius: 3 }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'info.light', width: 48, height: 48 }}>
                  <MeetingIcon />
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Meetings
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {totalMeetings}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {totalMeetingHours.toFixed(1)} hours logged
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Row 1 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Task Status Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={taskStatusCounts}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {taskStatusCounts.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Task Priority Breakdown
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={taskPriorityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="priority" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#8884d8" name="Number of Tasks" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Row 2 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Update Activity (Last 7 Days)
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={updateActivity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="updates"
                    stroke="#8884d8"
                    name="Updates Submitted"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Meeting Hours by Project
              </Typography>
              {meetingHoursPerProject.length === 0 ? (
                <Typography color="text.secondary" sx={{ textAlign: 'center', py: 5 }}>
                  No meeting data yet.
                </Typography>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={meetingHoursPerProject} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" unit="h" />
                    <YAxis type="category" dataKey="project" width={100} />
                    <Tooltip formatter={(value) => `${value} hours`} />
                    <Legend />
                    <Bar dataKey="hours" fill="#82ca9d" name="Hours Spent" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Updates & Overdue Tasks */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Updates
              </Typography>
              {myUpdates.slice(0, 5).map((update) => {
                const task = tasks.find((t) => t.id === update.taskId);
                return (
                  <Box
                    key={update.id}
                    sx={{ mb: 2, p: 1, bgcolor: 'action.hover', borderRadius: 2 }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip
                        label={update.type}
                        size="small"
                        color={
                          update.type === 'Completed'
                            ? 'success'
                            : update.type === 'Delayed'
                              ? 'error'
                              : 'warning'
                        }
                      />
                      <Typography variant="caption" color="text.secondary">
                        {new Date(update.createdAt).toLocaleDateString()}
                      </Typography>
                    </Stack>
                    <Typography variant="body2" noWrap>
                      {task?.title} – {update.description.substring(0, 80)}...
                    </Typography>
                    {update.status === 'rejected' && (
                      <Chip label="Rejected" size="small" color="error" sx={{ mt: 0.5 }} />
                    )}
                  </Box>
                );
              })}
              {myUpdates.length === 0 && (
                <Typography color="text.secondary">No updates submitted yet.</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Overdue / High Priority Tasks
              </Typography>
              {myTasks
                .filter(
                  (task) =>
                    (new Date(task.dueDate) < new Date() && task.status !== 'Done') ||
                    task.priority === 'High',
                )
                .slice(0, 5)
                .map((task) => (
                  <Box key={task.id} sx={{ mb: 2, p: 1, bgcolor: 'action.hover', borderRadius: 2 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip
                        label={task.priority}
                        size="small"
                        color={task.priority === 'High' ? 'error' : 'default'}
                      />
                      <Typography variant="body2" fontWeight="medium">
                        {task.title}
                      </Typography>
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </Typography>
                    {new Date(task.dueDate) < new Date() && task.status !== 'Done' && (
                      <Chip
                        icon={<WarningIcon />}
                        label="Overdue"
                        size="small"
                        color="error"
                        variant="outlined"
                        sx={{ ml: 1 }}
                      />
                    )}
                  </Box>
                ))}
              {myTasks.filter(
                (t) =>
                  (new Date(t.dueDate) < new Date() && t.status !== 'Done') ||
                  t.priority === 'High',
              ).length === 0 && (
                <Typography color="text.secondary">No overdue or high priority tasks.</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EmployeeDashboard;
