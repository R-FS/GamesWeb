// Game elements
const board = document.getElementById('board');
const statusDisplay = document.getElementById('status');
const resetButton = document.getElementById('resetBtn');
const scoreXDisplay = document.getElementById('scoreX');
const scoreODisplay = document.getElementById('scoreO');
const scoreTieDisplay = document.getElementById('scoreTie');
const modeButtons = document.querySelectorAll('.mode-btn');

// Game state
let gameActive = true;
let currentPlayer = 'X';
let gameState = ['', '', '', '', '', '', '', '', ''];
let gameMode = 'pvp'; // 'pvp' or 'ai'

// Scores
let scores = {
    X: 0,
    O: 0,
    tie: 0
};

// Winning conditions
const winningConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
];

// Messages
const winningMessage = () => `Player ${currentPlayer} wins!`;
const drawMessage = () => `Game ended in a draw!`;
const currentPlayerTurn = () => `Player ${currentPlayer}'s Turn`;

// Simple console notification
function showNotification(message) {
    console.log(message);
}

// Initialize the game
function initGame() {
    gameActive = true;
    currentPlayer = 'X';
    gameState = ['', '', '', '', '', '', '', '', ''];
    
    // Ensure sound manager is properly initialized with saved volume
    if (window.soundManager) {
        const savedVolume = parseFloat(localStorage.getItem('soundVolume')) || 0.3;
        const isMuted = localStorage.getItem('soundMuted') === 'true';
        window.soundManager.setVolume(savedVolume);
        if (isMuted) window.soundManager.toggleMute();
    }
    
    // Clear the board
    board.innerHTML = '';
    
    // Create cells
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.setAttribute('data-cell-index', i);
        cell.addEventListener('click', handleCellClick);
        board.appendChild(cell);
    }
    
    // Update status
    statusDisplay.textContent = currentPlayerTurn();
    updatePlayerHighlight();
}

// Handle cell click
function handleCellClick(e) {
    const clickedCell = e.target;
    const clickedCellIndex = parseInt(clickedCell.getAttribute('data-cell-index'));
    
    // If cell already filled or game not active, ignore
    if (gameState[clickedCellIndex] !== '' || !gameActive) {
        return;
    }
    
    // Make move
    makeMove(clickedCell, clickedCellIndex);
    
    // If AI's turn and in AI mode
    if (gameActive && gameMode === 'ai' && currentPlayer === 'O') {
        setTimeout(makeAIMove, 500);
    }
}

// Make a move
function makeMove(cell, index) {
    // Update game state and UI
    gameState[index] = currentPlayer;
    cell.textContent = currentPlayer;
    cell.classList.add(`player-${currentPlayer}`);
    
    // Check for win or draw
    checkResult();
}

// Check the game result
function checkResult() {
    let roundWon = false;
    
    // Check for win
    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        
        if (gameState[a] === '' || gameState[b] === '' || gameState[c] === '') {
            continue;
        }
        
        if (gameState[a] === gameState[b] && gameState[b] === gameState[c]) {
            roundWon = true;
            break;
        }
    }
    
    // If won
    if (roundWon) {
        scores[currentPlayer]++;
        updateScoreboard();
        statusDisplay.textContent = winningMessage();
        gameActive = false;
        return;
    }
    
    // If draw
    if (!gameState.includes('')) {
        scores.tie++;
        updateScoreboard();
        statusDisplay.textContent = drawMessage();
        gameActive = false;
        return;
    }
    
    // Switch player
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    statusDisplay.textContent = currentPlayerTurn();
    updatePlayerHighlight();
}

// AI move (simple implementation)
function makeAIMove() {
    if (!gameActive) return;
    
    // Find empty cells
    const emptyCells = [];
    for (let i = 0; i < gameState.length; i++) {
        if (gameState[i] === '') {
            emptyCells.push(i);
        }
    }
    
    if (emptyCells.length > 0) {
        // Random move for simplicity
        const randomIndex = Math.floor(Math.random() * emptyCells.length);
        const cellIndex = emptyCells[randomIndex];
        const cell = document.querySelector(`[data-cell-index="${cellIndex}"]`);
        
        // Make the move
        makeMove(cell, cellIndex);
    }
}

// Update the scoreboard
function updateScoreboard() {
    scoreXDisplay.textContent = `X: ${scores.X}`;
    scoreODisplay.textContent = `O: ${scores.O}`;
    scoreTieDisplay.textContent = `Ties: ${scores.tie}`;
}

// Update player highlight
function updatePlayerHighlight() {
    // Update score highlights
    document.querySelectorAll('.score').forEach(score => {
        score.classList.remove('active');
    });
    
    if (currentPlayer === 'X') {
        scoreXDisplay.classList.add('active');
    } else {
        scoreODisplay.classList.add('active');
    }
    
    // Update mode buttons
    modeButtons.forEach(button => {
        const mode = button.getAttribute('data-mode');
        const isActive = mode === gameMode;
        button.classList.toggle('active', isActive);
    });
}

// Play sound effects (stub for future implementation)
function playSound(type) {
    // Sound functionality can be added here if needed
    console.log(`Sound: ${type}`);
}

// Reset scores
function resetScores() {
    scores = { X: 0, O: 0, tie: 0 };
    updateScoreboard();
}

// Event listeners
resetButton.addEventListener('click', () => {
    initGame();
    playSound('reset');
});

// Initial setup
document.addEventListener('DOMContentLoaded', () => {
    // Set up mode buttons
    modeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const newMode = button.getAttribute('data-mode');
            if (newMode !== gameMode) {
                gameMode = newMode;
                resetScores();
                initGame();
                showNotification(`Mode changed to ${gameMode === 'pvp' ? 'Player vs Player' : 'vs Computer'}`);
                
                // Update button states
                modeButtons.forEach(btn => {
                    const isActive = btn.getAttribute('data-mode') === gameMode;
                    btn.classList.toggle('active', isActive);
                });
            }
        });
    });
    
    // Initialize the game
    initGame();
});
