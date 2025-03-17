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
  spinDuration: 2000, // milliseconds
  reelStaggerDelay: 200, // milliseconds between each reel stopping
  
  // Symbols
  symbols: {
    'cherry': {
      emoji: '🍒',
      probability: 20
    },
    'grapes': {
      emoji: '🍇',
      probability: 15
    },
    'watermelon': {
      emoji: '🍉',
      probability: 10
    },
    'orange': {
      emoji: '🍊',
      probability: 15
    },
    'lemon': {
      emoji: '🍋',
      probability: 20
    },
    'peach': {
      emoji: '🍑',
      probability: 20
    },
    'seven': {
      emoji: '7️⃣',
      probability: 5
    },
    'star': {
      emoji: '⭐',
      probability: 10
    }
  },
  
  // Paylines (row indices for each column)
  paylines: [
    [1, 1, 1, 1, 1], // Middle row
    [0, 0, 0, 0, 0], // Top row
    [2, 2, 2, 2, 2], // Bottom row
    [0, 1, 2, 1, 0], // V shape
    [2, 1, 0, 1, 2]  // Inverted V shape
  ],
  
  // Payout multipliers for 3, 4, or 5 matching symbols
  payouts: {
    'cherry': [2, 4, 8],
    'grapes': [3, 6, 12],
    'watermelon': [4, 8, 16],
    'orange': [3, 6, 12],
    'lemon': [2, 4, 8],
    'peach': [2, 4, 8],
    'seven': [10, 20, 50],
    'star': [5, 10, 25] // Scatter, pays anywhere
  },
  
  // Win effect settings
  winEffects: {
    particleCount: 100,
    particleColors: ['#FFD700', '#FF6347', '#7FFF00', '#FF00FF', '#00FFFF'],
    duration: 2000
  }
}; 