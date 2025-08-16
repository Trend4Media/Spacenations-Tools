/**
 * Theme Manager - Zentrale Verwaltung für Dark/Light Mode
 * Synchronisiert Themes zwischen allen Seiten
 */

class ThemeManager {
    constructor() {
        this.currentTheme = 'dark'; // Standard
        this.init();
    }
    
    init() {
        // Gespeichertes Theme laden
        this.loadSavedTheme();
        
        // Theme sofort anwenden
        this.applyTheme();
        
        // Theme-Änderungen von anderen Tabs überwachen
        window.addEventListener('storage', (e) => {
            if (e.key === 'theme') {
                this.currentTheme = e.newValue || 'dark';
                this.applyTheme();
                console.log('🎨 Theme von anderem Tab synchronisiert:', this.currentTheme);
            }
        });
        
        console.log('🎨 ThemeManager initialisiert mit Theme:', this.currentTheme);
    }
    
    // Gespeichertes Theme aus localStorage laden
    loadSavedTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
            this.currentTheme = savedTheme;
        }
    }
    
    // Theme anwenden
    applyTheme() {
        const root = document.documentElement;
        const themeIcon = document.getElementById('theme-icon');
        const themeText = document.getElementById('theme-text');
        
        if (this.currentTheme === 'light') {
            root.classList.add('light-mode');
            if (themeIcon) themeIcon.textContent = '☀️';
            if (themeText) themeText.textContent = 'Dark Mode';
        } else {
            root.classList.remove('light-mode');
            if (themeIcon) themeIcon.textContent = '🌙';
            if (themeText) themeText.textContent = 'Light Mode';
        }
        
        console.log('🎨 Theme angewendet:', this.currentTheme);
    }
    
    // Theme umschalten
    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        
        // Theme speichern
        localStorage.setItem('theme', this.currentTheme);
        
        // Theme anwenden
        this.applyTheme();
        
        console.log('🔄 Theme umgeschaltet zu:', this.currentTheme);
        
        // Event für andere Komponenten
        document.dispatchEvent(new CustomEvent('themeChanged', {
            detail: { theme: this.currentTheme }
        }));
    }
    
    // Aktuelles Theme abrufen
    getCurrentTheme() {
        return this.currentTheme;
    }
    
    // Theme setzen
    setTheme(theme) {
        if (theme === 'light' || theme === 'dark') {
            this.currentTheme = theme;
            localStorage.setItem('theme', this.currentTheme);
            this.applyTheme();
        }
    }
    
    // Theme-Change-Listener hinzufügen
    onThemeChange(callback) {
        document.addEventListener('themeChanged', (e) => {
            callback(e.detail.theme);
        });
    }
}

// Globale ThemeManager-Instanz erstellen
window.themeManager = new ThemeManager();

// Globale Funktionen für Theme-Management
window.toggleTheme = () => window.themeManager.toggleTheme();
window.ThemeAPI = {
    toggle: () => window.themeManager.toggleTheme(),
    getCurrent: () => window.themeManager.getCurrentTheme(),
    setTheme: (theme) => window.themeManager.setTheme(theme),
    onThemeChange: (callback) => window.themeManager.onThemeChange(callback)
};

// Auto-Initialisierung wenn DOM geladen ist
document.addEventListener('DOMContentLoaded', () => {
    // Theme sofort anwenden falls DOM schon geladen war
    window.themeManager.applyTheme();
});
