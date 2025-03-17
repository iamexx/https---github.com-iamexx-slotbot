/**
 * Game configuration
 */
const CONFIG = {
  // Initial values
  initialBalance: 1000,
  minBet: 5,
  maxBet: 100,
  betStep: 5,
  autoSpinDelay: 1000,
  
  // Reel configuration
  reels: {
    count: 5,
    visibleSymbols: 3,
    symbolsPerReel: 3,
    spinDuration: 1000,
    spinDurationIncrement: 200,
    spinStartDelay: 200
  },
  
  // Paylines (row indices for each column)
  paylines: [
    [1, 1, 1, 1, 1], // Middle row
    [0, 0, 0, 0, 0], // Top row
    [2, 2, 2, 2, 2], // Bottom row
    [0, 1, 2, 1, 0], // V shape
    [2, 1, 0, 1, 2]  // Inverted V shape
  ],
  
  // Win effect settings
  winEffects: {
    duration: 3000,
    particleCount: 100,
    particleColors: ['#FFD700', '#FF6347', '#7FFF00', '#FF00FF', '#00FFFF']
  }
}; 