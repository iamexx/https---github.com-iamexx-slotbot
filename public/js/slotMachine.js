/**
 * Class to handle the 3D slot machine and animations
 */
class SlotMachine {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;
    
    // Create symbol factory
    this.symbolFactory = new SymbolFactory(scene);
    
    // Create payline manager
    this.paylineManager = new PaylineManager();
    
    // Slot machine dimensions
    this.dimensions = {
      width: 6,
      height: 4,
      depth: 1
    };
    
    // Reel dimensions
    this.reelSize = {
      width: 1,
      height: 1,
      depth: 0.5
    };
    
    // Grid to store current symbols
    this.grid = [];
    this.symbolObjects = [];
    
    // Payline visuals
    this.paylineVisuals = [];
    
    // Initialize the slot machine
    this.init();
  }
  
  /**
   * Initialize the slot machine
   */
  init() {
    // Create cabinet
    this.createCabinet();
    
    // Create reels
    this.createReels();
    
    // Create payline visuals
    this.paylineVisuals = this.paylineManager.createPaylineVisuals(this.scene, this.reelSize);
    
    // Generate initial random symbols
    this.generateRandomSymbols();
  }
  
  /**
   * Create the slot machine cabinet
   */
  createCabinet() {
    // Cabinet body
    const cabinetGeometry = new THREE.BoxGeometry(
      this.dimensions.width,
      this.dimensions.height,
      this.dimensions.depth
    );
    
    const cabinetMaterial = new THREE.MeshPhongMaterial({
      color: CONFIG.colors.cabinetBody,
      shininess: 30
    });
    
    this.cabinet = new THREE.Mesh(cabinetGeometry, cabinetMaterial);
    this.scene.add(this.cabinet);
    
    // Cabinet trim
    const trimGeometry = new THREE.BoxGeometry(
      this.dimensions.width + 0.1,
      this.dimensions.height + 0.1,
      this.dimensions.depth + 0.1
    );
    
    const trimMaterial = new THREE.MeshPhongMaterial({
      color: CONFIG.colors.cabinetTrim,
      shininess: 100
    });
    
    const trim = new THREE.Mesh(trimGeometry, trimMaterial);
    trim.position.z = -0.05;
    this.scene.add(trim);
    
    // Title text
    const loader = new THREE.FontLoader();
    
    // Since we can't load custom fonts easily in this environment,
    // we'll create a simple title plate instead
    const titleGeometry = new THREE.BoxGeometry(4, 0.5, 0.1);
    const titleMaterial = new THREE.MeshPhongMaterial({
      color: CONFIG.colors.cabinetTrim,
      shininess: 100
    });
    
    const titlePlate = new THREE.Mesh(titleGeometry, titleMaterial);
    titlePlate.position.set(0, this.dimensions.height / 2 + 0.3, 0.3);
    this.scene.add(titlePlate);
    
    // Add decorative lights
    const lightGeometry = new THREE.SphereGeometry(0.05, 16, 16);
    const lightColors = [0xFF0000, 0x00FF00, 0x0000FF, 0xFFFF00, 0xFF00FF];
    
    for (let i = 0; i < 10; i++) {
      const lightMaterial = new THREE.MeshBasicMaterial({
        color: lightColors[i % lightColors.length],
        emissive: lightColors[i % lightColors.length],
        emissiveIntensity: 0.5
      });
      
      const light = new THREE.Mesh(lightGeometry, lightMaterial);
      const angle = (i / 10) * Math.PI * 2;
      const radius = this.dimensions.width / 2 + 0.2;
      
      light.position.set(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
        0.3
      );
      
      this.scene.add(light);
    }
  }
  
  /**
   * Create the reels
   */
  createReels() {
    // Create reel background
    const reelAreaWidth = this.dimensions.width * 0.8;
    const reelAreaHeight = this.dimensions.height * 0.7;
    
    const reelAreaGeometry = new THREE.BoxGeometry(
      reelAreaWidth,
      reelAreaHeight,
      0.2
    );
    
    const reelAreaMaterial = new THREE.MeshPhongMaterial({
      color: CONFIG.colors.reelBackground,
      shininess: 10
    });
    
    this.reelArea = new THREE.Mesh(reelAreaGeometry, reelAreaMaterial);
    this.reelArea.position.z = 0.1;
    this.scene.add(this.reelArea);
    
    // Create individual reel backgrounds
    this.reels = [];
    
    for (let col = 0; col < CONFIG.reels; col++) {
      const reelGeometry = new THREE.BoxGeometry(
        this.reelSize.width,
        this.reelSize.height * CONFIG.rows,
        this.reelSize.depth
      );
      
      const reelMaterial = new THREE.MeshPhongMaterial({
        color: 0x333333,
        shininess: 30
      });
      
      const reel = new THREE.Mesh(reelGeometry, reelMaterial);
      
      // Position the reel
      reel.position.x = (col - Math.floor(CONFIG.reels / 2)) * (this.reelSize.width + 0.1);
      reel.position.z = 0.15;
      
      this.scene.add(reel);
      this.reels.push(reel);
    }
  }
  
  /**
   * Generate random symbols for the grid
   */
  generateRandomSymbols() {
    // Clear existing symbols
    this.clearSymbols();
    
    // Generate new symbols
    this.grid = [];
    
    for (let row = 0; row < CONFIG.rows; row++) {
      for (let col = 0; col < CONFIG.reels; col++) {
        const symbolName = this.symbolFactory.getRandomSymbolName();
        this.grid.push(symbolName);
        
        // Create and position the symbol
        const symbolObject = this.symbolFactory.createSymbol(symbolName);
        
        // Position the symbol
        symbolObject.position.x = (col - Math.floor(CONFIG.reels / 2)) * (this.reelSize.width + 0.1);
        symbolObject.position.y = (1 - row) * (this.reelSize.height + 0.1);
        symbolObject.position.z = 0.2;
        
        this.scene.add(symbolObject);
        this.symbolObjects.push(symbolObject);
      }
    }
    
    return this.grid;
  }
  
  /**
   * Clear all symbols from the scene
   */
  clearSymbols() {
    this.symbolObjects.forEach(symbol => {
      this.scene.remove(symbol);
    });
    
    this.symbolObjects = [];
  }
  
  /**
   * Spin the reels
   */
  async spin() {
    return new Promise(resolve => {
      // Hide any visible paylines
      this.paylineVisuals.forEach(line => {
        line.visible = false;
      });
      
      // Store original positions for animation
      const originalPositions = this.symbolObjects.map(symbol => ({
        object: symbol,
        position: symbol.position.y
      }));
      
      // Create new symbols for after the spin
      const newGrid = [];
      for (let i = 0; i < CONFIG.rows * CONFIG.reels; i++) {
        newGrid.push(this.symbolFactory.getRandomSymbolName());
      }
      
      // Create timeline for animation
      const timeline = gsap.timeline({
        onComplete: () => {
          // Replace old symbols with new ones
          this.clearSymbols();
          this.grid = newGrid;
          
          // Create and position new symbols
          for (let row = 0; row < CONFIG.rows; row++) {
            for (let col = 0; col < CONFIG.reels; col++) {
              const index = row * CONFIG.reels + col;
              const symbolName = this.grid[index];
              
              // Create and position the symbol
              const symbolObject = this.symbolFactory.createSymbol(symbolName);
              
              // Position the symbol
              symbolObject.position.x = (col - Math.floor(CONFIG.reels / 2)) * (this.reelSize.width + 0.1);
              symbolObject.position.y = (1 - row) * (this.reelSize.height + 0.1);
              symbolObject.position.z = 0.2;
              
              this.scene.add(symbolObject);
              this.symbolObjects.push(symbolObject);
            }
          }
          
          resolve(this.grid);
        }
      });
      
      // Animate each reel with staggered stop times
      for (let col = 0; col < CONFIG.reels; col++) {
        const reelSymbols = originalPositions.filter((item, index) => {
          const symbolCol = index % CONFIG.reels;
          return symbolCol === col;
        });
        
        // Animate each symbol in this reel
        reelSymbols.forEach(item => {
          timeline.to(
            item.object.position,
            {
              y: item.position + 20, // Move far down (out of view)
              duration: CONFIG.spinDuration,
              ease: "power1.in",
              onComplete: () => {
                // Move the symbol back to top (out of view) for continuous effect
                item.object.position.y = item.position + 20;
              }
            },
            0 // Start at the same time
          );
        });
        
        // Add delay for each reel stopping
        timeline.to({}, {
          duration: CONFIG.reelStaggerDelay,
          onComplete: () => {
            // Play reel stop sound here if needed
          }
        }, col * CONFIG.reelStaggerDelay);
      }
    });
  }
  
  /**
   * Calculate winnings for the current grid
   */
  calculateWinnings(betAmount) {
    return this.paylineManager.calculateWinnings(this.grid, betAmount);
  }
  
  /**
   * Show winning paylines
   */
  showWinningPaylines(winResult) {
    this.paylineManager.showWinningPaylines(this.paylineVisuals, winResult.winningLines);
    return this.paylineManager.generateWinMessage(winResult);
  }
} 