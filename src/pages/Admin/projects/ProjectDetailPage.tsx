// src/pages/Admin/projects/ProjectDetailPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
  CalendarToday as CalendarIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  FolderOpen as FolderIcon,
  Link as LinkIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import {
  Alert,
  Avatar,
  AvatarGroup,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Snackbar,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import paths from 'routes/paths';

// ─── Static Data ──────────────────────────────────────────────────────────────
const PRIMARY_BLUE = '#1E58E6';
const PRIMARY_BLUE_DARK = '#1A4CC4';
const PRIMARY_BLUE_LIGHT = '#E6F0FF';

const STATIC_PROJECT = {
  id: 'proj1',
  projectName: 'Mobile Banking App',
  clientName: 'FinBank Corp',
  projectPhase: 'Development',
  status: 'Active' as const,
  createdBy: 'Admin User',
  createdAt: '2025-03-10T09:00:00.000Z',
  updatedAt: '2025-04-18T14:30:00.000Z',
  driveLink: 'https://drive.google.com/drive/folders/abc123',
  projectNotes:
    'Implement biometric login and full transaction history with real-time notifications. ' +
    'Focus on security hardening and UX for the onboarding flow. ' +
    'Coordinate with the FinBank API team for OAuth2 integration.',
  teamMembers: [
    { id: 1, name: 'John Doe', email: 'john.doe@company.com', initials: 'JD', color: '#1E58E6' },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane.smith@company.com',
      initials: 'JS',
      color: '#7b1fa2',
    },
    { id: 3, name: 'Mike Johnson', email: 'mike.j@company.com', initials: 'MJ', color: '#00796b' },
    {
      id: 4,
      name: 'Emily Davis',
      email: 'emily.davis@company.com',
      initials: 'ED',
      color: '#c62828',
    },
  ],
};

type StaticTask = {
  id: string;
  title: string;
  priority: 'High' | 'Medium' | 'Low';
  dueDate: string;
  assignedTo: string;
  status: 'Pending' | 'In progress' | 'Done';
};

const STATIC_TASKS: StaticTask[] = [
  {
    id: 't1',
    title: 'Design login UI',
    priority: 'High' as const,
    dueDate: '2025-04-20',
    assignedTo: 'John Doe',
    status: 'Done' as const,
  },
  {
    id: 't2',
    title: 'Implement API integration',
    priority: 'Medium' as const,
    dueDate: '2025-04-28',
    assignedTo: 'Jane Smith',
    status: 'In progress' as const,
  },
  {
    id: 't3',
    title: 'Write unit tests',
    priority: 'Low' as const,
    dueDate: '2025-05-05',
    assignedTo: 'Mike Johnson',
    status: 'Pending' as const,
  },
  {
    id: 't4',
    title: 'Security audit',
    priority: 'High' as const,
    dueDate: '2025-05-10',
    assignedTo: 'Emily Davis',
    status: 'Pending' as const,
  },
  {
    id: 't5',
    title: 'UAT with client',
    priority: 'Medium' as const,
    dueDate: '2025-05-20',
    assignedTo: 'John Doe',
    status: 'Pending' as const,
  },
];

const STATIC_LINKS = [
  { id: 'l1', linkTitle: 'Figma Design File', linkUrl: 'https://figma.com/file/abc' },
  { id: 'l2', linkTitle: 'Staging Environment', linkUrl: 'https://staging.finbank.com' },
  { id: 'l3', linkTitle: 'API Documentation', linkUrl: 'https://api.finbank.com/docs' },
  { id: 'l4', linkTitle: 'Notion Project Board', linkUrl: 'https://notion.so/finbank-app' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getLinkColor = (url: string) => {
  if (url.includes('figma')) return '#1e88e5';
  if (url.includes('staging')) return '#43a047';
  if (url.includes('api')) return '#fb8c00';
  if (url.includes('notion')) return '#7b1fa2';
  return '#546e7a';
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

const priorityColor = (p: string) => {
  if (p === 'High') return 'error';
  if (p === 'Medium') return 'warning';
  return 'info';
};

const statusColor = (s: string) => {
  if (s === 'Done') return '#43a047';
  if (s === 'In progress') return PRIMARY_BLUE;
  return '#9e9e9e';
};

const statusBg = (s: string) => {
  if (s === 'Done') return '#e8f5e9';
  if (s === 'In progress') return PRIMARY_BLUE_LIGHT;
  return '#f5f5f5';
};

// ─── Reusable Section Card ────────────────────────────────────────────────────
const SectionCard = ({
  title,
  action,
  children,
  sx = {},
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  sx?: object;
}) => (
  <Card
    elevation={0}
    sx={{
      border: '1px solid #d0e0ff',
      borderRadius: '14px',
      mb: 2.5,
      overflow: 'visible',
      ...sx,
    }}
  >
    <CardContent sx={{ p: 2.5 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 700, color: '#0f2a6e', fontSize: '15px' }}
        >
          {title}
        </Typography>
        {action}
      </Stack>
      {children}
    </CardContent>
  </Card>
);

// ─── fieldSx (same as ProjectFormPage) ───────────────────────────────────────
const fieldSx = {
  '& .MuiOutlinedInput-root': {
    backgroundColor: PRIMARY_BLUE_LIGHT,
    borderRadius: '8px',
    '& fieldset': { borderColor: PRIMARY_BLUE, borderWidth: '1.5px' },
    '&:hover': {
      backgroundColor: '#dce9ff',
      '& fieldset': { borderColor: PRIMARY_BLUE_DARK, borderWidth: '2px' },
    },
    '&.Mui-focused': {
      backgroundColor: '#dce9ff',
      boxShadow: `0 0 0 3px ${PRIMARY_BLUE}28`,
      '& fieldset': { borderColor: PRIMARY_BLUE, borderWidth: '2px' },
    },
  },
  '& .MuiInputLabel-root': {
    color: '#4a6fa5',
    '&.Mui-focused': { color: PRIMARY_BLUE },
  },
};

const getProjectStatusStyles = (status: string) => {
  if (status === 'Active') return { bg: '#e8f5e9', color: '#2e7d32', border: '#a5d6a7' };
  if (status === 'Completed')
    return { bg: PRIMARY_BLUE_LIGHT, color: PRIMARY_BLUE, border: PRIMARY_BLUE };
  return { bg: '#f5f5f5', color: '#616161', border: '#e0e0e0' };
};

const cycleTaskStatus = (status: string): 'Pending' | 'In progress' | 'Done' => {
  if (status === 'Pending') return 'In progress';
  if (status === 'In progress') return 'Done';
  return 'Pending';
};

// ─── Component ────────────────────────────────────────────────────────────────
const ProjectDetailPage = () => {
  const navigate = useNavigate();
  const project = STATIC_PROJECT;

  const [tasks, setTasks] = useState(STATIC_TASKS);
  const [links, setLinks] = useState(STATIC_LINKS);
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<any>(null);
  const [linkForm, setLinkForm] = useState({ linkTitle: '', linkUrl: '' });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  const completedCount = tasks.filter((t) => t.status === 'Done').length;
  const completionPct = Math.round((completedCount / tasks.length) * 100);

  // ── Link handlers ──
  const openLinkModal = (link?: any) => {
    setEditingLink(link || null);
    setLinkForm(
      link ? { linkTitle: link.linkTitle, linkUrl: link.linkUrl } : { linkTitle: '', linkUrl: '' },
    );
    setLinkModalOpen(true);
  };

  const saveLink = () => {
    if (!linkForm.linkTitle.trim() || !linkForm.linkUrl.trim()) {
      setSnackbar({ open: true, message: 'Title and URL are required', severity: 'error' });
      return;
    }
    if (editingLink) {
      setLinks((prev) => prev.map((l) => (l.id === editingLink.id ? { ...l, ...linkForm } : l)));
      setSnackbar({ open: true, message: 'Link updated', severity: 'success' });
    } else {
      setLinks((prev) => [...prev, { id: `l_${Date.now()}`, ...linkForm }]);
      setSnackbar({ open: true, message: 'Link added', severity: 'success' });
    }
    setLinkModalOpen(false);
  };

  const deleteLink = (id: string) => {
    if (globalThis.confirm('Delete this link?')) {
      setLinks((prev) => prev.filter((l) => l.id !== id));
      setSnackbar({ open: true, message: 'Link deleted', severity: 'success' });
    }
  };

  // ── Task status cycle ──
  const cycleStatus = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const next = cycleTaskStatus(t.status);
        return { ...t, status: next };
      }),
    );
  };

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* ── Page Header ── */}
      <Card
        elevation={0}
        sx={{
          border: '1px solid #d0e0ff',
          borderRadius: '14px',
          mb: 3,
          background: `linear-gradient(135deg, ${PRIMARY_BLUE_LIGHT} 0%, #f0f5ff 100%)`,
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
            <IconButton
              onClick={() => navigate(paths.root)}
              size="small"
              sx={{
                border: `1.5px solid ${PRIMARY_BLUE}`,
                color: PRIMARY_BLUE,
                borderRadius: '8px',
                '&:hover': { backgroundColor: PRIMARY_BLUE_LIGHT },
              }}
            >
              <ArrowBackIcon fontSize="small" />
            </IconButton>
            <Typography
              variant="h4"
              sx={{ fontWeight: 700, color: '#0f2a6e', fontSize: { xs: '1.25rem', md: '1.5rem' } }}
            >
              {project.projectName}
            </Typography>
            {/* Status Chip */}
            <Chip
              label={project.status}
              size="small"
              sx={{
                backgroundColor: getProjectStatusStyles(project.status).bg,
                color: getProjectStatusStyles(project.status).color,
                fontWeight: 700,
                borderRadius: '8px',
                border: `1.5px solid ${getProjectStatusStyles(project.status).border}`,
              }}
            />
            {/* Phase Chip */}
            <Chip
              label={project.projectPhase}
              size="small"
              sx={{
                backgroundColor: '#fff3e0',
                color: '#e65100',
                fontWeight: 600,
                borderRadius: '8px',
                border: '1.5px solid #ffcc80',
              }}
            />
          </Stack>

          {/* Info Row */}
          <Grid container spacing={2}>
            {[
              {
                icon: <PersonIcon sx={{ fontSize: 16 }} />,
                label: 'Client',
                value: project.clientName,
              },
              {
                icon: <CalendarIcon sx={{ fontSize: 16 }} />,
                label: 'Created',
                value: formatDate(project.createdAt),
              },
              {
                icon: <CalendarIcon sx={{ fontSize: 16 }} />,
                label: 'Updated',
                value: formatDate(project.updatedAt),
              },
              {
                icon: <PersonIcon sx={{ fontSize: 16 }} />,
                label: 'Created by',
                value: project.createdBy,
              },
            ].map(({ icon, label, value }) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={label}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: '8px',
                      backgroundColor: PRIMARY_BLUE_LIGHT,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: PRIMARY_BLUE,
                    }}
                  >
                    {icon}
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: '11px', color: '#4a6fa5', lineHeight: 1 }}>
                      {label}
                    </Typography>
                    <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#0f2a6e' }}>
                      {value}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* ── Main Grid ── */}
      <Grid container spacing={2.5}>
        {/* ── LEFT COLUMN ── */}
        <Grid size={{ xs: 12, md: 8 }}>
          {/* Team Members */}
          <SectionCard title="Team Members">
            <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
              {project.teamMembers.map((m) => (
                <Stack
                  key={m.id}
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  sx={{
                    px: 1.5,
                    py: 0.75,
                    backgroundColor: PRIMARY_BLUE_LIGHT,
                    border: `1.5px solid ${PRIMARY_BLUE}`,
                    borderRadius: '10px',
                  }}
                >
                  <Avatar
                    sx={{
                      width: 28,
                      height: 28,
                      fontSize: '11px',
                      fontWeight: 700,
                      backgroundColor: m.color,
                      color: '#fff',
                    }}
                  >
                    {m.initials}
                  </Avatar>
                  <Box>
                    <Typography
                      sx={{ fontSize: '13px', fontWeight: 600, color: '#0f2a6e', lineHeight: 1.2 }}
                    >
                      {m.name}
                    </Typography>
                    <Typography sx={{ fontSize: '11px', color: '#4a6fa5' }}>{m.email}</Typography>
                  </Box>
                </Stack>
              ))}
            </Stack>
          </SectionCard>

          {/* Project Notes */}
          <SectionCard title="Project Notes">
            <Box
              sx={{
                backgroundColor: '#f8fbff',
                border: '1px solid #d0e0ff',
                borderRadius: '10px',
                p: 2,
              }}
            >
              <Typography variant="body2" sx={{ color: '#3a4f6e', lineHeight: 1.8 }}>
                {project.projectNotes}
              </Typography>
            </Box>
          </SectionCard>

          {/* Resources */}
          <SectionCard
            title="Resources"
            action={
              <Button
                size="small"
                startIcon={<AddIcon sx={{ fontSize: '16px !important' }} />}
                onClick={() => openLinkModal()}
                sx={{
                  color: PRIMARY_BLUE,
                  fontWeight: 600,
                  fontSize: '12px',
                  textTransform: 'none',
                  borderRadius: '8px',
                  '&:hover': { backgroundColor: PRIMARY_BLUE_LIGHT },
                }}
              >
                Add Link
              </Button>
            }
          >
            {/* Drive Button */}
            <Button
              variant="contained"
              startIcon={<FolderIcon />}
              href={project.driveLink}
              target="_blank"
              sx={{
                backgroundColor: PRIMARY_BLUE,
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '13px',
                boxShadow: `0 3px 10px ${PRIMARY_BLUE}35`,
                mb: 2,
                '&:hover': { backgroundColor: PRIMARY_BLUE_DARK },
              }}
            >
              Google Drive Folder
            </Button>

            <Divider sx={{ mb: 1.5, borderColor: '#d0e0ff' }} />

            {links.length === 0 ? (
              <Typography sx={{ color: '#9e9e9e', fontStyle: 'italic', fontSize: '13px' }}>
                No additional links.
              </Typography>
            ) : (
              <List dense disablePadding>
                {links.map((link) => (
                  <ListItem
                    key={link.id}
                    disablePadding
                    sx={{
                      py: 0.75,
                      px: 1.5,
                      mb: 1,
                      backgroundColor: '#f8fbff',
                      border: '1px solid #d0e0ff',
                      borderRadius: '10px',
                      '&:hover': { backgroundColor: PRIMARY_BLUE_LIGHT },
                    }}
                    secondaryAction={
                      <Stack direction="row" spacing={0.5}>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => openLinkModal(link)}
                            sx={{
                              color: PRIMARY_BLUE,
                              '&:hover': { backgroundColor: PRIMARY_BLUE_LIGHT },
                            }}
                          >
                            <EditIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={() => deleteLink(link.id)}
                            sx={{ color: '#e53935', '&:hover': { backgroundColor: '#ffebee' } }}
                          >
                            <DeleteIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    }
                  >
                    <ListItemAvatar sx={{ minWidth: 36 }}>
                      <Box
                        sx={{
                          width: 28,
                          height: 28,
                          borderRadius: '8px',
                          backgroundColor: `${getLinkColor(link.linkUrl)}18`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <LinkIcon sx={{ fontSize: 15, color: getLinkColor(link.linkUrl) }} />
                      </Box>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <a
                          href={link.linkUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: PRIMARY_BLUE,
                            fontWeight: 600,
                            fontSize: '13px',
                            textDecoration: 'none',
                          }}
                        >
                          {link.linkTitle}
                        </a>
                      }
                      secondary={
                        <Typography sx={{ fontSize: '11px', color: '#4a6fa5' }}>
                          {link.linkUrl.length > 55
                            ? link.linkUrl.slice(0, 55) + '…'
                            : link.linkUrl}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </SectionCard>

          {/* Meeting Notes */}
          <SectionCard title="Meeting Notes">
            <Box
              sx={{
                backgroundColor: '#fffde7',
                border: '1px solid #fff9c4',
                borderRadius: '10px',
                p: 2,
                textAlign: 'center',
              }}
            >
              <Typography sx={{ fontSize: '13px', color: '#f57f17' }}>
                📋 Feature coming soon — meeting notes will be listed here.
              </Typography>
            </Box>
          </SectionCard>
        </Grid>

        {/* ── RIGHT COLUMN – Tasks ── */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            elevation={0}
            sx={{
              border: '1px solid #d0e0ff',
              borderRadius: '14px',
              position: 'sticky',
              top: 16,
              overflow: 'hidden',
            }}
          >
            <CardContent sx={{ p: 2.5, overflow: 'hidden' }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 2 }}
              >
                <Typography sx={{ fontWeight: 700, color: '#0f2a6e', fontSize: '15px' }}>
                  Tasks
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<AddIcon sx={{ fontSize: '15px !important' }} />}
                  onClick={() => navigate(paths.tasks?.new || '/')}
                  sx={{
                    borderColor: PRIMARY_BLUE,
                    color: PRIMARY_BLUE,
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '12px',
                    '&:hover': {
                      backgroundColor: PRIMARY_BLUE_LIGHT,
                      borderColor: PRIMARY_BLUE_DARK,
                    },
                  }}
                >
                  Add
                </Button>
              </Stack>

              {/* Completion bar */}
              <Box
                sx={{
                  backgroundColor: '#f8fbff',
                  border: '1px solid #d0e0ff',
                  borderRadius: '10px',
                  p: 1.5,
                  mb: 2,
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ mb: 0.75 }}
                >
                  <Typography sx={{ fontSize: '12px', color: '#4a6fa5', fontWeight: 500 }}>
                    Completion
                  </Typography>
                  <Typography sx={{ fontSize: '14px', fontWeight: 700, color: PRIMARY_BLUE }}>
                    {completionPct}%
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={completionPct}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: '#d0e0ff',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: PRIMARY_BLUE,
                      borderRadius: 4,
                    },
                  }}
                />
                <Typography sx={{ fontSize: '11px', color: '#4a6fa5', mt: 0.5 }}>
                  {completedCount} of {tasks.length} tasks done
                </Typography>
              </Box>

              <Divider sx={{ mb: 1.5, borderColor: '#d0e0ff' }} />

              {/* Task list */}
              <Stack spacing={1}>
                {tasks.map((task) => (
                  <Box
                    key={task.id}
                    sx={{
                      p: 1.5,
                      border: '1px solid #d0e0ff',
                      borderRadius: '10px',
                      backgroundColor: '#f8fbff',
                      '&:hover': { backgroundColor: PRIMARY_BLUE_LIGHT, borderColor: PRIMARY_BLUE },
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: '13px',
                        fontWeight: 600,
                        color: '#0f2a6e',
                        mb: 0.75,
                        wordBreak: 'break-word',
                        overflow: 'hidden',
                        textDecoration: task.status === 'Done' ? 'line-through' : 'none',
                        opacity: task.status === 'Done' ? 0.6 : 1,
                      }}
                    >
                      {task.title}
                    </Typography>

                    <Stack
                      direction="row"
                      spacing={0.75}
                      flexWrap="wrap"
                      useFlexGap
                      sx={{ mb: 0.75 }}
                    >
                      {/* Priority chip */}
                      <Chip
                        label={task.priority}
                        size="small"
                        color={priorityColor(task.priority) as any}
                        sx={{ height: 20, fontSize: '10px', fontWeight: 700, borderRadius: '6px' }}
                      />
                      {/* Status chip – clickable to cycle */}
                      <Tooltip title="Click to change status">
                        <Chip
                          label={task.status}
                          size="small"
                          clickable
                          onClick={() => cycleStatus(task.id)}
                          sx={{
                            height: 20,
                            fontSize: '10px',
                            fontWeight: 700,
                            borderRadius: '6px',
                            backgroundColor: statusBg(task.status),
                            color: statusColor(task.status),
                            border: `1px solid ${statusColor(task.status)}`,
                            cursor: 'pointer',
                          }}
                        />
                      </Tooltip>
                    </Stack>

                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography sx={{ fontSize: '11px', color: '#4a6fa5' }}>
                        👤 {task.assignedTo}
                      </Typography>
                      <Typography sx={{ fontSize: '11px', color: '#4a6fa5' }}>
                        📅 {task.dueDate}
                      </Typography>
                    </Stack>
                  </Box>
                ))}
              </Stack>

              {/* Team avatars summary */}
              <Divider sx={{ my: 1.5, borderColor: '#d0e0ff' }} />
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography sx={{ fontSize: '12px', color: '#4a6fa5', fontWeight: 500 }}>
                  Team
                </Typography>
                <AvatarGroup
                  max={4}
                  sx={{
                    '& .MuiAvatar-root': {
                      width: 28,
                      height: 28,
                      fontSize: '11px',
                      border: `2px solid #fff`,
                    },
                  }}
                >
                  {project.teamMembers.map((m) => (
                    <Tooltip key={m.id} title={m.name}>
                      <Avatar sx={{ backgroundColor: m.color, fontSize: '11px', fontWeight: 700 }}>
                        {m.initials}
                      </Avatar>
                    </Tooltip>
                  ))}
                </AvatarGroup>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ── Add/Edit Link Dialog ── */}
      <Dialog
        open={linkModalOpen}
        onClose={() => setLinkModalOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: '14px', border: '1px solid #d0e0ff' } } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: '#0f2a6e', pb: 1 }}>
          {editingLink ? 'Edit Link' : 'Add New Link'}
        </DialogTitle>
        <Divider sx={{ borderColor: '#d0e0ff' }} />
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <TextField
              fullWidth
              variant="outlined"
              label="Title"
              value={linkForm.linkTitle}
              onChange={(e) => setLinkForm({ ...linkForm, linkTitle: e.target.value })}
              sx={fieldSx}
            />
            <TextField
              fullWidth
              variant="outlined"
              label="URL"
              value={linkForm.linkUrl}
              onChange={(e) => setLinkForm({ ...linkForm, linkUrl: e.target.value })}
              placeholder="https://..."
              sx={fieldSx}
            />
          </Stack>
        </DialogContent>
        <Divider sx={{ borderColor: '#d0e0ff' }} />
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button
            onClick={() => setLinkModalOpen(false)}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 600,
              color: PRIMARY_BLUE,
              border: `1.5px solid ${PRIMARY_BLUE}`,
              '&:hover': { backgroundColor: PRIMARY_BLUE_LIGHT },
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={saveLink}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 600,
              backgroundColor: PRIMARY_BLUE,
              boxShadow: `0 3px 10px ${PRIMARY_BLUE}35`,
              '&:hover': { backgroundColor: PRIMARY_BLUE_DARK },
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Snackbar ── */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{ borderRadius: '10px' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProjectDetailPage;
