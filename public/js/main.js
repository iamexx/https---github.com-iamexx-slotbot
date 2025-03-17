/**
 * Additional functionality for the slot machine game
 */
document.addEventListener('DOMContentLoaded', function() {
  console.log('Game initialized');
  
  // Wallet modal functionality
  const walletModal = document.getElementById('wallet-modal');
  const walletCloseBtn = document.querySelector('.wallet-close-button');
  
  // Wallet action buttons
  const createWalletBtn = document.getElementById('create-wallet-btn');
  const topupWalletBtn = document.getElementById('topup-wallet-btn');
  const withdrawWalletBtn = document.getElementById('withdraw-wallet-btn');
  const deleteWalletBtn = document.getElementById('delete-wallet-btn');
  
  // Wallet address copy functionality
  const walletAddressElement = document.getElementById('wallet-address');
  if (walletAddressElement) {
    walletAddressElement.addEventListener('click', function() {
      const address = walletAddressElement.textContent;
      if (address && address !== 'Loading...') {
        navigator.clipboard.writeText(address)
          .then(() => {
            const originalText = walletAddressElement.textContent;
            walletAddressElement.textContent = 'Copied!';
            setTimeout(() => {
              walletAddressElement.textContent = originalText;
            }, 1500);
          })
          .catch(err => {
            console.error('Failed to copy address: ', err);
          });
      }
    });
  }
  
  // Close wallet modal when close button is clicked
  walletCloseBtn.onclick = function() {
    walletModal.style.display = "none";
    if (typeof playSound === 'function') {
      playSound('button');
    }
  }
  
  // Close wallet modal when clicking outside of it
  window.addEventListener('click', function(event) {
    if (event.target == walletModal) {
      walletModal.style.display = "none";
    }
  });
  
  // Add click event listeners for wallet action buttons
  createWalletBtn.addEventListener('click', function() {
    console.log('Create wallet clicked');
    if (window.walletManager) {
      window.walletManager.generateNewWallet().then(success => {
        if (success) {
          console.log('New wallet generated successfully');
        } else {
          console.error('Failed to generate new wallet');
          alert('Failed to generate new wallet. Please try again.');
        }
      });
    } else {
      alert('Wallet manager not initialized');
    }
  });
  
  topupWalletBtn.addEventListener('click', function() {
    console.log('Top up wallet clicked');
    if (window.walletManager && window.walletManager.walletAddress) {
      alert(`To top up your wallet, send SOL to this address:\n${window.walletManager.walletAddress}`);
    } else {
      alert('Wallet not initialized or no wallet address available');
    }
  });
  
  withdrawWalletBtn.addEventListener('click', function() {
    if (withdrawWalletBtn.classList.contains('disabled')) {
      console.log('Withdraw button is disabled');
      return;
    }
    console.log('Withdraw clicked');
    if (window.walletManager && window.walletManager.balance > 0) {
      alert(`Withdraw functionality would be implemented here.\nCurrent balance: ${window.walletManager.balance} SOL`);
    } else {
      alert('No balance available for withdrawal');
    }
  });
  
  deleteWalletBtn.addEventListener('click', function() {
    console.log('Delete wallet clicked');
    if (window.walletManager) {
      if (confirm('Are you sure you want to delete your wallet? This action cannot be undone.')) {
        window.walletManager.generateNewWallet().then(success => {
          if (success) {
            console.log('Wallet deleted and new wallet generated successfully');
            alert('Your wallet has been deleted and a new one has been generated.');
          } else {
            console.error('Failed to delete wallet');
            alert('Failed to delete wallet. Please try again.');
          }
        });
      }
    } else {
      alert('Wallet manager not initialized');
    }
  });
  
  // Listen for wallet balance updates
  document.addEventListener('wallet-balance-updated', function(event) {
    const balance = event.detail.balance;
    console.log('Wallet balance updated event received:', balance);
    
    // Update the balance in the wallet modal
    const walletBalanceElement = document.getElementById('wallet-balance');
    if (walletBalanceElement) {
      walletBalanceElement.textContent = `${balance.toFixed(6)} SOL`;
    }
    
    // Enable/disable withdraw button based on balance
    if (withdrawWalletBtn) {
      if (balance > 0) {
        withdrawWalletBtn.classList.remove('disabled');
      } else {
        withdrawWalletBtn.classList.add('disabled');
      }
    }
  });
}); 