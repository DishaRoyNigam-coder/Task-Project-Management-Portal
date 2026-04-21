// src/pages/Admin/projects/ProjectLinksNotes.tsx
import { useState } from 'react';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Link as LinkIcon,
  Note as NoteIcon,
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
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  TextField,
  Typography,
} from '@mui/material';

// Theme colors (matching the blue theme)
const PRIMARY_BLUE = '#1E58E6';
const PRIMARY_BLUE_LIGHT = '#E6F0FF';
const PRIMARY_BLUE_DARK = '#1A4CC4';

// Mock project data (replace with real data from your ProjectContext or API)
interface Project {
  id: number;
  name: string;
  links: { id: number; url: string; title: string }[];
  notes: { id: number; content: string; createdAt: string }[];
}

const mockProjects: Project[] = [
  {
    id: 1,
    name: 'E-commerce Platform',
    links: [
      { id: 1, url: 'https://github.com/company/ecommerce', title: 'GitHub Repo' },
      { id: 2, url: 'https://figma.com/file/xyz', title: 'Figma Design' },
    ],
    notes: [
      { id: 1, content: 'Client wants mobile-first design.', createdAt: '2025-04-01' },
      { id: 2, content: 'Deployment scheduled for May 15.', createdAt: '2025-04-10' },
    ],
  },
  {
    id: 2,
    name: 'Mobile App',
    links: [{ id: 3, url: 'https://trello.com/b/abc', title: 'Trello Board' }],
    notes: [{ id: 3, content: 'Need to update API endpoints.', createdAt: '2025-04-05' }],
  },
];

const ProjectLinksNotes = () => {
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [openLinkDialog, setOpenLinkDialog] = useState(false);
  const [openNoteDialog, setOpenNoteDialog] = useState(false);
  const [editingLink, setEditingLink] = useState<{ id?: number; title: string; url: string }>({
    title: '',
    url: '',
  });
  const [newNote, setNewNote] = useState('');

  const handleSelectProject = (project: Project) => {
    setSelectedProject(project);
  };

  // Link handlers
  const handleOpenLinkDialog = (link?: { id: number; title: string; url: string }) => {
    if (link) {
      setEditingLink({ id: link.id, title: link.title, url: link.url });
    } else {
      setEditingLink({ title: '', url: '' });
    }
    setOpenLinkDialog(true);
  };

  const handleCloseLinkDialog = () => {
    setOpenLinkDialog(false);
    setEditingLink({ title: '', url: '' });
  };

  const handleSaveLink = () => {
    if (!selectedProject) return;
    const updatedProjects = projects.map((p) => {
      if (p.id === selectedProject.id) {
        if (editingLink.id) {
          // Edit existing link
          const updatedLinks = p.links.map((link) =>
            link.id === editingLink.id
              ? { ...link, title: editingLink.title, url: editingLink.url }
              : link,
          );
          return { ...p, links: updatedLinks };
        } else {
          // Add new link
          const newId = Math.max(0, ...p.links.map((l) => l.id)) + 1;
          const newLink = { id: newId, title: editingLink.title, url: editingLink.url };
          return { ...p, links: [...p.links, newLink] };
        }
      }
      return p;
    });
    setProjects(updatedProjects);
    setSelectedProject(updatedProjects.find((p) => p.id === selectedProject.id) || null);
    handleCloseLinkDialog();
  };

  const handleDeleteLink = (linkId: number) => {
    if (!selectedProject) return;
    const updatedProjects = projects.map((p) =>
      p.id === selectedProject.id ? { ...p, links: p.links.filter((l) => l.id !== linkId) } : p,
    );
    setProjects(updatedProjects);
    setSelectedProject(updatedProjects.find((p) => p.id === selectedProject.id) || null);
  };

  // Note handlers
  const handleOpenNoteDialog = () => {
    setNewNote('');
    setOpenNoteDialog(true);
  };

  const handleCloseNoteDialog = () => {
    setOpenNoteDialog(false);
    setNewNote('');
  };

  const handleSaveNote = () => {
    if (!selectedProject || !newNote.trim()) return;
    const newId = Math.max(0, ...selectedProject.notes.map((n) => n.id)) + 1;
    const note = {
      id: newId,
      content: newNote,
      createdAt: new Date().toISOString().split('T')[0],
    };
    const updatedProjects = projects.map((p) =>
      p.id === selectedProject.id ? { ...p, notes: [note, ...p.notes] } : p,
    );
    setProjects(updatedProjects);
    setSelectedProject(updatedProjects.find((p) => p.id === selectedProject.id) || null);
    handleCloseNoteDialog();
  };

  const handleDeleteNote = (noteId: number) => {
    if (!selectedProject) return;
    const updatedProjects = projects.map((p) =>
      p.id === selectedProject.id ? { ...p, notes: p.notes.filter((n) => n.id !== noteId) } : p,
    );
    setProjects(updatedProjects);
    setSelectedProject(updatedProjects.find((p) => p.id === selectedProject.id) || null);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h4" gutterBottom fontWeight={700} color="#0f2a6e">
        Project Links & Notes
      </Typography>
      <Typography variant="body2" color="#4a6fa5" sx={{ mb: 3 }}>
        Manage external links and internal notes for each project.
      </Typography>

      {/* Two-column layout */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {/* Project List - left column */}
        <Box sx={{ flex: '1 1 300px', minWidth: 250 }}>
          <Card elevation={0} sx={{ border: '1px solid #d0e0ff', borderRadius: '12px' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f2a6e', mb: 2 }}>
                Projects
              </Typography>
              <List disablePadding>
                {projects.map((project) => (
                  <ListItem key={project.id} disablePadding sx={{ mb: 1 }}>
                    <ListItemButton
                      selected={selectedProject?.id === project.id}
                      onClick={() => handleSelectProject(project)}
                      sx={{
                        borderRadius: '8px',
                        transition: 'all 0.15s ease',
                        '&:hover': {
                          backgroundColor: PRIMARY_BLUE_LIGHT,
                          color: PRIMARY_BLUE,
                        },
                        '&.Mui-selected': {
                          backgroundColor: PRIMARY_BLUE_LIGHT,
                          color: PRIMARY_BLUE,
                          borderLeft: `3px solid ${PRIMARY_BLUE}`,
                          '&:hover': {
                            backgroundColor: PRIMARY_BLUE_LIGHT,
                          },
                        },
                      }}
                    >
                      <ListItemText
                        primary={project.name}
                        slotProps={{
                          primary: { sx: { fontWeight: 500, fontSize: '0.95rem' } },
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
                {projects.length === 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                    No projects found.
                  </Typography>
                )}
              </List>
            </CardContent>
          </Card>
        </Box>

        {/* Links & Notes for selected project - right column */}
        <Box sx={{ flex: '2 1 500px', minWidth: 400 }}>
          {selectedProject ? (
            <Card elevation={0} sx={{ border: '1px solid #d0e0ff', borderRadius: '12px' }}>
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#0f2a6e', mb: 2 }}>
                  {selectedProject.name}
                </Typography>

                {/* Links Section */}
                <Box sx={{ mb: 4 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 2,
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#0f2a6e' }}>
                      <LinkIcon sx={{ mr: 1, verticalAlign: 'middle', color: PRIMARY_BLUE }} />
                      Links
                    </Typography>
                    <Button
                      startIcon={<AddIcon />}
                      size="small"
                      onClick={() => handleOpenLinkDialog()}
                      sx={{
                        color: PRIMARY_BLUE,
                        fontWeight: 600,
                        borderRadius: '8px',
                        textTransform: 'none',
                        '&:hover': { backgroundColor: PRIMARY_BLUE_LIGHT },
                      }}
                    >
                      Add Link
                    </Button>
                  </Box>
                  {selectedProject.links.length === 0 ? (
                    <Alert severity="info" sx={{ borderRadius: '8px' }}>
                      No links added yet.
                    </Alert>
                  ) : (
                    <List disablePadding>
                      {selectedProject.links.map((link) => (
                        <ListItem
                          key={link.id}
                          divider
                          sx={{
                            borderRadius: '8px',
                            mb: 1,
                            bgcolor: '#f8fbff',
                            border: '1px solid #d0e0ff',
                          }}
                        >
                          <ListItemText
                            primary={
                              <a
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  color: PRIMARY_BLUE,
                                  fontWeight: 600,
                                  textDecoration: 'none',
                                }}
                              >
                                {link.title}
                              </a>
                            }
                            secondary={
                              <Typography sx={{ fontSize: '12px', color: '#4a6fa5' }}>
                                {link.url}
                              </Typography>
                            }
                          />
                          <IconButton
                            edge="end"
                            size="small"
                            onClick={() => handleOpenLinkDialog(link)}
                            sx={{ color: PRIMARY_BLUE }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            edge="end"
                            size="small"
                            onClick={() => handleDeleteLink(link.id)}
                            sx={{ color: '#e53935' }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Box>

                <Divider sx={{ my: 2, borderColor: '#d0e0ff' }} />

                {/* Notes Section */}
                <Box>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 2,
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#0f2a6e' }}>
                      <NoteIcon sx={{ mr: 1, verticalAlign: 'middle', color: PRIMARY_BLUE }} />
                      Notes
                    </Typography>
                    <Button
                      startIcon={<AddIcon />}
                      size="small"
                      onClick={handleOpenNoteDialog}
                      sx={{
                        color: PRIMARY_BLUE,
                        fontWeight: 600,
                        borderRadius: '8px',
                        textTransform: 'none',
                        '&:hover': { backgroundColor: PRIMARY_BLUE_LIGHT },
                      }}
                    >
                      Add Note
                    </Button>
                  </Box>
                  {selectedProject.notes.length === 0 ? (
                    <Alert severity="info" sx={{ borderRadius: '8px' }}>
                      No notes yet.
                    </Alert>
                  ) : (
                    <List disablePadding>
                      {selectedProject.notes.map((note) => (
                        <ListItem
                          key={note.id}
                          divider
                          sx={{
                            borderRadius: '8px',
                            mb: 1,
                            bgcolor: '#f8fbff',
                            border: '1px solid #d0e0ff',
                          }}
                        >
                          <ListItemText
                            primary={note.content}
                            secondary={`Added on ${note.createdAt}`}
                            slotProps={{
                              primary: { sx: { fontWeight: 500 } },
                              secondary: { sx: { fontSize: '11px', color: '#4a6fa5' } },
                            }}
                          />
                          <IconButton
                            edge="end"
                            size="small"
                            onClick={() => handleDeleteNote(note.id)}
                            sx={{ color: '#e53935' }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Box>
              </CardContent>
            </Card>
          ) : (
            <Paper
              elevation={0}
              sx={{
                p: 4,
                textAlign: 'center',
                border: '1px solid #d0e0ff',
                borderRadius: '12px',
              }}
            >
              <Typography variant="body1" color="#4a6fa5">
                Select a project from the left to manage its links and notes.
              </Typography>
            </Paper>
          )}
        </Box>
      </Box>

      {/* Add/Edit Link Dialog */}
      <Dialog
        open={openLinkDialog}
        onClose={handleCloseLinkDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '12px' } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: '#0f2a6e' }}>
          {editingLink.id ? 'Edit Link' : 'Add Link'}
        </DialogTitle>
        <Divider sx={{ borderColor: '#d0e0ff' }} />
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            fullWidth
            variant="outlined"
            value={editingLink.title}
            onChange={(e) => setEditingLink({ ...editingLink, title: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            label="URL"
            fullWidth
            variant="outlined"
            value={editingLink.url}
            onChange={(e) => setEditingLink({ ...editingLink, url: e.target.value })}
          />
        </DialogContent>
        <Divider sx={{ borderColor: '#d0e0ff' }} />
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={handleCloseLinkDialog}
            sx={{
              color: PRIMARY_BLUE,
              fontWeight: 600,
              borderRadius: '8px',
              textTransform: 'none',
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveLink}
            variant="contained"
            disabled={!editingLink.title || !editingLink.url}
            sx={{
              backgroundColor: PRIMARY_BLUE,
              fontWeight: 600,
              borderRadius: '8px',
              textTransform: 'none',
              '&:hover': { backgroundColor: PRIMARY_BLUE_DARK },
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Note Dialog */}
      <Dialog
        open={openNoteDialog}
        onClose={handleCloseNoteDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '12px' } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: '#0f2a6e' }}>Add Note</DialogTitle>
        <Divider sx={{ borderColor: '#d0e0ff' }} />
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            autoFocus
            margin="dense"
            label="Note Content"
            multiline
            rows={4}
            fullWidth
            variant="outlined"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
          />
        </DialogContent>
        <Divider sx={{ borderColor: '#d0e0ff' }} />
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={handleCloseNoteDialog}
            sx={{
              color: PRIMARY_BLUE,
              fontWeight: 600,
              borderRadius: '8px',
              textTransform: 'none',
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveNote}
            variant="contained"
            disabled={!newNote.trim()}
            sx={{
              backgroundColor: PRIMARY_BLUE,
              fontWeight: 600,
              borderRadius: '8px',
              textTransform: 'none',
              '&:hover': { backgroundColor: PRIMARY_BLUE_DARK },
            }}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectLinksNotes;
