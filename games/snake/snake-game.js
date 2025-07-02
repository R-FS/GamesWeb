// Snake Game - Minimal Version
class SnakeGame {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 20;
        this.tileCount = this.canvas.width / this.gridSize;
        
        // Game state
        this.snake = [];
        this.food = {};
        this.dx = 0;
        this.dy = 0;
        this.score = 0;
        this.highScore = 0;
        this.gameLoop = null;
        this.gameStarted = false;
        this.gamePaused = false;
        
        // Bind methods
        this.init = this.init.bind(this);
        this.start = this.start.bind(this);
        this.pause = this.pause.bind(this);
        this.reset = this.reset.bind(this);
        this.update = this.update.bind(this);
        this.draw = this.draw.bind(this);
        this.placeFood = this.placeFood.bind(this);
        this.gameOver = this.gameOver.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        
        // Initialize
        this.init();
    }
    
    init() {
        // Set canvas size
        this.canvas.width = 400;
        this.canvas.height = 400;
        this.tileCount = this.canvas.width / this.gridSize;
        
        // Load high score
        this.highScore = parseInt(localStorage.getItem('snakeHighScore')) || 0;
        document.getElementById('highScore').textContent = this.highScore;
        
        // Set up event listeners
        document.addEventListener('keydown', this.handleKeyDown);
        
        // Initial draw
        this.reset();
        this.draw();
    }
    
    start() {
        if (!this.gameStarted) {
            // Start new game
            this.reset();
            this.gameStarted = true;
            this.gamePaused = false;
            this.dx = 1; // Start moving right
            this.dy = 0;
            document.getElementById('startBtn').textContent = 'Pause';
            this.gameLoop = setInterval(this.update, 150);
        } else if (this.gamePaused) {
            // Resume game
            this.gamePaused = false;
            document.getElementById('startBtn').textContent = 'Pause';
            this.gameLoop = setInterval(this.update, 150);
            this.draw();
        } else {
            // Pause game
            this.pause();
        }
    }
    
    pause() {
        if (this.gameStarted && !this.gamePaused) {
            clearInterval(this.gameLoop);
            this.gamePaused = true;
            document.getElementById('startBtn').textContent = 'Resume';
            
            // Draw pause screen
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '20px "Press Start 2P", cursive';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
        }
    }
    
    reset(includeHighScore = false) {
        // Clear existing game loop
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        }
        
        // Reset game state
        this.snake = [{x: 10, y: 10}];
        this.dx = 0;
        this.dy = 0;
        this.score = 0;
        document.getElementById('score').textContent = this.score;
        
        // Reset high score if requested
        if (includeHighScore) {
            this.highScore = 0;
            localStorage.removeItem('snakeHighScore');
            document.getElementById('highScore').textContent = '0';
        }
        
        // Place initial food
        this.placeFood();
        
        // Update UI
        document.getElementById('startBtn').textContent = 'Start Game';
        this.gameStarted = false;
        this.gamePaused = false;
        
        // Redraw the initial state
        this.draw();
    }
    
    update() {
        // Don't update if no direction is set yet
        if (this.dx === 0 && this.dy === 0) {
            return;
        }
        
        // Move snake
        const head = {
            x: this.snake[0].x + this.dx,
            y: this.snake[0].y + this.dy
        };
        
        // Check wall collision
        if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount) {
            // Only end game if we're actually moving
            if (this.dx !== 0 || this.dy !== 0) {
                this.gameOver();
                return;
            }
        }
        
        // Check self collision (skip the head)
        for (let i = 1; i < this.snake.length; i++) {  // Start from 1 to skip head
            if (head.x === this.snake[i].x && head.y === this.snake[i].y) {
                this.gameOver();
                return;
            }
        }
        
        // Add new head
        this.snake.unshift(head);
        
        // Check food collision
        if (head.x === this.food.x && head.y === this.food.y) {
            // Increase score
            this.score += 10;
            document.getElementById('score').textContent = this.score;
            
            // Update high score if needed
            if (this.score > this.highScore) {
                this.highScore = this.score;
                document.getElementById('highScore').textContent = this.highScore;
                localStorage.setItem('snakeHighScore', this.highScore);
            }
            
            // Place new food
            this.placeFood();
        } else {
            // Remove tail if no food was eaten
            this.snake.pop();
        }
        
        // Redraw
        this.draw();
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#0f172a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw snake
        this.snake.forEach((segment, index) => {
            this.ctx.fillStyle = index === 0 ? '#22c55e' : '#4ade80';
            this.ctx.fillRect(
                segment.x * this.gridSize,
                segment.y * this.gridSize,
                this.gridSize - 1,
                this.gridSize - 1
            );
        });
        
        // Draw food
        this.ctx.fillStyle = '#ef4444';
        this.ctx.beginPath();
        const foodX = this.food.x * this.gridSize + this.gridSize / 2;
        const foodY = this.food.y * this.gridSize + this.gridSize / 2;
        const radius = this.gridSize / 2 - 1;
        this.ctx.arc(foodX, foodY, radius, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    placeFood() {
        // Find all empty positions
        const emptyPositions = [];
        for (let x = 0; x < this.tileCount; x++) {
            for (let y = 0; y < this.tileCount; y++) {
                const isEmpty = !this.snake.some(segment => segment.x === x && segment.y === y);
                if (isEmpty) {
                    emptyPositions.push({x, y});
                }
            }
        }
        
        // Place food in random empty position
        if (emptyPositions.length > 0) {
            const randomIndex = Math.floor(Math.random() * emptyPositions.length);
            this.food = emptyPositions[randomIndex];
        }
    }
    
    gameOver() {
        clearInterval(this.gameLoop);
        this.gameStarted = false;
        document.getElementById('startBtn').textContent = 'Play Again';
        
        // Draw game over screen
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '20px "Press Start 2P", cursive';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 20);
        this.ctx.font = '14px "Press Start 2P", cursive';
        this.ctx.fillText(`Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 20);
    }
    
    handleKeyDown(e) {
        // Prevent default behavior for arrow keys and space
        if ([32, 37, 38, 39, 40].includes(e.keyCode)) {
            e.preventDefault();
        }
        
        // Change direction (prevent 180-degree turns)
        switch (e.keyCode) {
            case 37: // Left
                if (this.dx === 0) {
                    this.dx = -1;
                    this.dy = 0;
                }
                break;
            case 38: // Up
                if (this.dy === 0) {
                    this.dx = 0;
                    this.dy = -1;
                }
                break;
            case 39: // Right
                if (this.dx === 0) {
                    this.dx = 1;
                    this.dy = 0;
                }
                break;
            case 40: // Down
                if (this.dy === 0) {
                    this.dx = 0;
                    this.dy = 1;
                }
                break;
            case 32: // Space - Pause/Resume
                if (!this.gameStarted && !this.gamePaused) {
                    this.start();
                } else if (this.gamePaused) {
                    this.start(); // This will resume the game
                } else {
                    this.pause();
                }
                break;
        }
    }
}

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
const game = new SnakeGame('gameCanvas');
const resetBtn = document.getElementById('resetBtn');

// Event listeners for buttons
document.getElementById('startBtn').addEventListener('click', () => {
    if (!game.gameStarted) {
        game.start();
    } else if (game.gamePaused) {
        game.start(); // This will resume the game
    } else {
        game.pause();
    }
});

// Add reset button functionality
if (resetBtn) {
    resetBtn.addEventListener('click', () => {
        // Reset the game including high score
        game.reset(true);
        // Clear any existing game loop
        if (game.gameLoop) {
            clearInterval(game.gameLoop);
            game.gameLoop = null;
        }
        // Reset direction to neutral
        game.dx = 0;
        game.dy = 0;
        // Reset UI
        document.getElementById('startBtn').textContent = 'Start Game';
        game.gameStarted = false;
        game.gamePaused = false;
        // Redraw the initial state
        game.draw();
        
        // Show confirmation
        const notification = document.createElement('div');
        notification.textContent = 'High score has been reset';
        notification.style.position = 'fixed';
        notification.style.bottom = '20px';
        notification.style.left = '50%';
        notification.style.transform = 'translateX(-50%)';
        notification.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        notification.style.color = 'white';
        notification.style.padding = '10px 20px';
        notification.style.borderRadius = '5px';
        notification.style.zIndex = '1000';
        document.body.appendChild(notification);
        
        // Remove notification after 2 seconds
        setTimeout(() => {
            notification.remove();
        }, 2000);
    });
}

document.getElementById('backBtn').addEventListener('click', () => {
    window.location.href = '../../index.html';
});

// Initial draw
game.draw();
});
