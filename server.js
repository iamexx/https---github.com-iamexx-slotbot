require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Log startup information
console.log('Starting Sizzling Hot Slots server...');
console.log(`Node version: ${process.version}`);
console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);

// Telegram Bot configuration - only used for Bot ID
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
if (TELEGRAM_BOT_TOKEN && TELEGRAM_BOT_TOKEN !== 'YOUR_BOT_TOKEN') {
  const botId = TELEGRAM_BOT_TOKEN.split(':')[0];
  console.log(`\n=== IMPORTANT INFORMATION ===`);
  console.log(`Bot ID for your Telegram Mini App: ${botId}`);
  console.log(`Use this Bot ID in your Telegram Mini App settings`);
  console.log(`===========================\n`);
} else {
  console.error('ERROR: Telegram bot token is not configured properly in .env file');
  console.error('Please set a valid TELEGRAM_BOT_TOKEN in your .env file');
}

// Set proper MIME types for JavaScript modules
app.use((req, res, next) => {
  if (req.path.endsWith('.js')) {
    res.type('application/javascript');
  } else if (req.path.endsWith('.mjs')) {
    res.type('application/javascript');
  }
  next();
});

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Parse JSON bodies
app.use(express.json());

// Serve the main HTML file for all routes (SPA style)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser`);
}); 