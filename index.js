require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');
const SlotGame = require('./src/slotGame');

// Initialize the bot with the token from .env
const bot = new Telegraf(process.env.BOT_TOKEN);

// Create a new instance of the slot game
const slotGame = new SlotGame();

// User data (in-memory storage - would use a database in production)
const userData = {};

// Default starting balance
const DEFAULT_BALANCE = 1000;

// Available bet amounts
const BET_AMOUNTS = [5, 10, 25, 50, 100];

// Initialize user data if not exists
function initUserData(userId) {
  if (!userData[userId]) {
    userData[userId] = {
      balance: DEFAULT_BALANCE,
      stats: {
        totalSpins: 0,
        totalBet: 0,
        totalWon: 0,
        biggestWin: 0,
        lastSpin: null
      }
    };
  }
  return userData[userId];
}

// Start command
bot.start(async (ctx) => {
  const userId = ctx.from.id;
  const user = initUserData(userId);
  
  await ctx.reply(
    `Welcome to Sizzling Hot Slot Game! 🎰\n\nYour balance: ${user.balance} coins`,
    getMainKeyboard()
  );
});

// Main keyboard
function getMainKeyboard() {
  return Markup.keyboard([
    ['🎮 Play Sizzling Hot', '💰 Check Balance'],
    ['📊 Statistics', '🏆 Leaderboard'],
    ['ℹ️ Game Rules', '🔄 Reset Balance']
  ]).resize();
}

// Handle the Play button
bot.hears('🎮 Play Sizzling Hot', async (ctx) => {
  const userId = ctx.from.id;
  const user = initUserData(userId);
  
  await ctx.reply(
    `Select your bet amount:`,
    Markup.inlineKeyboard(
      BET_AMOUNTS.map(amount => 
        Markup.button.callback(`${amount} coins`, `bet_${amount}`)
      )
    )
  );
});

// Handle bet amount selection
BET_AMOUNTS.forEach(amount => {
  bot.action(`bet_${amount}`, async (ctx) => {
    const userId = ctx.from.id;
    const user = initUserData(userId);
    
    // Check if user has enough balance
    if (user.balance < amount) {
      await ctx.answerCbQuery('Not enough balance!');
      return;
    }
    
    // Deduct bet amount from balance
    user.balance -= amount;
    
    // Update statistics
    user.stats.totalSpins++;
    user.stats.totalBet += amount;
    
    // Show spinning animation
    const spinMsg = await ctx.reply('🎰 Spinning...');
    
    // Simulate spinning delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Spin the slot
    const result = await slotGame.spin();
    
    // Calculate winnings
    const winnings = slotGame.calculateWinnings(result, amount);
    
    // Update statistics
    if (winnings > 0) {
      user.stats.totalWon += winnings;
      if (winnings > user.stats.biggestWin) {
        user.stats.biggestWin = winnings;
      }
    }
    
    // Add winnings to balance
    user.balance += winnings;
    
    // Update last spin data
    user.stats.lastSpin = {
      bet: amount,
      winnings,
      timestamp: Date.now()
    };
    
    // Delete spinning message
    await ctx.deleteMessage(spinMsg.message_id);
    
    // Send the animated GIF of the spinning reels
    await ctx.replyWithAnimation(
      { source: result.gifPath },
      { 
        caption: 'Spinning the reels...' 
      }
    );
    
    // Send the result image
    await ctx.replyWithPhoto(
      { source: result.imagePath },
      { 
        caption: `${result.message}\n\n${winnings > 0 
          ? `You won ${winnings} coins! 🎉` 
          : 'Better luck next time! 😢'}\n\nYour balance: ${user.balance} coins` 
      }
    );
    
    await ctx.answerCbQuery();
  });
});

// Check balance
bot.hears('💰 Check Balance', (ctx) => {
  const userId = ctx.from.id;
  const user = initUserData(userId);
  
  ctx.reply(`Your current balance: ${user.balance} coins`);
});

// Statistics
bot.hears('📊 Statistics', (ctx) => {
  const userId = ctx.from.id;
  const user = initUserData(userId);
  const stats = user.stats;
  
  let lastSpinInfo = 'No spins yet';
  if (stats.lastSpin) {
    const date = new Date(stats.lastSpin.timestamp);
    lastSpinInfo = `Bet: ${stats.lastSpin.bet}, Won: ${stats.lastSpin.winnings}, Time: ${date.toLocaleString()}`;
  }
  
  const profitLoss = stats.totalWon - stats.totalBet;
  const profitLossText = profitLoss >= 0 ? `+${profitLoss}` : profitLoss;
  
  ctx.reply(
    `📊 YOUR STATISTICS 📊\n\n` +
    `Total spins: ${stats.totalSpins}\n` +
    `Total bet: ${stats.totalBet} coins\n` +
    `Total won: ${stats.totalWon} coins\n` +
    `Profit/Loss: ${profitLossText} coins\n` +
    `Biggest win: ${stats.biggestWin} coins\n` +
    `Last spin: ${lastSpinInfo}`
  );
});

// Leaderboard
bot.hears('🏆 Leaderboard', (ctx) => {
  // Create leaderboard based on balance
  const leaderboard = Object.entries(userData)
    .map(([userId, data]) => ({
      userId,
      username: data.username || `User ${userId.substring(0, 5)}`,
      balance: data.balance,
      biggestWin: data.stats.biggestWin
    }))
    .sort((a, b) => b.balance - a.balance)
    .slice(0, 10);
  
  let message = '🏆 LEADERBOARD - TOP BALANCES 🏆\n\n';
  
  leaderboard.forEach((entry, index) => {
    message += `${index + 1}. ${entry.username}: ${entry.balance} coins\n`;
  });
  
  // Also show biggest wins
  const biggestWins = [...leaderboard]
    .sort((a, b) => b.biggestWin - a.biggestWin)
    .slice(0, 5);
  
  message += '\n🎯 BIGGEST WINS 🎯\n\n';
  
  biggestWins.forEach((entry, index) => {
    message += `${index + 1}. ${entry.username}: ${entry.biggestWin} coins\n`;
  });
  
  ctx.reply(message);
});

// Reset balance
bot.hears('🔄 Reset Balance', (ctx) => {
  const userId = ctx.from.id;
  const user = initUserData(userId);
  
  user.balance = DEFAULT_BALANCE;
  ctx.reply(`Your balance has been reset to ${DEFAULT_BALANCE} coins`);
});

// Game rules
bot.hears('ℹ️ Game Rules', (ctx) => {
  ctx.reply(
    `🎮 SIZZLING HOT SLOT RULES 🎮\n\n` +
    `- Match 3 or more identical symbols on a payline to win\n` +
    `- The game has 5 reels and 5 paylines\n` +
    `- Fruit symbols: Cherries, Grapes, Watermelon, Orange, Lemon, Plum\n` +
    `- Special symbols: Star (Scatter), 7 (Highest paying)\n\n` +
    `PAYOUTS (multiplied by your bet):\n` +
    `- 3x Cherries: 2x\n` +
    `- 3x Grapes: 3x\n` +
    `- 3x Watermelon: 4x\n` +
    `- 3x Orange: 3x\n` +
    `- 3x Lemon: 2x\n` +
    `- 3x Plum: 2x\n` +
    `- 3x 7: 10x\n` +
    `- 3x Star (anywhere): 5x\n\n` +
    `Good luck! 🍀`
  );
});

// Handle username updates
bot.on('message', (ctx) => {
  if (ctx.from && ctx.from.username) {
    const userId = ctx.from.id;
    const user = initUserData(userId);
    user.username = ctx.from.username;
  }
});

// Launch the bot
bot.launch().then(() => {
  console.log('Bot is running!');
}).catch((err) => {
  console.error('Error starting bot:', err);
});

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM')); 