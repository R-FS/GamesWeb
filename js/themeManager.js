class ThemeManager {
    constructor() {
        this.theme = 'retro';
        this.initializeTheme();
    }
    
    initializeTheme() {
        // Aplicar tema retro por padrão
        this.applyRetroTheme();
    }
    
    applyRetroTheme() {
        // Remover classes de tema existentes
        document.documentElement.className = document.documentElement.className
            .split(' ')
            .filter(cls => !cls.startsWith('theme-'))
            .join(' ');
        
        // Aplicar tema retro
        document.documentElement.classList.add('theme-retro');
        document.documentElement.setAttribute('data-theme', 'retro');
        document.body.style.fontFamily = '"Press Start 2P", cursive';
    }
}

// Inicializar gerenciador de temas
const themeManager = new ThemeManager();
window.themeManager = themeManager;

// Aplicar tema quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    themeManager.initializeTheme();
});
