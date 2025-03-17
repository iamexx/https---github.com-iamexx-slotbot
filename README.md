# Sizzling Hot Slots - Telegram Mini App

A 3D slot machine game built with HTML5 and Three.js for Telegram Mini Apps, ready to be hosted on Glitch.com.

## Features

- 3D slot machine with animated spinning reels
- Realistic fruit symbols rendered with Three.js
- 5 reels, 3 rows, and 5 paylines
- Adjustable bet amounts
- Win calculations and payline visualization
- Responsive design that works on mobile and desktop
- Telegram Mini App integration

## Symbols

The game includes the following symbols:
- Cherry
- Grapes
- Watermelon
- Orange
- Lemon
- Plum
- 7 (highest paying)
- Star (scatter)

## Payouts

Payouts are calculated based on the bet amount and the symbol combinations:
- 3x Cherries: 2x bet
- 3x Grapes: 3x bet
- 3x Watermelon: 4x bet
- 3x Orange: 3x bet
- 3x Lemon: 2x bet
- 3x Plum: 2x bet
- 3x 7: 10x bet
- 3x Star (anywhere): 5x bet

Higher combinations (4 or 5 matching symbols) pay even more.

## Technologies Used

- HTML5 and CSS3
- JavaScript (ES6+)
- Three.js for 3D rendering
- GSAP for animations
- Express.js for the server
- Telegram Mini App SDK

## Setup and Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file with your settings:
   ```
   PORT=3000
   NODE_ENV=development
   ```
4. Start the development server:
   ```
   npm run dev
   ```
5. Open your browser at `http://localhost:3000`

## Deployment to Glitch.com

1. Create a new project on Glitch.com
2. Import this repository
3. The app will automatically deploy and run

## Telegram Mini App Integration

To set up this game as a Telegram Mini App:

1. Talk to @BotFather on Telegram
2. Create a new bot or select an existing one
3. Use the /newapp command to create a Mini App
4. Set the URL to your Glitch.com project URL
5. Configure the bot to open the Mini App

## License

ISC

## Author

Created by [Your Name] 