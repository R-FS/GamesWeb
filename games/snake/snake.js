// Game variables
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const scoreElement = document.getElementById('score');

// Ensure soundManager is available
const sound = window.soundManager || {
    play: () => {},
    toggleMute: () => false,
    muted: false
};

// Game settings
const gridSize = 20;
const tileCount = canvas.width / gridSize;

// Game state
let snake = [];
let food = {};
let direction = 'right';
let nextDirection = 'right';
let score = 0;
let gameSpeed = 150; // Increased from 100ms to 150ms for slower initial speed
let gameLoop;
let gameStarted = true; // Game starts automatically

// Initialize the game
function init() {
    // Ensure sound manager is properly initialized with saved volume
    if (window.soundManager) {
        const savedVolume = parseFloat(localStorage.getItem('soundVolume')) || 0.3;
        const isMuted = localStorage.getItem('soundMuted') === 'true';
        window.soundManager.setVolume(savedVolume);
        if (isMuted) window.soundManager.toggleMute();
    }
    
    // Reset snake
    snake = [
        {x: 5, y: 10},
        {x: 4, y: 10},
        {x: 3, y: 10}
    ];
    
    // Reset direction
    direction = 'right';
    nextDirection = 'right';
    
    // Reset score and speed
    score = 0;
    scoreElement.textContent = score;
    gameSpeed = 150; // Reset to initial speed
    
    // Generate first food
    generateFood();
    
    // Clear any existing game loop
    if (gameLoop) clearInterval(gameLoop);
    
    // Start the game loop
    gameLoop = setInterval(gameStep, gameSpeed);
    gameStarted = true;
    
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawSnake();
    drawFood();
}

// Main game loop
function gameStep() {
    moveSnake();
    
    // Check for collisions
    if (checkCollision()) {
        gameOver();
        return;
    }
    
    // Check if snake ate the food
    if (snake[0].x === food.x && snake[0].y === food.y) {
        // Play collect sound
        sound.play('collect');
        
        // Increase score
        score += 10;
        scoreElement.textContent = score;
        
        // Generate new food
        generateFood();
        
        // Increase speed slightly (but not too much)
        if (gameSpeed > 50) {
            clearInterval(gameLoop);
            gameSpeed *= 0.98; // Reduced speed increase rate from 0.95 to 0.98
            gameLoop = setInterval(gameStep, gameSpeed);
            
            // Play speed up sound
            sound.play('beep');
        }
    } else {
        // Remove tail if no food was eaten
        snake.pop();
    }
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw everything
    drawSnake();
    drawFood();
}

// Move the snake
function moveSnake() {
    // Update direction
    direction = nextDirection;
    
    // Create new head based on direction
    const head = {x: snake[0].x, y: snake[0].y};
    
    switch(direction) {
        case 'up':
            head.y--;
            break;
        case 'down':
            head.y++;
            break;
        case 'left':
            head.x--;
            break;
        case 'right':
            head.x++;
            break;
    }
    
    // Add new head to beginning of snake array
    snake.unshift(head);
}

// Check for collisions
function checkCollision() {
    const head = snake[0];
    
    // Wall collision
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        return true;
    }
    
    // Self collision (skip the head)
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }
    
    return false;
}

// Generate food at random position
function generateFood() {
    let validPosition = false;
    let foodX, foodY;
    
    // Keep generating until we find a position not occupied by the snake
    while (!validPosition) {
        foodX = Math.floor(Math.random() * tileCount);
        foodY = Math.floor(Math.random() * tileCount);
        
        validPosition = true;
        for (let segment of snake) {
            if (segment.x === foodX && segment.y === foodY) {
                validPosition = false;
                break;
            }
        }
    }
    
    food = {x: foodX, y: foodY};
    sound.play('beep');
}

// Draw the snake
function drawSnake() {
    // Draw each segment
    for (let i = 0; i < snake.length; i++) {
        // Head is a different color
        if (i === 0) {
            ctx.fillStyle = '#4ecdc4'; // Head color
        } else {
            // Body color with slight gradient
            const hue = (120 + i * 2) % 360;
            ctx.fillStyle = `hsl(${hue}, 70%, 50%)`;
        }
        
        // Draw segment with rounded corners
        const x = snake[i].x * gridSize;
        const y = snake[i].y * gridSize;
        const radius = gridSize / 2;
        
        ctx.beginPath();
        ctx.arc(x + radius, y + radius, radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Draw the food
function drawFood() {
    // Draw food as a circle with a gradient
    const gradient = ctx.createRadialGradient(
        food.x * gridSize + gridSize/2,
        food.y * gridSize + gridSize/2,
        0,
        food.x * gridSize + gridSize/2,
        food.y * gridSize + gridSize/2,
        gridSize/2
    );
    gradient.addColorStop(0, '#ff6b6b');
    gradient.addColorStop(1, '#ff8e8e');
    
    ctx.fillStyle = gradient;
    
    // Draw food with a pulsing effect
    const pulse = Math.sin(Date.now() / 100) * 0.1 + 0.9; // Pulsing effect
    const size = gridSize * 0.8 * pulse;
    const offset = (gridSize - size) / 2;
    
    ctx.beginPath();
    ctx.arc(
        food.x * gridSize + gridSize/2,
        food.y * gridSize + gridSize/2,
        size/2,
        0,
        Math.PI * 2
    );
    ctx.fill();
    
    // Add shine effect
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.arc(
        food.x * gridSize + gridSize/2 - size/4,
        food.y * gridSize + gridSize/2 - size/4,
        size/4,
        0,
        Math.PI * 2
    );
    ctx.fill();
}

// Game over
function gameOver() {
    clearInterval(gameLoop);
    gameStarted = false;
    
    // Play game over sound
    sound.play('gameOver');
    
    // Show game over message
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#ff6b6b';
    ctx.font = '30px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    ctx.fillText('GAME OVER', canvas.width/2, canvas.height/2 - 30);
    
    ctx.font = '16px "Press Start 2P", monospace';
    ctx.fillStyle = '#fff';
    ctx.fillText(`Score: ${score}`, canvas.width/2, canvas.height/2 + 20);
}

// Event Listeners
resetBtn.addEventListener('click', () => {
    sound.play('select');
    // Stop any existing game loop
    if (gameLoop) clearInterval(gameLoop);
    // Reset game state
    gameStarted = true;
    // Reinitialize the game
    init();
    // Focus the canvas for keyboard controls
    document.getElementById('gameCanvas').focus();
});

// Keyboard controls
document.addEventListener('keydown', (e) => {
    // Prevent default for arrow keys to stop page scrolling
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
    }
    
    // Store the old direction to check if it changed
    const oldDirection = nextDirection;
    
    // Update direction based on key press, prevent 180-degree turns
    switch(e.key) {
        case 'ArrowUp':
            if (direction !== 'down') nextDirection = 'up';
            break;
        case 'ArrowDown':
            if (direction !== 'up') nextDirection = 'down';
            break;
        case 'ArrowLeft':
            if (direction !== 'right') nextDirection = 'left';
            break;
        case 'ArrowRight':
            if (direction !== 'left') nextDirection = 'right';
            break;
        case ' ':
            // Space to reset the game
            resetBtn.click(); // Trigger reset on space bar
            return;
        case 'm':
            // Mute/unmute with M key
            const isMuted = sound.toggleMute();
            showNotification(isMuted ? '🔇 Sound Off' : '🔊 Sound On');
            return;
        default:
            return; // Exit if no relevant key was pressed
    }
    
    // Play move sound if direction changed
    if (oldDirection !== nextDirection) {
        sound.play('move');
    }
});

// Touch controls for mobile
let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    e.preventDefault();
}, false);

canvas.addEventListener('touchmove', (e) => {
    if (!touchStartX || !touchStartY) return;
    
    const touchEndX = e.touches[0].clientX;
    const touchEndY = e.touches[0].clientY;
    
    const dx = touchStartX - touchEndX;
    const dy = touchStartY - touchEndY;
    
    // Determine the primary direction of the swipe
    if (Math.abs(dx) > Math.abs(dy)) {
        // Horizontal swipe
        if (dx > 0 && direction !== 'right') {
            nextDirection = 'left';
        } else if (dx < 0 && direction !== 'left') {
            nextDirection = 'right';
        }
    } else {
        // Vertical swipe
        if (dy > 0 && direction !== 'down') {
            nextDirection = 'up';
        } else if (dy < 0 && direction !== 'up') {
            nextDirection = 'down';
        }
    }
    
    // Reset touch start coordinates
    touchStartX = 0;
    touchStartY = 0;
    
    e.preventDefault();
}, false);

// Show a temporary notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    // Style the notification
    notification.style.position = 'fixed';
    notification.style.bottom = '30px';
    notification.style.left = '50%';
    notification.style.transform = 'translateX(-50%) translateY(20px)';
    notification.style.background = 'rgba(0, 0, 0, 0.8)';
    notification.style.color = 'white';
    notification.style.padding = '10px 20px';
    notification.style.borderRadius = '50px';
    notification.style.fontSize = '0.9rem';
    notification.style.zIndex = '1000';
    notification.style.opacity = '0';
    notification.style.transition = 'all 0.3s ease';
    notification.style.pointerEvents = 'none';
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(-50%) translateY(0)';
    }, 10);
    
    // Remove after delay
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(-50%) translateY(-20px)';
        
        // Remove from DOM after animation
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 2000);
}

// Initialize the game on first load
window.addEventListener('load', () => {
    // Initialize sound manager if available
    if (window.soundManager) {
        soundManager.setVolume(0.3); // Set volume to 30%
    }
    
    init();
    // Focus the canvas for keyboard controls
    document.getElementById('gameCanvas').focus();
    
    // Show controls help
    showNotification('Use arrow keys to move | M to mute');
});

// Make canvas focusable
document.getElementById('gameCanvas').setAttribute('tabindex', '0');
