/**
 * Wallet Manager for Solana integration with Telegram Mini App
 * Uses TMA Wallet SDK to manage user wallets
 */
class WalletManager {
  constructor() {
    // API key from TMA Wallet Dashboard
    this.apiKey = '4973ae7778a7bbf0';
    this.isInitialized = false;
    this.walletAddress = null;
    this.balance = 0;
    this.client = null;
    this.solanaWallet = null;
    this.lastError = null;
    this.debugInfo = {};
    
    // Network configuration
    this.network = 'testnet'; // 'devnet', 'testnet', or 'mainnet'
    this.rpcUrl = 'https://api.testnet.solana.com';
    
    // Load SDK scripts
    this.loadScripts();
    
    console.log('Wallet Manager initialized');
  }
  
  /**
   * Load required SDK scripts
   */
  loadScripts() {
    try {
      // Load TMA Wallet SDK
      const tmaScript = document.createElement('script');
      tmaScript.src = '/@tmawallet/sdk/dist/index.js';
      tmaScript.type = 'text/javascript';
      document.head.appendChild(tmaScript);
      
      // Load Solana Web3.js
      const solanaScript = document.createElement('script');
      solanaScript.src = '/@solana/web3.js/lib/index.iife.js';
      solanaScript.type = 'text/javascript';
      document.head.appendChild(solanaScript);
      
      console.log('SDK scripts loaded');
    } catch (error) {
      console.error('Failed to load SDK scripts:', error);
    }
  }
  
  /**
   * Initialize the wallet manager
   */
  async initialize() {
    try {
      if (!window.Telegram?.WebApp) {
        this.lastError = {
          method: 'initialize',
          message: 'Telegram WebApp is not available'
        };
        console.error('Telegram WebApp is not available');
        return false;
      }
      
      // Wait for scripts to load
      await this.waitForScripts();
      
      try {
        // Check if TMA Wallet SDK is available
        if (!window.TMAWalletSDK) {
          throw new Error('TMA Wallet SDK not loaded');
        }
        
        // Create client
        this.client = new window.TMAWalletSDK.TMAWalletClient(this.apiKey);
        this.debugInfo.clientCreated = !!this.client;
        
        // Create Solana wallet
        this.solanaWallet = new window.TMAWalletSDK.TMAWalletSolana(this.client);
        this.debugInfo.solanaWalletCreated = !!this.solanaWallet;
        
        // Authenticate user (creates a new wallet if needed)
        await this.solanaWallet.authenticate();
        this.debugInfo.authenticated = true;
        
        // Get wallet address
        this.walletAddress = this.solanaWallet.walletAddress;
        this.debugInfo.walletAddress = this.walletAddress;
        
        console.log('Your wallet address: ', this.walletAddress);
        
        // Update balance
        await this.updateBalance();
        
        this.isInitialized = true;
        console.log('Wallet initialized with address:', this.walletAddress);
        
        // Show wallet modal automatically for new users
        this.showWalletModal();
        
        return true;
      } catch (error) {
        this.lastError = {
          method: 'initialize:sdk',
          message: error.message,
          stack: error.stack
        };
        console.error('Failed to initialize TMA Wallet SDK:', error);
        return false;
      }
    } catch (error) {
      this.lastError = {
        method: 'initialize',
        message: error.message,
        stack: error.stack
      };
      console.error('Failed to initialize wallet:', error);
      return false;
    }
  }
  
  /**
   * Wait for scripts to load
   */
  waitForScripts() {
    return new Promise((resolve) => {
      const checkScripts = () => {
        if (window.TMAWalletSDK && window.solanaWeb3) {
          resolve();
        } else {
          setTimeout(checkScripts, 100);
        }
      };
      
      checkScripts();
    });
  }
  
  /**
   * Update wallet balance
   */
  async updateBalance() {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      if (!this.walletAddress) {
        console.error('Wallet address not available');
        return 0;
      }
      
      // Check if Solana Web3.js is available
      if (!window.solanaWeb3) {
        console.error('Solana Web3.js not loaded');
        return 0;
      }
      
      // Create connection to Solana network
      const connection = new window.solanaWeb3.Connection(this.rpcUrl);
      
      // Get balance in lamports (1 SOL = 1,000,000,000 lamports)
      const balanceInLamports = await connection.getBalance(
        new window.solanaWeb3.PublicKey(this.walletAddress)
      );
      
      // Convert to SOL
      this.balance = balanceInLamports / 1_000_000_000;
      
      this.debugInfo.balance = this.balance;
      
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
        message: error.message,
        stack: error.stack
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
      if (!this.client) {
        await this.initialize();
      }
      
      // Create a new wallet
      this.solanaWallet = new window.TMAWalletSDK.TMAWalletSolana(this.client);
      
      // Force creation of a new wallet
      await this.solanaWallet.authenticate({ forceNewWallet: true });
      
      // Get new wallet address
      this.walletAddress = this.solanaWallet.walletAddress;
      
      // Update balance
      await this.updateBalance();
      
      console.log('New wallet generated with address:', this.walletAddress);
      
      // Show wallet modal with the new wallet
      this.showWalletModal();
      
      return true;
    } catch (error) {
      this.lastError = {
        method: 'generateNewWallet',
        message: error.message,
        stack: error.stack
      };
      console.error('Failed to generate new wallet:', error);
      return false;
    }
  }
  
  /**
   * Get wallet address
   */
  getWalletAddress() {
    return this.walletAddress;
  }
  
  /**
   * Get wallet balance
   */
  getBalance() {
    return this.balance;
  }
  
  /**
   * Get debug information
   */
  getDebugInfo() {
    return {
      isInitialized: this.isInitialized,
      walletAddress: this.walletAddress,
      balance: this.balance,
      network: this.network,
      rpcUrl: this.rpcUrl,
      lastError: this.lastError,
      debugInfo: this.debugInfo
    };
  }
  
  /**
   * Show wallet modal with options to deposit, withdraw, or generate a new wallet
   */
  showWalletModal() {
    // Create modal for wallet management
    const modal = document.createElement('div');
    modal.className = 'wallet-modal';
    modal.innerHTML = `
      <div class="wallet-modal-content">
        <span class="wallet-modal-close">&times;</span>
        <h2>Your Solana Wallet</h2>
        <div class="wallet-info">
          <p>Status: <span class="${this.isInitialized ? 'success' : 'error'}">${this.isInitialized ? 'Active' : 'Not Initialized'}</span></p>
          <p>Wallet Address: <span class="wallet-address" title="Click to copy">${this.walletAddress || 'Not available'}</span></p>
          <p>Balance: <span class="wallet-balance">${this.balance ? this.balance.toFixed(4) : '0'}</span> SOL</p>
          <p>Network: <span>${this.network}</span></p>
        </div>
        <div class="wallet-actions">
          <button id="deposit-button" class="wallet-action-button">Deposit SOL</button>
          <button id="withdraw-button" class="wallet-action-button">Withdraw SOL</button>
          <button id="new-wallet-button" class="wallet-action-button">Generate New Wallet</button>
        </div>
        <div class="wallet-message"></div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners
    const closeBtn = modal.querySelector('.wallet-modal-close');
    const depositBtn = modal.querySelector('#deposit-button');
    const withdrawBtn = modal.querySelector('#withdraw-button');
    const newWalletBtn = modal.querySelector('#new-wallet-button');
    const walletAddressEl = modal.querySelector('.wallet-address');
    const messageDiv = modal.querySelector('.wallet-message');
    
    closeBtn.addEventListener('click', () => {
      document.body.removeChild(modal);
    });
    
    // Add copy to clipboard functionality
    if (this.walletAddress) {
      walletAddressEl.addEventListener('click', () => {
        navigator.clipboard.writeText(this.walletAddress).then(() => {
          walletAddressEl.classList.add('copied');
          const originalText = walletAddressEl.textContent;
          walletAddressEl.textContent = 'Copied!';
          
          setTimeout(() => {
            walletAddressEl.textContent = originalText;
            walletAddressEl.classList.remove('copied');
          }, 1500);
        }).catch(err => {
          console.error('Failed to copy address: ', err);
        });
      });
    }
    
    depositBtn.addEventListener('click', () => {
      document.body.removeChild(modal);
      this.openDepositDialog();
    });
    
    withdrawBtn.addEventListener('click', () => {
      document.body.removeChild(modal);
      this.openWithdrawDialog();
    });
    
    newWalletBtn.addEventListener('click', async () => {
      messageDiv.textContent = 'Generating new wallet...';
      messageDiv.className = 'wallet-message info';
      
      const success = await this.generateNewWallet();
      
      if (success) {
        messageDiv.textContent = 'New wallet generated successfully!';
        messageDiv.className = 'wallet-message success';
        
        // Update wallet info in the modal
        modal.querySelector('.wallet-address').textContent = this.walletAddress || 'Not available';
        modal.querySelector('.wallet-balance').textContent = this.balance ? this.balance.toFixed(4) : '0';
        
        // Update copy to clipboard functionality for new address
        const updatedWalletAddressEl = modal.querySelector('.wallet-address');
        updatedWalletAddressEl.addEventListener('click', () => {
          navigator.clipboard.writeText(this.walletAddress).then(() => {
            updatedWalletAddressEl.classList.add('copied');
            const originalText = updatedWalletAddressEl.textContent;
            updatedWalletAddressEl.textContent = 'Copied!';
            
            setTimeout(() => {
              updatedWalletAddressEl.textContent = originalText;
              updatedWalletAddressEl.classList.remove('copied');
            }, 1500);
          }).catch(err => {
            console.error('Failed to copy address: ', err);
          });
        });
      } else {
        messageDiv.textContent = 'Failed to generate new wallet. See console for details.';
        messageDiv.className = 'wallet-message error';
      }
    });
  }
  
  /**
   * Transfer SOL to the game
   * @param {number} amount - Amount in SOL to transfer
   */
  async depositToGame(amount) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      // For demo purposes, we're just updating the balance
      // In a real implementation, you would transfer SOL to a game wallet
      console.log(`Depositing ${amount} SOL to game`);
      
      // Simulate successful deposit
      const event = new CustomEvent('wallet-deposit-success', { 
        detail: { amount: amount } 
      });
      document.dispatchEvent(event);
      
      return true;
    } catch (error) {
      this.lastError = {
        method: 'depositToGame',
        message: error.message,
        stack: error.stack
      };
      console.error('Failed to deposit to game:', error);
      
      // Dispatch failure event
      const event = new CustomEvent('wallet-deposit-failed', { 
        detail: { error: error.message } 
      });
      document.dispatchEvent(event);
      
      return false;
    }
  }
  
  /**
   * Transfer SOL from the game to the user's wallet
   * @param {number} amount - Amount in SOL to withdraw
   */
  async withdrawFromGame(amount) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      // For demo purposes, we're just updating the balance
      // In a real implementation, you would transfer SOL from a game wallet
      console.log(`Withdrawing ${amount} SOL from game`);
      
      // Simulate successful withdrawal
      const event = new CustomEvent('wallet-withdraw-success', { 
        detail: { amount: amount } 
      });
      document.dispatchEvent(event);
      
      return true;
    } catch (error) {
      this.lastError = {
        method: 'withdrawFromGame',
        message: error.message,
        stack: error.stack
      };
      console.error('Failed to withdraw from game:', error);
      
      // Dispatch failure event
      const event = new CustomEvent('wallet-withdraw-failed', { 
        detail: { error: error.message } 
      });
      document.dispatchEvent(event);
      
      return false;
    }
  }
  
  /**
   * Open debug modal
   */
  openDebugModal() {
    // Create modal for debug info
    const modal = document.createElement('div');
    modal.className = 'wallet-modal';
    
    // Format debug info as JSON
    const debugInfo = this.getDebugInfo();
    const formattedDebugInfo = JSON.stringify(debugInfo, null, 2);
    
    modal.innerHTML = `
      <div class="wallet-modal-content">
        <span class="wallet-modal-close">&times;</span>
        <h2>Wallet Debug Information</h2>
        <div class="wallet-info">
          <p>Status: <span class="${this.isInitialized ? 'success' : 'error'}">${this.isInitialized ? 'Initialized' : 'Not Initialized'}</span></p>
          <p>Wallet Address: <span class="wallet-address">${this.walletAddress || 'Not available'}</span></p>
          <p>Balance: <span class="wallet-balance">${this.balance ? this.balance.toFixed(4) : '0'}</span> SOL</p>
          <p>Network: <span>${this.network}</span></p>
        </div>
        <div class="wallet-debug">
          <h3>Debug Information</h3>
          <pre>${formattedDebugInfo}</pre>
        </div>
        <div class="wallet-actions">
          <button id="retry-init-button">Retry Initialization</button>
          <button id="update-balance-button">Update Balance</button>
          <button id="show-wallet-button">Show Wallet Modal</button>
        </div>
        <div class="wallet-message"></div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners
    const closeBtn = modal.querySelector('.wallet-modal-close');
    const retryInitBtn = modal.querySelector('#retry-init-button');
    const updateBalanceBtn = modal.querySelector('#update-balance-button');
    const showWalletBtn = modal.querySelector('#show-wallet-button');
    const messageDiv = modal.querySelector('.wallet-message');
    
    closeBtn.addEventListener('click', () => {
      document.body.removeChild(modal);
    });
    
    retryInitBtn.addEventListener('click', async () => {
      messageDiv.textContent = 'Retrying initialization...';
      messageDiv.className = 'wallet-message info';
      
      const success = await this.initialize();
      
      if (success) {
        messageDiv.textContent = 'Initialization successful!';
        messageDiv.className = 'wallet-message success';
        
        // Update debug info
        const debugInfo = this.getDebugInfo();
        modal.querySelector('pre').textContent = JSON.stringify(debugInfo, null, 2);
        modal.querySelector('p:nth-child(1) span').textContent = 'Initialized';
        modal.querySelector('p:nth-child(1) span').className = 'success';
        modal.querySelector('p:nth-child(2) span').textContent = this.walletAddress || 'Not available';
        modal.querySelector('p:nth-child(3) span').textContent = this.balance ? this.balance.toFixed(4) : '0';
      } else {
        messageDiv.textContent = 'Initialization failed. See console for details.';
        messageDiv.className = 'wallet-message error';
        
        // Update debug info
        const debugInfo = this.getDebugInfo();
        modal.querySelector('pre').textContent = JSON.stringify(debugInfo, null, 2);
      }
    });
    
    updateBalanceBtn.addEventListener('click', async () => {
      messageDiv.textContent = 'Updating balance...';
      messageDiv.className = 'wallet-message info';
      
      const balance = await this.updateBalance();
      
      if (balance > 0 || this.isInitialized) {
        messageDiv.textContent = `Balance updated: ${balance.toFixed(4)} SOL`;
        messageDiv.className = 'wallet-message success';
        
        // Update debug info
        const debugInfo = this.getDebugInfo();
        modal.querySelector('pre').textContent = JSON.stringify(debugInfo, null, 2);
        modal.querySelector('p:nth-child(3) span').textContent = balance.toFixed(4);
      } else {
        messageDiv.textContent = 'Failed to update balance. See console for details.';
        messageDiv.className = 'wallet-message error';
        
        // Update debug info
        const debugInfo = this.getDebugInfo();
        modal.querySelector('pre').textContent = JSON.stringify(debugInfo, null, 2);
      }
    });
    
    showWalletBtn.addEventListener('click', () => {
      document.body.removeChild(modal);
      this.showWalletModal();
    });
  }
  
  /**
   * Open deposit dialog
   */
  openDepositDialog() {
    // Create modal for deposit
    const modal = document.createElement('div');
    modal.className = 'wallet-modal';
    modal.innerHTML = `
      <div class="wallet-modal-content">
        <span class="wallet-modal-close">&times;</span>
        <h2>Deposit SOL</h2>
        <div class="wallet-info">
          <p>Wallet Address: <span class="wallet-address">${this.walletAddress}</span></p>
          <p>Balance: <span class="wallet-balance">${this.balance.toFixed(4)}</span> SOL</p>
        </div>
        <div class="wallet-form">
          <label for="deposit-amount">Amount to Deposit (SOL):</label>
          <input type="number" id="deposit-amount" min="0.001" step="0.001" value="1">
          <button id="deposit-button">Deposit</button>
        </div>
        <div class="wallet-message"></div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners
    const closeBtn = modal.querySelector('.wallet-modal-close');
    const depositBtn = modal.querySelector('#deposit-button');
    const messageDiv = modal.querySelector('.wallet-message');
    
    closeBtn.addEventListener('click', () => {
      document.body.removeChild(modal);
    });
    
    depositBtn.addEventListener('click', async () => {
      const amountInput = modal.querySelector('#deposit-amount');
      const amount = parseFloat(amountInput.value);
      
      if (isNaN(amount) || amount <= 0) {
        messageDiv.textContent = 'Please enter a valid amount';
        messageDiv.className = 'wallet-message error';
        return;
      }
      
      if (amount > this.balance) {
        messageDiv.textContent = 'Insufficient balance';
        messageDiv.className = 'wallet-message error';
        return;
      }
      
      messageDiv.textContent = 'Processing deposit...';
      messageDiv.className = 'wallet-message info';
      
      const success = await this.depositToGame(amount);
      
      if (success) {
        messageDiv.textContent = `Successfully deposited ${amount} SOL`;
        messageDiv.className = 'wallet-message success';
        
        // Update game balance
        const currentBalance = parseInt(document.getElementById('balance').textContent);
        const solToGameTokens = 1000; // 1 SOL = 1000 game tokens
        const gameTokens = Math.floor(amount * solToGameTokens);
        document.getElementById('balance').textContent = currentBalance + gameTokens;
        
        // Close modal after 2 seconds
        setTimeout(() => {
          document.body.removeChild(modal);
        }, 2000);
      } else {
        messageDiv.textContent = 'Deposit failed. Please try again.';
        messageDiv.className = 'wallet-message error';
      }
    });
  }
  
  /**
   * Open withdraw dialog
   */
  openWithdrawDialog() {
    // Get current game balance
    const currentGameBalance = parseInt(document.getElementById('balance').textContent);
    const gameTokensToSol = 0.001; // 1000 game tokens = 1 SOL
    const maxWithdrawSol = currentGameBalance * gameTokensToSol;
    
    // Create modal for withdraw
    const modal = document.createElement('div');
    modal.className = 'wallet-modal';
    modal.innerHTML = `
      <div class="wallet-modal-content">
        <span class="wallet-modal-close">&times;</span>
        <h2>Withdraw SOL</h2>
        <div class="wallet-info">
          <p>Wallet Address: <span class="wallet-address">${this.walletAddress}</span></p>
          <p>Wallet Balance: <span class="wallet-balance">${this.balance.toFixed(4)}</span> SOL</p>
          <p>Game Balance: <span class="game-balance">${currentGameBalance}</span> tokens (${maxWithdrawSol.toFixed(4)} SOL)</p>
        </div>
        <div class="wallet-form">
          <label for="withdraw-amount">Amount to Withdraw (SOL):</label>
          <input type="number" id="withdraw-amount" min="0.001" max="${maxWithdrawSol.toFixed(4)}" step="0.001" value="${Math.min(1, maxWithdrawSol).toFixed(4)}">
          <button id="withdraw-button">Withdraw</button>
        </div>
        <div class="wallet-message"></div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners
    const closeBtn = modal.querySelector('.wallet-modal-close');
    const withdrawBtn = modal.querySelector('#withdraw-button');
    const messageDiv = modal.querySelector('.wallet-message');
    
    closeBtn.addEventListener('click', () => {
      document.body.removeChild(modal);
    });
    
    withdrawBtn.addEventListener('click', async () => {
      const amountInput = modal.querySelector('#withdraw-amount');
      const amount = parseFloat(amountInput.value);
      
      if (isNaN(amount) || amount <= 0) {
        messageDiv.textContent = 'Please enter a valid amount';
        messageDiv.className = 'wallet-message error';
        return;
      }
      
      if (amount > maxWithdrawSol) {
        messageDiv.textContent = 'Insufficient game balance';
        messageDiv.className = 'wallet-message error';
        return;
      }
      
      messageDiv.textContent = 'Processing withdrawal...';
      messageDiv.className = 'wallet-message info';
      
      const success = await this.withdrawFromGame(amount);
      
      if (success) {
        messageDiv.textContent = `Successfully withdrew ${amount} SOL`;
        messageDiv.className = 'wallet-message success';
        
        // Update game balance
        const solToGameTokens = 1000; // 1 SOL = 1000 game tokens
        const gameTokens = Math.floor(amount * solToGameTokens);
        document.getElementById('balance').textContent = currentGameBalance - gameTokens;
        
        // Close modal after 2 seconds
        setTimeout(() => {
          document.body.removeChild(modal);
        }, 2000);
      } else {
        messageDiv.textContent = 'Withdrawal failed. Please try again.';
        messageDiv.className = 'wallet-message error';
      }
    });
  }
}

// Create global wallet manager instance
const walletManager = new WalletManager();

// Initialize wallet when document is loaded
document.addEventListener('DOMContentLoaded', async () => {
  console.log('DOM loaded, checking for Telegram WebApp');
  
  if (window.Telegram?.WebApp) {
    console.log('Telegram WebApp found, initializing wallet');
    
    try {
      // Initialize the wallet
      const success = await walletManager.initialize();
      console.log('Wallet initialization result:', success ? 'Success' : 'Failed');
    } catch (error) {
      console.error('Error during wallet initialization:', error);
    }
  } else {
    console.warn('Telegram WebApp not found, wallet features will be limited');
  }
}); 