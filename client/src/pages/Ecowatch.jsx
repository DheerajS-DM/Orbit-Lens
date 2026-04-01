import { useEffect, useRef, useState } from 'react';
import { Box, Typography, Paper, Grid, Chip, Button, CircularProgress } from '@mui/material';
import { Public, Home as HomeIcon } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import axios from 'axios';
import ReportForm from '../components/ReportForm.jsx';
import 'leaflet/dist/leaflet.css';

// Performance-friendly color mapping
const getColor = (category) => {
  if (category.includes('Wildfires')) return '#ff3333'; // Red
  if (category.includes('Storms')) return '#33ccff';    // Blue
  if (category.includes('Volcanoes')) return '#ff9900'; // Orange
  if (category.includes('Ice')) return '#ffffff';       // White
  return '#cc33ff'; // Purple for others
};

export default function EcoWatch() {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch full live NASA dataset
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/climate-events');
        setEvents(response.data);
      } catch (error) {
        console.error("Failed to fetch climate events", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // Initialize Map & Render Data
  useEffect(() => {
    // 1. Initialize Map exactly once
    if (mapContainerRef.current && !mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapContainerRef.current, {
        preferCanvas: true // Crucial for rendering hundreds of data points without lag
      }).setView([20, 0], 3);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(mapInstanceRef.current);
    }

    // 2. Plot the data whenever 'events' state changes
    if (mapInstanceRef.current && events.length > 0) {
      
      // Clear out old circles before drawing new ones (prevents ghost duplicates)
      mapInstanceRef.current.eachLayer((layer) => {
        if (layer instanceof L.Circle) {
          mapInstanceRef.current.removeLayer(layer);
        }
      });

      // 3. Draw scalable circles (Radius in meters)
      events.forEach(event => {
        L.circle([event.lat, event.lng], {
          radius: 5000, // 1km radius - scales perfectly when zooming!
          fillColor: getColor(event.category),
          color: '#ac2525',
          weight: 1,
          opacity: 1,
          fillOpacity: 0.6
        })
        .addTo(mapInstanceRef.current)
        .bindPopup(`
          <div style="font-family: Arial, sans-serif; color: #333;">
            <strong style="font-size: 14px;">${event.title}</strong><br/>
            <span style="color: #d32f2f; font-weight: bold; font-size: 12px;">Alert: ${event.category}</span><br/>
            <span style="font-size: 11px; color: #666;">Lat: ${event.lat.toFixed(2)}, Lng: ${event.lng.toFixed(2)}</span>
          </div>
        `);
      });
    }

    // Note: We deliberately do NOT destroy the map instance on component unmount
    // here to prevent React StrictMode from crashing the Leaflet DOM node.
  }, [events]);

  return (
    <Box display="flex" flexDirection="column" height="calc(100vh - 64px)">
      
      {/* HUD Header */}
      <Paper elevation={4} sx={{ p: 3, borderRadius: 0, bgcolor: 'background.paper', zIndex: 1000 }}>
        <Grid container alignItems="flex-start" justifyContent="space-between">
          <Grid item xs={12} md={8}>
            <Box display="flex" alignItems="center" mb={1}>
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
              Monitoring Earth's climate health. Tracking real-time natural disasters and anomalies detected by NASA Earth-observing satellites.
            </Typography>
          </Grid>
          
          {/* Legend area matching the new Canvas colors */}
          <Grid item xs={12} md={4} display="flex" gap={1} flexWrap="wrap" justifyContent={{ xs: 'flex-start', md: 'flex-end' }} mt={{ xs: 2, md: 0 }}>
            <Chip label="🔴 Wildfires" variant="outlined" />
            <Chip label="🔵 Storms" variant="outlined" />
            <Chip label="🟠 Volcanoes" variant="outlined" />
            <Chip label="⚪ Sea Ice" variant="outlined" />
          </Grid>
        </Grid>
      </Paper>

      {/* Map Container */}
      <Box sx={{ flexGrow: 1, position: 'relative' }}>
        
        {/* Loading Spinner */}
        {loading && (
            <Box position="absolute" top="50%" left="50%" sx={{ transform: 'translate(-50%, -50%)', zIndex: 2000 }}>
                <CircularProgress color="success" />
            </Box>
        )}
        
        {/* Actual Leaflet DOM Node */}
        <div 
            ref={mapContainerRef} 
            style={{ height: '100%', width: '100%', position: 'absolute', top: 0, left: 0 }} 
        />
        
        {/* Integrated Report Form in the bottom right corner */}
        <Box sx={{ position: 'absolute', bottom: 30, right: 30, zIndex: 1000 }}>
            <ReportForm />
        </Box>
        
      </Box>
    </Box>
  );
}