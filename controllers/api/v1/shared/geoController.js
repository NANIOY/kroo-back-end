const axios = require('axios');
const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 86400 });

const OPENCAGE_API_KEY = process.env.OPENCAGE_API_KEY;

const getCoordinates = async (req, res, next) => {
    const { city, country } = req.query;

    if (!city || !country) {
        return res.status(400).json({ message: 'City and country are required' });
    }

    const cacheKey = `${city}-${country}`;
    const cachedCoords = cache.get(cacheKey);

    if (cachedCoords) {
        console.log('Returning cached coordinates');
        return res.status(200).json(cachedCoords);
    }

    const apiUrl = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(city)},${encodeURIComponent(country)}&key=${OPENCAGE_API_KEY}`;

    try {
        console.time('Geocoding API Request');
        const response = await axios.get(apiUrl);
        console.timeEnd('Geocoding API Request');

        if (response.data.results.length > 0) {
            const { lat, lng } = response.data.results[0].geometry;
            const coordinates = { lat, lon: lng };
            cache.set(cacheKey, coordinates);
            return res.status(200).json(coordinates);
        } else {
            return res.status(404).json({ message: 'Location not found' });
        }
    } catch (error) {
        console.error('Error fetching coordinates:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    getCoordinates
};
