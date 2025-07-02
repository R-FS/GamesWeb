document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const board = document.getElementById('board');
    const statusDisplay = document.getElementById('status');
    const resetButton = document.getElementById('resetBtn');
    const resetScoresBtn = document.getElementById('resetScoresBtn');
    const modeButtons = document.querySelectorAll('.mode-button');
    const scoreXDisplay = document.getElementById('scoreX');
    const scoreODisplay = document.getElementById('scoreO');
    const scoreTieDisplay = document.getElementById('scoreTie');

    // Game state
    let gameActive = true;
    let currentPlayer = 'X';
    let gameState = ['', '', '', '', '', '', '', '', ''];
    let gameMode = 'ai'; // 'pvp' or 'ai'
    
    // Scores
    let scores = {
        X: 0,
        O: 0,
        tie: 0,
        aiGames: { X: 0, O: 0, tie: 0 }
    };

    // Winning conditions
    const winningConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6]             // Diagonals
    ];

    // Initialize the game board
    function initBoard() {
        board.innerHTML = '';
        for (let i = 0; i < 9; i++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.setAttribute('data-cell-index', i);
            cell.setAttribute('tabindex', '0');
            cell.setAttribute('role', 'button');
            cell.setAttribute('aria-label', `Cell ${i + 1}, empty`);
            cell.addEventListener('click', handleCellClick);
            cell.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleCellClick({ target: cell });
                }
            });
            board.appendChild(cell);
        }
    }

    // Handle cell click
    function handleCellClick(e) {
        const cell = e.target;
        const index = parseInt(cell.getAttribute('data-cell-index'));
        
        // If cell is already filled or game is not active, ignore the click
        if (gameState[index] !== '' || !gameActive) {
            return;
        }
        
        // In AI mode, only allow player (X) to click when it's their turn
        if (gameMode === 'ai' && currentPlayer === 'O') {
            return;
        }
        
        // Make the move
        makeMove(cell, index);
        
        // If we're in AI mode and the game is still active after player's move, let AI make a move
        if (gameMode === 'ai' && gameActive && !checkWin() && gameState.includes('')) {
            setTimeout(makeAIMove, 500);
        }
    }

    // Make a move
    function makeMove(cell, index) {
        // Update game state
        gameState[index] = currentPlayer;
        cell.textContent = currentPlayer;
        cell.classList.add(`player-${currentPlayer}`);
        cell.setAttribute('aria-label', `Cell ${index + 1}, ${currentPlayer}`);
        
        // Check for win or draw
        checkResult();
    }

    // Check for win or draw
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
                // Highlight winning cells
                [a, b, c].forEach(index => {
                    document.querySelector(`[data-cell-index="${index}"]`).classList.add('winner');
                });
                break;
            }
        }
        
        // If someone won
        if (roundWon) {
            // Update scores
            if (gameMode === 'ai') {
                if (currentPlayer === 'X') {
                    scores.aiGames.X++;
                    statusDisplay.textContent = 'You win!';
                } else {
                    scores.aiGames.O++;
                    statusDisplay.textContent = 'AI wins!';
                }
            } else {
                scores[currentPlayer]++;
                statusDisplay.textContent = winningMessage();
            }
            gameActive = false;
            updateScoreboard();
            saveScores();
            return;
        }
        
        // Check for draw
        if (!gameState.includes('')) {
            if (gameMode === 'ai') {
                scores.aiGames.tie++;
            } else {
                scores.tie++;
            }
            statusDisplay.textContent = drawMessage();
            gameActive = false;
            updateScoreboard();
            saveScores();
            return;
        }
        
        // Switch player
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        statusDisplay.textContent = currentPlayerTurn();
        updatePlayerHighlight();
    }

    // AI move (medium difficulty: win/block/random)
    function makeAIMove() {
        if (!gameActive) return;
        // 1. Try to win
        for (let i = 0; i < winningConditions.length; i++) {
            const [a, b, c] = winningConditions[i];
            const line = [gameState[a], gameState[b], gameState[c]];
            if (line.filter(x => x === 'O').length === 2 && line.includes('')) {
                const idx = [a, b, c][line.indexOf('')];
                const cell = document.querySelector(`[data-cell-index="${idx}"]`);
                makeMove(cell, idx);
                return;
            }
        }
        // 2. Block player win
        for (let i = 0; i < winningConditions.length; i++) {
            const [a, b, c] = winningConditions[i];
            const line = [gameState[a], gameState[b], gameState[c]];
            if (line.filter(x => x === 'X').length === 2 && line.includes('')) {
                const idx = [a, b, c][line.indexOf('')];
                const cell = document.querySelector(`[data-cell-index="${idx}"]`);
                makeMove(cell, idx);
                return;
            }
        }
        // 3. Otherwise, pick random
        const emptyCells = [];
        for (let i = 0; i < gameState.length; i++) {
            if (gameState[i] === '') {
                emptyCells.push(i);
            }
        }
        if (emptyCells.length > 0) {
            const randomIndex = Math.floor(Math.random() * emptyCells.length);
            const cellIndex = emptyCells[randomIndex];
            const cell = document.querySelector(`[data-cell-index="${cellIndex}"]`);
            makeMove(cell, cellIndex);
        }
    }

    // Update the scoreboard
    function updateScoreboard() {
        if (gameMode === 'ai') {
            scoreXDisplay.textContent = `You: ${scores.aiGames.X}`;
            scoreODisplay.textContent = `AI: ${scores.aiGames.O}`;
            scoreTieDisplay.textContent = `Ties: ${scores.aiGames.tie}`;
        } else {
            scoreXDisplay.textContent = `Player X: ${scores.X}`;
            scoreODisplay.textContent = `Player O: ${scores.O}`;
            scoreTieDisplay.textContent = `Ties: ${scores.tie}`;
        }
    }

    // Check if there's a winner
    function checkWin() {
        for (let i = 0; i < winningConditions.length; i++) {
            const [a, b, c] = winningConditions[i];
            if (gameState[a] && gameState[a] === gameState[b] && gameState[a] === gameState[c]) {
                return true;
            }
        }
        return false;
    }

    // Update player highlight
    function updatePlayerHighlight() {
        document.querySelectorAll('.player-indicator').forEach(indicator => {
            indicator.classList.remove('active');
        });
        const activeIndicator = document.querySelector(`.player-${currentPlayer.toLowerCase()}`);
        if (activeIndicator) {
            activeIndicator.classList.add('active');
        }
    }

    // Game messages
    const winningMessage = () => `Player ${currentPlayer} wins!`;
    const drawMessage = () => `Game ended in a draw!`;
    const currentPlayerTurn = () => gameMode === 'ai' 
        ? `Your turn (${currentPlayer})` 
        : `Player ${currentPlayer}'s turn`;

    // Save scores to localStorage
    function saveScores() {
        localStorage.setItem('tictactoeScores', JSON.stringify(scores));
    }

    // Load scores from localStorage
    function loadScores() {
        const saved = localStorage.getItem('tictactoeScores');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                scores = { ...scores, ...parsed };
            } catch (e) {
                console.error('Error loading scores:', e);
            }
        }
        updateScoreboard();
    }

    // Reset the game
    function resetGame() {
        gameActive = true;
        currentPlayer = 'X';
        gameState = ['', '', '', '', '', '', '', '', ''];
        
        // Clear the board
        document.querySelectorAll('.cell').forEach(cell => {
            cell.textContent = '';
            cell.className = 'cell';
            cell.setAttribute('aria-label', `Cell ${cell.getAttribute('data-cell-index') + 1}, empty`);
        });
        
        // Update status
        statusDisplay.textContent = currentPlayerTurn();
        statusDisplay.className = 'status';
        
        // Update player highlight
        updatePlayerHighlight();
    }

    // Reset scores
    function resetScores() {
        if (confirm('Are you sure you want to reset all scores?')) {
            if (gameMode === 'ai') {
                scores.aiGames = { X: 0, O: 0, tie: 0 };
            } else {
                scores.X = 0;
                scores.O = 0;
                scores.tie = 0;
            }
            saveScores();
            updateScoreboard();
        }
    }

    // Event listeners
    resetButton.addEventListener('click', resetGame);
    resetScoresBtn.addEventListener('click', resetScores);
    
    // Mode switching
    modeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const newMode = button.getAttribute('data-mode');
            if (gameMode === newMode) return;
            
            // Update mode
            gameMode = newMode;
            
            // Update button states
            modeButtons.forEach(btn => {
                const isActive = btn === button;
                btn.classList.toggle('active', isActive);
                btn.setAttribute('aria-pressed', isActive);
            });
            
            // Reset the game with the new mode
            resetGame();
            updateScoreboard();
        });
    });

    // Initialize the game
    initBoard();
    loadScores();
    updateScoreboard();
    updatePlayerHighlight();
});
