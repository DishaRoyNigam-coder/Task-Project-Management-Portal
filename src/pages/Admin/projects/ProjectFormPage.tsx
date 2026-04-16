// src/pages/projects/ProjectFormPage.tsx
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useProjects } from 'context/ProjectContext';
import { Employee } from 'context/TaskContext';
import paths from 'routes/paths';

const mockEmployees: Employee[] = [
  { id: 1, name: 'John Doe', email: 'john.doe@company.com' },
  { id: 2, name: 'Jane Smith', email: 'jane.smith@company.com' },
  { id: 3, name: 'Mike Johnson', email: 'mike.j@company.com' },
  { id: 4, name: 'Emily Davis', email: 'emily.davis@company.com' },
  { id: 5, name: 'Robert Brown', email: 'robert.brown@company.com' },
];

const projectPhases = ['Planning', 'Development', 'Testing', 'Deployment', 'Maintenance'];
const statusOptions = ['Active', 'Completed', 'Archived'];

const ProjectFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects, setProjects } = useProjects();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    projectName: '',
    clientName: '',
    teamMembers: [] as Employee[],
    driveLink: '',
    projectNotes: '',
    projectPhase: 'Planning',
    status: 'Active' as 'Active' | 'Completed' | 'Archived',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  useEffect(() => {
    if (isEditMode) {
      const project = projects.find((p) => p.id === id);
      if (project) {
        setFormData({
          projectName: project.projectName,
          clientName: project.clientName,
          teamMembers: project.teamMembers,
          driveLink: project.driveLink,
          projectNotes: project.projectNotes,
          projectPhase: project.projectPhase,
          status: project.status,
        });
      } else {
        setSnackbar({ open: true, message: 'Project not found', severity: 'error' });
        navigate(paths.root);
      }
    }
  }, [id, isEditMode, projects, navigate]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!formData.projectName || !formData.clientName || !formData.driveLink) {
      setSnackbar({
        open: true,
        message: 'Please fill all required fields (*)',
        severity: 'error',
      });
      return;
    }

    const now = new Date().toISOString();
    if (isEditMode) {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
                ...p,
                ...formData,
                updatedAt: now,
              }
            : p,
        ),
      );
      setSnackbar({ open: true, message: 'Project updated successfully', severity: 'success' });
    } else {
      const newProject = {
        id: `proj_${Date.now()}`,
        ...formData,
        createdBy: 'Admin User',
        createdAt: now,
        updatedAt: now,
      };
      setProjects((prev) => [newProject, ...prev]);
      setSnackbar({ open: true, message: 'Project created successfully', severity: 'success' });
    }
    setTimeout(() => navigate(paths.root), 1500);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            {isEditMode ? 'Edit Project' : 'Create New Project'}
          </Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Project Name *"
                value={formData.projectName}
                onChange={(e) => handleChange('projectName', e.target.value)}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Client Name *"
                value={formData.clientName}
                onChange={(e) => handleChange('clientName', e.target.value)}
                required
              />
            </Grid>
            <Grid size={12}>
              <Autocomplete
                multiple
                options={mockEmployees}
                getOptionLabel={(option) => option.name}
                value={formData.teamMembers}
                onChange={(_, newValue) => handleChange('teamMembers', newValue)}
                renderInput={(params) => (
                  <TextField {...params} label="Team Members" placeholder="Select employees" />
                )}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                label="Google Drive Link *"
                value={formData.driveLink}
                onChange={(e) => handleChange('driveLink', e.target.value)}
                required
                helperText="Mandatory Google Drive folder link"
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                label="Project Notes"
                multiline
                rows={3}
                value={formData.projectNotes}
                onChange={(e) => handleChange('projectNotes', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Project Phase</InputLabel>
                <Select
                  value={formData.projectPhase}
                  label="Project Phase"
                  onChange={(e) => handleChange('projectPhase', e.target.value)}
                >
                  {projectPhases.map((phase) => (
                    <MenuItem key={phase} value={phase}>
                      {phase}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={(e) => handleChange('status', e.target.value)}
                >
                  {statusOptions.map((opt) => (
                    <MenuItem key={opt} value={opt}>
                      {opt}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
            <Button variant="outlined" onClick={() => navigate(paths.root)}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleSubmit}>
              {isEditMode ? 'Update Project' : 'Create Project'}
            </Button>
          </Stack>
        </CardContent>
      </Card>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProjectFormPage;
