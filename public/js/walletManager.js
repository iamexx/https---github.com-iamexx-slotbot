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
    
    // Network configuration
    this.network = 'devnet'; // 'devnet' or 'mainnet'
    this.rpcUrl = 'https://api.devnet.solana.com';
    
    console.log('Wallet Manager initialized');
  }
  
  /**
   * Initialize the wallet manager
   */
  async initialize() {
    try {
      if (!window.Telegram?.WebApp) {
        console.error('Telegram WebApp is not available');
        return false;
      }
      
      // Import required modules
      const { TMAWalletClient } = await import('/@tmawallet/sdk');
      const { TMAWalletSolana } = await import('/@tmawallet/sdk/dist/wallets/TMAWallet.Solana');
      
      // Create client and wallet
      this.client = new TMAWalletClient(this.apiKey);
      this.solanaWallet = new TMAWalletSolana(this.client);
      
      // Authenticate user (creates a new wallet if needed)
      await this.solanaWallet.authenticate();
      
      // Get wallet address
      this.walletAddress = this.solanaWallet.walletAddress;
      
      // Update balance
      await this.updateBalance();
      
      this.isInitialized = true;
      console.log('Wallet initialized with address:', this.walletAddress);
      
      return true;
    } catch (error) {
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
      
      const { createSolanaRpc } = await import('/@solana/web3.js');
      const rpc = createSolanaRpc(this.rpcUrl);
      
      // Get balance in lamports (1 SOL = 1,000,000,000 lamports)
      const balanceInLamports = await rpc.getBalance(this.walletAddress);
      
      // Convert to SOL
      this.balance = balanceInLamports / 1_000_000_000;
      
      console.log('Wallet balance updated:', this.balance, 'SOL');
      
      // Dispatch event for balance update
      const event = new CustomEvent('wallet-balance-updated', { 
        detail: { balance: this.balance } 
      });
      document.dispatchEvent(event);
      
      return this.balance;
    } catch (error) {
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