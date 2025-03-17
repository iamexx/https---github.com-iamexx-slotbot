require('dotenv').config();
const express = require('express');
const path = require('path');
const TelegramBot = require('node-telegram-bot-api');

const app = express();
const PORT = process.env.PORT || 3000;

// Log startup information
console.log('Starting Sizzling Hot Slots server...');
console.log(`Node version: ${process.version}`);
console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);

// Telegram Bot configuration
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
if (!TELEGRAM_BOT_TOKEN || TELEGRAM_BOT_TOKEN === 'YOUR_BOT_TOKEN') {
  console.error('ERROR: Telegram bot token is not configured properly in .env file');
  console.error('Please set a valid TELEGRAM_BOT_TOKEN in your .env file');
}

// The chat ID to send the startup message to
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID || '123456789'; // Replace with your actual chat ID

console.log('Initializing Telegram bot...');
console.log(`Using bot token: ${TELEGRAM_BOT_TOKEN ? TELEGRAM_BOT_TOKEN.substring(0, 5) + '...' : 'Not configured'}`);

// Initialize the bot with polling
let bot;
try {
  bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: false }); // Disable polling to avoid 404 errors
  console.log('Telegram bot initialized successfully');
  
  // Bot commands
  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    console.log(`Received /start command from chat ID: ${chatId}`);
    
    const welcomeMessage = `
<b>🎰 Welcome to Sizzling Hot™ deluxe Slot Machine! 🎰</b>

Play our exciting slot game with Solana integration!

<b>Features:</b>
• Classic fruit-themed slots
• Win up to 5000x your bet
• Deposit and withdraw using Solana
• Testnet support for safe playing

<b>Get started:</b>
1. Open the game
2. Connect your wallet
3. Make a deposit
4. Spin and win!
`;
    
    bot.sendMessage(chatId, welcomeMessage, { parse_mode: 'HTML' })
      .then(() => console.log(`Welcome message sent to chat ID: ${chatId}`))
      .catch(error => console.error(`Error sending welcome message: ${error.message}`));
  });
} catch (error) {
  console.error('Failed to initialize Telegram bot:', error.message || error);
  bot = null;
}

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve node_modules for client-side imports
app.use('/@tmawallet/sdk', express.static(path.join(__dirname, 'node_modules/@tmawallet/sdk')));
app.use('/@solana/web3.js', express.static(path.join(__dirname, 'node_modules/@solana/web3.js')));

// Parse JSON bodies
app.use(express.json());

// API endpoint to send a message to a specific user
app.post('/api/send-message', async (req, res) => {
  try {
    if (!bot) {
      return res.status(500).json({ 
        success: false, 
        error: 'Telegram bot is not initialized' 
      });
    }
    
    const { chatId, message } = req.body;
    
    if (!chatId || !message) {
      return res.status(400).json({ 
        success: false, 
        error: 'Chat ID and message are required' 
      });
    }
    
    console.log(`Sending message to chat ID: ${chatId}`);
    console.log(`Message content: ${message.substring(0, 50)}...`);
    
    const result = await bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
    console.log('Message sent successfully');
    res.json({ success: true, result });
  } catch (error) {
    console.error('Error sending message:', error.message || error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Unknown error' 
    });
  }
});

// Send a test message to verify bot functionality
app.get('/api/test-bot', async (req, res) => {
  try {
    if (!bot) {
      return res.status(500).json({ 
        success: false, 
        error: 'Telegram bot is not initialized' 
      });
    }
    
    const chatId = req.query.chatId || ADMIN_CHAT_ID;
    
    if (!chatId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Chat ID is required as a query parameter' 
      });
    }
    
    const testMessage = `
<b>🎰 Test Message from Sizzling Hot™ deluxe Slot Machine! 🎰</b>

This is a test message to verify that the bot is working correctly.
Time: ${new Date().toISOString()}
`;
    
    const result = await bot.sendMessage(chatId, testMessage, { parse_mode: 'HTML' });
    res.json({ success: true, result });
  } catch (error) {
    console.error('Error sending test message:', error.message || error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Unknown error' 
    });
  }
});

// Serve the main HTML file for all routes (SPA style)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser`);
  
  if (bot) {
    console.log('Telegram bot is active');
    
    // Send startup message to admin
    const startupMessage = `
<b>🎰 Sizzling Hot™ deluxe Server Started! 🎰</b>

The slot machine server has been started successfully.

<b>Server Information:</b>
• Time: ${new Date().toISOString()}
• Node Version: ${process.version}
• Environment: ${process.env.NODE_ENV || 'development'}
• Port: ${PORT}

<b>Bot ID:</b> ${TELEGRAM_BOT_TOKEN.split(':')[0]}

Use this Bot ID for your Telegram Mini App configuration.
`;
    
    bot.sendMessage(ADMIN_CHAT_ID, startupMessage, { parse_mode: 'HTML' })
      .then(() => console.log(`Startup message sent to admin chat ID: ${ADMIN_CHAT_ID}`))
      .catch(error => console.error(`Error sending startup message: ${error.message}`));
  } else {
    console.log('WARNING: Telegram bot is not active. Messages will not be sent.');
  }
}); 