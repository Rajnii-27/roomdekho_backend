const axios = require('axios');
require('dotenv').config();

const getCoordinatesFromAddress = async (fullAddress) => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  const encodedAddress = encodeURIComponent(fullAddress);
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`;

  try {
    const response = await axios.get(url);
    const { results } = response.data;

    if (results.length > 0) {
      const { lat, lng } = results[0].geometry.location;
      return [lng, lat]; // [longitude, latitude] format for MongoDB
    } else {
      return null;
    }
  } catch (error) {
    console.error('Geocoding error:', error.message);
    return null;
  }
};

module.exports = getCoordinatesFromAddress;
