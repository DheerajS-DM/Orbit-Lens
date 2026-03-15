const satellite = require('satellite.js');

/**
 * Converts Two-Line Element (TLE) data into Latitude, Longitude, and Altitude.
 */
function getSatellitePosition(tleLine1, tleLine2) {
    // Initialize the satellite record
    const satrec = satellite.twoline2satrec(tleLine1, tleLine2);
    
    // Propagate the orbit to the current time
    const positionAndVelocity = satellite.propagate(satrec, new Date());
    
    // If the satellite is essentially dead/untrackable, skip it
    if (!positionAndVelocity.position) return null;

    // Convert to geographic coordinates
    const gmst = satellite.gstime(new Date());
    const positionGd = satellite.eciToGeodetic(positionAndVelocity.position, gmst);

    // Format for the React frontend (Globe.gl)
    return {
        lat: satellite.degreesLat(positionGd.latitude),
        lng: satellite.degreesLong(positionGd.longitude),
        alt: positionGd.height / 6371 // Normalize altitude relative to Earth's radius for the 3D globe
    };
}

module.exports = { getSatellitePosition };