// Configuração do jogo
const config = {
    tileCount: 20,      // Número de blocos por linha/coluna
    initialSpeed: 150,  // Velocidade inicial em ms
    minSpeed: 50,       // Velocidade mínima
    speedIncrement: 2,  // Quanto a velocidade aumenta a cada nível
    pointsPerFood: 10,  // Pontos por comida
    pointsToLevelUp: 100, // Pontos necessários para subir de nível
    gameId: 'snakeGame' // ID para salvar no localStorage
};

// Estado do jogo
const gameState = {
    canvas: null,
    ctx: null,
    tileSize: 0,
    snake: [],
    food: { x: 0, y: 0 },
    velocity: { x: 1, y: 0 },
    direction: 'right',
    nextDirection: 'right',
    score: 0,
    highScore: 0,
    level: 1,
    isPlaying: false,
    isPaused: false,
    isMuted: false,
    gameLoop: null
};

// Elementos da DOM
let elements = {};

// Inicialização do jogo
function initGame() {
    // Obter elementos da DOM
    elements.canvas = document.createElement('canvas');
    elements.ctx = elements.canvas.getContext('2d');
    elements.score = document.getElementById('score');
    elements.highScore = document.getElementById('highScore');
    elements.startBtn = document.getElementById('startBtn');
    elements.backBtn = document.getElementById('backBtn');
    elements.muteBtn = document.getElementById('muteBtn');
    
    // Configurar o canvas
    const gameBoard = document.getElementById('gameBoard');
    gameBoard.innerHTML = '';
    gameBoard.appendChild(elements.canvas);
    
    // Configura os eventos
    setupEventListeners();
    
    // Carrega a pontuação máxima
    loadHighScore();
    
    // Atualiza a interface
    updateUI();
    
    // Desenha o estado inicial do jogo
    drawGame();
    
    // Redimensionar o canvas
    resizeCanvas();
}

// Redimensionar o canvas
function resizeCanvas() {
    const gameBoard = document.getElementById('gameBoard');
    const size = Math.min(gameBoard.clientWidth, gameBoard.clientHeight);
    elements.canvas.width = size;
    elements.canvas.height = size;
    gameState.tileSize = size / config.tileCount;
    
    // Redesenhar o jogo se estiver em andamento
    if (gameState.isPlaying) {
        drawGame();
    }
}

// Configurar os eventos
function setupEventListeners() {
    // Controles de teclado
    document.addEventListener('keydown', handleKeyPress);
    
    // Botões de controle
    elements.startBtn.addEventListener('click', () => {
        if (!gameState.isPlaying) {
            startGame();
        }
    });
    
    elements.backBtn.addEventListener('click', () => {
        if (confirm('Deseja mesmo sair do jogo?')) {
            window.location.href = '../../index.html';
        }
    });
    
    elements.muteBtn.addEventListener('click', toggleMute);
    
    // Toque na tela para dispositivos móveis
    elements.canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    elements.canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
}

// Manipuladores de toque para dispositivos móveis
let touchStartX = 0;
let touchStartY = 0;

function handleTouchStart(e) {
    e.preventDefault();
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
}

function handleTouchMove(e) {
    if (!gameState.isPlaying) return;
    e.preventDefault();
    
    const touchX = e.touches[0].clientX;
    const touchY = e.touches[0].clientY;
    const dx = touchX - touchStartX;
    const dy = touchY - touchStartY;
    
    // Determinar a direção com base no movimento
    if (Math.abs(dx) > Math.abs(dy)) {
        // Movimento horizontal
        if (dx > 10 && gameState.direction !== 'left') {
            gameState.velocity = { x: 1, y: 0 };
            gameState.direction = 'right';
        } else if (dx < -10 && gameState.direction !== 'right') {
            gameState.velocity = { x: -1, y: 0 };
            gameState.direction = 'left';
        }
    } else {
        // Movimento vertical
        if (dy > 10 && gameState.direction !== 'down') {
            gameState.velocity = { x: 0, y: 1 };
            gameState.direction = 'up';
        } else if (dy < -10 && gameState.direction !== 'up') {
            gameState.velocity = { x: 0, y: -1 };
            gameState.direction = 'down';
        }
    }
}
        upBtn.addEventListener('click', () => {
            if (gameState.direction !== 'down') {
                gameState.velocity = { x: 0, y: -1 };
                gameState.direction = 'up';
            }
        });
        
        downBtn.addEventListener('click', () => {
            if (gameState.direction !== 'up') {
                gameState.velocity = { x: 0, y: 1 };
                gameState.direction = 'down';
            }
        });
        
        leftBtn.addEventListener('click', () => {
            if (gameState.direction !== 'right') {
                gameState.velocity = { x: -1, y: 0 };
                gameState.direction = 'left';
            }
        });
        
        rightBtn.addEventListener('click', () => {
            if (gameState.direction !== 'left') {
                gameState.velocity = { x: 1, y: 0 };
                gameState.direction = 'right';
            }
        });
    }
}

// Reinicia o jogo
function resetGame() {
    // Limpa o loop do jogo se existir
    if (gameState.gameLoop) {
        clearInterval(gameState.gameLoop);
        gameState.gameLoop = null;
    }
    
    // Reseta o estado do jogo
    gameState.score = 0;
    gameState.level = 1;
    gameState.speed = config.initialSpeed;
    gameState.snake = [
        { x: Math.floor(config.tileCount / 2), y: Math.floor(config.tileCount / 2) }
    ];
    gameState.direction = 'right';
    gameState.velocity = { x: 1, y: 0 };
    gameState.isPlaying = false;
    
    // Posiciona a comida inicial
    placeFood();
    
    // Atualiza a interface
    updateUI();
    
    // Redesenha o jogo
    drawGame();
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
    try {
        // Evita múltiplas inicializações simultâneas
        if (gameState.isPlaying) {
            console.log('O jogo já está em andamento');
            return false;
        }
        
        // Prepara o estado inicial do jogo
        gameState.isPlaying = true;
        gameState.score = 0;
        gameState.level = 1;
        gameState.speed = 150;
        gameState.lastMoveSound = 0;
        gameState.lastDrawTime = 0;
        gameState.lastUIUpdate = 0;
        
        // Inicializa a cobra
        try {
            const startX = Math.max(5, Math.min(gameState.tileCount - 5, Math.floor(gameState.tileCount / 2)));
            const startY = Math.max(5, Math.min(gameState.tileCount - 5, 10));
            
            gameState.snake = [
                { x: startX, y: startY },
                { x: startX - 1, y: startY },
                { x: startX - 2, y: startY }
            ];
            
            // Direção inicial
            gameState.direction = 'right';
            gameState.velocity = { x: 1, y: 0 };
            
            // Posiciona a primeira comida
            placeFood();
            
            // Limpa qualquer loop de jogo existente
            if (gameState.gameLoop) {
                clearInterval(gameState.gameLoop);
                gameState.gameLoop = null;
            }
            
            // Inicia o loop principal do jogo
            gameState.gameLoop = setInterval(() => {
                try {
                    updateGame();
                } catch (e) {
                    console.error('Erro no loop do jogo:', e);
                    // Tenta recuperar reiniciando o jogo
                    try {
                        gameOver();
                        startGame();
                    } catch (recoveryError) {
                        console.error('Falha na recuperação do jogo:', recoveryError);
                        alert('Ocorreu um erro no jogo. A página será recarregada.');
                        window.location.reload();
                    }
                }
            }, gameState.speed);
            
            // Atualiza a interface do usuário
            updateUI();
            
            // Reproduz som de início de jogo
            playSound('start');
            
            // Foca o canvas para garantir que os controles do teclado funcionem
            if (elements.canvas) {
                elements.canvas.focus();
            }
            
            // Dispara um evento personalizado para notificar que o jogo começou
            const event = new CustomEvent('gameStarted', { 
                detail: { 
                    level: gameState.level,
                    timestamp: Date.now()
                }
            });
            window.dispatchEvent(event);
            
            return true;
            
        } catch (e) {
            console.error('Erro ao inicializar o jogo:', e);
            gameState.isPlaying = false;
            
            // Tenta notificar o usuário sobre o erro
            try {
                alert('Não foi possível iniciar o jogo. Por favor, recarregue a página e tente novamente.');
            } catch (alertError) {
                console.error('Falha ao exibir mensagem de erro:', alertError);
            }
            
            return false;
        }
        
    } catch (e) {
        console.error('Erro crítico em startGame:', e);
        return false;
    }
}

// Reinicia o jogo
function resetGame() {
    // Limpa o loop do jogo se existir
    if (gameState.gameLoop) {
        clearInterval(gameState.gameLoop);
        gameState.gameLoop = null;
    }
    
    // Reseta o estado do jogo
    gameState.isPlaying = false;
    gameState.score = 0;
    gameState.level = 1;
    gameState.speed = config.initialSpeed;
    gameState.snake = [
        { x: Math.floor(config.tileCount / 2), y: Math.floor(config.tileCount / 2) }
    ];
    gameState.direction = 'right';
    gameState.velocity = { x: 1, y: 0 };
    
    // Limpa o canvas
    if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    
    // Posiciona a comida inicial
    placeFood();
    
    // Atualiza a interface
    updateUI();
    
    // Redesenha o jogo
    drawGame();
}

// Move a cobra
function moveSnake() {
    const head = { ...gameState.snake[0] }; // Cria uma cópia da cabeça atual
    
    // Atualiza a posição da cabeça com base na velocidade
    head.x += gameState.velocity.x;
    head.y += gameState.velocity.y;
    
    // Adiciona a nova cabeça ao início do array
    gameState.snake.unshift(head);
    
    // Verifica se a cobra comeu a comida
    if (head.x === gameState.food.x && head.y === gameState.food.y) {
        // Aumenta a pontuação
        gameState.score += config.pointsPerFood;
        
        // Verifica se subiu de nível
        if (gameState.score >= gameState.level * config.pointsToLevelUp) {
            levelUp();
        }
        
        // Posiciona uma nova comida
        placeFood();
        
        // Toca o som de comer
        playSound('eat');
    } else {
        // Remove o rabo se não comeu nada
        gameState.snake.pop();
    }
}

// Verifica colisões
function checkCollision() {
    const head = gameState.snake[0];
    
    // Colisão com as paredes
    if (head.x < 0 || head.x >= config.tileCount || 
        head.y < 0 || head.y >= config.tileCount) {
        return true;
    }
    
    // Colisão com o próprio corpo (pula a cabeça)
    for (let i = 1; i < gameState.snake.length; i++) {
        if (head.x === gameState.snake[i].x && head.y === gameState.snake[i].y) {
            return true;
        }
    }
    
    return false;
}

// Place food at a valid random position
function placeFood() {
    try {
        const maxAttempts = 1000; // Previne loops infinitos
        let attempts = 0;
        let foodX, foodY;
        let validPosition = false;
        
        // Cria um conjunto de posições ocupadas pela cobra para busca mais rápida
        const snakePositions = new Set(
            gameState.snake.map(segment => `${segment.x},${segment.y}`)
        );
        
        // Tenta encontrar uma posição válida
        while (!validPosition && attempts < maxAttempts) {
            attempts++;
            
            // Gera posições aleatórias com distribuição uniforme
            foodX = Math.floor(Math.random() * gameState.tileCount);
            foodY = Math.floor(Math.random() * gameState.tileCount);
            
            // Verifica se a posição está livre (não está na cobra)
            validPosition = !snakePositions.has(`${foodX},${foodY}`);
            
            // Se não encontrou uma posição válida rapidamente, tenta uma abordagem mais sistemática
            if (!validPosition && attempts > gameState.tileCount * 2) {
                // Tenta posições em uma grade para evitar loops longos
                for (let y = 0; y < gameState.tileCount && !validPosition; y++) {
                    for (let x = 0; x < gameState.tileCount && !validPosition; x++) {
                        if (!snakePositions.has(`${x},${y}`)) {
                            foodX = x;
                            foodY = y;
                            validPosition = true;
                        }
                    }
                }
                
                // Se ainda não encontrou, o jogo pode estar cheio
                if (!validPosition) {
                    console.warn('Nenhuma posição válida encontrada para a comida!');
                    return false;
                }
            }
        }
        
        if (attempts >= maxAttempts) {
            console.error('Número máximo de tentativas excedido ao posicionar a comida');
            return false;
        }
        
        // Define a nova posição da comida
        gameState.food = { x: foodX, y: foodY };
        
        // Dispara um evento quando a comida é reposicionada
        const foodPlacedEvent = new CustomEvent('foodPlaced', {
            detail: {
                position: { x: foodX, y: foodY },
                timestamp: Date.now()
            }
        });
        window.dispatchEvent(foodPlacedEvent);
        
        return true;
        
    } catch (e) {
        console.error('Erro ao posicionar a comida:', e);
        
        // Tenta uma posição padrão em caso de erro
        try {
            gameState.food = { 
                x: Math.max(0, Math.min(gameState.tileCount - 1, 5)),
                y: Math.max(0, Math.min(gameState.tileCount - 1, 5))
            };
            return true;
        } catch (recoveryError) {
            console.error('Falha ao recuperar a posição da comida:', recoveryError);
            return false;
        }
    }
}

// Level up - Aumenta o nível e a dificuldade do jogo
function levelUp() {
    try {
        const oldLevel = gameState.level;
        gameState.level++;
        
        // Aumenta a velocidade (mas não deixa ficar abaixo de 30ms)
        const speedDecrease = Math.max(10, Math.floor(100 / gameState.level)); // Diminui menos os níveis mais altos
        gameState.speed = Math.max(30, gameState.speed - speedDecrease);
        
        // Atualiza a interface para mostrar o novo nível
        updateUI();
        
        // Mostra mensagem de nível
        if (elements.levelUpMessage) {
            elements.levelUpMessage.textContent = `Nível ${gameState.level}!`;
            elements.levelUpMessage.style.display = 'block';
            elements.levelUpMessage.style.animation = 'none';
            void elements.levelUpMessage.offsetHeight; // Trigger reflow
            elements.levelUpMessage.style.animation = 'levelUp 2s ease-out';
            
            // Esconde a mensagem após a animação
            setTimeout(() => {
                if (elements.levelUpMessage) {
                    elements.levelUpMessage.style.display = 'none';
                }
            }, 2000);
        }
        
        // Reproduz som de level up
        playSound('levelUp');
        
        // Reinicia o loop do jogo com a nova velocidade
        if (gameState.gameLoop) {
            clearInterval(gameState.gameLoop);
            gameState.gameLoop = setInterval(updateGame, gameState.speed);
        }
        
        // Dispara um evento personalizado para notificar sobre o aumento de nível
        const levelUpEvent = new CustomEvent('levelUp', {
            detail: {
                level: gameState.level,
                oldLevel: oldLevel,
                speed: gameState.speed,
                timestamp: Date.now()
            }
        });
        window.dispatchEvent(levelUpEvent);
        
        // A cada 5 níveis, adiciona uma nova comida (máximo de 3 comidas)
        if (gameState.level % 5 === 0 && !gameState.extraFood) {
            gameState.extraFood = [];
            placeFood('extra');
        }
        
        return true;
        
    } catch (e) {
        console.error('Erro ao aumentar o nível:', e);
        
        // Garante que o jogo continue funcionando mesmo com falha no level up
        if (!gameState.gameLoop && gameState.isPlaying) {
            gameState.gameLoop = setInterval(updateGame, gameState.speed);
        }
        
        return false;
    }
}

// Atualiza o estado do jogo - Loop principal
function updateGame() {
    try {
        // Se o jogo não estiver rodando, não faz nada
        if (!gameState.isPlaying) return;
        
        // Move a cobra
        moveSnake();
        
        // Verifica colisões
        if (checkCollision()) {
            gameOver();
            return;
        }
        
        // Verifica se comeu a comida
        const head = gameState.snake[0];
        if (head.x === gameState.food.x && head.y === gameState.food.y) {
            // Cobra comeu a comida
            playSound('eat');
            gameState.score += config.pointsPerFood;
            
            // Verifica se subiu de nível
            if (gameState.score >= gameState.level * config.pointsToLevelUp) {
                levelUp();
            }
            
            // Coloca nova comida
            placeFood();
        } else {
            // Remove o rabo se não comeu comida
            gameState.snake.pop();
        }
        
        // Atualiza a pontuação máxima se necessário
        if (gameState.score > gameState.highScore) {
            gameState.highScore = gameState.score;
            saveHighScore();
        }
        
        // Atualiza a interface
        updateUI();
        
        // Redesenha o jogo
        drawGame();
        
        // Agenda o próximo frame
        if (gameState.isPlaying) {
            requestAnimationFrame(updateGame);
        }
        
    } catch (e) {
        console.error('Erro no loop do jogo:', e);
        gameOver();
    }
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
    if (!gameState.isPlaying) {
        // Allow starting game with space
        if (e.code === 'Space') {
            startGame();
        }
        return;
    }
    
    // Prevent 180-degree turns
    switch(e.key) {
        case 'ArrowUp':
            if (gameState.direction !== 'down') {
                gameState.velocity = { x: 0, y: -1 };
                gameState.direction = 'up';
            }
            break;
        case 'ArrowDown':
            if (gameState.direction !== 'up') {
                gameState.velocity = { x: 0, y: 1 };
                gameState.direction = 'down';
            }
            break;
        case 'ArrowLeft':
            if (gameState.direction !== 'right') {
                gameState.velocity = { x: -1, y: 0 };
                gameState.direction = 'left';
            }
            break;
        case 'ArrowRight':
            if (gameState.direction !== 'left') {
                gameState.velocity = { x: 1, y: 0 };
                gameState.direction = 'right';
            }
            break;
        case ' ':
            // Pause game with space
            if (gameState.isPlaying) {
                clearInterval(gameState.gameLoop);
                gameState.isPlaying = false;
            } else {
                gameState.isPlaying = true;
                gameState.gameLoop = setInterval(updateGame, gameState.speed);
            }
            break;
    }
}

// Toggle mute
function toggleMute() {
    try {
        // Inverte o estado de mudo
        gameState.isMuted = !gameState.isMuted;
                
        // Atualiza o estado visual do botão
        if (elements.muteBtn) {
            elements.muteBtn.classList.toggle('muted', gameState.isMuted);
                    
            // Adiciona feedback visual temporário
            elements.muteBtn.classList.add('active');
            setTimeout(() => {
                elements.muteBtn.classList.remove('active');
            }, 200);
            
            // Atualiza o texto de acessibilidade
            const statusText = gameState.isMuted ? 'Som desligado' : 'Som ligado';
            elements.muteBtn.setAttribute('aria-label', statusText);
            elements.muteBtn.title = statusText;
        }
        
        // Atualiza o gerenciador de som principal
        if (window.soundManager) {
            try {
                window.soundManager.setMute(gameState.isMuted);
                
                // Reproduz um som de feedback se não estiver mudo
                if (!gameState.isMuted) {
                    window.soundManager.play('select').catch(e => {
                        console.warn('Falha ao reproduzir som de feedback:', e);
                    });
                }
            } catch (e) {
                console.error('Erro ao atualizar o estado de mudo no soundManager:', e);
            }
        }
        
        // Salva a preferência
        try {
            localStorage.setItem(`${config.gameId}_muted`, gameState.isMuted);
        } catch (e) {
            console.error('Erro ao salvar preferência de som:', e);
        }
        
        // Dispara um evento personalizado para notificar outras partes do jogo
        const event = new CustomEvent('soundToggled', { 
            detail: { isMuted: gameState.isMuted }
        });
        window.dispatchEvent(event);
        
    } catch (e) {
        console.error('Erro ao alternar o estado de mudo:', e);
        
        // Tenta recuperar o estado anterior em caso de erro
        gameState.isMuted = !gameState.isMuted;
        
        // Força a atualização visual para refletir o estado correto
        if (elements.muteBtn) {
            elements.muteBtn.classList.toggle('muted', gameState.isMuted, true);
        }
    }
}

// Load high score and settings from localStorage
function loadHighScore() {
    try {
        // Carrega a pontuação máxima
        try {
            const savedHighScore = localStorage.getItem(`${config.gameId}_highScore`);
            if (savedHighScore) {
                const parsedScore = parseInt(savedHighScore, 10);
                if (!isNaN(parsedScore)) {
                    gameState.highScore = parsedScore;
                } else {
                    console.warn('Pontuação salva inválida, usando valor padrão');
                }
            }
        } catch (e) {
            console.error('Erro ao carregar pontuação máxima:', e);
        }
        
        // Carrega a preferência de mudo
        try {
            const savedMute = localStorage.getItem(`${config.gameId}_muted`);
            if (savedMute !== null) {
                gameState.isMuted = savedMute === 'true';
                
                // Atualiza a interface do usuário
                if (elements.muteBtn) {
                    elements.muteBtn.classList.toggle('muted', gameState.isMuted);
                    const statusText = gameState.isMuted ? 'Som desligado' : 'Som ligado';
                    elements.muteBtn.setAttribute('aria-label', statusText);
                    elements.muteBtn.title = statusText;
                }
                
                // Sincroniza com o gerenciador de som principal
                if (window.soundManager) {
                    try {
                        window.soundManager.setMute(gameState.isMuted);
                    } catch (e) {
                        console.error('Erro ao sincronizar estado de mudo com o soundManager:', e);
                    }
                }
            }
        } catch (e) {
            console.error('Erro ao carregar preferência de som:', e);
        }
        
        // Carrega outras configurações salvas, se houver
        try {
            const savedVolume = localStorage.getItem(`${config.gameId}_volume`);
            if (savedVolume !== null) {
                const volume = parseFloat(savedVolume);
                if (!isNaN(volume) && volume >= 0 && volume <= 1) {
                    gameState.volume = volume;
                    if (window.soundManager) {
                        window.soundManager.setVolume(volume);
                    }
                }
            }
        } catch (e) {
            console.error('Erro ao carregar configurações de volume:', e);
        }
        
    } catch (e) {
        console.error('Erro inesperado ao carregar configurações:', e);
        
        // Tenta recuperar definindo valores padrão
        gameState.isMuted = false;
        gameState.volume = 0.5;
        
        // Atualiza a interface do usuário com valores padrão
        if (elements.muteBtn) {
            elements.muteBtn.classList.remove('muted');
            elements.muteBtn.setAttribute('aria-label', 'Som ligado');
            elements.muteBtn.title = 'Som ligado';
        }
    }
}

// Save high score to localStorage
function saveHighScore() {
    try {
        // Garante que a pontuação é um número válido
        const scoreToSave = Math.max(0, Math.floor(gameState.highScore || 0));
        
        // Salva no localStorage
        localStorage.setItem(`${config.gameId}_highScore`, scoreToSave.toString());
        
        // Dispara um evento personalizado para notificar outras partes do jogo
        const event = new CustomEvent('highScoreUpdated', { 
            detail: { highScore: scoreToSave }
        });
        window.dispatchEvent(event);
        
        // Atualiza a interface do usuário imediatamente
        if (elements.highScore) {
            elements.highScore.textContent = `High Score: ${scoreToSave}`;
        }
        
        return true;
    } catch (e) {
        console.error('Erro ao salvar pontuação máxima:', e);
        
        // Tenta novamente após um curto atraso
        setTimeout(() => {
            try {
                localStorage.setItem(`${config.gameId}_highScore`, Math.max(0, Math.floor(gameState.highScore || 0)).toString());
            } catch (retryError) {
                console.error('Falha ao tentar salvar a pontuação novamente:', retryError);
            }
        }, 100);
        
        return false;
    }
}

// Draw the game
function drawGame() {
    if (!ctx) return;
    
    // Clear canvas
    ctx.fillStyle = getComputedStyle(document.documentElement)
        .getPropertyValue('--card-bg') || '#1e1e2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid
    drawGrid();
    
    // Draw food
    drawFood();
    
    // Draw snake
    drawSnake();
    
    // Draw score
    drawScore();
}

// Draw grid
function drawGrid() {
    const gridColor = getComputedStyle(document.documentElement)
        .getPropertyValue('--text-color') || '#cdd6f4';
    
    ctx.strokeStyle = `${gridColor}20`;
    ctx.lineWidth = 0.5;
    
    // Vertical lines
    for (let i = 0; i <= gameState.tileCount; i++) {
        ctx.beginPath();
        ctx.moveTo(i * gameState.gridSize, 0);
        ctx.lineTo(i * gameState.gridSize, canvas.height);
        ctx.stroke();
    }
    
    // Horizontal lines
    for (let i = 0; i <= gameState.tileCount; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * gameState.gridSize);
        ctx.lineTo(canvas.width, i * gameState.gridSize);
        ctx.stroke();
    }
}

// Draw snake
function drawSnake() {
    const headColor = getComputedStyle(document.documentElement)
        .getPropertyValue('--accent-color') || '#f38ba8';
    const bodyColor = getComputedStyle(document.documentElement)
        .getPropertyValue('--accent-color') || '#f38ba8';
    
    // Draw body
    for (let i = 1; i < gameState.snake.length; i++) {
        const segment = gameState.snake[i];
        ctx.fillStyle = bodyColor;
        ctx.fillRect(
            segment.x * gameState.gridSize + 1,
            segment.y * gameState.gridSize + 1,
            gameState.gridSize - 2,
            gameState.gridSize - 2
        );
        
        // Add some detail to the body
        ctx.strokeStyle = `${headColor}80`;
        ctx.lineWidth = 1;
        ctx.strokeRect(
            segment.x * gameState.gridSize + 3,
            segment.y * gameState.gridSize + 3,
            gameState.gridSize - 6,
            gameState.gridSize - 6
        );
    }
    
    // Draw head
    if (gameState.snake.length > 0) {
        const head = gameState.snake[0];
        ctx.fillStyle = headColor;
        ctx.fillRect(
            head.x * gameState.gridSize + 1,
            head.y * gameState.gridSize + 1,
            gameState.gridSize - 2,
            gameState.gridSize - 2
        );
        
        // Draw eyes
        ctx.fillStyle = '#1e1e2e';
        const eyeSize = Math.max(2, gameState.gridSize / 8);
        const eyeOffset = gameState.gridSize / 3;
        
        // Left eye
        ctx.beginPath();
        ctx.arc(
            head.x * gameState.gridSize + eyeOffset,
            head.y * gameState.gridSize + eyeOffset,
            eyeSize, 0, Math.PI * 2
        );
        ctx.fill();
        
        // Right eye
        ctx.beginPath();
        ctx.arc(
            head.x * gameState.gridSize + gameState.gridSize - eyeOffset,
            head.y * gameState.gridSize + eyeOffset,
            eyeSize, 0, Math.PI * 2
        );
        ctx.fill();
    }
}

// Draw food
function drawFood() {
    const foodColor = getComputedStyle(document.documentElement)
        .getPropertyValue('--accent-color') || '#a6e3a1';
    
    // Draw food as an apple
    ctx.fillStyle = foodColor;
    ctx.beginPath();
    const centerX = gameState.food.x * gameState.gridSize + gameState.gridSize / 2;
    const centerY = gameState.food.y * gameState.gridSize + gameState.gridSize / 2;
    const radius = gameState.gridSize / 2 - 2;
    
    // Draw apple body
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Add a leaf
    ctx.fillStyle = '#94e2d5';
    ctx.beginPath();
    ctx.ellipse(
        centerX + radius * 0.5,
        centerY - radius * 0.5,
        radius * 0.4,
        radius * 0.6,
        Math.PI / 4, 0, Math.PI * 2
    );
    ctx.fill();
}

// Draw score
function drawScore() {
    const textColor = getComputedStyle(document.documentElement)
        .getPropertyValue('--text-color') || '#cdd6f4';
    
    ctx.fillStyle = textColor;
    ctx.font = `bold ${gameState.gridSize}px 'Press Start 2P', cursive`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    
    // Draw score
    ctx.fillText(
        `Score: ${gameState.score}`,
        10,
        10
    );
    
    // Draw level
    ctx.textAlign = 'right';
    ctx.fillText(
        `Level: ${gameState.level}`,
        canvas.width - 10,
        10
    );
}

// Game over
function gameOver() {
    gameState.isPlaying = false;
    
    if (gameState.gameLoop) {
        clearInterval(gameState.gameLoop);
        gameState.gameLoop = null;
    }
    
    // Play game over sound
    playSound('gameOver');
    
    // Draw game over overlay
    const overlay = document.createElement('div');
    overlay.className = 'game-overlay';
    overlay.innerHTML = `
        <div class="game-over-content">
            <h2>Game Over!</h2>
            <p>Your score: ${gameState.score}</p>
            <p>High score: ${Math.max(gameState.score, gameState.highScore)}</p>
            <button id="playAgainBtn" class="game-btn">Play Again</button>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Add event listener for play again button
    document.getElementById('playAgainBtn').addEventListener('click', () => {
        document.body.removeChild(overlay);
        resetGame();
        startGame();
    });
    
    // Update high score if needed
    if (gameState.score > gameState.highScore) {
        gameState.highScore = gameState.score;
        saveHighScore();
    }
    
    updateUI();
}

// Play sound effect
async function playSound(soundName) {
    try {
        // Se o jogo estiver mutado, não reproduz som
        if (gameState.isMuted) return;
        
        // Tenta usar o soundManager se disponível
        if (window.soundManager) {
            try {
                // Tenta reproduzir o som usando o soundManager
                await window.soundManager.play(soundName, 'snake');
                return; // Se funcionou, sai da função
            } catch (e) {
                console.warn(`Falha ao reproduzir som '${soundName}' pelo soundManager:`, e);
                // Continua para tentativas alternativas
            }
        }
        
        // Se chegou aqui, o soundManager não está disponível ou falhou
        // Tenta usar o Audio API diretamente como fallback
        const soundPath = `../sounds/${soundName}.mp3`;
        try {
            const audio = new Audio(soundPath);
            audio.volume = 0.5; // Volume padrão
            const playPromise = audio.play();
            
            // Trata a promessa de reprodução
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.error(`Erro ao reproduzir som '${soundName}':`, error);
                });
            }
        } catch (e) {
            console.error(`Erro ao criar ou reproduzir áudio para '${soundName}':`, e);
        }
    } catch (e) {
        console.error(`Erro inesperado em playSound('${soundName}'):`, e);
    }
}

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize theme manager
    if (window.themeManager) {
        window.themeManager.initializeTheme();
    }
    
    // Initialize sound manager
    if (window.soundManager) {
        await window.soundManager.initialize();
        
        // Load game state
        const savedMuted = localStorage.getItem(`${config.gameId}_muted`);
        if (savedMuted !== null) {
            gameState.isMuted = savedMuted === 'true';
        }
        
        window.soundManager.setMute(gameState.isMuted);
        
        // Update mute button state
        const muteBtn = document.getElementById('muteBtn');
        if (muteBtn) {
            muteBtn.classList.toggle('muted', gameState.isMuted);
        }
    }
    
    // Initialize game stats
    if (window.statsUI) {
        window.statsUI.init();
    }
    
    // Initialize game
    initGame();
    
    // Prevent scrolling on mobile when touching the game area
    const gameBoard = document.getElementById('gameBoard');
    if (gameBoard) {
        gameBoard.addEventListener('touchmove', (e) => {
            if (gameState.isPlaying) {
                e.preventDefault();
            }
        }, { passive: false });
    }
    
    // Prevent context menu on long press
    document.addEventListener('contextmenu', (e) => {
        if (gameState.isPlaying) {
            e.preventDefault();
        }
    });
});
