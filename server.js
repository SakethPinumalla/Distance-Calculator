const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const path = require('path');

const app = express();

app.use(bodyParser.json());
app.use(express.static('public')); // Serve static files from the 'public' directory

const DISTANCE_MATRIX_API_KEY = 'zZhrStc7qYGKbgKFnJZnZYKsLLX9Y93XdiogdkMtZqxJfLoNVeCfpXmbIrIjVt2e';
const DISTANCE_MATRIX_BASE_URL = 'https://api.distancematrix.ai/maps/api/distancematrix/json';

// Function to get distance between two points
const getDistance = async (start, end) => {
  const response = await fetch(`${DISTANCE_MATRIX_BASE_URL}?origins=${encodeURIComponent(start)}&destinations=${encodeURIComponent(end)}&key=${DISTANCE_MATRIX_API_KEY}`);
  const data = await response.json();
  
  if (data.rows.length > 0 && data.rows[0].elements.length > 0) {
    const distanceMeters = data.rows[0].elements[0].distance.value;
    const distanceKm = (distanceMeters / 1000).toFixed(2);
    return distanceKm;
  } else {
    throw new Error('Distance calculation failed');
  }
};

app.post('/api/get-distances', async (req, res) => {
  const { startLocation, endLocation, hqLocation } = req.body;
  console.log('Received locations: ', { startLocation, endLocation, hqLocation });

  try {
    const startToEndDistance = await getDistance(startLocation, endLocation);
    const hqToEndDistance = await getDistance(hqLocation, endLocation);

    res.json({
      startToEnd: startToEndDistance,
      hqToEnd: hqToEndDistance,
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
 