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
  
  // Add wallet buttons
  addWalletControls();
  
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
    // Open deposit dialog instead of directly adding coins
    if (walletManager && walletManager.isInitialized) {
      walletManager.openDepositDialog();
    } else {
      // Fallback for when wallet is not available
      const currentBalance = parseInt(document.getElementById('balance').textContent);
      slotMachine.updateBalance(currentBalance + 1000);
      playSound('button');
    }
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

// Add wallet controls
function addWalletControls() {
  // Create wallet buttons container
  const walletButtons = document.createElement('div');
  walletButtons.className = 'wallet-buttons';
  
  // Create deposit button
  const depositButton = document.createElement('button');
  depositButton.className = 'wallet-button';
  depositButton.textContent = 'Deposit';
  depositButton.addEventListener('click', () => {
    playSound('button');
    if (walletManager && walletManager.isInitialized) {
      walletManager.openDepositDialog();
    } else {
      alert('Wallet not initialized. Please try again later.');
    }
  });
  
  // Create withdraw button
  const withdrawButton = document.createElement('button');
  withdrawButton.className = 'wallet-button';
  withdrawButton.textContent = 'Withdraw';
  withdrawButton.addEventListener('click', () => {
    playSound('button');
    if (walletManager && walletManager.isInitialized) {
      walletManager.openWithdrawDialog();
    } else {
      alert('Wallet not initialized. Please try again later.');
    }
  });
  
  // Add buttons to container
  walletButtons.appendChild(depositButton);
  walletButtons.appendChild(withdrawButton);
  
  // Add wallet address display
  const walletAddressDisplay = document.createElement('div');
  walletAddressDisplay.className = 'wallet-address-display';
  
  // Update wallet address when available
  const updateWalletAddress = () => {
    if (walletManager && walletManager.walletAddress) {
      const address = walletManager.walletAddress;
      // Truncate address for display
      const truncatedAddress = address.substring(0, 4) + '...' + address.substring(address.length - 4);
      walletAddressDisplay.textContent = truncatedAddress;
      walletAddressDisplay.title = address;
      
      // Add click handler to copy address
      walletAddressDisplay.addEventListener('click', () => {
        navigator.clipboard.writeText(address).then(() => {
          // Show copied notification
          const originalText = walletAddressDisplay.textContent;
          walletAddressDisplay.textContent = 'Copied!';
          setTimeout(() => {
            walletAddressDisplay.textContent = originalText;
          }, 1000);
        });
      });
    } else {
      walletAddressDisplay.textContent = 'Wallet loading...';
    }
  };
  
  // Listen for wallet initialization
  document.addEventListener('wallet-balance-updated', () => {
    updateWalletAddress();
  });
  
  // Initial update
  setTimeout(updateWalletAddress, 1000);
  
  // Add to UI
  const uiContainer = document.getElementById('ui-container');
  if (uiContainer) {
    uiContainer.appendChild(walletAddressDisplay);
    uiContainer.appendChild(walletButtons);
  }
}

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', init); 