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

// ─── fieldSx for dialogs (consistent styling) ────────────────────────────────
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

// ─── Component ────────────────────────────────────────────────────────────────
const ProjectDetailPage = () => {
  const navigate = useNavigate();
  const project = STATIC_PROJECT;

  const [links, setLinks] = useState(STATIC_LINKS);
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<any>(null);
  const [linkForm, setLinkForm] = useState({ linkTitle: '', linkUrl: '' });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

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

          <Grid container spacing={2}>
            {[
              { icon: <PersonIcon sx={{ fontSize: 16 }} />, label: 'Client', value: project.clientName },
              { icon: <CalendarIcon sx={{ fontSize: 16 }} />, label: 'Created', value: formatDate(project.createdAt) },
              { icon: <CalendarIcon sx={{ fontSize: 16 }} />, label: 'Updated', value: formatDate(project.updatedAt) },
              { icon: <PersonIcon sx={{ fontSize: 16 }} />, label: 'Created by', value: project.createdBy },
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

      {/* ── Main Content (full width, no Tasks column) ── */}
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12 }}>
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
