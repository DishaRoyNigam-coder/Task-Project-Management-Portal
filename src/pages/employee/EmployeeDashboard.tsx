// src/pages/employee/EmployeeDashboard.tsx — Professional blue-themed
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
  Paper,
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

// ─── Theme ────────────────────────────────────────────────────────────────────
const PRIMARY_BLUE = '#1E58E6';
const PRIMARY_BLUE_LIGHT = '#E6F0FF';
const COLORS = ['#1E58E6', '#FFBB28', '#00C49F', '#FF8042'];

// ─── Sub-components ───────────────────────────────────────────────────────────
const KpiCard = ({
  label,
  value,
  icon,
  avatarBg,
  progress,
  caption,
  badge,
  valueColor,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  avatarBg: string;
  progress?: number;
  caption?: string;
  badge?: React.ReactNode;
  valueColor?: string;
}) => (
  <Card
    elevation={0}
    sx={{
      height: '100%',
      border: '1px solid #d0e0ff',
      borderRadius: '12px',
      transition: 'box-shadow 0.2s',
      '&:hover': { boxShadow: `0 4px 20px ${PRIMARY_BLUE}20` },
    }}
  >
    <CardContent sx={{ p: 2.5 }}>
      <Stack direction="row" alignItems="center" spacing={2}>
        <Avatar sx={{ bgcolor: avatarBg, width: 48, height: 48 }}>{icon}</Avatar>
        <Box>
          <Typography variant="body2" sx={{ color: '#4a6fa5', fontWeight: 500 }}>
            {label}
          </Typography>
          <Typography
            variant="h4"
            sx={{ fontWeight: 700, color: valueColor || '#0f2a6e', lineHeight: 1.2 }}
          >
            {value}
          </Typography>
          {badge}
        </Box>
      </Stack>
      {progress !== undefined && (
        <>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              mt: 1.5,
              height: 8,
              borderRadius: 4,
              backgroundColor: PRIMARY_BLUE_LIGHT,
              '& .MuiLinearProgress-bar': { backgroundColor: PRIMARY_BLUE },
            }}
          />
          {caption && (
            <Typography variant="caption" sx={{ color: '#4a6fa5', mt: 0.5, display: 'block' }}>
              {caption}
            </Typography>
          )}
        </>
      )}
    </CardContent>
  </Card>
);

const ChartCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <Card elevation={0} sx={{ height: '100%', border: '1px solid #d0e0ff', borderRadius: '12px' }}>
    <CardContent sx={{ p: 2.5 }}>
      <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f2a6e', mb: 2 }}>
        {title}
      </Typography>
      {children}
    </CardContent>
  </Card>
);

const getUpdateTypeColor = (type: string): 'success' | 'error' | 'warning' => {
  if (type === 'Completed') return 'success';
  if (type === 'Delayed') return 'error';
  return 'warning';
};

const getPriorityFill = (priority: string) => {
  if (priority === 'High') return '#f44336';
  if (priority === 'Medium') return '#ff9800';
  return PRIMARY_BLUE;
};

// ─── Component ────────────────────────────────────────────────────────────────
const EmployeeDashboard = () => {
  const { user } = useAuth();
  const { tasks } = useTasks();
  const { updates } = useUpdates();
  const { getMeetingsByEmployee } = useMeetings();
  const { projects } = useProjects();

  const myTasks = tasks.filter((t) => t.assignedTo.id === user?.id);
  const myUpdates = updates.filter((u) => !!user && u.employeeId === String(user.id));
  const myMeetings = user ? getMeetingsByEmployee(user.id) : [];

  const taskStatusCounts = useMemo(() => {
    const counts = { Pending: 0, 'In progress': 0, Done: 0 };
    myTasks.forEach((task) => {
      if (Object.prototype.hasOwnProperty.call(counts, task.status)) {
        counts[task.status]++;
      }
    });
    return Object.entries(counts).map(([name, value], index) => ({
      name,
      value,
      fill: COLORS[index % COLORS.length],
    }));
  }, [myTasks]);

  const taskPriorityData = useMemo(() => {
    const counts = { High: 0, Medium: 0, Low: 0 };
    myTasks.forEach((task) => {
      counts[task.priority]++;
    });
    return Object.entries(counts).map(([priority, count]) => ({
      priority,
      count,
      fill: getPriorityFill(priority),
    }));
  }, [myTasks]);

  const updateActivity = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().slice(0, 10);
    }).reverse();
    return last7Days.map((date) => ({
      date: date.slice(5),
      updates: myUpdates.filter((u) => u.createdAt.startsWith(date)).length,
    }));
  }, [myUpdates]);

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
      return { project: name, hours: Number.parseFloat(hours.toFixed(1)) };
    });
  }, [myMeetings, projects]);

  const pendingUpdates = myUpdates.filter((u) => u.status === 'pending').length;
  const rejectedUpdates = myUpdates.filter((u) => u.status === 'rejected').length;
  const completedTasks = myTasks.filter((t) => t.status === 'Done').length;
  const totalTasks = myTasks.length;
  const totalMeetings = myMeetings.length;
  const totalMeetingHours = myMeetings.reduce((sum, m) => sum + m.duration, 0) / 60;
  const completionRate = totalTasks ? (completedTasks / totalTasks) * 100 : 0;

  const overduePriorityTasks = myTasks.filter(
    (task) =>
      (new Date(task.dueDate) < new Date() && task.status !== 'Done') || task.priority === 'High',
  );

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#0f2a6e' }}>
          Employee Dashboard
        </Typography>
        <Typography variant="body2" sx={{ color: '#4a6fa5', mt: 0.5 }}>
          Welcome back, {user?.name || 'Employee'} 👋 — here's your activity overview.
        </Typography>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            label="Total Tasks"
            value={totalTasks}
            icon={<TaskIcon />}
            avatarBg={`${PRIMARY_BLUE}22`}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            label="Completed Tasks"
            value={completedTasks}
            icon={<CompletedIcon />}
            avatarBg="#00C49F22"
            progress={completionRate}
            caption={`${completionRate.toFixed(0)}% completion rate`}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            label="Pending Updates"
            value={pendingUpdates}
            icon={<UpdateIcon />}
            avatarBg="#FFBB2822"
            badge={
              rejectedUpdates > 0 ? (
                <Chip
                  size="small"
                  label={`${rejectedUpdates} rejected`}
                  color="error"
                  variant="outlined"
                  sx={{ mt: 0.5, fontWeight: 600 }}
                />
              ) : undefined
            }
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            label="Meetings"
            value={totalMeetings}
            icon={<MeetingIcon />}
            avatarBg="#00C49F15"
            caption={`${totalMeetingHours.toFixed(1)} hours logged`}
          />
        </Grid>
      </Grid>

      {/* Charts Row 1 */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <ChartCard title="Task Status Distribution">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={taskStatusCounts}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={100}
                  dataKey="value"
                ></Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #d0e0ff' }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <ChartCard title="Task Priority Breakdown">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={taskPriorityData} barSize={52}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8efff" />
                <XAxis dataKey="priority" tick={{ fill: '#4a6fa5', fontSize: 13 }} />
                <YAxis allowDecimals={false} tick={{ fill: '#4a6fa5', fontSize: 13 }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #d0e0ff' }} />
                <Legend />
                <Bar dataKey="count" name="Tasks" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>
      </Grid>

      {/* Charts Row 2 */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <ChartCard title="Update Activity (Last 7 Days)">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={updateActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8efff" />
                <XAxis dataKey="date" tick={{ fill: '#4a6fa5', fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fill: '#4a6fa5', fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #d0e0ff' }} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="updates"
                  stroke={PRIMARY_BLUE}
                  strokeWidth={2.5}
                  dot={{ fill: PRIMARY_BLUE, r: 4 }}
                  name="Updates Submitted"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <ChartCard title="Meeting Hours by Project">
            {meetingHoursPerProject.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <Typography color="text.secondary">No meeting data yet.</Typography>
              </Box>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={meetingHoursPerProject} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e8efff" />
                  <XAxis type="number" unit="h" tick={{ fill: '#4a6fa5', fontSize: 12 }} />
                  <YAxis
                    type="category"
                    dataKey="project"
                    width={100}
                    tick={{ fill: '#4a6fa5', fontSize: 11 }}
                  />
                  <Tooltip
                    formatter={(value) => `${value} hours`}
                    contentStyle={{ borderRadius: 8, border: '1px solid #d0e0ff' }}
                  />
                  <Legend />
                  <Bar dataKey="hours" fill="#00C49F" name="Hours Spent" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </Grid>
      </Grid>

      {/* Bottom Row: Recent Updates & Overdue/High Priority */}
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            elevation={0}
            sx={{ height: '100%', border: '1px solid #d0e0ff', borderRadius: '12px' }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f2a6e', mb: 2 }}>
                Recent Updates
              </Typography>
              {myUpdates.length === 0 ? (
                <Typography color="text.secondary">No updates submitted yet.</Typography>
              ) : (
                myUpdates.slice(0, 5).map((update) => {
                  const task = tasks.find((t) => t.id === update.taskId);
                  return (
                    <Box key={update.id}>
                      <Box
                        sx={{
                          p: 1.5,
                          bgcolor: PRIMARY_BLUE_LIGHT,
                          borderRadius: 2,
                          border: '1px solid #d0e0ff',
                          mb: 1.5,
                        }}
                      >
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                          <Chip
                            label={update.type}
                            size="small"
                            color={getUpdateTypeColor(update.type)}
                            sx={{ fontWeight: 600 }}
                          />
                          <Typography variant="caption" sx={{ color: '#4a6fa5' }}>
                            {new Date(update.createdAt).toLocaleDateString()}
                          </Typography>
                          {update.status === 'rejected' && (
                            <Chip
                              label="Rejected"
                              size="small"
                              color="error"
                              sx={{ fontWeight: 600 }}
                            />
                          )}
                        </Stack>
                        <Typography variant="body2" sx={{ color: '#2d3a5e' }} noWrap>
                          {task?.title} — {update.description.substring(0, 80)}...
                        </Typography>
                      </Box>
                    </Box>
                  );
                })
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            elevation={0}
            sx={{ height: '100%', border: '1px solid #d0e0ff', borderRadius: '12px' }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f2a6e', mb: 2 }}>
                Overdue / High Priority Tasks
              </Typography>
              {overduePriorityTasks.length === 0 ? (
                <Paper
                  elevation={0}
                  sx={{ p: 2, textAlign: 'center', bgcolor: '#f0fff4', borderRadius: 2 }}
                >
                  <Typography color="success.main" fontWeight={600}>
                    🎉 No overdue or high priority tasks!
                  </Typography>
                </Paper>
              ) : (
                overduePriorityTasks.slice(0, 5).map((task) => {
                  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'Done';
                  return (
                    <Box
                      key={task.id}
                      sx={{
                        p: 1.5,
                        bgcolor: isOverdue ? '#fff5f5' : PRIMARY_BLUE_LIGHT,
                        border: `1px solid ${isOverdue ? '#ffcdd2' : '#d0e0ff'}`,
                        borderRadius: 2,
                        mb: 1.5,
                      }}
                    >
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                        <Chip
                          label={task.priority}
                          size="small"
                          color={task.priority === 'High' ? 'error' : 'default'}
                          sx={{ fontWeight: 600 }}
                        />
                        {isOverdue && (
                          <Chip
                            icon={<WarningIcon />}
                            label="Overdue"
                            size="small"
                            color="error"
                            variant="outlined"
                            sx={{ fontWeight: 600 }}
                          />
                        )}
                      </Stack>
                      <Typography variant="body2" sx={{ color: '#2d3a5e', fontWeight: 500 }}>
                        {task.title}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#4a6fa5' }}>
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </Typography>
                    </Box>
                  );
                })
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EmployeeDashboard;
