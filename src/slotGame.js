const fs = require('fs');
const path = require('path');
const SlotRenderer = require('./slotRenderer');
const GifGenerator = require('./gifGenerator');

class SlotGame {
  constructor() {
    // Define symbols
    this.symbols = [
      { name: 'cherry', value: 2, color: 0xFF0000FF }, // Red
      { name: 'grapes', value: 3, color: 0x800080FF }, // Purple
      { name: 'watermelon', value: 4, color: 0x00FF00FF }, // Green
      { name: 'orange', value: 3, color: 0xFFA500FF }, // Orange
      { name: 'lemon', value: 2, color: 0xFFFF00FF }, // Yellow
      { name: 'plum', value: 2, color: 0x8B4513FF }, // Brown
      { name: '7', value: 10, color: 0xFF0000FF }, // Red
      { name: 'star', value: 5, isScatter: true, color: 0xFFD700FF } // Gold
    ];
    
    // Define paylines (for a 5x3 grid)
    this.paylines = [
      [0, 1, 2, 3, 4], // Top row
      [5, 6, 7, 8, 9], // Middle row
      [10, 11, 12, 13, 14], // Bottom row
      [0, 6, 12, 8, 4], // Diagonal from top-left to bottom-right
      [10, 6, 2, 8, 14]  // Diagonal from bottom-left to top-right
    ];
    
    // Create output directory if it doesn't exist
    this.outputDir = path.join(__dirname, 'output');
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
    
    // Initialize the renderer
    this.renderer = new SlotRenderer();
    
    // Initialize the GIF generator
    this.gifGenerator = new GifGenerator(this.renderer);
  }
  
  // Generate a random spin result
  async spin() {
    // Create a 5x3 grid of random symbols
    const grid = [];
    for (let i = 0; i < 15; i++) {
      const randomIndex = Math.floor(Math.random() * this.symbols.length);
      grid.push(this.symbols[randomIndex]);
    }
    
    // Generate an image of the result using the renderer
    const imagePath = await this.renderer.renderToFile(grid);
    
    // Generate an animated GIF of the spinning reels
    const gifPath = await this.gifGenerator.generateSpinGif(grid);
    
    // Check for winning combinations
    const winningLines = this.checkWinningLines(grid);
    
    // Create result message
    let message = 'Spin result:';
    if (winningLines.length > 0) {
      message += '\n\n🎉 Winning lines:';
      winningLines.forEach((line, index) => {
        message += `\nLine ${index + 1}: ${line.count}x ${line.symbol.name} (${line.symbol.value}x multiplier)`;
      });
    } else {
      message += '\n\nNo winning combinations.';
    }
    
    return {
      grid,
      winningLines,
      imagePath,
      gifPath,
      message
    };
  }
  
  // Check for winning combinations on all paylines
  checkWinningLines(grid) {
    const winningLines = [];
    
    // Check each payline
    this.paylines.forEach((payline, paylineIndex) => {
      const lineSymbols = payline.map(position => grid[position]);
      
      // Count occurrences of each symbol in the line
      const symbolCounts = {};
      lineSymbols.forEach(symbol => {
        if (!symbolCounts[symbol.name]) {
          symbolCounts[symbol.name] = { count: 0, symbol };
        }
        symbolCounts[symbol.name].count++;
      });
      
      // Check for winning combinations (3 or more of the same symbol)
      Object.values(symbolCounts).forEach(({ count, symbol }) => {
        if (count >= 3) {
          winningLines.push({
            paylineIndex,
            symbol,
            count
          });
        }
      });
    });
    
    // Check for scatters (which can be anywhere on the grid)
    const scatterCount = grid.filter(symbol => symbol.isScatter).length;
    if (scatterCount >= 3) {
      const scatterSymbol = this.symbols.find(s => s.isScatter);
      winningLines.push({
        paylineIndex: -1, // -1 indicates scatter
        symbol: scatterSymbol,
        count: scatterCount
      });
    }
    
    return winningLines;
  }
  
  // Calculate winnings based on winning lines and bet amount
  calculateWinnings(result, betAmount) {
    let totalWinnings = 0;
    
    result.winningLines.forEach(line => {
      // Calculate winnings based on symbol value, count, and bet amount
      let multiplier = line.symbol.value;
      
      // Adjust multiplier based on number of matching symbols
      if (line.count === 4) {
        multiplier *= 2; // Double for 4 of a kind
      } else if (line.count === 5) {
        multiplier *= 5; // 5x for 5 of a kind
      }
      
      totalWinnings += betAmount * multiplier;
    });
    
    return totalWinnings;
  }
}

module.exports = SlotGame; 