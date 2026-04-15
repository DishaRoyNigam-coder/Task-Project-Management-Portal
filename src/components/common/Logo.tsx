import { Box, Typography } from '@mui/material';

interface LogoProps {
  showName?: boolean;
}

const Logo = ({ showName = true }: LogoProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        textDecoration: 'none',
        color: 'inherit',
      }}
    >
      <Box
        component="img"
        src="/kaivalya-logo.jpeg" // ←←← Changed to .jpeg
        alt="Kaivalya"
        sx={{
          height: 32,
          width: 'auto',
          objectFit: 'contain',
          maxWidth: '140px',
        }}
      />

      {showName && (
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            letterSpacing: '-0.02em',
            display: { xs: 'none', md: 'block' },
          }}
        >
          Kaivalya
        </Typography>
      )}
    </Box>
  );
};

export default Logo;
