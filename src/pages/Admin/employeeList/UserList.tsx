// src/pages/users/UserList.tsx
import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Visibility as ViewIcon } from '@mui/icons-material';
import {
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import { useTasks } from 'context/TaskContext';

// Mock employee data with numeric IDs to match Task.assignedTo.id
const mockEmployees = [
  { id: 1, name: 'John Doe', email: 'john.doe@company.com', role: 'Developer' },
  { id: 2, name: 'Jane Smith', email: 'jane.smith@company.com', role: 'Designer' },
  { id: 3, name: 'Mike Johnson', email: 'mike.j@company.com', role: 'Backend Developer' },
  { id: 4, name: 'Emily Davis', email: 'emily.davis@company.com', role: 'Frontend Developer' },
  { id: 5, name: 'Robert Brown', email: 'robert.brown@company.com', role: 'QA Engineer' },
];

interface EmployeePerformance {
  id: number;
  name: string;
  email: string;
  role: string;
  totalTasks: number;
  completedTasks: number;
  activeTasks: number;
  delayedTasks: number;
  delayRate: number;
}

const UserList = () => {
  const navigate = useNavigate();
  const { tasks } = useTasks();

  const employeePerformance = useMemo<EmployeePerformance[]>(() => {
    return mockEmployees.map((emp) => {
      const employeeTasks = tasks.filter((t) => t.assignedTo.id === emp.id);
      const totalTasks = employeeTasks.length;
      const completedTasks = employeeTasks.filter((t) => t.status === 'Done').length;
      const activeTasks = employeeTasks.filter((t) => t.status === 'In progress').length;
      const delayedTasks = employeeTasks.filter(
        (t) => new Date(t.dueDate) < new Date() && t.status !== 'Done',
      ).length;
      const delayRate = totalTasks ? (delayedTasks / totalTasks) * 100 : 0;

      return {
        id: emp.id,
        name: emp.name,
        email: emp.email,
        role: emp.role,
        totalTasks,
        completedTasks,
        activeTasks,
        delayedTasks,
        delayRate,
      };
    });
  }, [tasks]);

  const handleViewPerformance = (employeeId: number) => {
    navigate(`/employee-performance/${employeeId}`);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h4" gutterBottom>
        Employee List
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Manage employees and view performance metrics.
      </Typography>

      <Card>
        <CardContent>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell align="center">Total Tasks</TableCell>
                  <TableCell align="center">Completed</TableCell>
                  <TableCell align="center">Active</TableCell>
                  <TableCell align="center">Delayed</TableCell>
                  <TableCell align="center">Delay Rate</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {employeePerformance.map((emp) => (
                  <TableRow key={emp.id} hover>
                    <TableCell>{emp.name}</TableCell>
                    <TableCell>{emp.email}</TableCell>
                    <TableCell>{emp.role}</TableCell>
                    <TableCell align="center">{emp.totalTasks}</TableCell>
                    <TableCell align="center">{emp.completedTasks}</TableCell>
                    <TableCell align="center">{emp.activeTasks}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={emp.delayedTasks}
                        size="small"
                        color={emp.delayedTasks > 0 ? 'error' : 'default'}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={`${Math.round(emp.delayRate)}%`}
                        size="small"
                        color={
                          emp.delayRate > 20 ? 'error' : emp.delayRate > 0 ? 'warning' : 'success'
                        }
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="View Performance">
                        <IconButton
                          size="small"
                          onClick={() => handleViewPerformance(emp.id)}
                          color="primary"
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {employeePerformance.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      No employees found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default UserList;
