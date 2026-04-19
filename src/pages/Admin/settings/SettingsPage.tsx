// src/pages/Admin/settings/SettingsPage.tsx
import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  FormControlLabel,
  Grid,
  Paper,
  Snackbar,
  Switch,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { useAuth } from 'context/AuthContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const SettingsPage = () => {
  const { user } = useAuth(); // updateUser removed – not in context
  const [tabValue, setTabValue] = useState(0);

  // Profile form state – load from localStorage or user context
  const [profile, setProfile] = useState({
    name: user?.name || localStorage.getItem('admin_name') || '',
    email: user?.email || localStorage.getItem('admin_email') || '',
  });
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  // Notification preferences
  const [notifPrefs, setNotifPrefs] = useState({
    emailOnTaskAssigned: true,
    emailOnPriorityChange: true,
    emailOnUpdateRejected: true,
    emailOnTaskOverdue: false,
  });

  // System preferences (without themeMode – config doesn't support it)
  const [sysPrefs, setSysPrefs] = useState({
    defaultProjectPhase: 'Planning',
  });

  // Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Profile save – store in localStorage
  const handleSaveProfile = () => {
    if (profile.name && profile.email) {
      localStorage.setItem('admin_name', profile.name);
      localStorage.setItem('admin_email', profile.email);
      setSnackbar({ open: true, message: 'Profile updated', severity: 'success' });
    } else {
      setSnackbar({ open: true, message: 'Name and email are required', severity: 'error' });
    }
  };

  const handleChangePin = () => {
    if (pin.length !== 6 || !/^\d+$/.test(pin)) {
      setSnackbar({ open: true, message: 'PIN must be 6 digits', severity: 'error' });
      return;
    }
    if (pin !== confirmPin) {
      setSnackbar({ open: true, message: 'PINs do not match', severity: 'error' });
      return;
    }
    localStorage.setItem('admin_pin', pin);
    setSnackbar({ open: true, message: 'PIN changed successfully', severity: 'success' });
    setPin('');
    setConfirmPin('');
  };

  // Save notification preferences
  const handleSaveNotifications = () => {
    localStorage.setItem('admin_notif_prefs', JSON.stringify(notifPrefs));
    setSnackbar({ open: true, message: 'Notification preferences saved', severity: 'success' });
  };

  // Save system preferences (without themeMode)
  const handleSaveSystem = () => {
    localStorage.setItem('admin_sys_prefs', JSON.stringify(sysPrefs));
    setSnackbar({ open: true, message: 'System preferences saved', severity: 'success' });
  };

  // Load saved preferences on mount
  useEffect(() => {
    const savedNotif = localStorage.getItem('admin_notif_prefs');
    if (savedNotif) setNotifPrefs(JSON.parse(savedNotif));
    const savedSys = localStorage.getItem('admin_sys_prefs');
    if (savedSys) setSysPrefs(JSON.parse(savedSys));
  }, []);

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h4" gutterBottom fontWeight={600}>
        Settings
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Manage your profile, security, and application preferences.
      </Typography>

      <Paper sx={{ width: '100%' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="settings tabs">
          <Tab label="Profile & Security" />
          <Tab label="Notifications" />
          <Tab label="System" />
        </Tabs>
        <Divider />

        {/* Profile Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Account Information
                  </Typography>
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    sx={{ mb: 2 }}
                  />
                  <Button variant="contained" onClick={handleSaveProfile}>
                    Save Changes
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Change PIN (6-digit)
                  </Typography>
                  <TextField
                    fullWidth
                    type="password"
                    label="New PIN"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    inputProps={{ maxLength: 6, pattern: '[0-9]*' }}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    type="password"
                    label="Confirm PIN"
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value)}
                    inputProps={{ maxLength: 6, pattern: '[0-9]*' }}
                    sx={{ mb: 2 }}
                  />
                  <Button variant="contained" onClick={handleChangePin}>
                    Update PIN
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Notifications Tab - with light blue border around each toggle button */}
        <TabPanel value={tabValue} index={1}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Email Notification Preferences
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Choose which events trigger an email notification to you (admin).
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={notifPrefs.emailOnTaskAssigned}
                    onChange={(e) =>
                      setNotifPrefs({ ...notifPrefs, emailOnTaskAssigned: e.target.checked })
                    }
                    sx={{ border: '1px solid lightblue', borderRadius: '24px', p: '2px' }}
                  />
                }
                label="Task Assigned"
              />
              <Divider sx={{ my: 1 }} />
              <FormControlLabel
                control={
                  <Switch
                    checked={notifPrefs.emailOnPriorityChange}
                    onChange={(e) =>
                      setNotifPrefs({ ...notifPrefs, emailOnPriorityChange: e.target.checked })
                    }
                    sx={{ border: '1px solid lightblue', borderRadius: '24px', p: '2px' }}
                  />
                }
                label="Task Priority Changed"
              />
              <Divider sx={{ my: 1 }} />
              <FormControlLabel
                control={
                  <Switch
                    checked={notifPrefs.emailOnUpdateRejected}
                    onChange={(e) =>
                      setNotifPrefs({ ...notifPrefs, emailOnUpdateRejected: e.target.checked })
                    }
                    sx={{ border: '1px solid lightblue', borderRadius: '24px', p: '2px' }}
                  />
                }
                label="Task Update Rejected"
              />
              <Divider sx={{ my: 1 }} />
              <FormControlLabel
                control={
                  <Switch
                    checked={notifPrefs.emailOnTaskOverdue}
                    onChange={(e) =>
                      setNotifPrefs({ ...notifPrefs, emailOnTaskOverdue: e.target.checked })
                    }
                    sx={{ border: '1px solid lightblue', borderRadius: '24px', p: '2px' }}
                  />
                }
                label="Task Overdue Reminder"
              />
              <Box sx={{ mt: 3 }}>
                <Button variant="contained" onClick={handleSaveNotifications}>
                  Save Notification Settings
                </Button>
              </Box>
            </CardContent>
          </Card>
        </TabPanel>

        {/* System Tab – dark mode removed (config doesn't support it) */}
        <TabPanel value={tabValue} index={2}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Application Preferences
              </Typography>
              <Typography variant="subtitle2" gutterBottom>
                Default Project Phase for new projects
              </Typography>
              <TextField
                select
                fullWidth
                value={sysPrefs.defaultProjectPhase}
                onChange={(e) => setSysPrefs({ ...sysPrefs, defaultProjectPhase: e.target.value })}
                SelectProps={{ native: true }}
                sx={{ mt: 1, mb: 2 }}
              >
                {[
                  'Planning',
                  'Design',
                  'UI Development',
                  'Backend Development',
                  'Testing',
                  'Deployment',
                  'Maintenance',
                ].map((phase) => (
                  <option key={phase} value={phase}>
                    {phase}
                  </option>
                ))}
              </TextField>
              <Button variant="contained" onClick={handleSaveSystem}>
                Save System Preferences
              </Button>
            </CardContent>
          </Card>
        </TabPanel>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SettingsPage;
