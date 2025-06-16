// Sound Manager for Retro Arcade Games
class SoundManager {
    constructor() {
        this.audioContext = null;
        this.sounds = {};
        this.muted = localStorage.getItem('soundMuted') === 'true' || false;
        this.volume = parseFloat(localStorage.getItem('soundVolume')) || 0.3;
        this.initialize();
    }

    // Initialize audio context on user interaction
    initialize() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.createSounds();
            
            // Unlock audio on first user interaction
            const unlockAudio = () => {
                if (this.audioContext.state === 'suspended') {
                    this.audioContext.resume();
                }
                document.removeEventListener('click', unlockAudio);
                document.removeEventListener('keydown', unlockAudio);
                document.removeEventListener('touchstart', unlockAudio);
            };
            
            document.addEventListener('click', unlockAudio);
            document.addEventListener('keydown', unlockAudio);
            document.addEventListener('touchstart', unlockAudio);
        } catch (e) {
            console.warn('Web Audio API not supported in this browser');
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
    playTone(frequency, duration, type = 'sine', delay = 0) {
        if (!this.audioContext || this.muted) return;
        
        const osc = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        osc.type = type;
        osc.frequency.value = frequency;
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime + delay);
        gainNode.gain.linearRampToValueAtTime(this.volume, this.audioContext.currentTime + delay + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + delay + duration);
        
        osc.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        osc.start(this.audioContext.currentTime + delay);
        osc.stop(this.audioContext.currentTime + delay + duration);
        
        return osc;
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
