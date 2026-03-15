import { useEffect, useRef } from 'react';
import { Box, Typography, Paper, Grid, Chip, Button } from '@mui/material';
import { Public, Home as HomeIcon } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// MOCK DATA
const mockEvents = [
  { title: "Wildfire - California Region", category: "Wildfires", lat: 36.7782, lng: -119.4179 },
  { title: "Wildfire - Amazon Basin", category: "Wildfires", lat: -3.4653, lng: -62.2159 },
  { title: "Severe Storm - North Atlantic", category: "Severe Storms", lat: 45.0, lng: -40.0 },
  { title: "Iceberg A-76A Breakoff", category: "Sea Ice", lat: -60.0, lng: -55.0 },
  { title: "Volcano Eruption - Mt. Etna", category: "Volcanoes", lat: 37.7510, lng: 14.9934 },
  { title: "Tropical Cyclone - Indian Ocean", category: "Severe Storms", lat: -15.0, lng: 75.0 }
];

const getCustomIcon = (category) => {
  let symbol = '⚠️'; 
  if (category === 'Wildfires') symbol = '🔥';
  if (category === 'Severe Storms') symbol = '🌪️';
  if (category === 'Volcanoes') symbol = '🌋';
  if (category === 'Sea Ice') symbol = '❄️';

  return L.divIcon({
    html: `<div style="font-size: 28px; filter: drop-shadow(2px 4px 6px rgba(0,0,0,0.5));">${symbol}</div>`,
    className: 'custom-icon-wrapper',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15]
  });
};

export default function EcoWatch() {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (mapContainerRef.current && !mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapContainerRef.current).setView([20, 0], 3);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapInstanceRef.current);

      mockEvents.forEach(event => {
        const marker = L.marker([event.lat, event.lng], { icon: getCustomIcon(event.category) })
          .addTo(mapInstanceRef.current);
        
        marker.bindPopup(`
          <div style="font-family: Arial, sans-serif; color: #333;">
            <strong style="font-size: 14px;">${event.title}</strong><br/>
            <span style="color: #d32f2f; font-weight: bold; font-size: 12px;">Alert: ${event.category}</span>
          </div>
        `);
      });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <Box display="flex" flexDirection="column" height="calc(100vh - 64px)">
      
      {/* Enhanced Header */}
      <Paper elevation={4} sx={{ p: 3, borderRadius: 0, bgcolor: 'background.paper', zIndex: 1000 }}>
        <Grid container alignItems="flex-start" justifyContent="space-between">
          <Grid item xs={12} md={8}>
            <Box display="flex" alignItems="center" mb={1}>
              {/* 🟢 NEW: Home Button */}
              <Button 
                component={Link} 
                to="/" 
                color="inherit" 
                sx={{ minWidth: 'auto', p: 1, mr: 2, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.05)' }}
              >
                <HomeIcon />
              </Button>
              <Typography variant="h4" color="success.main" fontWeight="bold" display="flex" alignItems="center">
                <Public sx={{ fontSize: 36, mr: 1 }} /> Earth Sentinel
              </Typography>
            </Box>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 800 }}>
              Monitoring Earth's climate health. This dashboard tracks real-time natural disasters and anomalies detected by Earth-observing satellites.
            </Typography>
          </Grid>
          
          {/* Legend Area */}
          <Grid item xs={12} md={4} display="flex" gap={1} flexWrap="wrap" justifyContent={{ xs: 'flex-start', md: 'flex-end' }} mt={{ xs: 2, md: 0 }}>
            <Chip label="🔥 Wildfires" variant="outlined" />
            <Chip label="🌪️ Storms" variant="outlined" />
            <Chip label="🌋 Volcanoes" variant="outlined" />
            <Chip label="❄️ Sea Ice" variant="outlined" />
          </Grid>
        </Grid>
      </Paper>

      {/* Map Wrapper */}
      <Box sx={{ flexGrow: 1, position: 'relative' }}>
        <div 
          ref={mapContainerRef} 
          style={{ height: '100%', width: '100%', position: 'absolute', top: 0, left: 0 }} 
        />
      </Box>
    </Box>
  );
}