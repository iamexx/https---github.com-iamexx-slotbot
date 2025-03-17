const GIFEncoder = require('gifencoder');
const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

class GifGenerator {
  constructor(slotRenderer) {
    this.slotRenderer = slotRenderer;
    this.outputDir = path.join(__dirname, 'output');
    
    // Create output directory if it doesn't exist
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }
  
  // Generate an animated GIF of the spinning reels
  async generateSpinGif(grid) {
    // Get animation frames from the renderer
    const { frames } = await this.slotRenderer.startSpinAnimation(grid);
    
    // Set up the GIF encoder
    const encoder = new GIFEncoder(800, 600);
    const outputPath = path.join(this.outputDir, `spin_${Date.now()}.gif`);
    const stream = fs.createWriteStream(outputPath);
    
    // Stream the output
    encoder.createReadStream().pipe(stream);
    
    // Start encoding
    encoder.start();
    encoder.setRepeat(0);   // 0 = repeat forever
    encoder.setDelay(100);  // Frame delay in ms
    encoder.setQuality(10); // Image quality (lower = better)
    
    // Add each frame to the GIF
    for (const frame of frames) {
      encoder.addFrame(frame.getContext('2d'));
    }
    
    // Finish encoding
    encoder.finish();
    
    return outputPath;
  }
}

module.exports = GifGenerator; 