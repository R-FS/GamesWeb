// Game settings
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startBtn');
const backBtn = document.getElementById('backBtn');
const scoreElement = document.getElementById('score');

// Grid and cell size
const gridSize = 20;
const tileCount = canvas.width / gridSize;

// Game state
let snake = [];
let food = {};
let dx = 0;
let dy = 0;
let score = 0;
let gameLoop;
let gameStarted = false;

// Initialize the game
function initGame() {
    // Reset state
    snake = [
        {x: 10, y: 10}
    ];
    score = 0;
    scoreElement.textContent = score;
    dx = 0;
    dy = 0;
    
    // Place food
    placeFood();
    
    // Clear any existing game loop
    if (gameLoop) {
        clearInterval(gameLoop);
    }
    
    // Start the game
    gameStarted = true;
    gameLoop = setInterval(update, 100);
}

// Draw the game
function draw() {
    // Clear the canvas
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw the snake
    ctx.fillStyle = '#2ecc71';
    snake.forEach(segment => {
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
    });
    
    // Draw the food
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);
}

// Update game state
function update() {
    // Move the snake
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};
    snake.unshift(head);
    
    // Check food collision
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreElement.textContent = score;
        placeFood();
    } else {
        // Remove tail only if food wasn't eaten
        snake.pop();
    }
    
    // Check wall collision
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        gameOver();
        return;
    }
    
    // Check self collision
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            gameOver();
            return;
        }
    }
    
    // Draw the game
    draw();
}

// Place food at random position
function placeFood() {
    food = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
    };
    
    // Make sure food doesn't appear on snake
    for (let segment of snake) {
        if (segment.x === food.x && segment.y === food.y) {
            return placeFood();
        }
    }
}

// Game over
function gameOver() {
    clearInterval(gameLoop);
    gameStarted = false;
    alert(`Game Over! Your score: ${score}`);
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
    if (!gameStarted) return;
    
    switch(e.key) {
        case 'ArrowUp':
            if (dy !== 1) { dx = 0; dy = -1; }
            break;
        case 'ArrowDown':
            if (dy !== -1) { dx = 0; dy = 1; }
            break;
        case 'ArrowLeft':
            if (dx !== 1) { dx = -1; dy = 0; }
            break;
        case 'ArrowRight':
            if (dx !== -1) { dx = 1; dy = 0; }
            break;
    }
});

// Event Listeners
startBtn.addEventListener('click', () => {
    if (!gameStarted) {
        initGame();
        startBtn.textContent = 'Restart';
    } else {
        initGame();
    }
});

backBtn.addEventListener('click', () => {
    window.location.href = '../../index.html';
});

// Initialize game when page loads
window.addEventListener('load', () => {
    draw();
});
