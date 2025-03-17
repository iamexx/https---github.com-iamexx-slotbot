/**
 * Simplified Wallet Manager with UI only
 * No actual blockchain integration - uses mock data
 */
class WalletManager {
  constructor() {
    this.isInitialized = false;
    this.walletAddress = null;
    this.balance = 0;
    this.lastError = null;
    
    // Network configuration (for display only)
    this.network = 'testnet';
    
    // Mock wallet addresses for demo
    this.mockWallets = [
      'DemoWallet1111111111111111111111111111111',
      'DemoWallet2222222222222222222222222222222',
      'DemoWallet3333333333333333333333333333333',
      'DemoWallet4444444444444444444444444444444'
    ];
    
    console.log('Wallet Manager initialized (UI only)');
  }
  
  /**
   * Initialize the wallet manager
   */
  async initialize() {
    try {
      // Generate a random wallet address from our mock list
      const randomIndex = Math.floor(Math.random() * this.mockWallets.length);
      this.walletAddress = this.mockWallets[randomIndex];
      
      // Set a random balance
      this.balance = parseFloat((Math.random() * 5).toFixed(6));
      
      this.isInitialized = true;
      console.log('Wallet initialized with address:', this.walletAddress);
      console.log('Initial balance:', this.balance, 'SOL');
      
      // Show wallet modal automatically for new users
      this.showWalletModal();
      
      return true;
    } catch (error) {
      this.lastError = {
        method: 'initialize',
        message: error.message
      };
      console.error('Failed to initialize wallet:', error);
      return false;
    }
  }
  
  /**
   * Update wallet balance (mock implementation)
   */
  async updateBalance() {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      // Simulate a small random change in balance
      const change = (Math.random() * 0.1) - 0.05;
      this.balance = Math.max(0, parseFloat((this.balance + change).toFixed(6)));
      
      console.log('Wallet balance updated:', this.balance, 'SOL');
      
      // Dispatch event for balance update
      const event = new CustomEvent('wallet-balance-updated', { 
        detail: { balance: this.balance } 
      });
      document.dispatchEvent(event);
      
      return this.balance;
    } catch (error) {
      this.lastError = {
        method: 'updateBalance',
        message: error.message
      };
      console.error('Failed to update balance:', error);
      return 0;
    }
  }
  
  /**
   * Generate a new wallet (mock implementation)
   */
  async generateNewWallet() {
    try {
      // Generate a new random wallet address from our mock list
      const randomIndex = Math.floor(Math.random() * this.mockWallets.length);
      this.walletAddress = this.mockWallets[randomIndex];
      
      // Reset balance to a small random amount
      this.balance = parseFloat((Math.random() * 0.1).toFixed(6));
      
      console.log('New wallet generated with address:', this.walletAddress);
      
      // Show wallet modal with the new wallet
      this.showWalletModal();
      
      return true;
    } catch (error) {
      this.lastError = {
        method: 'generateNewWallet',
        message: error.message
      };
      console.error('Failed to generate new wallet:', error);
      return false;
    }
  }
  
  /**
   * Show wallet modal
   */
  showWalletModal() {
    try {
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
      
      // Show the modal
      walletModal.style.display = 'block';
    } catch (error) {
      console.error('Failed to show wallet modal:', error);
    }
  }
  
  /**
   * Open debug modal
   */
  openDebugModal() {
    try {
      // Create debug info
      const debugInfo = {
        isInitialized: this.isInitialized,
        walletAddress: this.walletAddress,
        balance: this.balance,
        network: this.network,
        lastError: this.lastError
      };
      
      // Show debug info
      alert(JSON.stringify(debugInfo, null, 2));
    } catch (error) {
      console.error('Failed to open debug modal:', error);
    }
  }
}

// Create global wallet manager instance
window.walletManager = new WalletManager();

// Initialize wallet manager when document is loaded
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Initialize immediately
    await window.walletManager.initialize();
  } catch (error) {
    console.error('Failed to initialize wallet manager:', error);
  }
}); 