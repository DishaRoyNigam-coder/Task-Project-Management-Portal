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
  Divider,
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

// ─── Constants ────────────────────────────────────────────────────────────────
const mockEmployees: Employee[] = [
  { id: 1, name: 'John Doe', email: 'john.doe@company.com' },
  { id: 2, name: 'Jane Smith', email: 'jane.smith@company.com' },
  { id: 3, name: 'Mike Johnson', email: 'mike.j@company.com' },
  { id: 4, name: 'Emily Davis', email: 'emily.davis@company.com' },
  { id: 5, name: 'Robert Brown', email: 'robert.brown@company.com' },
];

const projectPhases = ['Planning', 'Development', 'Testing', 'Deployment', 'Maintenance'];
const statusOptions = ['Active', 'Completed', 'Archived'];

// ─── Primary Blue (#1E58E6) – matches your theme palette ─────────────────────
const PRIMARY_BLUE = '#1E58E6';
const PRIMARY_BLUE_DARK = '#1A4CC4';
const PRIMARY_BLUE_LIGHT = '#E6F0FF';

// ─── Reusable sx: permanent blue outlined border on every field ───────────────
const fieldSx = {
  '& .MuiOutlinedInput-root': {
    backgroundColor: PRIMARY_BLUE_LIGHT,
    borderRadius: '8px',
    transition: 'background-color 0.2s ease, box-shadow 0.2s ease',
    '& fieldset': {
      borderColor: PRIMARY_BLUE,
      borderWidth: '1.5px',
    },
    '&:hover': {
      backgroundColor: '#dce9ff',
      '& fieldset': {
        borderColor: PRIMARY_BLUE_DARK,
        borderWidth: '2px',
      },
    },
    '&.Mui-focused': {
      backgroundColor: '#dce9ff',
      boxShadow: `0 0 0 3px ${PRIMARY_BLUE}28`,
      '& fieldset': {
        borderColor: PRIMARY_BLUE,
        borderWidth: '2px',
      },
    },
  },
  '& .MuiInputLabel-root': {
    color: '#4a6fa5',
    fontWeight: 500,
    fontSize: '14px',
    '&.Mui-focused': {
      color: PRIMARY_BLUE,
      fontWeight: 600,
    },
  },
  '& .MuiFormHelperText-root': {
    marginTop: '4px',
    fontSize: '12px',
    color: '#4a6fa5',
  },
};

// Fixed selectSx: ensures label and selected value are correctly positioned
const selectSx = {
  ...fieldSx,
  '& .MuiOutlinedInput-root': {
    ...fieldSx['& .MuiOutlinedInput-root'],
    '& .MuiSelect-select': {
      padding: '14px 14px', // consistent vertical alignment
      display: 'flex',
      alignItems: 'center',
    },
    '& .MuiSelect-icon': {
      color: PRIMARY_BLUE,
      right: '12px',
    },
  },
  // Prevent label from overlapping when not shrunk
  '& .MuiInputLabel-root': {
    ...fieldSx['& .MuiInputLabel-root'],
    transform: 'translate(14px, 12px) scale(1)', // default position
    '&.MuiInputLabel-shrink': {
      transform: 'translate(14px, -8px) scale(0.75)',
    },
  },
};

// ─── Component ────────────────────────────────────────────────────────────────
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
        prev.map((p) => (p.id === id ? { ...p, ...formData, updatedAt: now } : p)),
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

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Card
        elevation={0}
        sx={{
          border: '1px solid #d0e0ff',
          borderRadius: '12px',
          overflow: 'visible',
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
          {/* Header */}
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: '#0f2a6e',
                fontSize: { xs: '1.2rem', sm: '1.4rem' },
              }}
            >
              {isEditMode ? 'Edit Project' : 'Create New Project'}
            </Typography>
            <Typography variant="body2" sx={{ color: '#4a6fa5', mt: 0.5 }}>
              {isEditMode
                ? 'Update the project details below.'
                : 'Fill in the details below to create a new project.'}
            </Typography>
          </Box>

          <Divider sx={{ mb: 3, borderColor: '#d0e0ff' }} />

          {/* Form Grid */}
          <Grid container spacing={2.5}>
            {/* Row 1: Project Name | Client Name */}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                variant="outlined"
                label="Project Name **"
                placeholder="e.g. Website Redesign"
                value={formData.projectName}
                onChange={(e) => handleChange('projectName', e.target.value)}
                required
                sx={fieldSx}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                variant="outlined"
                label="Client Name **"
                placeholder="e.g. Acme Corp"
                value={formData.clientName}
                onChange={(e) => handleChange('clientName', e.target.value)}
                required
                sx={fieldSx}
              />
            </Grid>

            {/* Row 2: Team Members (full width) */}
            <Grid size={12}>
              <Autocomplete
                multiple
                options={mockEmployees}
                getOptionLabel={(option) => option.name}
                value={formData.teamMembers}
                onChange={(_, newValue) => handleChange('teamMembers', newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    label="Team Members"
                    placeholder="Select employees"
                    sx={fieldSx}
                  />
                )}
                sx={{
                  '& .MuiAutocomplete-tag': {
                    backgroundColor: PRIMARY_BLUE_LIGHT,
                    border: `1px solid ${PRIMARY_BLUE}`,
                    color: PRIMARY_BLUE,
                    fontWeight: 500,
                    borderRadius: '6px',
                  },
                  '& .MuiAutocomplete-clearIndicator, & .MuiAutocomplete-popupIndicator': {
                    color: PRIMARY_BLUE,
                  },
                }}
              />
            </Grid>

            {/* Row 3: Google Drive Link (full width) */}
            <Grid size={12}>
              <TextField
                fullWidth
                variant="outlined"
                label="Google Drive Link **"
                placeholder="https://drive.google.com/drive/folders/..."
                value={formData.driveLink}
                onChange={(e) => handleChange('driveLink', e.target.value)}
                required
                helperText="Mandatory Google Drive folder link"
                sx={fieldSx}
              />
            </Grid>

            {/* Row 4: Project Notes (full width) */}
            <Grid size={12}>
              <TextField
                fullWidth
                variant="outlined"
                label="Project Notes"
                placeholder="Add any relevant notes, goals, or context…"
                multiline
                rows={4}
                value={formData.projectNotes}
                onChange={(e) => handleChange('projectNotes', e.target.value)}
                sx={{
                  ...fieldSx,
                  '& .MuiOutlinedInput-root': {
                    ...fieldSx['& .MuiOutlinedInput-root'],
                    alignItems: 'flex-start',
                    paddingTop: '4px',
                  },
                }}
              />
            </Grid>

            {/* Row 5: Project Phase | Status – FIXED alignment */}
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth sx={selectSx}>
                <InputLabel id="project-phase-label">Project Phase</InputLabel>
                <Select
                  labelId="project-phase-label"
                  variant="outlined"
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
              <FormControl fullWidth sx={selectSx}>
                <InputLabel id="status-label">Status</InputLabel>
                <Select
                  labelId="status-label"
                  variant="outlined"
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

          {/* Action Buttons */}
          <Divider sx={{ mt: 3.5, mb: 2.5, borderColor: '#d0e0ff' }} />

          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button
              variant="outlined"
              onClick={() => navigate(paths.root)}
              sx={{
                borderColor: PRIMARY_BLUE,
                color: PRIMARY_BLUE,
                fontWeight: 600,
                px: 3,
                borderRadius: '8px',
                textTransform: 'none',
                fontSize: '14px',
                '&:hover': {
                  borderColor: PRIMARY_BLUE_DARK,
                  backgroundColor: PRIMARY_BLUE_LIGHT,
                  color: PRIMARY_BLUE_DARK,
                },
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              sx={{
                backgroundColor: PRIMARY_BLUE,
                fontWeight: 600,
                px: 3.5,
                borderRadius: '8px',
                textTransform: 'none',
                fontSize: '14px',
                boxShadow: `0 4px 12px ${PRIMARY_BLUE}40`,
                '&:hover': {
                  backgroundColor: PRIMARY_BLUE_DARK,
                  boxShadow: `0 6px 16px ${PRIMARY_BLUE}55`,
                },
              }}
            >
              {isEditMode ? 'Update Project' : 'Create Project'}
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          sx={{ borderRadius: '8px' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProjectFormPage;
