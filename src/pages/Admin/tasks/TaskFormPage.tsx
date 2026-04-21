// src/pages/tasks/TaskFormPage.tsx
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
import { Employee, useTasks } from 'context/TaskContext';
import paths from 'routes/paths';

// ─── Constants ────────────────────────────────────────────────────────────────
const mockEmployees: Employee[] = [
  { id: 1, name: 'John Doe', email: 'john.doe@company.com' },
  { id: 2, name: 'Jane Smith', email: 'jane.smith@company.com' },
  { id: 3, name: 'Mike Johnson', email: 'mike.j@company.com' },
  { id: 4, name: 'Emily Davis', email: 'emily.davis@company.com' },
  { id: 5, name: 'Robert Brown', email: 'robert.brown@company.com' },
];

const priorityOptions = ['High', 'Medium', 'Low'] as const;

// ─── Theme colors (same as ProjectFormPage) ───────────────────────────────────
const PRIMARY_BLUE = '#1E58E6';
const PRIMARY_BLUE_DARK = '#1A4CC4';
const PRIMARY_BLUE_LIGHT = '#E6F0FF';

// ─── Reusable sx: permanent blue outlined border ──────────────────────────────
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

// Select dropdowns: same + blue arrow icon
const selectSx = {
  ...fieldSx,
  '& .MuiOutlinedInput-root': {
    ...fieldSx['& .MuiOutlinedInput-root'],
    '& .MuiSelect-icon': {
      color: PRIMARY_BLUE,
    },
  },
};

const getPriorityColor = (p: string) => {
  if (p === 'High') return '#f44336';
  if (p === 'Medium') return '#ff9800';
  return '#2196f3';
};

// ─── Component ────────────────────────────────────────────────────────────────
const TaskFormPage = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { projects } = useProjects();
  const { addTask, updateTask, getTask } = useTasks();
  const isEditMode = !!taskId;

  const [formData, setFormData] = useState({
    projectId: '',
    title: '',
    priority: 'Medium' as 'High' | 'Medium' | 'Low',
    dueDate: '',
    assignedTo: mockEmployees[0],
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  useEffect(() => {
    if (isEditMode) {
      const task = getTask(taskId);
      if (task) {
        setFormData({
          projectId: task.projectId,
          title: task.title,
          priority: task.priority,
          dueDate: task.dueDate,
          assignedTo: task.assignedTo,
        });
      } else {
        setSnackbar({ open: true, message: 'Task not found', severity: 'error' });
        navigate(paths.allProjects);
      }
    }
  }, [taskId, isEditMode, getTask, navigate]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!formData.projectId || !formData.title || !formData.dueDate) {
      setSnackbar({
        open: true,
        message: 'Please fill all required fields: Project, Title, Due Date',
        severity: 'error',
      });
      return;
    }

    if (isEditMode) {
      updateTask(taskId, {
        projectId: formData.projectId,
        title: formData.title,
        priority: formData.priority,
        dueDate: formData.dueDate,
        assignedTo: formData.assignedTo,
      });
      setSnackbar({ open: true, message: 'Task updated successfully', severity: 'success' });
    } else {
      addTask({
        projectId: formData.projectId,
        title: formData.title,
        priority: formData.priority,
        dueDate: formData.dueDate,
        status: 'Pending',
        assignedTo: formData.assignedTo,
      });
      setSnackbar({ open: true, message: 'Task assigned successfully', severity: 'success' });
    }
    setTimeout(() => navigate(paths.allProjects), 1500);
  };

  const activeProjects = projects.filter((p) => p.status === 'Active');

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
          {/* ── Header ── */}
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: '#0f2a6e',
                fontSize: { xs: '1.2rem', sm: '1.4rem' },
              }}
            >
              {isEditMode ? 'Edit Task' : 'Assign New Task'}
            </Typography>
            <Typography variant="body2" sx={{ color: '#4a6fa5', mt: 0.5 }}>
              {isEditMode
                ? 'Update the task details below.'
                : 'Fill in the details below to assign a new task.'}
            </Typography>
          </Box>

          <Divider sx={{ mb: 3, borderColor: '#d0e0ff' }} />

          {/* ── Form Fields ── */}
          <Grid container spacing={2.5}>
            {/* Row 1 – Select Project (full width) */}
            <Grid size={12}>
              <FormControl fullWidth sx={selectSx}>
                <InputLabel>Project **</InputLabel>
                <Select
                  variant="outlined"
                  value={formData.projectId}
                  label="Project **"
                  onChange={(e) => handleChange('projectId', e.target.value)}
                >
                  {activeProjects.length === 0 ? (
                    <MenuItem disabled value="">
                      No active projects found
                    </MenuItem>
                  ) : (
                    activeProjects.map((project) => (
                      <MenuItem key={project.id} value={project.id}>
                        {project.projectName}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            </Grid>

            {/* Row 2 – Task Title (full width) */}
            <Grid size={12}>
              <TextField
                fullWidth
                variant="outlined"
                label="Task Title **"
                placeholder="e.g. Design landing page wireframe"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                required
                sx={fieldSx}
              />
            </Grid>

            {/* Row 3 – Priority | Due Date */}
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth sx={selectSx}>
                <InputLabel>Priority</InputLabel>
                <Select
                  variant="outlined"
                  value={formData.priority}
                  label="Priority"
                  onChange={(e) => handleChange('priority', e.target.value)}
                >
                  {priorityOptions.map((p) => (
                    <MenuItem key={p} value={p}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            backgroundColor: getPriorityColor(p),
                          }}
                        />
                        <span>{p}</span>
                      </Stack>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                variant="outlined"
                type="date"
                label="Due Date **"
                value={formData.dueDate}
                onChange={(e) => handleChange('dueDate', e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
                required
                sx={fieldSx}
              />
            </Grid>

            {/* Row 4 – Assign To (full width) */}
            <Grid size={12}>
              <Autocomplete
                options={mockEmployees}
                getOptionLabel={(option) => option.name}
                value={formData.assignedTo}
                onChange={(_, newValue) => handleChange('assignedTo', newValue || mockEmployees[0])}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    label="Assign To"
                    placeholder="Select an employee"
                    sx={fieldSx}
                  />
                )}
                sx={{
                  '& .MuiAutocomplete-clearIndicator, & .MuiAutocomplete-popupIndicator': {
                    color: PRIMARY_BLUE,
                  },
                }}
              />
            </Grid>
          </Grid>

          {/* ── Action Buttons ── */}
          <Divider sx={{ mt: 3.5, mb: 2.5, borderColor: '#d0e0ff' }} />

          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button
              variant="outlined"
              onClick={() => navigate(paths.allProjects)}
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
              {isEditMode ? 'Update Task' : 'Assign Task'}
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* ── Snackbar ── */}
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

export default TaskFormPage;
