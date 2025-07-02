// This is a simple sound generator for the game over sound effect
// It will be used when the snake hits a wall or itself

// Create audio context
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioContext();

// Function to create and play the game over sound
export function playGameOverSound() {
    // Create oscillators for a more complex sound
    const oscillator1 = audioContext.createOscillator();
    const oscillator2 = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    // Connect nodes
    oscillator1.connect(gainNode);
    oscillator2.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Configure oscillators
    oscillator1.type = 'sawtooth';
    oscillator2.type = 'sine';
    
    // Set initial frequencies (a dissonant interval)
    oscillator1.frequency.setValueAtTime(440, audioContext.currentTime); // A4
    oscillator2.frequency.setValueAtTime(554.37, audioContext.currentTime); // C#5
    
    // Create a falling effect
    oscillator1.frequency.exponentialRampToValueAtTime(110, audioContext.currentTime + 0.5); // A2
    oscillator2.frequency.exponentialRampToValueAtTime(138.59, audioContext.currentTime + 0.5); // C#3
    
    // Configure gain (volume) envelope
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.6);
    
    // Play the sound
    oscillator1.start();
    oscillator2.start();
    oscillator1.stop(audioContext.currentTime + 0.6);
    oscillator2.stop(audioContext.currentTime + 0.6);
    
    // Clean up
    const cleanup = () => {
        oscillator1.disconnect();
        oscillator2.disconnect();
        gainNode.disconnect();
    };
    
    oscillator1.onended = cleanup;
    oscillator2.onended = cleanup;
}

// Export as a sound object that matches the soundManager interface
export default {
    play: playGameOverSound
};
