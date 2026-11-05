import { Box, Container, Typography } from '@mui/material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 2,
        background: 'linear-gradient(180deg, transparent 0%, #010a13 100%)',
        borderTop: '1px solid rgba(200, 170, 110, 0.2)',
        position: 'relative',
        zIndex: 10,
      }}
    >
      <Container maxWidth="sm">
        <Typography
          variant="body2"
          align="center"
          sx={{ color: '#5b5a56', letterSpacing: '0.1em' }}
        >
          © {new Date().getFullYear()} VINCI ARENA • All rights reserved
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
