// src/pages/projects/ProjectDetailPage.tsx
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  FolderOpen as FolderIcon,
  Link as LinkIcon,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useProjects } from 'context/ProjectContext';
import { useTasks } from 'context/TaskContext';
import paths from 'routes/paths';

// Helper to format date

// Helper to get a color for link icons based on URL content
const getLinkColor = (url: string) => {
  if (url.includes('figma')) return '#1e88e5';
  if (url.includes('staging')) return '#43a047';
  if (url.includes('api')) return '#fb8c00';
  if (url.includes('notion')) return '#7b1fa2';
  return '#546e7a';
};

const ProjectDetailPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { projects, links, addLink, updateLink, deleteLink } = useProjects();
  const { tasks, updateTask } = useTasks();

  const project = projects.find((p) => p.id === projectId);
  const projectLinks = links.filter((link) => link.projectId === projectId);
  const projectTasks = tasks.filter((task) => task.projectId === projectId);

  // State for link modal
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<any>(null);
  const [linkForm, setLinkForm] = useState({ linkTitle: '', linkUrl: '' });

  // State for snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  // Role detection (hardcoded for now – replace with real auth later)
  const isAdmin = true; // or use a hook like useAuth()

  if (!project) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Project not found</Alert>
        <Button sx={{ mt: 2 }} variant="outlined" onClick={() => navigate(paths.root)}>
          Back to Dashboard
        </Button>
      </Box>
    );
  }

  // ---- Link handlers ----
  const handleOpenLinkModal = (link?: any) => {
    if (link) {
      setEditingLink(link);
      setLinkForm({ linkTitle: link.linkTitle, linkUrl: link.linkUrl });
    } else {
      setEditingLink(null);
      setLinkForm({ linkTitle: '', linkUrl: '' });
    }
    setLinkModalOpen(true);
  };

  const handleSaveLink = () => {
    if (!linkForm.linkTitle.trim() || !linkForm.linkUrl.trim()) {
      setSnackbar({ open: true, message: 'Title and URL are required', severity: 'error' });
      return;
    }
    if (editingLink) {
      updateLink(editingLink.id, linkForm);
      setSnackbar({ open: true, message: 'Link updated', severity: 'success' });
    } else {
      addLink({
        projectId: projectId!,
        linkTitle: linkForm.linkTitle,
        linkUrl: linkForm.linkUrl,
        createdBy: 'Admin User',
      });
      setSnackbar({ open: true, message: 'Link added', severity: 'success' });
    }
    setLinkModalOpen(false);
  };

  const handleDeleteLink = (id: string) => {
    if (window.confirm('Delete this link?')) {
      deleteLink(id);
      setSnackbar({ open: true, message: 'Link deleted', severity: 'success' });
    }
  };

  // ---- Task handlers (inline status update) ----
  const handleTaskStatusChange = (
    taskId: string,
    newStatus: 'Pending' | 'In progress' | 'Done',
  ) => {
    // Map status to priority? No, we only change a custom field. But our Task interface has no 'status'.
    // To keep it simple, we'll add a 'status' field to the task. Let's extend the Task type.
    // For now, we'll simulate by updating a 'status' property that we'll add to the task object.
    // Better: add 'status' to TaskContext. But for brevity, we'll use a local state update via updateTask.
    // We'll assume updateTask can handle any partial update.
    updateTask(taskId, { status: newStatus } as any);
    setSnackbar({ open: true, message: 'Task updated', severity: 'success' });
  };

  // Compute completion percentage (tasks marked as 'Done')
  const completedTasks = projectTasks.filter((t: any) => t.status === 'Done').length;
  const completionPercent = projectTasks.length
    ? Math.round((completedTasks / projectTasks.length) * 100)
    : 0;

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header with back button */}
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <IconButton onClick={() => navigate(paths.root)}>
          {/* You can use ArrowBackIcon */}
        </IconButton>
        <Typography variant="h4" component="h1">
          {project.projectName}
        </Typography>
        <Chip
          label={project.status}
          color={
            project.status === 'Active'
              ? 'success'
              : project.status === 'Completed'
                ? 'info'
                : 'default'
          }
          sx={{ ml: 2 }}
        />
        <Chip label={project.projectPhase} variant="outlined" />
      </Stack>

      <Grid container spacing={3}>
        {/* LEFT COLUMN */}
        <Grid size={{ xs: 12, md: 8 }}>
          {/* Team Section */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Team Members
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {project.teamMembers.map((member) => (
                  <Chip key={member.id} label={member.name} variant="outlined" />
                ))}
              </Stack>
            </CardContent>
          </Card>

          {/* Notes Section */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Project Notes
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {project.projectNotes || 'No notes provided.'}
              </Typography>
            </CardContent>
          </Card>

          {/* Resources Section (Drive + Links) */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Resources
              </Typography>

              {/* Mandatory Google Drive button */}
              <Button
                variant="contained"
                startIcon={<FolderIcon />}
                href={project.driveLink}
                target="_blank"
                sx={{ mb: 2 }}
              >
                Google Drive Folder
              </Button>

              <Divider sx={{ my: 2 }} />

              {/* Optional links */}
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle1">Resources & Links</Typography>
                {isAdmin && (
                  <Button
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenLinkModal()}
                  >
                    Add Link
                  </Button>
                )}
              </Stack>

              {projectLinks.length === 0 ? (
                <Typography color="text.secondary" sx={{ mt: 1, fontStyle: 'italic' }}>
                  No additional links.
                </Typography>
              ) : (
                <List dense>
                  {projectLinks.map((link) => (
                    <ListItem
                      key={link.id}
                      secondaryAction={
                        isAdmin && (
                          <Stack direction="row" spacing={1}>
                            <IconButton
                              edge="end"
                              size="small"
                              onClick={() => handleOpenLinkModal(link)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              edge="end"
                              size="small"
                              onClick={() => handleDeleteLink(link.id)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Stack>
                        )
                      }
                    >
                      <LinkIcon
                        sx={{ color: getLinkColor(link.linkUrl), mr: 1 }}
                        fontSize="small"
                      />
                      <ListItemText
                        primary={
                          <a href={link.linkUrl} target="_blank" rel="noopener noreferrer">
                            {link.linkTitle}
                          </a>
                        }
                        secondary={
                          link.linkUrl.length > 60 ? link.linkUrl.slice(0, 60) + '…' : link.linkUrl
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>

          {/* Meeting Notes Section (optional – can be expanded later) */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Meeting Notes
              </Typography>
              <Typography variant="body2" color="text.secondary">
                (Feature coming soon – meeting notes will be listed here.)
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* RIGHT COLUMN – TASKS */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ position: 'sticky', top: 16 }}>
            <CardContent>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 2 }}
              >
                <Typography variant="h6">Tasks</Typography>
                {isAdmin && (
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => navigate(paths.tasks.new)}
                  >
                    Add
                  </Button>
                )}
              </Stack>

              {/* Completion progress */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Completion
                </Typography>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <CircularProgress variant="determinate" value={completionPercent} size={40} />
                  <Typography variant="h6">{completionPercent}%</Typography>
                </Stack>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Task list */}
              {projectTasks.length === 0 ? (
                <Typography color="text.secondary" align="center" sx={{ py: 2 }}>
                  No tasks assigned.
                </Typography>
              ) : (
                <List dense>
                  {projectTasks.map((task: any) => (
                    <ListItem key={task.id} sx={{ flexDirection: 'column', alignItems: 'start' }}>
                      <ListItemText
                        primary={task.title}
                        secondary={`Due: ${new Date(task.dueDate).toLocaleDateString()} · Assigned to ${task.assignedTo.name}`}
                      />
                      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                        <Chip
                          label={task.priority}
                          size="small"
                          color={
                            task.priority === 'High'
                              ? 'error'
                              : task.priority === 'Medium'
                                ? 'warning'
                                : 'info'
                          }
                        />
                        {/* Status selector – inline update */}
                        <Chip
                          label={task.status || 'Pending'}
                          size="small"
                          clickable
                          onClick={() => {
                            const nextStatus =
                              task.status === 'Pending'
                                ? 'In progress'
                                : task.status === 'In progress'
                                  ? 'Done'
                                  : 'Pending';
                            handleTaskStatusChange(task.id, nextStatus);
                          }}
                          color={
                            task.status === 'Done'
                              ? 'success'
                              : task.status === 'In progress'
                                ? 'primary'
                                : 'default'
                          }
                        />
                      </Stack>
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Add/Edit Link Modal */}
      <Dialog open={linkModalOpen} onClose={() => setLinkModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingLink ? 'Edit Link' : 'Add New Link'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Title"
              value={linkForm.linkTitle}
              onChange={(e) => setLinkForm({ ...linkForm, linkTitle: e.target.value })}
            />
            <TextField
              fullWidth
              label="URL"
              value={linkForm.linkUrl}
              onChange={(e) => setLinkForm({ ...linkForm, linkUrl: e.target.value })}
              placeholder="https://..."
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLinkModalOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveLink}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProjectDetailPage;
