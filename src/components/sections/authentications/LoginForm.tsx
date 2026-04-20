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

interface LoginFormProps {
  defaultCredential?: { username: string; password: string };
}
const LoginForm = ({ defaultCredential }: LoginFormProps) => {
  const navigate = useNavigate();

  const [role, setRole] = useState<'admin' | 'employee'>('admin');
  const accentColor = blue[400];

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    navigate('/');
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

  const textFieldBorderSx = {
    '& .MuiOutlinedInput-root': {
      backgroundColor: '#E6F0FF',
      borderRadius: 2,
      transition: 'background-color 0.2s ease, box-shadow 0.2s ease',
      '& fieldset': {
        borderColor: accentColor,
        borderWidth: '1.5px',
      },
      '&:hover': {
        backgroundColor: '#dce9ff',
        '& fieldset': {
          borderColor: '#1A4CC4',
          borderWidth: '2px',
        },
      },
      '&.Mui-focused': {
        backgroundColor: '#dce9ff',
        boxShadow: `0 0 0 3px ${accentColor}28`,
        '& fieldset': {
          borderColor: accentColor,
          borderWidth: '2px',
        },
      },
    },
    '& .MuiInputLabel-root': {
      color: '#4a6fa5',
      '&.Mui-focused': {
        color: accentColor,
      },
    },
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
              <Grid
                sx={{
                  mb: 3,
                }}
                size={12}
              >
                <TextField
                  fullWidth
                  variant="outlined"
                  size="large"
                  id="text"
                  type="text"
                  label="Username"
                  defaultValue={defaultCredential?.username}
                  sx={textFieldBorderSx}
                />
              </Grid>
              <Grid
                sx={{
                  mb: 2.5,
                }}
                size={12}
              >
                <PasswordTextField
                  variant="outlined"
                  fullWidth
                  size="large"
                  id="password"
                  label="Password"
                  defaultValue={defaultCredential?.password}
                  sx={textFieldBorderSx}
                />
              </Grid>

              {/* Role selector (demo only) */}
              <Grid size={12}>
                <FormControl component="fieldset">
                  <FormLabel>Role</FormLabel>
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
