import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { RocketLaunch } from '@mui/icons-material';
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
      <Toolbar>
        <RocketLaunch sx={{ mr: 2, color: 'primary.main' }} />
        <Typography variant="h6" component={Link} to="/" sx={{ flexGrow: 1, textDecoration: 'none', color: 'white', fontWeight: 'bold' }}>
          OrbitLens
        </Typography>
        
        <Box>
          <Button color="inherit" component={Link} to="/space">Space Traffic</Button>
          <Button color="inherit" component={Link} to="/climate">Earth Sentinel</Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}