import { useEffect, useState } from 'react';
import Globe from 'react-globe.gl';
import { Box, Typography, Card, CardContent, Chip, Stack, Button } from '@mui/material';
import { WarningAmber, Info, Home as HomeIcon } from '@mui/icons-material';
import { Link } from 'react-router-dom';

export default function SpaceTrack() {
  const [satellites, setSatellites] = useState([]);
  const [highRiskObjects, setHighRiskObjects] = useState([]);

  useEffect(() => {
    // 1. STANDARD DEBRIS
    const standardDebris = Array.from({ length: 300 }, (_, i) => ({
      name: `Debris-${i}`,
      lat: (Math.random() - 0.5) * 180,
      lng: (Math.random() - 0.5) * 360,
      alt: Math.random() * 0.4 + 0.1,
      type: 'standard'
    }));

    // 2. HIGH RISK DEBRIS
    const highRisk = Array.from({ length: 5 }, (_, i) => ({
      name: `CRITICAL-THREAT-${i}`,
      lat: (Math.random() - 0.5) * 180,
      lng: (Math.random() - 0.5) * 360,
      alt: Math.random() * 0.2 + 0.1,
      type: 'danger'
    }));
    
    setSatellites([...standardDebris, ...highRisk]);
    setHighRiskObjects(highRisk);
  }, []);

  return (
    <Box position="relative" height="calc(100vh - 64px)" width="100vw" overflow="hidden">
      
      {/* HUD Control Panel */}
      <Card 
        sx={{ 
          position: 'absolute', top: 20, left: 20, zIndex: 10, 
          width: 350, bgcolor: 'rgba(17, 34, 64, 0.85)', backdropFilter: 'blur(10px)' 
        }}
      >
        <CardContent>
          {/* 🟢 NEW: Home Button */}
          <Button 
            component={Link} 
            to="/" 
            startIcon={<HomeIcon />} 
            variant="outlined" 
            size="small" 
            sx={{ mb: 2, color: 'white', borderColor: 'rgba(255,255,255,0.3)', textTransform: 'none' }}
          >
            Back to Dashboard
          </Button>

          <Typography variant="h5" color="primary.main" fontWeight="bold" gutterBottom>
            Orbital Traffic Control
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Predictive tracking of space debris to prevent the Kessler Syndrome. This module calculates proximity alerts between active satellites and dead debris.
          </Typography>

          <Stack spacing={1}>
            <Chip icon={<Info />} label={`Tracking ${satellites.length} Objects`} color="primary" variant="outlined" />
            <Chip icon={<WarningAmber />} label={`${highRiskObjects.length} Collision Warnings`} color="error" />
          </Stack>
        </CardContent>
      </Card>

      {/* 3D WebGL Globe */}
      <Globe
        globeImageUrl="earth-day  .jpg"
        backgroundImageUrl="night-sky.png"
        objectsData={satellites}
        objectLat="lat"
        objectLng="lng"
        objectAltitude="alt"
        objectColor={d => d.type === 'danger' ? '#ffffff' : '#000000'}
        objectSize={d => d.type === 'danger' ? 0.1 : 0.03}
        htmlElementsData={highRiskObjects}
        htmlElement={() => {
          const el = document.createElement('div');
          el.innerHTML = '⚠️';
          el.style.fontSize = '20px';
          el.style.pointerEvents = 'none';
          return el;
        }}
        htmlLat="lat"
        htmlLng="lng"
        htmlAltitude="alt"
      />
    </Box>
  );
}