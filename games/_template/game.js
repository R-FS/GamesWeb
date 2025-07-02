// Game Configuration
const config = {
    gameId: 'template', // Should be replaced with actual game ID (snake, tictactoe, memory)
    title: 'Game Title', // Should be replaced with actual game title
    instructions: [
        'Instruction 1',
        'Instruction 2',
        'Instruction 3'
    ],
    sounds: {
        // Define game-specific sounds here
        // Example: 'score': 'path/to/score.mp3'
    }
};

// Game State
let gameState = {
    score: 0,
    highScore: 0,
    level: 1,
    isPlaying: false,
    isMuted: false
};

// DOM Elements
let elements = {};

// Initialize the game
function initGame() {
    // Set game title
    document.getElementById('gameTitle').textContent = config.title;
    
    // Cache DOM elements
    elements = {
        gameBoard: document.getElementById('gameBoard'),
        score: document.getElementById('score'),
        highScore: document.getElementById('highScore'),
        level: document.getElementById('level'),
        startBtn: document.getElementById('startBtn'),
        resetBtn: document.getElementById('resetBtn'),
        muteBtn: document.getElementById('muteBtn'),
        backBtn: document.getElementById('backBtn'),
        instructions: document.getElementById('gameInstructions')
    };
    
    // Load saved high score
    loadHighScore();
    
    // Set up event listeners
    setupEventListeners();
    
    // Initialize game board
    initGameBoard();
    
    // Load instructions
    loadInstructions();
    
    // Update UI
    updateUI();
}

// Set up event listeners
function setupEventListeners() {
    // Game controls
    elements.startBtn.addEventListener('click', startGame);
    elements.resetBtn.addEventListener('click', resetGame);
    elements.muteBtn.addEventListener('click', toggleMute);
    elements.backBtn.addEventListener('click', () => {
        window.location.href = '../../index.html';
    });
    
    // Keyboard controls
    document.addEventListener('keydown', handleKeyPress);
}

// Initialize game board
function initGameBoard() {
    // This should be implemented by each game
    elements.gameBoard.innerHTML = '<p>Game board will be initialized here</p>';
}

// Load game instructions
function loadInstructions() {
    const instructionsHTML = config.instructions
        .map(instruction => `<p>${instruction}</p>`)
        .join('');
    elements.instructions.innerHTML = instructionsHTML;
}

// Start the game
function startGame() {
    gameState.isPlaying = true;
    gameState.score = 0;
    gameState.level = 1;
    
    updateUI();
    // Start game loop or initial state
}

// Reset the game
function resetGame() {
    gameState.isPlaying = false;
    gameState.score = 0;
    gameState.level = 1;
    
    updateUI();
    // Reset game board
}

// Update game state
function updateGame() {
    if (!gameState.isPlaying) return;
    
    // Game update logic goes here
    
    // Example:
    // gameState.score += 10;
    // if (gameState.score > gameState.highScore) {
    //     gameState.highScore = gameState.score;
    //     saveHighScore();
    // }
    
    updateUI();
}

// Update UI elements
function updateUI() {
    elements.score.textContent = `Score: ${gameState.score}`;
    elements.highScore.textContent = `High Score: ${gameState.highScore}`;
    elements.level.textContent = `Level: ${gameState.level}`;
    
    // Update button states
    elements.startBtn.disabled = gameState.isPlaying;
    elements.resetBtn.disabled = !gameState.isPlaying && gameState.score === 0;
}

// Handle keyboard input
function handleKeyPress(e) {
    if (!gameState.isPlaying) return;
    
    // Handle game-specific keyboard controls
    // Example:
    // switch(e.key) {
    //     case 'ArrowUp':
    //         // Move up
    //         break;
    //     case 'ArrowDown':
    //         // Move down
    //         break;
    //     // Add more controls as needed
    // }
}

// Toggle mute
function toggleMute() {
    gameState.isMuted = !gameState.isMuted;
    elements.muteBtn.classList.toggle('muted', gameState.isMuted);
    
    // Update sound manager
    if (window.soundManager) {
        window.soundManager.setMute(gameState.isMuted);
    }
    
    // Save preference
    localStorage.setItem(`${config.gameId}_muted`, gameState.isMuted);
}

// Load high score from localStorage
function loadHighScore() {
    const savedHighScore = localStorage.getItem(`${config.gameId}_highScore`);
    if (savedHighScore) {
        gameState.highScore = parseInt(savedHighScore, 10);
    }
    
    // Load mute preference
    const savedMute = localStorage.getItem(`${config.gameId}_muted`);
    if (savedMute !== null) {
        gameState.isMuted = savedMute === 'true';
        elements.muteBtn.classList.toggle('muted', gameState.isMuted);
    }
}

// Save high score to localStorage
function saveHighScore() {
    localStorage.setItem(`${config.gameId}_highScore`, gameState.highScore);
}

// Game over
function gameOver() {
    gameState.isPlaying = false;
    
    // Update high score if needed
    if (gameState.score > gameState.highScore) {
        gameState.highScore = gameState.score;
        saveHighScore();
    }
    
    updateUI();
    
    // Show game over message
    alert(`Game Over! Your score: ${gameState.score}`);
}

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize theme manager
    if (window.themeManager) {
        window.themeManager.initializeTheme();
    }
    
    // Initialize sound manager
    if (window.soundManager) {
        window.soundManager.init();
        window.soundManager.setMute(gameState.isMuted);
    }
    
    // Initialize game
    initGame();
});
