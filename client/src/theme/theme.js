import { createTheme } from '@mui/material/styles';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9', // Light Blue
    },
    secondary: {
      main: '#f48fb1', // Pinkish
    },
    success: {
      main: '#66bb6a', // Green for Earth
    },
    background: {
      default: '#050a14', // Deep Space Black
      paper: '#112240',   // Dark Blue for Cards
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h2: { fontWeight: 700 },
    h4: { fontWeight: 600 },
  },
});

export default darkTheme;