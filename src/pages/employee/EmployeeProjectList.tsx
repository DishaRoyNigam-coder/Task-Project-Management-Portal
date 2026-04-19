import { useNavigate } from 'react-router';
import {
  FolderOpen as FolderIcon,
  People as PeopleIcon,
  Timeline as PhaseIcon,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material';
import { useAuth } from 'context/AuthContext';
import { useProjects } from 'context/ProjectContext';
import { useTasks } from 'context/TaskContext';

const EmployeeProjectList = () => {
  const { projects } = useProjects();
  const { tasks } = useTasks();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Filter projects where current employee is a team member
  const myProjects = projects.filter((p) => p.teamMembers.some((member) => member.id === user?.id));

  // Helper: get project completion percentage based on tasks
  const getProjectProgress = (projectId: string) => {
    const projectTasks = tasks.filter((t) => t.projectId === projectId);
    if (projectTasks.length === 0) return 0;
    const completed = projectTasks.filter((t) => t.status === 'Done').length;
    return Math.round((completed / projectTasks.length) * 100);
  };

  // Helper: get status chip color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Completed':
        return 'info';
      case 'Archived':
        return 'default';
      default:
        return 'default';
    }
  };

  if (myProjects.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="info" icon={<FolderIcon />}>
          <Typography variant="h6" gutterBottom>
            No Projects Assigned
          </Typography>
          <Typography variant="body2">
            You are not yet a member of any project. Contact your admin for assignments.
          </Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h4" gutterBottom>
        My Projects
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Projects where you are a team member – click on any project to view details, tasks, and
        resources.
      </Typography>

      <Grid container spacing={3}>
        {myProjects.map((project) => {
          const progress = getProjectProgress(project.id);
          return (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={project.id}>
              <Card
                elevation={2}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  {/* Project Name & Status */}
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ mb: 1 }}
                  >
                    <Typography variant="h6" component="div" fontWeight="bold" noWrap>
                      {project.projectName}
                    </Typography>
                    <Chip
                      label={project.status}
                      size="small"
                      color={getStatusColor(project.status)}
                    />
                  </Stack>

                  {/* Client */}
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Client: {project.clientName}
                  </Typography>

                  {/* Project Phase */}
                  <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 1 }}>
                    <PhaseIcon fontSize="small" color="action" />
                    <Typography variant="body2">Phase: {project.projectPhase}</Typography>
                  </Stack>

                  {/* Team Members Count */}
                  <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 2 }}>
                    <PeopleIcon fontSize="small" color="action" />
                    <Typography variant="body2">
                      Team: {project.teamMembers.length} member
                      {project.teamMembers.length !== 1 && 's'}
                    </Typography>
                  </Stack>

                  {/* Progress Bar */}
                  <Box sx={{ mt: 1, mb: 2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="caption" color="text.secondary">
                        Completion
                      </Typography>
                      <Typography variant="caption" fontWeight="bold">
                        {progress}%
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={progress}
                      sx={{ height: 6, borderRadius: 3, mt: 0.5 }}
                    />
                  </Box>

                  {/* View Details Button */}
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => navigate(`/employee/projects/${project.id}`)}
                    startIcon={<FolderIcon />}
                    sx={{ mt: 1 }}
                  >
                    View Project
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default EmployeeProjectList;
