import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
import { useAuth } from 'context/AuthContext';
import { useMeetings } from 'context/MeetingContext';
import { useProjects } from 'context/ProjectContext';
import { useTasks } from 'context/TaskContext';
import { UpdateType, useUpdates } from 'context/UpdateContext';

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const { tasks } = useTasks();
  const { projects } = useProjects();
  const { submitUpdate, getUpdatesForTask } = useUpdates();
  const { addMeeting, getMeetingsByEmployee } = useMeetings();
  const navigate = useNavigate();

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [updateType, setUpdateType] = useState<UpdateType>('Pending');
  const [description, setDescription] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const [meetingModalOpen, setMeetingModalOpen] = useState(false);
  const [meetingForm, setMeetingForm] = useState({
    projectId: '',
    title: '',
    notes: '',
    date: '',
    duration: 30,
  });

  // Filter tasks assigned to current user
  const myTasks = tasks.filter((t) => t.assignedTo.id === user?.id);

  const handleSubmitUpdate = () => {
    if (!selectedTaskId || !user) return;
    if (!description.trim()) {
      setSnackbar({ open: true, message: 'Please provide a description' });
      return;
    }
    submitUpdate({
      taskId: selectedTaskId,
      employeeId: String(user.id),
      type: updateType,
      description,
    });
    setSnackbar({ open: true, message: 'Update submitted (cannot be edited later)' });
    setSelectedTaskId(null);
    setDescription('');
  };

  const handleLogMeeting = () => {
    if (!meetingForm.title || !meetingForm.notes || !meetingForm.date || meetingForm.duration < 1) {
      setSnackbar({
        open: true,
        message: 'Please fill all fields and ensure duration >= 1 minute',
      });
      return;
    }
    addMeeting({
      employeeId: user!.id,
      projectId: meetingForm.projectId || undefined,
      date: meetingForm.date,
      title: meetingForm.title,
      notes: meetingForm.notes,
      duration: meetingForm.duration,
    });
    setMeetingModalOpen(false);
    setMeetingForm({ projectId: '', title: '', notes: '', date: '', duration: 30 });
    setSnackbar({ open: true, message: 'Meeting logged' });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Employee Dashboard
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        Welcome, {user?.name}
      </Typography>

      <Grid container spacing={3}>
        {/* Tasks Section */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              <Typography variant="h6">My Tasks</Typography>
              {myTasks.length === 0 && (
                <Typography color="text.secondary">No tasks assigned.</Typography>
              )}
              {myTasks.map((task) => {
                const taskUpdates = getUpdatesForTask(task.id);
                const project = projects.find((p) => p.id === task.projectId);
                return (
                  <Card key={task.id} variant="outlined" sx={{ mb: 2, p: 2 }}>
                    <Typography variant="subtitle1">
                      <strong>{task.title}</strong>
                    </Typography>
                    <Typography variant="body2">
                      Project: {project?.projectName || 'Unknown'}
                    </Typography>
                    <Typography variant="body2">
                      Priority: {task.priority} | Due: {new Date(task.dueDate).toLocaleDateString()}
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      Updates:
                    </Typography>
                    {taskUpdates.length === 0 && (
                      <Typography variant="caption">No updates yet.</Typography>
                    )}
                    {taskUpdates.map((up) => (
                      <Box key={up.id} sx={{ bgcolor: '#f5f5f5', p: 1, my: 1, borderRadius: 1 }}>
                        <Chip
                          label={up.type}
                          size="small"
                          color={
                            up.type === 'Completed'
                              ? 'success'
                              : up.type === 'Delayed'
                                ? 'error'
                                : 'warning'
                          }
                        />
                        <Typography variant="caption" display="block">
                          {new Date(up.createdAt).toLocaleString()}
                        </Typography>
                        <Typography variant="body2">{up.description}</Typography>
                        {up.status === 'rejected' && (
                          <Chip
                            label="Rejected by Admin"
                            size="small"
                            color="error"
                            sx={{ mt: 0.5 }}
                          />
                        )}
                      </Box>
                    ))}
                    {selectedTaskId === task.id ? (
                      <Stack spacing={2} sx={{ mt: 2 }}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Update Type</InputLabel>
                          <Select
                            value={updateType}
                            label="Update Type"
                            onChange={(e) => setUpdateType(e.target.value as UpdateType)}
                          >
                            <MenuItem value="Completed">Completed – Describe work done</MenuItem>
                            <MenuItem value="Delayed">Delayed – Explain why</MenuItem>
                            <MenuItem value="Pending">Pending – Work done + remaining</MenuItem>
                          </Select>
                        </FormControl>
                        <TextField
                          fullWidth
                          multiline
                          rows={3}
                          label={
                            updateType === 'Completed'
                              ? 'What work was completed?'
                              : updateType === 'Delayed'
                                ? 'Reason for delay'
                                : 'Work done so far & remaining tasks'
                          }
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                        />
                        <Stack direction="row" spacing={1}>
                          <Button variant="contained" onClick={handleSubmitUpdate}>
                            Submit Update
                          </Button>
                          <Button variant="outlined" onClick={() => setSelectedTaskId(null)}>
                            Cancel
                          </Button>
                        </Stack>
                      </Stack>
                    ) : (
                      <Button
                        size="small"
                        onClick={() => setSelectedTaskId(task.id)}
                        sx={{ mt: 1 }}
                      >
                        ➕ Daily Update
                      </Button>
                    )}
                  </Card>
                );
              })}
            </CardContent>
          </Card>
        </Grid>

        {/* Right Sidebar: Meetings & Project Info */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">Meetings</Typography>
                <Button size="small" onClick={() => setMeetingModalOpen(true)}>
                  + Log Meeting
                </Button>
              </Stack>
              {user && getMeetingsByEmployee(user.id).length === 0 && (
                <Typography color="text.secondary">No meetings logged.</Typography>
              )}
              {user &&
                getMeetingsByEmployee(user.id).map((meeting) => (
                  <Box key={meeting.id} sx={{ mt: 1, p: 1, bgcolor: '#f9f9f9', borderRadius: 1 }}>
                    <Typography variant="subtitle2">{meeting.title}</Typography>
                    <Typography variant="caption">
                      {meeting.date} • {meeting.duration} min
                    </Typography>
                    <Typography variant="body2">{meeting.notes}</Typography>
                  </Box>
                ))}
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6">My Projects</Typography>
              {user &&
                projects
                  .filter((p) => p.teamMembers.some((m) => m.id === user.id))
                  .map((project) => (
                    <Button
                      key={project.id}
                      fullWidth
                      variant="outlined"
                      sx={{ mb: 1, justifyContent: 'flex-start' }}
                      onClick={() => navigate(`/employee/projects/${project.id}`)}
                    >
                      {project.projectName}
                    </Button>
                  ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Meeting Modal with Duration Field */}
      <Dialog open={meetingModalOpen} onClose={() => setMeetingModalOpen(false)}>
        <DialogTitle>Log Meeting</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Date"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={meetingForm.date}
              onChange={(e) => setMeetingForm({ ...meetingForm, date: e.target.value })}
            />
            <TextField
              label="Title"
              fullWidth
              value={meetingForm.title}
              onChange={(e) => setMeetingForm({ ...meetingForm, title: e.target.value })}
            />
            <FormControl fullWidth>
              <InputLabel>Project (optional)</InputLabel>
              <Select
                value={meetingForm.projectId}
                label="Project (optional)"
                onChange={(e) => setMeetingForm({ ...meetingForm, projectId: e.target.value })}
              >
                <MenuItem value="">None</MenuItem>
                {user &&
                  projects
                    .filter((p) => p.teamMembers.some((m) => m.id === user.id))
                    .map((p) => (
                      <MenuItem key={p.id} value={p.id}>
                        {p.projectName}
                      </MenuItem>
                    ))}
              </Select>
            </FormControl>
            <TextField
              label="Duration (minutes)"
              type="number"
              fullWidth
              value={meetingForm.duration}
              onChange={(e) => setMeetingForm({ ...meetingForm, duration: Number(e.target.value) })}
              InputProps={{ inputProps: { min: 1 } }}
            />
            <TextField
              label="Notes"
              multiline
              rows={3}
              fullWidth
              value={meetingForm.notes}
              onChange={(e) => setMeetingForm({ ...meetingForm, notes: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMeetingModalOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleLogMeeting}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ open: false, message: '' })}
        message={snackbar.message}
      />
    </Box>
  );
};

export default EmployeeDashboard;
