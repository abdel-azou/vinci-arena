import { createTheme } from '@mui/material/styles';

// Vinci Arena - Dark Gaming Theme (LoL inspired)
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#c8aa6e', // Gold
      light: '#f0e6d2',
      dark: '#785a28',
      contrastText: '#010a13',
    },
    secondary: {
      main: '#0ac8b9', // Cyan
      light: '#6dd5c8',
      dark: '#005a82',
    },
    background: {
      default: '#010a13',
      paper: '#0a1428',
    },
    error: {
      main: '#c8124a',
    },
    text: {
      primary: '#f0e6d2',
      secondary: '#a09b8c',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Beaufort for LOL", sans-serif',
    h1: {
      fontWeight: 700,
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
    },
    h2: {
      fontWeight: 700,
      letterSpacing: '0.03em',
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
      letterSpacing: '0.02em',
    },
    button: {
      fontWeight: 600,
      letterSpacing: '0.05em',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          textTransform: 'uppercase',
        },
        contained: {
          background: 'linear-gradient(180deg, #c8aa6e 0%, #785a28 100%)',
          color: '#010a13',
          '&:hover': {
            background: 'linear-gradient(180deg, #f0e6d2 0%, #c8aa6e 100%)',
          },
        },
        outlined: {
          borderColor: '#c8aa6e',
          color: '#c8aa6e',
          '&:hover': {
            borderColor: '#f0e6d2',
            backgroundColor: 'rgba(200, 170, 110, 0.1)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: '#1e3a5f',
            },
            '&:hover fieldset': {
              borderColor: '#c8aa6e',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#0ac8b9',
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: '1px solid #1e3a5f',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(180deg, #0a1428 0%, #010a13 100%)',
          borderBottom: '2px solid #c8aa6e',
        },
      },
    },
  },
});

export default theme;
