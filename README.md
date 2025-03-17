# Sizzling Hot™ deluxe Slot Machine

A web-based implementation of the classic Sizzling Hot™ deluxe slot machine game, designed to work as a Telegram Mini App.

## Features

- **Authentic Gameplay**: Follows the original Sizzling Hot™ deluxe rules with 5 fixed paylines
- **Realistic Effects**: Gold coin shower for wins, fire trails for winning lines, and scatter win effects
- **Sound Effects**: Immersive audio for spinning, reel stops, wins, and button clicks
- **Responsive Design**: Works on both desktop and mobile devices
- **Telegram Integration**: Functions as a Telegram Mini App with theme support

## Game Rules

- 5 fixed paylines
- Winning combinations start from the leftmost reel
- Scatter symbols (⭐) pay in any position
- Cherry symbols pay for 2 of a kind

## Symbol Payouts

| Symbol | 5x | 4x | 3x | 2x |
|--------|-----|-----|-----|-----|
| 7️⃣ | 5000 | 1000 | 100 | - |
| 🍉 | 500 | 200 | 50 | - |
| 🍇 | 500 | 200 | 50 | - |
| 🍑 | 200 | 50 | 20 | - |
| 🍊 | 200 | 50 | 20 | - |
| 🍋 | 200 | 50 | 20 | - |
| 🍒 | 200 | 50 | 20 | 5 |
| ⭐ | 50 | 10 | 2 | - |

## Technical Details

- Built with vanilla JavaScript, HTML5, and CSS3
- Uses HTML5 Canvas for win effects and animations
- Implements a custom sound manager for audio effects
- Designed for integration with the Telegram Mini App platform

## Setup and Installation

1. Clone the repository
2. Install dependencies with `npm install`
3. Configure environment variables (see `.env.example`)
4. Start the server with `node server.js`

## Deployment on Glitch

This application is optimized for deployment on Glitch:

1. Import the repository to Glitch
2. Set up the required environment variables
3. The application will automatically start

## License

This is a fan-made implementation for educational purposes only. Sizzling Hot™ is a trademark of Novomatic AG. This project is not affiliated with or endorsed by Novomatic. 