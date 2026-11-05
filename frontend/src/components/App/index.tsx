import { Outlet } from 'react-router-dom';
import Footer from '../Footer';
import NavBar from '../Navbar';

import Box from '@mui/material/Box';
import { Container, Typography } from '@mui/material';

const App = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        background:
          'radial-gradient(ellipse at top, #0a1428 0%, #010a13 50%, #000 100%)',
        '&::before': {
          content: '""',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23c8aa6e" fill-opacity="0.03"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          pointerEvents: 'none',
          zIndex: 0,
        },
      }}
    >
      {/* Header */}
      <Box
        component="header"
        sx={{
          py: 2,
          px: 3,
          background: 'linear-gradient(180deg, #0a1428 0%, transparent 100%)',
          borderBottom: '1px solid rgba(200, 170, 110, 0.3)',
          position: 'relative',
          zIndex: 10,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              background: 'linear-gradient(180deg, #f0e6d2 0%, #c8aa6e 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 30px rgba(200, 170, 110, 0.5)',
            }}
          >
            ⚔️ Vinci Arena ⚔️
          </Typography>
        </Box>
      </Box>

      <NavBar />

      <Container
        component="main"
        sx={{
          flex: '1',
          py: 4,
          position: 'relative',
          zIndex: 1,
        }}
        maxWidth="lg"
      >
        <Outlet />
      </Container>

      <Footer />
    </Box>
  );
};

export default App;
