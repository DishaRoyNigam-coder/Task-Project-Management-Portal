// src/pages/dashboard/AdminDashboard.tsx — Equal‑height item cards, inline meeting date badge
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
  Stack,
  Typography,
} from '@mui/material';
import { useMeetings } from 'context/MeetingContext';
import { useProjects } from 'context/ProjectContext';
import { useTasks } from 'context/TaskContext';
import IconifyIcon from 'components/base/IconifyIcon';

// ─── Theme ────────────────────────────────────────────────────────────────────
const PRIMARY_BLUE = '#1E58E6';
const PRIMARY_BLUE_LIGHT = '#E6F0FF';

// ─── Refined colour palette for cards (softer, modern) ───────────────────────
const COLORS = {
  green: { bg: '#E8F5E9', main: '#2E7D32', icon: '#2E7D32' },
  red: { bg: '#FFEBEE', main: '#D32F2F', icon: '#D32F2F' },
  blue: { bg: '#E3F2FD', main: '#1565C0', icon: '#1565C0' },
  purple: { bg: '#F3E5F5', main: '#7B1FA2', icon: '#7B1FA2' },
};

// ─── KPI Card ────────────────────────────────────────────────────────────────
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

// ─── Section Card (wrapper for each column) ─────────────────────────────────
const SectionCard = ({ title, color, icon, children }: any) => (
  <Card
    sx={{
      borderRadius: 4,
      boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
      height: '100%',
      transition: 'transform 0.2s, box-shadow 0.2s',
      '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 12px 28px rgba(0,0,0,0.08)' },
    }}
  >
    <CardContent sx={{ p: 2.5 }}>
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2.5 }}>
        <Avatar sx={{ bgcolor: color.bg, color: color.icon, width: 40, height: 40 }}>
          <IconifyIcon icon={icon} />
        </Avatar>
        <Typography variant="h6" sx={{ fontWeight: 700, color: color.main }}>
          {title}
        </Typography>
      </Stack>
      <Box>{children}</Box>
    </CardContent>
  </Card>
);

// ─── Item Card – fixed height, consistent padding, flexible content ─────────
const ItemCard = ({ children, onClick }: any) => (
  <Box
    onClick={onClick}
    sx={{
      p: 2,
      mb: 2,
      borderRadius: 2,
      backgroundColor: '#ffffff',
      border: '1px solid #eef2f8',
      transition: 'all 0.2s',
      cursor: onClick ? 'pointer' : 'default',
      minHeight: 110,
      display: 'flex',
      alignItems: 'center',
      '&:hover': onClick
        ? {
            backgroundColor: '#f5f9ff',
            borderColor: PRIMARY_BLUE_LIGHT,
            transform: 'translateX(4px)',
          }
        : {},
    }}
  >
    {children}
  </Box>
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

const getMeetingDayMonth = (dateStr: string) => {
  const d = new Date(dateStr);
  return { day: d.getDate(), month: d.toLocaleString('en-US', { month: 'short' }).toUpperCase() };
};

// ─── Main Component ──────────────────────────────────────────────────────────
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

  // ── Completed Tasks (status = 'Done') ──
  const completedTasksData = useMemo(() => {
    const realCompleted = tasks
      .filter((t) => t.status === 'Done')
      .sort((a, b) => (a.updatedAt > b.updatedAt ? -1 : 1))
      .map((task) => {
        const project = projects.find((p) => p.id === task.projectId);
        return {
          title: task.title,
          project: project?.projectName || 'Unknown Project',
          developer: task.assignedTo?.name || 'Unassigned',
          date: `${formatDate(task.updatedAt || task.dueDate)} at ${formatTime(task.updatedAt || task.dueDate)}`,
          id: task.id,
        };
      });
    if (realCompleted.length > 0) return realCompleted;
    return [
      {
        title: 'Mobile Banking App - Login UI',
        project: 'Mobile Banking App',
        developer: 'Ekawati',
        date: '03 Dec 2023 at 08:10 AM',
        id: 'demo1',
      },
      {
        title: 'API Integration for Payment Gateway',
        project: 'E-commerce Platform',
        developer: 'John Doe',
        date: '05 Dec 2023 at 02:30 PM',
        id: 'demo2',
      },
    ];
  }, [tasks, projects]);

  // ── Delayed Tasks (due date passed and not Done) ──
  const delayedTasksData = useMemo(() => {
    const realDelayed = tasks
      .filter((t) => new Date(t.dueDate) < new Date() && t.status !== 'Done')
      .sort((a, b) => (a.dueDate < b.dueDate ? -1 : 1))
      .map((task) => {
        const project = projects.find((p) => p.id === task.projectId);
        return {
          title: task.title,
          project: project?.projectName || 'Unknown Project',
          developer: task.assignedTo?.name || 'Unassigned',
          id: task.id,
        };
      });
    if (realDelayed.length > 0) return realDelayed;
    return [
      {
        title: 'Design login UI',
        project: 'Mobile Banking App',
        developer: 'John Doe',
        id: 'demo_delay1',
      },
      {
        title: 'Implement API integration',
        project: 'Mobile Banking App',
        developer: 'Jane Smith',
        id: 'demo_delay2',
      },
    ];
  }, [tasks, projects]);

  // ── Completed Meetings (status = 'Completed') ──
  const completedMeetingsData = useMemo(() => {
    const realCompletedMeetings = meetings
      .filter((m) => (m as any).status === 'Completed' || (m as any).completed === true)
      .map((m) => {
        const project = projects.find((p) => p.id === m.projectId);
        const meetingDate =
          (m as any).date ||
          (m as any).meetingDate ||
          (m as any).createdAt ||
          new Date().toISOString();
        return {
          title: `${project?.projectName || 'Unknown Project'} / ${project?.clientName || 'Unknown Client'}`,
          developer: (m as any).createdBy || (m as any).organizer || 'Admin',
          date: meetingDate,
          formattedDate: `${formatDate(meetingDate)} at ${formatTime(meetingDate)}`,
          id: m.id,
        };
      });
    if (realCompletedMeetings.length > 0) return realCompletedMeetings;
    return [
      {
        title: 'Mobile Banking App / FinBank Corp',
        developer: 'Ekawati',
        date: '2023-12-03T10:00:00',
        formattedDate: '03 Dec 2023 at 10:00 AM',
        id: 'demo_meet1',
      },
      {
        title: 'E-commerce Platform / Retail Solutions',
        developer: 'John Doe',
        date: '2023-12-05T14:30:00',
        formattedDate: '05 Dec 2023 at 02:30 PM',
        id: 'demo_meet2',
      },
    ];
  }, [meetings, projects]);

  // ── Active Projects (with status, phase, task completion) ──
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
          name: project.projectName,
          status,
          phase,
          progress: `${completedTasksCount}/${totalTasks}`,
          id: project.id,
        };
      });
    if (realActive.length > 0) return realActive;
    return [
      {
        name: 'Mobile Banking App',
        status: 'Delayed',
        phase: 'Development',
        progress: '0/2',
        id: 'demo_proj1',
      },
      {
        name: 'E-commerce Platform',
        status: 'On Time',
        phase: 'Testing',
        progress: '4/6',
        id: 'demo_proj2',
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
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: '#fafcff', minHeight: '100vh' }}>
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
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
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

      {/* Four‑Card Section with equal‑height item cards */}
      <Grid container spacing={3}>
        {/* Completed Tasks Card */}
        <Grid size={{ xs: 12, md: 6 }}>
          <SectionCard title="Completed Tasks" color={COLORS.green} icon="mdi:check-circle-outline">
            {completedTasksData.map((task) => (
              <ItemCard key={task.id}>
                <Stack direction="row" spacing={2} alignItems="center" width="100%">
                  <Avatar
                    sx={{
                      bgcolor: COLORS.green.bg,
                      color: COLORS.green.icon,
                      width: 40,
                      height: 40,
                    }}
                  >
                    <IconifyIcon icon="mdi:clipboard-check" />
                  </Avatar>
                  <Box flex={1}>
                    <Typography fontWeight={700} color="#1a2b5e">
                      {task.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Project: {task.project}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Developer: {task.developer}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {task.date}
                    </Typography>
                    <Chip
                      label="Submitted"
                      size="small"
                      sx={{ mt: 1, bgcolor: '#E8F5E9', color: '#2E7D32', fontWeight: 600 }}
                      icon={<IconifyIcon icon="mdi:check-circle" width={14} />}
                    />
                  </Box>
                </Stack>
              </ItemCard>
            ))}
          </SectionCard>
        </Grid>

        {/* Delayed Tasks Card */}
        <Grid size={{ xs: 12, md: 6 }}>
          <SectionCard title="Delayed Tasks" color={COLORS.red} icon="mdi:clock-alert-outline">
            {delayedTasksData.map((task) => (
              <ItemCard key={task.id}>
                <Stack direction="row" spacing={2} alignItems="center" width="100%">
                  <Avatar
                    sx={{ bgcolor: COLORS.red.bg, color: COLORS.red.icon, width: 40, height: 40 }}
                  >
                    <IconifyIcon icon="mdi:alert-circle" />
                  </Avatar>
                  <Box flex={1}>
                    <Typography fontWeight={700} color="#d32f2f">
                      {task.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Project: {task.project}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Developer: {task.developer}
                    </Typography>
                  </Box>
                  <IconButton
                    onClick={() => navigate(`/tasks/edit/${task.id}`)}
                    sx={{ color: PRIMARY_BLUE }}
                  >
                    <IconifyIcon icon="mdi:pencil" />
                  </IconButton>
                </Stack>
              </ItemCard>
            ))}
          </SectionCard>
        </Grid>

        {/* Completed Meetings Card – with inline date badge */}
        <Grid size={{ xs: 12, md: 6 }}>
          <SectionCard title="Completed Meetings" color={COLORS.blue} icon="mdi:calendar-check">
            {completedMeetingsData.map((meeting) => {
              const { day, month } = getMeetingDayMonth(meeting.date);
              return (
                <ItemCard key={meeting.id}>
                  <Stack direction="row" spacing={2} alignItems="center" width="100%">
                    {/* Inline date badge: day and month on the same line */}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'baseline',
                        gap: 0.5,
                        bgcolor: COLORS.blue.bg,
                        borderRadius: 2,
                        px: 1.5,
                        py: 0.75,
                        minWidth: 56,
                        justifyContent: 'center',
                      }}
                    >
                      <Typography fontWeight={700} color={COLORS.blue.main}>
                        {day}
                      </Typography>
                      <Typography variant="caption" fontWeight={600} color={COLORS.blue.main}>
                        {month}
                      </Typography>
                    </Box>
                    <Box flex={1}>
                      <Typography fontWeight={700} color="#1a2b5e">
                        {meeting.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Developer: {meeting.developer}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {meeting.formattedDate}
                      </Typography>
                    </Box>
                    <IconButton
                      onClick={() => navigate(`/meetings/${meeting.id}`)}
                      sx={{ color: PRIMARY_BLUE }}
                    >
                      <IconifyIcon icon="mdi:link" />
                    </IconButton>
                  </Stack>
                </ItemCard>
              );
            })}
          </SectionCard>
        </Grid>

        {/* Active Projects Card */}
        <Grid size={{ xs: 12, md: 6 }}>
          <SectionCard title="Active Projects" color={COLORS.purple} icon="mdi:rocket-launch">
            {activeProjectsData.map((project) => (
              <ItemCard key={project.id} onClick={() => navigate(`/projects/${project.id}`)}>
                <Stack direction="row" spacing={2} alignItems="center" width="100%">
                  <Avatar
                    sx={{
                      bgcolor: COLORS.purple.bg,
                      color: COLORS.purple.icon,
                      width: 40,
                      height: 40,
                    }}
                  >
                    <IconifyIcon icon="mdi:application" />
                  </Avatar>
                  <Box flex={1}>
                    <Typography fontWeight={700} color="#1a2b5e">
                      {project.name}
                    </Typography>
                    <Stack direction="row" spacing={1} mt={0.5} mb={0.5}>
                      <Chip
                        label={project.status}
                        size="small"
                        color={project.status === 'Delayed' ? 'error' : 'success'}
                        sx={{ height: 22, fontSize: '0.7rem', fontWeight: 600 }}
                      />
                      <Chip
                        label={project.phase}
                        size="small"
                        variant="outlined"
                        sx={{
                          height: 22,
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          borderColor: PRIMARY_BLUE,
                          color: PRIMARY_BLUE,
                        }}
                      />
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                      Tasks: {project.progress} completed
                    </Typography>
                  </Box>
                </Stack>
              </ItemCard>
            ))}
          </SectionCard>
        </Grid>
      </Grid>

      {/* Quick Links */}
      <Card elevation={0} sx={{ border: '1px solid #d0e0ff', borderRadius: '16px', mt: 4 }}>
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
