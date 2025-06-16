class ThemeManager {
    constructor() {
        this.theme = 'retro'; // Only theme available
        this.lastAppliedTheme = null;
        this.initializeTheme();
    }
    
    initializeTheme() {
        // Always set retro theme
        this.setTheme('retro', true);
    }

    setTheme(theme, save = true) {
        // Always use retro theme
        theme = 'retro';
        
        if (this.lastAppliedTheme === theme) return;
        
        this.theme = theme;
        const html = document.documentElement;
        const body = document.body;
        
        // Remove all theme-related attributes and classes
        html.removeAttribute('data-theme');
        body.removeAttribute('data-theme');
        
        // Remove all theme-related classes
        const currentThemes = Array.from(html.classList).filter(cls => cls.startsWith('theme-'));
        currentThemes.forEach(cls => html.classList.remove(cls));
        
        // Apply the retro theme
        html.setAttribute('data-theme', 'retro');
        html.classList.add('theme-retro');
        body.setAttribute('data-theme', 'retro');
        
        // Save to localStorage if requested
        if (save) {
            localStorage.setItem('theme', 'retro');
            sessionStorage.setItem('current-theme', 'retro');
        }
        
        // Force a reflow to ensure styles are applied
        void html.offsetHeight;
        
        // Dispatch a custom event for any listeners
        const event = new CustomEvent('themeChanged', { 
            detail: { 
                theme: 'retro',
                isDark: true
            } 
        });
        document.dispatchEvent(event);
        
        this.lastAppliedTheme = theme;
    }



    getCurrentTheme() {
        return this.theme;
    }
}

// Create and initialize theme manager immediately
const themeManager = new ThemeManager();

// Make it globally available
window.themeManager = themeManager;

// Function to initialize theme manager
function initializeThemeManager() {
    // Always apply retro theme
    themeManager.setTheme('retro', false);
    
    // Update theme selector if it exists
    const themeSelect = document.getElementById('theme');
    if (themeSelect) {
        themeSelect.value = 'retro';
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeThemeManager);
} else {
    // DOMContentLoaded has already fired
    initializeThemeManager();
}

// Handle pageshow event to ensure retro theme is applied
window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        themeManager.setTheme('retro', false);
    }
});
