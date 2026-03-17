// server.js - fully compatible with Render
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve all files in public folder
app.use(express.static(path.join(__dirname, 'public')));

// Catch-all route: sends index.html for any request
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Arcane Empire server running on port ${PORT}`);
});
