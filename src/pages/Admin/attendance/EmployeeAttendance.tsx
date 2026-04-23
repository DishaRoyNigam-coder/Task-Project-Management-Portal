// src/pages/Admin/attendance/EmployeeAttendance.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Drop-in attendance page for the Task-Project Management Portal.
// Matches existing design language: MUI v7, Iconify, Recharts, PRIMARY_BLUE theme.
//
// INTEGRATION:
//   1. Copy this file to  src/pages/Admin/attendance/EmployeeAttendance.tsx
//   2. In src/routes/paths.ts  → add inside the object:
//         attendance: '/admin/attendance',
//   3. In src/routes/router.tsx → add import + route:
//         import EmployeeAttendance from 'pages/Admin/attendance/EmployeeAttendance';
//         { path: paths.attendance, element: <EmployeeAttendance /> },
//   4. In src/routes/sitemap.ts → add a menu item (see snippet at bottom of this file)
// ─────────────────────────────────────────────────────────────────────────────
import { useMemo, useState } from 'react';
import {
  EventBusy as AbsentIcon,
  CalendarMonth as CalendarIcon,
  AccessTime as ClockIcon,
  Download as DownloadIcon,
  FilterList as FilterIcon,
  Warning as LateIcon,
  PersonOff as LeaveIcon,
  CheckCircle as PresentIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import {
  Avatar,
  Box,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  LinearProgress,
  MenuItem,
  OutlinedInput,
  Paper,
  Select,
  SelectChangeEvent,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Tooltip as RechartTooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';

// ─── Theme tokens (identical to AdminDashboard) ───────────────────────────────
const PRIMARY_BLUE = '#1E58E6';
const PRIMARY_BLUE_LIGHT = '#E6F0FF';
const SUCCESS_GREEN = '#00C49F';
const WARNING_AMBER = '#FFBB28';
const ERROR_RED = '#FF4842';
const INFO_PURPLE = '#9B59B6';

// ─── Types ────────────────────────────────────────────────────────────────────
type AttendanceStatus = 'Present' | 'Absent' | 'Late' | 'Leave' | 'Half Day';

interface AttendanceRecord {
  id: number;
  employeeId: number;
  employeeName: string;
  role: string;
  avatarInitials: string;
  date: string; // YYYY-MM-DD
  checkIn: string; // HH:MM or '--'
  checkOut: string; // HH:MM or '--'
  duration: string; // e.g. "8h 30m" or '--'
  status: AttendanceStatus;
  department: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const DEPARTMENTS = ['Engineering', 'Design', 'QA', 'Product', 'DevOps'];

const EMPLOYEES = [
  { id: 1, name: 'John Doe', role: 'Senior Developer', dept: 'Engineering', initials: 'JD' },
  { id: 2, name: 'Jane Smith', role: 'UI/UX Designer', dept: 'Design', initials: 'JS' },
  { id: 3, name: 'Mike Johnson', role: 'Backend Developer', dept: 'Engineering', initials: 'MJ' },
  { id: 4, name: 'Emily Davis', role: 'Frontend Developer', dept: 'Engineering', initials: 'ED' },
  { id: 5, name: 'Robert Brown', role: 'QA Engineer', dept: 'QA', initials: 'RB' },
  { id: 6, name: 'Sarah Wilson', role: 'Product Manager', dept: 'Product', initials: 'SW' },
  { id: 7, name: 'David Lee', role: 'DevOps Engineer', dept: 'DevOps', initials: 'DL' },
  { id: 8, name: 'Lisa Chen', role: 'Full Stack Dev', dept: 'Engineering', initials: 'LC' },
];

function randomTime(baseHour: number, variance: number): string {
  const h = baseHour + Math.floor(Math.random() * variance);
  const m = Math.floor(Math.random() * 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function calcDuration(checkIn: string, checkOut: string): string {
  if (checkIn === '--' || checkOut === '--') return '--';
  const [ih, im] = checkIn.split(':').map(Number);
  const [oh, om] = checkOut.split(':').map(Number);
  const totalMin = oh * 60 + om - (ih * 60 + im);
  if (totalMin < 0) return '--';
  return `${Math.floor(totalMin / 60)}h ${totalMin % 60}m`;
}

function generateRecords(): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];
  const today = new Date();
  let id = 1;

  for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
    const date = new Date(today);
    date.setDate(today.getDate() - dayOffset);
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue; // skip weekends

    const dateStr = date.toISOString().split('T')[0];

    EMPLOYEES.forEach((emp) => {
      const rand = Math.random();
      let status: AttendanceStatus;
      let checkIn = '--';
      let checkOut = '--';

      if (rand < 0.7) {
        status = 'Present';
        checkIn = randomTime(8, 2);
        checkOut = randomTime(17, 2);
      } else if (rand < 0.82) {
        status = 'Late';
        checkIn = randomTime(10, 2);
        checkOut = randomTime(18, 2);
      } else if (rand < 0.88) {
        status = 'Absent';
      } else if (rand < 0.94) {
        status = 'Leave';
      } else {
        status = 'Half Day';
        checkIn = randomTime(9, 1);
        checkOut = randomTime(13, 1);
      }

      records.push({
        id: id++,
        employeeId: emp.id,
        employeeName: emp.name,
        role: emp.role,
        avatarInitials: emp.initials,
        date: dateStr,
        checkIn,
        checkOut,
        duration: calcDuration(checkIn, checkOut),
        status,
        department: emp.dept,
      });
    });
  }
  return records;
}

const ALL_RECORDS = generateRecords();

// ─── Weekly trend for chart ───────────────────────────────────────────────────
function buildWeeklyTrend(records: AttendanceRecord[]) {
  const weeks: Record<string, { present: number; absent: number; late: number; leave: number }> =
    {};
  records.forEach((r) => {
    const d = new Date(r.date);
    const weekStart = new Date(d);
    weekStart.setDate(d.getDate() - d.getDay() + 1);
    const key = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (!weeks[key]) weeks[key] = { present: 0, absent: 0, late: 0, leave: 0 };
    if (r.status === 'Present') weeks[key].present++;
    else if (r.status === 'Absent') weeks[key].absent++;
    else if (r.status === 'Late') weeks[key].late++;
    else if (r.status === 'Leave') weeks[key].leave++;
  });
  return Object.entries(weeks)
    .slice(-6)
    .map(([week, v]) => ({ week, ...v }));
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<
  AttendanceStatus,
  { color: string; bg: string; muiColor: 'success' | 'error' | 'warning' | 'info' | 'default' }
> = {
  Present: { color: SUCCESS_GREEN, bg: '#E6FFF9', muiColor: 'success' },
  Absent: { color: ERROR_RED, bg: '#FFF1F0', muiColor: 'error' },
  Late: { color: WARNING_AMBER, bg: '#FFFBE6', muiColor: 'warning' },
  Leave: { color: INFO_PURPLE, bg: '#F5EEFF', muiColor: 'info' },
  'Half Day': { color: PRIMARY_BLUE, bg: PRIMARY_BLUE_LIGHT, muiColor: 'default' },
};

const DEPT_COLORS: Record<string, string> = {
  Engineering: PRIMARY_BLUE,
  Design: '#E91E63',
  QA: SUCCESS_GREEN,
  Product: WARNING_AMBER,
  DevOps: INFO_PURPLE,
};

// ─── Sub-components ───────────────────────────────────────────────────────────

interface KpiCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  avatarBg: string;
  avatarColor?: string;
  progress?: number;
  caption?: string;
  valueColor?: string;
}

const KpiCard = ({
  label,
  value,
  icon,
  avatarBg,
  avatarColor,
  progress,
  caption,
  valueColor,
}: KpiCardProps) => (
  <Card
    elevation={0}
    sx={{
      height: '100%',
      border: '1px solid #d0e0ff',
      borderRadius: '12px',
      transition: 'box-shadow 0.2s, transform 0.2s',
      '&:hover': {
        boxShadow: `0 6px 24px ${PRIMARY_BLUE}25`,
        transform: 'translateY(-2px)',
      },
    }}
  >
    <CardContent sx={{ p: 2.5 }}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1.5 }}>
        <Avatar
          sx={{
            bgcolor: avatarBg,
            width: 52,
            height: 52,
            color: avatarColor ?? PRIMARY_BLUE,
            boxShadow: `0 4px 12px ${avatarBg}90`,
          }}
        >
          {icon}
        </Avatar>
        <Box>
          <Typography
            variant="body2"
            sx={{ color: '#4a6fa5', fontWeight: 500, fontSize: '0.78rem' }}
          >
            {label}
          </Typography>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              color: valueColor ?? '#0f2a6e',
              lineHeight: 1.15,
              fontSize: '1.9rem',
            }}
          >
            {value}
          </Typography>
        </Box>
      </Stack>
      {progress !== undefined && (
        <>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 6,
              borderRadius: 3,
              backgroundColor: '#E8F0FF',
              '& .MuiLinearProgress-bar': { backgroundColor: valueColor ?? PRIMARY_BLUE },
            }}
          />
          {caption && (
            <Typography variant="caption" sx={{ color: '#4a6fa5', mt: 0.75, display: 'block' }}>
              {caption}
            </Typography>
          )}
        </>
      )}
    </CardContent>
  </Card>
);

// Mini calendar heatmap for the month
const AttendanceCalendar = ({ records }: { records: AttendanceRecord[] }) => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Aggregate status counts per day across all employees
  const dayStats: Record<number, Record<AttendanceStatus, number>> = {};
  records.forEach((r) => {
    const d = new Date(r.date);
    if (d.getFullYear() !== year || d.getMonth() !== month) return;
    const day = d.getDate();
    if (!dayStats[day]) dayStats[day] = { Present: 0, Absent: 0, Late: 0, Leave: 0, 'Half Day': 0 };
    dayStats[day][r.status]++;
  });

  const getDayColor = (day: number) => {
    const stats = dayStats[day];
    if (!stats) return 'transparent';
    const total = Object.values(stats).reduce((a, b) => a + b, 0);
    if (total === 0) return 'transparent';
    const presentRate = (stats.Present + stats['Half Day'] * 0.5) / total;
    if (presentRate > 0.8) return '#d4f7e7';
    if (presentRate > 0.6) return '#ffe8a3';
    return '#ffd0d0';
  };

  const getDayBorderColor = (day: number) => {
    const stats = dayStats[day];
    if (!stats) return 'transparent';
    const total = Object.values(stats).reduce((a, b) => a + b, 0);
    if (total === 0) return 'transparent';
    const presentRate = (stats.Present + stats['Half Day'] * 0.5) / total;
    if (presentRate > 0.8) return SUCCESS_GREEN;
    if (presentRate > 0.6) return WARNING_AMBER;
    return ERROR_RED;
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const blanks = Array(firstDay).fill(null);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <Box>
      <Grid container columns={7} spacing={0.5} sx={{ mb: 1 }}>
        {weekDays.map((d) => (
          <Grid key={d} size={1}>
            <Typography
              align="center"
              variant="caption"
              sx={{ fontWeight: 700, color: '#4a6fa5', fontSize: '0.7rem', display: 'block' }}
            >
              {d}
            </Typography>
          </Grid>
        ))}
      </Grid>
      <Grid container columns={7} spacing={0.5}>
        {blanks.map((_, i) => (
          <Grid key={`blank-${i}`} size={1} />
        ))}
        {days.map((day) => {
          const isToday = day === today.getDate();
          const isWeekend = (firstDay + day - 1) % 7 === 0 || (firstDay + day - 1) % 7 === 6;
          const stats = dayStats[day];
          const tooltipText = stats
            ? `P:${stats.Present} A:${stats.Absent} L:${stats.Late}`
            : 'No data';

          return (
            <Grid key={day} size={1}>
              <Tooltip title={tooltipText} arrow>
                <Box
                  sx={{
                    aspectRatio: '1',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'default',
                    backgroundColor: isWeekend ? '#f5f7fa' : getDayColor(day),
                    border: isToday
                      ? `2px solid ${PRIMARY_BLUE}`
                      : `1px solid ${isWeekend ? '#e8ecf0' : getDayBorderColor(day)}`,
                    transition: 'transform 0.15s',
                    '&:hover': { transform: 'scale(1.12)', zIndex: 1 },
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: '0.68rem',
                      fontWeight: isToday ? 800 : 500,
                      color: isToday ? PRIMARY_BLUE : isWeekend ? '#b0bec5' : '#2d3748',
                    }}
                  >
                    {day}
                  </Typography>
                </Box>
              </Tooltip>
            </Grid>
          );
        })}
      </Grid>

      {/* Legend */}
      <Stack direction="row" spacing={2} sx={{ mt: 2 }} flexWrap="wrap">
        {[
          { label: 'High (>80%)', bg: '#d4f7e7', border: SUCCESS_GREEN },
          { label: 'Medium (60–80%)', bg: '#ffe8a3', border: WARNING_AMBER },
          { label: 'Low (<60%)', bg: '#ffd0d0', border: ERROR_RED },
          { label: 'Weekend', bg: '#f5f7fa', border: '#e8ecf0' },
        ].map(({ label, bg, border }) => (
          <Stack key={label} direction="row" alignItems="center" spacing={0.5}>
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: '3px',
                bgcolor: bg,
                border: `1px solid ${border}`,
              }}
            />
            <Typography variant="caption" sx={{ color: '#4a6fa5', fontSize: '0.68rem' }}>
              {label}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Box>
  );
};

// ─── Department breakdown bar ─────────────────────────────────────────────────
const DeptBreakdown = ({ records }: { records: AttendanceRecord[] }) => {
  const deptStats = useMemo(() => {
    const map: Record<string, { present: number; total: number }> = {};
    records.forEach((r) => {
      if (!map[r.department]) map[r.department] = { present: 0, total: 0 };
      map[r.department].total++;
      if (r.status === 'Present' || r.status === 'Late') map[r.department].present++;
    });
    return Object.entries(map).map(([dept, v]) => ({
      dept,
      rate: v.total ? Math.round((v.present / v.total) * 100) : 0,
    }));
  }, [records]);

  return (
    <Stack spacing={1.5}>
      {deptStats.map(({ dept, rate }) => (
        <Box key={dept}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 0.4 }}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: DEPT_COLORS[dept] ?? PRIMARY_BLUE,
                }}
              />
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, color: '#1a2b5e', fontSize: '0.8rem' }}
              >
                {dept}
              </Typography>
            </Stack>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                color: rate > 75 ? SUCCESS_GREEN : rate > 55 ? WARNING_AMBER : ERROR_RED,
              }}
            >
              {rate}%
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={rate}
            sx={{
              height: 7,
              borderRadius: 4,
              bgcolor: '#eef2ff',
              '& .MuiLinearProgress-bar': {
                bgcolor: DEPT_COLORS[dept] ?? PRIMARY_BLUE,
                borderRadius: 4,
              },
            }}
          />
        </Box>
      ))}
    </Stack>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const EmployeeAttendance = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [deptFilter, setDeptFilter] = useState<string>('All');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const today = new Date().toISOString().split('T')[0];

  // ── Today's records ──────────────────────────────────────────────────────
  const todayRecords = useMemo(() => ALL_RECORDS.filter((r) => r.date === today), []);

  const kpiStats = useMemo(() => {
    const present = todayRecords.filter((r) => r.status === 'Present').length;
    const absent = todayRecords.filter((r) => r.status === 'Absent').length;
    const onLeave = todayRecords.filter((r) => r.status === 'Leave').length;
    const late = todayRecords.filter((r) => r.status === 'Late').length;
    const halfDay = todayRecords.filter((r) => r.status === 'Half Day').length;
    const total = todayRecords.length || EMPLOYEES.length;
    return { present, absent, onLeave, late, halfDay, total };
  }, [todayRecords]);

  // ── Filtered table records ───────────────────────────────────────────────
  const filteredRecords = useMemo(() => {
    return ALL_RECORDS.filter((r) => {
      const matchSearch =
        !searchQuery ||
        r.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.department.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'All' || r.status === statusFilter;
      const matchDept = deptFilter === 'All' || r.department === deptFilter;
      return matchSearch && matchStatus && matchDept;
    });
  }, [searchQuery, statusFilter, deptFilter]);

  const weeklyTrend = useMemo(() => buildWeeklyTrend(ALL_RECORDS), []);

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const paginatedRecords = filteredRecords.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  const monthName = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: '#f7f9fe', minHeight: '100vh' }}>
      {/* ── Page Header ───────────────────────────────────────────────── */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        sx={{ mb: 3 }}
        spacing={2}
      >
        <Box>
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 0.5 }}>
            <Avatar
              sx={{
                bgcolor: PRIMARY_BLUE_LIGHT,
                color: PRIMARY_BLUE,
                width: 42,
                height: 42,
                boxShadow: `0 4px 14px ${PRIMARY_BLUE}30`,
              }}
            >
              <CalendarIcon sx={{ fontSize: 22 }} />
            </Avatar>
            <Typography
              variant="h4"
              sx={{ fontWeight: 800, color: '#0f2a6e', letterSpacing: '-0.5px' }}
            >
              Employee Attendance
            </Typography>
          </Stack>
          <Typography variant="body2" sx={{ color: '#4a6fa5', pl: '58px' }}>
            Track daily check-ins, absences & attendance trends · {monthName}
          </Typography>
        </Box>

        <Stack direction="row" spacing={1}>
          <Tooltip title="Export CSV">
            <IconButton
              sx={{
                border: `1px solid #d0e0ff`,
                borderRadius: '10px',
                color: PRIMARY_BLUE,
                '&:hover': { bgcolor: PRIMARY_BLUE_LIGHT },
              }}
            >
              <DownloadIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Filter Options">
            <IconButton
              sx={{
                border: `1px solid #d0e0ff`,
                borderRadius: '10px',
                color: PRIMARY_BLUE,
                '&:hover': { bgcolor: PRIMARY_BLUE_LIGHT },
              }}
            >
              <FilterIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      {/* ── KPI Cards ──────────────────────────────────────────────────── */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <KpiCard
            label="Present Today"
            value={kpiStats.present}
            icon={<PresentIcon />}
            avatarBg="#dcfce7"
            avatarColor={SUCCESS_GREEN}
            valueColor={SUCCESS_GREEN}
            progress={Math.round((kpiStats.present / kpiStats.total) * 100)}
            caption={`${Math.round((kpiStats.present / kpiStats.total) * 100)}% attendance rate`}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <KpiCard
            label="Absent Today"
            value={kpiStats.absent}
            icon={<AbsentIcon />}
            avatarBg="#fff1f0"
            avatarColor={ERROR_RED}
            valueColor={ERROR_RED}
            progress={Math.round((kpiStats.absent / kpiStats.total) * 100)}
            caption={`${Math.round((kpiStats.absent / kpiStats.total) * 100)}% absence rate`}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <KpiCard
            label="Late Arrivals"
            value={kpiStats.late}
            icon={<LateIcon />}
            avatarBg="#fffbe6"
            avatarColor={WARNING_AMBER}
            valueColor={WARNING_AMBER}
            progress={Math.round((kpiStats.late / kpiStats.total) * 100)}
            caption={`${Math.round((kpiStats.late / kpiStats.total) * 100)}% late rate`}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <KpiCard
            label="On Leave"
            value={kpiStats.onLeave}
            icon={<LeaveIcon />}
            avatarBg="#f5eeff"
            avatarColor={INFO_PURPLE}
            valueColor={INFO_PURPLE}
            progress={Math.round((kpiStats.onLeave / kpiStats.total) * 100)}
            caption={`${Math.round((kpiStats.onLeave / kpiStats.total) * 100)}% on leave`}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <KpiCard
            label="Avg. Work Hours"
            value="7.8h"
            icon={<ClockIcon />}
            avatarBg={PRIMARY_BLUE_LIGHT}
            avatarColor={PRIMARY_BLUE}
            progress={78}
            caption="Target: 8h / day"
          />
        </Grid>
      </Grid>

      {/* ── Middle Row: Calendar + Dept Breakdown + Trend Chart ─────────── */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {/* Calendar Heatmap */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            elevation={0}
            sx={{ border: '1px solid #d0e0ff', borderRadius: '12px', height: '100%' }}
          >
            <CardHeader
              title={
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f2a6e' }}>
                  📅 Monthly Calendar
                </Typography>
              }
              subheader={
                <Typography variant="caption" sx={{ color: '#4a6fa5' }}>
                  Attendance rate heatmap for {monthName}
                </Typography>
              }
              sx={{ pb: 0 }}
            />
            <CardContent>
              <AttendanceCalendar records={ALL_RECORDS} />
            </CardContent>
          </Card>
        </Grid>

        {/* Department Breakdown */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Card
            elevation={0}
            sx={{ border: '1px solid #d0e0ff', borderRadius: '12px', height: '100%' }}
          >
            <CardHeader
              title={
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f2a6e' }}>
                  🏢 By Department
                </Typography>
              }
              subheader={
                <Typography variant="caption" sx={{ color: '#4a6fa5' }}>
                  Attendance rates per team
                </Typography>
              }
              sx={{ pb: 0 }}
            />
            <CardContent>
              <DeptBreakdown records={ALL_RECORDS} />
            </CardContent>
          </Card>
        </Grid>

        {/* Weekly Trend Chart */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card
            elevation={0}
            sx={{ border: '1px solid #d0e0ff', borderRadius: '12px', height: '100%' }}
          >
            <CardHeader
              title={
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f2a6e' }}>
                  📈 Weekly Trend
                </Typography>
              }
              subheader={
                <Typography variant="caption" sx={{ color: '#4a6fa5' }}>
                  Present vs Absent vs Late over the last 6 weeks
                </Typography>
              }
              sx={{ pb: 0 }}
            />
            <CardContent sx={{ pt: 1 }}>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={weeklyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e8f0fe" />
                  <XAxis
                    dataKey="week"
                    tick={{ fontSize: 11, fill: '#4a6fa5' }}
                    axisLine={{ stroke: '#d0e0ff' }}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#4a6fa5' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <RechartTooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid #d0e0ff',
                      boxShadow: '0 4px 12px rgba(30,88,230,0.12)',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Line
                    type="monotone"
                    dataKey="present"
                    name="Present"
                    stroke={SUCCESS_GREEN}
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: SUCCESS_GREEN }}
                  />
                  <Line
                    type="monotone"
                    dataKey="late"
                    name="Late"
                    stroke={WARNING_AMBER}
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: WARNING_AMBER }}
                  />
                  <Line
                    type="monotone"
                    dataKey="absent"
                    name="Absent"
                    stroke={ERROR_RED}
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: ERROR_RED }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ── Today's Status Cards Row ──────────────────────────────────────── */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {['Present', 'Absent', 'Late', 'Leave'].map((status) => {
          const employees = todayRecords.filter((r) => r.status === status);
          const cfg = STATUS_CONFIG[status as AttendanceStatus];
          return (
            <Grid key={status} size={{ xs: 12, sm: 6, md: 3 }}>
              <Card
                elevation={0}
                sx={{
                  border: `1px solid ${cfg.color}40`,
                  borderRadius: '12px',
                  height: '100%',
                  background: `linear-gradient(135deg, ${cfg.bg} 0%, #ffffff 100%)`,
                }}
              >
                <CardContent sx={{ p: 2 }}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ mb: 1.5 }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 700, color: cfg.color, fontSize: '0.82rem' }}
                    >
                      {status === 'Present' && '✅'}
                      {status === 'Absent' && '❌'}
                      {status === 'Late' && '⏰'}
                      {status === 'Leave' && '🏖️'} {status}
                    </Typography>
                    <Chip
                      label={employees.length}
                      size="small"
                      sx={{
                        bgcolor: cfg.color,
                        color: '#fff',
                        fontWeight: 700,
                        height: 22,
                        fontSize: '0.75rem',
                      }}
                    />
                  </Stack>
                  <Stack spacing={0.75}>
                    {employees.slice(0, 3).map((r) => (
                      <Stack key={r.id} direction="row" alignItems="center" spacing={1}>
                        <Avatar
                          sx={{
                            width: 26,
                            height: 26,
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            bgcolor: cfg.color + '30',
                            color: cfg.color,
                          }}
                        >
                          {r.avatarInitials}
                        </Avatar>
                        <Box>
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: 600,
                              color: '#1a2b5e',
                              lineHeight: 1.2,
                              display: 'block',
                            }}
                          >
                            {r.employeeName}
                          </Typography>
                          {r.checkIn !== '--' && (
                            <Typography
                              variant="caption"
                              sx={{ color: '#4a6fa5', fontSize: '0.65rem' }}
                            >
                              In: {r.checkIn}
                            </Typography>
                          )}
                        </Box>
                      </Stack>
                    ))}
                    {employees.length > 3 && (
                      <Typography
                        variant="caption"
                        sx={{ color: cfg.color, fontWeight: 600, pl: 0.5 }}
                      >
                        +{employees.length - 3} more
                      </Typography>
                    )}
                    {employees.length === 0 && (
                      <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                        No employees
                      </Typography>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* ── Attendance Table ──────────────────────────────────────────────── */}
      <Card elevation={0} sx={{ border: '1px solid #d0e0ff', borderRadius: '12px' }}>
        <CardHeader
          title={
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f2a6e' }}>
              📋 Attendance Log
            </Typography>
          }
          subheader={
            <Typography variant="caption" sx={{ color: '#4a6fa5' }}>
              Detailed check-in / check-out records · {filteredRecords.length} entries
            </Typography>
          }
          action={
            <Stack direction="row" spacing={1.5} sx={{ pt: 1 }}>
              {/* Search */}
              <OutlinedInput
                size="small"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(0);
                }}
                placeholder="Search employee…"
                startAdornment={
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 18, color: '#4a6fa5' }} />
                  </InputAdornment>
                }
                sx={{
                  width: 200,
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#d0e0ff' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: PRIMARY_BLUE },
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                }}
              />

              {/* Status filter */}
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel sx={{ fontSize: '0.82rem' }}>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e: SelectChangeEvent) => {
                    setStatusFilter(e.target.value);
                    setPage(0);
                  }}
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#d0e0ff' },
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                  }}
                >
                  {['All', 'Present', 'Late', 'Absent', 'Leave', 'Half Day'].map((s) => (
                    <MenuItem key={s} value={s} sx={{ fontSize: '0.82rem' }}>
                      {s}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Department filter */}
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel sx={{ fontSize: '0.82rem' }}>Department</InputLabel>
                <Select
                  value={deptFilter}
                  label="Department"
                  onChange={(e: SelectChangeEvent) => {
                    setDeptFilter(e.target.value);
                    setPage(0);
                  }}
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#d0e0ff' },
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                  }}
                >
                  {['All', ...DEPARTMENTS].map((d) => (
                    <MenuItem key={d} value={d} sx={{ fontSize: '0.82rem' }}>
                      {d}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          }
          sx={{ pb: 0, flexWrap: 'wrap', '& .MuiCardHeader-action': { mt: 0 } }}
        />

        <Divider sx={{ borderColor: '#e8f0fe', mt: 1 }} />

        <TableContainer component={Paper} elevation={0}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: '#f0f5ff' }}>
                {[
                  'Employee',
                  'Department',
                  'Date',
                  'Check In',
                  'Check Out',
                  'Duration',
                  'Status',
                ].map((col) => (
                  <TableCell
                    key={col}
                    sx={{
                      fontWeight: 700,
                      color: '#1a2b5e',
                      fontSize: '0.78rem',
                      borderBottom: '2px solid #d0e0ff',
                      py: 1.25,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {col}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedRecords.map((r) => {
                const cfg = STATUS_CONFIG[r.status];
                return (
                  <TableRow
                    key={r.id}
                    hover
                    sx={{
                      '&:hover': { bgcolor: `${PRIMARY_BLUE}06` },
                      '& td': { borderBottom: '1px solid #e8f0fe', py: 1.1 },
                    }}
                  >
                    {/* Employee */}
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1.25}>
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            bgcolor: PRIMARY_BLUE_LIGHT,
                            color: PRIMARY_BLUE,
                            fontSize: '0.7rem',
                            fontWeight: 700,
                          }}
                        >
                          {r.avatarInitials}
                        </Avatar>
                        <Box>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 600, color: '#1a2b5e', lineHeight: 1.2 }}
                          >
                            {r.employeeName}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ color: '#4a6fa5', fontSize: '0.7rem' }}
                          >
                            {r.role}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>

                    {/* Department */}
                    <TableCell>
                      <Chip
                        label={r.department}
                        size="small"
                        sx={{
                          bgcolor: (DEPT_COLORS[r.department] ?? PRIMARY_BLUE) + '18',
                          color: DEPT_COLORS[r.department] ?? PRIMARY_BLUE,
                          fontWeight: 600,
                          fontSize: '0.7rem',
                          height: 20,
                        }}
                      />
                    </TableCell>

                    {/* Date */}
                    <TableCell>
                      <Typography variant="caption" sx={{ color: '#2d3748', fontWeight: 500 }}>
                        {new Date(r.date).toLocaleDateString('en-US', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </Typography>
                    </TableCell>

                    {/* Check In */}
                    <TableCell>
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 600,
                          color: r.checkIn === '--' ? '#94a3b8' : '#1a2b5e',
                          fontFamily: 'monospace',
                        }}
                      >
                        {r.checkIn}
                      </Typography>
                    </TableCell>

                    {/* Check Out */}
                    <TableCell>
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 600,
                          color: r.checkOut === '--' ? '#94a3b8' : '#1a2b5e',
                          fontFamily: 'monospace',
                        }}
                      >
                        {r.checkOut}
                      </Typography>
                    </TableCell>

                    {/* Duration */}
                    <TableCell>
                      <Typography
                        variant="caption"
                        sx={{ color: r.duration === '--' ? '#94a3b8' : '#2d3748', fontWeight: 500 }}
                      >
                        {r.duration}
                      </Typography>
                    </TableCell>

                    {/* Status Chip */}
                    <TableCell>
                      <Chip
                        label={r.status}
                        size="small"
                        sx={{
                          bgcolor: cfg.bg,
                          color: cfg.color,
                          fontWeight: 700,
                          fontSize: '0.7rem',
                          height: 22,
                          border: `1px solid ${cfg.color}40`,
                        }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}

              {paginatedRecords.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                      No attendance records found for the selected filters.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={filteredRecords.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
          sx={{
            borderTop: '1px solid #e8f0fe',
            '& .MuiTablePagination-toolbar': { fontSize: '0.8rem' },
          }}
        />
      </Card>

      {/* ── Status Summary Bar Chart ────────────────────────────────────── */}
      <Card elevation={0} sx={{ border: '1px solid #d0e0ff', borderRadius: '12px', mt: 3 }}>
        <CardHeader
          title={
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f2a6e' }}>
              📊 30-Day Status Distribution
            </Typography>
          }
          subheader={
            <Typography variant="caption" sx={{ color: '#4a6fa5' }}>
              Daily breakdown of attendance statuses over the past month
            </Typography>
          }
        />
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyTrend} barSize={18} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8f0fe" vertical={false} />
              <XAxis
                dataKey="week"
                tick={{ fontSize: 11, fill: '#4a6fa5' }}
                axisLine={{ stroke: '#d0e0ff' }}
                tickLine={false}
              />
              <YAxis tick={{ fontSize: 11, fill: '#4a6fa5' }} axisLine={false} tickLine={false} />
              <RechartTooltip
                contentStyle={{
                  borderRadius: '10px',
                  border: '1px solid #d0e0ff',
                  boxShadow: '0 6px 20px rgba(30,88,230,0.12)',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '12px' }} />
              <Bar dataKey="present" name="Present" fill={SUCCESS_GREEN} radius={[4, 4, 0, 0]} />
              <Bar dataKey="late" name="Late" fill={WARNING_AMBER} radius={[4, 4, 0, 0]} />
              <Bar dataKey="absent" name="Absent" fill={ERROR_RED} radius={[4, 4, 0, 0]} />
              <Bar dataKey="leave" name="Leave" fill={INFO_PURPLE} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default EmployeeAttendance;

/*
──────────────────────────────────────────────────────────────────────────────
INTEGRATION SNIPPETS
──────────────────────────────────────────────────────────────────────────────

1. src/routes/paths.ts — add inside the `const paths = { ... }` object:
   attendance: '/admin/attendance',

2. src/routes/router.tsx — add with other admin imports:
   import EmployeeAttendance from 'pages/Admin/attendance/EmployeeAttendance';
   // inside the main-layout children array:
   { path: paths.attendance, element: <EmployeeAttendance /> },

3. src/routes/sitemap.ts — add a new menu block:
   {
     id: 'attendance',
     icon: 'material-symbols:calendar-month',
     items: [
       {
         name: 'Attendance',
         path: '/admin/attendance',
         icon: 'material-symbols:calendar-month',
         pathName: 'attendance',
         active: true,
       },
     ],
   },

4. src/routes/employeeSitemap.ts — same block for the employee sidebar.
──────────────────────────────────────────────────────────────────────────────
*/
