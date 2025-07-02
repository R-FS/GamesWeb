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
        
        // Game-specific sounds
        this.gameSounds = {
            'snake': {
                'eat': () => import('../../sounds/eat.js').then(module => module.default),
                'gameOver': () => import('../../sounds/gameOver.js').then(module => module.default)
            }
        };
        
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
    async initialize() {
        if (this.initialized) return Promise.resolve();
        
        try {
            console.log('SoundManager: Creating audio context');
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Resume audio context if it was suspended
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }
            
            this.createSounds();
            this.initialized = true;
            console.log('SoundManager: Initialized successfully');
            
            return Promise.resolve();
            
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
    async play(soundName, gameId = null) {
        if (this.muted || !this.initialized) return;
        
        // Check for game-specific sounds first
        if (gameId && this.gameSounds[gameId] && this.gameSounds[gameId][soundName]) {
            try {
                const soundModule = await this.gameSounds[gameId][soundName]();
                if (soundModule && typeof soundModule.play === 'function') {
                    soundModule.play();
                    return;
                }
            } catch (e) {
                console.warn(`Error loading game sound '${soundName}':`, e);
            }
        }
        
        // Fall back to built-in sounds
        if (this.sounds[soundName]) {
            const sound = this.sounds[soundName];
            sound.volume = this.volume;
            sound.currentTime = 0;
            sound.play().catch(e => console.warn('Error playing sound:', e));
        } else {
            console.warn(`Sound '${soundName}' not found`);
        }
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

class GameSoundManager {
    constructor(gameId) {
        this.gameId = gameId;
        this.sounds = {};
        this.muted = localStorage.getItem(`soundMuted_${gameId}`) === 'true' || false;
        this.volume = parseFloat(localStorage.getItem(`soundVolume_${gameId}`)) || 0.5;
        this.initialized = false;
        this.initialize();
    }

    initialize() {
        this.setupMuteButton();
        this.loadGameSounds();
    }

    setupMuteButton() {
        const muteBtn = document.querySelector(`.mute-btn[data-game="${this.gameId}"]`);
        if (muteBtn) {
            muteBtn.addEventListener('click', () => this.toggleMute());
            
            // Atualizar estado inicial do botão
            const savedMuted = localStorage.getItem(`soundMuted_${this.gameId}`);
            if (savedMuted === 'true') {
                this.muted = true;
                muteBtn.classList.add('muted');
            }
        }
    }

    loadGameSounds() {
        // Carregar sons específicos do jogo
        const soundsPath = `games/${this.gameId}/sounds/`;
        const sounds = {
            'click': `${soundsPath}click.mp3`,
            'game-over': `${soundsPath}game-over.mp3`,
            'score': `${soundsPath}score.mp3`,
            'error': `${soundsPath}error.mp3`,
            'success': `${soundsPath}success.mp3`
        };

        // Criar objetos Audio para cada som
        Object.entries(sounds).forEach(([name, path]) => {
            this.sounds[name] = new Audio(path);
        });
    }

    toggleMute() {
        this.muted = !this.muted;
        const muteBtn = document.querySelector(`.mute-btn[data-game="${this.gameId}"]`);
        if (muteBtn) {
            muteBtn.classList.toggle('muted');
        }
        localStorage.setItem(`soundMuted_${this.gameId}`, this.muted);
    }

    async play(soundName, volume = this.volume) {
        try {
            if (this.muted) return;
            
            // Primeiro tenta usar o gerenciador de som principal
            if (window.soundManager) {
                try {
                    await window.soundManager.play(soundName, this.gameId);
                    return; // Se o som principal foi reproduzido com sucesso, sai da função
                } catch (e) {
                    console.warn(`Falha ao reproduzir som '${soundName}' pelo gerenciador principal:`, e);
                    // Continua para tentar reproduzir o som localmente
                }
            }
            
            // Se não houver gerenciador principal ou falhar, tenta reproduzir localmente
            const sound = this.sounds[soundName];
            if (sound) {
                try {
                    sound.currentTime = 0;
                    sound.volume = volume;
                    const playPromise = sound.play();
                    
                    // Trata a promessa de reprodução para evitar erros não capturados
                    if (playPromise !== undefined) {
                        playPromise.catch(error => {
                            console.error(`Erro ao reproduzir som '${soundName}':`, error);
                        });
                    }
                } catch (e) {
                    console.error(`Erro ao reproduzir som local '${soundName}':`, e);
                }
            } else {
                console.warn(`Som '${soundName}' não encontrado para o jogo '${this.gameId}'`);
            }
        } catch (e) {
            console.error(`Erro inesperado ao reproduzir som '${soundName}':`, e);
        }
    }

    stop(soundName) {
        if (this.sounds[soundName]) {
            this.sounds[soundName].pause();
            this.sounds[soundName].currentTime = 0;
        }
    }

    setVolume(volume) {
        this.volume = volume;
        Object.values(this.sounds).forEach(sound => {
            sound.volume = volume;
        });
    }

    getVolume() {
        return this.volume;
    }

    isMuted() {
        return this.muted;
    }

    static create(gameId) {
        return new GameSoundManager(gameId);
    }
}

// Função para inicializar o sound manager do jogo atual
function initializeGameSoundManager() {
    const gameId = window.location.pathname.split('/').pop().split('.')[0];
    if (gameId) {
        window.gameSoundManager = GameSoundManager.create(gameId);
    }
}

// Inicializar quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Initialize main sound manager first
        if (window.soundManager) {
            await window.soundManager.initialize();
        }
        
        // Initialize game sound manager
        initializeGameSoundManager();
    } catch (error) {
        console.error('Error initializing sound system:', error);
    }
});
