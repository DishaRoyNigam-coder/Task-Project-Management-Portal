import { useState } from 'react';
import { Box, Button, Stack, TextField, Typography } from '@mui/material';

const EmployeeProfile = () => {
  const [pin, setPin] = useState('');
  const handleSave = () => {
    /* API call to change PIN */
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4">My Profile</Typography>
      <Typography variant="body2" sx={{ mb: 2 }}>
        Only PIN change is allowed.
      </Typography>
      <Stack spacing={2} sx={{ maxWidth: 300 }}>
        <TextField
          label="New PIN"
          type="password"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
        />
        <Button variant="contained" onClick={handleSave}>
          Change PIN
        </Button>
      </Stack>
    </Box>
  );
};
export default EmployeeProfile;
