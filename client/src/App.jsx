import { ThemeProvider, CssBaseline } from '@mui/material';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import darkTheme from './theme/theme.js'; // Note the .js here

// Add .jsx to the end of your local component imports
import Navbar from './components/Navbar.jsx';
import Home from './pages/Home.jsx';
import SpaceTrack from './pages/SpaceTrack.jsx';
import EcoWatch from './pages/EcoWatch.jsx';

export default function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline /> {/* Normalizes margins and applies the dark background globally */}
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/space" element={<SpaceTrack />} />
          <Route path="/climate" element={<EcoWatch />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}