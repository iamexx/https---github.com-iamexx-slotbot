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
    this.autoSpinCheckbox = document.getElementById('auto-spin');
    this.isSpinning = false;
    this.currentWinningPositions = []; // Store current winning positions
    
    // Set game title
    document.querySelector('.slot-header h1').textContent = CONFIG.gameName;
    
    // Initialize reels
    for (let i = 0; i < CONFIG.reels.count; i++) {
      this.reels.push(new Reel(i));
    }
    
    // Set initial balance
    this.updateBalance(CONFIG.initialBalance);
    
    // Add event listeners
    this.spinButton.addEventListener('click', () => this.spin());
    
    // Add bet controls
    document.getElementById('bet-minus').addEventListener('click', () => {
      this.adjustBet(-CONFIG.betStep);
      playSound('button');
    });
    document.getElementById('bet-plus').addEventListener('click', () => {
      this.adjustBet(CONFIG.betStep);
      playSound('button');
    });
    
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
   * Highlight winning symbols
   */
  highlightWinningSymbols(winningLines) {
    // Clear any previous highlights
    this.clearHighlights();
    
    // Store current winning positions
    this.currentWinningPositions = [];
    
    // Highlight all winning symbols
    winningLines.forEach(line => {
      line.positions.forEach(pos => {
        const element = document.querySelector(`#reel${pos.col + 1} .symbol:nth-child(${pos.row + 1})`);
        if (element) {
          element.classList.add('highlight');
          this.currentWinningPositions.push({
            col: pos.col,
            row: pos.row
          });
        }
      });
    });
  }
  
  /**
   * Clear all highlighted symbols
   */
  clearHighlights() {
    document.querySelectorAll('.symbol.highlight').forEach(el => {
      el.classList.remove('highlight');
    });
    this.currentWinningPositions = [];
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
    
    // Clear any previous highlights
    this.clearHighlights();
    
    // Play spin sound
    playSound('spin');
    
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
          reel.spin().then(() => {
            // Play reel stop sound
            playSound('reelStop');
            resolve();
          });
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
      
      // Update balance and show win effects
      if (winResult.totalWinnings > 0) {
        const newBalance = parseInt(this.balance.textContent) + winResult.totalWinnings;
        this.updateBalance(newBalance);
        
        // Play win sound - big win for large amounts
        if (winResult.totalWinnings >= bet * 10) {
          playSound('bigWin');
        } else {
          playSound('win');
        }
        
        // Show win effects
        this.showWinningEffects(winResult);
        
        // Highlight winning symbols
        this.highlightWinningSymbols(winResult.winningLines);
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
    
    // Check for scatter wins (STAR symbol)
    const scatterPositions = [];
    let scatterCount = 0;
    
    // Count scatter symbols across the entire grid
    for (let col = 0; col < reelSymbols.length; col++) {
      for (let row = 0; row < reelSymbols[col].length; row++) {
        if (reelSymbols[col][row] === SYMBOLS.STAR) {
          scatterCount++;
          scatterPositions.push({ row, col });
        }
      }
    }
    
    // Calculate scatter win if 3 or more stars
    if (scatterCount >= 3) {
      const payoutIndex = scatterCount - 3;
      const payout = SYMBOLS_CONFIG[SYMBOLS.STAR].payouts[payoutIndex] || 0;
      const win = payout * bet;
      
      if (win > 0) {
        result.totalWinnings += win;
        result.winningLines.push({
          symbol: SYMBOLS.STAR,
          count: scatterCount,
          winAmount: payout,
          positions: scatterPositions,
          lineIndex: -1, // Special index for scatter
          isScatter: true
        });
        
        console.log(`Scatter win: ${scatterCount}x ${SYMBOLS.STAR} - ${win} credits`);
      }
    }
    
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
      if (lineSymbols[i] === firstSymbol) {
        count++;
        result.positions.push(positions[i]);
      } else {
        break;
      }
    }
    
    // Check if we have a win
    if (count >= 3 || (count === 2 && firstSymbol === SYMBOLS.CHERRY && SYMBOLS_CONFIG[SYMBOLS.CHERRY].paysTwoOfAKind)) {
      const symbolConfig = SYMBOLS_CONFIG[firstSymbol];
      let payoutIndex;
      
      if (count === 2 && firstSymbol === SYMBOLS.CHERRY) {
        // Special case for 2 cherries
        payoutIndex = -1; // Special index for 2 of a kind
        result.winAmount = 5; // Fixed payout for 2 cherries
      } else {
        // Normal case for 3, 4, or 5 of a kind
        payoutIndex = count - 3;
        result.winAmount = symbolConfig.payouts[payoutIndex] || 0;
      }
      
      result.symbol = firstSymbol;
      result.count = count;
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