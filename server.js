require('dotenv').config();
const express = require('express');
const path = require('path');
const TelegramBot = require('node-telegram-bot-api');

const app = express();
const PORT = process.env.PORT || 3000;

// Telegram Bot configuration
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || 'YOUR_BOT_TOKEN';
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

// Log startup information
console.log('Starting Sizzling Hot Slots server...');
console.log(`Node version: ${process.version}`);
console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);

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
    const { chatId, message } = req.body;
    
    if (!chatId || !message) {
      return res.status(400).json({ success: false, error: 'Chat ID and message are required' });
    }
    
    const result = await bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
    res.json({ success: true, result });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Bot commands
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
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

<a href="https://t.me/YourBotUsername">Play Now!</a>
`;
  
  bot.sendMessage(chatId, welcomeMessage, { parse_mode: 'HTML' });
});

// Handle bot errors
bot.on('polling_error', (error) => {
  console.error('Telegram bot polling error:', error);
});

// Serve the main HTML file for all routes (SPA style)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser`);
  console.log('Telegram bot is active and ready to send messages');
}); 