import { useState } from 'react';
import {
  CheckCircle as ApprovedIcon,
  History as HistoryIcon,
  Pending as PendingIcon,
  Cancel as RejectedIcon,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  Typography,
} from '@mui/material';
import { useAuth } from 'context/AuthContext';
import { useTasks } from 'context/TaskContext';
import { useUpdates } from 'context/UpdateContext';

type FilterStatus = 'all' | 'pending' | 'approved' | 'rejected';

const EmployeeUpdateHistory = () => {
  const { updates } = useUpdates();
  const { tasks } = useTasks();
  const { user } = useAuth();

  const [filter, setFilter] = useState<FilterStatus>('all');

  // Get updates for current employee
  const myUpdates = updates.filter((u) => u.employeeId === String(user?.id));

  // Helper to get task title
  const getTaskTitle = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    return task?.title || 'Unknown Task';
  };

  // Filter updates based on status
  const filteredUpdates = myUpdates.filter((update) => {
    if (filter === 'all') return true;
    return update.status === filter;
  });

  // Sort by newest first
  const sortedUpdates = [...filteredUpdates].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <ApprovedIcon color="success" />;
      case 'rejected':
        return <RejectedIcon color="error" />;
      default:
        return <PendingIcon color="warning" />;
    }
  };

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'approved':
        return <Chip label="Approved" size="small" color="success" />;
      case 'rejected':
        return <Chip label="Rejected" size="small" color="error" />;
      default:
        return <Chip label="Pending" size="small" color="warning" />;
    }
  };

  const getTypeChip = (type: string) => {
    switch (type) {
      case 'Completed':
        return <Chip label="Completed" size="small" color="success" variant="outlined" />;
      case 'Delayed':
        return <Chip label="Delayed" size="small" color="error" variant="outlined" />;
      default:
        return <Chip label="Pending" size="small" color="warning" variant="outlined" />;
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1000, mx: 'auto' }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3 }}
      >
        <Typography variant="h4" gutterBottom>
          My Update History
        </Typography>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={filter}
            label="Status"
            onChange={(e: SelectChangeEvent) => setFilter(e.target.value as FilterStatus)}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="approved">Approved</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {sortedUpdates.length === 0 ? (
        <Alert severity="info" icon={<HistoryIcon />}>
          No updates found for the selected filter.
        </Alert>
      ) : (
        <Card>
          <CardContent>
            <List disablePadding>
              {sortedUpdates.map((update, index) => (
                <div key={update.id}>
                  {index > 0 && <Divider sx={{ my: 1 }} />}
                  <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      {getStatusIcon(update.status)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          flexWrap="wrap"
                          sx={{ mb: 0.5 }}
                        >
                          <Typography variant="subtitle1" component="span" fontWeight="medium">
                            {getTaskTitle(update.taskId)}
                          </Typography>
                          {getTypeChip(update.type)}
                          {getStatusChip(update.status)}
                        </Stack>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" sx={{ mt: 0.5, whiteSpace: 'pre-wrap' }}>
                            {update.description}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: 'block', mt: 0.5 }}
                          >
                            Submitted: {new Date(update.createdAt).toLocaleString()}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                </div>
              ))}
            </List>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default EmployeeUpdateHistory;
