import { SyntheticEvent, useState } from 'react';
import { IconButton, InputAdornment, TextField, TextFieldProps } from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';

const PasswordTextField = ({ ref, sx, ...props }: TextFieldProps) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handlePasswordVisibilty = (event: SyntheticEvent) => {
    event.preventDefault();
    setIsPasswordVisible(!isPasswordVisible);
  };

  // Default styles (without background)
  const defaultSx = {
    '& .MuiOutlinedInput-root': {
      '& fieldset': { borderColor: 'divider' },
      '&:hover fieldset': { borderColor: 'primary.main' },
      '&.Mui-focused fieldset': { borderColor: 'primary.main' },
    },
  };

  return (
    <TextField
      type={isPasswordVisible ? 'text' : 'password'}
      ref={ref}
      sx={[defaultSx, ...(Array.isArray(sx) ? sx : [sx])]}
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={handlePasswordVisibilty}>
                {isPasswordVisible ? (
                  <IconifyIcon icon="material-symbols-light:visibility-outline-rounded" />
                ) : (
                  <IconifyIcon icon="material-symbols-light:visibility-off-outline-rounded" />
                )}
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
      {...props}
    />
  );
};

export default PasswordTextField;
