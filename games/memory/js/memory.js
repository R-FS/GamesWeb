// Game elements
const gameBoard = document.getElementById('gameBoard');
const movesDisplay = document.getElementById('moves');
const timeDisplay = document.getElementById('time');
const resetBtn = document.getElementById('resetBtn');
const backBtn = document.getElementById('backBtn');
const playAgainBtn = document.getElementById('playAgainBtn');
const winMessage = document.getElementById('winMessage');
const finalMoves = document.getElementById('finalMoves');
const finalTime = document.getElementById('finalTime');
const difficultyButtons = document.querySelectorAll('.difficulty-buttons .btn');

// Game state
let cards = [];
let hasFlippedCard = false;
let lockBoard = false;
let firstCard, secondCard;
let moves = 0;
let matches = 0;
let timer = null;
let seconds = 0;
let gameStarted = false;
let currentDifficulty = 'easy';

// Emoji pairs for the game (using emoji characters for simplicity)
const emojiPairs = [
    '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼',
    '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔',
    '🐧', '🐦', '🐤', '🦆', '🦅', '🦉', '🦇', '🐺',
    '🐗', '🐴', '🦄', '🐝', '🦋', '🐌', '🐞', '🦂'
];

// Sound effects
const sound = window.soundManager || {
    play: () => {},
    muted: false
};

// Initialize the game
document.addEventListener('DOMContentLoaded', () => {
    // Initialize sound manager with saved settings if available
    if (window.soundManager) {
        const savedVolume = parseFloat(localStorage.getItem('soundVolume')) || 0.3;
        const isMuted = localStorage.getItem('soundMuted') === 'true';
        soundManager.setVolume(savedVolume);
        if (isMuted) soundManager.toggleMute();
    }
    
    // Set up event listeners
    setupEventListeners();
    
    // Start with easy difficulty
    startNewGame('easy');

    // Show wins area
    updateMemoryWinsDisplay();

    // Add reset scores button handler
    const resetScoresBtn = document.getElementById('resetScoresBtn');
    if (resetScoresBtn) {
        resetScoresBtn.addEventListener('click', () => {
            if (window.soundManager) sound.play('select');
            localStorage.setItem('memoryWins', JSON.stringify({easy:0, medium:0, hard:0}));
            updateMemoryWinsDisplay();
        });
    }

    // Show controls help
    showNotification('Find all matching pairs!');
});

// Set up event listeners
function setupEventListeners() {
    // Reset button
    resetBtn.addEventListener('click', () => {
        sound.play('select');
        startNewGame(currentDifficulty);
    });
    
    // Back to main menu
    backBtn.addEventListener('click', () => {
        sound.play('select');
        window.location.href = '../../index.html';
    });
    
    // Play again button
    playAgainBtn.addEventListener('click', () => {
        sound.play('select');
        winMessage.classList.remove('show');
        startNewGame(currentDifficulty);
    });
    
    // Difficulty buttons
    difficultyButtons.forEach(button => {
        button.addEventListener('click', () => {
            sound.play('select');
            const difficulty = button.getAttribute('data-difficulty');
            startNewGame(difficulty);
            
            // Update active button
            difficultyButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        });
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            resetBtn.click();
        } else if (e.key === 'm' || e.key === 'M') {
            // Mute/unmute with M key
            const isMuted = sound.toggleMute ? sound.toggleMute() : false;
            showNotification(isMuted ? '🔇 Sound Off' : '🔊 Sound On');
        } else if (e.key === '1') {
            document.querySelector('[data-difficulty="easy"]').click();
        } else if (e.key === '2') {
            document.querySelector('[data-difficulty="medium"]').click();
        } else if (e.key === '3') {
            document.querySelector('[data-difficulty="hard"]').click();
        }
    });
}

// Start a new game
function startNewGame(difficulty) {
    // Reset game state
    clearInterval(timer);
    gameBoard.innerHTML = '';
    cards = [];
    moves = 0;
    matches = 0;
    seconds = 0;
    gameStarted = false;
    updateMemoryWinsDisplay();
    lockBoard = false;
    hasFlippedCard = false;
    
    // Update UI
    movesDisplay.textContent = moves;
    timeDisplay.textContent = seconds;
    
    // Set difficulty
    currentDifficulty = difficulty;
    let rows, cols;
    
    switch(difficulty) {
        case 'easy':
            rows = 4;
            cols = 4;
            break;
        case 'medium':
            rows = 4;
            cols = 5;
            break;
        case 'hard':
            rows = 5;
            cols = 6;
            break;
        default:
            rows = 4;
            cols = 4;
    }
    
    // Update grid layout
    gameBoard.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    
    // Create cards
    createCards(rows * cols / 2);
    
    // Shuffle and render cards
    shuffleCards();
    
    // Start timer on first click
    gameBoard.addEventListener('click', startTimer, { once: true });
}

// Create card elements
function createCards(pairsCount) {
    // Clear existing cards
    gameBoard.innerHTML = '';
    
    // Get emoji pairs for the game
    const emojis = emojiPairs.slice(0, pairsCount);
    const cardEmojis = [...emojis, ...emojis];
    
    // Create card elements
    cardEmojis.forEach((emoji, index) => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.emoji = emoji;
        card.dataset.index = index;
        
        // Card front (emoji)
        const cardFront = document.createElement('div');
        cardFront.classList.add('card-face', 'card-front');
        cardFront.textContent = emoji;
        
        // Card back (pattern)
        const cardBack = document.createElement('div');
        cardBack.classList.add('card-face', 'card-back');
        
        // Add elements to card
        card.appendChild(cardFront);
        card.appendChild(cardBack);
        
        // Add click event
        card.addEventListener('click', flipCard);
        
        // Add to game board and cards array
        gameBoard.appendChild(card);
        cards.push(card);
    });
}

// Shuffle cards using Fisher-Yates algorithm
function shuffleCards() {
    cards.forEach(card => {
        const randomPos = Math.floor(Math.random() * cards.length);
        card.style.order = randomPos;
    });
}

// Start the game timer
function startTimer() {
    if (!gameStarted) {
        gameStarted = true;
        timer = setInterval(() => {
            seconds++;
            timeDisplay.textContent = seconds;
        }, 1000);
    }
}

// Flip a card
function flipCard() {
    if (lockBoard) return;
    if (this === firstCard) return;
    
    // Play flip sound
    sound.play('move');
    
    this.classList.add('flipped');
    
    if (!hasFlippedCard) {
        // First card flipped
        hasFlippedCard = true;
        firstCard = this;
        return;
    }
    
    // Second card flipped
    secondCard = this;
    moves++;
    movesDisplay.textContent = moves;
    
    checkForMatch();
}

// Check if the flipped cards match
function checkForMatch() {
    const isMatch = firstCard.dataset.emoji === secondCard.dataset.emoji;
    
    if (isMatch) {
        // Play match sound
        sound.play('collect');
        
        // Disable cards
        disableCards();
        
        // Check for win
        matches++;
        if (matches === cards.length / 2) {
            endGame();
        }
    } else {
        // Play no match sound
        sound.play('error');
        
        // Unflip cards
        lockBoard = true;
        setTimeout(() => {
            firstCard.classList.remove('flipped');
            secondCard.classList.remove('flipped');
            resetBoard();
        }, 1000);
    }
}

// Disable matched cards
function disableCards() {
    firstCard.removeEventListener('click', flipCard);
    secondCard.removeEventListener('click', flipCard);
    firstCard.classList.add('matched');
    secondCard.classList.add('matched');
    
    resetBoard();
}

// Reset the board state
function resetBoard() {
    [hasFlippedCard, lockBoard] = [false, false];
    [firstCard, secondCard] = [null, null];
}

// End the game
function endGame() {
    clearInterval(timer);
    
    // Play win sound
    sound.play('win');
    
    // Show win message
    finalMoves.textContent = moves;
    finalTime.textContent = seconds;
    
    // Calculate score (lower moves and time is better)
    const score = Math.max(0, 1000 - (moves * 10) - (seconds * 5));

    // Increment wins for current difficulty
    incrementMemoryWins(currentDifficulty);
    updateMemoryWinsDisplay();

    setTimeout(() => {
        winMessage.classList.add('show');
    }, 1000);
}

// Increment win count in localStorage
function incrementMemoryWins(difficulty) {
    const wins = JSON.parse(localStorage.getItem('memoryWins') || '{"easy":0,"medium":0,"hard":0}');
    if (!wins[difficulty]) wins[difficulty] = 0;
    wins[difficulty]++;
    localStorage.setItem('memoryWins', JSON.stringify(wins));
}

// Update wins display area
function updateMemoryWinsDisplay() {
    const wins = JSON.parse(localStorage.getItem('memoryWins') || '{"easy":0,"medium":0,"hard":0}');
    const winsArea = document.getElementById('memory-wins-area');
    if (winsArea) {
        winsArea.innerHTML = `
            <span class="memory-win memory-win-easy">${wins.easy||0}</span>
            <span class="memory-win memory-win-sep">|</span>
            <span class="memory-win memory-win-medium">${wins.medium||0}</span>
            <span class="memory-win memory-win-sep">|</span>
            <span class="memory-win memory-win-hard">${wins.hard||0}</span>
        `;
    }
}


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
    notification.style.whiteSpace = 'nowrap';
    
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
