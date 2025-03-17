/**
 * Class to handle paylines and win calculations
 */
class PaylineManager {
  constructor() {
    // Define the 5 paylines (row indices for each column)
    this.paylines = [
      [1, 1, 1, 1, 1], // Middle row
      [0, 0, 0, 0, 0], // Top row
      [2, 2, 2, 2, 2], // Bottom row
      [0, 1, 2, 1, 0], // V shape
      [2, 1, 0, 1, 2]  // Inverted V shape
    ];
    
    // Payline colors for visualization
    this.paylineColors = [
      0xFF0000, // Red
      0x00FF00, // Green
      0x0000FF, // Blue
      0xFFFF00, // Yellow
      0xFF00FF  // Magenta
    ];
  }
  
  /**
   * Calculate winnings based on the current grid and bet amount
   */
  calculateWinnings(grid, betAmount) {
    let totalWinnings = 0;
    const winningLines = [];
    
    // Check each payline
    this.paylines.forEach((payline, lineIndex) => {
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
          win
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
          win
        });
      }
    });
    
    return {
      totalWinnings,
      winningLines
    };
  }
  
  /**
   * Create visual representations of paylines
   */
  createPaylineVisuals(scene, reelSize) {
    const paylineVisuals = [];
    
    this.paylines.forEach((payline, index) => {
      const points = [];
      const color = this.paylineColors[index];
      
      // Calculate points for this payline
      for (let col = 0; col < payline.length; col++) {
        const row = payline[col];
        
        // Calculate center position of this symbol
        const x = (col - 2) * (reelSize.width + 0.1);
        const y = (row - 1) * (reelSize.height + 0.1);
        
        points.push(new THREE.Vector3(x, y, 0.2));
      }
      
      // Create line geometry
      const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
      const lineMaterial = new THREE.LineBasicMaterial({ 
        color, 
        linewidth: 3,
        transparent: true,
        opacity: 0.7
      });
      
      const line = new THREE.Line(lineGeometry, lineMaterial);
      line.visible = false; // Hide initially
      scene.add(line);
      
      paylineVisuals.push(line);
    });
    
    return paylineVisuals;
  }
  
  /**
   * Show winning paylines
   */
  showWinningPaylines(paylineVisuals, winningLines) {
    // Hide all paylines first
    paylineVisuals.forEach(line => {
      line.visible = false;
    });
    
    // Show only winning paylines
    winningLines.forEach(winLine => {
      paylineVisuals[winLine.lineIndex].visible = true;
    });
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
        message += ` ${line.count}x ${line.symbolName} on line ${line.lineIndex + 1}`;
        if (index < winResult.winningLines.length - 1) {
          message += ',';
        }
      });
    }
    
    return message;
  }
} 