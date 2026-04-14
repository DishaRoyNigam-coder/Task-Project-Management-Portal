import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Link as LinkIcon,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
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

const ProjectLinksPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { projects, links, addLink, updateLink, deleteLink } = useProjects();

  const project = projects.find((p) => p.id === projectId);
  const projectLinks = links.filter((link) => link.projectId === projectId);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<(typeof projectLinks)[0] | null>(null);
  const [formData, setFormData] = useState({ linkTitle: '', linkUrl: '' });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

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

  const handleOpenModal = (link?: (typeof projectLinks)[0]) => {
    if (link) {
      setEditingLink(link);
      setFormData({ linkTitle: link.linkTitle, linkUrl: link.linkUrl });
    } else {
      setEditingLink(null);
      setFormData({ linkTitle: '', linkUrl: '' });
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingLink(null);
    setFormData({ linkTitle: '', linkUrl: '' });
  };

  const handleSaveLink = () => {
    if (!formData.linkTitle.trim() || !formData.linkUrl.trim()) {
      setSnackbar({ open: true, message: 'Both Title and URL are required', severity: 'error' });
      return;
    }
    if (editingLink) {
      updateLink(editingLink.id, {
        linkTitle: formData.linkTitle,
        linkUrl: formData.linkUrl,
      });
      setSnackbar({ open: true, message: 'Link updated', severity: 'success' });
    } else {
      addLink({
        projectId: projectId!,
        linkTitle: formData.linkTitle,
        linkUrl: formData.linkUrl,
        createdBy: 'Admin User',
      });
      setSnackbar({ open: true, message: 'Link added', severity: 'success' });
    }
    handleCloseModal();
  };

  const handleDeleteLink = (id: string) => {
    if (window.confirm('Are you sure you want to delete this link?')) {
      deleteLink(id);
      setSnackbar({ open: true, message: 'Link deleted', severity: 'success' });
    }
  };

  const formatDate = (isoString: string) => new Date(isoString).toLocaleString();

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <IconButton onClick={() => navigate(paths.root)}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          Project Links: {project.projectName}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenModal()}
          sx={{ ml: 'auto' }}
        >
          Add Link
        </Button>
      </Stack>

      <Card>
        <CardContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Mandatory Google Drive Link: <strong>{project.driveLink}</strong>
            <Button
              size="small"
              href={project.driveLink}
              target="_blank"
              startIcon={<LinkIcon />}
              sx={{ ml: 1 }}
            >
              Open
            </Button>
          </Typography>
        </CardContent>
      </Card>

      <Paper sx={{ mt: 3 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Link Title</TableCell>
                <TableCell>URL</TableCell>
                <TableCell>Created By</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell>Updated At</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {projectLinks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography color="text.secondary" sx={{ py: 3 }}>
                      No links added yet. Click "Add Link" to add reference resources.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                projectLinks.map((link) => (
                  <TableRow key={link.id} hover>
                    <TableCell>{link.linkTitle}</TableCell>
                    <TableCell>
                      <a href={link.linkUrl} target="_blank" rel="noopener noreferrer">
                        {link.linkUrl.length > 50
                          ? link.linkUrl.substring(0, 50) + '…'
                          : link.linkUrl}
                      </a>
                    </TableCell>
                    <TableCell>{link.createdBy}</TableCell>
                    <TableCell>{formatDate(link.createdAt)}</TableCell>
                    <TableCell>{formatDate(link.updatedAt)}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => handleOpenModal(link)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteLink(link.id)}
                          color="error"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add/Edit Modal */}
      <Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle>{editingLink ? 'Edit Link' : 'Add New Link'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Link Title *"
              value={formData.linkTitle}
              onChange={(e) => setFormData({ ...formData, linkTitle: e.target.value })}
              placeholder="e.g., Figma Design, API Docs, Staging Site"
            />
            <TextField
              fullWidth
              label="Link URL *"
              value={formData.linkUrl}
              onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
              placeholder="https://..."
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveLink}>
            {editingLink ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

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

export default ProjectLinksPage;
