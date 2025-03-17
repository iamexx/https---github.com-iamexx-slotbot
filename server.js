require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Log startup information
console.log('Starting Sizzling Hot Slots server...');
console.log(`Node version: ${process.version}`);
console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve node_modules for client-side imports
app.use('/@tmawallet/sdk', express.static(path.join(__dirname, 'node_modules/@tmawallet/sdk')));
app.use('/@solana/web3.js', express.static(path.join(__dirname, 'node_modules/@solana/web3.js')));

// Serve the main HTML file for all routes (SPA style)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser`);
}); 