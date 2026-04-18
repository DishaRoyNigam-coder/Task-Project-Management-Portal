import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormLabel,
  Link,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import PasswordTextField from 'components/common/PasswordTextField';
import { blue } from '../../../theme/palette/colors';

const LoginForm = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<'admin' | 'employee'>('employee');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    navigate(role === 'admin' ? '/admin/dashboard' : '/employee/dashboard');
  };

  // ----- CUSTOM STYLES (adjust colors here) -----
  const inputBackground = blue[50]; // light blue background for fields
  const inputBorder = '#e0e0e0'; // subtle border
  const focusBorder = '#1e88e5'; // blue border on focus
  const accentColor = '#1e88e5'; // color for checked checkbox/radio
  const formBgColor = '#fafafa'; // light background for the form container

  const textFieldSx = {
    // Remove any background from the root (so it doesn't interfere)
    '& .MuiOutlinedInput-root': {
      backgroundColor: 'transparent',
      '& fieldset': { borderColor: inputBorder, transition: 'border-color 0.2s' },
      '&:hover fieldset': { borderColor: '#bdbdbd' },
      '&.Mui-focused fieldset': { borderColor: focusBorder, borderWidth: 2 },
    },
    // Apply the light blue background directly to the input element
    '& .MuiInputBase-input': {
      backgroundColor: `${inputBackground} !important`,
      // Optional: add some padding if needed
      padding: '12px 14px',
    },
    // Make sure the label stays readable
    '& .MuiInputLabel-root': { color: '#666' },
    '& .MuiInputLabel-root.Mui-focused': { color: accentColor },
  };

  // 👇 UPDATED controlSx for blue borders
  const controlSx = {
    '&.Mui-checked': {
      color: accentColor,
    },
    '& .MuiSvgIcon-root': {
      color: accentColor,
    },
    '&:hover .MuiSvgIcon-root': {
      color: accentColor,
      opacity: 0.8,
    },
  };
  // ---------------------------------------------

  return (
    <Stack
      direction="column"
      sx={{
        height: 1,
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
      }}
    >
      <Grid
        container
        sx={{
          maxWidth: '35rem',
          rowGap: 4,
          p: { xs: 3, sm: 5 },
          borderRadius: 4,
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
          bgcolor: formBgColor,
        }}
      >
        <Grid size={12}>
          <Typography variant="h4" fontWeight={500}>
            Log in
          </Typography>
        </Grid>

        <Grid size={12}>
          <Box component="form" noValidate onSubmit={handleSubmit}>
            <Grid container spacing={2.5}>
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  defaultValue="demo@aurora.com"
                  sx={textFieldSx}
                />
              </Grid>
              <Grid size={12}>
                <PasswordTextField
                  fullWidth
                  label="Password"
                  defaultValue="password123"
                  sx={textFieldSx}
                />
              </Grid>

              {/* Role selector (demo only) */}
              <Grid size={12}>
                <FormControl component="fieldset">
                  <FormLabel>Demo role</FormLabel>
                  <RadioGroup row value={role} onChange={(e) => setRole(e.target.value as any)}>
                    <FormControlLabel
                      value="employee"
                      control={<Radio sx={controlSx} />}
                      label="Employee"
                    />
                    <FormControlLabel
                      value="admin"
                      control={<Radio sx={controlSx} />}
                      label="Admin"
                    />
                  </RadioGroup>
                </FormControl>
              </Grid>

              <Grid size={12}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <FormControlLabel
                    control={<Checkbox sx={controlSx} />}
                    label="Remember this device"
                  />
                  <Link href="#" underline="hover">
                    Forgot Password?
                  </Link>
                </Stack>
              </Grid>

              <Grid size={12}>
                <Button fullWidth type="submit" size="large" variant="contained">
                  Log in
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Grid>
      </Grid>
    </Stack>
  );
};

export default LoginForm;
