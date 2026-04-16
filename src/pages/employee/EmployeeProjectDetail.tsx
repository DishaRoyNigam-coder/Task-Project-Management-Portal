import { useNavigate, useParams } from 'react-router';
import { Box, Button, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import { useProjects } from 'context/ProjectContext';

const EmployeeProjectDetail = () => {
  const { projectId } = useParams();
  const { projects } = useProjects();
  const navigate = useNavigate();
  const project = projects.find((p) => p.id === projectId);

  if (!project) return <Typography>Project not found</Typography>;

  return (
    <Box sx={{ p: 3 }}>
      <Button onClick={() => navigate('/employee/dashboard')}>← Back</Button>
      <Typography variant="h4" gutterBottom>
        {project.projectName}
      </Typography>
      <Chip label={project.status} color={project.status === 'Active' ? 'success' : 'default'} />
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography variant="h6">Client: {project.clientName}</Typography>
          <Typography variant="body2">Phase: {project.projectPhase}</Typography>
          <Typography variant="body2">
            Drive:{' '}
            <a href={project.driveLink} target="_blank">
              Open Folder
            </a>
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Notes: {project.projectNotes || 'No notes'}
          </Typography>
          <Typography variant="subtitle2" sx={{ mt: 2 }}>
            Team Members:
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {project.teamMembers.map((m) => (
              <Chip key={m.id} label={m.name} variant="outlined" />
            ))}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default EmployeeProjectDetail;
