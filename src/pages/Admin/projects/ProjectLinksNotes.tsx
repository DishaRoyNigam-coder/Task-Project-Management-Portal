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
  ListItemSecondaryAction,
  ListItemText,
  Paper,
  TextField,
  Typography,
} from '@mui/material';

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
      <Typography variant="h4" gutterBottom>
        Project Links & Notes
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Manage external links and internal notes for each project.
      </Typography>

      {/* Replace Grid with flex Box */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {/* Project List - left column */}
        <Box sx={{ flex: '1 1 300px', minWidth: 250 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Projects
              </Typography>
              <List>
                {projects.map((project) => (
                  <ListItem key={project.id} disablePadding>
                    <ListItemButton
                      selected={selectedProject?.id === project.id}
                      onClick={() => handleSelectProject(project)}
                    >
                      <ListItemText primary={project.name} />
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
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
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
                    <Typography variant="h6">
                      <LinkIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Links
                    </Typography>
                    <Button
                      startIcon={<AddIcon />}
                      size="small"
                      onClick={() => handleOpenLinkDialog()}
                    >
                      Add Link
                    </Button>
                  </Box>
                  {selectedProject.links.length === 0 ? (
                    <Alert severity="info">No links added yet.</Alert>
                  ) : (
                    <List>
                      {selectedProject.links.map((link) => (
                        <ListItem key={link.id} divider>
                          <ListItemText
                            primary={
                              <a href={link.url} target="_blank" rel="noopener noreferrer">
                                {link.title}
                              </a>
                            }
                            secondary={link.url}
                          />
                          <ListItemSecondaryAction>
                            <IconButton
                              edge="end"
                              size="small"
                              onClick={() => handleOpenLinkDialog(link)}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              edge="end"
                              size="small"
                              onClick={() => handleDeleteLink(link.id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Box>

                <Divider sx={{ my: 2 }} />

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
                    <Typography variant="h6">
                      <NoteIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Notes
                    </Typography>
                    <Button startIcon={<AddIcon />} size="small" onClick={handleOpenNoteDialog}>
                      Add Note
                    </Button>
                  </Box>
                  {selectedProject.notes.length === 0 ? (
                    <Alert severity="info">No notes yet.</Alert>
                  ) : (
                    <List>
                      {selectedProject.notes.map((note) => (
                        <ListItem key={note.id} divider>
                          <ListItemText
                            primary={note.content}
                            secondary={`Added on ${note.createdAt}`}
                          />
                          <ListItemSecondaryAction>
                            <IconButton
                              edge="end"
                              size="small"
                              onClick={() => handleDeleteNote(note.id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Box>
              </CardContent>
            </Card>
          ) : (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                Select a project from the left to manage its links and notes.
              </Typography>
            </Paper>
          )}
        </Box>
      </Box>

      {/* Add/Edit Link Dialog */}
      <Dialog open={openLinkDialog} onClose={handleCloseLinkDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingLink.id ? 'Edit Link' : 'Add Link'}</DialogTitle>
        <DialogContent>
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
        <DialogActions>
          <Button onClick={handleCloseLinkDialog}>Cancel</Button>
          <Button
            onClick={handleSaveLink}
            variant="contained"
            disabled={!editingLink.title || !editingLink.url}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Note Dialog */}
      <Dialog open={openNoteDialog} onClose={handleCloseNoteDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add Note</DialogTitle>
        <DialogContent>
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
        <DialogActions>
          <Button onClick={handleCloseNoteDialog}>Cancel</Button>
          <Button onClick={handleSaveNote} variant="contained" disabled={!newNote.trim()}>
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectLinksNotes;
