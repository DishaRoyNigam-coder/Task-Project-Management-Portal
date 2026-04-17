// src/pages/Admin/reports/MeetingTimeReport.tsx
import { useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useMeetings } from 'context/MeetingContext';
import { useProjects } from 'context/ProjectContext';

const MeetingTimeReport = () => {
  const { meetings } = useMeetings();
  const { projects } = useProjects();

  const projectMeetingData = useMemo(() => {
    const projectMap = new Map<string, { name: string; totalMinutes: number }>();

    // Initialize with all projects (including those with 0 meetings)
    projects.forEach((project) => {
      projectMap.set(project.id, { name: project.projectName, totalMinutes: 0 });
    });

    // Add meeting durations
    meetings.forEach((meeting) => {
      if (meeting.projectId) {
        const existing = projectMap.get(meeting.projectId);
        if (existing) {
          existing.totalMinutes += meeting.duration;
        } else {
          // Should not happen, but fallback
          projectMap.set(meeting.projectId, {
            name: `Project ${meeting.projectId}`,
            totalMinutes: meeting.duration,
          });
        }
      }
    });

    // Convert to array and sort by total minutes desc
    return Array.from(projectMap.entries())
      .map(([id, data]) => ({
        id,
        name: data.name,
        totalMinutes: data.totalMinutes,
        totalHours: (data.totalMinutes / 60).toFixed(1),
      }))
      .sort((a, b) => b.totalMinutes - a.totalMinutes);
  }, [projects, meetings]);

  const totalMeetingTime = projectMeetingData.reduce((sum, p) => sum + p.totalMinutes, 0);
  const totalHours = (totalMeetingTime / 60).toFixed(1);

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h4" gutterBottom>
        Meeting Time by Project
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Total meeting time logged across all projects: {totalHours} hours ({totalMeetingTime}{' '}
        minutes)
      </Typography>

      <Card>
        <CardContent>
          {projectMeetingData.length === 0 ? (
            <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
              No meeting data available.
            </Typography>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Project Name</TableCell>
                    <TableCell align="right">Total Minutes</TableCell>
                    <TableCell align="right">Total Hours</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {projectMeetingData.map((project) => (
                    <TableRow key={project.id} hover>
                      <TableCell>{project.name}</TableCell>
                      <TableCell align="right">{project.totalMinutes}</TableCell>
                      <TableCell align="right">{project.totalHours}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow sx={{ bgcolor: 'action.hover' }}>
                    <TableCell>
                      <strong>Grand Total</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>{totalMeetingTime}</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>{totalHours}</strong>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default MeetingTimeReport;
