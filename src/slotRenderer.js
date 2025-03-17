const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

class SlotRenderer {
  constructor() {
    // Set up canvas
    this.canvas = createCanvas(800, 600);
    this.ctx = this.canvas.getContext('2d');
    
    // Create output directory if it doesn't exist
    this.outputDir = path.join(__dirname, 'output');
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
    
    // Colors
    this.colors = {
      background: '#4B0082', // Dark purple
      cabinet: '#8B4513',    // Brown
      gold: '#D4AF37',       // Gold
      black: '#000000',      // Black
      white: '#FFFFFF',      // White
      red: '#FF0000',        // Red
      green: '#00FF00',      // Green
      blue: '#0000FF',       // Blue
      yellow: '#FFFF00',     // Yellow
      magenta: '#FF00FF'     // Magenta
    };
    
    // Symbol colors
    this.symbolColors = {
      'cherry': '#FF0000',     // Red
      'grapes': '#800080',     // Purple
      'watermelon': '#00FF00', // Green
      'orange': '#FFA500',     // Orange
      'lemon': '#FFFF00',      // Yellow
      'plum': '#8B4513',       // Brown
      '7': '#FF0000',          // Red
      'star': '#FFD700'        // Gold
    };
    
    // Reels dimensions
    this.reelWidth = 100;
    this.reelHeight = 100;
    this.reelSpacing = 10;
    
    // Cabinet dimensions
    this.cabinetX = 100;
    this.cabinetY = 80;
    this.cabinetWidth = 600;
    this.cabinetHeight = 400;
  }
  
  // Draw the slot machine
  drawSlotMachine() {
    // Clear canvas
    this.ctx.fillStyle = this.colors.background;
    this.ctx.fillRect(0, 0, 800, 600);
    
    // Draw title
    this.ctx.fillStyle = this.colors.white;
    this.ctx.font = 'bold 32px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('SIZZLING HOT', 400, 40);
    
    // Draw cabinet
    this.ctx.fillStyle = this.colors.cabinet;
    this.ctx.fillRect(this.cabinetX, this.cabinetY, this.cabinetWidth, this.cabinetHeight);
    
    // Draw screen background
    this.ctx.fillStyle = this.colors.black;
    this.ctx.fillRect(
      this.cabinetX + 25, 
      this.cabinetY + 25, 
      this.cabinetWidth - 50, 
      this.cabinetHeight - 50
    );
    
    // Draw spin button
    this.ctx.fillStyle = this.colors.red;
    this.ctx.beginPath();
    this.ctx.arc(400, this.cabinetY + this.cabinetHeight + 30, 20, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Draw payline indicators
    const paylineColors = [
      this.colors.red,
      this.colors.green,
      this.colors.blue,
      this.colors.yellow,
      this.colors.magenta
    ];
    
    for (let i = 0; i < 5; i++) {
      this.ctx.fillStyle = paylineColors[i];
      this.ctx.fillRect(
        this.cabinetX - 20, 
        this.cabinetY + 50 + i * 30, 
        15, 
        15
      );
      
      this.ctx.fillStyle = this.colors.white;
      this.ctx.font = '12px Arial';
      this.ctx.textAlign = 'left';
      this.ctx.fillText(`Line ${i + 1}`, this.cabinetX - 40, this.cabinetY + 62 + i * 30);
    }
    
    // Draw decorative lights
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const radius = 250;
      const x = 400 + Math.cos(angle) * radius;
      const y = 300 + Math.sin(angle) * radius;
      
      this.ctx.fillStyle = this.colors.white;
      this.ctx.beginPath();
      this.ctx.arc(x, y, 5, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }
  
  // Draw a symbol on the canvas
  drawSymbol(x, y, symbol) {
    // Draw symbol background
    this.ctx.fillStyle = this.symbolColors[symbol.name];
    this.ctx.fillRect(x, y, this.reelWidth, this.reelHeight);
    
    // Draw symbol border
    this.ctx.strokeStyle = this.colors.white;
    this.ctx.lineWidth = 3;
    this.ctx.strokeRect(x, y, this.reelWidth, this.reelHeight);
    
    // Draw symbol icon based on name
    this.drawSymbolIcon(x, y, symbol.name);
  }
  
  // Draw symbol icon
  drawSymbolIcon(x, y, symbolName) {
    const centerX = x + this.reelWidth / 2;
    const centerY = y + this.reelHeight / 2;
    const size = this.reelWidth * 0.6;
    
    this.ctx.fillStyle = this.colors.white;
    this.ctx.strokeStyle = this.colors.white;
    this.ctx.lineWidth = 2;
    
    switch (symbolName) {
      case 'cherry':
        this.drawCherry(centerX, centerY, size);
        break;
      case 'grapes':
        this.drawGrapes(centerX, centerY, size);
        break;
      case 'watermelon':
        this.drawWatermelon(centerX, centerY, size);
        break;
      case 'orange':
        this.drawOrange(centerX, centerY, size);
        break;
      case 'lemon':
        this.drawLemon(centerX, centerY, size);
        break;
      case 'plum':
        this.drawPlum(centerX, centerY, size);
        break;
      case '7':
        this.drawSeven(centerX, centerY, size);
        break;
      case 'star':
        this.drawStar(centerX, centerY, size);
        break;
      default:
        // Fallback to text
        this.ctx.fillStyle = this.colors.white;
        this.ctx.font = '16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(symbolName, centerX, centerY);
    }
  }
  
  // Draw cherry icon
  drawCherry(x, y, size) {
    const radius = size / 4;
    
    // Draw two cherries
    this.ctx.fillStyle = '#FF0000';
    this.ctx.beginPath();
    this.ctx.arc(x - radius, y + radius, radius, 0, Math.PI * 2);
    this.ctx.fill();
    
    this.ctx.beginPath();
    this.ctx.arc(x + radius, y, radius, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Draw stems
    this.ctx.strokeStyle = '#00AA00';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(x - radius, y + radius - radius/2);
    this.ctx.quadraticCurveTo(x, y - radius, x + radius, y - radius);
    this.ctx.stroke();
    
    this.ctx.beginPath();
    this.ctx.moveTo(x + radius, y - radius/2);
    this.ctx.quadraticCurveTo(x, y - radius, x - radius, y - radius);
    this.ctx.stroke();
  }
  
  // Draw grapes icon
  drawGrapes(x, y, size) {
    const radius = size / 10;
    
    // Draw grape cluster
    this.ctx.fillStyle = '#800080';
    
    // Draw grapes in a cluster pattern
    const positions = [
      [0, 0], [1, 0], [2, 0],
      [-0.5, 1], [0.5, 1], [1.5, 1], [2.5, 1],
      [0, 2], [1, 2], [2, 2],
      [0.5, 3], [1.5, 3]
    ];
    
    for (const [dx, dy] of positions) {
      this.ctx.beginPath();
      this.ctx.arc(
        x + (dx - 1) * radius * 2, 
        y + (dy - 1.5) * radius * 2, 
        radius, 
        0, 
        Math.PI * 2
      );
      this.ctx.fill();
    }
    
    // Draw stem
    this.ctx.strokeStyle = '#00AA00';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(x, y - radius * 4);
    this.ctx.lineTo(x, y - radius * 6);
    this.ctx.stroke();
  }
  
  // Draw watermelon icon
  drawWatermelon(x, y, size) {
    const radius = size / 2;
    
    // Draw watermelon slice
    this.ctx.fillStyle = '#FF6666';
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
    this.ctx.arc(x, y, radius, -Math.PI/6, Math.PI/6, false);
    this.ctx.closePath();
    this.ctx.fill();
    
    // Draw rind
    this.ctx.fillStyle = '#00AA00';
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, -Math.PI/6, Math.PI/6, false);
    this.ctx.arc(x, y, radius * 1.1, Math.PI/6, -Math.PI/6, true);
    this.ctx.closePath();
    this.ctx.fill();
    
    // Draw seeds
    this.ctx.fillStyle = '#000000';
    for (let i = 0; i < 5; i++) {
      const angle = -Math.PI/6 + (Math.PI/3) * (i / 4);
      const seedX = x + Math.cos(angle) * radius * 0.7;
      const seedY = y + Math.sin(angle) * radius * 0.7;
      
      this.ctx.beginPath();
      this.ctx.ellipse(seedX, seedY, 2, 4, angle + Math.PI/2, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }
  
  // Draw orange icon
  drawOrange(x, y, size) {
    const radius = size / 2;
    
    // Draw orange
    this.ctx.fillStyle = '#FFA500';
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Draw texture lines
    this.ctx.strokeStyle = '#FF8000';
    this.ctx.lineWidth = 1;
    
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      this.ctx.beginPath();
      this.ctx.moveTo(x, y);
      this.ctx.lineTo(
        x + Math.cos(angle) * radius,
        y + Math.sin(angle) * radius
      );
      this.ctx.stroke();
    }
    
    // Draw leaf
    this.ctx.fillStyle = '#00AA00';
    this.ctx.beginPath();
    this.ctx.ellipse(x, y - radius, 5, 10, 0, 0, Math.PI * 2);
    this.ctx.fill();
  }
  
  // Draw lemon icon
  drawLemon(x, y, size) {
    const width = size * 0.8;
    const height = size * 0.5;
    
    // Draw lemon
    this.ctx.fillStyle = '#FFFF00';
    this.ctx.beginPath();
    this.ctx.ellipse(x, y, width, height, 0, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Draw texture lines
    this.ctx.strokeStyle = '#DDDD00';
    this.ctx.lineWidth = 1;
    
    for (let i = 0; i < 5; i++) {
      const offset = (i - 2) * (width / 5);
      this.ctx.beginPath();
      this.ctx.moveTo(x + offset, y - height);
      this.ctx.lineTo(x + offset, y + height);
      this.ctx.stroke();
    }
  }
  
  // Draw plum icon
  drawPlum(x, y, size) {
    const radius = size / 2;
    
    // Draw plum
    this.ctx.fillStyle = '#8B4513';
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Draw highlight
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    this.ctx.beginPath();
    this.ctx.arc(x - radius/3, y - radius/3, radius/3, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Draw stem
    this.ctx.strokeStyle = '#00AA00';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(x, y - radius);
    this.ctx.lineTo(x, y - radius - 10);
    this.ctx.stroke();
  }
  
  // Draw seven icon
  drawSeven(x, y, size) {
    const width = size * 0.6;
    const height = size;
    
    // Draw 7
    this.ctx.fillStyle = '#FF0000';
    this.ctx.font = `bold ${height}px Arial`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('7', x, y);
    
    // Add shine effect
    this.ctx.strokeStyle = '#FFFFFF';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(x - width/2, y - height/3);
    this.ctx.lineTo(x + width/2, y - height/3);
    this.ctx.stroke();
  }
  
  // Draw star icon
  drawStar(x, y, size) {
    const outerRadius = size / 2;
    const innerRadius = outerRadius * 0.4;
    const spikes = 5;
    
    this.ctx.fillStyle = '#FFD700';
    this.ctx.beginPath();
    
    for (let i = 0; i < spikes * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2;
      
      if (i === 0) {
        this.ctx.moveTo(
          x + Math.cos(angle) * radius,
          y + Math.sin(angle) * radius
        );
      } else {
        this.ctx.lineTo(
          x + Math.cos(angle) * radius,
          y + Math.sin(angle) * radius
        );
      }
    }
    
    this.ctx.closePath();
    this.ctx.fill();
    
    // Add shine effect
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    this.ctx.beginPath();
    this.ctx.arc(x - outerRadius/4, y - outerRadius/4, outerRadius/4, 0, Math.PI * 2);
    this.ctx.fill();
  }
  
  // Update the reels with new symbols
  updateReels(grid) {
    // Draw the base slot machine
    this.drawSlotMachine();
    
    // Draw each symbol
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 5; col++) {
        const index = row * 5 + col;
        const symbol = grid[index];
        
        const x = this.cabinetX + 50 + col * (this.reelWidth + this.reelSpacing);
        const y = this.cabinetY + 50 + row * (this.reelHeight + this.reelSpacing);
        
        this.drawSymbol(x, y, symbol);
      }
    }
  }
  
  // Render the scene and save to a file
  async renderToFile(grid) {
    // Update the reels with the new symbols
    this.updateReels(grid);
    
    // Save the rendered image
    const timestamp = Date.now();
    const outputPath = path.join(this.outputDir, `result_${timestamp}.png`);
    
    // Convert canvas to buffer and save
    const buffer = this.canvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, buffer);
    
    return outputPath;
  }
  
  // Start the spinning animation
  async startSpinAnimation(finalGrid) {
    // Create a sequence of frames for the animation
    const frames = [];
    const frameCount = 30;
    
    // Generate random symbols for animation
    const tempSymbols = [];
    const symbolNames = ['cherry', 'grapes', 'watermelon', 'orange', 'lemon', 'plum', '7', 'star'];
    
    for (let i = 0; i < 8; i++) {
      tempSymbols.push({
        name: symbolNames[i]
      });
    }
    
    // Create animation frames
    for (let frame = 0; frame < frameCount; frame++) {
      // Draw the base slot machine
      this.drawSlotMachine();
      
      // Draw each symbol
      for (let col = 0; col < 5; col++) {
        // Stagger the columns to stop one by one
        const columnStopFrame = (col * 5) + 5;
        
        for (let row = 0; row < 3; row++) {
          const x = this.cabinetX + 50 + col * (this.reelWidth + this.reelSpacing);
          const y = this.cabinetY + 50 + row * (this.reelHeight + this.reelSpacing);
          
          // If this column is still spinning
          if (frame < columnStopFrame) {
            // Get a random symbol for the animation
            const randomIndex = Math.floor(Math.random() * tempSymbols.length);
            const symbol = tempSymbols[randomIndex];
            
            this.drawSymbol(x, y, symbol);
          } else if (frame === columnStopFrame || frame > columnStopFrame) {
            // When the column stops, show the final symbol
            const index = row * 5 + col;
            const symbol = finalGrid[index];
            
            this.drawSymbol(x, y, symbol);
          }
        }
      }
      
      // Create a copy of the canvas for this frame
      const frameCanvas = createCanvas(800, 600);
      const frameCtx = frameCanvas.getContext('2d');
      frameCtx.drawImage(this.canvas, 0, 0);
      
      frames.push(frameCanvas);
    }
    
    // Save the final image
    const timestamp = Date.now();
    const outputPath = path.join(this.outputDir, `result_${timestamp}.png`);
    
    // Convert canvas to buffer and save
    const buffer = this.canvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, buffer);
    
    return {
      frames,
      outputPath
    };
  }
  
  // Helper function to convert RGBA to hex
  rgbaToHex(rgba) {
    const r = (rgba >> 24) & 0xFF;
    const g = (rgba >> 16) & 0xFF;
    const b = (rgba >> 8) & 0xFF;
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }
}

module.exports = SlotRenderer; 