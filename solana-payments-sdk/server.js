const express = require('express');
const path = require('path');
const app = express();

// Serve static files
app.use(express.static('examples/simple-payment'));
app.use('/dist', express.static('dist'));

// API endpoint for Helius key (mock for testing)
app.get('/api/get-key', (req, res) => {
  res.json({ apiKey: 'YOUR_HELIUS_API_KEY_HERE' });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});