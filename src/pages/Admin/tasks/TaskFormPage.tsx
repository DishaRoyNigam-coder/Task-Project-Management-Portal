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

// Mock employees (same as in projects)
const mockEmployees: Employee[] = [
  { id: 1, name: 'John Doe', email: 'john.doe@company.com' },
  { id: 2, name: 'Jane Smith', email: 'jane.smith@company.com' },
  { id: 3, name: 'Mike Johnson', email: 'mike.j@company.com' },
  { id: 4, name: 'Emily Davis', email: 'emily.davis@company.com' },
  { id: 5, name: 'Robert Brown', email: 'robert.brown@company.com' },
];

const priorityOptions = ['High', 'Medium', 'Low'] as const;

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

  // Filter only active projects for assignment
  const activeProjects = projects.filter((p) => p.status === 'Active');

  return (
    <Box sx={{ p: 3 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            {isEditMode ? 'Edit Task' : 'Assign New Task'}
          </Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={12}>
              <FormControl fullWidth required>
                <InputLabel>Project *</InputLabel>
                <Select
                  value={formData.projectId}
                  label="Project *"
                  onChange={(e) => handleChange('projectId', e.target.value)}
                >
                  {activeProjects.map((project) => (
                    <MenuItem key={project.id} value={project.id}>
                      {project.projectName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                label="Task Title *"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={formData.priority}
                  label="Priority"
                  onChange={(e) => handleChange('priority', e.target.value)}
                >
                  {priorityOptions.map((p) => (
                    <MenuItem key={p} value={p}>
                      {p}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                type="date"
                label="Due Date *"
                value={formData.dueDate}
                onChange={(e) => handleChange('dueDate', e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
                required
              />
            </Grid>
            <Grid size={12}>
              <Autocomplete
                options={mockEmployees}
                getOptionLabel={(option) => option.name}
                value={formData.assignedTo}
                onChange={(_, newValue) => handleChange('assignedTo', newValue || mockEmployees[0])}
                renderInput={(params) => <TextField {...params} label="Assign To" />}
              />
            </Grid>
          </Grid>
          <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
            <Button variant="outlined" onClick={() => navigate(paths.allProjects)}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleSubmit}>
              {isEditMode ? 'Update Task' : 'Assign Task'}
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

export default TaskFormPage;
