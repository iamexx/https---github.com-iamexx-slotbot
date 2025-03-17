/**
 * Class to handle win effects using canvas
 */
class WinEffects {
  constructor() {
    this.canvas = document.getElementById('win-effect-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.coins = [];
    this.fireParticles = [];
    this.isAnimating = false;
    this.lightBeam = null;
    
    // Preload coin image
    this.coinImage = new Image();
    this.coinImage.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA2NCI+PGNpcmNsZSBjeD0iMzIiIGN5PSIzMiIgcj0iMzAiIGZpbGw9IiNmZmQzMDAiIHN0cm9rZT0iI2RhYTUyMCIgc3Ryb2tlLXdpZHRoPSIyIi8+PGNpcmNsZSBjeD0iMzIiIGN5PSIzMiIgcj0iMjUiIGZpbGw9IiNmZmQzMDAiIHN0cm9rZT0iI2RhYTUyMCIgc3Ryb2tlLXdpZHRoPSIxIi8+PGVsbGlwc2UgY3g9IjIzIiBjeT0iMjAiIHJ4PSI4IiByeT0iNiIgZmlsbD0iI2ZmZjVhMCIgb3BhY2l0eT0iMC43Ii8+PC9zdmc+';
    
    // Resize canvas to match window size
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
    
    // Debug
    console.log('WinEffects initialized, canvas size:', this.canvas.width, 'x', this.canvas.height);
  }
  
  /**
   * Resize canvas to match window size
   */
  resizeCanvas() {
    const gameContainer = document.querySelector('.game-container');
    if (gameContainer) {
      // Make canvas cover the entire viewport
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
      
      // Ensure canvas is positioned correctly
      this.canvas.style.position = 'fixed';
      this.canvas.style.top = '0';
      this.canvas.style.left = '0';
      this.canvas.style.zIndex = '1000'; // Make sure it's above other elements
      this.canvas.style.pointerEvents = 'none'; // Allow clicks to pass through
    }
  }
  
  /**
   * Create light beam effect
   */
  createLightBeam() {
    const centerX = this.canvas.width / 2;
    
    return {
      x: centerX,
      y: 0,
      width: this.canvas.width * 0.8, // Very wide beam
      height: this.canvas.height * 1.5, // Taller than screen
      opacity: 0.8,
      fadeSpeed: 0.003
    };
  }
  
  /**
   * Create gold coins for win effect
   */
  createCoins(winAmount) {
    this.coins = [];
    
    // Scale coin count based on win amount (more coins for bigger wins)
    const baseCount = 50; // Increased base count
    const maxCount = 300; // Increased max count
    const coinCount = Math.min(baseCount + Math.floor(winAmount / 5), maxCount);
    
    console.log(`Creating ${coinCount} coins for win amount ${winAmount}`);
    
    // Create light beam
    this.lightBeam = this.createLightBeam();
    
    // Create coins across the entire screen
    for (let i = 0; i < coinCount; i++) {
      // Randomize starting position across the entire screen
      const xPos = Math.random() * this.canvas.width;
      const yPos = -Math.random() * 100 - 50; // Start above the screen
      
      // Create coin with physics properties
      this.coins.push({
        x: xPos,
        y: yPos,
        size: Math.random() * 15 + 20, // Larger coins (20-35px)
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
        speedX: (Math.random() - 0.5) * 8, // More horizontal movement
        speedY: Math.random() * 2 + 5, // Faster initial downward velocity
        gravity: 0.2,
        friction: 0.98,
        bounceCount: 0,
        maxBounces: Math.floor(Math.random() * 3) + 1,
        opacity: 0.9, // Higher opacity
        settled: false,
        glint: {
          active: Math.random() > 0.3, // Most coins have glint
          x: Math.random(),
          y: Math.random(),
          size: Math.random() * 6 + 3, // Larger glint
          angle: 0,
          speed: Math.random() * 0.1 + 0.05
        }
      });
    }
  }
  
  /**
   * Create fire trail between winning symbols
   */
  createFireTrail(positions) {
    // Get positions of symbols on this payline
    const points = [];
    
    positions.forEach(pos => {
      const element = document.querySelector(`#reel${pos.col + 1} .symbol:nth-child(${pos.row + 1})`);
      if (!element) return;
      
      const rect = element.getBoundingClientRect();
      points.push({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      });
    });
    
    if (points.length < 2) return;
    
    console.log(`Creating fire trail between ${points.length} points`);
    
    // Create fire particles along the path between points
    for (let i = 0; i < points.length - 1; i++) {
      const start = points[i];
      const end = points[i + 1];
      
      // Calculate distance between points
      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Create particles along the line
      const particlesPerLine = Math.ceil(distance / 3); // One particle every 3px
      
      for (let j = 0; j < particlesPerLine; j++) {
        const ratio = j / particlesPerLine;
        const x = start.x + dx * ratio;
        const y = start.y + dy * ratio;
        
        // Add some randomness to position
        const offsetX = (Math.random() - 0.5) * 15;
        const offsetY = (Math.random() - 0.5) * 15;
        
        this.fireParticles.push({
          x: x + offsetX,
          y: y + offsetY,
          size: Math.random() * 12 + 8, // Larger fire particles
          speedX: (Math.random() - 0.5) * 3,
          speedY: (Math.random() - 0.5) * 3 - 1, // Slight upward bias
          life: 1.0,
          decay: Math.random() * 0.01 + 0.005, // Slower decay
          color: this.getFireColor(Math.random())
        });
      }
    }
  }
  
  /**
   * Get fire color based on temperature (0-1)
   */
  getFireColor(temp) {
    if (temp < 0.2) {
      return '#FF3300'; // Orange-red
    } else if (temp < 0.4) {
      return '#FF6600'; // Orange
    } else if (temp < 0.6) {
      return '#FFAA00'; // Yellow-orange
    } else if (temp < 0.8) {
      return '#FFDD00'; // Yellow
    } else {
      return '#FFFFFF'; // White-hot center
    }
  }
  
  /**
   * Show win effect for winning lines
   */
  showWinEffect(winningLines, winAmount) {
    if (this.isAnimating) return;
    
    if (winningLines.length === 0) {
      console.log('No winning lines to show effect for');
      return;
    }
    
    console.log(`Showing win effect for ${winningLines.length} lines, win amount: ${winAmount}`);
    
    this.isAnimating = true;
    this.fireParticles = []; // Clear any existing fire particles
    
    // Make canvas visible
    this.canvas.style.display = 'block';
    
    // Highlight winning symbols
    winningLines.forEach(line => {
      line.positions.forEach(pos => {
        const element = document.querySelector(`#reel${pos.col + 1} .symbol:nth-child(${pos.row + 1})`);
        if (element) {
          element.classList.add('highlight');
        }
      });
    });
    
    // Create fire trails for all winning lines
    winningLines.forEach(line => {
      this.createFireTrail(line.positions);
    });
    
    // Create coins for the explosion
    this.createCoins(winAmount);
    
    // Start animation
    this.animate();
    
    // Set timeout to remove highlights
    setTimeout(() => {
      document.querySelectorAll('.symbol.highlight').forEach(el => {
        el.classList.remove('highlight');
      });
    }, CONFIG.winEffects.duration);
  }
  
  /**
   * Animate coins and effects
   */
  animate() {
    if (!this.isAnimating) return;
    
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw light beam if active
    if (this.lightBeam && this.lightBeam.opacity > 0) {
      this.drawLightBeam();
      this.lightBeam.opacity -= this.lightBeam.fadeSpeed;
    }
    
    // Update and draw fire particles
    let activeFireParticles = false;
    for (let i = 0; i < this.fireParticles.length; i++) {
      const particle = this.fireParticles[i];
      
      // Update life
      particle.life -= particle.decay;
      
      if (particle.life <= 0) continue;
      
      activeFireParticles = true;
      
      // Update position
      particle.x += particle.speedX;
      particle.y += particle.speedY;
      
      // Draw fire particle
      this.drawFireParticle(particle);
    }
    
    // Update and draw coins
    let activeCoins = false;
    
    for (let i = 0; i < this.coins.length; i++) {
      const coin = this.coins[i];
      
      if (!coin.settled) {
        activeCoins = true;
        
        // Apply gravity
        coin.speedY += coin.gravity;
        
        // Update position
        coin.x += coin.speedX;
        coin.speedX *= coin.friction;
        coin.y += coin.speedY;
        
        // Update rotation
        coin.rotation += coin.rotationSpeed;
        
        // Check for bottom boundary (floor)
        const floor = this.canvas.height - 20;
        if (coin.y + coin.size/2 > floor && coin.speedY > 0) {
          if (coin.bounceCount < coin.maxBounces) {
            // Bounce with energy loss
            coin.speedY = -coin.speedY * 0.6;
            coin.bounceCount++;
          } else {
            // Settle coin
            coin.y = floor - coin.size/2;
            coin.speedY = 0;
            coin.speedX = 0;
            coin.rotationSpeed = 0;
            coin.settled = true;
          }
        }
        
        // Check for side boundaries
        if (coin.x - coin.size/2 < 0 || coin.x + coin.size/2 > this.canvas.width) {
          coin.speedX = -coin.speedX * 0.8;
        }
      }
      
      // Update glint effect
      if (coin.glint.active) {
        coin.glint.angle += coin.glint.speed;
      }
      
      // Draw the coin
      this.drawCoin(coin);
    }
    
    // Continue animation if effects are still active
    if (activeCoins || activeFireParticles || (this.lightBeam && this.lightBeam.opacity > 0)) {
      requestAnimationFrame(() => this.animate());
    } else {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.isAnimating = false;
      this.canvas.style.display = 'none';
    }
  }
  
  /**
   * Draw a fire particle
   */
  drawFireParticle(particle) {
    const size = particle.size * particle.life; // Shrink as life decreases
    
    // Create radial gradient for fire effect
    const gradient = this.ctx.createRadialGradient(
      particle.x, particle.y, 0,
      particle.x, particle.y, size
    );
    
    gradient.addColorStop(0, particle.color);
    gradient.addColorStop(0.6, particle.color + 'AA'); // More opaque
    gradient.addColorStop(1, 'rgba(255, 0, 0, 0)'); // Transparent edge
    
    this.ctx.globalCompositeOperation = 'lighter';
    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.globalCompositeOperation = 'source-over';
  }
  
  /**
   * Draw a single coin
   */
  drawCoin(coin) {
    this.ctx.save();
    this.ctx.translate(coin.x, coin.y);
    this.ctx.rotate(coin.rotation);
    this.ctx.globalAlpha = coin.opacity;
    
    // Draw coin image if loaded, otherwise draw a circle
    if (this.coinImage.complete) {
      this.ctx.drawImage(
        this.coinImage, 
        -coin.size/2, 
        -coin.size/2, 
        coin.size, 
        coin.size
      );
    } else {
      // Fallback to drawing a circle
      this.ctx.beginPath();
      this.ctx.arc(0, 0, coin.size/2, 0, Math.PI * 2);
      this.ctx.fillStyle = '#FFD700';
      this.ctx.fill();
      this.ctx.strokeStyle = '#DAA520';
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
    }
    
    // Draw glint effect
    if (coin.glint.active) {
      const glintX = (coin.glint.x - 0.5) * coin.size * 0.8;
      const glintY = (coin.glint.y - 0.5) * coin.size * 0.8;
      
      const gradient = this.ctx.createRadialGradient(
        glintX, glintY, 0,
        glintX, glintY, coin.glint.size
      );
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      
      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      this.ctx.arc(glintX, glintY, coin.glint.size, 0, Math.PI * 2);
      this.ctx.fill();
    }
    
    this.ctx.restore();
  }
  
  /**
   * Draw light beam effect
   */
  drawLightBeam() {
    const beam = this.lightBeam;
    
    // Create gradient for light beam
    const gradient = this.ctx.createRadialGradient(
      beam.x, 0, 0,
      beam.x, 0, beam.width/2
    );
    gradient.addColorStop(0, `rgba(255, 215, 0, ${beam.opacity})`);
    gradient.addColorStop(0.7, `rgba(255, 215, 0, ${beam.opacity * 0.3})`);
    gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
    
    // Draw beam
    this.ctx.save();
    this.ctx.globalCompositeOperation = 'lighter';
    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.moveTo(beam.x - beam.width/2, 0);
    this.ctx.lineTo(beam.x + beam.width/2, 0);
    this.ctx.lineTo(beam.x + beam.width/4, beam.height);
    this.ctx.lineTo(beam.x - beam.width/4, beam.height);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.restore();
  }
  
  /**
   * Draw paylines with fire trails
   */
  drawPaylines(winningLines) {
    if (winningLines.length === 0) return;
    
    console.log('Drawing paylines with fire trails');
    
    // Clear existing fire particles
    this.fireParticles = [];
    
    // Create fire trails for all winning lines
    winningLines.forEach(line => {
      this.createFireTrail(line.positions);
    });
    
    // Start animation if not already running
    if (!this.isAnimating) {
      this.isAnimating = true;
      this.animate();
    }
  }
} 