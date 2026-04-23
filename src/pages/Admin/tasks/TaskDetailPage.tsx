// src/pages/Admin/tasks/TaskDetailPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  ArrowBack as ArrowBackIcon,
  Assignment as AssignmentIcon,
  AttachFile as AttachFileIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckCircleIcon,
  Comment as CommentIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Flag as FlagIcon,
  Pending as PendingIcon,
  Person as PersonIcon,
  PlayCircle as PlayCircleIcon,
} from '@mui/icons-material';
import {
  Alert,
  Avatar,
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
  Snackbar,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import paths from 'routes/paths';

// ─── Theme tokens (same as Project pages) ─────────────────────────────────────
const PRIMARY_BLUE = '#1E58E6';
const PRIMARY_BLUE_DARK = '#1A4CC4';
const PRIMARY_BLUE_LIGHT = '#E6F0FF';

// ─── Type definitions ─────────────────────────────────────────────────────────
type TaskStatus = 'Pending' | 'In progress' | 'Done';
type TaskPriority = 'High' | 'Medium' | 'Low';

interface TaskData {
  id: string;
  title: string;
  description: string;
  projectName: string;
  projectId: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  assignedTo: {
    id: string;
    name: string;
    email: string;
    avatarColor: string;
    initials: string;
  };
  createdBy: {
    name: string;
    email: string;
  };
  comments: {
    id: string;
    author: string;
    text: string;
    timestamp: string;
  }[];
  attachments: {
    id: string;
    name: string;
    url: string;
  }[];
}

// ─── Static task data (typed as TaskData) ────────────────────────────────────
const STATIC_TASK: TaskData = {
  id: 'task_101',
  title: 'Implement biometric login API integration',
  description:
    'Integrate the FinBank OAuth2 biometric endpoint. Handle token refresh and error states. ' +
    'Ensure fallback to PIN if biometric fails. Write unit tests for the service layer.',
  projectName: 'Mobile Banking App',
  projectId: 'proj1',
  status: 'In progress',
  priority: 'High',
  dueDate: '2025-05-15',
  createdAt: '2025-04-01T09:00:00.000Z',
  updatedAt: '2025-04-18T14:30:00.000Z',
  assignedTo: {
    id: 'u2',
    name: 'Jane Smith',
    email: 'jane.smith@company.com',
    avatarColor: '#7b1fa2',
    initials: 'JS',
  },
  createdBy: {
    name: 'Admin User',
    email: 'admin@company.com',
  },
  comments: [
    {
      id: 'c1',
      author: 'John Doe',
      text: 'We need to clarify the fallback behaviour with the product team.',
      timestamp: '2025-04-02T11:20:00Z',
    },
    {
      id: 'c2',
      author: 'Jane Smith',
      text: 'Confirmed: fallback to PIN with 3 attempts.',
      timestamp: '2025-04-03T09:15:00Z',
    },
  ],
  attachments: [
    { id: 'a1', name: 'biometric_spec.pdf', url: '#' },
    { id: 'a2', name: 'oauth_flow_diagram.png', url: '#' },
  ],
};

// ─── Helper functions (consistent with project) ──────────────────────────────
const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const getStatusStyle = (status: TaskStatus) => {
  if (status === 'Done')
    return {
      bg: '#e8f5e9',
      color: '#2e7d32',
      border: '#a5d6a7',
      icon: <CheckCircleIcon fontSize="small" />,
    };
  if (status === 'In progress')
    return {
      bg: PRIMARY_BLUE_LIGHT,
      color: PRIMARY_BLUE,
      border: PRIMARY_BLUE,
      icon: <PlayCircleIcon fontSize="small" />,
    };
  return {
    bg: '#f5f5f5',
    color: '#616161',
    border: '#e0e0e0',
    icon: <PendingIcon fontSize="small" />,
  };
};

const getPriorityStyle = (priority: TaskPriority) => {
  if (priority === 'High')
    return {
      bg: '#fee2e2',
      color: '#dc2626',
      border: '#fecaca',
      icon: <FlagIcon fontSize="small" />,
    };
  if (priority === 'Medium')
    return {
      bg: '#fff3e0',
      color: '#ed6c02',
      border: '#ffcc80',
      icon: <FlagIcon fontSize="small" />,
    };
  return {
    bg: '#e8f5e9',
    color: '#2e7d32',
    border: '#c8e6c9',
    icon: <FlagIcon fontSize="small" />,
  };
};

// ─── Reusable Section Card (same as ProjectDetailPage) ───────────────────────
const SectionCard = ({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <Card
    elevation={0}
    sx={{
      border: '1px solid #d0e0ff',
      borderRadius: '14px',
      mb: 2.5,
      overflow: 'visible',
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

// ─── fieldSx for inline edit dialogs (matches project forms) ─────────────────
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

// ─── Main Component ──────────────────────────────────────────────────────────
const TaskDetailPage = () => {
  const navigate = useNavigate();
  const [task, setTask] = useState<TaskData>(STATIC_TASK);
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    title: task.title,
    description: task.description,
    priority: task.priority,
    dueDate: task.dueDate,
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  const statusStyle = getStatusStyle(status);
  const priorityStyle = getPriorityStyle(task.priority);

  // Cycle through task statuses (same logic as ProjectDetailPage tasks)
  const cycleStatus = () => {
    let next: TaskStatus;
    if (status === 'Pending') next = 'In progress';
    else if (status === 'In progress') next = 'Done';
    else next = 'Pending';
    setStatus(next);
    setTask((prev) => ({ ...prev, status: next }));
    setSnackbar({ open: true, message: `Status updated to ${next}`, severity: 'success' });
  };

  const handleEditSave = () => {
    setTask((prev) => ({
      ...prev,
      title: editForm.title,
      description: editForm.description,
      priority: editForm.priority, // ✅ removed unnecessary type assertion
      dueDate: editForm.dueDate,
    }));
    setEditModalOpen(false);
    setSnackbar({ open: true, message: 'Task updated successfully', severity: 'success' });
  };

  const handleDelete = () => {
    if (globalThis.confirm('Delete this task? This action cannot be undone.')) {
      setSnackbar({ open: true, message: 'Task deleted (mock action)', severity: 'success' });
      // Navigate back to project detail or tasks list
      navigate(paths.projects.detail.replace(':id', task.projectId));
    }
  };

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
              onClick={() => navigate(paths.projects.detail.replace(':id', task.projectId))}
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
              {task.title}
            </Typography>
            {/* Status Chip with click to cycle */}
            <Tooltip title="Click to change status">
              <Chip
                label={status}
                size="small"
                clickable
                onClick={cycleStatus}
                icon={statusStyle.icon}
                sx={{
                  backgroundColor: statusStyle.bg,
                  color: statusStyle.color,
                  fontWeight: 700,
                  borderRadius: '8px',
                  border: `1.5px solid ${statusStyle.border}`,
                  cursor: 'pointer',
                }}
              />
            </Tooltip>
            {/* Priority Chip */}
            <Chip
              label={task.priority}
              size="small"
              icon={priorityStyle.icon}
              sx={{
                backgroundColor: priorityStyle.bg,
                color: priorityStyle.color,
                fontWeight: 600,
                borderRadius: '8px',
                border: `1px solid ${priorityStyle.border}`,
              }}
            />
          </Stack>

          {/* Info Row */}
          <Grid container spacing={2}>
            {[
              {
                icon: <AssignmentIcon sx={{ fontSize: 16 }} />,
                label: 'Project',
                value: task.projectName,
                link: true,
              },
              {
                icon: <PersonIcon sx={{ fontSize: 16 }} />,
                label: 'Assigned to',
                value: task.assignedTo.name,
              },
              {
                icon: <CalendarIcon sx={{ fontSize: 16 }} />,
                label: 'Due date',
                value: formatDate(task.dueDate),
              },
              {
                icon: <CalendarIcon sx={{ fontSize: 16 }} />,
                label: 'Created',
                value: formatDate(task.createdAt),
              },
            ].map(({ icon, label, value, link }) => (
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
                    {link ? (
                      <Button
                        variant="text"
                        size="small"
                        onClick={() =>
                          navigate(paths.projects.detail.replace(':id', task.projectId))
                        }
                        sx={{
                          fontSize: '13px',
                          fontWeight: 600,
                          color: PRIMARY_BLUE,
                          textTransform: 'none',
                          p: 0,
                          minWidth: 0,
                          '&:hover': {
                            textDecoration: 'underline',
                            backgroundColor: 'transparent',
                          },
                        }}
                      >
                        {value}
                      </Button>
                    ) : (
                      <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#0f2a6e' }}>
                        {value}
                      </Typography>
                    )}
                  </Box>
                </Stack>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* ── Main Content Grid (full width) ── */}
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12 }}>
          {/* Description */}
          <SectionCard
            title="Description"
            action={
              <Button
                size="small"
                startIcon={<EditIcon sx={{ fontSize: '16px !important' }} />}
                onClick={() => setEditModalOpen(true)}
                sx={{
                  color: PRIMARY_BLUE,
                  fontWeight: 600,
                  fontSize: '12px',
                  textTransform: 'none',
                  borderRadius: '8px',
                  '&:hover': { backgroundColor: PRIMARY_BLUE_LIGHT },
                }}
              >
                Edit
              </Button>
            }
          >
            <Box
              sx={{
                backgroundColor: '#f8fbff',
                border: '1px solid #d0e0ff',
                borderRadius: '10px',
                p: 2,
              }}
            >
              <Typography
                variant="body2"
                sx={{ color: '#3a4f6e', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}
              >
                {task.description}
              </Typography>
            </Box>
          </SectionCard>

          {/* Assigned User & Dates */}
          <SectionCard title="Assignment & Timeline">
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar
                    sx={{
                      width: 40,
                      height: 40,
                      fontSize: '14px',
                      fontWeight: 700,
                      backgroundColor: task.assignedTo.avatarColor,
                      color: '#fff',
                    }}
                  >
                    {task.assignedTo.initials}
                  </Avatar>
                  <Box>
                    <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#0f2a6e' }}>
                      {task.assignedTo.name}
                    </Typography>
                    <Typography sx={{ fontSize: '12px', color: '#4a6fa5' }}>
                      {task.assignedTo.email}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Stack spacing={0.5}>
                  <Typography sx={{ fontSize: '12px', color: '#4a6fa5' }}>
                    Created by {task.createdBy.name}
                  </Typography>
                  <Typography sx={{ fontSize: '12px', color: '#4a6fa5' }}>
                    Last updated: {formatDateTime(task.updatedAt)}
                  </Typography>
                </Stack>
              </Grid>
            </Grid>
          </SectionCard>

          {/* Attachments */}
          <SectionCard
            title="Attachments"
            action={
              <Button
                size="small"
                startIcon={<AttachFileIcon sx={{ fontSize: '16px !important' }} />}
                sx={{
                  color: PRIMARY_BLUE,
                  fontWeight: 600,
                  fontSize: '12px',
                  textTransform: 'none',
                  borderRadius: '8px',
                  '&:hover': { backgroundColor: PRIMARY_BLUE_LIGHT },
                }}
              >
                Add File
              </Button>
            }
          >
            {task.attachments.length === 0 ? (
              <Typography sx={{ color: '#9e9e9e', fontStyle: 'italic', fontSize: '13px' }}>
                No attachments.
              </Typography>
            ) : (
              <Stack spacing={1}>
                {task.attachments.map((att) => (
                  <Box
                    key={att.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      p: 1,
                      backgroundColor: '#f8fbff',
                      border: '1px solid #d0e0ff',
                      borderRadius: '10px',
                    }}
                  >
                    <AttachFileIcon sx={{ fontSize: 16, color: '#4a6fa5' }} />
                    <Typography sx={{ fontSize: '13px', fontWeight: 500, color: PRIMARY_BLUE }}>
                      {att.name}
                    </Typography>
                    <Box sx={{ flexGrow: 1 }} />
                    <IconButton size="small" sx={{ color: '#dc2626' }}>
                      <DeleteIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Box>
                ))}
              </Stack>
            )}
          </SectionCard>

          {/* Comments */}
          <SectionCard
            title="Comments"
            action={
              <Button
                size="small"
                startIcon={<CommentIcon sx={{ fontSize: '16px !important' }} />}
                sx={{
                  color: PRIMARY_BLUE,
                  fontWeight: 600,
                  fontSize: '12px',
                  textTransform: 'none',
                  borderRadius: '8px',
                  '&:hover': { backgroundColor: PRIMARY_BLUE_LIGHT },
                }}
              >
                Add Comment
              </Button>
            }
          >
            {task.comments.length === 0 ? (
              <Typography sx={{ color: '#9e9e9e', fontStyle: 'italic', fontSize: '13px' }}>
                No comments yet.
              </Typography>
            ) : (
              <Stack spacing={1.5}>
                {task.comments.map((comment) => (
                  <Box
                    key={comment.id}
                    sx={{
                      p: 1.5,
                      backgroundColor: '#f8fbff',
                      border: '1px solid #d0e0ff',
                      borderRadius: '10px',
                    }}
                  >
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{ mb: 0.5 }}
                    >
                      <Typography sx={{ fontSize: '12px', fontWeight: 700, color: '#0f2a6e' }}>
                        {comment.author}
                      </Typography>
                      <Typography sx={{ fontSize: '10px', color: '#4a6fa5' }}>
                        {formatDateTime(comment.timestamp)}
                      </Typography>
                    </Stack>
                    <Typography sx={{ fontSize: '13px', color: '#374151' }}>
                      {comment.text}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            )}
          </SectionCard>

          {/* Danger Zone (Delete) */}
          <Card
            elevation={0}
            sx={{
              border: '1px solid #fee2e2',
              borderRadius: '14px',
              backgroundColor: '#fff5f5',
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography sx={{ fontWeight: 700, color: '#dc2626', fontSize: '14px' }}>
                    Delete Task
                  </Typography>
                  <Typography sx={{ fontSize: '12px', color: '#b91c1c' }}>
                    Once deleted, this task cannot be recovered.
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  startIcon={<DeleteIcon />}
                  onClick={handleDelete}
                  sx={{
                    borderColor: '#dc2626',
                    color: '#dc2626',
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontWeight: 600,
                    '&:hover': { backgroundColor: '#fee2e2', borderColor: '#b91c1c' },
                  }}
                >
                  Delete Task
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ── Edit Task Dialog ── */}
      <Dialog
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        maxWidth="md"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: '14px', border: '1px solid #d0e0ff' } } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: '#0f2a6e', pb: 1 }}>Edit Task</DialogTitle>
        <Divider sx={{ borderColor: '#d0e0ff' }} />
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <TextField
              fullWidth
              label="Task Title"
              value={editForm.title}
              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              sx={fieldSx}
            />
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={4}
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              sx={fieldSx}
            />
            <TextField
              fullWidth
              label="Priority"
              select
              value={editForm.priority}
              onChange={(e) =>
                setEditForm({ ...editForm, priority: e.target.value as TaskPriority })
              }
              slotProps={{ select: { native: true } }}
              sx={fieldSx}
            >
              {['High', 'Medium', 'Low'].map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </TextField>
            <TextField
              fullWidth
              label="Due Date"
              type="date"
              value={editForm.dueDate}
              onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
              slotProps={{ inputLabel: { shrink: true } }}
              sx={fieldSx}
            />
          </Stack>
        </DialogContent>
        <Divider sx={{ borderColor: '#d0e0ff' }} />
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button
            onClick={() => setEditModalOpen(false)}
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
            onClick={handleEditSave}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 600,
              backgroundColor: PRIMARY_BLUE,
              boxShadow: `0 3px 10px ${PRIMARY_BLUE}35`,
              '&:hover': { backgroundColor: PRIMARY_BLUE_DARK },
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
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

export default TaskDetailPage;
