// This is a simple sound generator for the eat sound effect
// It will be used when the snake eats food

// Create audio context
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioContext();

// Function to create and play the eat sound
export function playEatSound() {
    // Create oscillator for the main tone
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    // Connect nodes
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Configure oscillator
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // A5 note
    oscillator.frequency.exponentialRampToValueAtTime(440, audioContext.currentTime + 0.1); // A4 note
    
    // Configure gain (volume) envelope
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
    
    // Play the sound
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.2);
    
    // Clean up
    oscillator.onended = () => {
        oscillator.disconnect();
        gainNode.disconnect();
    };
}

// Export as a sound object that matches the soundManager interface
export default {
    play: playEatSound
};
