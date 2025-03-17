/**
 * Main application file for the Sizzling Hot Slots game
 */

// Initialize Telegram Mini App
let tg = window.Telegram?.WebApp;
let user = null;

// Game state
let balance = CONFIG.defaultBalance;
let currentBet = CONFIG.defaultBet;
let isSpinning = false;

// DOM elements
const balanceElement = document.getElementById('balance');
const betAmountElement = document.getElementById('bet-amount');
const spinButton = document.getElementById('spin-button');
const betDecreaseButton = document.getElementById('bet-decrease');
const betIncreaseButton = document.getElementById('bet-increase');
const winMessageElement = document.getElementById('win-message');

// Three.js variables
let scene, camera, renderer, slotMachine;
let animationId;

// Initialize the game
function init() {
  // Set up Three.js scene
  setupScene();
  
  // Set up event listeners
  setupEventListeners();
  
  // Initialize UI
  updateUI();
  
  // If Telegram Mini App is available, initialize it
  if (tg) {
    initTelegramApp();
  }
  
  // Start animation loop
  animate();
}

// Set up Three.js scene
function setupScene() {
  // Create scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(CONFIG.colors.background);
  
  // Create camera
  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(
    CONFIG.cameraPosition.x,
    CONFIG.cameraPosition.y,
    CONFIG.cameraPosition.z
  );
  camera.lookAt(0, 0, 0);
  
  // Create renderer
  renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById('game-canvas'),
    antialias: true
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  
  // Add lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, CONFIG.lightIntensity);
  directionalLight.position.set(5, 5, 5);
  scene.add(directionalLight);
  
  // Create slot machine
  slotMachine = new SlotMachine(scene, camera);
  
  // Handle window resize
  window.addEventListener('resize', onWindowResize);
}

// Set up event listeners
function setupEventListeners() {
  // Spin button
  spinButton.addEventListener('click', () => {
    if (!isSpinning && balance >= currentBet) {
      spin();
    }
  });
  
  // Bet controls
  betDecreaseButton.addEventListener('click', () => {
    if (!isSpinning) {
      decreaseBet();
    }
  });
  
  betIncreaseButton.addEventListener('click', () => {
    if (!isSpinning) {
      increaseBet();
    }
  });
}

// Initialize Telegram Mini App
function initTelegramApp() {
  // Expand to full screen
  tg.expand();
  
  // Get user data if available
  user = tg.initDataUnsafe?.user;
  
  // Set theme based on Telegram theme
  if (tg.colorScheme === 'dark') {
    document.body.classList.add('dark-theme');
  }
  
  // Set up back button handler
  tg.BackButton.onClick(() => {
    tg.close();
  });
  
  // Set up main button (if needed)
  tg.MainButton.setText('ADD COINS');
  tg.MainButton.onClick(() => {
    // This would typically open a payment dialog or similar
    balance += 1000;
    updateUI();
  });
}

// Update UI elements
function updateUI() {
  balanceElement.textContent = balance;
  betAmountElement.textContent = currentBet;
  
  // Disable spin button if balance is too low
  if (balance < currentBet) {
    spinButton.disabled = true;
    spinButton.classList.add('disabled');
  } else {
    spinButton.disabled = false;
    spinButton.classList.remove('disabled');
  }
  
  // Update bet controls
  const minBet = CONFIG.betOptions[0];
  const maxBet = CONFIG.betOptions[CONFIG.betOptions.length - 1];
  
  betDecreaseButton.disabled = currentBet <= minBet || isSpinning;
  betIncreaseButton.disabled = currentBet >= maxBet || isSpinning;
  
  // Show main button in Telegram if balance is low
  if (tg && balance < minBet) {
    tg.MainButton.show();
  } else if (tg) {
    tg.MainButton.hide();
  }
}

// Decrease bet amount
function decreaseBet() {
  const currentIndex = CONFIG.betOptions.indexOf(currentBet);
  if (currentIndex > 0) {
    currentBet = CONFIG.betOptions[currentIndex - 1];
    updateUI();
  }
}

// Increase bet amount
function increaseBet() {
  const currentIndex = CONFIG.betOptions.indexOf(currentBet);
  if (currentIndex < CONFIG.betOptions.length - 1) {
    currentBet = CONFIG.betOptions[currentIndex + 1];
    updateUI();
  }
}

// Spin the reels
async function spin() {
  // Set spinning state
  isSpinning = true;
  winMessageElement.textContent = '';
  
  // Update UI
  spinButton.disabled = true;
  spinButton.classList.add('disabled');
  
  // Deduct bet amount
  balance -= currentBet;
  updateUI();
  
  // Spin the reels
  await slotMachine.spin();
  
  // Calculate winnings
  const winResult = slotMachine.calculateWinnings(currentBet);
  
  // Add winnings to balance
  balance += winResult.totalWinnings;
  
  // Show winning paylines
  const message = slotMachine.showWinningPaylines(winResult);
  winMessageElement.textContent = message;
  
  // Reset spinning state
  isSpinning = false;
  updateUI();
}

// Animation loop
function animate() {
  animationId = requestAnimationFrame(animate);
  
  // Render the scene
  renderer.render(scene, camera);
}

// Handle window resize
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', init); 