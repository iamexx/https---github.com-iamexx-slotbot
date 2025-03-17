/**
 * Wallet Manager for Solana integration with Telegram Mini App
 * Uses TMA Wallet SDK to manage user wallets
 */
class WalletManager {
  constructor() {
    // Replace with your actual API key from TMA Wallet Dashboard
    this.apiKey = 'YOUR_TMA_WALLET_API_KEY';
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
    
    // Load required libraries
    this.loadLibraries();
    
    console.log('Wallet Manager initialized');
  }
  
  /**
   * Load required libraries
   */
  async loadLibraries() {
    try {
      // For older versions, we need to load the libraries differently
      this.TMAWalletSDK = await import('/@tmawallet/sdk');
      this.SolanaWeb3 = await import('/@solana/web3.js');
      
      this.debugInfo.librariesLoaded = {
        TMAWalletSDK: !!this.TMAWalletSDK,
        SolanaWeb3: !!this.SolanaWeb3
      };
      
      console.log('Libraries loaded successfully', this.debugInfo.librariesLoaded);
    } catch (error) {
      this.lastError = {
        method: 'loadLibraries',
        message: error.message,
        stack: error.stack
      };
      console.error('Failed to load libraries:', error);
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
      
      if (!this.TMAWalletSDK) {
        await this.loadLibraries();
        if (!this.TMAWalletSDK) {
          this.lastError = {
            method: 'initialize',
            message: 'Failed to load TMA Wallet SDK'
          };
          return false;
        }
      }
      
      // Create client and wallet (using older SDK version)
      this.client = new this.TMAWalletSDK.TMAWalletClient(this.apiKey);
      
      this.debugInfo.clientCreated = !!this.client;
      
      // For older SDK version, we need to create the wallet differently
      try {
        this.solanaWallet = this.client.getSolanaWallet();
        this.debugInfo.solanaWalletCreated = !!this.solanaWallet;
      } catch (error) {
        this.lastError = {
          method: 'initialize:getSolanaWallet',
          message: error.message,
          stack: error.stack
        };
        console.error('Failed to get Solana wallet:', error);
        return false;
      }
      
      // Authenticate user (creates a new wallet if needed)
      try {
        await this.solanaWallet.authenticate();
        this.debugInfo.authenticated = true;
      } catch (error) {
        this.lastError = {
          method: 'initialize:authenticate',
          message: error.message,
          stack: error.stack
        };
        console.error('Failed to authenticate wallet:', error);
        return false;
      }
      
      // Get wallet address
      try {
        this.walletAddress = this.solanaWallet.getAddress();
        this.debugInfo.walletAddress = this.walletAddress;
      } catch (error) {
        this.lastError = {
          method: 'initialize:getAddress',
          message: error.message,
          stack: error.stack
        };
        console.error('Failed to get wallet address:', error);
        return false;
      }
      
      // Update balance
      await this.updateBalance();
      
      this.isInitialized = true;
      console.log('Wallet initialized with address:', this.walletAddress);
      
      return true;
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
   * Update wallet balance
   */
  async updateBalance() {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      if (!this.SolanaWeb3) {
        await this.loadLibraries();
      }
      
      // For older Solana Web3.js version
      const connection = new this.SolanaWeb3.Connection(this.rpcUrl);
      
      // Get balance in lamports (1 SOL = 1,000,000,000 lamports)
      const balanceInLamports = await connection.getBalance(
        new this.SolanaWeb3.PublicKey(this.walletAddress)
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
        </div>
        <div class="wallet-message"></div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners
    const closeBtn = modal.querySelector('.wallet-modal-close');
    const retryInitBtn = modal.querySelector('#retry-init-button');
    const updateBalanceBtn = modal.querySelector('#update-balance-button');
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
  if (window.Telegram?.WebApp) {
    await walletManager.initialize();
  }
}); 