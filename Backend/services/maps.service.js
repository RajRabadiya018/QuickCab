require('dotenv').config();  // Load environment variables

const axios = require('axios');
const captainModel = require('../models/captain.model');

module.exports.getAddressCoordinate = async (address) => {
    const apiKey = process.env.GOOGLE_MAPS_API;
    console.log('Google Maps API Key:', apiKey); // Debugging

    if (!apiKey) {
        throw new Error('Google Maps API key is missing.');
    }

    const url = `https://maps.gomaps.pro/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;

    try {
        const response = await axios.get(url);
        console.log('Geocode API Response:', response.data); // Debugging

        if (response.data.status === 'OK') {
            const location = response.data.results[0].geometry.location;
            return {
                ltd: location.lat,
                lng: location.lng
            };
        } else {
            throw new Error(`Geocode API Error: ${response.data.status}`);
        }
    } catch (error) {
        console.error('Geocode API Request Failed:', error);
        throw error;
    }
};

module.exports.getDistanceTime = async (origin, destination) => {
    if (!origin || !destination) {
        throw new Error('Origin and destination are required.');
    }

    const apiKey = process.env.GOOGLE_MAPS_API;
    console.log('Google Maps API Key:', apiKey); // Debugging

    if (!apiKey) {
        throw new Error('Google Maps API key is missing.');
    }

    const url = `https://maps.gomaps.pro/maps/api/distancematrix/json?origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(destination)}&key=${apiKey}`;

    try {
        const response = await axios.get(url);
        console.log('Distance Matrix API Response:', response.data); // Debugging

        if (response.data.status === 'OK') {
            const element = response.data.rows[0].elements[0];
            if (element.status === 'ZERO_RESULTS') {
                throw new Error('No routes found.');
            }
            return element;
        } else {
            throw new Error(`Distance Matrix API Error: ${response.data.status}`);
        }
    } catch (error) {
        console.error('Distance Matrix API Request Failed:', error);
        throw error;
    }
};

module.exports.getAutoCompleteSuggestions = async (input) => {
    if (!input) {
        throw new Error('Query is required.');
    }

    const apiKey = process.env.GOOGLE_MAPS_API;
    console.log('Google Maps API Key:', apiKey); // Debugging

    if (!apiKey) {
        throw new Error('Google Maps API key is missing.');
    }

    const url = `https://maps.gomaps.pro/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${apiKey}`;

    try {
        const response = await axios.get(url);
        console.log('Places API Response:', response.data); // Debugging

        if (response.data.status === 'OK') {
            return response.data.predictions.map(prediction => prediction.description).filter(value => value);
        } else {
            throw new Error(`Places API Error: ${response.data.status}`);
        }
    } catch (error) {
        console.error('Places API Request Failed:', error);
        throw error;
    }
};

module.exports.getCaptainsInTheRadius = async (ltd, lng, radius) => {
    if (!ltd || !lng || !radius) {
        throw new Error('Latitude, longitude, and radius are required.');
    }

    console.log(`Finding captains within ${radius} km of (${ltd}, ${lng})`);

    try {
        const captains = await captainModel.find({
            location: {
                $geoWithin: {
                    $centerSphere: [[lng, ltd], radius / 6371] // Ensure correct order (lng, lat)
                }
            }
        });

        return captains;
    } catch (error) {
        console.error('MongoDB Query Failed:', error);
        throw error;
    }
};
