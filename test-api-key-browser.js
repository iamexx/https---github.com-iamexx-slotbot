// Browser-compatible test script for TMA Wallet API key
// Save this to a file and include it in your HTML

function testTMAWalletApiKey() {
  const apiKey = '4973ae7778a7bbf0'; // Your app id
  
  console.log('Testing TMA Wallet API key:', apiKey);
  
  try {
    // Create a TMA Wallet client with the API key
    const tmaw = new TMAWalletSDK.TMAWalletClient(apiKey);
    
    console.log('TMA Wallet client created successfully');
    console.log('Client:', tmaw);
    
    // Try to get a Solana wallet (this won't fully work outside Telegram, but should initialize)
    try {
      const solanaWallet = tmaw.getSolanaWallet();
      console.log('Solana wallet created successfully:', solanaWallet);
      return true;
    } catch (walletError) {
      // If the error is about Telegram WebApp, the API key might still be valid
      if (walletError.message.includes('Telegram') || walletError.message.includes('WebApp')) {
        console.log('API key appears valid, but Telegram WebApp is required:', walletError.message);
        return true;
      } else {
        console.error('Error creating wallet (possible API key issue):', walletError.message);
        return false;
      }
    }
  } catch (error) {
    console.error('Error creating TMA Wallet client (API key likely invalid):', error.message);
    return false;
  }
} 