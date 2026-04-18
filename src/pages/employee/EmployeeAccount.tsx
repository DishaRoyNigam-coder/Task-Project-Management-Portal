import { SyntheticEvent, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { useAuth } from 'context/AuthContext';
import EmployeeNotifications from './EmployeeNotifications';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const EmployeeAccount = () => {
  const { user, login } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleTabChange = (_event: SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleProfileUpdate = () => {
    if (!name.trim() || !email.trim()) {
      setErrorMsg('Name and email are required');
      return;
    }
    // Update user in context and localStorage
    const updatedUser = { ...user!, name, email };
    login(updatedUser);
    setSuccessMsg('Profile updated successfully');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handlePinChange = () => {
    if (pin !== confirmPin) {
      setErrorMsg('PINs do not match');
      return;
    }
    if (pin.length < 4) {
      setErrorMsg('PIN must be at least 4 digits');
      return;
    }
    // In a real app, send to API. For demo, store in localStorage or context.
    localStorage.setItem('user_pin', pin);
    setSuccessMsg('PIN changed successfully');
    setPin('');
    setConfirmPin('');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 900, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Account Settings
      </Typography>
      <Card>
        <CardContent>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="Profile" />
            <Tab label="Notifications" />
          </Tabs>

          {/* Profile Tab */}
          <TabPanel value={tabValue} index={0}>
            <Stack spacing={3} sx={{ maxWidth: 500 }}>
              {successMsg && <Alert severity="success">{successMsg}</Alert>}
              {errorMsg && <Alert severity="error">{errorMsg}</Alert>}
              <TextField
                label="Full Name"
                fullWidth
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <TextField
                label="Email"
                fullWidth
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button variant="contained" onClick={handleProfileUpdate}>
                Save Profile
              </Button>

              <Typography variant="h6" sx={{ mt: 2 }}>
                Change PIN
              </Typography>
              <TextField
                label="New PIN"
                type="password"
                fullWidth
                value={pin}
                onChange={(e) => setPin(e.target.value)}
              />
              <TextField
                label="Confirm PIN"
                type="password"
                fullWidth
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value)}
              />
              <Button variant="outlined" onClick={handlePinChange}>
                Update PIN
              </Button>
            </Stack>
          </TabPanel>

          {/* Notifications Tab */}
          <TabPanel value={tabValue} index={1}>
            <EmployeeNotifications />
          </TabPanel>
        </CardContent>
      </Card>
    </Box>
  );
};

export default EmployeeAccount;
