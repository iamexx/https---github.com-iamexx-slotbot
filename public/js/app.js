/**
 * Main application file for the Sizzling Hot Slots game
 */

// Initialize Telegram Mini App
let tg = window.Telegram?.WebApp;
let user = null;

// Game instance
let slotMachine;

// Initialize the game
function init() {
  console.log('Initializing game...');
  
  // Create slot machine
  slotMachine = new SlotMachine();
  
  // If Telegram Mini App is available, initialize it
  if (tg) {
    initTelegramApp();
  }
  
  // Add sound control button
  addSoundControl();
  
  console.log('Game initialized');
}

// Initialize Telegram Mini App
function initTelegramApp() {
  console.log('Initializing Telegram Mini App');
  
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
  
  // Set up main button for adding coins
  tg.MainButton.setText('ADD COINS');
  tg.MainButton.onClick(() => {
    // Add coins to balance
    const currentBalance = parseInt(document.getElementById('balance').textContent);
    slotMachine.updateBalance(currentBalance + 1000);
    playSound('button');
  });
  
  console.log('Telegram Mini App initialized');
}

// Add sound control button
function addSoundControl() {
  const controlsContainer = document.querySelector('.controls');
  
  if (controlsContainer) {
    // Create sound button
    const soundButton = document.createElement('button');
    soundButton.id = 'sound-toggle';
    soundButton.className = 'control-button sound-on';
    soundButton.innerHTML = '🔊';
    soundButton.title = 'Toggle Sound';
    
    // Add click handler
    soundButton.addEventListener('click', () => {
      const isMuted = soundManager.toggleMute();
      soundButton.innerHTML = isMuted ? '🔇' : '🔊';
      soundButton.className = `control-button ${isMuted ? 'sound-off' : 'sound-on'}`;
      
      // Play button sound if unmuting
      if (!isMuted) {
        playSound('button');
      }
    });
    
    // Add to controls
    controlsContainer.appendChild(soundButton);
  }
}

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', init); 