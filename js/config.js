/**
 * SPACENATIONS TOOLS - KONFIGURATION
 * Zentrale Konfiguration für Entwicklung und Produktion
 */

// Umgebungskonfiguration
const CONFIG = {
    // Entwicklungsmodus (auf false setzen für Produktion)
    DEBUG_MODE: true,
    
    // Logging-Level
    LOG_LEVEL: {
        ERROR: 0,
        WARN: 1,
        INFO: 2,
        DEBUG: 3
    },
    
    // Aktuelle Logging-Stufe
    CURRENT_LOG_LEVEL: 3, // DEBUG für Entwicklung, 0 für Produktion
    
    // Firebase-Einstellungen
    FIREBASE: {
        ENABLE_PERSISTENCE: true,
        SYNC_INTERVAL: 30000, // 30 Sekunden
        RETRY_ATTEMPTS: 3
    },
    
    // UI-Einstellungen
    UI: {
        ANIMATION_DURATION: 300,
        TOAST_DURATION: 3000,
        AUTO_SAVE_INTERVAL: 5000 // 5 Sekunden
    }
};

// Erweiterte Logging-Funktionen
const Logger = {
    error: function(message, ...args) {
        if (CONFIG.CURRENT_LOG_LEVEL >= CONFIG.LOG_LEVEL.ERROR) {
            console.error(`❌ [ERROR] ${message}`, ...args);
        }
    },
    
    warn: function(message, ...args) {
        if (CONFIG.CURRENT_LOG_LEVEL >= CONFIG.LOG_LEVEL.WARN) {
            console.warn(`⚠️ [WARN] ${message}`, ...args);
        }
    },
    
    info: function(message, ...args) {
        if (CONFIG.CURRENT_LOG_LEVEL >= CONFIG.LOG_LEVEL.INFO) {
            console.info(`ℹ️ [INFO] ${message}`, ...args);
        }
    },
    
    debug: function(message, ...args) {
        if (CONFIG.CURRENT_LOG_LEVEL >= CONFIG.LOG_LEVEL.DEBUG) {
            console.log(`🔧 [DEBUG] ${message}`, ...args);
        }
    }
};

// Produktions-Modus aktivieren
const enableProductionMode = () => {
    CONFIG.DEBUG_MODE = false;
    CONFIG.CURRENT_LOG_LEVEL = CONFIG.LOG_LEVEL.ERROR;
    Logger.info('Produktionsmodus aktiviert - Debug-Ausgaben deaktiviert');
};

// Entwicklungs-Modus aktivieren
const enableDevelopmentMode = () => {
    CONFIG.DEBUG_MODE = true;
    CONFIG.CURRENT_LOG_LEVEL = CONFIG.LOG_LEVEL.DEBUG;
    Logger.info('Entwicklungsmodus aktiviert - Alle Debug-Ausgaben verfügbar');
};

// Global verfügbar machen
window.CONFIG = CONFIG;
window.Logger = Logger;
window.enableProductionMode = enableProductionMode;
window.enableDevelopmentMode = enableDevelopmentMode;

// Automatische Erkennung basierend auf Hostname
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    enableDevelopmentMode();
} else {
    enableProductionMode();
}

Logger.info('Konfiguration geladen', CONFIG);