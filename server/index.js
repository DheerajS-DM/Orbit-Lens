require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const { Parser } = require('json2csv');
const { getSatellitePosition } = require('./utils/orbitMath');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors({ origin: 'http://localhost:5173' }));

// 1. MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err.message));

const ClimateEventSchema = new mongoose.Schema({
    title: String,
    category: String,
    lat: Number,
    lng: Number,
    date: { type: Date, default: Date.now }
});
const ClimateEvent = mongoose.model('ClimateEvent', ClimateEventSchema);

// 2. Email System Verification
const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

transporter.verify((error, success) => {
    if (error) {
        console.log("❌ Email System Error:", error.message);
    } else {
        console.log("✅ Email System Ready");
    }
});

// ==========================================
// ROUTE 1: Space Debris (SatNOGS Open API)
// ==========================================
app.get('/api/satellites', async (req, res) => {
    try {
        // Drop-in replacement: SatNOGS API (No 403 blocks, no API keys)
        const response = await axios.get('https://db.satnogs.org/api/tle/', {
            timeout: 10000
        });

        console.log(`📡 Fetched ${response.data.length} raw sats from SatNOGS`);

        const processed = response.data.slice(0, 800).map(sat => {
            // SatNOGS keys are tle0, tle1, tle2
            const coords = getSatellitePosition(sat.tle1, sat.tle2);
            
            // The name (tle0) usually has a leading "0 ", so we clean it up
            const cleanName = sat.tle0 ? sat.tle0.replace(/^0\s/, '').trim() : "Unknown Sat";

            return coords ? { 
                name: cleanName, 
                // We use a random ID fallback just in case SatNOGS doesn't provide the NORAD ID directly
                id: sat.norad_cat_id || Math.random().toString(36).substr(2, 9), 
                ...coords 
            } : null;
        }).filter(Boolean);
        
        console.log(`✅ Successfully mapped ${processed.length} satellites to coordinates`);
        res.json(processed);
    } catch (error) {
        console.error(`Debris API Error: ${error.response ? error.response.status : error.message}`);
        res.status(500).json([]); 
    }
});

// ==========================================
// ROUTE 2: NASA EONET (Full Dataset Restored)
// ==========================================
app.get('/api/climate-events', async (req, res) => {
    try {
        // LIMIT REMOVED: Pulling the entire open event database
        const response = await axios.get('https://eonet.gsfc.nasa.gov/api/v3/events?status=open'); 
        
        const events = response.data.events.map(event => ({
            title: event.title,
            category: event.categories[0].title,
            lat: event.geometry[0].coordinates[1],
            lng: event.geometry[0].coordinates[0],
            date: event.geometry[0].date
        }));

        await ClimateEvent.deleteMany({});
        await ClimateEvent.insertMany(events);
        res.json(events);
    } catch (error) {
        console.error("NASA API Error:", error.message);
        res.status(500).json({ error: "NASA data fetch failed" });
    }
});

// ROUTE 3: Email Report
app.post('/api/send-report', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    try {
        const data = await ClimateEvent.find().lean();
        if (data.length === 0) return res.status(404).json({ error: "No data to export" });

        const json2csvParser = new Parser({ fields: ['title', 'category', 'lat', 'lng', 'date'] });
        const csv = json2csvParser.parse(data);

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'OrbitLens: Climate Event Report',
            text: 'Please find the attached CSV report containing the latest NASA EONET climate event data.',
            attachments: [{ 
                filename: `Climate_Report_${new Date().toLocaleDateString().replace(/\//g, '-')}.csv`, 
                content: csv 
            }]
        };

        await transporter.sendMail(mailOptions);
        res.json({ message: "Report sent successfully to " + email });

    } catch (error) {
        console.error("Export Error:", error.message);
        res.status(500).json({ error: "Failed to generate or send report" });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 OrbitLens Backend active on http://localhost:${PORT}`);
});