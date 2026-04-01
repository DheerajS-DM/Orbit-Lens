import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import { Public } from '@mui/icons-material';
import ReportForm from './ReportForm.jsx';

export default function Navbar() {
  return (
    <AppBar position="static" sx={{ bgcolor: '#0a192f', borderBottom: '1px solid #112240' }}>
      <Toolbar>
        <Public sx={{ mr: 2, color: '#00e6ff' }} />
        <Typography 
          variant="h6" 
          component={Link} 
          to="/" 
          sx={{ flexGrow: 1, textDecoration: 'none', color: 'white', fontWeight: 'bold', letterSpacing: 1 }}
        >
          ORBITLENS
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Button component={Link} to="/space" color="inherit">Space Traffic</Button>
          <Button component={Link} to="/climate" color="inherit">Earth Sentinel</Button>
          
          {/* Global Email CSV Generator */}
          <ReportForm isNavbar={true} /> 
        </Box>
      </Toolbar>
    </AppBar>
  );
}