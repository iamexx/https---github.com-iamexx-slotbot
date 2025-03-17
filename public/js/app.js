/**
 * Main application file for the Sizzling Hot Slots game
 */

// Initialize Telegram Mini App
let tg = window.Telegram?.WebApp;
let user = null;

// Game state
let balance = CONFIG.defaultBalance;
let currentBet = CONFIG.defaultBet;
let isSpinning = false;

// DOM elements
const balanceElement = document.getElementById('balance');
const betAmountElement = document.getElementById('bet-amount');
const spinButton = document.getElementById('spin-button');
const betDecreaseButton = document.getElementById('bet-decrease');
const betIncreaseButton = document.getElementById('bet-increase');
const winMessageElement = document.getElementById('win-message');

// Slot machine instance
let slotMachine;

// Initialize the game
function init() {
  // Create slot machine
  slotMachine = new SlotMachine();
  
  // Set up event listeners
  setupEventListeners();
  
  // Initialize UI
  updateUI();
  
  // If Telegram Mini App is available, initialize it
  if (tg) {
    initTelegramApp();
  }
}

// Set up event listeners
function setupEventListeners() {
  // Spin button
  spinButton.addEventListener('click', () => {
    if (!isSpinning && balance >= currentBet) {
      spin();
    }
  });
  
  // Bet controls
  betDecreaseButton.addEventListener('click', () => {
    if (!isSpinning) {
      decreaseBet();
    }
  });
  
  betIncreaseButton.addEventListener('click', () => {
    if (!isSpinning) {
      increaseBet();
    }
  });
}

// Initialize Telegram Mini App
function initTelegramApp() {
  // Expand to full screen
  tg.expand();
  
  // Get user data if available
  user = tg.initDataUnsafe?.user;
  
  // Set theme based on Telegram theme
  if (tg.colorScheme === 'dark') {
    document.body.classList.add('dark-theme');
  }
  
  // Set up back button handler
  tg.BackButton.onClick(() => {
    tg.close();
  });
  
  // Set up main button (if needed)
  tg.MainButton.setText('ADD COINS');
  tg.MainButton.onClick(() => {
    // This would typically open a payment dialog or similar
    balance += 1000;
    updateUI();
  });
}

// Update UI elements
function updateUI() {
  balanceElement.textContent = balance;
  betAmountElement.textContent = currentBet;
  
  // Disable spin button if balance is too low
  if (balance < currentBet) {
    spinButton.disabled = true;
    spinButton.classList.add('disabled');
  } else {
    spinButton.disabled = false;
    spinButton.classList.remove('disabled');
  }
  
  // Update bet controls
  const minBet = CONFIG.betOptions[0];
  const maxBet = CONFIG.betOptions[CONFIG.betOptions.length - 1];
  
  betDecreaseButton.disabled = currentBet <= minBet || isSpinning;
  betIncreaseButton.disabled = currentBet >= maxBet || isSpinning;
  
  // Show main button in Telegram if balance is low
  if (tg && balance < minBet) {
    tg.MainButton.show();
  } else if (tg) {
    tg.MainButton.hide();
  }
}

// Decrease bet amount
function decreaseBet() {
  const currentIndex = CONFIG.betOptions.indexOf(currentBet);
  if (currentIndex > 0) {
    currentBet = CONFIG.betOptions[currentIndex - 1];
    updateUI();
  }
}

// Increase bet amount
function increaseBet() {
  const currentIndex = CONFIG.betOptions.indexOf(currentBet);
  if (currentIndex < CONFIG.betOptions.length - 1) {
    currentBet = CONFIG.betOptions[currentIndex + 1];
    updateUI();
  }
}

// Spin the reels
async function spin() {
  // Set spinning state
  isSpinning = true;
  winMessageElement.textContent = '';
  
  // Update UI
  spinButton.disabled = true;
  spinButton.classList.add('disabled');
  
  // Deduct bet amount
  balance -= currentBet;
  updateUI();
  
  // Spin the reels
  await slotMachine.spin();
  
  // Calculate winnings
  const winResult = slotMachine.calculateWinnings(currentBet);
  
  // Add winnings to balance
  balance += winResult.totalWinnings;
  
  // Show winning effects
  const message = slotMachine.showWinningEffects(winResult);
  winMessageElement.textContent = message;
  
  // Reset spinning state
  isSpinning = false;
  updateUI();
}

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', init); 