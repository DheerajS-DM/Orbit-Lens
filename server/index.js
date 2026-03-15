require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { getSatellitePosition } = require('./utils/orbitMath');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
// Crucial: Allow requests from your Vite frontend
app.use(cors({ origin: 'http://localhost:5173' }));

// ==========================================
// ROUTE 1: Space Debris & Satellite Tracker
// ==========================================
app.get('/api/satellites', async (req, res) => {
    try {
        // Fetch active satellites from CelesTrak GP API
        const response = await axios.get('https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=json');
        
        // We slice the data to the first 800 objects to prevent frontend lag during development
        const processedSatellites = response.data.slice(0, 800).map(sat => {
            const coords = getSatellitePosition(sat.TLE_LINE1, sat.TLE_LINE2);
            if (!coords) return null;

            return {
                name: sat.OBJECT_NAME,
                id: sat.NORAD_CAT_ID,
                lat: coords.lat,
                lng: coords.lng,
                alt: coords.alt
            };
        }).filter(Boolean); // Filter out any null values

        res.json(processedSatellites);
    } catch (error) {
        console.error("CelesTrak API Error:", error.message);
        res.status(500).json({ error: "Failed to fetch satellite telemetry" });
    }
});

// ==========================================
// ROUTE 2: NASA Earth Sentinel (Climate Events)
// ==========================================
/*app.get('/api/climate-events', async (req, res) => {
    try {
        // Fetch open natural events from NASA EONET v3
        const response = await axios.get('https://eonet.gsfc.nasa.gov/api/v3/events?status=open');
        
        // Map NASA's complex JSON into a flat structure for our Leaflet map
        const events = response.data.events.map(event => {
            const geo = event.geometry[0]; // Get the most recent location data for the event
            return {
                title: event.title,
                category: event.categories[0].title,
                lat: geo.coordinates[1], // Note: GeoJSON puts Longitude first [lng, lat]
                lng: geo.coordinates[0],
                date: geo.date
            };
        });

        res.json(events);
    } catch (error) {
        console.error("NASA API Error:", error.message);
        res.status(500).json({ error: "Failed to fetch Earth climate data" });
    }
});
*/
// ==========================================
// ROUTE 2: NASA Earth Sentinel (MOCK DATA)
// ==========================================
app.get('/api/climate-events', (req, res) => {
    try {
        // Mock data to unblock frontend UI development
        const mockEvents = [
            {
                title: "Wildfire - California Region",
                category: "Wildfires",
                lat: 36.7782,
                lng: -119.4179,
                date: new Date().toISOString()
            },
            {
                title: "Severe Storm - North Atlantic",
                category: "Severe Storms",
                lat: 45.0,
                lng: -40.0,
                date: new Date().toISOString()
            },
            {
                title: "Iceberg A-76A",
                category: "Sea and Lake Ice",
                lat: -60.0,
                lng: -55.0,
                date: new Date().toISOString()
            },
            {
                title: "Volcano Eruption - Mt. Etna",
                category: "Volcanoes",
                lat: 37.7510,
                lng: 14.9934,
                date: new Date().toISOString()
            },
            {
                title: "Tropical Cyclone - Indian Ocean",
                category: "Severe Storms",
                lat: -15.0,
                lng: 75.0,
                date: new Date().toISOString()
            }
        ];

        // Simulate a slight network delay so you can see your loading spinner
        setTimeout(() => {
            res.json(mockEvents);
        }, 800);

    } catch (error) {
        console.error("Mock Data Error:", error);
        res.status(500).json({ error: "Failed to fetch mock climate data" });
    }
});
// Start the Server
app.listen(PORT, () => {
    console.log(`🚀 OrbitLens Backend active on http://localhost:${PORT}`);
});