import { useNavigate } from 'react-router';
import { Box, Button, Stack, Typography } from '@mui/material';
import { useAuth } from 'context/AuthContext';
import { useProjects } from 'context/ProjectContext';

const EmployeeProjectList = () => {
  const { projects } = useProjects();
  const { user } = useAuth();
  const navigate = useNavigate();
  const myProjects = projects.filter((p) => p.teamMembers.some((m) => m.id === user?.id));

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4">My Projects</Typography>
      <Stack spacing={2} sx={{ mt: 2 }}>
        {myProjects.map((project) => (
          <Button
            key={project.id}
            variant="outlined"
            onClick={() => navigate(`/employee/projects/${project.id}`)}
          >
            {project.projectName}
          </Button>
        ))}
      </Stack>
    </Box>
  );
};
export default EmployeeProjectList;
