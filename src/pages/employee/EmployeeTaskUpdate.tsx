import { useEffect, useState } from 'react';
import {
  CheckCircle as CompletedIcon,
  Warning as DelayedIcon,
  History as HistoryIcon,
  Pending as PendingIcon,
  Block as RejectedIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  FormControlLabel,
  InputLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useAuth } from 'context/AuthContext';
import { useTasks } from 'context/TaskContext';
import { UpdateType, useUpdates } from 'context/UpdateContext';

const EmployeeTaskUpdate = () => {
  const { user } = useAuth();
  const { tasks } = useTasks();
  const { submitUpdate, updates, loading: updatesLoading } = useUpdates();

  // Form state
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [updateType, setUpdateType] = useState<UpdateType>('Pending');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter tasks assigned to current user
  const myTasks = tasks.filter((task) => task.assignedTo.id === user?.id);

  // Reset form when selected task changes
  useEffect(() => {
    setDescription('');
    setUpdateType('Pending');
    setSubmitSuccess(false);
    setError(null);
  }, [selectedTaskId]);

  // Get updates for the selected task
  const taskUpdates = selectedTaskId
    ? updates
        .filter((up) => up.taskId === selectedTaskId && up.employeeId === String(user?.id))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    : [];

  const handleSubmit = async () => {
    if (!selectedTaskId) {
      setError('Please select a task');
      return;
    }
    if (!description.trim()) {
      setError('Please provide a description');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await submitUpdate({
        taskId: selectedTaskId,
        employeeId: String(user!.id),
        type: updateType,
        description: description.trim(),
      });
      setSubmitSuccess(true);
      // Clear form but keep task selected so user can see the new update in history
      setDescription('');
      setUpdateType('Pending');
    } catch (err) {
      setError('Failed to submit update. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getUpdateIcon = (type: UpdateType, status?: string) => {
    if (status === 'rejected') return <RejectedIcon color="error" />;
    switch (type) {
      case 'Completed':
        return <CompletedIcon color="success" />;
      case 'Delayed':
        return <DelayedIcon color="error" />;
      default:
        return <PendingIcon color="warning" />;
    }
  };

  const getUpdateChip = (type: UpdateType, status?: string) => {
    if (status === 'rejected')
      return <Chip label="Rejected" size="small" color="error" variant="outlined" />;
    return (
      <Chip
        label={type}
        size="small"
        color={type === 'Completed' ? 'success' : type === 'Delayed' ? 'error' : 'warning'}
      />
    );
  };

  if (myTasks.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">
          You have no tasks assigned yet. Updates will appear here once tasks are assigned.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 900, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Submit Task Update
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Select a task, provide an update, and submit. Updates cannot be edited after submission.
      </Typography>

      <Stack spacing={3}>
        {/* Task Selection */}
        <Card>
          <CardContent>
            <FormControl fullWidth>
              <InputLabel id="task-select-label">Select Task</InputLabel>
              <Select
                labelId="task-select-label"
                value={selectedTaskId}
                label="Select Task"
                onChange={(e) => setSelectedTaskId(e.target.value)}
              >
                {myTasks.map((task) => (
                  <MenuItem key={task.id} value={task.id}>
                    {task.title} (Due: {new Date(task.dueDate).toLocaleDateString()})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </CardContent>
        </Card>

        {selectedTaskId && (
          <>
            {/* Update Form */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  New Update
                </Typography>
                <Stack spacing={2}>
                  <FormControl component="fieldset">
                    <Typography variant="subtitle2" gutterBottom>
                      Update Type
                    </Typography>
                    <RadioGroup
                      row
                      value={updateType}
                      onChange={(e) => setUpdateType(e.target.value as UpdateType)}
                    >
                      <FormControlLabel
                        value="Pending"
                        control={<Radio />}
                        label="Pending (Work done + remaining)"
                      />
                      <FormControlLabel
                        value="Delayed"
                        control={<Radio />}
                        label="Delayed (Explain why)"
                      />
                      <FormControlLabel
                        value="Completed"
                        control={<Radio />}
                        label="Completed (Describe work done)"
                      />
                    </RadioGroup>
                  </FormControl>

                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Description"
                    placeholder={
                      updateType === 'Completed'
                        ? 'Describe what work was completed...'
                        : updateType === 'Delayed'
                          ? 'Explain the reason for delay...'
                          : 'What work has been done so far? What remains?'
                    }
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={isSubmitting || submitSuccess}
                  />

                  {error && <Alert severity="error">{error}</Alert>}
                  {submitSuccess && (
                    <Alert severity="success">
                      Update submitted successfully! You cannot edit it now.
                    </Alert>
                  )}

                  <Button
                    variant="contained"
                    startIcon={isSubmitting ? <CircularProgress size={20} /> : <SendIcon />}
                    onClick={handleSubmit}
                    disabled={isSubmitting || submitSuccess || !description.trim()}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Update'}
                  </Button>
                </Stack>
              </CardContent>
            </Card>

            {/* Update History (read-only) */}
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <HistoryIcon color="action" />
                  <Typography variant="h6">Update History</Typography>
                </Stack>

                {updatesLoading && (
                  <CircularProgress size={24} sx={{ display: 'block', mx: 'auto', my: 2 }} />
                )}

                {!updatesLoading && taskUpdates.length === 0 && (
                  <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                    No updates submitted for this task yet.
                  </Typography>
                )}

                {taskUpdates.length > 0 && (
                  <Paper variant="outlined" sx={{ maxHeight: 400, overflow: 'auto' }}>
                    <List disablePadding>
                      {taskUpdates.map((update, index) => (
                        <div key={update.id}>
                          {index > 0 && <Divider />}
                          <ListItem alignItems="flex-start">
                            <ListItemIcon sx={{ minWidth: 40 }}>
                              {getUpdateIcon(update.type, update.status)}
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Stack
                                  direction="row"
                                  spacing={1}
                                  alignItems="center"
                                  flexWrap="wrap"
                                >
                                  <Typography variant="subtitle2" component="span">
                                    {new Date(update.createdAt).toLocaleString()}
                                  </Typography>
                                  {getUpdateChip(update.type, update.status)}
                                </Stack>
                              }
                              secondary={
                                <Typography
                                  variant="body2"
                                  sx={{ whiteSpace: 'pre-wrap', mt: 0.5 }}
                                >
                                  {update.description}
                                </Typography>
                              }
                            />
                          </ListItem>
                        </div>
                      ))}
                    </List>
                  </Paper>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </Stack>
    </Box>
  );
};

export default EmployeeTaskUpdate;
