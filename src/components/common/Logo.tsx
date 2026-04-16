import { Box } from '@mui/material';

const Logo = () => {
  return (
    <Box
      component="img"
      src="/kaivalya-logo.jpeg"
      alt="Kaivalya"
      sx={{
        height: 150,
        width: 'auto',
        objectFit: 'contain',
        maxWidth: '250px',
      }}
    />
  );
};

export default Logo;
