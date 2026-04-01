import { useEffect, useState } from 'react';
import Globe from 'react-globe.gl';
import { Box, Typography, Card, CardContent, Chip, Stack, Button, CircularProgress } from '@mui/material';
import { WarningAmber, Info, Home as HomeIcon, CrisisAlert } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function SpaceTrack() {
  const [satellites, setSatellites] = useState([]);
  const [collisionAlerts, setCollisionAlerts] = useState(0);
  const [decayAlerts, setDecayAlerts] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSatellites = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/satellites');
        const sats = response.data;
        
        const dangerIds = new Set();
        const fallingIds = new Set();

        // 1. Convert to 3D Cartesian Coordinates for accurate distance measurement
        const cartesianSats = sats.map(sat => {
            const latRad = sat.lat * (Math.PI / 180);
            const lngRad = sat.lng * (Math.PI / 180);
            const r = 6371 + sat.alt; // Earth radius (6371km) + altitude

            return {
                ...sat,
                x: r * Math.cos(latRad) * Math.cos(lngRad),
                y: r * Math.cos(latRad) * Math.sin(lngRad),
                z: r * Math.sin(latRad)
            };
        });

        // 2. Strict Criteria Check (O(N^2) comparison)
        for (let i = 0; i < cartesianSats.length; i++) {
            const s1 = cartesianSats[i];

            // Alert A: Falling into Earth (Decay threshold ~150km)
            if (s1.alt < 150) {
                fallingIds.add(s1.id);
            }

            // Alert B: 10km Proximity (Collision Risk)
            for (let j = i + 1; j < cartesianSats.length; j++) {
                const s2 = cartesianSats[j];
                
                // Euclidean distance squared
                const distSq = Math.pow(s1.x - s2.x, 2) + Math.pow(s1.y - s2.y, 2) + Math.pow(s1.z - s2.z, 2);

                if (distSq <= 100) { // 10km squared = 100
                    dangerIds.add(s1.id);
                    dangerIds.add(s2.id);
                }
            }
        }

        // 3. Format data for the Globe rendering
        const formattedData = cartesianSats.map(sat => {
          let type = 'standard';
          let warningMsg = '';

          // Prioritize decay warning over collision warning in the tooltip
          if (fallingIds.has(sat.id)) {
              type = 'decay';
              warningMsg = '<span style="color: #ff3333; font-weight: bold;">⚠️ CRITICAL: Orbital Decay (<150km)</span><br/><hr style="border: 0.5px solid #333; margin: 6px 0;"/>';
          } else if (dangerIds.has(sat.id)) {
              type = 'collision';
              warningMsg = '<span style="color: #ff9900; font-weight: bold;">⚠️ WARNING: Collision Risk (<10km)</span><br/><hr style="border: 0.5px solid #333; margin: 6px 0;"/>';
          }

          return { ...sat, type, warningMsg };
        });

        setSatellites(formattedData);
        setCollisionAlerts(dangerIds.size);
        setDecayAlerts(fallingIds.size);

      } catch (error) {
        console.error("Failed to fetch satellite data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSatellites();
  }, []);

  // Helper to color code the globe objects
  const getObjectColor = (type) => {
      if (type === 'decay') return '#ff3333';       // Red for falling
      if (type === 'collision') return '#ff9900';   // Orange for collisions
      return '#00e6ff';                             // Cyan for safe
  };

  return (
    <Box position="relative" height="calc(100vh - 64px)" width="100vw" overflow="hidden">
      
      {/* Heads Up Display */}
      <Card sx={{ position: 'absolute', top: 20, left: 20, zIndex: 10, width: 350, bgcolor: 'rgba(17, 34, 64, 0.85)', backdropFilter: 'blur(10px)' }}>
        <CardContent>
          <Button component={Link} to="/" startIcon={<HomeIcon />} variant="outlined" size="small" sx={{ mb: 2, color: 'white', borderColor: 'rgba(255,255,255,0.3)', textTransform: 'none' }}>
            Back to Dashboard
          </Button>

          <Typography variant="h5" color="primary.main" fontWeight="bold" gutterBottom>
            Orbital Traffic Control
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Live tracking of active satellites and space debris. Scanning for orbital decay and &lt;10km proximity threats.
          </Typography>

          <Stack spacing={1}>
            <Chip icon={<Info />} label={`Tracking ${satellites.length} Objects`} color="primary" variant="outlined" />
            
            {/* Split the warnings into two distinct categories */}
            {collisionAlerts > 0 && (
              <Chip icon={<WarningAmber />} label={`${collisionAlerts} Objects in Proximity (<10km)`} sx={{ bgcolor: '#ff9900', color: '#000', fontWeight: 'bold' }} />
            )}
            {decayAlerts > 0 && (
              <Chip icon={<CrisisAlert />} label={`${decayAlerts} Decaying Orbits (<150km)`} color="error" />
            )}
            {(collisionAlerts === 0 && decayAlerts === 0 && !loading) && (
               <Chip label="Spacecraft Trajectories Clear" color="success" variant="outlined" />
            )}
          </Stack>
        </CardContent>
      </Card>

      {loading && (
        <Box position="absolute" top="50%" left="50%" sx={{ transform: 'translate(-50%, -50%)', zIndex: 10 }}>
            <CircularProgress color="primary" />
        </Box>
      )}

      <Globe
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        objectsData={satellites}
        objectLat="lat"
        objectLng="lng"
        objectAltitude={d => d.alt / 1000} 
        objectColor={d => getObjectColor(d.type)}
        objectSize={d => d.type === 'standard' ? 0.03 : 0.08}
        
        // Dynamic Hover Tooltip
        objectLabel={d => `
          <div style="background: rgba(17, 34, 64, 0.9); padding: 10px; border-radius: 6px; border: 1px solid ${getObjectColor(d.type)}; color: white; font-family: sans-serif; min-width: 150px;">
            ${d.warningMsg}
            <b style="font-size: 14px; color: #00e6ff;">${d.name}</b><br/>
            Lat: ${d.lat.toFixed(2)}°<br/>
            Lng: ${d.lng.toFixed(2)}°<br/>
            Alt: ${Math.round(d.alt)} km
          </div>
        `}

        // Render the ⚠️ icon only over the genuinely dangerous objects
        htmlElementsData={satellites.filter(s => s.type !== 'standard')}
        htmlElement={() => {
          const el = document.createElement('div');
          el.innerHTML = '⚠️';
          el.style.fontSize = '16px';
          el.style.pointerEvents = 'none';
          return el;
        }}
        htmlLat="lat"
        htmlLng="lng"
        htmlAltitude={d => d.alt / 1000}
      />
    </Box>
  );
}