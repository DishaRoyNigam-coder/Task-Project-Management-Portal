import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Link as RouterLink } from 'react-router-dom';
import {
  Add as AddIcon,
  DeleteOutline as DeleteIcon,
  Edit as EditIcon,
  Link as LinkIcon,
  Task as TaskIcon,
  Update as UpdateIcon,
} from '@mui/icons-material';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardHeader,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Snackbar,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useUpdates } from 'context/UpdateContext';
import paths from 'routes/paths';

// ------------------------------
// Type Definitions
// ------------------------------
interface Employee {
  id: string;
  name: string;
  email: string;
}

interface Project {
  id: string;
  projectName: string;
  clientName: string;
  teamMembers: Employee[];
  driveLink: string;
  projectNotes: string;
  projectPhase: string;
  status: 'Active' | 'Completed' | 'Archived';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface Task {
  id: string;
  projectId: string;
  title: string;
  priority: 'High' | 'Medium' | 'Low';
  dueDate: string;
  assignedTo: Employee;
}

// ------------------------------
// Mock Data
// ------------------------------
const mockEmployees: Employee[] = [
  { id: 'emp1', name: 'John Doe', email: 'john.doe@company.com' },
  { id: 'emp2', name: 'Jane Smith', email: 'jane.smith@company.com' },
  { id: 'emp3', name: 'Mike Johnson', email: 'mike.j@company.com' },
  { id: 'emp4', name: 'Emily Davis', email: 'emily.davis@company.com' },
  { id: 'emp5', name: 'Robert Brown', email: 'robert.brown@company.com' },
];

const initialProjects: Project[] = [
  {
    id: 'proj1',
    projectName: 'Mobile Banking App',
    clientName: 'FinBank Corp',
    teamMembers: [mockEmployees[0], mockEmployees[1]],
    driveLink: 'https://drive.google.com/drive/folders/abc123',
    projectNotes: 'Implement biometric login and transaction history',
    projectPhase: 'Development',
    status: 'Active',
    createdBy: 'Admin User',
    createdAt: '2025-03-01T10:00:00Z',
    updatedAt: '2025-03-15T14:30:00Z',
  },
  {
    id: 'proj2',
    projectName: 'E-commerce Platform',
    clientName: 'ShopStream',
    teamMembers: [mockEmployees[2], mockEmployees[3]],
    driveLink: 'https://drive.google.com/drive/folders/def456',
    projectNotes: 'Integrate payment gateway and inventory system',
    projectPhase: 'Planning',
    status: 'Active',
    createdBy: 'Admin User',
    createdAt: '2025-03-10T09:15:00Z',
    updatedAt: '2025-03-10T09:15:00Z',
  },
];

const initialTasks: Task[] = [
  {
    id: 'task1',
    projectId: 'proj1',
    title: 'Design login UI',
    priority: 'High',
    dueDate: '2025-04-10',
    assignedTo: mockEmployees[0],
  },
  {
    id: 'task2',
    projectId: 'proj1',
    title: 'Implement API integration',
    priority: 'Medium',
    dueDate: '2025-04-15',
    assignedTo: mockEmployees[1],
  },
];

const projectPhases = ['Planning', 'Development', 'Testing', 'Deployment', 'Maintenance'];
const statusOptions: Project['status'][] = ['Active', 'Completed', 'Archived'];
const priorityOptions: Task['priority'][] = ['High', 'Medium', 'Low'];

// ------------------------------
// Helper Functions
// ------------------------------
const formatDate = (isoString: string) => new Date(isoString).toLocaleDateString();

// ------------------------------
// Main Component
// ------------------------------
const AllProjects = () => {
  const navigate = useNavigate();
  // State
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [activeTab, setActiveTab] = useState(0);

  // Context for task updates
  const { updates, rejectUpdate } = useUpdates();
  // Project modal state
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projectForm, setProjectForm] = useState<Partial<Project>>({
    projectName: '',
    clientName: '',
    teamMembers: [],
    driveLink: '',
    projectNotes: '',
    projectPhase: 'Planning',
    status: 'Active',
  });

  // Task modal state
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskForm, setTaskForm] = useState<Partial<Task>>({
    projectId: '',
    title: '',
    priority: 'Medium',
    dueDate: '',
    assignedTo: mockEmployees[0],
  });

  // Snackbar
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Helper to get task title (using local tasks state for consistency)
  const getTaskTitle = (taskId: string) => tasks.find((t) => t.id === taskId)?.title || 'Unknown';

  // ----------------------------
  // Project Handlers
  // ----------------------------
  const handleOpenProjectModal = (project?: Project) => {
    if (project) {
      setEditingProject(project);
      setProjectForm({
        projectName: project.projectName,
        clientName: project.clientName,
        teamMembers: project.teamMembers,
        driveLink: project.driveLink,
        projectNotes: project.projectNotes,
        projectPhase: project.projectPhase,
        status: project.status,
      });
    } else {
      setEditingProject(null);
      setProjectForm({
        projectName: '',
        clientName: '',
        teamMembers: [],
        driveLink: '',
        projectNotes: '',
        projectPhase: 'Planning',
        status: 'Active',
      });
    }
    setProjectModalOpen(true);
  };

  const handleSaveProject = () => {
    if (!projectForm.projectName || !projectForm.clientName || !projectForm.driveLink) {
      setSnackbar({
        open: true,
        message: 'Please fill required fields (Name, Client, Drive Link)',
        severity: 'error',
      });
      return;
    }

    const now = new Date().toISOString();
    if (editingProject) {
      setProjects(
        projects.map((p) =>
          p.id === editingProject.id
            ? {
                ...p,
                ...(projectForm as Project),
                id: p.id,
                createdBy: p.createdBy,
                createdAt: p.createdAt,
                updatedAt: now,
              }
            : p,
        ),
      );
      setSnackbar({ open: true, message: 'Project updated successfully', severity: 'success' });
    } else {
      const newProject: Project = {
        id: `proj_${Date.now()}`,
        projectName: projectForm.projectName!,
        clientName: projectForm.clientName!,
        teamMembers: projectForm.teamMembers as Employee[],
        driveLink: projectForm.driveLink!,
        projectNotes: projectForm.projectNotes || '',
        projectPhase: projectForm.projectPhase!,
        status: projectForm.status as Project['status'],
        createdBy: 'Admin User',
        createdAt: now,
        updatedAt: now,
      };
      setProjects([newProject, ...projects]);
      setSnackbar({ open: true, message: 'Project created successfully', severity: 'success' });
    }
    setProjectModalOpen(false);
  };

  const handleDeleteProject = (projectId: string) => {
    // Confirm deletion
    if (
      window.confirm(
        'Are you sure you want to delete this project? This will also delete all associated tasks.',
      )
    ) {
      // Remove project
      setProjects(projects.filter((p) => p.id !== projectId));
      // Remove associated tasks
      setTasks(tasks.filter((t) => t.projectId !== projectId));
      setSnackbar({ open: true, message: 'Project deleted successfully', severity: 'success' });
    }
  };

  const handleStatusChange = (projectId: string, newStatus: Project['status']) => {
    setProjects(
      projects.map((p) =>
        p.id === projectId ? { ...p, status: newStatus, updatedAt: new Date().toISOString() } : p,
      ),
    );
    setSnackbar({ open: true, message: `Status changed to ${newStatus}`, severity: 'success' });
  };

  // ----------------------------
  // Task Handlers
  // ----------------------------
  const handleSaveTask = () => {
    if (!taskForm.projectId || !taskForm.title || !taskForm.dueDate) {
      setSnackbar({
        open: true,
        message: 'Please fill Project, Title, and Due Date',
        severity: 'error',
      });
      return;
    }
    const newTask: Task = {
      id: `task_${Date.now()}`,
      projectId: taskForm.projectId!,
      title: taskForm.title!,
      priority: taskForm.priority!,
      dueDate: taskForm.dueDate!,
      assignedTo: taskForm.assignedTo!,
    };
    setTasks([newTask, ...tasks]);
    setSnackbar({ open: true, message: 'Task assigned successfully', severity: 'success' });
    setTaskModalOpen(false);
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter((t) => t.id !== taskId));
    setSnackbar({ open: true, message: 'Task deleted', severity: 'success' });
  };

  const getProjectName = (projectId: string) =>
    projects.find((p) => p.id === projectId)?.projectName || 'Unknown';

  // ----------------------------
  // Update Reject Handler
  // ----------------------------
  const handleRejectUpdate = (updateId: string) => {
    rejectUpdate(updateId);
    setSnackbar({ open: true, message: 'Task update rejected', severity: 'success' });
  };

  // ----------------------------
  // Rendering
  // ----------------------------
  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate(paths.projects.new)}
        >
          New Project
        </Button>
      </Stack>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
          <Tab label="Projects" icon={<TaskIcon />} iconPosition="start" />
          <Tab label="Tasks" icon={<AddIcon />} iconPosition="start" />
          <Tab label="Task Updates" icon={<UpdateIcon />} iconPosition="start" />
        </Tabs>
      </Paper>

      {/* Projects Tab */}
      {activeTab === 0 && (
        <Card>
          <CardHeader title="All Projects" subheader="Manage projects, change status, or delete" />
          <Divider />
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Project Name</TableCell>
                  <TableCell>Client</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Phase</TableCell>
                  <TableCell>Team</TableCell>
                  <TableCell>Drive</TableCell>
                  <TableCell>Last Updated</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {projects.map((project) => (
                  <TableRow key={project.id} hover>
                    <TableCell>
                      <Button
                        component={RouterLink}
                        to={`/projects/${project.id}`}
                        sx={{ textTransform: 'none', fontWeight: 'bold', p: 0, minWidth: 'auto' }}
                      >
                        {project.projectName}
                      </Button>
                      <Typography variant="caption" color="text.secondary" display="block">
                        {project.projectNotes.substring(0, 40)}...
                      </Typography>
                    </TableCell>
                    <TableCell>{project.clientName}</TableCell>
                    <TableCell>
                      <Select
                        size="small"
                        value={project.status}
                        onChange={(e: SelectChangeEvent) =>
                          handleStatusChange(project.id, e.target.value as Project['status'])
                        }
                        sx={{ minWidth: 110 }}
                      >
                        {statusOptions.map((opt) => (
                          <MenuItem key={opt} value={opt}>
                            <Chip
                              label={opt}
                              color={
                                opt === 'Active'
                                  ? 'success'
                                  : opt === 'Completed'
                                    ? 'info'
                                    : 'default'
                              }
                              size="small"
                            />
                          </MenuItem>
                        ))}
                      </Select>
                    </TableCell>
                    <TableCell>{project.projectPhase}</TableCell>
                    <TableCell>
                      <Tooltip title={project.teamMembers.map((m) => m.name).join(', ')}>
                        <Chip
                          label={`${project.teamMembers.length} members`}
                          size="small"
                          variant="outlined"
                        />
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        href={project.driveLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        color="primary"
                      >
                        <LinkIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                    <TableCell>{formatDate(project.updatedAt)}</TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={0.5} justifyContent="center">
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => handleOpenProjectModal(project)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" onClick={() => handleDeleteProject(project.id)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {projects.length === 0 && (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">
                No projects yet. Click "New Project" to create one.
              </Typography>
            </Box>
          )}
        </Card>
      )}

      {/* Tasks Tab */}
      {activeTab === 1 && (
        <Card>
          <CardHeader
            title="Task Management"
            subheader="Assign tasks to team members"
            action={
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate(paths.tasks.new)}
              >
                Assign Task
              </Button>
            }
          />
          <Divider />
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Task Title</TableCell>
                  <TableCell>Project</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Due Date</TableCell>
                  <TableCell>Assigned To</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow key={task.id} hover>
                    <TableCell>{task.title}</TableCell>
                    <TableCell>{getProjectName(task.projectId)}</TableCell>
                    <TableCell>
                      <Chip
                        label={task.priority}
                        color={
                          task.priority === 'High'
                            ? 'error'
                            : task.priority === 'Medium'
                              ? 'warning'
                              : 'info'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{new Date(task.dueDate).toLocaleDateString()}</TableCell>
                    <TableCell>{task.assignedTo.name}</TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteTask(task.id)}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {tasks.length === 0 && (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">
                No tasks assigned. Click "Assign Task" to create one.
              </Typography>
            </Box>
          )}
        </Card>
      )}

      {/* Task Updates Tab */}
      {activeTab === 2 && (
        <Card>
          <CardHeader
            title="Employee Task Updates"
            subheader="Review and reject unsatisfactory updates"
          />
          <Divider />
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Task</TableCell>
                  <TableCell>Employee</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Submitted</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {updates
                  .filter((up) => up.status === 'pending')
                  .map((update) => {
                    const task = tasks.find((t) => t.id === update.taskId);
                    return (
                      <TableRow key={update.id}>
                        <TableCell>{getTaskTitle(update.taskId)}</TableCell>
                        <TableCell>{task?.assignedTo.name || 'Unknown'}</TableCell>
                        <TableCell>
                          <Chip
                            label={update.type}
                            size="small"
                            color={
                              update.type === 'Completed'
                                ? 'success'
                                : update.type === 'Delayed'
                                  ? 'error'
                                  : 'warning'
                            }
                          />
                        </TableCell>
                        <TableCell>{update.description}</TableCell>
                        <TableCell>{new Date(update.createdAt).toLocaleString()}</TableCell>
                        <TableCell>
                          <Chip label="Pending" color="warning" size="small" />
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            onClick={() => handleRejectUpdate(update.id)}
                          >
                            Reject
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                {updates.filter((up) => up.status === 'pending').length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No pending updates
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* Project Create/Edit Modal */}
      <Dialog
        open={projectModalOpen}
        onClose={() => setProjectModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{editingProject ? 'Edit Project' : 'Create New Project'}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Project Name *"
                value={projectForm.projectName || ''}
                onChange={(e) => setProjectForm({ ...projectForm, projectName: e.target.value })}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Client Name *"
                value={projectForm.clientName || ''}
                onChange={(e) => setProjectForm({ ...projectForm, clientName: e.target.value })}
                required
              />
            </Grid>
            <Grid size={12}>
              <Autocomplete
                multiple
                options={mockEmployees}
                getOptionLabel={(option) => option.name}
                value={projectForm.teamMembers || []}
                onChange={(_, newValue) =>
                  setProjectForm({ ...projectForm, teamMembers: newValue })
                }
                renderInput={(params) => (
                  <TextField {...params} label="Team Members" placeholder="Select employees" />
                )}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                label="Google Drive Link *"
                value={projectForm.driveLink || ''}
                onChange={(e) => setProjectForm({ ...projectForm, driveLink: e.target.value })}
                required
                helperText="Mandatory Google Drive folder link"
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                label="Project Notes"
                multiline
                rows={2}
                value={projectForm.projectNotes || ''}
                onChange={(e) => setProjectForm({ ...projectForm, projectNotes: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Project Phase</InputLabel>
                <Select
                  value={projectForm.projectPhase || 'Planning'}
                  label="Project Phase"
                  onChange={(e) => setProjectForm({ ...projectForm, projectPhase: e.target.value })}
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
                  value={projectForm.status || 'Active'}
                  label="Status"
                  onChange={(e) =>
                    setProjectForm({ ...projectForm, status: e.target.value as Project['status'] })
                  }
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
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProjectModalOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveProject}>
            {editingProject ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Task Assignment Modal */}
      <Dialog open={taskModalOpen} onClose={() => setTaskModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign New Task</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <FormControl fullWidth>
              <InputLabel>Project *</InputLabel>
              <Select
                value={taskForm.projectId || ''}
                label="Project *"
                onChange={(e) => setTaskForm({ ...taskForm, projectId: e.target.value })}
              >
                {projects
                  .filter((p) => p.status === 'Active')
                  .map((proj) => (
                    <MenuItem key={proj.id} value={proj.id}>
                      {proj.projectName}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Task Title *"
              value={taskForm.title || ''}
              onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
              required
            />
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={taskForm.priority || 'Medium'}
                label="Priority"
                onChange={(e) =>
                  setTaskForm({ ...taskForm, priority: e.target.value as Task['priority'] })
                }
              >
                {priorityOptions.map((p) => (
                  <MenuItem key={p} value={p}>
                    <Chip
                      label={p}
                      size="small"
                      color={p === 'High' ? 'error' : p === 'Medium' ? 'warning' : 'info'}
                    />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              type="date"
              label="Due Date *"
              value={taskForm.dueDate || ''}
              onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
            <Autocomplete
              options={mockEmployees}
              getOptionLabel={(option) => option.name}
              value={taskForm.assignedTo || mockEmployees[0]}
              onChange={(_, newValue) =>
                setTaskForm({ ...taskForm, assignedTo: newValue || mockEmployees[0] })
              }
              renderInput={(params) => <TextField {...params} label="Assign To" />}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTaskModalOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveTask}>
            Assign Task
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar Notifications */}
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

export default AllProjects;
