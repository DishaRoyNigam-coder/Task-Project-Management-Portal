// src/pages/Admin/settings/AdminProfilePage.tsx
import { useRef, useState } from 'react';
import {
  Alert,
  Avatar,
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
  IconButton,
  InputLabel,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';

// ─── Theme ────────────────────────────────────────────────────────────────────
const PRIMARY_BLUE = '#1E58E6';
const PRIMARY_BLUE_DARK = '#1A4CC4';
const PRIMARY_BLUE_LIGHT = '#E6F0FF';

// ─── Reusable field sx (same as ProjectFormPage) ──────────────────────────────
const fieldSx = {
  '& .MuiOutlinedInput-root': {
    backgroundColor: PRIMARY_BLUE_LIGHT,
    borderRadius: '8px',
    transition: 'background-color 0.2s ease, box-shadow 0.2s ease',
    '& fieldset': { borderColor: PRIMARY_BLUE, borderWidth: '1.5px' },
    '&:hover': {
      backgroundColor: '#dce9ff',
      '& fieldset': { borderColor: PRIMARY_BLUE_DARK, borderWidth: '2px' },
    },
    '&.Mui-focused': {
      backgroundColor: '#dce9ff',
      boxShadow: `0 0 0 3px ${PRIMARY_BLUE}28`,
      '& fieldset': { borderColor: PRIMARY_BLUE, borderWidth: '2px' },
    },
  },
  '& .MuiInputLabel-root': {
    color: '#4a6fa5',
    fontWeight: 500,
    fontSize: '14px',
    '&.Mui-focused': { color: PRIMARY_BLUE, fontWeight: 600 },
  },
};

const selectSx = {
  ...fieldSx,
  '& .MuiOutlinedInput-root': {
    ...fieldSx['& .MuiOutlinedInput-root'],
    '& .MuiSelect-icon': { color: PRIMARY_BLUE },
  },
};

// ─── Section Card wrapper ─────────────────────────────────────────────────────
const SectionCard = ({
  title,
  icon,
  children,
  action,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) => (
  <Card
    elevation={0}
    sx={{ border: '1px solid #d0e0ff', borderRadius: '12px', mb: 2.5, overflow: 'visible' }}
  >
    <CardContent sx={{ p: 2.5 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              backgroundColor: PRIMARY_BLUE_LIGHT,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IconifyIcon icon={icon} sx={{ fontSize: 20, color: PRIMARY_BLUE }} />
          </Box>
          <Typography sx={{ fontWeight: 700, color: '#0f2a6e', fontSize: '15px' }}>
            {title}
          </Typography>
        </Stack>
        {action}
      </Stack>
      <Divider sx={{ mb: 2.5, borderColor: '#d0e0ff' }} />
      {children}
    </CardContent>
  </Card>
);

// ─── Toggle Row ───────────────────────────────────────────────────────────────
const ToggleRow = ({
  label,
  sublabel,
  checked,
  onChange,
  icon,
}: {
  label: string;
  sublabel?: string;
  checked: boolean;
  onChange: () => void;
  icon?: string;
}) => (
  <Stack
    direction="row"
    justifyContent="space-between"
    alignItems="center"
    sx={{
      py: 1.25,
      px: 1.5,
      mb: 1,
      borderRadius: '10px',
      border: '1px solid #d0e0ff',
      backgroundColor: checked ? PRIMARY_BLUE_LIGHT : '#f8fbff',
      transition: 'background-color 0.2s',
    }}
  >
    <Stack direction="row" alignItems="center" spacing={1.5}>
      {icon && (
        <IconifyIcon icon={icon} sx={{ fontSize: 18, color: checked ? PRIMARY_BLUE : '#9e9e9e' }} />
      )}
      <Box>
        <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#0f2a6e' }}>
          {label}
        </Typography>
        {sublabel && (
          <Typography sx={{ fontSize: '11px', color: '#4a6fa5' }}>{sublabel}</Typography>
        )}
      </Box>
    </Stack>
    <Switch
      checked={checked}
      onChange={onChange}
      size="small"
      sx={{
        '& .MuiSwitch-switchBase.Mui-checked': { color: PRIMARY_BLUE },
        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
          backgroundColor: PRIMARY_BLUE,
        },
      }}
    />
  </Stack>
);

// ─── Password strength meter ──────────────────────────────────────────────────
const getStrength = (pw: string) => {
  let score = 0;
  if (pw.length >= 8) score += 25;
  if (/[A-Z]/.test(pw)) score += 25;
  if (/[0-9]/.test(pw)) score += 25;
  if (/[^A-Za-z0-9]/.test(pw)) score += 25;
  return score;
};
const strengthLabel = (s: number) =>
  s <= 25
    ? { label: 'Weak', color: '#f44336' }
    : s <= 50
      ? { label: 'Fair', color: '#ff9800' }
      : s <= 75
        ? { label: 'Good', color: '#2196f3' }
        : { label: 'Strong', color: '#4caf50' };

// ─── Tab Panel ────────────────────────────────────────────────────────────────
const TabPanel = ({
  children,
  value,
  index,
}: {
  children: React.ReactNode;
  value: number;
  index: number;
}) => (
  <div hidden={value !== index}>{value === index && <Box sx={{ pt: 2.5 }}>{children}</Box>}</div>
);

// ─── Static mock data ─────────────────────────────────────────────────────────
const BACKUP_CODES = ['ABCD-1234', 'EFGH-5678', 'IJKL-9012', 'MNOP-3456', 'QRST-7890', 'UVWX-2345'];

const SESSIONS = [
  {
    id: 1,
    device: 'Chrome · Windows 11',
    ip: '192.168.1.10',
    location: 'Bhopal, IN',
    time: 'Today, 09:42 AM',
    current: true,
  },
  {
    id: 2,
    device: 'Safari · iPhone 14',
    ip: '10.0.0.5',
    location: 'Indore, IN',
    time: 'Yesterday, 07:15 PM',
    current: false,
  },
  {
    id: 3,
    device: 'Firefox · macOS',
    ip: '172.16.0.22',
    location: 'Mumbai, IN',
    time: '19 Apr, 11:30 AM',
    current: false,
  },
];

const AUDIT_LOGS = [
  { action: 'Login', time: 'Today, 09:42 AM', ip: '192.168.1.10' },
  { action: 'Profile photo updated', time: 'Yesterday, 03:10 PM', ip: '10.0.0.5' },
  { action: 'Password changed', time: '15 Apr, 02:45 PM', ip: '192.168.1.10' },
  { action: 'Settings updated', time: '12 Apr, 11:00 AM', ip: '192.168.1.10' },
  { action: 'Login', time: '10 Apr, 08:30 AM', ip: '172.16.0.22' },
];

// ─── Main Component ───────────────────────────────────────────────────────────
const AdminProfilePage = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState(0);

  // ── Personal Info ──
  const [profile, setProfile] = useState({
    fullName: 'Admin User',
    email: 'admin@kaivalya.com',
    phone: '9876543210',
    department: 'IT Management',
    avatarUrl: '',
  });

  // ── Security ──
  const [security, setSecurity] = useState({
    currentPw: '',
    newPw: '',
    confirmPw: '',
    twoFA: false,
    showCodes: false,
  });

  // ── Notifications ──
  const [notif, setNotif] = useState({
    email: true,
    taskAssigned: true,
    priorityChange: true,
    updateRejected: false,
    taskOverdue: true,
    newProject: true,
    backupStatus: false,
  });

  // ── Display ──
  const [display, setDisplay] = useState({
    themeMode: 'Light',
    sidebarCollapsed: false,
    defaultView: 'Admin Dashboard',
    language: 'English',
  });

  // ── System ──
  const [system, setSystem] = useState({
    defaultPhase: 'Planning',
    defaultPriority: 'Medium',
    dateFormat: 'DD/MM/YYYY',
    timeZone: 'IST (UTC+5:30)',
    itemsPerPage: '25',
  });

  // ── Dialogs ──
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deactivateDialog, setDeactivateDialog] = useState(false);
  const [pinDialog, setPinDialog] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deactivateReason, setDeactivateReason] = useState('');
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });
  const toast = (message: string, severity: 'success' | 'error' = 'success') =>
    setSnackbar({ open: true, message, severity });

  // ── Handlers ──
  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast('Max file size is 2MB', 'error');
      return;
    }
    const url = URL.createObjectURL(file);
    setProfile((p) => ({ ...p, avatarUrl: url }));
    toast('Profile picture updated');
  };

  const handleSaveProfile = () => {
    if (!profile.fullName || profile.fullName.length < 2) {
      toast('Full name is required (min 2 chars)', 'error');
      return;
    }
    if (!profile.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) {
      toast('Valid email is required', 'error');
      return;
    }
    if (profile.phone && !/^\d{10}$/.test(profile.phone)) {
      toast('Phone must be 10 digits', 'error');
      return;
    }
    toast('Profile saved successfully');
  };

  const handleChangePassword = () => {
    if (!security.currentPw) {
      toast('Current password is required', 'error');
      return;
    }
    if (security.newPw.length < 8) {
      toast('New password must be at least 8 characters', 'error');
      return;
    }
    if (security.newPw !== security.confirmPw) {
      toast('Passwords do not match', 'error');
      return;
    }
    setSecurity((s) => ({ ...s, currentPw: '', newPw: '', confirmPw: '' }));
    toast('Password changed successfully');
  };

  const handleLogoutAll = () => toast('All other sessions terminated');

  const handleExport = () => toast('Export started — file will download shortly');

  const handleSavePin = () => {
    if (!/^\d{6}$/.test(oldPin) || !/^\d{6}$/.test(newPin)) {
      toast('PIN must be 6 digits', 'error');
      return;
    }
    setPinDialog(false);
    setOldPin('');
    setNewPin('');
    toast('PIN changed successfully');
  };

  const pwStrength = getStrength(security.newPw);
  const pwStrengthInfo = strengthLabel(pwStrength);

  const TABS = [
    { label: 'Personal', icon: 'material-symbols:person' },
    { label: 'Security', icon: 'material-symbols:lock' },
    { label: 'Sessions', icon: 'material-symbols:devices' },
    { label: 'Notifications', icon: 'material-symbols:notifications' },
    { label: 'Display', icon: 'material-symbols:palette' },
    { label: 'System', icon: 'material-symbols:settings' },
    { label: 'Audit Logs', icon: 'material-symbols:history' },
  ];

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* ── Page Header ── */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#0f2a6e' }}>
          Admin Profile
        </Typography>
        <Typography variant="body2" sx={{ color: '#4a6fa5', mt: 0.5 }}>
          Manage your account information, security settings, and preferences.
        </Typography>
      </Box>

      {/* ── Hero / Avatar Card ── */}
      <Card
        elevation={0}
        sx={{
          border: '1px solid #d0e0ff',
          borderRadius: '14px',
          mb: 3,
          background: `linear-gradient(135deg, ${PRIMARY_BLUE_LIGHT} 0%, #f0f5ff 100%)`,
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            alignItems={{ xs: 'center', sm: 'flex-start' }}
            spacing={3}
          >
            {/* Avatar with edit overlay */}
            <Box sx={{ position: 'relative', cursor: 'pointer' }} onClick={handleAvatarClick}>
              <Avatar
                src={profile.avatarUrl}
                sx={{
                  width: 88,
                  height: 88,
                  fontSize: '2rem',
                  fontWeight: 700,
                  backgroundColor: PRIMARY_BLUE,
                  border: `3px solid ${PRIMARY_BLUE}`,
                  boxShadow: `0 4px 16px ${PRIMARY_BLUE}35`,
                }}
              >
                {!profile.avatarUrl && profile.fullName.charAt(0).toUpperCase()}
              </Avatar>
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  backgroundColor: PRIMARY_BLUE,
                  border: '2px solid #fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <IconifyIcon
                  icon="material-symbols:camera-alt"
                  sx={{ fontSize: 14, color: '#fff' }}
                />
              </Box>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
            </Box>

            {/* Name / role / meta */}
            <Box sx={{ flex: 1 }}>
              <Stack direction="row" alignItems="center" spacing={1.5} flexWrap="wrap">
                <Typography sx={{ fontSize: '1.35rem', fontWeight: 700, color: '#0f2a6e' }}>
                  {profile.fullName}
                </Typography>
                <Chip
                  label="Admin"
                  size="small"
                  sx={{
                    backgroundColor: PRIMARY_BLUE,
                    color: '#fff',
                    fontWeight: 700,
                    borderRadius: '8px',
                    fontSize: '11px',
                  }}
                />
                {security.twoFA && (
                  <Chip
                    label="2FA On"
                    size="small"
                    icon={
                      <IconifyIcon
                        icon="material-symbols:verified-user"
                        sx={{ fontSize: '14px !important', color: '#2e7d32 !important' }}
                      />
                    }
                    sx={{
                      backgroundColor: '#e8f5e9',
                      color: '#2e7d32',
                      fontWeight: 700,
                      borderRadius: '8px',
                      fontSize: '11px',
                      border: '1px solid #a5d6a7',
                    }}
                  />
                )}
              </Stack>
              <Typography sx={{ color: '#4a6fa5', fontSize: '13px', mt: 0.5 }}>
                {profile.email}
              </Typography>
              <Stack direction="row" spacing={2} sx={{ mt: 1.5 }} flexWrap="wrap">
                {[
                  { icon: 'material-symbols:phone', text: profile.phone || '—' },
                  { icon: 'material-symbols:apartment', text: profile.department || '—' },
                  { icon: 'material-symbols:schedule', text: 'Last login: Today, 09:42 AM' },
                ].map(({ icon, text }) => (
                  <Stack key={icon} direction="row" alignItems="center" spacing={0.5}>
                    <IconifyIcon icon={icon} sx={{ fontSize: 14, color: PRIMARY_BLUE }} />
                    <Typography sx={{ fontSize: '12px', color: '#4a6fa5' }}>{text}</Typography>
                  </Stack>
                ))}
              </Stack>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* ── Tabs ── */}
      <Card elevation={0} sx={{ border: '1px solid #d0e0ff', borderRadius: '12px', mb: 3 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            px: 1,
            '& .MuiTab-root': {
              fontWeight: 600,
              fontSize: '12px',
              textTransform: 'none',
              minHeight: 52,
              color: '#4a6fa5',
              '&.Mui-selected': { color: PRIMARY_BLUE },
            },
            '& .MuiTabs-indicator': { backgroundColor: PRIMARY_BLUE, height: 3, borderRadius: 2 },
          }}
        >
          {TABS.map(({ label, icon }) => (
            <Tab
              key={label}
              label={label}
              icon={<IconifyIcon icon={icon} sx={{ fontSize: 18 }} />}
              iconPosition="start"
            />
          ))}
        </Tabs>
      </Card>

      {/* ══════════════════════════════════════════════════════
          TAB 0 — Personal Information
      ══════════════════════════════════════════════════════ */}
      <TabPanel value={tab} index={0}>
        <SectionCard title="Personal Information" icon="material-symbols:person-outline">
          <Grid container spacing={2.5}>
            <Grid size={12}>
              <TextField
                fullWidth
                variant="outlined"
                label="Full Name"
                value={profile.fullName}
                onChange={(e) => setProfile((p) => ({ ...p, fullName: e.target.value }))}
                sx={fieldSx}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                variant="outlined"
                label="Email Address"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                sx={fieldSx}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                variant="outlined"
                label="Phone Number"
                placeholder="10-digit number"
                value={profile.phone}
                onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                inputProps={{ maxLength: 10 }}
                sx={fieldSx}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                variant="outlined"
                label="Department"
                placeholder="e.g. IT, Management"
                value={profile.department}
                onChange={(e) => setProfile((p) => ({ ...p, department: e.target.value }))}
                sx={fieldSx}
              />
            </Grid>
            <Grid size={12}>
              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button
                  variant="contained"
                  onClick={handleSaveProfile}
                  startIcon={<IconifyIcon icon="material-symbols:save" />}
                  sx={{
                    backgroundColor: PRIMARY_BLUE,
                    fontWeight: 600,
                    borderRadius: '8px',
                    textTransform: 'none',
                    px: 3,
                    boxShadow: `0 4px 12px ${PRIMARY_BLUE}40`,
                    '&:hover': { backgroundColor: PRIMARY_BLUE_DARK },
                  }}
                >
                  Save Changes
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </SectionCard>

        {/* Account Actions */}
        <SectionCard title="Account Actions" icon="material-symbols:manage-accounts">
          <Grid container spacing={2}>
            {[
              {
                label: 'Change PIN',
                sub: '6-digit numeric PIN for quick access',
                icon: 'material-symbols:pin',
                color: PRIMARY_BLUE,
                bg: PRIMARY_BLUE_LIGHT,
                action: () => setPinDialog(true),
              },
              {
                label: 'Export My Data',
                sub: 'Download all account data as JSON/CSV',
                icon: 'material-symbols:download',
                color: '#2e7d32',
                bg: '#e8f5e9',
                action: handleExport,
              },
              {
                label: 'Deactivate Account',
                sub: 'Temporarily disable this account',
                icon: 'material-symbols:pause-circle',
                color: '#e65100',
                bg: '#fff3e0',
                action: () => setDeactivateDialog(true),
              },
              {
                label: 'Delete Account',
                sub: 'Permanently remove all data',
                icon: 'material-symbols:delete-forever',
                color: '#c62828',
                bg: '#ffebee',
                action: () => setDeleteDialog(true),
              },
            ].map(({ label, sub, icon, color, bg, action }) => (
              <Grid size={12} key={label}>
                <Box
                  onClick={action}
                  sx={{
                    p: 2,
                    borderRadius: '10px',
                    border: '1px solid #d0e0ff',
                    backgroundColor: '#f8fbff',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    '&:hover': {
                      backgroundColor: bg,
                      borderColor: color,
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: '10px',
                        backgroundColor: bg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <IconifyIcon icon={icon} sx={{ fontSize: 20, color }} />
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#0f2a6e' }}>
                        {label}
                      </Typography>
                      <Typography sx={{ fontSize: '11px', color: '#4a6fa5' }}>{sub}</Typography>
                    </Box>
                  </Stack>
                </Box>
              </Grid>
            ))}
          </Grid>
        </SectionCard>
      </TabPanel>

      {/* ══════════════════════════════════════════════════════
          TAB 1 — Security & Authentication
      ══════════════════════════════════════════════════════ */}
      <TabPanel value={tab} index={1}>
        <SectionCard title="Change Password" icon="material-symbols:lock-outline">
          <Grid container spacing={2.5}>
            <Grid size={12}>
              <TextField
                fullWidth
                variant="outlined"
                label="Current Password"
                type="password"
                value={security.currentPw}
                onChange={(e) => setSecurity((s) => ({ ...s, currentPw: e.target.value }))}
                sx={fieldSx}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                variant="outlined"
                label="New Password"
                type="password"
                value={security.newPw}
                onChange={(e) => setSecurity((s) => ({ ...s, newPw: e.target.value }))}
                sx={fieldSx}
              />
              {security.newPw && (
                <Box sx={{ mt: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={pwStrength}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: '#e0e0e0',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: pwStrengthInfo.color,
                        borderRadius: 3,
                      },
                    }}
                  />
                  <Typography
                    sx={{ fontSize: '11px', color: pwStrengthInfo.color, mt: 0.5, fontWeight: 600 }}
                  >
                    Strength: {pwStrengthInfo.label}
                  </Typography>
                </Box>
              )}
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                variant="outlined"
                label="Confirm New Password"
                type="password"
                value={security.confirmPw}
                onChange={(e) => setSecurity((s) => ({ ...s, confirmPw: e.target.value }))}
                error={!!(security.confirmPw && security.newPw !== security.confirmPw)}
                helperText={
                  security.confirmPw && security.newPw !== security.confirmPw
                    ? "Passwords don't match"
                    : ''
                }
                sx={fieldSx}
              />
            </Grid>
            <Grid size={12}>
              <Button
                variant="contained"
                onClick={handleChangePassword}
                startIcon={<IconifyIcon icon="material-symbols:lock-reset" />}
                sx={{
                  backgroundColor: PRIMARY_BLUE,
                  fontWeight: 600,
                  borderRadius: '8px',
                  textTransform: 'none',
                  px: 3,
                  boxShadow: `0 4px 12px ${PRIMARY_BLUE}40`,
                  '&:hover': { backgroundColor: PRIMARY_BLUE_DARK },
                }}
              >
                Change Password
              </Button>
            </Grid>
          </Grid>
        </SectionCard>

        <SectionCard title="Two-Factor Authentication" icon="material-symbols:security">
          <ToggleRow
            label="Enable 2FA"
            sublabel="Adds an extra layer of security to your account"
            icon="material-symbols:verified-user"
            checked={security.twoFA}
            onChange={() => {
              setSecurity((s) => ({ ...s, twoFA: !s.twoFA }));
              toast(!security.twoFA ? '2FA enabled' : '2FA disabled');
            }}
          />
          {security.twoFA && (
            <Box sx={{ mt: 2 }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 1.5 }}
              >
                <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#0f2a6e' }}>
                  Backup Codes
                </Typography>
                <Button
                  size="small"
                  startIcon={<IconifyIcon icon="material-symbols:refresh" />}
                  onClick={() => toast('Backup codes regenerated')}
                  sx={{
                    color: PRIMARY_BLUE,
                    fontWeight: 600,
                    textTransform: 'none',
                    borderRadius: '8px',
                    '&:hover': { backgroundColor: PRIMARY_BLUE_LIGHT },
                  }}
                >
                  Regenerate
                </Button>
              </Stack>
              <Grid container spacing={1}>
                {BACKUP_CODES.map((code) => (
                  <Grid size={{ xs: 6, sm: 4 }} key={code}>
                    <Box
                      sx={{
                        p: 1,
                        textAlign: 'center',
                        borderRadius: '8px',
                        backgroundColor: PRIMARY_BLUE_LIGHT,
                        border: `1px solid ${PRIMARY_BLUE}55`,
                        fontFamily: 'monospace',
                        fontSize: '13px',
                        fontWeight: 700,
                        color: PRIMARY_BLUE,
                      }}
                    >
                      {code}
                    </Box>
                  </Grid>
                ))}
              </Grid>
              <Typography sx={{ fontSize: '11px', color: '#4a6fa5', mt: 1 }}>
                Store these codes safely. Each can only be used once.
              </Typography>
            </Box>
          )}
        </SectionCard>
      </TabPanel>

      {/* ══════════════════════════════════════════════════════
          TAB 2 — Session Management
      ══════════════════════════════════════════════════════ */}
      <TabPanel value={tab} index={2}>
        <SectionCard
          title="Active Sessions"
          icon="material-symbols:devices"
          action={
            <Button
              size="small"
              variant="outlined"
              startIcon={<IconifyIcon icon="material-symbols:logout" />}
              onClick={handleLogoutAll}
              sx={{
                borderColor: '#e53935',
                color: '#e53935',
                fontWeight: 600,
                borderRadius: '8px',
                textTransform: 'none',
                fontSize: '12px',
                '&:hover': { backgroundColor: '#ffebee', borderColor: '#c62828' },
              }}
            >
              Logout All Others
            </Button>
          }
        >
          <Stack spacing={1.5}>
            {SESSIONS.map((s) => (
              <Box
                key={s.id}
                sx={{
                  p: 2,
                  borderRadius: '10px',
                  border: `1.5px solid ${s.current ? PRIMARY_BLUE : '#d0e0ff'}`,
                  backgroundColor: s.current ? PRIMARY_BLUE_LIGHT : '#f8fbff',
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: '10px',
                        backgroundColor: s.current ? PRIMARY_BLUE : '#e0e0e0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <IconifyIcon
                        icon={
                          s.device.includes('iPhone')
                            ? 'material-symbols:smartphone'
                            : s.device.includes('macOS')
                              ? 'material-symbols:laptop-mac'
                              : 'material-symbols:computer'
                        }
                        sx={{ fontSize: 20, color: s.current ? '#fff' : '#616161' }}
                      />
                    </Box>
                    <Box>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#0f2a6e' }}>
                          {s.device}
                        </Typography>
                        {s.current && (
                          <Chip
                            label="Current"
                            size="small"
                            sx={{
                              height: 18,
                              fontSize: '10px',
                              fontWeight: 700,
                              backgroundColor: PRIMARY_BLUE,
                              color: '#fff',
                              borderRadius: '6px',
                            }}
                          />
                        )}
                      </Stack>
                      <Typography sx={{ fontSize: '11px', color: '#4a6fa5' }}>
                        {s.ip} · {s.location} · {s.time}
                      </Typography>
                    </Box>
                  </Stack>
                  {!s.current && (
                    <Tooltip title="Terminate session">
                      <IconButton
                        size="small"
                        onClick={() => toast('Session terminated')}
                        sx={{ color: '#e53935', '&:hover': { backgroundColor: '#ffebee' } }}
                      >
                        <IconifyIcon icon="material-symbols:close" sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Tooltip>
                  )}
                </Stack>
              </Box>
            ))}
          </Stack>
        </SectionCard>
      </TabPanel>

      {/* ══════════════════════════════════════════════════════
          TAB 3 — Notification Preferences
      ══════════════════════════════════════════════════════ */}
      <TabPanel value={tab} index={3}>
        <SectionCard title="Notification Preferences" icon="material-symbols:notifications-outline">
          {[
            {
              key: 'email',
              label: 'Email Notifications',
              sub: 'Receive all notifications via email',
              icon: 'material-symbols:email',
            },
            {
              key: 'taskAssigned',
              label: 'Task Assigned',
              sub: 'When a task is assigned to you',
              icon: 'material-symbols:assignment-ind',
            },
            {
              key: 'priorityChange',
              label: 'Task Priority Changed',
              sub: 'When priority of your task changes',
              icon: 'material-symbols:priority-high',
            },
            {
              key: 'updateRejected',
              label: 'Task Update Rejected',
              sub: 'When your submitted update is rejected',
              icon: 'material-symbols:cancel',
            },
            {
              key: 'taskOverdue',
              label: 'Task Overdue Reminder',
              sub: 'Daily reminder for overdue tasks',
              icon: 'material-symbols:alarm',
            },
            {
              key: 'newProject',
              label: 'New Project Created',
              sub: 'When a new project is added to the system',
              icon: 'material-symbols:add-circle',
            },
            {
              key: 'backupStatus',
              label: 'System Backup Status',
              sub: 'Weekly backup completion alerts',
              icon: 'material-symbols:backup',
            },
          ].map(({ key, label, sub, icon }) => (
            <ToggleRow
              key={key}
              label={label}
              sublabel={sub}
              icon={icon}
              checked={notif[key as keyof typeof notif]}
              onChange={() => setNotif((n) => ({ ...n, [key]: !n[key as keyof typeof notif] }))}
            />
          ))}
        </SectionCard>
      </TabPanel>

      {/* ══════════════════════════════════════════════════════
          TAB 4 — Display & Theme
      ══════════════════════════════════════════════════════ */}
      <TabPanel value={tab} index={4}>
        <SectionCard title="Display & Theme Preferences" icon="material-symbols:palette-outline">
          <Grid container spacing={2.5}>
            <Grid size={12}>
              <FormControl fullWidth sx={selectSx}>
                <InputLabel>Theme Mode</InputLabel>
                <Select
                  variant="outlined"
                  value={display.themeMode}
                  label="Theme Mode"
                  onChange={(e) => setDisplay((d) => ({ ...d, themeMode: e.target.value }))}
                >
                  {['Light', 'Dark', 'System'].map((o) => (
                    <MenuItem key={o} value={o}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <IconifyIcon
                          icon={
                            o === 'Light'
                              ? 'material-symbols:light-mode'
                              : o === 'Dark'
                                ? 'material-symbols:dark-mode'
                                : 'material-symbols:devices'
                          }
                          sx={{ fontSize: 18, color: PRIMARY_BLUE }}
                        />
                        <span>{o}</span>
                      </Stack>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={12}>
              <FormControl fullWidth sx={selectSx}>
                <InputLabel>Default Dashboard View</InputLabel>
                <Select
                  variant="outlined"
                  value={display.defaultView}
                  label="Default Dashboard View"
                  onChange={(e) => setDisplay((d) => ({ ...d, defaultView: e.target.value }))}
                >
                  {['Admin Dashboard', 'Employee Dashboard'].map((o) => (
                    <MenuItem key={o} value={o}>
                      {o}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={12}>
              <FormControl fullWidth sx={selectSx}>
                <InputLabel>Language</InputLabel>
                <Select
                  variant="outlined"
                  value={display.language}
                  label="Language"
                  onChange={(e) => setDisplay((d) => ({ ...d, language: e.target.value }))}
                >
                  {['English', 'Hindi', 'Marathi', 'Gujarati'].map((o) => (
                    <MenuItem key={o} value={o}>
                      {o}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={12}>
              <ToggleRow
                label="Sidebar Collapsed by Default"
                sublabel="Start with the sidebar minimised"
                icon="material-symbols:menu-open"
                checked={display.sidebarCollapsed}
                onChange={() =>
                  setDisplay((d) => ({ ...d, sidebarCollapsed: !d.sidebarCollapsed }))
                }
              />
            </Grid>
            <Grid size={12}>
              <Button
                variant="contained"
                startIcon={<IconifyIcon icon="material-symbols:save" />}
                onClick={() => toast('Display preferences saved')}
                sx={{
                  backgroundColor: PRIMARY_BLUE,
                  fontWeight: 600,
                  borderRadius: '8px',
                  textTransform: 'none',
                  px: 3,
                  boxShadow: `0 4px 12px ${PRIMARY_BLUE}40`,
                  '&:hover': { backgroundColor: PRIMARY_BLUE_DARK },
                }}
              >
                Save Preferences
              </Button>
            </Grid>
          </Grid>
        </SectionCard>
      </TabPanel>

      {/* ══════════════════════════════════════════════════════
          TAB 5 — System / Application Settings
      ══════════════════════════════════════════════════════ */}
      <TabPanel value={tab} index={5}>
        <SectionCard title="Application Settings" icon="material-symbols:settings-outline">
          <Grid container spacing={2.5}>
            {[
              {
                label: 'Default Project Phase',
                key: 'defaultPhase',
                options: [
                  'Planning',
                  'Design',
                  'Development',
                  'Testing',
                  'Deployment',
                  'Debugging',
                ],
              },
              {
                label: 'Default Task Priority',
                key: 'defaultPriority',
                options: ['Low', 'Medium', 'High'],
              },
              {
                label: 'Date Format',
                key: 'dateFormat',
                options: ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'],
              },
              {
                label: 'Time Zone',
                key: 'timeZone',
                options: ['IST (UTC+5:30)', 'EST (UTC-5)', 'UTC', 'PST (UTC-8)', 'CST (UTC-6)'],
              },
              { label: 'Items per Page', key: 'itemsPerPage', options: ['10', '25', '50', '100'] },
            ].map(({ label, key, options }) => (
              <Grid size={12} key={key}>
                <FormControl fullWidth sx={selectSx}>
                  <InputLabel>{label}</InputLabel>
                  <Select
                    variant="outlined"
                    value={system[key as keyof typeof system]}
                    label={label}
                    onChange={(e) => setSystem((s) => ({ ...s, [key]: e.target.value }))}
                  >
                    {options.map((o) => (
                      <MenuItem key={o} value={o}>
                        {o}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            ))}
            <Grid size={12}>
              <Button
                variant="contained"
                startIcon={<IconifyIcon icon="material-symbols:save" />}
                onClick={() => toast('System settings saved')}
                sx={{
                  backgroundColor: PRIMARY_BLUE,
                  fontWeight: 600,
                  borderRadius: '8px',
                  textTransform: 'none',
                  px: 3,
                  boxShadow: `0 4px 12px ${PRIMARY_BLUE}40`,
                  '&:hover': { backgroundColor: PRIMARY_BLUE_DARK },
                }}
              >
                Save Settings
              </Button>
            </Grid>
          </Grid>
        </SectionCard>
      </TabPanel>

      {/* ══════════════════════════════════════════════════════
          TAB 6 — Audit Logs
      ══════════════════════════════════════════════════════ */}
      <TabPanel value={tab} index={6}>
        <SectionCard title="Audit & Activity Log" icon="material-symbols:history">
          {/* Summary row */}
          <Grid container spacing={2} sx={{ mb: 2.5 }}>
            {[
              {
                label: 'Last Login',
                value: 'Today, 09:42 AM',
                icon: 'material-symbols:login',
                color: PRIMARY_BLUE,
                bg: PRIMARY_BLUE_LIGHT,
              },
              {
                label: 'Last Password Change',
                value: '15 Apr, 02:45 PM',
                icon: 'material-symbols:lock-reset',
                color: '#e65100',
                bg: '#fff3e0',
              },
              {
                label: 'Last Profile Update',
                value: 'Yesterday, 03:10 PM',
                icon: 'material-symbols:manage-accounts',
                color: '#2e7d32',
                bg: '#e8f5e9',
              },
            ].map(({ label, value, icon, color, bg }) => (
              <Grid size={{ xs: 12, sm: 4 }} key={label}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: '10px',
                    backgroundColor: bg,
                    border: `1px solid ${color}40`,
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <IconifyIcon icon={icon} sx={{ fontSize: 22, color }} />
                    <Box>
                      <Typography sx={{ fontSize: '11px', color: '#4a6fa5', lineHeight: 1 }}>
                        {label}
                      </Typography>
                      <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#0f2a6e' }}>
                        {value}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              </Grid>
            ))}
          </Grid>

          <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#0f2a6e', mb: 1.5 }}>
            Recent Activity
          </Typography>
          <List disablePadding>
            {AUDIT_LOGS.map((log, i) => (
              <Box key={i}>
                <ListItem
                  disablePadding
                  sx={{
                    py: 1.25,
                    px: 1.5,
                    borderRadius: '10px',
                    '&:hover': { backgroundColor: PRIMARY_BLUE_LIGHT },
                  }}
                >
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      backgroundColor: PRIMARY_BLUE_LIGHT,
                      mr: 1.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <IconifyIcon
                      icon="material-symbols:circle"
                      sx={{ fontSize: 10, color: PRIMARY_BLUE }}
                    />
                  </Box>
                  <ListItemText
                    primary={
                      <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#0f2a6e' }}>
                        {log.action}
                      </Typography>
                    }
                    secondary={
                      <Typography sx={{ fontSize: '11px', color: '#4a6fa5' }}>
                        {log.time} · IP: {log.ip}
                      </Typography>
                    }
                  />
                </ListItem>
                {i < AUDIT_LOGS.length - 1 && <Divider sx={{ borderColor: '#e8f0fe', ml: 7 }} />}
              </Box>
            ))}
          </List>
        </SectionCard>
      </TabPanel>

      {/* ══════════════════════════════════════════════════════
          DIALOGS
      ══════════════════════════════════════════════════════ */}

      {/* Change PIN Dialog */}
      <Dialog
        open={pinDialog}
        onClose={() => setPinDialog(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: '14px', border: '1px solid #d0e0ff' } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: '#0f2a6e' }}>Change PIN</DialogTitle>
        <Divider sx={{ borderColor: '#d0e0ff' }} />
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <TextField
              fullWidth
              variant="outlined"
              label="Old PIN"
              type="password"
              inputProps={{ maxLength: 6 }}
              value={oldPin}
              onChange={(e) => setOldPin(e.target.value.replace(/\D/, ''))}
              sx={fieldSx}
            />
            <TextField
              fullWidth
              variant="outlined"
              label="New PIN (6 digits)"
              type="password"
              inputProps={{ maxLength: 6 }}
              value={newPin}
              onChange={(e) => setNewPin(e.target.value.replace(/\D/, ''))}
              sx={fieldSx}
            />
          </Stack>
        </DialogContent>
        <Divider sx={{ borderColor: '#d0e0ff' }} />
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button
            onClick={() => setPinDialog(false)}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 600,
              color: PRIMARY_BLUE,
              border: `1.5px solid ${PRIMARY_BLUE}`,
              '&:hover': { backgroundColor: PRIMARY_BLUE_LIGHT },
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSavePin}
            sx={{
              backgroundColor: PRIMARY_BLUE,
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': { backgroundColor: PRIMARY_BLUE_DARK },
            }}
          >
            Save PIN
          </Button>
        </DialogActions>
      </Dialog>

      {/* Deactivate Dialog */}
      <Dialog
        open={deactivateDialog}
        onClose={() => setDeactivateDialog(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: '14px', border: '1px solid #ffe0b2' } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: '#e65100' }}>Deactivate Account</DialogTitle>
        <Divider sx={{ borderColor: '#ffe0b2' }} />
        <DialogContent sx={{ pt: 2 }}>
          <Typography sx={{ fontSize: '13px', color: '#4a6fa5', mb: 2 }}>
            Please provide a reason for deactivation.
          </Typography>
          <TextField
            fullWidth
            variant="outlined"
            label="Reason"
            multiline
            rows={3}
            value={deactivateReason}
            onChange={(e) => setDeactivateReason(e.target.value)}
            sx={fieldSx}
          />
        </DialogContent>
        <Divider sx={{ borderColor: '#ffe0b2' }} />
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button
            onClick={() => setDeactivateDialog(false)}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 600,
              color: PRIMARY_BLUE,
              border: `1.5px solid ${PRIMARY_BLUE}`,
              '&:hover': { backgroundColor: PRIMARY_BLUE_LIGHT },
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setDeactivateDialog(false);
              toast('Account deactivated');
            }}
            sx={{
              backgroundColor: '#e65100',
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': { backgroundColor: '#bf360c' },
            }}
          >
            Deactivate
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog
        open={deleteDialog}
        onClose={() => setDeleteDialog(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: '14px', border: '1px solid #ffcdd2' } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: '#c62828' }}>Delete Account</DialogTitle>
        <Divider sx={{ borderColor: '#ffcdd2' }} />
        <DialogContent sx={{ pt: 2 }}>
          <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }}>
            This action is permanent and cannot be undone.
          </Alert>
          <Typography sx={{ fontSize: '13px', color: '#4a6fa5', mb: 2 }}>
            Type <strong>DELETE</strong> to confirm.
          </Typography>
          <TextField
            fullWidth
            variant="outlined"
            label='Type "DELETE" to confirm'
            value={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.target.value)}
            sx={fieldSx}
          />
        </DialogContent>
        <Divider sx={{ borderColor: '#ffcdd2' }} />
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button
            onClick={() => setDeleteDialog(false)}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 600,
              color: PRIMARY_BLUE,
              border: `1.5px solid ${PRIMARY_BLUE}`,
              '&:hover': { backgroundColor: PRIMARY_BLUE_LIGHT },
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={deleteConfirm !== 'DELETE'}
            onClick={() => {
              setDeleteDialog(false);
              toast('Account deletion initiated', 'error');
            }}
            sx={{
              backgroundColor: '#c62828',
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': { backgroundColor: '#b71c1c' },
              '&.Mui-disabled': { backgroundColor: '#e0e0e0' },
            }}
          >
            Delete Permanently
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          sx={{ borderRadius: '10px' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminProfilePage;
