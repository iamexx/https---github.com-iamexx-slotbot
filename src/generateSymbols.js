const { Jimp } = require('jimp');
const fs = require('fs');
const path = require('path');

// Define symbols
const symbols = [
  { name: 'cherry', color: 0xFF0000FF }, // Red
  { name: 'grapes', color: 0x800080FF }, // Purple
  { name: 'watermelon', color: 0x00FF00FF }, // Green
  { name: 'orange', color: 0xFFA500FF }, // Orange
  { name: 'lemon', color: 0xFFFF00FF }, // Yellow
  { name: 'plum', color: 0x8B4513FF }, // Brown
  { name: '7', color: 0xFF0000FF }, // Red
  { name: 'star', color: 0xFFD700FF } // Gold
];

// Create output directory if it doesn't exist
const outputDir = path.join(__dirname, 'assets', 'symbols');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Generate symbol images
async function generateSymbols() {
  try {
    for (const symbol of symbols) {
      console.log(`Generating ${symbol.name} symbol...`);
      
      // Create a new image (100x100)
      const image = new Jimp(100, 100, symbol.color);
      
      // Add a white border
      for (let x = 0; x < 100; x++) {
        for (let y = 0; y < 100; y++) {
          if (x < 3 || x > 96 || y < 3 || y > 96) {
            image.setPixelColor(0xFFFFFFFF, x, y);
          }
        }
      }
      
      // Add symbol name
      const font = await Jimp.loadFont(Jimp.FONT_SANS_16_WHITE);
      image.print(font, 10, 40, symbol.name);
      
      // Save image
      const outputPath = path.join(outputDir, `${symbol.name}.png`);
      await image.writeAsync(outputPath);
      
      console.log(`Generated ${outputPath}`);
    }
    
    console.log('All symbol images generated successfully!');
  } catch (error) {
    console.error('Error generating symbol images:', error);
  }
}

// Run the generator
generateSymbols(); 