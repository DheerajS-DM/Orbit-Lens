const satellite = require('satellite.js');

function getSatellitePosition(tleLine1, tleLine2) {
    try {
        // 1. Ensure TLE lines exist and are actually strings
        if (!tleLine1 || !tleLine2 || typeof tleLine1 !== 'string' || typeof tleLine2 !== 'string') {
            return null;
        }

        const line1 = tleLine1.trim();
        const line2 = tleLine2.trim();

        // 2. Parse the satellite record
        const satrec = satellite.twoline2satrec(line1, line2);

        // 3. Ensure the parser actually created a valid record
        if (!satrec || !satrec.satnum) {
            return null;
        }

        // 4. Calculate the position for the current time
        const positionAndVelocity = satellite.propagate(satrec, new Date());

        // 5. THE FIX: Catch the exact error you are seeing
        // If the library returns null or lacks a position, skip this satellite
        if (!positionAndVelocity || !positionAndVelocity.position) {
            return null; 
        }

        const positionEci = positionAndVelocity.position;
        const gmst = satellite.gstime(new Date());
        const positionGd = satellite.eciToGeodetic(positionEci, gmst);

        // 6. Ensure final coordinates are valid numbers before sending to frontend
        if (isNaN(positionGd.latitude) || isNaN(positionGd.longitude) || isNaN(positionGd.height)) {
            return null;
        }

        return {
            lat: satellite.degreesLat(positionGd.latitude),
            lng: satellite.degreesLong(positionGd.longitude),
            alt: positionGd.height
        };
    } catch (error) {
        // If anything else goes wrong, silently drop the broken satellite
        return null;
    }
}

module.exports = { getSatellitePosition };