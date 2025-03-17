/**
 * Additional functionality for the slot machine game
 * Adds wallet debugging capabilities
 */
document.addEventListener('DOMContentLoaded', function() {
  // Add wallet debug button to the bottom controls
  const bottomControls = document.querySelector('.bottom-controls');
  if (bottomControls) {
    // Check if the wallet debug button already exists
    if (!document.getElementById('wallet-debug-button')) {
      const walletDebugButton = document.createElement('button');
      walletDebugButton.id = 'wallet-debug-button';
      walletDebugButton.className = 'wallet-button';
      walletDebugButton.textContent = 'WALLET DEBUG';
      walletDebugButton.style.marginLeft = '10px';
      
      walletDebugButton.addEventListener('click', function() {
        if (window.walletManager) {
          window.walletManager.openDebugModal();
        } else {
          console.error('Wallet manager not initialized');
          alert('Wallet manager not initialized');
        }
      });
      
      bottomControls.appendChild(walletDebugButton);
    }
  }
  
  console.log('Wallet debug functionality initialized');
}); 