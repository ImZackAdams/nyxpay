// server.js
const express = require('express');
const app = express();

// Serve static files from the 'public' directory
app.use(express.static('public'));

// API endpoint for Helius key
app.get('/api/get-key', (req, res) => {
  res.json({ apiKey: 'YOUR_HELIUS_API_KEY_HERE' });
});

app.listen(3000, () => console.log('Server running on port 3000'));