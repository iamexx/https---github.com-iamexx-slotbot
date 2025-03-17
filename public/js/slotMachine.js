/**
 * Class to handle the slot machine logic and animations
 */
class SlotMachine {
  constructor() {
    // Create symbol manager
    this.symbolManager = new SymbolManager();
    
    // Create win effects
    this.winEffects = new WinEffects();
    
    // Get DOM elements
    this.reels = [];
    for (let i = 1; i <= CONFIG.reels; i++) {
      this.reels.push(document.getElementById(`reel${i}`));
    }
    
    // Initialize the slot machine
    this.init();
  }
  
  /**
   * Initialize the slot machine
   */
  init() {
    // Generate initial random symbols
    this.grid = this.symbolManager.generateRandomGrid();
    this.updateReels();
  }
  
  /**
   * Update the reels with current grid symbols
   */
  updateReels() {
    for (let row = 0; row < CONFIG.rows; row++) {
      for (let col = 0; col < CONFIG.reels; col++) {
        const index = row * CONFIG.reels + col;
        const symbolName = this.grid[index];
        const emoji = this.symbolManager.getEmoji(symbolName);
        
        // Get the symbol element
        const symbolElement = this.reels[col].children[row];
        if (symbolElement) {
          symbolElement.textContent = emoji;
        }
      }
    }
  }
  
  /**
   * Spin the reels
   */
  async spin() {
    return new Promise(resolve => {
      // Add spinning class to all reels
      this.reels.forEach(reel => {
        reel.classList.add('spinning');
      });
      
      // Generate new symbols for after the spin
      const newGrid = this.symbolManager.generateRandomGrid();
      
      // Stop reels one by one with delay
      let delay = 0;
      this.reels.forEach((reel, index) => {
        delay += CONFIG.reelStaggerDelay;
        
        setTimeout(() => {
          // Stop this reel
          reel.classList.remove('spinning');
          
          // Update symbols for this reel
          for (let row = 0; row < CONFIG.rows; row++) {
            const gridIndex = row * CONFIG.reels + index;
            const symbolName = newGrid[gridIndex];
            const emoji = this.symbolManager.getEmoji(symbolName);
            
            // Get the symbol element
            const symbolElement = reel.children[row];
            if (symbolElement) {
              symbolElement.textContent = emoji;
            }
          }
          
          // Play stop sound
          this.playReelStopSound();
          
          // If this is the last reel, resolve the promise
          if (index === CONFIG.reels - 1) {
            this.grid = newGrid;
            resolve(this.grid);
          }
        }, delay);
      });
    });
  }
  
  /**
   * Play reel stop sound
   */
  playReelStopSound() {
    // This would play a sound if we had audio implemented
    // For now, it's just a placeholder
  }
  
  /**
   * Calculate winnings for the current grid
   */
  calculateWinnings(betAmount) {
    return this.symbolManager.calculateWinnings(this.grid, betAmount);
  }
  
  /**
   * Show winning effects
   */
  showWinningEffects(winResult) {
    if (winResult.winningLines.length > 0) {
      // Draw paylines
      this.winEffects.drawPaylines(winResult.winningLines);
      
      // Show coin shower effect with win amount
      setTimeout(() => {
        this.winEffects.showWinEffect(winResult.winningLines, winResult.totalWinnings);
      }, 1500);
    }
    
    return this.symbolManager.generateWinMessage(winResult);
  }
} 