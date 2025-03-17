/**
 * Class to handle win effects using canvas
 */
class WinEffects {
  constructor() {
    this.canvas = document.getElementById('win-effect-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.isAnimating = false;
    
    // Resize canvas to match window size
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
  }
  
  /**
   * Resize canvas to match window size
   */
  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }
  
  /**
   * Create particles for win effect
   */
  createParticles(positions) {
    this.particles = [];
    
    // Get positions of winning symbols
    positions.forEach(pos => {
      const element = document.querySelector(`#reel${pos.col + 1} .symbol:nth-child(${pos.row + 1})`);
      if (!element) return;
      
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      // Create particles for this position
      for (let i = 0; i < CONFIG.winEffects.particleCount / positions.length; i++) {
        this.particles.push({
          x: centerX,
          y: centerY,
          size: Math.random() * 5 + 2,
          color: CONFIG.winEffects.particleColors[Math.floor(Math.random() * CONFIG.winEffects.particleColors.length)],
          speedX: (Math.random() - 0.5) * 8,
          speedY: (Math.random() - 0.5) * 8,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.2,
          opacity: 1
        });
      }
    });
  }
  
  /**
   * Show win effect for winning lines
   */
  showWinEffect(winningLines) {
    if (this.isAnimating || winningLines.length === 0) return;
    
    this.isAnimating = true;
    
    // Highlight winning symbols
    winningLines.forEach(line => {
      line.positions.forEach(pos => {
        const element = document.querySelector(`#reel${pos.col + 1} .symbol:nth-child(${pos.row + 1})`);
        if (element) {
          element.classList.add('highlight');
        }
      });
    });
    
    // Create particles for all winning positions
    const allPositions = winningLines.flatMap(line => line.positions);
    this.createParticles(allPositions);
    
    // Start animation
    this.animate();
    
    // Set timeout to remove highlights
    setTimeout(() => {
      document.querySelectorAll('.symbol.highlight').forEach(el => {
        el.classList.remove('highlight');
      });
      this.isAnimating = false;
    }, CONFIG.winEffects.duration);
  }
  
  /**
   * Animate particles
   */
  animate() {
    if (!this.isAnimating) return;
    
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Update and draw particles
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      
      // Update position
      p.x += p.speedX;
      p.y += p.speedY;
      
      // Update rotation
      p.rotation += p.rotationSpeed;
      
      // Update opacity (fade out)
      p.opacity -= 0.01;
      
      // Skip if particle is no longer visible
      if (p.opacity <= 0) continue;
      
      // Draw particle
      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate(p.rotation);
      this.ctx.globalAlpha = p.opacity;
      this.ctx.fillStyle = p.color;
      
      // Draw star shape
      this.ctx.beginPath();
      for (let j = 0; j < 5; j++) {
        const angle = (j * Math.PI * 2) / 5 - Math.PI / 2;
        const x = Math.cos(angle) * p.size;
        const y = Math.sin(angle) * p.size;
        
        if (j === 0) {
          this.ctx.moveTo(x, y);
        } else {
          this.ctx.lineTo(x, y);
        }
        
        // Inner point
        const innerAngle = angle + Math.PI / 5;
        const innerX = Math.cos(innerAngle) * (p.size / 2);
        const innerY = Math.sin(innerAngle) * (p.size / 2);
        this.ctx.lineTo(innerX, innerY);
      }
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.restore();
    }
    
    // Continue animation if particles are still visible
    if (this.particles.some(p => p.opacity > 0)) {
      requestAnimationFrame(() => this.animate());
    } else {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
  
  /**
   * Draw paylines
   */
  drawPaylines(winningLines) {
    if (winningLines.length === 0) return;
    
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Define payline colors
    const paylineColors = [
      '#FF0000', // Red
      '#00FF00', // Green
      '#0000FF', // Blue
      '#FFFF00', // Yellow
      '#FF00FF'  // Magenta
    ];
    
    // Draw each winning payline
    winningLines.forEach(line => {
      const lineIndex = line.lineIndex;
      const color = paylineColors[lineIndex % paylineColors.length];
      
      this.ctx.beginPath();
      this.ctx.strokeStyle = color;
      this.ctx.lineWidth = 3;
      this.ctx.globalAlpha = 0.7;
      
      // Get positions of symbols on this payline
      const positions = line.positions;
      
      // Draw line connecting these positions
      positions.forEach((pos, index) => {
        const element = document.querySelector(`#reel${pos.col + 1} .symbol:nth-child(${pos.row + 1})`);
        if (!element) return;
        
        const rect = element.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        
        if (index === 0) {
          this.ctx.moveTo(x, y);
        } else {
          this.ctx.lineTo(x, y);
        }
      });
      
      this.ctx.stroke();
    });
    
    // Fade out paylines after a delay
    setTimeout(() => {
      let opacity = 0.7;
      const fadeInterval = setInterval(() => {
        opacity -= 0.05;
        if (opacity <= 0) {
          clearInterval(fadeInterval);
          this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
          return;
        }
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Redraw paylines with reduced opacity
        winningLines.forEach(line => {
          const lineIndex = line.lineIndex;
          const color = paylineColors[lineIndex % paylineColors.length];
          
          this.ctx.beginPath();
          this.ctx.strokeStyle = color;
          this.ctx.lineWidth = 3;
          this.ctx.globalAlpha = opacity;
          
          const positions = line.positions;
          positions.forEach((pos, index) => {
            const element = document.querySelector(`#reel${pos.col + 1} .symbol:nth-child(${pos.row + 1})`);
            if (!element) return;
            
            const rect = element.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;
            
            if (index === 0) {
              this.ctx.moveTo(x, y);
            } else {
              this.ctx.lineTo(x, y);
            }
          });
          
          this.ctx.stroke();
        });
      }, 100);
    }, 1000);
  }
} 