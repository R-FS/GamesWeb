// Gerenciador de estatísticas do jogo
class GameStats {
    constructor(gameId) {
        this.gameId = gameId;
        this.stats = this.loadStats();
    }

    loadStats() {
        const savedStats = localStorage.getItem(`gameStats_${this.gameId}`);
        return savedStats ? JSON.parse(savedStats) : {
            highScore: 0,
            wins: 0,
            bestTime: null
        };
    }

    saveStats() {
        localStorage.setItem(`gameStats_${this.gameId}`, JSON.stringify(this.stats));
    }

    resetStats() {
        // Special handling for Snake game which uses its own storage
        if (this.gameId === 'snake') {
            localStorage.removeItem('snakeHighScore');
            // Update the display immediately
            const highScoreElement = document.getElementById('snake-high-score');
            if (highScoreElement) {
                highScoreElement.textContent = '0';
            }
        }
        
        // Reset the stats object
        this.stats = {
            highScore: 0,
            wins: 0,
            bestTime: null
        };
        
        // Remove the stats from localStorage
        localStorage.removeItem(`gameStats_${this.gameId}`);
        
        // Update the display
        this.updateDisplay();
        
        // Show a confirmation message
        showNotification(`${this.gameId} stats have been reset`);
    }

    updateHighScore(score) {
        if (score > this.stats.highScore) {
            this.stats.highScore = score;
            this.saveStats();
            this.updateDisplay();
        }
    }

    updateWins() {
        this.stats.wins++;
        this.saveStats();
        this.updateDisplay();
    }

    updateBestTime(time) {
        if (!this.stats.bestTime || time < this.stats.bestTime) {
            this.stats.bestTime = time;
            this.saveStats();
            this.updateDisplay();
        }
    }

    updateDisplay() {
        // Special handling for Snake game
        if (this.gameId === 'snake') {
            const highScoreElement = document.getElementById('snake-high-score');
            if (highScoreElement) {
                // Get the high score from localStorage to ensure it's up to date
                const snakeHighScore = localStorage.getItem('snakeHighScore') || '0';
                highScoreElement.textContent = snakeHighScore;
                this.stats.highScore = parseInt(snakeHighScore) || 0;
            }
            return;
        }
        
        // Default handling for other games
        const gameCard = document.querySelector(`[href="games/${this.gameId}/index.html"]`);
        if (gameCard) {
            const highScore = gameCard.querySelector('.high-score');
            const wins = gameCard.querySelector('.wins');
            const bestTime = gameCard.querySelector('.best-time');
            
            if (highScore) highScore.textContent = `🏆 High Score: ${this.stats.highScore}`;
            if (wins) wins.textContent = `🏆 Wins: ${this.stats.wins}`;
            if (bestTime) {
                bestTime.textContent = this.stats.bestTime 
                    ? `⏱️ Best Time: ${this.formatTime(this.stats.bestTime)}` 
                    : `⏱️ Best Time: -`;
            }
        }
    }

    formatTime(time) {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
}

// Gerenciador de UI das estatísticas
class StatsUI {
    constructor() {
        this.gameSelect = document.getElementById('gameSelect');
        this.resetBtn = document.getElementById('resetStats');
        this.currentGame = this.gameSelect.value;
        this.gameStats = new GameStats(this.currentGame);
        this.initialize();
    }

    initialize() {
        this.setupEventListeners();
        this.updateStatsDisplay();
    }

    setupEventListeners() {
        this.gameSelect.addEventListener('change', (e) => {
            this.currentGame = e.target.value;
            this.gameStats = new GameStats(this.currentGame);
            this.updateStatsDisplay();
        });

        this.resetBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to reset stats for ' + this.currentGame + '?')) {
                this.gameStats.resetStats();
                this.updateStatsDisplay();
            }
        });
    }

    updateStatsDisplay() {
        const statsDisplay = document.getElementById('currentStats');
        if (statsDisplay) {
            const { highScore, wins, bestTime } = this.gameStats.stats;
            statsDisplay.innerHTML = `
                <h3>Current Stats for ${this.currentGame}</h3>
                <ul>
                    <li>🏆 High Score: ${highScore}</li>
                    <li>🏆 Wins: ${wins}</li>
                    <li>⏱️ Best Time: ${bestTime ? this.gameStats.formatTime(bestTime) : '-'}</li>
                </ul>
            `;
        }
    }
}

// Inicializar estatísticas e UI quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    const games = ['snake', 'tictactoe', 'memory'];
    games.forEach(game => {
        new GameStats(game);
    });
    new StatsUI();
});

// Animação de carregamento
class LoadingAnimation {
    constructor() {
        this.loadingElement = document.querySelector('.loading-animation');
        this.gamesGrid = document.querySelector('.games-grid');
        this.initialize();
    }

    initialize() {
        // Mostrar animação de carregamento
        this.loadingElement.classList.add('active');
        this.gamesGrid.style.opacity = '0';
        
        // Simular carregamento
        setTimeout(() => {
            this.loadingElement.classList.remove('active');
            this.gamesGrid.style.opacity = '1';
            this.gamesGrid.style.transition = 'opacity 0.3s ease';
        }, 1000);
    }
}

// Inicializar animação de carregamento
document.addEventListener('DOMContentLoaded', () => {
    new LoadingAnimation();
});
