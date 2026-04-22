// src/pages/dashboard/AdminDashboard.tsx — Professional blue-themed dashboard
import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { useMeetings } from 'context/MeetingContext';
import { useProjects } from 'context/ProjectContext';
import { useTasks } from 'context/TaskContext';
import IconifyIcon from 'components/base/IconifyIcon';

// ─── Theme ────────────────────────────────────────────────────────────────────
const PRIMARY_BLUE = '#1E58E6';
const PRIMARY_BLUE_LIGHT = '#E6F0FF';

// ─── KPI Card (using IconifyIcon) ─────────────────────────────────────────────
interface KpiCardProps {
  label: string;
  value: string | number;
  iconName: string;
  avatarBg: string;
  progress?: number;
  caption?: string;
  valueColor?: string;
}
const KpiCard = ({
  label,
  value,
  iconName,
  avatarBg,
  progress,
  caption,
  valueColor,
}: KpiCardProps) => (
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
          <IconifyIcon icon={iconName} />
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

// ─── Section Card ─────────────────────────────────────────────────────────────
const SectionCard = ({
  title,
  children,
  iconName,
}: {
  title: string;
  children: React.ReactNode;
  iconName?: string;
}) => (
  <Card
    elevation={0}
    sx={{
      height: '100%',
      border: '1px solid #d0e0ff',
      borderRadius: '12px',
      display: 'flex',
      flexDirection: 'column',
    }}
  >
    <CardContent sx={{ p: 2.5, flexGrow: 1 }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        {iconName && <IconifyIcon icon={iconName} sx={{ fontSize: 24, color: PRIMARY_BLUE }} />}
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f2a6e' }}>
          {title}
        </Typography>
      </Stack>
      {children}
    </CardContent>
  </Card>
);

// ─── Helpers ─────────────────────────────────────────────────────────────────
const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatTime = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

const getProjectPhase = (phase: string) => {
  const phases = ['Planning', 'Design', 'Development', 'Testing', 'Deployment', 'Debugging'];
  return phases.includes(phase) ? phase : 'Planning';
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

  // ── Completed Tasks (status always "Submitted") ──
  const completedTasksData = useMemo(() => {
    const realCompleted = tasks
      .filter((t) => t.status === 'Done')
      .sort((a, b) => (a.updatedAt > b.updatedAt ? -1 : 1))
      .map((task) => {
        const project = projects.find((p) => p.id === task.projectId);
        return {
          taskName: task.title,
          projectName: project?.projectName || 'Unknown Project',
          developerName: task.assignedTo?.name || 'Unassigned',
          date: formatDate(task.updatedAt || task.dueDate),
          time: formatTime(task.updatedAt || task.dueDate),
          id: task.id,
        };
      });
    if (realCompleted.length > 0) return realCompleted;
    // Demo data
    return [
      {
        taskName: 'Mobile Banking App - Login UI',
        projectName: 'Mobile Banking App',
        developerName: 'Ekawati',
        date: '03 Dec 2023',
        time: '08:10 AM',
        id: 'demo1',
      },
      {
        taskName: 'API Integration for Payment Gateway',
        projectName: 'E-commerce Platform',
        developerName: 'John Doe',
        date: '05 Dec 2023',
        time: '02:30 PM',
        id: 'demo2',
      },
    ];
  }, [tasks, projects]);

  // ── Delayed Tasks (with Edit button) ──
  const delayedTasksData = useMemo(() => {
    const realDelayed = tasks
      .filter((t) => new Date(t.dueDate) < new Date() && t.status !== 'Done')
      .sort((a, b) => (a.dueDate < b.dueDate ? -1 : 1))
      .map((task) => {
        const project = projects.find((p) => p.id === task.projectId);
        return {
          taskName: task.title,
          projectName: project?.projectName || 'Unknown Project',
          developerName: task.assignedTo?.name || 'Unassigned',
          taskId: task.id,
        };
      });
    if (realDelayed.length > 0) return realDelayed;
    // Demo data
    return [
      {
        taskName: 'Design login UI',
        projectName: 'Mobile Banking App',
        developerName: 'John Doe',
        taskId: 'demo_delay1',
      },
      {
        taskName: 'Implement API integration',
        projectName: 'E-commerce Platform',
        developerName: 'Jane Smith',
        taskId: 'demo_delay2',
      },
    ];
  }, [tasks, projects]);

  // ── Completed Meetings (only completed meetings) ──
  // Using type assertion because Meeting type may not have 'status' or 'completed'
  const completedMeetingsData = useMemo(() => {
    const realCompletedMeetings = meetings
      .filter((m) => {
        const meetingAny = m as any;
        return meetingAny.status === 'Completed' || meetingAny.completed === true;
      })
      .map((m) => {
        const meetingAny = m as any;
        const project = projects.find((p) => p.id === m.projectId);
        const meetingDate =
          meetingAny.date ||
          meetingAny.meetingDate ||
          meetingAny.createdAt ||
          new Date().toISOString();
        return {
          developerName: meetingAny.createdBy || meetingAny.organizer || 'Admin',
          projectName: project?.projectName || 'Unknown Project',
          clientName: project?.clientName || 'Unknown Client',
          meetingTime: formatDate(meetingDate) + ' at ' + formatTime(meetingDate),
          meetingId: m.id,
          link: `/meetings/${m.id}`,
        };
      });
    if (realCompletedMeetings.length > 0) return realCompletedMeetings;
    // Demo data
    return [
      {
        developerName: 'Ekawati',
        projectName: 'Mobile Banking App',
        clientName: 'FinBank Corp',
        meetingTime: '03 Dec 2023 at 10:00 AM',
        meetingId: 'demo_meet1',
        link: '/meetings/demo_meet1',
      },
      {
        developerName: 'John Doe',
        projectName: 'E-commerce Platform',
        clientName: 'Retail Solutions',
        meetingTime: '05 Dec 2023 at 02:30 PM',
        meetingId: 'demo_meet2',
        link: '/meetings/demo_meet2',
      },
    ];
  }, [meetings, projects]);

  // ── Active Projects (with status: delayed/on time, phase, task completion) ──
  const activeProjectsData = useMemo(() => {
    const realActive = projects
      .filter((p) => p.status === 'Active')
      .map((project) => {
        const projectTasks = tasks.filter((t) => t.projectId === project.id);
        const totalTasks = projectTasks.length;
        const completedTasksCount = projectTasks.filter((t) => t.status === 'Done').length;
        const overdueTasksCount = projectTasks.filter(
          (t) => new Date(t.dueDate) < new Date() && t.status !== 'Done',
        ).length;
        const status = overdueTasksCount > 0 ? 'Delayed' : 'On Time';
        const phase = getProjectPhase(project.projectPhase);
        return {
          projectName: project.projectName,
          status,
          phase,
          completedTasks: `${completedTasksCount}/${totalTasks}`,
          projectId: project.id,
        };
      });
    if (realActive.length > 0) return realActive;
    // Demo data
    return [
      {
        projectName: 'Mobile Banking App',
        status: 'Delayed',
        phase: 'Development',
        completedTasks: '2/5',
        projectId: 'demo_proj1',
      },
      {
        projectName: 'E-commerce Platform',
        status: 'On Time',
        phase: 'Testing',
        completedTasks: '4/6',
        projectId: 'demo_proj2',
      },
    ];
  }, [projects, tasks]);

  const reportLinks = [
    { label: 'Project Overview', path: '/reports/project-overview' },
    { label: 'Delayed Tasks', path: '/reports/delayed-tasks' },
    { label: 'Project Health', path: '/reports/project-health' },
    { label: 'Meeting Time', path: '/reports/meeting-time' },
  ];

  const iconBgColors = {
    blue: '#E6F0FF',
    green: '#E8F5E9',
    red: '#FFEBEE',
    yellow: '#FFF8E1',
    teal: '#E0F2F1',
    orange: '#FFF3E0',
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Page Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#0f2a6e' }}>
          Admin Dashboard
        </Typography>
        <Typography variant="body2" sx={{ color: '#4a6fa5', mt: 0.5 }}>
          Overview of all projects, tasks, and team activity.
        </Typography>
      </Box>

      {/* KPI Cards (first row) */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            label="Active Projects"
            value={activeProjects}
            iconName="material-symbols:folder-open"
            avatarBg={iconBgColors.blue}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            label="Completed Projects"
            value={completedProjects}
            iconName="material-symbols:check-circle"
            avatarBg={iconBgColors.green}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            label="Overdue Tasks"
            value={overdueTasks}
            iconName="material-symbols:warning"
            avatarBg={iconBgColors.red}
            valueColor={overdueTasks > 0 ? '#f44336' : '#0f2a6e'}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            label="Task Completion"
            value={`${Math.round(completionRate)}%`}
            iconName="material-symbols:trending-up"
            avatarBg={iconBgColors.yellow}
            progress={completionRate}
            caption={`${tasks.filter((t) => t.status === 'Done').length} of ${tasks.length} tasks done`}
          />
        </Grid>
      </Grid>

      {/* Secondary KPIs (second row) */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            label="Total Tasks"
            value={tasks.length}
            iconName="material-symbols:assignment"
            avatarBg={iconBgColors.blue}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            label="Total Meetings"
            value={totalMeetings}
            iconName="material-symbols:meeting-room"
            avatarBg={iconBgColors.teal}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            label="Total Projects"
            value={projects.length}
            iconName="material-symbols:folder"
            avatarBg={iconBgColors.yellow}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            label="In Progress Tasks"
            value={tasks.filter((t) => t.status === 'In progress').length}
            iconName="material-symbols:play-circle"
            avatarBg={iconBgColors.orange}
          />
        </Grid>
      </Grid>

      {/* Completed Tasks & Delayed Tasks */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <SectionCard title="Completed Tasks" iconName="material-symbols:check-circle-outline">
            <Box sx={{ maxHeight: 360, overflowY: 'auto', pr: 1 }}>
              {completedTasksData.map((task) => (
                <Paper
                  key={task.id}
                  elevation={0}
                  sx={{
                    p: 1.5,
                    mb: 1.5,
                    border: '1px solid #d0e0ff',
                    borderRadius: '10px',
                    backgroundColor: '#f8fbff',
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f2a6e' }}>
                    {task.taskName}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#4a6fa5', display: 'block' }}>
                    Project: {task.projectName}
                  </Typography>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ mt: 0.5 }}
                  >
                    <Typography variant="caption" sx={{ color: '#4a6fa5' }}>
                      Developer: {task.developerName}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#4a6fa5' }}>
                      {task.date} at {task.time}
                    </Typography>
                  </Stack>
                  <Chip
                    label="Submitted"
                    size="small"
                    color="success"
                    icon={
                      <IconifyIcon icon="material-symbols:check-circle" sx={{ fontSize: 14 }} />
                    }
                    sx={{ mt: 1, height: 22, fontSize: '11px', fontWeight: 600 }}
                  />
                </Paper>
              ))}
            </Box>
          </SectionCard>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <SectionCard title="Delayed Tasks" iconName="material-symbols:error-outline">
            <Box sx={{ maxHeight: 360, overflowY: 'auto', pr: 1 }}>
              {delayedTasksData.map((task) => (
                <Paper
                  key={task.taskId}
                  elevation={0}
                  sx={{
                    p: 1.5,
                    mb: 1.5,
                    border: '1px solid #d0e0ff',
                    borderRadius: '10px',
                    backgroundColor: '#f8fbff',
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#e53935' }}>
                        {task.taskName}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#4a6fa5', display: 'block' }}>
                        Project: {task.projectName}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#4a6fa5' }}>
                        Developer: {task.developerName}
                      </Typography>
                    </Box>
                    <Tooltip title="Edit Task">
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/tasks/edit/${task.taskId}`)}
                        sx={{ color: PRIMARY_BLUE }}
                      >
                        <IconifyIcon icon="material-symbols:edit" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Paper>
              ))}
            </Box>
          </SectionCard>
        </Grid>
      </Grid>

      {/* Completed Meetings & Active Projects */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <SectionCard title="Completed Meetings" iconName="material-symbols:event-available">
            <Box sx={{ maxHeight: 360, overflowY: 'auto', pr: 1 }}>
              {completedMeetingsData.map((meeting) => (
                <Paper
                  key={meeting.meetingId}
                  elevation={0}
                  sx={{
                    p: 1.5,
                    mb: 1.5,
                    border: '1px solid #d0e0ff',
                    borderRadius: '10px',
                    backgroundColor: '#f8fbff',
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f2a6e' }}>
                        {meeting.projectName} / {meeting.clientName}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#4a6fa5', display: 'block' }}>
                        Developer: {meeting.developerName}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#4a6fa5' }}>
                        {meeting.meetingTime}
                      </Typography>
                    </Box>
                    <Tooltip title="View Meeting Details">
                      <IconButton
                        size="small"
                        onClick={() => navigate(meeting.link)}
                        sx={{ color: PRIMARY_BLUE }}
                      >
                        <IconifyIcon icon="material-symbols:link" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Paper>
              ))}
            </Box>
          </SectionCard>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <SectionCard title="Active Projects" iconName="material-symbols:rocket">
            <Box sx={{ maxHeight: 360, overflowY: 'auto', pr: 1 }}>
              {activeProjectsData.map((project) => (
                <Paper
                  key={project.projectId}
                  elevation={0}
                  onClick={() => navigate(`/projects/${project.projectId}`)}
                  sx={{
                    p: 1.5,
                    mb: 1.5,
                    border: '1px solid #d0e0ff',
                    borderRadius: '10px',
                    backgroundColor: '#f8fbff',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    '&:hover': {
                      backgroundColor: PRIMARY_BLUE_LIGHT,
                      borderColor: PRIMARY_BLUE,
                      transform: 'translateX(4px)',
                    },
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f2a6e' }}>
                    {project.projectName}
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 0.5, mb: 0.5 }}>
                    <Chip
                      label={project.status}
                      size="small"
                      color={project.status === 'Delayed' ? 'error' : 'success'}
                      sx={{ height: 22, fontSize: '11px', fontWeight: 600 }}
                    />
                    <Chip
                      label={project.phase}
                      size="small"
                      variant="outlined"
                      sx={{
                        height: 22,
                        fontSize: '11px',
                        fontWeight: 600,
                        borderColor: PRIMARY_BLUE,
                        color: PRIMARY_BLUE,
                      }}
                    />
                  </Stack>
                  <Typography variant="caption" sx={{ color: '#4a6fa5' }}>
                    Tasks: {project.completedTasks} completed
                  </Typography>
                </Paper>
              ))}
            </Box>
          </SectionCard>
        </Grid>
      </Grid>

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
