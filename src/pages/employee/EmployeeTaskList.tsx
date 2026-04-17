import { Box, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import { useAuth } from 'context/AuthContext';
import { useTasks } from 'context/TaskContext';

const EmployeeTaskList = () => {
  const { tasks } = useTasks();
  const { user } = useAuth();
  const myTasks = tasks.filter((t) => t.assignedTo.id === user?.id);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4">My Tasks</Typography>
      <Stack spacing={2} sx={{ mt: 2 }}>
        {myTasks.map((task) => (
          <Card key={task.id}>
            <CardContent>
              <Typography variant="h6">{task.title}</Typography>
              <Chip label={task.status} size="small" />
              <Typography>Due: {new Date(task.dueDate).toLocaleDateString()}</Typography>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
};
export default EmployeeTaskList;
