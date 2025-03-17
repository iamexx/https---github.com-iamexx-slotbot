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
    this.spinButton = document.getElementById('spin-button');
    this.betAmount = document.getElementById('bet-amount');
    this.balance = document.getElementById('balance');
    this.winAmount = document.getElementById('win-amount');
    this.autoSpinCheckbox = document.getElementById('auto-spin');
    this.isSpinning = false;
    
    // Initialize reels
    for (let i = 0; i < CONFIG.reels.count; i++) {
      this.reels.push(new Reel(i));
    }
    
    // Set initial balance
    this.updateBalance(CONFIG.initialBalance);
    
    // Add event listeners
    this.spinButton.addEventListener('click', () => this.spin());
    
    // Add bet controls
    document.getElementById('bet-minus').addEventListener('click', () => this.adjustBet(-CONFIG.betStep));
    document.getElementById('bet-plus').addEventListener('click', () => this.adjustBet(CONFIG.betStep));
    
    console.log('Slot machine initialized');
  }
  
  /**
   * Adjust bet amount
   */
  adjustBet(amount) {
    console.log(`Adjusting bet by ${amount}`);
    const currentBet = parseInt(this.betAmount.textContent);
    const newBet = Math.max(CONFIG.minBet, Math.min(CONFIG.maxBet, currentBet + amount));
    this.betAmount.textContent = newBet;
  }
  
  /**
   * Update balance display
   */
  updateBalance(amount) {
    this.balance.textContent = amount;
  }
  
  /**
   * Update win amount display
   */
  updateWinAmount(amount) {
    this.winAmount.textContent = amount;
    
    // Add animation class if there's a win
    if (amount > 0) {
      this.winAmount.classList.add('win-highlight');
      setTimeout(() => {
        this.winAmount.classList.remove('win-highlight');
      }, 2000);
    }
  }
  
  /**
   * Spin the reels
   */
  spin() {
    if (this.isSpinning) {
      console.log('Already spinning, ignoring spin request');
      return;
    }
    
    console.log('Spinning reels...');
    
    // Clear previous win display
    this.updateWinAmount(0);
    
    // Get bet amount
    const bet = parseInt(this.betAmount.textContent);
    
    // Check if player has enough balance
    const currentBalance = parseInt(this.balance.textContent);
    if (currentBalance < bet) {
      alert('Not enough balance!');
      return;
    }
    
    // Deduct bet from balance
    this.updateBalance(currentBalance - bet);
    
    // Start spinning
    this.isSpinning = true;
    this.spinButton.disabled = true;
    
    // Spin each reel with a delay
    const spinPromises = [];
    
    this.reels.forEach((reel, index) => {
      const promise = new Promise(resolve => {
        setTimeout(() => {
          reel.spin().then(resolve);
        }, index * CONFIG.reels.spinStartDelay);
      });
      spinPromises.push(promise);
    });
    
    // When all reels have stopped
    Promise.all(spinPromises).then(() => {
      this.isSpinning = false;
      this.spinButton.disabled = false;
      
      // Check for wins
      const winResult = this.checkWins(bet);
      
      // Update balance and win display
      if (winResult.totalWinnings > 0) {
        const newBalance = parseInt(this.balance.textContent) + winResult.totalWinnings;
        this.updateBalance(newBalance);
        this.updateWinAmount(winResult.totalWinnings);
        
        // Show win effects
        this.showWinningEffects(winResult);
      }
      
      // Auto spin if enabled
      if (this.autoSpinCheckbox.checked) {
        setTimeout(() => this.spin(), CONFIG.autoSpinDelay);
      }
    });
  }
  
  /**
   * Check for winning combinations
   */
  checkWins(bet) {
    const result = {
      winningLines: [],
      totalWinnings: 0
    };
    
    // Get current symbols on each reel
    const reelSymbols = this.reels.map(reel => reel.getVisibleSymbols());
    
    // Check each payline
    CONFIG.paylines.forEach((payline, lineIndex) => {
      const lineSymbols = [];
      const positions = [];
      
      // Get symbols on this payline
      payline.forEach((row, col) => {
        lineSymbols.push(reelSymbols[col][row]);
        positions.push({ row, col });
      });
      
      // Check for winning combinations
      const winInfo = this.getWinningInfo(lineSymbols, positions, lineIndex);
      
      if (winInfo.winAmount > 0) {
        // Calculate win amount based on bet
        const lineWin = winInfo.winAmount * bet;
        result.totalWinnings += lineWin;
        result.winningLines.push(winInfo);
        
        console.log(`Win on line ${lineIndex + 1}: ${winInfo.count}x ${winInfo.symbol} - ${lineWin} credits`);
      }
    });
    
    return result;
  }
  
  /**
   * Get winning information for a line
   */
  getWinningInfo(lineSymbols, positions, lineIndex) {
    const result = {
      symbol: null,
      count: 0,
      winAmount: 0,
      positions: [],
      lineIndex
    };
    
    // Count consecutive symbols from left to right
    const firstSymbol = lineSymbols[0];
    let count = 0;
    
    for (let i = 0; i < lineSymbols.length; i++) {
      if (lineSymbols[i] === firstSymbol || lineSymbols[i] === SYMBOLS.WILD) {
        count++;
        result.positions.push(positions[i]);
      } else {
        break;
      }
    }
    
    // Check if we have a win
    if (count >= 3) {
      const symbolToCheck = firstSymbol === SYMBOLS.WILD ? lineSymbols[1] : firstSymbol;
      const payouts = SYMBOLS_CONFIG[symbolToCheck]?.payouts || [];
      
      // Get payout for this number of symbols
      const payoutIndex = count - 3;
      if (payoutIndex >= 0 && payoutIndex < payouts.length) {
        result.symbol = symbolToCheck;
        result.count = count;
        result.winAmount = payouts[payoutIndex];
      }
    }
    
    return result;
  }
  
  /**
   * Show winning effects
   */
  showWinningEffects(winResult) {
    // Highlight winning lines
    this.winEffects.drawPaylines(winResult.winningLines);
    
    // Show coin shower effect with win amount
    console.log(`Showing win effects for amount: ${winResult.totalWinnings}`);
    this.winEffects.showWinEffect(winResult.winningLines, winResult.totalWinnings);
  }
} 