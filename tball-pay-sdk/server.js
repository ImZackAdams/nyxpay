require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();

// ✅ Serve checkout page at explicit path
app.use('/examples/checkout', express.static(path.join(__dirname, 'examples/checkout')));

// ✅ Serve SDK UMD bundle
app.use('/dist', express.static(path.join(__dirname, 'dist')));

// ✅ API endpoint
app.get('/api/get-key', (req, res) => {
  res.json({ apiKey: process.env.HELIUS_KEY });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
