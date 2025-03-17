/**
 * Sound Manager for the Sizzling Hot slot machine
 */
class SoundManager {
  constructor() {
    this.sounds = {};
    this.muted = false;
    this.volume = 0.5;
    
    // Initialize sounds
    this.initSounds();
    
    console.log('Sound Manager initialized');
  }
  
  /**
   * Initialize all sound effects
   */
  initSounds() {
    // Define sound files
    const soundFiles = {
      spin: 'sounds/spin.mp3',
      reelStop: 'sounds/reel-stop.mp3',
      win: 'sounds/win.mp3',
      coinBounce: 'sounds/coin-bounce.mp3',
      bigWin: 'sounds/big-win.mp3',
      button: 'sounds/button-click.mp3'
    };
    
    // Preload all sounds
    for (const [name, path] of Object.entries(soundFiles)) {
      this.loadSound(name, path);
    }
  }
  
  /**
   * Load a sound file
   */
  loadSound(name, path) {
    const audio = new Audio();
    audio.src = path;
    audio.preload = 'auto';
    audio.volume = this.volume;
    
    // Add to sounds collection
    this.sounds[name] = audio;
    
    // Handle loading errors
    audio.onerror = () => {
      console.warn(`Failed to load sound: ${name} (${path})`);
    };
  }
  
  /**
   * Play a sound by name
   */
  play(name) {
    if (this.muted || !this.sounds[name]) return;
    
    try {
      // Clone the audio to allow overlapping sounds
      const sound = this.sounds[name].cloneNode();
      sound.volume = this.volume;
      
      // Play the sound
      const playPromise = sound.play();
      
      // Handle autoplay restrictions
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.warn(`Sound playback failed: ${error}`);
        });
      }
    } catch (error) {
      console.warn(`Error playing sound ${name}: ${error}`);
    }
  }
  
  /**
   * Set the volume for all sounds
   */
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    
    // Update volume for all loaded sounds
    for (const sound of Object.values(this.sounds)) {
      sound.volume = this.volume;
    }
  }
  
  /**
   * Toggle mute state
   */
  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }
  
  /**
   * Set mute state
   */
  setMute(muted) {
    this.muted = muted;
  }
}

// Create global sound manager instance
const soundManager = new SoundManager();

/**
 * Global function to play a sound
 */
function playSound(name) {
  soundManager.play(name);
} 