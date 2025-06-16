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
    
    // Reset status display styles
    statusDisplay.classList.remove('win-message', 'draw-message');
    statusDisplay.style.opacity = '1';
    statusDisplay.style.transform = 'none';
    statusDisplay.style.transition = 'none';
    
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

// Make a move with enhanced visual and audio feedback
function makeMove(cell, index) {
    // Play move sound with a bit of randomness for variety
    playSound('move');
    
    // Add pop-in animation with slight rotation for more dynamic feel
    cell.style.transform = 'scale(0) rotate(-15deg)';
    cell.style.opacity = '0';
    
    // Update game state and UI
    gameState[index] = currentPlayer;
    cell.textContent = currentPlayer;
    cell.classList.add(`player-${currentPlayer}`);
    
    // Add a subtle particle effect on cell fill
    createParticles(cell, currentPlayer === 'X' ? '#ff6b6b' : '#4ecdc4');
    
    // Animate cell appearance with bounce effect
    requestAnimationFrame(() => {
        cell.style.transition = 'all 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55)';
        cell.style.transform = 'scale(1.1) rotate(0deg)';
        cell.style.opacity = '1';
        
        // Bounce back after scaling up
        setTimeout(() => {
            cell.style.transition = 'all 0.2s ease-out';
            cell.style.transform = 'scale(1) rotate(0deg)';
        }, 150);
    });
    
    // Add a subtle glow to the cell that fades out
    const glowColor = currentPlayer === 'X' ? 'rgba(255, 107, 107, 0.7)' : 'rgba(78, 205, 196, 0.7)';
    cell.style.boxShadow = `0 0 25px ${glowColor}`;
    cell.style.transition = 'box-shadow 0.6s ease-out';
    
    setTimeout(() => {
        cell.style.boxShadow = '0 0 5px rgba(0,0,0,0.1)';
    }, 300);
    
    // Add a subtle pulse effect to the board
    const board = document.getElementById('board');
    board.style.transform = 'scale(1.02)';
    setTimeout(() => {
        board.style.transition = 'transform 0.3s ease-out';
        board.style.transform = 'scale(1)';
    }, 50);
    
    // Check for win or draw after animations
    setTimeout(() => checkResult(), 100);
}

// Create particle effect for moves
function createParticles(element, color) {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    for (let i = 0; i < 8; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.backgroundColor = color;
        particle.style.left = `${centerX}px`;
        particle.style.top = `${centerY}px`;
        document.body.appendChild(particle);
        
        const angle = (i / 8) * Math.PI * 2;
        const distance = 20 + Math.random() * 30;
        
        // Animate particle
        const animation = particle.animate([
            { 
                transform: 'translate(0, 0) scale(1)',
                opacity: 0.8 
            },
            { 
                transform: `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px) scale(0.2)`,
                opacity: 0 
            }
        ], {
            duration: 600,
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
        });
        
        // Remove particle after animation
        animation.onfinish = () => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        };
    }
}

// Check the game result
function checkResult() {
    let roundWon = false;
    let winningCombination = [];
    
    // Check win conditions
    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        if (gameState[a] === '' || gameState[b] === '' || gameState[c] === '') {
            continue;
        }
        if (gameState[a] === gameState[b] && gameState[b] === gameState[c]) {
            roundWon = true;
            winningCombination = [a, b, c];
            break;
        }
    }
    
    // Check for win
    if (roundWon) {
        gameActive = false;
        
        // Animate winning cells
        winningCombination.forEach((index, i) => {
            const cell = document.querySelector(`[data-cell-index="${index}"]`);
            if (cell) {
                cell.classList.add('winner');
                // Stagger the animation
                setTimeout(() => {
                    cell.style.animation = 'pulse 0.5s ease-in-out';
                }, i * 100);
            }
        });
        
        // Update UI with delay for better effect
        setTimeout(() => {
            statusDisplay.textContent = winningMessage();
            statusDisplay.classList.add('win-message');
            scores[currentPlayer]++;
            updateScoreboard();
            playSound('win');
            
            // Confetti effect
            if (window.confetti) {
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: currentPlayer === 'X' ? ['#ff6b6b'] : ['#4ecdc4']
                });
            }
        }, 300);
        
        return;
    }
    
    // Check for draw
    if (!gameState.includes('')) {
        gameActive = false;
        statusDisplay.textContent = drawMessage();
        statusDisplay.classList.add('draw-message');
        scores.tie++;
        updateScoreboard();
        playSound('draw');
        return;
    }
    
    // Switch player with animation
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    statusDisplay.style.opacity = '0';
    statusDisplay.style.transform = 'translateY(-10px)';
    
    setTimeout(() => {
        statusDisplay.textContent = currentPlayerTurn();
        statusDisplay.style.opacity = '1';
        statusDisplay.style.transform = 'translateY(0)';
        statusDisplay.style.transition = 'all 0.3s ease';
    }, 150);
    
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

// Play sound effects with more variety and character
function playSound(type) {
    if (!window.soundManager) {
        console.log('SoundManager not available');
        return;
    }
    
    console.log('Playing sound:', type);
    
    // Use the built-in sound manager methods when available
    if (type === 'move' && window.soundManager.sounds.move) {
        window.soundManager.sounds.move();
        return;
    }
    
    if (type === 'win' && window.soundManager.sounds.victory) {
        window.soundManager.sounds.victory();
        return;
    }
    
    // Fallback to custom sounds if specific ones aren't available
    const sounds = {
        move: [
            { freq: 440, type: 'sine', duration: 0.1, vol: 0.6 },
            { freq: 660, type: 'sine', duration: 0.08, vol: 0.4 }
        ],
        win: [
            { freq: 880, type: 'sine', duration: 0.2, vol: 0.8 },
            { freq: 1320, type: 'sine', duration: 0.3, vol: 0.6 },
            { freq: 1760, type: 'sine', duration: 0.4, vol: 0.4 }
        ],
        draw: [
            { freq: 220, type: 'sine', duration: 0.4, vol: 0.7 },
            { freq: 165, type: 'sine', duration: 0.6, vol: 0.5 },
            { freq: 110, type: 'sine', duration: 0.8, vol: 0.3 }
        ],
        reset: [
            { freq: 110, type: 'sawtooth', duration: 0.3, vol: 0.7 },
            { freq: 73, type: 'sawtooth', duration: 0.5, vol: 0.5 }
        ],
        error: [
            { freq: 220, type: 'square', duration: 0.1, vol: 0.7 },
            { freq: 110, type: 'square', duration: 0.15, vol: 0.5 }
        ]
    };
    
    const soundSet = sounds[type];
    if (soundSet) {
        soundSet.forEach((sound, index) => {
            // Stagger the sounds slightly for a more natural feel
            setTimeout(() => {
                if (window.soundManager) {
                    const originalVolume = window.soundManager.volume;
                    window.soundManager.setVolume(originalVolume * (sound.vol || 1));
                    window.soundManager.playTone(sound.freq, sound.duration, sound.type);
                    // Restore original volume after a short delay
                    setTimeout(() => {
                        if (window.soundManager) {
                            window.soundManager.setVolume(originalVolume);
                        }
                    }, sound.duration * 1000);
                }
            }, index * 80); // 80ms between sounds in a set
        });
    }
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

// Initialize the game when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Ensure sound manager is available
    if (!window.soundManager) {
        console.warn('SoundManager not found. Sounds will be disabled.');
    } else {
        // Initialize sound manager if needed
        if (window.soundManager.initialize) {
            window.soundManager.initialize();
        }
        
        // Set initial volume from localStorage if available
        const savedVolume = localStorage.getItem('soundVolume');
        if (savedVolume !== null) {
            window.soundManager.setVolume(parseFloat(savedVolume));
        }
        
        // Set initial mute state
        const isMuted = localStorage.getItem('soundMuted') === 'true';
        if (isMuted) {
            window.soundManager.mute();
        } else {
            window.soundManager.unmute();
        }
    }
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
