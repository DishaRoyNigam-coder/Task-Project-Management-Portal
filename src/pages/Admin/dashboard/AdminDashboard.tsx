// src/pages/dashboard/AdminDashboard.tsx — Professional blue-themed dashboard
import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import {
  CheckCircle as CompletedIcon,
  MeetingRoom as MeetingIcon,
  Warning as OverdueIcon,
  FolderOpen as ProjectIcon,
  Assignment as TaskIcon,
  TrendingUp as TrendIcon,
} from '@mui/icons-material';
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
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

const PIE_COLORS = ['#1E58E6', '#00C49F', '#FFBB28', '#FF8042'];
const BAR_COLORS = { High: '#f44336', Medium: '#ff9800', Low: '#2196f3' };

// ─── KPI Card ─────────────────────────────────────────────────────────────────
interface KpiCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  avatarBg: string;
  progress?: number;
  caption?: string;
  valueColor?: string;
}
const KpiCard = ({ label, value, icon, avatarBg, progress, caption, valueColor }: KpiCardProps) => (
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
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1.5 }}>
        <Avatar sx={{ bgcolor: avatarBg, width: 48, height: 48, color: PRIMARY_BLUE }}>
          {icon}
        </Avatar>
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
        </Box>
      </Stack>
      {progress !== undefined && (
        <>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
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

// ─── Chart Card ───────────────────────────────────────────────────────────────
const ChartCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <Card
    elevation={0}
    sx={{
      height: '100%',
      border: '1px solid #d0e0ff',
      borderRadius: '12px',
    }}
  >
    <CardContent sx={{ p: 2.5 }}>
      <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f2a6e', mb: 2 }}>
        {title}
      </Typography>
      {children}
    </CardContent>
  </Card>
);

// ─── Helpers ─────────────────────────────────────────────────────────────────
const getHealthColor = (health: string): 'success' | 'warning' | 'error' => {
  if (health === 'Healthy') return 'success';
  if (health === 'Attention') return 'warning';
  return 'error';
};

// ─── Component ────────────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const navigate = useNavigate();
  const { projects } = useProjects();
  const { tasks } = useTasks();
  const { meetings } = useMeetings();

  // KPI calculations
  const activeProjects = projects.filter((p) => p.status === 'Active').length;
  const completedProjects = projects.filter((p) => p.status === 'Completed').length;
  const overdueTasks = tasks.filter(
    (t) => new Date(t.dueDate) < new Date() && t.status !== 'Done',
  ).length;
  const completionRate = tasks.length
    ? (tasks.filter((t) => t.status === 'Done').length / tasks.length) * 100
    : 0;
  const totalMeetings = meetings.length;

  // Task status pie
  const taskStatusData = useMemo(() => {
    const pending = tasks.filter((t) => t.status === 'Pending').length;
    const inProgress = tasks.filter((t) => t.status === 'In progress').length;
    const done = tasks.filter((t) => t.status === 'Done').length;
    return [
      { name: 'Pending', value: pending, fill: PIE_COLORS[0] },
      { name: 'In Progress', value: inProgress, fill: PIE_COLORS[1] },
      { name: 'Done', value: done, fill: PIE_COLORS[2] },
    ].filter((d) => d.value > 0);
  }, [tasks]);

  // Priority bar
  const priorityData = useMemo(() => {
    const high = tasks.filter((t) => t.priority === 'High').length;
    const medium = tasks.filter((t) => t.priority === 'Medium').length;
    const low = tasks.filter((t) => t.priority === 'Low').length;
    return [
      { priority: 'High', count: high, fill: BAR_COLORS.High },
      { priority: 'Medium', count: medium, fill: BAR_COLORS.Medium },
      { priority: 'Low', count: low, fill: BAR_COLORS.Low },
    ];
  }, [tasks]);

  // Weekly trend
  const weeklyTrend = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().slice(0, 10);
    }).reverse();
    return last7Days.map((date) => ({
      date: date.slice(5),
      completed: tasks.filter((t) => t.status === 'Done' && t.updatedAt?.slice(0, 10) === date)
        .length,
    }));
  }, [tasks]);

  // Meetings per project
  const meetingsPerProject = useMemo(() => {
    const projectMap = new Map<string, number>();
    meetings.forEach((m) => {
      if (m.projectId) {
        const project = projects.find((p) => p.id === m.projectId);
        if (project)
          projectMap.set(project.projectName, (projectMap.get(project.projectName) || 0) + 1);
      }
    });
    return Array.from(projectMap.entries()).map(([name, count]) => ({ name, count }));
  }, [meetings, projects]);

  // Project health
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
  const reportLinks = [
    { label: 'Project Overview', path: '/reports/project-overview' },
    { label: 'Delayed Tasks', path: '/reports/delayed-tasks' },
    { label: 'Project Health', path: '/reports/project-health' },
    { label: 'Meeting Time', path: '/reports/meeting-time' },
  ];

  // Solid pastel background colors for icons (fully opaque)
  const iconBgColors = {
    blue: '#E6F0FF', // light blue for active projects, total tasks, etc.
    green: '#E8F5E9', // light green for completed projects
    red: '#FFEBEE', // light red for overdue tasks
    yellow: '#FFF8E1', // light yellow for completion rate
    teal: '#E0F2F1', // for meetings
    orange: '#FFF3E0', // for in progress
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Page Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Admin Dashboard
        </Typography>
        <Typography variant="body2" sx={{ color: '#4a6fa5', mt: 0.5 }}>
          Overview of all projects, tasks, and team activity.
        </Typography>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            label="Active Projects"
            value={activeProjects}
            icon={<ProjectIcon />}
            avatarBg={iconBgColors.blue}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            label="Completed Projects"
            value={completedProjects}
            icon={<CompletedIcon />}
            avatarBg={iconBgColors.green}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            label="Overdue Tasks"
            value={overdueTasks}
            icon={<OverdueIcon />}
            avatarBg={iconBgColors.red}
            valueColor={overdueTasks > 0 ? '#f44336' : '#0f2a6e'}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            label="Task Completion"
            value={`${Math.round(completionRate)}%`}
            icon={<TrendIcon />}
            avatarBg={iconBgColors.yellow}
            progress={completionRate}
            caption={`${tasks.filter((t) => t.status === 'Done').length} of ${tasks.length} tasks done`}
          />
        </Grid>
      </Grid>

      {/* Row 2: Secondary KPIs */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            label="Total Tasks"
            value={tasks.length}
            icon={<TaskIcon />}
            avatarBg={iconBgColors.blue}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            label="Total Meetings"
            value={totalMeetings}
            icon={<MeetingIcon />}
            avatarBg={iconBgColors.teal}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            label="Total Projects"
            value={projects.length}
            icon={<ProjectIcon />}
            avatarBg={iconBgColors.yellow}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            label="In Progress Tasks"
            value={tasks.filter((t) => t.status === 'In progress').length}
            icon={<TrendIcon />}
            avatarBg={iconBgColors.orange}
          />
        </Grid>
      </Grid>

      {/* Charts Row 1 */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <ChartCard title="Task Status Distribution">
            <ResponsiveContainer width="100%" height={320}>
              <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <Pie
                  data={taskStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                  outerRadius={75}
                  dataKey="value"
                  style={{ fontSize: '12px', fill: '#0f2a6e' }}
                />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #d0e0ff' }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <ChartCard title="Tasks by Priority">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={priorityData} barSize={48}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8efff" />
                <XAxis dataKey="priority" tick={{ fill: '#4a6fa5', fontSize: 13 }} />
                <YAxis tick={{ fill: '#4a6fa5', fontSize: 13 }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #d0e0ff' }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>
      </Grid>

      {/* Charts Row 2 */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <ChartCard title="Daily Completed Tasks (Last 7 Days)">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={weeklyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8efff" />
                <XAxis dataKey="date" tick={{ fill: '#4a6fa5', fontSize: 12 }} />
                <YAxis tick={{ fill: '#4a6fa5', fontSize: 12 }} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #d0e0ff' }} />
                <Line
                  type="monotone"
                  dataKey="completed"
                  stroke={PRIMARY_BLUE}
                  strokeWidth={2.5}
                  dot={{ fill: PRIMARY_BLUE, r: 4 }}
                  name="Completed"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <ChartCard title="Meetings per Project">
            {meetingsPerProject.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <Typography color="text.secondary">No meeting data yet.</Typography>
              </Box>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={meetingsPerProject} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e8efff" />
                  <XAxis type="number" tick={{ fill: '#4a6fa5', fontSize: 12 }} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={110}
                    tick={{ fill: '#4a6fa5', fontSize: 11 }}
                  />
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #d0e0ff' }} />
                  <Bar dataKey="count" fill="#FFBB28" radius={[0, 6, 6, 0]} name="Meetings" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </Grid>
      </Grid>

      {/* Project Health Summary */}
      <Card elevation={0} sx={{ border: '1px solid #d0e0ff', borderRadius: '12px', mb: 3 }}>
        <CardContent sx={{ p: 2.5 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2.5 }}>
            Project Health Summary
          </Typography>
          {projectHealth.length === 0 ? (
            <Typography color="text.secondary">No projects found.</Typography>
          ) : (
            <Grid container spacing={2}>
              {projectHealth.map((project) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={project.name}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      border: '1px solid #d0e0ff',
                      borderRadius: '10px',
                      bgcolor: PRIMARY_BLUE_LIGHT,
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 700, color: '#0f2a6e', mb: 1 }}
                    >
                      {project.name}
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                      <Chip
                        label={project.health}
                        color={getHealthColor(project.health)}
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                      <Typography variant="body2" sx={{ color: '#4a6fa5' }}>
                        {project.overdue} overdue
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={project.completion}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: '#c5d8ff',
                        '& .MuiLinearProgress-bar': { backgroundColor: PRIMARY_BLUE },
                      }}
                    />
                    <Typography
                      variant="caption"
                      sx={{ color: '#4a6fa5', mt: 0.5, display: 'block' }}
                    >
                      {Math.round(project.completion)}% complete
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* Quick Links */}
      <Card elevation={0} sx={{ border: '1px solid #d0e0ff', borderRadius: '12px' }}>
        <CardContent sx={{ p: 2.5 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f2a6e', mb: 1.5 }}>
            Quick Report Links
          </Typography>
          <Divider sx={{ mb: 2, borderColor: '#d0e0ff' }} />
          <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
            {reportLinks.map(({ label, path }) => (
              <Chip
                key={label}
                label={label}
                clickable
                onClick={() => navigate(path)}
                sx={{
                  backgroundColor: PRIMARY_BLUE_LIGHT,
                  color: PRIMARY_BLUE,
                  fontWeight: 600,
                  border: `1px solid ${PRIMARY_BLUE}55`,
                  '&:hover': { backgroundColor: '#c5d8ff' },
                }}
              />
            ))}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AdminDashboard;
