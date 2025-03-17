/**
 * Class representing a single reel in the slot machine
 */
class Reel {
  constructor(index) {
    this.index = index;
    this.element = document.getElementById(`reel${index + 1}`);
    this.symbols = [];
    this.visibleSymbols = [];
    
    // Initialize with random symbols
    this.initSymbols();
    
    console.log(`Reel ${index + 1} initialized`);
  }
  
  /**
   * Initialize reel with random symbols
   */
  initSymbols() {
    // Clear existing symbols
    this.element.innerHTML = '';
    this.symbols = [];
    
    // Create symbols based on configuration
    for (let i = 0; i < CONFIG.reels.symbolsPerReel; i++) {
      const symbol = this.getRandomSymbol();
      this.symbols.push(symbol);
      
      const symbolElement = document.createElement('div');
      symbolElement.className = 'symbol';
      symbolElement.textContent = SYMBOLS_CONFIG[symbol].emoji;
      this.element.appendChild(symbolElement);
    }
    
    // Set initial visible symbols
    this.updateVisibleSymbols();
  }
  
  /**
   * Get a random symbol based on weights
   */
  getRandomSymbol() {
    const totalWeight = Object.values(SYMBOLS_CONFIG).reduce((sum, config) => sum + config.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const symbol in SYMBOLS_CONFIG) {
      random -= SYMBOLS_CONFIG[symbol].weight;
      if (random <= 0) {
        return symbol;
      }
    }
    
    // Fallback
    return Object.keys(SYMBOLS_CONFIG)[0];
  }
  
  /**
   * Update the array of currently visible symbols
   */
  updateVisibleSymbols() {
    this.visibleSymbols = [];
    
    // Get the 3 visible symbols (default configuration)
    for (let i = 0; i < CONFIG.reels.visibleSymbols; i++) {
      this.visibleSymbols.push(this.symbols[i]);
    }
  }
  
  /**
   * Get the currently visible symbols
   */
  getVisibleSymbols() {
    return this.visibleSymbols;
  }
  
  /**
   * Spin the reel
   */
  spin() {
    return new Promise(resolve => {
      // Add spinning class
      this.element.classList.add('spinning');
      
      // Determine spin duration based on reel index
      const duration = CONFIG.reels.spinDuration + (this.index * CONFIG.reels.spinDurationIncrement);
      
      // Generate new symbols
      const newSymbols = [];
      for (let i = 0; i < CONFIG.reels.symbolsPerReel; i++) {
        newSymbols.push(this.getRandomSymbol());
      }
      
      // Stop spinning after duration
      setTimeout(() => {
        // Remove spinning class
        this.element.classList.remove('spinning');
        
        // Update symbols
        this.symbols = newSymbols;
        
        // Update DOM
        const symbolElements = this.element.querySelectorAll('.symbol');
        symbolElements.forEach((element, index) => {
          element.textContent = SYMBOLS_CONFIG[this.symbols[index]].emoji;
        });
        
        // Update visible symbols
        this.updateVisibleSymbols();
        
        // Resolve promise
        resolve();
      }, duration);
    });
  }
} 