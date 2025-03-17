/**
 * Symbol definitions
 */
const SYMBOLS = {
  CHERRY: 'CHERRY',
  GRAPES: 'GRAPES',
  WATERMELON: 'WATERMELON',
  ORANGE: 'ORANGE',
  LEMON: 'LEMON',
  PEACH: 'PEACH',
  SEVEN: 'SEVEN',
  STAR: 'STAR',
  WILD: 'WILD'
};

/**
 * Symbol configuration
 */
const SYMBOLS_CONFIG = {
  [SYMBOLS.CHERRY]: {
    emoji: '🍒',
    weight: 20,
    payouts: [2, 5, 10] // 3, 4, 5 of a kind
  },
  [SYMBOLS.GRAPES]: {
    emoji: '🍇',
    weight: 15,
    payouts: [3, 8, 15]
  },
  [SYMBOLS.WATERMELON]: {
    emoji: '🍉',
    weight: 10,
    payouts: [5, 10, 20]
  },
  [SYMBOLS.ORANGE]: {
    emoji: '🍊',
    weight: 15,
    payouts: [3, 8, 15]
  },
  [SYMBOLS.LEMON]: {
    emoji: '🍋',
    weight: 20,
    payouts: [2, 5, 10]
  },
  [SYMBOLS.PEACH]: {
    emoji: '🍑',
    weight: 20,
    payouts: [2, 5, 10]
  },
  [SYMBOLS.SEVEN]: {
    emoji: '7️⃣',
    weight: 5,
    payouts: [10, 25, 50]
  },
  [SYMBOLS.STAR]: {
    emoji: '⭐',
    weight: 10,
    payouts: [5, 15, 30]
  },
  [SYMBOLS.WILD]: {
    emoji: '🃏',
    weight: 5,
    payouts: [10, 25, 100]
  }
};

/**
 * Class to handle the creation and management of slot symbols
 */
class SymbolManager {
  constructor() {
    this.symbolMap = SYMBOLS_CONFIG;
  }
  
  /**
   * Get the emoji for a symbol name
   */
  getEmoji(symbolName) {
    return this.symbolMap[symbolName].emoji;
  }
  
  /**
   * Get a random symbol name based on probabilities
   */
  getRandomSymbolName() {
    const symbols = Object.keys(this.symbolMap);
    const weights = symbols.map(symbol => this.symbolMap[symbol].weight);
    
    // Calculate total weight
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    
    // Generate random value
    let random = Math.random() * totalWeight;
    
    // Find the symbol based on weight
    for (let i = 0; i < symbols.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return symbols[i];
      }
    }
    
    // Fallback
    return symbols[0];
  }
  
  /**
   * Generate a grid of random symbols
   */
  generateRandomGrid() {
    const grid = [];
    
    for (let i = 0; i < CONFIG.rows * CONFIG.reels; i++) {
      grid.push(this.getRandomSymbolName());
    }
    
    return grid;
  }
  
  /**
   * Calculate winnings based on the current grid and bet amount
   */
  calculateWinnings(grid, betAmount) {
    let totalWinnings = 0;
    const winningLines = [];
    
    // Check each payline
    CONFIG.paylines.forEach((payline, lineIndex) => {
      const lineSymbols = [];
      
      // Get symbols on this payline
      for (let col = 0; col < CONFIG.reels; col++) {
        const rowIndex = payline[col];
        const symbolIndex = rowIndex * CONFIG.reels + col;
        lineSymbols.push(grid[symbolIndex]);
      }
      
      // Check for scatter wins (star symbol)
      const scatterCount = lineSymbols.filter(symbol => symbol === 'star').length;
      if (scatterCount >= 3) {
        const scatterMultiplier = CONFIG.payouts.star[scatterCount - 3];
        const win = betAmount * scatterMultiplier;
        totalWinnings += win;
        winningLines.push({
          lineIndex,
          symbolName: 'star',
          count: scatterCount,
          win,
          positions: this.getSymbolPositions(payline, 'star')
        });
      }
      
      // Check for regular symbol wins
      const symbolCounts = {};
      lineSymbols.forEach(symbol => {
        if (symbol !== 'star') { // Skip scatter for regular win checks
          symbolCounts[symbol] = (symbolCounts[symbol] || 0) + 1;
        }
      });
      
      // Find the symbol with the most matches
      let bestSymbol = null;
      let bestCount = 0;
      
      Object.entries(symbolCounts).forEach(([symbol, count]) => {
        if (count >= 3 && count > bestCount) {
          bestSymbol = symbol;
          bestCount = count;
        }
      });
      
      // Calculate win if we have 3 or more matching symbols
      if (bestSymbol && bestCount >= 3) {
        const multiplier = CONFIG.payouts[bestSymbol][bestCount - 3];
        const win = betAmount * multiplier;
        totalWinnings += win;
        winningLines.push({
          lineIndex,
          symbolName: bestSymbol,
          count: bestCount,
          win,
          positions: this.getSymbolPositions(payline, bestSymbol)
        });
      }
    });
    
    return {
      totalWinnings,
      winningLines
    };
  }
  
  /**
   * Get positions of matching symbols on a payline
   */
  getSymbolPositions(payline, targetSymbol) {
    const positions = [];
    
    for (let col = 0; col < CONFIG.reels; col++) {
      const row = payline[col];
      const symbolIndex = row * CONFIG.reels + col;
      
      positions.push({
        row,
        col,
        symbolIndex
      });
    }
    
    return positions;
  }
  
  /**
   * Generate win message
   */
  generateWinMessage(winResult) {
    if (winResult.totalWinnings <= 0) {
      return 'Better luck next time!';
    }
    
    let message = `You won ${winResult.totalWinnings} coins!`;
    
    if (winResult.winningLines.length > 0) {
      message += ' Winning lines:';
      
      winResult.winningLines.forEach((line, index) => {
        message += ` ${line.count}x ${this.getEmoji(line.symbolName)} on line ${line.lineIndex + 1}`;
        if (index < winResult.winningLines.length - 1) {
          message += ',';
        }
      });
    }
    
    return message;
  }
} 