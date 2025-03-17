/**
 * Sound Manager for the Sizzling Hot slot machine
 */
class SoundManager {
  constructor() {
    this.sounds = {};
    this.muted = false;
    this.volume = 0.5;
    this.loadErrors = {};
    
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
    
    // Create silent audio fallbacks for missing sounds
    setTimeout(() => {
      for (const name in soundFiles) {
        if (this.loadErrors[name]) {
          console.log(`Creating silent fallback for sound: ${name}`);
          this.createSilentFallback(name);
        }
      }
    }, 1000);
  }
  
  /**
   * Create a silent audio fallback for a missing sound
   */
  createSilentFallback(name) {
    // Create a silent audio context
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const buffer = audioContext.createBuffer(1, 44100, 44100);
      const source = audioContext.createBufferSource();
      source.buffer = buffer;
      
      // Create a dummy audio element
      const audio = new Audio();
      audio.volume = 0;
      
      // Replace the missing sound with the silent one
      this.sounds[name] = audio;
      this.loadErrors[name] = false;
      
      console.log(`Created silent fallback for sound: ${name}`);
    } catch (error) {
      console.warn(`Failed to create silent fallback for sound: ${name}`, error);
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
      this.loadErrors[name] = true;
    };
  }
  
  /**
   * Play a sound by name
   */
  play(name) {
    if (this.muted || !this.sounds[name]) return;
    
    try {
      // Skip if there was a load error and no fallback created yet
      if (this.loadErrors[name] === true) {
        return;
      }
      
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