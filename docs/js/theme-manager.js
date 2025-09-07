/**
 * REPARIERTER Theme Manager - Behebt Light/Dark Mode Probleme
 * Ersetzt Ihre bestehende js/theme-manager.js
 */

class UniversalThemeManager {
    constructor() {
        this.currentTheme = 'dark'; // Standard
        this.isInitialized = false;
        this.init();
    }
    
    init() {
        // Prüfen ob bereits initialisiert
        if (window.themeManagerInitialized) {
            return;
        }
        
        // Als initialisiert markieren
        window.themeManagerInitialized = true;
        
        // Gespeichertes Theme laden
        this.loadSavedTheme();
        
        // Theme sofort anwenden
        this.applyTheme();
        
        // DOM Ready Event abwarten
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupThemeElements();
            });
        } else {
            this.setupThemeElements();
        }
        
        // Storage-Events von anderen Tabs überwachen
        window.addEventListener('storage', (e) => {
            if (e.key === 'spacenations-theme') {
                this.currentTheme = e.newValue || 'dark';
                this.applyTheme();
                this.updateThemeButtons();
                }
        });
        
        this.isInitialized = true;
        }
    
    // Gespeichertes Theme laden
    loadSavedTheme() {
        const savedTheme = localStorage.getItem('spacenations-theme') || localStorage.getItem('theme');
        if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
            this.currentTheme = savedTheme;
        }
        
        // Alte theme-keys bereinigen und neuen Standard setzen
        if (localStorage.getItem('theme') && !localStorage.getItem('spacenations-theme')) {
            localStorage.setItem('spacenations-theme', localStorage.getItem('theme'));
            localStorage.removeItem('theme');
        }
    }
    
    // Theme-Elemente einrichten
    setupThemeElements() {
        // Alle Theme-Toggle Buttons finden
        const themeButtons = document.querySelectorAll('.theme-toggle, #theme-toggle, [onclick*="toggleTheme"]');
        
        themeButtons.forEach(button => {
            // Alte onclick-Handler entfernen
            button.removeAttribute('onclick');
            
            // Neuen Event-Handler hinzufügen
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleTheme();
            });
        });
        
        // Theme-Buttons initial aktualisieren
        this.updateThemeButtons();
        
        }
    
    // Theme anwenden
    applyTheme() {
        const root = document.documentElement;
        
        if (this.currentTheme === 'light') {
            root.classList.add('light-mode');
        } else {
            root.classList.remove('light-mode');
        }
        
        // Theme-Buttons aktualisieren
        this.updateThemeButtons();
        
        }
    
    // Theme-Button-Texte und Icons aktualisieren
    updateThemeButtons() {
        // Icon und Text Elemente finden
        const themeIcons = document.querySelectorAll('#theme-icon, .theme-icon');
        const themeTexts = document.querySelectorAll('#theme-text, .theme-text');
        
        if (this.currentTheme === 'light') {
            // Light Mode aktiv -> zeige Dark Mode Option
            themeIcons.forEach(icon => icon.textContent = '☀️');
            themeTexts.forEach(text => text.textContent = 'Dark Mode');
        } else {
            // Dark Mode aktiv -> zeige Light Mode Option
            themeIcons.forEach(icon => icon.textContent = '🌙');
            themeTexts.forEach(text => text.textContent = 'Light Mode');
        }
    }
    
    // Theme umschalten
    toggleTheme() {
        const oldTheme = this.currentTheme;
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        
        // Theme speichern
        localStorage.setItem('spacenations-theme', this.currentTheme);
        
        // Theme anwenden
        this.applyTheme();
        
        // Event für andere Komponenten
        document.dispatchEvent(new CustomEvent('themeChanged', {
            detail: { 
                theme: this.currentTheme,
                previousTheme: oldTheme
            }
        }));
        
        // Feedback anzeigen
        this.showThemeChangeNotification();
    }
    
    // Theme-Change Notification
    showThemeChangeNotification() {
        // Nur anzeigen wenn Notification-System verfügbar ist
        if (window.DashboardNav && window.DashboardNav.showNotification) {
            const themeName = this.currentTheme === 'light' ? 'Light Mode' : 'Dark Mode';
            window.DashboardNav.showNotification(`${themeName} aktiviert`, 'success', 2000);
        }
    }
    
    // Aktuelles Theme abrufen
    getCurrentTheme() {
        return this.currentTheme;
    }
    
    // Theme setzen (programmatisch)
    setTheme(theme) {
        if (theme === 'light' || theme === 'dark') {
            this.currentTheme = theme;
            localStorage.setItem('spacenations-theme', this.currentTheme);
            this.applyTheme();
            
            }
    }
    
    // Theme-Change-Listener hinzufügen
    onThemeChange(callback) {
        document.addEventListener('themeChanged', (e) => {
            callback(e.detail.theme, e.detail.previousTheme);
        });
    }
    
    // System-Theme erkennen (falls gewünscht)
    detectSystemTheme() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    }
    
    // Auto-Theme basierend auf Systemeinstellung
    enableAutoTheme() {
        const systemTheme = this.detectSystemTheme();
        this.setTheme(systemTheme);
        
        // System-Theme-Changes überwachen
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            mediaQuery.addEventListener('change', (e) => {
                const newSystemTheme = e.matches ? 'dark' : 'light';
                this.setTheme(newSystemTheme);
                });
        }
        
        }
}

// Globale Theme-Manager-Instanz (nur einmal erstellen)
if (!window.universalThemeManager) {
    window.universalThemeManager = new UniversalThemeManager();
}

// Alte globale Variablen überschreiben/reparieren
window.themeManager = window.universalThemeManager;

// Globale Funktionen für Theme-Management (Abwärtskompatibilität)
window.toggleTheme = () => {
    window.universalThemeManager.toggleTheme();
};

// Erweiterte Theme-API
window.ThemeAPI = {
    toggle: () => window.universalThemeManager.toggleTheme(),
    getCurrent: () => window.universalThemeManager.getCurrentTheme(),
    setTheme: (theme) => window.universalThemeManager.setTheme(theme),
    onThemeChange: (callback) => window.universalThemeManager.onThemeChange(callback),
    enableAutoTheme: () => window.universalThemeManager.enableAutoTheme(),
    detectSystemTheme: () => window.universalThemeManager.detectSystemTheme()
};

// Sofortige Anwendung falls DOM bereits geladen
if (document.readyState !== 'loading') {
    setTimeout(() => {
        window.universalThemeManager.setupThemeElements();
        window.universalThemeManager.applyTheme();
    }, 100);
}

window.themeDebug = {
    getCurrentTheme: () => window.universalThemeManager.getCurrentTheme(),
    forceLight: () => window.universalThemeManager.setTheme('light'),
    forceDark: () => window.universalThemeManager.setTheme('dark'),
    showSystemTheme: () => window.universalThemeManager.detectSystemTheme(),
    resetTheme: () => {
        localStorage.removeItem('spacenations-theme');
        localStorage.removeItem('theme');
        window.location.reload();
    }
};

