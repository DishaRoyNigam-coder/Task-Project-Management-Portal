import { Box, Card, CardContent, Chip, Typography } from '@mui/material';
import { useAuth } from 'context/AuthContext';
import { useUpdates } from 'context/UpdateContext';

const EmployeeUpdateHistory = () => {
  const { updates } = useUpdates();
  const { user } = useAuth();
  const myUpdates = updates.filter((u) => u.employeeId === String(user?.id));

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4">My Update History</Typography>
      {myUpdates.map((update) => (
        <Card key={update.id} sx={{ mt: 2 }}>
          <CardContent>
            <Typography>Task: {update.taskId}</Typography>
            <Chip label={update.type} size="small" />
            <Typography>{update.description}</Typography>
            <Typography variant="caption">
              Submitted: {new Date(update.createdAt).toLocaleString()}
            </Typography>
            {update.status === 'rejected' && <Chip label="Rejected" color="error" />}
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};
export default EmployeeUpdateHistory;
