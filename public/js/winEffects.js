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
    this.winAmountElement = null;
    
    // Preload coin image
    this.coinImage = new Image();
    this.coinImage.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA2NCI+PGNpcmNsZSBjeD0iMzIiIGN5PSIzMiIgcj0iMzAiIGZpbGw9IiNmZmQzMDAiIHN0cm9rZT0iI2RhYTUyMCIgc3Ryb2tlLXdpZHRoPSIyIi8+PGNpcmNsZSBjeD0iMzIiIGN5PSIzMiIgcj0iMjUiIGZpbGw9IiNmZmQzMDAiIHN0cm9rZT0iI2RhYTUyMCIgc3Ryb2tlLXdpZHRoPSIxIi8+PGVsbGlwc2UgY3g9IjIzIiBjeT0iMjAiIHJ4PSI4IiByeT0iNiIgZmlsbD0iI2ZmZjVhMCIgb3BhY2l0eT0iMC43Ii8+PC9zdmc+';
    
    // Make sure canvas is visible
    this.canvas.style.display = 'block';
    
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
    // Make canvas cover the entire viewport
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    
    // Ensure canvas is positioned correctly
    this.canvas.style.position = 'fixed';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.zIndex = '1000'; // Make sure it's above other elements
    this.canvas.style.pointerEvents = 'none'; // Allow clicks to pass through
    this.canvas.style.display = 'block'; // Ensure it's visible
    
    console.log('Canvas resized to:', this.canvas.width, 'x', this.canvas.height);
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
        opacity: 0.9, // Higher opacity
        fadeSpeed: Math.random() * 0.01 + 0.005, // Random fade speed
        fadeDelay: Math.random() * 3000 + 1000, // Random delay before fading
        fadeStartTime: 0, // Will be set when the coin starts fading
        isFading: false,
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
   * Show winning amount display
   */
  showWinningAmount(amount, winningLines) {
    // Remove any existing winning amount display
    if (this.winAmountElement) {
      document.body.removeChild(this.winAmountElement);
    }
    
    // Create winning amount element
    this.winAmountElement = document.createElement('div');
    this.winAmountElement.className = 'winning-amount';
    this.winAmountElement.textContent = `+${amount}`;
    
    // Get position of a winning symbol to start the animation from
    let startPosition = { x: this.canvas.width / 2, y: this.canvas.height / 2 };
    
    if (winningLines && winningLines.length > 0) {
      // Get the first winning line
      const winLine = winningLines[0];
      
      // Get a random position from the winning line (preferably the middle one)
      let targetPos;
      if (winLine.positions.length >= 3) {
        // Use the middle position if available
        targetPos = winLine.positions[Math.floor(winLine.positions.length / 2)];
      } else if (winLine.positions.length > 0) {
        // Otherwise use the first position
        targetPos = winLine.positions[0];
      }
      
      if (targetPos) {
        const element = document.querySelector(`#reel${targetPos.col + 1} .symbol:nth-child(${targetPos.row + 1})`);
        if (element) {
          const rect = element.getBoundingClientRect();
          startPosition = {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2
          };
        }
      }
    }
    
    // Position the element at the winning symbol
    this.winAmountElement.style.left = `${startPosition.x}px`;
    this.winAmountElement.style.top = `${startPosition.y}px`;
    this.winAmountElement.style.transform = 'translate(-50%, -50%)';
    
    // Add to document
    document.body.appendChild(this.winAmountElement);
    
    // Remove element after animation completes
    setTimeout(() => {
      if (this.winAmountElement && this.winAmountElement.parentNode) {
        document.body.removeChild(this.winAmountElement);
        this.winAmountElement = null;
      }
    }, 3000);
  }
  
  /**
   * Create fire trail between winning symbols
   */
  createFireTrail(positions, isScatter = false) {
    // Get positions of symbols on this payline
    const points = [];
    
    positions.forEach(pos => {
      const element = document.querySelector(`#reel${pos.col + 1} .symbol:nth-child(${pos.row + 1})`);
      if (!element) {
        console.warn(`Could not find element for position: reel${pos.col + 1}, symbol ${pos.row + 1}`);
        return;
      }
      
      const rect = element.getBoundingClientRect();
      points.push({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      });
    });
    
    if (points.length < 2 && !isScatter) {
      console.warn('Not enough points to create fire trail');
      return;
    }
    
    if (isScatter) {
      // For scatter wins, create fire bursts at each scatter symbol
      points.forEach(point => {
        this.createFireBurst(point.x, point.y);
      });
    } else {
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
  }
  
  /**
   * Create a burst of fire particles at a specific point
   */
  createFireBurst(x, y) {
    const particleCount = 30;
    
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3 + 1;
      
      this.fireParticles.push({
        x: x,
        y: y,
        size: Math.random() * 15 + 10, // Larger fire particles for scatter
        speedX: Math.cos(angle) * speed,
        speedY: Math.sin(angle) * speed - 1, // Slight upward bias
        life: 1.0,
        decay: Math.random() * 0.01 + 0.005,
        color: this.getFireColor(Math.random())
      });
    }
  }
  
  /**
   * Get fire color based on random value
   */
  getFireColor(value) {
    if (value < 0.2) {
      return '#FF5500'; // Orange-red
    } else if (value < 0.4) {
      return '#FF8800'; // Orange
    } else if (value < 0.6) {
      return '#FFAA00'; // Yellow-orange
    } else if (value < 0.8) {
      return '#FFCC00'; // Yellow
    } else {
      return '#FFFFFF'; // White (hottest)
    }
  }
  
  /**
   * Show win effect with coins
   */
  showWinEffect(winningLines, winAmount) {
    console.log('Showing win effect for amount:', winAmount);
    
    // Make sure canvas is visible
    this.canvas.style.display = 'block';
    
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Create coins based on win amount
    this.createCoins(winAmount);
    
    // Show winning amount
    this.showWinningAmount(winAmount, winningLines);
    
    // Play win sound
    playSound('win');
    
    // Start animation if not already running
    if (!this.isAnimating) {
      this.isAnimating = true;
      this.animate();
    }
  }
  
  /**
   * Animate all effects
   */
  animate() {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw light beam if active
    if (this.lightBeam) {
      // Fade out light beam
      this.lightBeam.opacity -= this.lightBeam.fadeSpeed;
      
      if (this.lightBeam.opacity > 0) {
        this.drawLightBeam();
      } else {
        this.lightBeam = null;
      }
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
    const currentTime = Date.now();
    
    for (let i = 0; i < this.coins.length; i++) {
      const coin = this.coins[i];
      
      if (coin.opacity > 0) {
        activeCoins = true;
        
        // Apply gravity
        coin.speedY += coin.gravity;
        
        // Update position
        coin.x += coin.speedX;
        coin.speedX *= coin.friction;
        coin.y += coin.speedY;
        
        // Update rotation
        coin.rotation += coin.rotationSpeed;
        
        // Check if coin should start fading
        if (!coin.isFading && coin.y > this.canvas.height * 0.7) {
          coin.isFading = true;
          coin.fadeStartTime = currentTime;
        }
        
        // Apply fading if needed
        if (coin.isFading) {
          const fadeElapsed = currentTime - coin.fadeStartTime;
          if (fadeElapsed > 0) {
            coin.opacity -= coin.fadeSpeed;
          }
        }
        
        // Check for side boundaries
        if (coin.x - coin.size/2 < 0 || coin.x + coin.size/2 > this.canvas.width) {
          coin.speedX = -coin.speedX * 0.8;
        }
        
        // Update glint effect
        if (coin.glint.active) {
          coin.glint.angle += coin.glint.speed;
        }
        
        // Draw the coin
        this.drawCoin(coin);
      }
    }
    
    // Continue animation if effects are still active
    if (activeCoins || activeFireParticles || (this.lightBeam && this.lightBeam.opacity > 0)) {
      requestAnimationFrame(() => this.animate());
    } else {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.isAnimating = false;
      console.log('Animation finished');
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
    
    // Make sure canvas is visible
    this.canvas.style.display = 'block';
    
    // Clear existing fire particles
    this.fireParticles = [];
    
    // Create fire trails for all winning lines
    winningLines.forEach(line => {
      this.createFireTrail(line.positions, line.isScatter);
    });
    
    // Start animation if not already running
    if (!this.isAnimating) {
      this.isAnimating = true;
      this.animate();
    }
  }
} 