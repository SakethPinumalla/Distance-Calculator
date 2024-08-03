const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const path = require('path');

const app = express();

app.use(bodyParser.json());
app.use(express.static('public')); // Serve static files from the 'public' directory

const DISTANCE_MATRIX_API_KEY = 'Q1V7k8r8b34UUdzdeVn7IbCFiLAKVi6rIV2KLWHmFxWhkzX62jCdAXWS7SR17uYX';
const DISTANCE_MATRIX_BASE_URL = 'https://api.distancematrix.ai/maps/api/distancematrix/json';

// Function to get distance and duration between two points
const getDistanceAndDuration = async (start, end) => {
  const response = await fetch(`${DISTANCE_MATRIX_BASE_URL}?origins=${encodeURIComponent(start)}&destinations=${encodeURIComponent(end)}&key=${DISTANCE_MATRIX_API_KEY}`);
  const data = await response.json();
  //console.log('API Response:', data);
  if (data.rows.length > 0 && data.rows[0].elements.length > 0) {
    const distanceMeters = data.rows[0].elements[0].distance.value;
    const distanceKm = (distanceMeters / 1000).toFixed(2);
    const durationSeconds = data.rows[0].elements[0].duration.value;
    const durationMinutes = (durationSeconds / 60).toFixed(2);
    return { distanceKm, durationMinutes };
  } else {
    throw new Error('Distance and duration calculation failed');
  }
};

app.post('/api/get-distances', async (req, res) => {
  const { startLocation, endLocation, hqLocation } = req.body;
  console.log('Received locations: ', { startLocation, endLocation, hqLocation });

  try {
    const startToEnd = await getDistanceAndDuration(startLocation, endLocation);
    const hqToEnd = await getDistanceAndDuration(hqLocation, endLocation);

    res.json({
      startToEnd,
      hqToEnd,
    });
  } catch (error) {
    console.error('Error in API call:', error);
    res.status(500).json({ error: error.message });
  }
});

// Serve the index.html file for any other requests (i.e., support direct access to the site)
app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port http://localhost:${PORT}/`));
