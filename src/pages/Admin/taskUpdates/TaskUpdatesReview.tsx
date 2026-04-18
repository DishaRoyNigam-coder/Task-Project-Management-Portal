// src/pages/Admin/taskUpdates/TaskUpdatesReview.tsx
import { useState } from 'react';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';

// Mock data for task updates (in real app, this would come from an API/context)
interface TaskUpdate {
  id: number;
  taskId: number;
  taskName: string;
  employeeId: number;
  employeeName: string;
  updateText: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  adminComment?: string;
}

const mockUpdates: TaskUpdate[] = [
  {
    id: 1,
    taskId: 101,
    taskName: 'Design homepage',
    employeeId: 1,
    employeeName: 'John Doe',
    updateText: 'Completed wireframes and initial mockups.',
    submittedAt: '2025-04-15T10:30:00',
    status: 'pending',
  },
  {
    id: 2,
    taskId: 102,
    taskName: 'API integration',
    employeeId: 3,
    employeeName: 'Mike Johnson',
    updateText: 'Integrated login API, need testing.',
    submittedAt: '2025-04-14T14:20:00',
    status: 'pending',
  },
  {
    id: 3,
    taskId: 103,
    taskName: 'Write documentation',
    employeeId: 5,
    employeeName: 'Robert Brown',
    updateText: 'Drafted user guide, pending review.',
    submittedAt: '2025-04-13T09:15:00',
    status: 'approved',
  },
  {
    id: 4,
    taskId: 104,
    taskName: 'Fix navbar bug',
    employeeId: 4,
    employeeName: 'Emily Davis',
    updateText: 'Fixed responsive issue on mobile.',
    submittedAt: '2025-04-12T16:45:00',
    status: 'rejected',
  },
  {
    id: 5,
    taskId: 105,
    taskName: 'Database optimization',
    employeeId: 3,
    employeeName: 'Mike Johnson',
    updateText: 'Added indexes, improved query performance.',
    submittedAt: '2025-04-11T11:00:00',
    status: 'pending',
  },
];

const TaskUpdatesReview = () => {
  const [updates, setUpdates] = useState<TaskUpdate[]>(mockUpdates);
  const [selectedUpdate, setSelectedUpdate] = useState<TaskUpdate | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [adminComment, setAdminComment] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const handleOpenDialog = (update: TaskUpdate) => {
    setSelectedUpdate(update);
    setAdminComment(update.adminComment || '');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUpdate(null);
    setAdminComment('');
  };

  const handleApprove = () => {
    if (selectedUpdate) {
      setUpdates((prev) =>
        prev.map((u) =>
          u.id === selectedUpdate.id
            ? { ...u, status: 'approved', adminComment: adminComment || undefined }
            : u,
        ),
      );
      handleCloseDialog();
    }
  };

  const handleReject = () => {
    if (selectedUpdate) {
      setUpdates((prev) =>
        prev.map((u) =>
          u.id === selectedUpdate.id
            ? { ...u, status: 'rejected', adminComment: adminComment || undefined }
            : u,
        ),
      );
      handleCloseDialog();
    }
  };

  const handleFilterChange = (event: SelectChangeEvent) => {
    setStatusFilter(event.target.value);
  };

  const filteredUpdates =
    statusFilter === 'all' ? updates : updates.filter((u) => u.status === statusFilter);

  const getStatusChip = (status: TaskUpdate['status']) => {
    switch (status) {
      case 'approved':
        return <Chip label="Approved" color="success" size="small" />;
      case 'rejected':
        return <Chip label="Rejected" color="error" size="small" />;
      default:
        return <Chip label="Pending" color="warning" size="small" />;
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h4" gutterBottom>
        Task Updates Review
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Review and manage task updates submitted by employees.
      </Typography>

      <Card>
        <CardContent>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Status</InputLabel>
              <Select value={statusFilter} label="Status" onChange={handleFilterChange}>
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Task</TableCell>
                  <TableCell>Employee</TableCell>
                  <TableCell>Update</TableCell>
                  <TableCell>Submitted At</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUpdates.map((update) => (
                  <TableRow key={update.id} hover>
                    <TableCell>{update.taskName}</TableCell>
                    <TableCell>{update.employeeName}</TableCell>
                    <TableCell sx={{ maxWidth: 300 }}>
                      <Typography variant="body2" noWrap>
                        {update.updateText}
                      </Typography>
                    </TableCell>
                    <TableCell>{new Date(update.submittedAt).toLocaleString()}</TableCell>
                    <TableCell>{getStatusChip(update.status)}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Review Update">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(update)}
                          color="primary"
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredUpdates.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No task updates found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Review Task Update</DialogTitle>
        <DialogContent>
          {selectedUpdate && (
            <>
              <DialogContentText sx={{ mb: 2 }}>
                <strong>Task:</strong> {selectedUpdate.taskName}
                <br />
                <strong>Employee:</strong> {selectedUpdate.employeeName}
                <br />
                <strong>Submitted:</strong> {new Date(selectedUpdate.submittedAt).toLocaleString()}
              </DialogContentText>
              <Typography variant="subtitle2" gutterBottom>
                Update Message:
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: 'background.default' }}>
                <Typography variant="body2">{selectedUpdate.updateText}</Typography>
              </Paper>
              <TextField
                label="Admin Comment (optional)"
                multiline
                rows={3}
                fullWidth
                value={adminComment}
                onChange={(e) => setAdminComment(e.target.value)}
                variant="outlined"
                margin="dense"
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          {selectedUpdate?.status === 'pending' && (
            <>
              <Button
                onClick={handleReject}
                color="error"
                variant="outlined"
                startIcon={<RejectIcon />}
              >
                Reject
              </Button>
              <Button
                onClick={handleApprove}
                color="success"
                variant="contained"
                startIcon={<ApproveIcon />}
              >
                Approve
              </Button>
            </>
          )}
          {selectedUpdate?.status !== 'pending' && (
            <Typography variant="caption" color="text.secondary" sx={{ mr: 2 }}>
              This update has already been {selectedUpdate?.status}.
            </Typography>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TaskUpdatesReview;
