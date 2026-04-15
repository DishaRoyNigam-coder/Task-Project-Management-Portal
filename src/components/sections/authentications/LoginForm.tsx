import { useEffect, useState } from 'react';
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
import { useAuth } from 'context/AuthContext';
import PasswordTextField from 'components/common/PasswordTextField';

// ← Add this import

interface LoginFormProps {
  defaultCredential?: { email: string; password: string };
}

const LoginForm = ({ defaultCredential }: LoginFormProps) => {
  const navigate = useNavigate();
  const { login, user } = useAuth(); // ← Use real auth context
  const [role, setRole] = useState<'admin' | 'employee'>('employee'); // dev only

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin-dashboard'); // or '/' if you prefer
      } else {
        navigate('/employee/dashboard');
      }
    }
  }, [user, navigate]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // TODO: Replace with real login logic later
    const formData = new FormData(e.currentTarget);
    const email = formData.get('username') as string;

    // Simulate login with selected role (for demo)
    login({
      email: email || defaultCredential?.email || '',
      role: role,
    });
  };

  return (
    <Stack
      direction="column"
      sx={{
        height: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
        pt: { md: 10 },
        pb: 10,
      }}
    >
      <div />

      <Grid
        container
        sx={{
          maxWidth: '35rem',
          rowGap: 4,
          p: { xs: 3, sm: 5 },
          mb: 5,
        }}
      >
        <Grid size={12}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            sx={{
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', sm: 'flex-end' },
            }}
          >
            <Typography variant="h4">Log in</Typography>
          </Stack>
        </Grid>

        <Grid size={12}>
          <Box component="form" noValidate onSubmit={handleSubmit}>
            <Grid container>
              <Grid sx={{ mb: 3 }} size={12}>
                <TextField
                  fullWidth
                  size="large"
                  id="username"
                  name="username"
                  type="text"
                  label="Username / Email"
                  defaultValue={defaultCredential?.email}
                />
              </Grid>

              <Grid sx={{ mb: 2.5 }} size={12}>
                <PasswordTextField
                  fullWidth
                  size="large"
                  id="password"
                  name="password"
                  label="Password"
                  defaultValue={defaultCredential?.password}
                />
              </Grid>

              {/* DEV ONLY: Role selector - Remove in production */}
              <Grid sx={{ mb: 2 }} size={12}>
                <FormControl component="fieldset">
                  <FormLabel component="legend" sx={{ typography: 'body2' }}>
                    Demo role (remove in production)
                  </FormLabel>
                  <RadioGroup
                    row
                    value={role}
                    onChange={(e) => setRole(e.target.value as 'admin' | 'employee')}
                  >
                    <FormControlLabel value="employee" control={<Radio />} label="Employee" />
                    <FormControlLabel value="admin" control={<Radio />} label="Admin" />
                  </RadioGroup>
                </FormControl>
              </Grid>

              <Grid sx={{ mb: 6 }} size={12}>
                <Stack
                  spacing={1}
                  sx={{
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <FormControlLabel
                    control={<Checkbox name="checked" color="primary" size="small" />}
                    label={
                      <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                        Remember this device
                      </Typography>
                    }
                  />
                  <Link href="#!" variant="subtitle2">
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

      <Link href="#!" variant="subtitle2">
        Trouble signing in?
      </Link>
    </Stack>
  );
};

export default LoginForm;
