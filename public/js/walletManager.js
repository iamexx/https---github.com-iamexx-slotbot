/**
 * Wallet Manager with Solana integration
 * Simplified implementation for Telegram Mini App
 */
class WalletManager {
  constructor() {
    this.isInitialized = false;
    this.walletAddress = null;
    this.balance = 0;
    this.lastError = null;
    this.connection = null;
    this.isConnected = false;
    
    // Network configuration
    this.networks = {
      mainnet: 'https://api.mainnet-beta.solana.com',
      testnet: 'https://api.testnet.solana.com',
      devnet: 'https://api.devnet.solana.com'
    };
    this.network = 'testnet';
    this.rpcUrl = this.networks[this.network];
    
    // Mock wallet addresses for demo
    this.mockWallets = [
      'DemoWallet1111111111111111111111111111111',
      'DemoWallet2222222222222222222222222222222',
      'DemoWallet3333333333333333333333333333333',
      'DemoWallet4444444444444444444444444444444'
    ];
    
    console.log('Wallet Manager initialized');
  }
  
  /**
   * Initialize the wallet manager
   */
  async initialize() {
    try {
      // Load Solana Web3.js
      const solanaWeb3 = await import('@solana/web3.js');
      
      // Connect to Solana network
      this.connection = new solanaWeb3.Connection(this.rpcUrl);
      
      // Test connection
      const version = await this.connection.getVersion();
      console.log('Connected to Solana', this.network, 'version:', version);
      this.isConnected = true;
      
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
      this.isConnected = false;
      return false;
    }
  }
  
  /**
   * Change network
   */
  async changeNetwork(network) {
    if (!this.networks[network]) {
      console.error('Invalid network:', network);
      return false;
    }
    
    try {
      this.network = network;
      this.rpcUrl = this.networks[network];
      
      // Load Solana Web3.js
      const solanaWeb3 = await import('@solana/web3.js');
      
      // Connect to new network
      this.connection = new solanaWeb3.Connection(this.rpcUrl);
      
      // Test connection
      const version = await this.connection.getVersion();
      console.log('Connected to Solana', this.network, 'version:', version);
      this.isConnected = true;
      
      // Update wallet modal
      this.showWalletModal();
      
      return true;
    } catch (error) {
      this.lastError = {
        method: 'changeNetwork',
        message: error.message
      };
      console.error('Failed to change network:', error);
      this.isConnected = false;
      return false;
    }
  }
  
  /**
   * Update wallet balance
   */
  async updateBalance() {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      if (this.isConnected && this.connection) {
        try {
          // Load Solana Web3.js
          const solanaWeb3 = await import('@solana/web3.js');
          
          // For demo purposes, we'll use a random balance
          // In a real app, you would use:
          // const balanceInLamports = await this.connection.getBalance(new solanaWeb3.PublicKey(this.walletAddress));
          // this.balance = balanceInLamports / 1_000_000_000;
          
          // Simulate a small random change in balance
          const change = (Math.random() * 0.1) - 0.05;
          this.balance = Math.max(0, parseFloat((this.balance + change).toFixed(6)));
          
          console.log('Wallet balance updated:', this.balance, 'SOL');
        } catch (error) {
          console.error('Error updating balance:', error);
          this.isConnected = false;
        }
      } else {
        console.warn('Not connected to Solana network');
        this.isConnected = false;
      }
      
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
   * Generate a new wallet
   */
  async generateNewWallet() {
    try {
      if (!this.isConnected) {
        await this.initialize();
      }
      
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
      
      // Update network in the modal with connection status
      const walletNetworkElement = document.getElementById('wallet-network');
      if (walletNetworkElement) {
        // Create status indicator
        let statusDot = walletNetworkElement.querySelector('.status-dot');
        if (!statusDot) {
          statusDot = document.createElement('span');
          statusDot.className = 'status-dot';
          statusDot.style.display = 'inline-block';
          statusDot.style.width = '10px';
          statusDot.style.height = '10px';
          statusDot.style.borderRadius = '50%';
          statusDot.style.marginRight = '5px';
          walletNetworkElement.prepend(statusDot);
        }
        
        // Update status color
        statusDot.style.backgroundColor = this.isConnected ? '#4CAF50' : '#F44336';
        
        // Update network text
        const networkText = document.createTextNode(this.network.toUpperCase());
        if (walletNetworkElement.childNodes.length > 1) {
          walletNetworkElement.replaceChild(networkText, walletNetworkElement.childNodes[1]);
        } else {
          walletNetworkElement.appendChild(networkText);
        }
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
      
      // Add network selection buttons if they don't exist
      let networkButtons = document.querySelector('.network-buttons');
      if (!networkButtons) {
        networkButtons = document.createElement('div');
        networkButtons.className = 'network-buttons';
        networkButtons.style.display = 'flex';
        networkButtons.style.justifyContent = 'space-between';
        networkButtons.style.marginTop = '10px';
        
        // Create buttons for each network
        Object.keys(this.networks).forEach(network => {
          const button = document.createElement('button');
          button.textContent = network.charAt(0).toUpperCase() + network.slice(1);
          button.className = 'network-button';
          button.style.flex = '1';
          button.style.margin = '0 5px';
          button.style.padding = '5px';
          button.style.border = 'none';
          button.style.borderRadius = '4px';
          button.style.backgroundColor = network === this.network ? '#4CAF50' : '#ddd';
          button.style.color = network === this.network ? 'white' : 'black';
          button.style.cursor = 'pointer';
          
          button.addEventListener('click', () => {
            this.changeNetwork(network);
          });
          
          networkButtons.appendChild(button);
        });
        
        // Add network buttons after wallet info
        const walletInfo = document.querySelector('.wallet-info');
        if (walletInfo) {
          walletInfo.after(networkButtons);
        }
      } else {
        // Update active network button
        const buttons = networkButtons.querySelectorAll('.network-button');
        buttons.forEach(button => {
          const buttonNetwork = button.textContent.toLowerCase();
          button.style.backgroundColor = buttonNetwork === this.network ? '#4CAF50' : '#ddd';
          button.style.color = buttonNetwork === this.network ? 'white' : 'black';
        });
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
        isConnected: this.isConnected,
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
    
    // Set up periodic balance updates
    setInterval(() => {
      window.walletManager.updateBalance();
    }, 30000); // Update every 30 seconds
  } catch (error) {
    console.error('Failed to initialize wallet manager:', error);
  }
}); 