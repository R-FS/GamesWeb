// Main JavaScript for the landing page
document.addEventListener('DOMContentLoaded', () => {
    // Initialize sound manager if available
    if (window.soundManager) {
        soundManager.setVolume(0.3); // Set volume to 30%
        
        // Set up mute button
        const muteBtn = document.getElementById('muteBtn');
        if (muteBtn) {
            // Set initial state
            if (soundManager.muted) {
                muteBtn.classList.add('muted');
            }
            
            // Toggle mute on click
            muteBtn.addEventListener('click', () => {
                const isMuted = soundManager.toggleMute();
                muteBtn.classList.toggle('muted', isMuted);
                
                // Play a sound to give feedback
                if (!isMuted) {
                    soundManager.play('beep');
                }
                
                // Show notification
                showNotification(isMuted ? '🔇 Sound Off' : '🔊 Sound On');
            });
        }
        
        // Play a welcome sound
        soundManager.play('beep');
    }
    
    // Handle game icon clicks
    const gameIcons = document.querySelectorAll('.game-icon');
    
    gameIcons.forEach(icon => {
        icon.addEventListener('click', (e) => {
            // If it's a coming soon game, show notification
            if (icon.classList.contains('coming-soon')) {
                e.preventDefault();
                const gameName = icon.querySelector('span:first-of-type').textContent;
                showNotification(`${gameName} is coming soon! 🚀`);
                return;
            }
            
            // Add a temporary click effect for active games
            e.currentTarget.style.transform = 'scale(0.95)';
            setTimeout(() => {
                e.currentTarget.style.transform = '';
            }, 100);
        });
    });
    
    // Add a fun background effect
    createFloatingParticles();
});

// Show a temporary notification
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    // Add to body
    document.body.appendChild(notification);
    
    // Position and animate in
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(-50%) translateY(0)';
    }, 10);
    
    // Remove after delay
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(-50%) translateY(20px)';
        
        // Remove from DOM after animation
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Add notification styles
const style = document.createElement('style');
style.textContent = `
    .notification {
        position: fixed;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%) translateY(20px);
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 15px 25px;
        border-radius: 50px;
        font-size: 0.9rem;
        z-index: 1000;
        opacity: 0;
        transition: all 0.3s ease;
        backdrop-filter: blur(5px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    }
`;
document.head.appendChild(style);

// Simple floating particles effect
function createFloatingParticles() {
    const colors = ['#ff6b6b', '#4ecdc4', '#ffbe76', '#6c5ce7'];
    const container = document.querySelector('.container');
    
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'fixed';
        particle.style.width = Math.random() * 15 + 5 + 'px';
        particle.style.height = particle.style.width;
        particle.style.background = colors[Math.floor(Math.random() * colors.length)];
        particle.style.borderRadius = '50%';
        particle.style.opacity = Math.random() * 0.5 + 0.1;
        particle.style.zIndex = '-1';
        
        // Random position
        particle.style.left = Math.random() * 100 + 'vw';
        particle.style.top = Math.random() * 100 + 'vh';
        
        // Animation
        const duration = Math.random() * 20 + 10;
        particle.style.animation = `float ${duration}s linear infinite`;
        particle.style.animationDelay = Math.random() * -duration + 's';
        
        document.body.appendChild(particle);
    }
    
    // Add the keyframes for the animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes float {
            0% {
                transform: translateY(0) rotate(0deg);
                opacity: 0;
            }
            10% {
                opacity: 1;
            }
            90% {
                opacity: 1;
            }
            100% {
                transform: translateY(-100vh) rotate(360deg);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}
