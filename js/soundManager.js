// Sound Manager for Retro Arcade Games
class SoundManager {
    constructor() {
        this.audioContext = null;
        this.sounds = {};
        this.muted = localStorage.getItem('soundMuted') === 'true' || false;
        this.volume = parseFloat(localStorage.getItem('soundVolume')) || 0.3;
        this.initialized = false;
        
        // Debug log
        console.log('SoundManager: Initializing with volume:', this.volume, 'muted:', this.muted);
        
        // Initialize on first user interaction
        this.initializeOnInteraction();
    }
    
    // Initialize on first user interaction
    initializeOnInteraction() {
        const init = () => {
            if (!this.initialized) {
                this.initialize();
                document.removeEventListener('click', init);
                document.removeEventListener('keydown', init);
                document.removeEventListener('touchstart', init);
            }
        };
        
        document.addEventListener('click', init);
        document.addEventListener('keydown', init);
        document.addEventListener('touchstart', init);
    }

    // Initialize audio context
    initialize() {
        if (this.initialized) return;
        
        try {
            console.log('SoundManager: Creating audio context');
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.createSounds();
            this.initialized = true;
            console.log('SoundManager: Initialized successfully');
            
            // Auto-resume if suspended
            if (this.audioContext.state === 'suspended') {
                console.log('SoundManager: Audio context suspended, waiting for user interaction');
                const resume = () => {
                    this.audioContext.resume().then(() => {
                        console.log('SoundManager: Audio context resumed successfully');
                        document.removeEventListener('click', resume);
                        document.removeEventListener('keydown', resume);
                        document.removeEventListener('touchstart', resume);
                    });
                };
                
                document.addEventListener('click', resume, { once: true });
                document.addEventListener('keydown', resume, { once: true });
                document.addEventListener('touchstart', resume, { once: true });
            }
        } catch (e) {
            console.error('SoundManager: Failed to initialize Web Audio API', e);
        }
    }

    // Create basic sound presets
    createSounds() {
        // Beep sound (for menu navigation)
        this.sounds.beep = () => this.playTone(523.25, 0.1, 'sine'); // C5
        
        // Select sound (for menu selection)
        this.sounds.select = () => this.playTone(659.25, 0.15, 'square'); // E5
        
        // Move sound (for game movements)
        this.sounds.move = () => this.playTone(392, 0.1, 'sine'); // G4
        
        // Collect/Score sound
        this.sounds.collect = () => {
            this.playTone(659.25, 0.1, 'triangle'); // E5
            this.playTone(783.99, 0.1, 'triangle', 0.1); // G5
        };
        
        // Win sound
        this.sounds.win = () => {
            this.playTone(659.25, 0.1, 'sine'); // E5
            this.playTone(783.99, 0.1, 'sine', 0.1); // G5
            this.playTone(1046.50, 0.2, 'sine', 0.2); // C6
        };
        
        // Lose sound
        this.sounds.lose = () => {
            this.playTone(523.25, 0.1, 'sine'); // C5
            this.playTone(392, 0.2, 'sine', 0.1); // G4
        };
        
        // Game over sound
        this.sounds.gameOver = () => {
            this.playTone(349.23, 0.3, 'sawtooth'); // F4
            this.playTone(261.63, 0.5, 'sawtooth', 0.2); // C4
        };
        
        // Error sound
        this.sounds.error = () => {
            const osc = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(440, this.audioContext.currentTime);
            osc.frequency.exponentialRampToValueAtTime(110, this.audioContext.currentTime + 0.3);
            
            gainNode.gain.setValueAtTime(this.volume, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
            
            osc.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            osc.start();
            osc.stop(this.audioContext.currentTime + 0.3);
        };
    }

    // Play a tone
    playTone(frequency, duration, type = 'sine') {
        if (this.muted || !this.audioContext) {
            console.log('SoundManager: Sound not played - muted:', this.muted, 'audioContext:', !!this.audioContext);
            return;
        }
        
        try {
            // Ensure we're running
            if (this.audioContext.state === 'suspended') {
                console.log('SoundManager: Audio context suspended, resuming...');
                this.audioContext.resume().catch(e => {
                    console.error('SoundManager: Failed to resume audio context', e);
                });
            }
            
            const now = this.audioContext.currentTime;
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.type = type;
            oscillator.frequency.setValueAtTime(frequency, now);
            
            // Set initial gain to avoid clicks
            gainNode.gain.setValueAtTime(0.001, now);
            // Quick fade in
            gainNode.gain.exponentialRampToValueAtTime(this.volume, now + 0.01);
            // Fade out
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.start(now);
            oscillator.stop(now + duration);
            
            // Clean up
            oscillator.onended = () => {
                gainNode.disconnect();
            };
            
            console.log('SoundManager: Playing tone', { frequency, duration, type, volume: this.volume });
        } catch (e) {
            console.error('SoundManager: Error playing tone', e);
        }
    }

    // Play a sound by name
    play(soundName) {
        if (this.muted || !this.sounds[soundName]) return;
        this.sounds[soundName]();
    }

    // Toggle mute
    toggleMute() {
        this.muted = !this.muted;
        localStorage.setItem('soundMuted', this.muted);
        return this.muted;
    }

    // Set volume (0.0 to 1.0)
    setVolume(level) {
        this.volume = Math.min(1, Math.max(0, level));
        localStorage.setItem('soundVolume', this.volume);
    }
}

// Create a global sound manager instance
window.soundManager = new SoundManager();

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.soundManager;
}
