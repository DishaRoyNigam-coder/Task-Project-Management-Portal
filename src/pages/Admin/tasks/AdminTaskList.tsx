// src/pages/Admin/tasks/AdminTaskList.tsx
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Add as AddIcon,
  Assignment as AssignIcon,
  CheckCircleOutline,
  Close as CloseIcon,
  DeleteOutline as DeleteIcon,
  Edit as EditIcon,
  HourglassEmpty,
  PendingActions,
  Search as SearchIcon,
} from '@mui/icons-material';
import {
  Alert,
  Autocomplete,
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useProjects } from 'context/ProjectContext';
import { Task, mockEmployees, useTasks } from 'context/TaskContext';
import paths from 'routes/paths';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getPriorityColor = (p: string): 'error' | 'warning' | 'info' => {
  if (p === 'High') return 'error';
  if (p === 'Medium') return 'warning';
  return 'info';
};

const getStatusIcon = (status: string) => {
  if (status === 'Done') return <CheckCircleOutline sx={{ fontSize: 16 }} />;
  if (status === 'In progress') return <HourglassEmpty sx={{ fontSize: 16 }} />;
  return <PendingActions sx={{ fontSize: 16 }} />;
};

const getStatusColor = (status: string): { bg: string; color: string; border: string } => {
  if (status === 'Done') return { bg: '#e8f5e9', color: '#2e7d32', border: '#a5d6a7' };
  if (status === 'In progress') return { bg: '#fff3e0', color: '#e65100', border: '#ffcc80' };
  return { bg: '#e3f2fd', color: '#1565c0', border: '#90caf9' };
};

const getAvatarColor = (name: string) => {
  const colors = ['#1E58E6', '#7c3aed', '#0891b2', '#059669', '#d97706', '#dc2626'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    const codePoint = name.codePointAt(i) ?? 0;
    hash = codePoint + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const initials = (name: string) =>
  name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatCard = ({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: number;
  color: string;
  icon: React.ReactNode;
}) => (
  <Card
    elevation={0}
    sx={{
      border: '1px solid',
      borderColor: `${color}30`,
      borderRadius: '12px',
      p: 2,
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      background: `linear-gradient(135deg, ${color}08 0%, ${color}14 100%)`,
    }}
  >
    <Box
      sx={{
        width: 48,
        height: 48,
        borderRadius: '10px',
        background: `${color}20`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color,
        flexShrink: 0,
      }}
    >
      {icon}
    </Box>
    <Box>
      <Typography variant="h5" fontWeight={700} color={color}>
        {value}
      </Typography>
      <Typography variant="caption" color="text.secondary" fontWeight={500}>
        {label}
      </Typography>
    </Box>
  </Card>
);

// ─── Assign-to-Admin Dialog ───────────────────────────────────────────────────

interface AssignToAdminDialogProps {
  open: boolean;
  task: Task | null;
  onClose: () => void;
  onConfirm: (adminName: string) => void;
}

const ADMIN_LIST = [
  { id: 'admin1', name: 'Admin User', email: 'admin@company.com' },
  { id: 'admin2', name: 'Super Admin', email: 'superadmin@company.com' },
  { id: 'admin3', name: 'Project Manager', email: 'pm@company.com' },
];

const AssignToAdminDialog = ({ open, task, onClose, onConfirm }: AssignToAdminDialogProps) => {
  const [selectedAdmin, setSelectedAdmin] = useState(ADMIN_LIST[0]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: { sx: { borderRadius: '16px' } },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" gap={1}>
            <AssignIcon sx={{ color: '#1E58E6' }} />
            <Typography fontWeight={700}>Assign Task to Admin</Typography>
          </Stack>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 2 }}>
        {task && (
          <Box
            sx={{
              bgcolor: '#E6F0FF',
              borderRadius: '8px',
              p: 1.5,
              mb: 2,
              border: '1px solid #c8dbff',
            }}
          >
            <Typography variant="caption" color="#4a6fa5" fontWeight={600}>
              TASK
            </Typography>
            <Typography variant="body2" fontWeight={600} color="#0f2a6e">
              {task.title}
            </Typography>
          </Box>
        )}
        <Autocomplete
          options={ADMIN_LIST}
          getOptionLabel={(o) => o.name}
          value={selectedAdmin}
          onChange={(_, v) => v && setSelectedAdmin(v)}
          renderInput={(params) => (
            <TextField {...params} label="Select Admin" variant="outlined" size="small" />
          )}
          renderOption={(props, option) => (
            <li {...props} key={option.id}>
              <Stack direction="row" alignItems="center" gap={1.5}>
                <Avatar
                  sx={{
                    width: 28,
                    height: 28,
                    fontSize: 11,
                    bgcolor: getAvatarColor(option.name),
                  }}
                >
                  {initials(option.name)}
                </Avatar>
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    {option.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {option.email}
                  </Typography>
                </Box>
              </Stack>
            </li>
          )}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button
          variant="outlined"
          onClick={onClose}
          sx={{ borderRadius: '8px', textTransform: 'none' }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={() => onConfirm(selectedAdmin.name)}
          sx={{
            borderRadius: '8px',
            textTransform: 'none',
            bgcolor: '#1E58E6',
            '&:hover': { bgcolor: '#1A4CC4' },
          }}
        >
          Assign to Admin
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const AdminTaskList = () => {
  const navigate = useNavigate();
  const { tasks, updateTask, deleteTask } = useTasks();
  const { projects } = useProjects();

  // ── State ──
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterPriority, setFilterPriority] = useState<string>('All');
  const [filterAssignee, setFilterAssignee] = useState<string>('All');
  const [tabValue, setTabValue] = useState(0); // 0=All, 1=Developer, 2=Admin
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info',
  });

  // ── Derived data ──
  const projectMap = useMemo(() => {
    const m: Record<string, string> = {};
    projects.forEach((p) => (m[p.id] = p.projectName));
    return m;
  }, [projects]);

  const adminNames = useMemo(() => ADMIN_LIST.map((a) => a.name), []);

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const isAdminTask = adminNames.includes(t.assignedTo.name);
      if (tabValue === 1 && isAdminTask) return false;
      if (tabValue === 2 && !isAdminTask) return false;

      const matchSearch =
        !search ||
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.assignedTo.name.toLowerCase().includes(search.toLowerCase()) ||
        (projectMap[t.projectId] || '').toLowerCase().includes(search.toLowerCase());

      const matchStatus = filterStatus === 'All' || t.status === filterStatus;
      const matchPriority = filterPriority === 'All' || t.priority === filterPriority;
      const matchAssignee = filterAssignee === 'All' || t.assignedTo.name === filterAssignee;

      return matchSearch && matchStatus && matchPriority && matchAssignee;
    });
  }, [
    tasks,
    search,
    filterStatus,
    filterPriority,
    filterAssignee,
    tabValue,
    projectMap,
    adminNames,
  ]);

  const stats = useMemo(
    () => ({
      total: tasks.length,
      pending: tasks.filter((t) => t.status === 'Pending').length,
      inProgress: tasks.filter((t) => t.status === 'In progress').length,
      done: tasks.filter((t) => t.status === 'Done').length,
      adminTasks: tasks.filter((t) => adminNames.includes(t.assignedTo.name)).length,
    }),
    [tasks, adminNames],
  );

  // ── Handlers ──
  const handleAssignToAdmin = (adminName: string) => {
    if (!selectedTask) return;
    const admin = ADMIN_LIST.find((a) => a.name === adminName);
    if (!admin) return;
    updateTask(selectedTask.id, {
      assignedTo: {
        id: Number.parseInt(admin.id.replace('admin', ''), 10),
        name: admin.name,
        email: admin.email,
      },
    });
    setSnackbar({ open: true, message: `Task assigned to ${adminName}`, severity: 'success' });
    setAssignDialogOpen(false);
    setSelectedTask(null);
  };

  const handleStatusChange = (taskId: string, newStatus: Task['status']) => {
    updateTask(taskId, { status: newStatus });
    setSnackbar({ open: true, message: 'Task status updated', severity: 'info' });
  };

  const handleDelete = (id: string) => {
    deleteTask(id);
    setDeleteConfirmId(null);
    setSnackbar({ open: true, message: 'Task deleted successfully', severity: 'success' });
  };

  const tabCounts = [
    tasks.length,
    tasks.filter((t) => !adminNames.includes(t.assignedTo.name)).length,
    stats.adminTasks,
  ];

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      {/* ── Page Header ── */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        mb={3}
        gap={2}
      >
        <Box>
          <Typography variant="h5" fontWeight={700} color="#0f2a6e">
            Task List
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Manage and track all tasks assigned across your team
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate(paths.tasks.new)}
          sx={{
            bgcolor: '#1E58E6',
            borderRadius: '10px',
            textTransform: 'none',
            fontWeight: 600,
            px: 2.5,
            boxShadow: '0 4px 14px #1E58E630',
            '&:hover': { bgcolor: '#1A4CC4' },
          }}
        >
          Assign New Task
        </Button>
      </Stack>

      {/* ── Stats Row ── */}
      <Grid container spacing={2} mb={3}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard label="Total Tasks" value={stats.total} color="#1E58E6" icon={<AssignIcon />} />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard
            label="Pending"
            value={stats.pending}
            color="#1565c0"
            icon={<PendingActions />}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard
            label="In Progress"
            value={stats.inProgress}
            color="#e65100"
            icon={<HourglassEmpty />}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard
            label="Completed"
            value={stats.done}
            color="#2e7d32"
            icon={<CheckCircleOutline />}
          />
        </Grid>
      </Grid>

      {/* ── Main Card ── */}
      <Card
        elevation={0}
        sx={{ border: '1px solid #d0e0ff', borderRadius: '14px', overflow: 'hidden' }}
      >
        {/* ── Tabs ── */}
        <Box sx={{ borderBottom: '1px solid #e8f0ff', px: 2, bgcolor: '#f8fbff' }}>
          <Tabs
            value={tabValue}
            onChange={(_, v) => setTabValue(v)}
            sx={{
              '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, minHeight: 48 },
              '& .Mui-selected': { color: '#1E58E6' },
              '& .MuiTabs-indicator': {
                bgcolor: '#1E58E6',
                height: 3,
                borderRadius: '3px 3px 0 0',
              },
            }}
          >
            {['All Tasks', 'Developer Tasks', 'Admin Tasks'].map((label, i) => (
              <Tab
                key={label}
                label={
                  <Stack direction="row" alignItems="center" gap={0.8}>
                    {label}
                    <Box
                      sx={{
                        minWidth: 20,
                        height: 20,
                        borderRadius: '10px',
                        bgcolor: tabValue === i ? '#1E58E6' : '#e0e9ff',
                        color: tabValue === i ? 'white' : '#4a6fa5',
                        fontSize: 11,
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        px: 0.6,
                      }}
                    >
                      {tabCounts[i]}
                    </Box>
                  </Stack>
                }
              />
            ))}
          </Tabs>
        </Box>

        {/* ── Filters ── */}
        <Box sx={{ p: 2, bgcolor: '#f8fbff', borderBottom: '1px solid #e8f0ff' }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} gap={1.5} flexWrap="wrap">
            <TextField
              placeholder="Search tasks, assignee, project…"
              size="small"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ flex: 1, minWidth: 200 }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#4a6fa5', fontSize: 18 }} />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={filterStatus}
                label="Status"
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                {['All', 'Pending', 'In progress', 'Done'].map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Priority</InputLabel>
              <Select
                value={filterPriority}
                label="Priority"
                onChange={(e) => setFilterPriority(e.target.value)}
              >
                {['All', 'High', 'Medium', 'Low'].map((p) => (
                  <MenuItem key={p} value={p}>
                    {p}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Assignee</InputLabel>
              <Select
                value={filterAssignee}
                label="Assignee"
                onChange={(e) => setFilterAssignee(e.target.value)}
              >
                <MenuItem value="All">All Assignees</MenuItem>
                {mockEmployees.map((e) => (
                  <MenuItem key={e.id} value={e.name}>
                    {e.name}
                  </MenuItem>
                ))}
                {ADMIN_LIST.map((a) => (
                  <MenuItem key={a.id} value={a.name}>
                    {a.name} (Admin)
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </Box>

        {/* ── Table ── */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f0f6ff' }}>
                {[
                  'Task Title',
                  'Project',
                  'Assigned To',
                  'Priority',
                  'Due Date',
                  'Status',
                  'Actions',
                ].map((h) => (
                  <TableCell
                    key={h}
                    sx={{
                      fontWeight: 700,
                      color: '#1a3a7a',
                      fontSize: 12,
                      py: 1.5,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <Stack alignItems="center" gap={1}>
                      <AssignIcon sx={{ fontSize: 48, color: '#c8dbff' }} />
                      <Typography color="text.secondary" fontWeight={600}>
                        No tasks found
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Try adjusting your filters or assign a new task
                      </Typography>
                    </Stack>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTasks.map((task) => {
                  const isAdmin = adminNames.includes(task.assignedTo.name);
                  const statusStyle = getStatusColor(task.status);
                  const overdue = new Date(task.dueDate) < new Date() && task.status !== 'Done';

                  return (
                    <TableRow
                      key={task.id}
                      sx={{
                        '&:hover': { bgcolor: '#f8fbff' },
                        borderBottom: '1px solid #eef3ff',
                        transition: 'background 0.15s',
                      }}
                    >
                      {/* Title */}
                      <TableCell sx={{ maxWidth: 200 }}>
                        <Stack direction="row" alignItems="center" gap={1}>
                          <Box
                            sx={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              bgcolor: isAdmin ? '#7c3aed' : '#1E58E6',
                              flexShrink: 0,
                            }}
                          />
                          <Typography
                            variant="body2"
                            fontWeight={600}
                            color="#0f2a6e"
                            sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              maxWidth: 160,
                            }}
                          >
                            {task.title}
                          </Typography>
                        </Stack>
                      </TableCell>

                      {/* Project */}
                      <TableCell>
                        <Typography variant="caption" color="text.secondary" fontWeight={500}>
                          {projectMap[task.projectId] || '—'}
                        </Typography>
                      </TableCell>

                      {/* Assigned To */}
                      <TableCell>
                        <Stack direction="row" alignItems="center" gap={1}>
                          <Avatar
                            sx={{
                              width: 28,
                              height: 28,
                              fontSize: 11,
                              fontWeight: 700,
                              bgcolor: getAvatarColor(task.assignedTo.name),
                            }}
                          >
                            {initials(task.assignedTo.name)}
                          </Avatar>
                          <Box>
                            <Stack direction="row" alignItems="center" gap={0.5}>
                              <Typography variant="caption" fontWeight={600} color="#0f2a6e">
                                {task.assignedTo.name}
                              </Typography>
                              {isAdmin && (
                                <Chip
                                  label="Admin"
                                  size="small"
                                  sx={{
                                    height: 16,
                                    fontSize: 10,
                                    bgcolor: '#f3e8ff',
                                    color: '#7c3aed',
                                    fontWeight: 700,
                                    '& .MuiChip-label': { px: 0.8 },
                                  }}
                                />
                              )}
                            </Stack>
                          </Box>
                        </Stack>
                      </TableCell>

                      {/* Priority */}
                      <TableCell>
                        <Chip
                          label={task.priority}
                          size="small"
                          color={getPriorityColor(task.priority)}
                          variant="outlined"
                          sx={{ fontWeight: 700, fontSize: 11 }}
                        />
                      </TableCell>

                      {/* Due Date */}
                      <TableCell>
                        <Typography
                          variant="caption"
                          fontWeight={600}
                          sx={{ color: overdue ? '#c62828' : '#455a64' }}
                        >
                          {overdue && '⚠ '}
                          {new Date(task.dueDate).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </Typography>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <Select
                          value={task.status}
                          size="small"
                          onChange={(e) =>
                            handleStatusChange(task.id, e.target.value as Task['status'])
                          }
                          renderValue={(v) => (
                            <Stack direction="row" alignItems="center" gap={0.6}>
                              <Box sx={{ color: statusStyle.color, display: 'flex' }}>
                                {getStatusIcon(v)}
                              </Box>
                              <Typography
                                variant="caption"
                                fontWeight={700}
                                sx={{ color: statusStyle.color }}
                              >
                                {v}
                              </Typography>
                            </Stack>
                          )}
                          sx={{
                            fontSize: 12,
                            bgcolor: statusStyle.bg,
                            border: `1px solid ${statusStyle.border}`,
                            borderRadius: '8px',
                            '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                            '& .MuiSelect-icon': { color: statusStyle.color },
                            minWidth: 120,
                          }}
                        >
                          {['Pending', 'In progress', 'Done'].map((s) => (
                            <MenuItem key={s} value={s}>
                              <Stack direction="row" alignItems="center" gap={1}>
                                <Box sx={{ color: getStatusColor(s).color, display: 'flex' }}>
                                  {getStatusIcon(s)}
                                </Box>
                                {s}
                              </Stack>
                            </MenuItem>
                          ))}
                        </Select>
                      </TableCell>

                      {/* Actions */}
                      <TableCell>
                        <Stack direction="row" gap={0.5}>
                          <Tooltip title="Assign to Admin">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedTask(task);
                                setAssignDialogOpen(true);
                              }}
                              sx={{
                                color: '#7c3aed',
                                bgcolor: '#f3e8ff',
                                '&:hover': { bgcolor: '#ede0ff' },
                                width: 30,
                                height: 30,
                              }}
                            >
                              <AssignIcon sx={{ fontSize: 15 }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit Task">
                            <IconButton
                              size="small"
                              onClick={() => navigate(paths.tasks.edit.replace(':taskId', task.id))}
                              sx={{
                                color: '#1E58E6',
                                bgcolor: '#e6f0ff',
                                '&:hover': { bgcolor: '#ccdeff' },
                                width: 30,
                                height: 30,
                              }}
                            >
                              <EditIcon sx={{ fontSize: 15 }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Task">
                            <IconButton
                              size="small"
                              onClick={() => setDeleteConfirmId(task.id)}
                              sx={{
                                color: '#c62828',
                                bgcolor: '#ffebee',
                                '&:hover': { bgcolor: '#ffcdd2' },
                                width: 30,
                                height: 30,
                              }}
                            >
                              <DeleteIcon sx={{ fontSize: 15 }} />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* ── Table Footer ── */}
        <Box
          sx={{
            px: 3,
            py: 1.5,
            bgcolor: '#f8fbff',
            borderTop: '1px solid #e8f0ff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="caption" color="text.secondary">
            Showing <strong>{filteredTasks.length}</strong> of <strong>{tasks.length}</strong> tasks
          </Typography>
          <Stack direction="row" gap={1}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#1E58E6' }} />
              <Typography variant="caption" color="text.secondary">
                Developer
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#7c3aed' }} />
              <Typography variant="caption" color="text.secondary">
                Admin
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Card>

      {/* ── Assign to Admin Dialog ── */}
      <AssignToAdminDialog
        open={assignDialogOpen}
        task={selectedTask}
        onClose={() => {
          setAssignDialogOpen(false);
          setSelectedTask(null);
        }}
        onConfirm={handleAssignToAdmin}
      />

      {/* ── Delete Confirm Dialog ── */}
      <Dialog
        open={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: { sx: { borderRadius: '16px' } },
        }}
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" gap={1}>
            <DeleteIcon sx={{ color: '#c62828' }} />
            <Typography fontWeight={700}>Delete Task</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to delete this task? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button
            variant="outlined"
            onClick={() => setDeleteConfirmId(null)}
            sx={{ borderRadius: '8px', textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
            sx={{ borderRadius: '8px', textTransform: 'none' }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Snackbar ── */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
          sx={{ borderRadius: '10px' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminTaskList;
