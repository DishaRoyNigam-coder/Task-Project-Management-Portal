// src/pages/Admin/projects/ProjectListPage.tsx
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  AccessTime as AccessTimeIcon,
  Add as AddIcon,
  ArrowDownward as ArrowDownIcon,
  ArrowUpward as ArrowUpIcon,
  CheckCircleOutline as CheckCircleIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  FilterList as FilterListIcon,
  FolderOpen as FolderOpenIcon,
  Layers as LayersIcon,
  Link as LinkIcon,
  Search as SearchIcon,
  UnfoldMore as SortDefaultIcon,
  Visibility as VisibilityIcon,
  Warning as WarningIcon,
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
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useProjects } from 'context/ProjectContext';
import paths from 'routes/paths';

// ─── Theme tokens (matches every other page) ──────────────────────────────────
const PRIMARY_BLUE = '#1E58E6';
const PRIMARY_BLUE_DARK = '#1A4CC4';
const PRIMARY_BLUE_LIGHT = '#E6F0FF';

// ─── Phase / Status config ────────────────────────────────────────────────────
type Phase = 'Planning' | 'Development' | 'Testing' | 'Deployment' | 'Maintenance';
type Status = 'Active' | 'Completed' | 'Archived';

const PHASE_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  Planning: { bg: '#ede9fe', color: '#6d28d9', border: '#c4b5fd' },
  Development: { bg: PRIMARY_BLUE_LIGHT, color: PRIMARY_BLUE, border: '#93c5fd' },
  Testing: { bg: '#fef3c7', color: '#b45309', border: '#fcd34d' },
  Deployment: { bg: '#fee2e2', color: '#991b1b', border: '#fca5a5' },
  Maintenance: { bg: '#d1fae5', color: '#065f46', border: '#6ee7b7' },
};

const STATUS_STYLE: Record<string, { bg: string; color: string; dot: string; border: string }> = {
  Active: { bg: '#d1fae5', color: '#065f46', dot: '#10b981', border: '#6ee7b7' },
  Completed: { bg: PRIMARY_BLUE_LIGHT, color: PRIMARY_BLUE, dot: PRIMARY_BLUE, border: '#93c5fd' },
  Archived: { bg: '#f3f4f6', color: '#6b7280', dot: '#9ca3af', border: '#d1d5db' },
};

// ─── Avatar colour palette (deterministic from initials) ─────────────────────
const AVATAR_COLORS = [
  '#1E58E6',
  '#7c3aed',
  '#059669',
  '#dc2626',
  '#0891b2',
  '#b45309',
  '#ec4899',
  '#0ea5e9',
];
const avatarColor = (name: string) => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

const getInitials = (name: string) =>
  name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

// ─── Mock projects (used until real context data is available) ────────────────
const MOCK_PROJECTS = [
  {
    id: 'proj_1',
    projectName: 'E-Commerce Website Redesign',
    clientName: 'TechNova Solutions',
    projectPhase: 'Development' as Phase,
    status: 'Active' as Status,
    progress: 68,
    createdAt: '2026-01-12T09:00:00.000Z',
    deadline: '2026-04-30T00:00:00.000Z',
    createdBy: 'Admin',
    driveLink: '#',
    projectNotes: '',
    teamMembers: [
      { id: 1, name: 'Rahul Sharma', email: 'rahul@company.com' },
      { id: 2, name: 'Sneha Patel', email: 'sneha@company.com' },
      { id: 3, name: 'Arjun Mehta', email: 'arjun@company.com' },
      { id: 4, name: 'Kavya Reddy', email: 'kavya@company.com' },
      { id: 5, name: 'Nikhil Gupta', email: 'nikhil@company.com' },
    ],
  },
  {
    id: 'proj_2',
    projectName: 'CRM Portal Development',
    clientName: 'Greenfield Enterprises',
    projectPhase: 'Testing' as Phase,
    status: 'Active' as Status,
    progress: 85,
    createdAt: '2025-11-05T09:00:00.000Z',
    deadline: '2026-05-15T00:00:00.000Z',
    createdBy: 'Admin',
    driveLink: '#',
    projectNotes: '',
    teamMembers: [
      { id: 6, name: 'Meera Joshi', email: 'meera@company.com' },
      { id: 7, name: 'Priya Singh', email: 'priya@company.com' },
      { id: 8, name: 'Dev Kapoor', email: 'dev@company.com' },
    ],
  },
  {
    id: 'proj_3',
    projectName: 'Mobile Banking App',
    clientName: 'FinEdge Capital',
    projectPhase: 'Planning' as Phase,
    status: 'Archived' as Status,
    progress: 22,
    createdAt: '2026-03-01T09:00:00.000Z',
    deadline: '2026-08-31T00:00:00.000Z',
    createdBy: 'Admin',
    driveLink: '#',
    projectNotes: '',
    teamMembers: [
      { id: 9, name: 'Vijay Kumar', email: 'vijay@company.com' },
      { id: 10, name: 'Kiran Nair', email: 'kiran@company.com' },
      { id: 11, name: 'Neha Tiwari', email: 'neha@company.com' },
      { id: 12, name: 'Amit Verma', email: 'amit@company.com' },
    ],
  },
  {
    id: 'proj_4',
    projectName: 'HR Management System',
    clientName: 'Zenith Corp',
    projectPhase: 'Testing' as Phase,
    status: 'Active' as Status,
    progress: 91,
    createdAt: '2025-09-10T09:00:00.000Z',
    deadline: '2026-04-28T00:00:00.000Z',
    createdBy: 'Admin',
    driveLink: '#',
    projectNotes: '',
    teamMembers: [
      { id: 13, name: 'Deepika Rao', email: 'deepika@company.com' },
      { id: 14, name: 'Tarun Bhatia', email: 'tarun@company.com' },
    ],
  },
  {
    id: 'proj_5',
    projectName: 'Learning Management System',
    clientName: 'EduBridge Academy',
    projectPhase: 'Development' as Phase,
    status: 'Active' as Status,
    progress: 54,
    createdAt: '2026-02-20T09:00:00.000Z',
    deadline: '2026-07-30T00:00:00.000Z',
    createdBy: 'Admin',
    driveLink: '#',
    projectNotes: '',
    teamMembers: [
      { id: 15, name: 'Jasmeet Kaur', email: 'jasmeet@company.com' },
      { id: 16, name: 'Bhavna Das', email: 'bhavna@company.com' },
      { id: 17, name: 'Chirag Shah', email: 'chirag@company.com' },
    ],
  },
  {
    id: 'proj_6',
    projectName: 'Point of Sale System',
    clientName: 'RetailEdge Inc.',
    projectPhase: 'Deployment' as Phase,
    status: 'Completed' as Status,
    progress: 100,
    createdAt: '2025-07-15T09:00:00.000Z',
    deadline: '2026-01-10T00:00:00.000Z',
    createdBy: 'Admin',
    driveLink: '#',
    projectNotes: '',
    teamMembers: [
      { id: 18, name: 'Lakshmi Iyer', email: 'lakshmi@company.com' },
      { id: 19, name: 'Harish Nanda', email: 'harish@company.com' },
      { id: 20, name: 'Pooja Mishra', email: 'pooja@company.com' },
    ],
  },
  {
    id: 'proj_7',
    projectName: 'BI Analytics Dashboard',
    clientName: 'DataVision Analytics',
    projectPhase: 'Development' as Phase,
    status: 'Active' as Status,
    progress: 47,
    createdAt: '2026-01-03T09:00:00.000Z',
    deadline: '2026-06-15T00:00:00.000Z',
    createdBy: 'Admin',
    driveLink: '#',
    projectNotes: '',
    teamMembers: [
      { id: 21, name: 'Farhan Ali', email: 'farhan@company.com' },
      { id: 22, name: 'Geetanjali V', email: 'geeta@company.com' },
      { id: 23, name: 'Ishaan Roy', email: 'ishaan@company.com' },
      { id: 24, name: 'Juhi Saxena', email: 'juhi@company.com' },
    ],
  },
  {
    id: 'proj_8',
    projectName: 'Supply Chain Tracker',
    clientName: 'LogiFlow Systems',
    projectPhase: 'Planning' as Phase,
    status: 'Archived' as Status,
    progress: 15,
    createdAt: '2026-04-18T09:00:00.000Z',
    deadline: '2026-10-20T00:00:00.000Z',
    createdBy: 'Admin',
    driveLink: '#',
    projectNotes: '',
    teamMembers: [
      { id: 25, name: 'Om Prakash', email: 'om@company.com' },
      { id: 26, name: 'Qasim Raza', email: 'qasim@company.com' },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

const progressColor = (pct: number) => {
  if (pct >= 80) return '#10b981';
  if (pct >= 50) return PRIMARY_BLUE;
  if (pct >= 25) return '#f59e0b';
  return '#ef4444';
};

// ─── Summary Stat Card ────────────────────────────────────────────────────────
const StatCard = ({
  label,
  value,
  icon,
  iconBg,
  iconColor,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
}) => (
  <Card
    elevation={0}
    sx={{
      border: '1px solid #d0e0ff',
      borderRadius: '14px',
      height: '100%',
    }}
  >
    <CardContent sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2 }}>
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: '12px',
          backgroundColor: iconBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: iconColor,
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography sx={{ fontSize: '26px', fontWeight: 700, color: '#0f2a6e', lineHeight: 1 }}>
          {value}
        </Typography>
        <Typography sx={{ fontSize: '12.5px', color: '#4a6fa5', mt: 0.4 }}>{label}</Typography>
      </Box>
    </CardContent>
  </Card>
);

// ─── Sort icon helper ─────────────────────────────────────────────────────────
type SortDir = 'asc' | 'desc' | null;
const SortIcon = ({ dir }: { dir: SortDir }) => {
  if (dir === 'asc') return <ArrowUpIcon sx={{ fontSize: 14, ml: 0.5, opacity: 0.8 }} />;
  if (dir === 'desc') return <ArrowDownIcon sx={{ fontSize: 14, ml: 0.5, opacity: 0.8 }} />;
  return <SortDefaultIcon sx={{ fontSize: 14, ml: 0.5, opacity: 0.3 }} />;
};

// ─── Main Component ───────────────────────────────────────────────────────────
const ProjectListPage = () => {
  const navigate = useNavigate();

  // Pull from context; fall back to mock data if context is empty
  const { projects: ctxProjects, setProjects } = useProjects();
  const rawProjects = ctxProjects && ctxProjects.length > 0 ? ctxProjects : MOCK_PROJECTS;

  // ── Filter state ──
  const [search, setSearch] = useState('');
  const [phaseFilter, setPhaseFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // ── Sort state ──
  type SortField =
    | 'projectName'
    | 'clientName'
    | 'projectPhase'
    | 'status'
    | 'progress'
    | 'createdAt'
    | 'deadline';
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);

  // ── Delete dialog state ──
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string; name: string }>({
    open: false,
    id: '',
    name: '',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  // ── Filtered + sorted list ──
  const displayProjects = useMemo(() => {
    let list = rawProjects.filter((p) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q || p.projectName.toLowerCase().includes(q) || p.clientName.toLowerCase().includes(q);
      const matchPhase = !phaseFilter || p.projectPhase === phaseFilter;
      const matchStatus = !statusFilter || p.status === statusFilter;
      return matchSearch && matchPhase && matchStatus;
    });

    if (sortField && sortDir) {
      list = [...list].sort((a, b) => {
        let aVal: string | number = (a as any)[sortField] ?? '';
        let bVal: string | number = (b as any)[sortField] ?? '';
        if (sortField === 'progress') {
          aVal = Number(aVal);
          bVal = Number(bVal);
        }
        if (typeof aVal === 'string') aVal = aVal.toLowerCase();
        if (typeof bVal === 'string') bVal = bVal.toLowerCase();
        if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return list;
  }, [rawProjects, search, phaseFilter, statusFilter, sortField, sortDir]);

  // ── Summary counts ──
  const totalCount = rawProjects.length;
  const activeCount = rawProjects.filter((p) => p.status === 'Active').length;
  const archivedCount = rawProjects.filter((p) => p.status === 'Archived').length;
  const completedCount = rawProjects.filter((p) => p.status === 'Completed').length;

  // ── Sort handler ──
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : prev === 'desc' ? null : 'asc'));
      if (sortDir === 'desc') setSortField(null);
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  // ── Delete handlers ──
  const confirmDelete = (id: string, name: string) => setDeleteDialog({ open: true, id, name });
  const handleDelete = () => {
    setProjects((prev: any[]) => prev.filter((p) => p.id !== deleteDialog.id));
    setSnackbar({
      open: true,
      message: `"${deleteDialog.name}" deleted successfully`,
      severity: 'success',
    });
    setDeleteDialog({ open: false, id: '', name: '' });
  };

  // ── Reset filters ──
  const resetFilters = () => {
    setSearch('');
    setPhaseFilter('');
    setStatusFilter('');
  };

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* ── Page Header ── */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography
            variant="h5"
            sx={{ fontWeight: 700, color: '#0f2a6e', fontSize: { xs: '1.2rem', md: '1.4rem' } }}
          >
            All Projects
          </Typography>
          <Typography variant="body2" sx={{ color: '#4a6fa5', mt: 0.4 }}>
            Overview of all client projects and their current status
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate(paths.projects?.new || '/')}
          sx={{
            backgroundColor: PRIMARY_BLUE,
            borderRadius: '10px',
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '14px',
            px: 2.5,
            py: 1,
            boxShadow: `0 4px 12px ${PRIMARY_BLUE}40`,
            whiteSpace: 'nowrap',
            '&:hover': {
              backgroundColor: PRIMARY_BLUE_DARK,
              boxShadow: `0 6px 16px ${PRIMARY_BLUE}55`,
            },
          }}
        >
          Create New Project
        </Button>
      </Stack>

      {/* ── Summary Stats ── */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard
            label="Total Projects"
            value={totalCount}
            icon={<LayersIcon />}
            iconBg="#dbeafe"
            iconColor={PRIMARY_BLUE}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard
            label="Active Projects"
            value={activeCount}
            icon={<CheckCircleIcon />}
            iconBg="#d1fae5"
            iconColor="#059669"
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard
            label="Archived"
            value={archivedCount}
            icon={<AccessTimeIcon />}
            iconBg="#fef3c7"
            iconColor="#b45309"
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard
            label="Completed"
            value={completedCount}
            icon={<WarningIcon />}
            iconBg="#ede9fe"
            iconColor="#7c3aed"
          />
        </Grid>
      </Grid>

      {/* ── Filter Toolbar ── */}
      <Card
        elevation={0}
        sx={{
          border: '1px solid #d0e0ff',
          borderRadius: '14px',
          mb: 2.5,
        }}
      >
        <CardContent sx={{ p: 2 }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            alignItems={{ xs: 'stretch', sm: 'center' }}
            flexWrap="wrap"
          >
            {/* Label */}
            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: '#4a6fa5' }}>
              <FilterListIcon sx={{ fontSize: 18 }} />
              <Typography
                sx={{ fontSize: '13px', fontWeight: 600, color: '#4a6fa5', whiteSpace: 'nowrap' }}
              >
                Filter:
              </Typography>
            </Stack>

            {/* Search */}
            <TextField
              placeholder="Search project or client…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 18, color: '#4a6fa5' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                flex: 1,
                minWidth: 200,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: PRIMARY_BLUE_LIGHT,
                  borderRadius: '8px',
                  fontSize: '13px',
                  '& fieldset': { borderColor: '#d0e0ff' },
                  '&:hover fieldset': { borderColor: PRIMARY_BLUE },
                  '&.Mui-focused fieldset': { borderColor: PRIMARY_BLUE },
                },
              }}
            />

            {/* Phase filter */}
            <FormControl
              size="small"
              sx={{
                minWidth: 150,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: PRIMARY_BLUE_LIGHT,
                  borderRadius: '8px',
                  fontSize: '13px',
                  '& fieldset': { borderColor: '#d0e0ff' },
                  '&:hover fieldset': { borderColor: PRIMARY_BLUE },
                  '&.Mui-focused fieldset': { borderColor: PRIMARY_BLUE },
                },
                '& .MuiInputLabel-root': { color: '#4a6fa5', fontSize: '13px' },
              }}
            >
              <InputLabel>Phase</InputLabel>
              <Select
                value={phaseFilter}
                label="Phase"
                onChange={(e) => setPhaseFilter(e.target.value)}
              >
                <MenuItem value="">All Phases</MenuItem>
                {['Planning', 'Development', 'Testing', 'Deployment', 'Maintenance'].map((p) => (
                  <MenuItem key={p} value={p}>
                    {p}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Status filter */}
            <FormControl
              size="small"
              sx={{
                minWidth: 150,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: PRIMARY_BLUE_LIGHT,
                  borderRadius: '8px',
                  fontSize: '13px',
                  '& fieldset': { borderColor: '#d0e0ff' },
                  '&:hover fieldset': { borderColor: PRIMARY_BLUE },
                  '&.Mui-focused fieldset': { borderColor: PRIMARY_BLUE },
                },
                '& .MuiInputLabel-root': { color: '#4a6fa5', fontSize: '13px' },
              }}
            >
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="">All Status</MenuItem>
                {['Active', 'Completed', 'Archived'].map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Reset */}
            <Button
              variant="text"
              onClick={resetFilters}
              sx={{
                color: '#4a6fa5',
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '13px',
                borderRadius: '8px',
                px: 1.5,
                whiteSpace: 'nowrap',
                '&:hover': { backgroundColor: PRIMARY_BLUE_LIGHT, color: PRIMARY_BLUE },
              }}
            >
              Reset
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* ── Project Table ── */}
      <Card
        elevation={0}
        sx={{ border: '1px solid #d0e0ff', borderRadius: '14px', overflow: 'hidden' }}
      >
        {/* Table header bar */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ px: 2.5, py: 1.75, borderBottom: '1px solid #d0e0ff' }}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <FolderOpenIcon sx={{ color: PRIMARY_BLUE, fontSize: 20 }} />
            <Typography sx={{ fontWeight: 700, color: '#0f2a6e', fontSize: '15px' }}>
              Project Directory
            </Typography>
          </Stack>
          <Chip
            label={`${displayProjects.length} Project${displayProjects.length !== 1 ? 's' : ''}`}
            size="small"
            sx={{
              backgroundColor: PRIMARY_BLUE_LIGHT,
              color: PRIMARY_BLUE,
              fontWeight: 700,
              borderRadius: '20px',
              fontSize: '12px',
            }}
          />
        </Stack>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f8faff' }}>
                {/* # */}
                <TableCell
                  sx={{
                    fontWeight: 700,
                    fontSize: '11.5px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    color: '#4a6fa5',
                    borderBottom: '1px solid #d0e0ff',
                    pl: 3,
                    width: 48,
                  }}
                >
                  #
                </TableCell>

                {/* Sortable columns */}
                {(
                  [
                    { field: 'projectName' as SortField, label: 'Project' },
                    { field: 'clientName' as SortField, label: 'Client' },
                  ] as const
                ).map(({ field, label }) => (
                  <TableCell
                    key={field}
                    onClick={() => handleSort(field)}
                    sx={{
                      fontWeight: 700,
                      fontSize: '11.5px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      color: sortField === field ? PRIMARY_BLUE : '#4a6fa5',
                      borderBottom: '1px solid #d0e0ff',
                      cursor: 'pointer',
                      userSelect: 'none',
                      '&:hover': { color: PRIMARY_BLUE },
                    }}
                  >
                    <Stack direction="row" alignItems="center">
                      {label}
                      <SortIcon dir={sortField === field ? sortDir : null} />
                    </Stack>
                  </TableCell>
                ))}

                {/* Team */}
                <TableCell
                  sx={{
                    fontWeight: 700,
                    fontSize: '11.5px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    color: '#4a6fa5',
                    borderBottom: '1px solid #d0e0ff',
                  }}
                >
                  Team
                </TableCell>

                {/* Phase sortable */}
                <TableCell
                  onClick={() => handleSort('projectPhase')}
                  sx={{
                    fontWeight: 700,
                    fontSize: '11.5px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    color: sortField === 'projectPhase' ? PRIMARY_BLUE : '#4a6fa5',
                    borderBottom: '1px solid #d0e0ff',
                    cursor: 'pointer',
                    userSelect: 'none',
                    '&:hover': { color: PRIMARY_BLUE },
                  }}
                >
                  <Stack direction="row" alignItems="center">
                    Phase
                    <SortIcon dir={sortField === 'projectPhase' ? sortDir : null} />
                  </Stack>
                </TableCell>

                {/* Status sortable */}
                <TableCell
                  onClick={() => handleSort('status')}
                  sx={{
                    fontWeight: 700,
                    fontSize: '11.5px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    color: sortField === 'status' ? PRIMARY_BLUE : '#4a6fa5',
                    borderBottom: '1px solid #d0e0ff',
                    cursor: 'pointer',
                    userSelect: 'none',
                    '&:hover': { color: PRIMARY_BLUE },
                  }}
                >
                  <Stack direction="row" alignItems="center">
                    Status
                    <SortIcon dir={sortField === 'status' ? sortDir : null} />
                  </Stack>
                </TableCell>

                {/* Progress sortable */}
                <TableCell
                  onClick={() => handleSort('progress')}
                  sx={{
                    fontWeight: 700,
                    fontSize: '11.5px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    color: sortField === 'progress' ? PRIMARY_BLUE : '#4a6fa5',
                    borderBottom: '1px solid #d0e0ff',
                    cursor: 'pointer',
                    userSelect: 'none',
                    '&:hover': { color: PRIMARY_BLUE },
                    minWidth: 120,
                  }}
                >
                  <Stack direction="row" alignItems="center">
                    Progress
                    <SortIcon dir={sortField === 'progress' ? sortDir : null} />
                  </Stack>
                </TableCell>

                {/* Dates */}
                <TableCell
                  onClick={() => handleSort('createdAt')}
                  sx={{
                    fontWeight: 700,
                    fontSize: '11.5px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    color: sortField === 'createdAt' ? PRIMARY_BLUE : '#4a6fa5',
                    borderBottom: '1px solid #d0e0ff',
                    cursor: 'pointer',
                    userSelect: 'none',
                    '&:hover': { color: PRIMARY_BLUE },
                    whiteSpace: 'nowrap',
                  }}
                >
                  <Stack direction="row" alignItems="center">
                    Start Date
                    <SortIcon dir={sortField === 'createdAt' ? sortDir : null} />
                  </Stack>
                </TableCell>

                <TableCell
                  onClick={() => handleSort('deadline')}
                  sx={{
                    fontWeight: 700,
                    fontSize: '11.5px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    color: sortField === 'deadline' ? PRIMARY_BLUE : '#4a6fa5',
                    borderBottom: '1px solid #d0e0ff',
                    cursor: 'pointer',
                    userSelect: 'none',
                    '&:hover': { color: PRIMARY_BLUE },
                    whiteSpace: 'nowrap',
                  }}
                >
                  <Stack direction="row" alignItems="center">
                    Deadline
                    <SortIcon dir={sortField === 'deadline' ? sortDir : null} />
                  </Stack>
                </TableCell>

                {/* Actions */}
                <TableCell
                  align="center"
                  sx={{
                    fontWeight: 700,
                    fontSize: '11.5px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    color: '#4a6fa5',
                    borderBottom: '1px solid #d0e0ff',
                    pr: 3,
                  }}
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {displayProjects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 6 }}>
                    <Box sx={{ color: '#4a6fa5' }}>
                      <FolderOpenIcon
                        sx={{ fontSize: 48, opacity: 0.3, display: 'block', mx: 'auto', mb: 1 }}
                      />
                      <Typography sx={{ fontSize: '14px', fontWeight: 500 }}>
                        No projects match your filters
                      </Typography>
                      <Button
                        onClick={resetFilters}
                        sx={{
                          mt: 1,
                          fontSize: '12.5px',
                          color: PRIMARY_BLUE,
                          textTransform: 'none',
                          fontWeight: 600,
                        }}
                      >
                        Clear all filters
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                displayProjects.map((project, idx) => {
                  const phase = PHASE_STYLE[project.projectPhase] || PHASE_STYLE.Planning;
                  const status = STATUS_STYLE[project.status] || STATUS_STYLE.Archived;
                  const prog = (project as any).progress ?? 0;

                  return (
                    <TableRow
                      key={project.id}
                      sx={{
                        borderBottom: '1px solid #f0f4ff',
                        transition: 'background 0.12s',
                        '&:hover': { backgroundColor: '#f8faff' },
                        '&:last-child td': { borderBottom: 0 },
                      }}
                    >
                      {/* # */}
                      <TableCell
                        sx={{ pl: 3, color: '#9ca3af', fontSize: '12.5px', fontWeight: 500 }}
                      >
                        {String(idx + 1).padStart(2, '0')}
                      </TableCell>

                      {/* Project name + avatar */}
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                          <Avatar
                            sx={{
                              width: 36,
                              height: 36,
                              fontSize: '12px',
                              fontWeight: 700,
                              borderRadius: '10px',
                              backgroundColor: avatarColor(project.projectName),
                              flexShrink: 0,
                            }}
                          >
                            {getInitials(project.projectName)}
                          </Avatar>
                          <Box>
                            <Typography
                              sx={{
                                fontSize: '13.5px',
                                fontWeight: 600,
                                color: '#0f2a6e',
                                lineHeight: 1.3,
                                cursor: 'pointer',
                                '&:hover': { color: PRIMARY_BLUE, textDecoration: 'underline' },
                              }}
                              onClick={() =>
                                navigate(`${paths.projects?.detail || '/'}/${project.id}`)
                              }
                            >
                              {project.projectName}
                            </Typography>
                            <Typography sx={{ fontSize: '11.5px', color: '#4a6fa5', mt: 0.2 }}>
                              ID: {project.id}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>

                      {/* Client */}
                      <TableCell>
                        <Typography sx={{ fontSize: '13px', color: '#374151', fontWeight: 500 }}>
                          {project.clientName}
                        </Typography>
                      </TableCell>

                      {/* Team */}
                      <TableCell>
                        <AvatarGroup
                          max={4}
                          sx={{
                            justifyContent: 'flex-start',
                            '& .MuiAvatar-root': {
                              width: 28,
                              height: 28,
                              fontSize: '11px',
                              fontWeight: 700,
                              border: '2px solid #fff',
                            },
                            '& .MuiAvatarGroup-avatar': {
                              backgroundColor: '#e5e7eb',
                              color: '#4a6fa5',
                              fontSize: '10px',
                              fontWeight: 700,
                            },
                          }}
                        >
                          {project.teamMembers.map((m) => (
                            <Tooltip key={m.id} title={m.name} arrow>
                              <Avatar
                                sx={{
                                  backgroundColor: avatarColor(m.name),
                                  fontSize: '11px',
                                  fontWeight: 700,
                                }}
                              >
                                {getInitials(m.name)}
                              </Avatar>
                            </Tooltip>
                          ))}
                        </AvatarGroup>
                      </TableCell>

                      {/* Phase */}
                      <TableCell>
                        <Chip
                          label={project.projectPhase}
                          size="small"
                          sx={{
                            backgroundColor: phase.bg,
                            color: phase.color,
                            border: `1px solid ${phase.border}`,
                            fontWeight: 600,
                            fontSize: '11.5px',
                            borderRadius: '8px',
                            height: 24,
                          }}
                        />
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={0.75}>
                          <Box
                            sx={{
                              width: 7,
                              height: 7,
                              borderRadius: '50%',
                              backgroundColor: status.dot,
                              flexShrink: 0,
                            }}
                          />
                          <Chip
                            label={project.status}
                            size="small"
                            sx={{
                              backgroundColor: status.bg,
                              color: status.color,
                              border: `1px solid ${status.border}`,
                              fontWeight: 600,
                              fontSize: '11.5px',
                              borderRadius: '8px',
                              height: 24,
                            }}
                          />
                        </Stack>
                      </TableCell>

                      {/* Progress */}
                      <TableCell sx={{ minWidth: 120 }}>
                        <Box>
                          <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                            <Typography sx={{ fontSize: '11px', color: '#4a6fa5' }}>
                              Progress
                            </Typography>
                            <Typography
                              sx={{ fontSize: '11px', fontWeight: 700, color: progressColor(prog) }}
                            >
                              {prog}%
                            </Typography>
                          </Stack>
                          <LinearProgress
                            variant="determinate"
                            value={prog}
                            sx={{
                              height: 6,
                              borderRadius: 4,
                              backgroundColor: '#e5e7eb',
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: progressColor(prog),
                                borderRadius: 4,
                              },
                            }}
                          />
                        </Box>
                      </TableCell>

                      {/* Start date */}
                      <TableCell>
                        <Typography
                          sx={{ fontSize: '12.5px', color: '#374151', whiteSpace: 'nowrap' }}
                        >
                          {formatDate(project.createdAt)}
                        </Typography>
                      </TableCell>

                      {/* Deadline */}
                      <TableCell>
                        {(project as any).deadline ? (
                          <Typography
                            sx={{
                              fontSize: '12.5px',
                              whiteSpace: 'nowrap',
                              color:
                                project.status !== 'Completed' &&
                                new Date((project as any).deadline) < new Date()
                                  ? '#dc2626'
                                  : '#374151',
                              fontWeight:
                                project.status !== 'Completed' &&
                                new Date((project as any).deadline) < new Date()
                                  ? 600
                                  : 400,
                            }}
                          >
                            {formatDate((project as any).deadline)}
                          </Typography>
                        ) : (
                          <Typography sx={{ fontSize: '12.5px', color: '#9ca3af' }}>—</Typography>
                        )}
                      </TableCell>

                      {/* Actions */}
                      <TableCell align="center" sx={{ pr: 3 }}>
                        <Stack direction="row" spacing={0.75} justifyContent="center">
                          {/* View */}
                          <Tooltip title="View Detail" arrow>
                            <IconButton
                              size="small"
                              onClick={() =>
                                navigate(`${paths.projects?.detail || '/'}/${project.id}`)
                              }
                              sx={{
                                width: 30,
                                height: 30,
                                borderRadius: '8px',
                                backgroundColor: '#dbeafe',
                                color: PRIMARY_BLUE,
                                '&:hover': { backgroundColor: '#bfdbfe' },
                              }}
                            >
                              <VisibilityIcon sx={{ fontSize: 15 }} />
                            </IconButton>
                          </Tooltip>

                          {/* Edit */}
                          <Tooltip title="Edit Project" arrow>
                            <IconButton
                              size="small"
                              onClick={() =>
                                navigate(`${paths.projects?.edit || '/'}/${project.id}`)
                              }
                              sx={{
                                width: 30,
                                height: 30,
                                borderRadius: '8px',
                                backgroundColor: '#d1fae5',
                                color: '#059669',
                                '&:hover': { backgroundColor: '#a7f3d0' },
                              }}
                            >
                              <EditIcon sx={{ fontSize: 15 }} />
                            </IconButton>
                          </Tooltip>

                          {/* Links */}
                          <Tooltip title="Links & Notes" arrow>
                            <IconButton
                              size="small"
                              onClick={() =>
                                navigate(`${paths.projects?.links || '/'}/${project.id}`)
                              }
                              sx={{
                                width: 30,
                                height: 30,
                                borderRadius: '8px',
                                backgroundColor: '#ede9fe',
                                color: '#7c3aed',
                                '&:hover': { backgroundColor: '#ddd6fe' },
                              }}
                            >
                              <LinkIcon sx={{ fontSize: 15 }} />
                            </IconButton>
                          </Tooltip>

                          {/* Delete */}
                          <Tooltip title="Delete Project" arrow>
                            <IconButton
                              size="small"
                              onClick={() => confirmDelete(project.id, project.projectName)}
                              sx={{
                                width: 30,
                                height: 30,
                                borderRadius: '8px',
                                backgroundColor: '#fee2e2',
                                color: '#dc2626',
                                '&:hover': { backgroundColor: '#fecaca' },
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

        {/* Table footer */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{
            px: 2.5,
            py: 1.5,
            borderTop: '1px solid #d0e0ff',
            backgroundColor: '#f8faff',
          }}
        >
          <Typography sx={{ fontSize: '12.5px', color: '#4a6fa5' }}>
            Showing{' '}
            <Box component="span" sx={{ fontWeight: 700, color: '#0f2a6e' }}>
              {displayProjects.length}
            </Box>{' '}
            of{' '}
            <Box component="span" sx={{ fontWeight: 700, color: '#0f2a6e' }}>
              {rawProjects.length}
            </Box>{' '}
            projects
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={() => navigate(paths.projects?.new || '/')}
            startIcon={<AddIcon sx={{ fontSize: '14px !important' }} />}
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
            Add Project
          </Button>
        </Stack>
      </Card>

      {/* ── Delete Confirmation Dialog ── */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: '', name: '' })}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: { borderRadius: '14px', border: '1px solid #d0e0ff' },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: '#0f2a6e', pb: 1 }}>Delete Project</DialogTitle>
        <Divider sx={{ borderColor: '#d0e0ff' }} />
        <DialogContent sx={{ pt: 2 }}>
          <Typography sx={{ color: '#374151', fontSize: '14px' }}>
            Are you sure you want to delete{' '}
            <Box component="span" sx={{ fontWeight: 700, color: '#dc2626' }}>
              "{deleteDialog.name}"
            </Box>
            ? This action cannot be undone.
          </Typography>
        </DialogContent>
        <Divider sx={{ borderColor: '#d0e0ff' }} />
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button
            onClick={() => setDeleteDialog({ open: false, id: '', name: '' })}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 600,
              color: '#4a6fa5',
              border: '1.5px solid #d0e0ff',
              '&:hover': { backgroundColor: '#f8faff' },
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleDelete}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 600,
              backgroundColor: '#dc2626',
              boxShadow: '0 3px 10px rgba(220,38,38,.3)',
              '&:hover': { backgroundColor: '#b91c1c' },
            }}
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

export default ProjectListPage;
