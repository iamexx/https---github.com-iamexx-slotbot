/**
 * Game configuration
 */
const CONFIG = {
  // Game settings
  reels: 5,
  rows: 3,
  defaultBalance: 1000,
  defaultBet: 10,
  betOptions: [5, 10, 25, 50, 100],
  
  // Animation settings
  spinDuration: 2, // seconds
  reelStaggerDelay: 0.2, // seconds between each reel stopping
  
  // 3D settings
  cameraPosition: { x: 0, y: 0, z: 10 },
  lightIntensity: 1.5,
  
  // Symbol probabilities (higher number = more likely)
  symbolProbabilities: {
    'cherry': 20,
    'grapes': 15,
    'watermelon': 10,
    'orange': 15,
    'lemon': 20,
    'plum': 20,
    '7': 5,
    'star': 10
  },
  
  // Payout multipliers for 3, 4, or 5 matching symbols
  payouts: {
    'cherry': [2, 4, 8],
    'grapes': [3, 6, 12],
    'watermelon': [4, 8, 16],
    'orange': [3, 6, 12],
    'lemon': [2, 4, 8],
    'plum': [2, 4, 8],
    '7': [10, 20, 50],
    'star': [5, 10, 25] // Scatter, pays anywhere
  },
  
  // Colors
  colors: {
    background: 0x1a1a2e,
    cabinetBody: 0x8B4513,
    cabinetTrim: 0xD4AF37,
    reelBackground: 0x000000,
    spinButton: 0xe94560
  }
}; 