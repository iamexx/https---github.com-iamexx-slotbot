/**
 * Wallet Manager for Telegram Mini App
 * Simplified implementation with basic wallet functionality
 */
class WalletManager {
  constructor() {
    this.isInitialized = false;
    this.walletAddress = 'DemoWallet1111111111111111111111111111111';
    this.balance = 0;
    this.network = 'testnet';
    console.log('Wallet Manager initialized');
  }
  
  /**
   * Initialize the wallet manager
   */
  async initialize() {
    console.log('Initializing wallet manager');
    
    // Set a random balance for demo purposes
    this.balance = parseFloat((Math.random() * 5).toFixed(6));
    
    this.isInitialized = true;
    console.log('Wallet initialized with address:', this.walletAddress);
    console.log('Initial balance:', this.balance, 'SOL');
    
    return true;
  }
  
  /**
   * Generate a new wallet
   */
  async generateNewWallet() {
    console.log('Generating new wallet');
    
    // For demo purposes, just update the address with a random suffix
    const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.walletAddress = `DemoWallet${randomSuffix}111111111111111111111111`;
    
    // Reset balance to a small random amount
    this.balance = parseFloat((Math.random() * 0.1).toFixed(6));
    
    console.log('New wallet generated with address:', this.walletAddress);
    
    // Show wallet modal with the new wallet
    this.showWalletModal();
    
    return true;
  }
  
  /**
   * Show wallet modal
   */
  showWalletModal() {
    const walletModal = document.getElementById('wallet-modal');
    if (!walletModal) {
      console.error('Wallet modal not found');
      return;
    }
    
    // Update wallet address in the modal
    const walletAddressElement = document.getElementById('wallet-address');
    if (walletAddressElement) {
      walletAddressElement.textContent = this.walletAddress || 'No wallet address';
      
      // Add click-to-copy functionality
      walletAddressElement.title = "Click to copy";
      walletAddressElement.style.cursor = "pointer";
      
      // Remove any existing event listener
      walletAddressElement.removeEventListener('click', this._copyAddressToClipboard);
      
      // Add event listener for copying
      this._copyAddressToClipboard = () => {
        if (this.walletAddress) {
          navigator.clipboard.writeText(this.walletAddress)
            .then(() => {
              const originalText = walletAddressElement.textContent;
              walletAddressElement.textContent = "Copied!";
              setTimeout(() => {
                walletAddressElement.textContent = originalText;
              }, 1500);
            })
            .catch(err => {
              console.error('Failed to copy address:', err);
            });
        }
      };
      
      walletAddressElement.addEventListener('click', this._copyAddressToClipboard);
    }
    
    // Update balance in the modal
    const walletBalanceElement = document.getElementById('wallet-balance');
    if (walletBalanceElement) {
      walletBalanceElement.textContent = `${this.balance.toFixed(6)} SOL`;
    }
    
    // Update network in the modal
    const walletNetworkElement = document.getElementById('wallet-network');
    if (walletNetworkElement) {
      walletNetworkElement.textContent = this.network.toUpperCase();
    }
    
    // Enable/disable withdraw button based on balance
    const withdrawButton = document.getElementById('withdraw-wallet-btn');
    if (withdrawButton) {
      if (this.balance > 0) {
        withdrawButton.classList.remove('disabled');
      } else {
        withdrawButton.classList.add('disabled');
      }
    }
    
    // Set up button event listeners
    this._setupButtonListeners();
    
    // Show the modal
    walletModal.style.display = 'block';
  }
  
  /**
   * Set up button event listeners for the wallet modal
   */
  _setupButtonListeners() {
    // Create wallet button
    const createWalletBtn = document.getElementById('create-wallet-btn');
    if (createWalletBtn) {
      // Remove existing listeners
      const newCreateWalletBtn = createWalletBtn.cloneNode(true);
      createWalletBtn.parentNode.replaceChild(newCreateWalletBtn, createWalletBtn);
      
      // Add new listener
      newCreateWalletBtn.addEventListener('click', () => {
        this.generateNewWallet();
        if (typeof playSound === 'function') {
          playSound('button');
        }
      });
    }
    
    // Top up wallet button
    const topupWalletBtn = document.getElementById('topup-wallet-btn');
    if (topupWalletBtn) {
      // Remove existing listeners
      const newTopupWalletBtn = topupWalletBtn.cloneNode(true);
      topupWalletBtn.parentNode.replaceChild(newTopupWalletBtn, topupWalletBtn);
      
      // Add new listener
      newTopupWalletBtn.addEventListener('click', () => {
        this._handleDeposit();
        if (typeof playSound === 'function') {
          playSound('button');
        }
      });
    }
    
    // Withdraw wallet button
    const withdrawWalletBtn = document.getElementById('withdraw-wallet-btn');
    if (withdrawWalletBtn) {
      // Remove existing listeners
      const newWithdrawWalletBtn = withdrawWalletBtn.cloneNode(true);
      withdrawWalletBtn.parentNode.replaceChild(newWithdrawWalletBtn, withdrawWalletBtn);
      
      // Add new listener
      newWithdrawWalletBtn.addEventListener('click', () => {
        if (this.balance > 0) {
          this._handleWithdraw();
          if (typeof playSound === 'function') {
            playSound('button');
          }
        }
      });
    }
    
    // Delete wallet button
    const deleteWalletBtn = document.getElementById('delete-wallet-btn');
    if (deleteWalletBtn) {
      // Remove existing listeners
      const newDeleteWalletBtn = deleteWalletBtn.cloneNode(true);
      deleteWalletBtn.parentNode.replaceChild(newDeleteWalletBtn, deleteWalletBtn);
      
      // Add new listener
      newDeleteWalletBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to delete this wallet?')) {
          this.generateNewWallet();
          if (typeof playSound === 'function') {
            playSound('button');
          }
        }
      });
    }
  }
  
  /**
   * Handle deposit action
   */
  _handleDeposit() {
    alert(`To deposit funds, send SOL to this address:\n${this.walletAddress}`);
    
    // For demo purposes, add some funds
    setTimeout(() => {
      const depositAmount = parseFloat((Math.random() * 0.5).toFixed(6));
      this.balance += depositAmount;
      console.log(`Deposited ${depositAmount} SOL. New balance: ${this.balance} SOL`);
      
      // Update balance display
      const walletBalanceElement = document.getElementById('wallet-balance');
      if (walletBalanceElement) {
        walletBalanceElement.textContent = `${this.balance.toFixed(6)} SOL`;
      }
      
      // Enable withdraw button if needed
      const withdrawButton = document.getElementById('withdraw-wallet-btn');
      if (withdrawButton && this.balance > 0) {
        withdrawButton.classList.remove('disabled');
      }
      
      alert(`Deposited ${depositAmount} SOL successfully!`);
    }, 2000);
  }
  
  /**
   * Handle withdraw action
   */
  _handleWithdraw() {
    const withdrawAmount = parseFloat((Math.random() * this.balance).toFixed(6));
    if (withdrawAmount <= 0) {
      alert('Insufficient balance for withdrawal');
      return;
    }
    
    const destinationAddress = prompt('Enter destination address:', 'Destination123456789');
    if (!destinationAddress) {
      return;
    }
    
    // For demo purposes, subtract funds after a delay
    setTimeout(() => {
      this.balance -= withdrawAmount;
      this.balance = parseFloat(this.balance.toFixed(6));
      console.log(`Withdrew ${withdrawAmount} SOL to ${destinationAddress}. New balance: ${this.balance} SOL`);
      
      // Update balance display
      const walletBalanceElement = document.getElementById('wallet-balance');
      if (walletBalanceElement) {
        walletBalanceElement.textContent = `${this.balance.toFixed(6)} SOL`;
      }
      
      // Disable withdraw button if needed
      const withdrawButton = document.getElementById('withdraw-wallet-btn');
      if (withdrawButton && this.balance <= 0) {
        withdrawButton.classList.add('disabled');
      }
      
      alert(`Withdrew ${withdrawAmount} SOL to ${destinationAddress} successfully!`);
    }, 2000);
  }
}

// Create global wallet manager instance
window.walletManager = new WalletManager();

// Initialize wallet manager when document is loaded
document.addEventListener('DOMContentLoaded', async () => {
  try {
    await window.walletManager.initialize();
  } catch (error) {
    console.error('Failed to initialize wallet manager:', error);
  }
}); 