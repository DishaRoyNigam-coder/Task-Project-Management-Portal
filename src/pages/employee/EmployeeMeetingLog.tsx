import { useState } from 'react';
import {
  Add as AddIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  History as HistoryIcon,
  MeetingRoom as MeetingIcon,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Collapse,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useAuth } from 'context/AuthContext';
import { useMeetings } from 'context/MeetingContext';
import { useProjects } from 'context/ProjectContext';

const EmployeeMeetingLog = () => {
  const { user } = useAuth();
  const { addMeeting, getMeetingsByEmployee, loading: meetingsLoading } = useMeetings();
  const { projects } = useProjects();

  // Form state
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [title, setTitle] = useState('');
  const [projectId, setProjectId] = useState('');
  const [notes, setNotes] = useState('');
  const [duration, setDuration] = useState<number>(30); // default 30 minutes
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // History visibility
  const [showHistory, setShowHistory] = useState(true);

  // Get employee's meetings
  const myMeetings = user ? getMeetingsByEmployee(user.id) : [];

  // Projects assigned to this employee (for dropdown)
  const myProjects = projects.filter((p) => p.teamMembers.some((member) => member.id === user?.id));

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError('Meeting title is required');
      return;
    }
    if (!notes.trim()) {
      setError('Meeting notes are required');
      return;
    }
    if (!date) {
      setError('Meeting date is required');
      return;
    }
    if (duration < 1) {
      setError('Duration must be at least 1 minute');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await addMeeting({
        employeeId: user!.id,
        projectId: projectId || undefined,
        date,
        title: title.trim(),
        notes: notes.trim(),
        duration,
      });
      setSubmitSuccess(true);
      // Reset form (keep project selection maybe)
      setTitle('');
      setNotes('');
      setDate(new Date().toISOString().slice(0, 10));
      setProjectId('');
      setDuration(30);
      // Auto-hide success after 3 seconds
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (err) {
      setError('Failed to log meeting. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getProjectName = (pid: string | undefined) => {
    if (!pid) return 'General (no project)';
    const proj = projects.find((p) => p.id === pid);
    return proj?.projectName || 'Unknown project';
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 900, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Log a Meeting
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Record meeting details, including duration, project association, and summary notes.
      </Typography>

      <Stack spacing={3}>
        {/* Meeting Form */}
        <Card>
          <CardContent>
            <Stack spacing={2}>
              <TextField
                label="Date"
                type="date"
                fullWidth
                value={date}
                onChange={(e) => setDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                required
              />
              <TextField
                label="Meeting Title *"
                fullWidth
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Sprint Planning, Client Sync, Design Review"
                required
              />
              <FormControl fullWidth>
                <InputLabel>Project (optional)</InputLabel>
                <Select
                  value={projectId}
                  label="Project (optional)"
                  onChange={(e) => setProjectId(e.target.value)}
                >
                  <MenuItem value="">None (General Meeting)</MenuItem>
                  {myProjects.map((proj) => (
                    <MenuItem key={proj.id} value={proj.id}>
                      {proj.projectName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Duration (minutes) *"
                type="number"
                fullWidth
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                InputProps={{ inputProps: { min: 1 } }}
                required
              />
              <TextField
                label="Meeting Notes / Summary *"
                multiline
                rows={4}
                fullWidth
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Key discussion points, decisions, action items..."
                required
              />
              {error && <Alert severity="error">{error}</Alert>}
              {submitSuccess && <Alert severity="success">Meeting logged successfully!</Alert>}
              <Button
                variant="contained"
                startIcon={isSubmitting ? <CircularProgress size={20} /> : <AddIcon />}
                onClick={handleSubmit}
                disabled={isSubmitting || !title.trim() || !notes.trim() || duration < 1}
              >
                {isSubmitting ? 'Logging...' : 'Log Meeting'}
              </Button>
            </Stack>
          </CardContent>
        </Card>

        {/* Meeting History Section */}
        <Card>
          <CardContent>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ cursor: 'pointer', mb: 1 }}
              onClick={() => setShowHistory(!showHistory)}
            >
              <Stack direction="row" alignItems="center" spacing={1}>
                <HistoryIcon color="action" />
                <Typography variant="h6">My Meeting History</Typography>
                <Chip label={myMeetings.length} size="small" color="primary" />
              </Stack>
              <IconButton size="small">
                {showHistory ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Stack>
            <Collapse in={showHistory}>
              {meetingsLoading && (
                <CircularProgress size={24} sx={{ display: 'block', mx: 'auto', my: 2 }} />
              )}
              {!meetingsLoading && myMeetings.length === 0 && (
                <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                  No meetings logged yet. Use the form above to log your first meeting.
                </Typography>
              )}
              {myMeetings.length > 0 && (
                <List disablePadding>
                  {myMeetings.map((meeting, idx) => (
                    <div key={meeting.id}>
                      {idx > 0 && <Divider />}
                      <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          <MeetingIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                              <Typography variant="subtitle1" component="span">
                                {meeting.title}
                              </Typography>
                              <Chip
                                label={formatDate(meeting.date)}
                                size="small"
                                variant="outlined"
                              />
                              <Chip
                                label={getProjectName(meeting.projectId)}
                                size="small"
                                variant="outlined"
                                color="info"
                              />
                              <Chip
                                label={formatDuration(meeting.duration)}
                                size="small"
                                variant="outlined"
                                color="default"
                              />
                            </Stack>
                          }
                          secondary={
                            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mt: 0.5 }}>
                              {meeting.notes}
                            </Typography>
                          }
                        />
                      </ListItem>
                    </div>
                  ))}
                </List>
              )}
            </Collapse>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
};

export default EmployeeMeetingLog;
