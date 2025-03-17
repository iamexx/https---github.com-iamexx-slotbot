// Test script to check if the TMA Wallet API key is valid
const { TMAWalletClient } = require('@tmawallet/sdk');

// API key to test
const apiKey = '4973ae7778a7bbf0';

async function testApiKey() {
  try {
    console.log(`Testing API key: ${apiKey}`);
    
    // Create a client with the API key
    const client = new TMAWalletClient(apiKey);
    
    // Try to get the client info - this should fail if the API key is invalid
    const clientInfo = await client.getClientInfo();
    
    console.log('API key is valid!');
    console.log('Client info:', clientInfo);
    
    return true;
  } catch (error) {
    console.error('API key validation failed:');
    console.error(error.message);
    
    return false;
  }
}

// Run the test
testApiKey()
  .then(isValid => {
    if (isValid) {
      console.log('✅ API key validation successful');
      process.exit(0);
    } else {
      console.log('❌ API key validation failed');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Unexpected error during validation:', error);
    process.exit(1);
  }); 