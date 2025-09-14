/**
 * Umfassendes Log-System für Spacenations Tools
 * Zeichnet alle Aktionen, Fehler und Debug-Informationen auf
 */

class Logger {
    constructor() {
        this.logs = [];
        this.maxLogs = 1000; // Maximale Anzahl gespeicherter Logs
        this.logLevels = {
            ERROR: 0,
            WARN: 1,
            INFO: 2,
            DEBUG: 3,
            TRACE: 4
        };
        this.currentLevel = this.logLevels.DEBUG; // Standard: DEBUG
        this.startTime = Date.now();
        
        // Console-Override für bessere Integration
        this.overrideConsole();
        
        // Log-Export für Debugging
        this.setupLogExport();
        
        console.log('📊 Logger initialisiert - Level:', this.getCurrentLevelName());
    }
    
    // Console-Methoden überschreiben für automatisches Logging
    overrideConsole() {
        const originalConsole = {
            log: console.log,
            warn: console.warn,
            error: console.error,
            info: console.info,
            debug: console.debug
        };
        
        // Console.log überschreiben
        console.log = (...args) => {
            this.log('INFO', 'CONSOLE', args.join(' '));
            originalConsole.log(...args);
        };
        
        // Console.warn überschreiben
        console.warn = (...args) => {
            this.log('WARN', 'CONSOLE', args.join(' '));
            originalConsole.warn(...args);
        };
        
        // Console.error überschreiben
        console.error = (...args) => {
            this.log('ERROR', 'CONSOLE', args.join(' '));
            originalConsole.error(...args);
        };
        
        // Console.info überschreiben
        console.info = (...args) => {
            this.log('INFO', 'CONSOLE', args.join(' '));
            originalConsole.info(...args);
        };
        
        // Console.debug überschreiben
        console.debug = (...args) => {
            this.log('DEBUG', 'CONSOLE', args.join(' '));
            originalConsole.debug(...args);
        };
    }
    
    // Haupt-Log-Funktion
    log(level, category, message, data = null) {
        const timestamp = new Date().toISOString();
        const relativeTime = Date.now() - this.startTime;
        
        const logEntry = {
            timestamp,
            relativeTime,
            level: level.toUpperCase(),
            category: category.toUpperCase(),
            message: String(message),
            data: data,
            stack: level === 'ERROR' ? new Error().stack : null,
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        // Log nur hinzufügen wenn Level erlaubt ist
        if (this.logLevels[level] <= this.currentLevel) {
            this.logs.push(logEntry);
            
            // Alte Logs entfernen wenn Maximum erreicht
            if (this.logs.length > this.maxLogs) {
                this.logs.shift();
            }
        }
        
        // Spezielle Behandlung für Fehler
        if (level === 'ERROR') {
            this.handleError(logEntry);
        }
    }
    
    // Fehler-Behandlung
    handleError(logEntry) {
        // Fehler an Firebase senden (falls verfügbar)
        if (window.firebaseServices && window.firebaseServices.db) {
            this.sendErrorToFirebase(logEntry);
        }
        
        // Fehler in localStorage speichern für Offline-Debugging
        this.saveErrorToLocalStorage(logEntry);
    }
    
    // Fehler an Firebase senden
    async sendErrorToFirebase(logEntry) {
        try {
            await window.firebaseServices.db.collection('errorLogs').add({
                ...logEntry,
                userId: window.authManager?.getCurrentUser()?.uid || 'anonymous',
                sessionId: this.getSessionId(),
                createdAt: window.FirebaseConfig?.getServerTimestamp() || new Date()
            });
        } catch (error) {
            console.error('Fehler beim Senden an Firebase:', error);
        }
    }
    
    // Fehler in localStorage speichern
    saveErrorToLocalStorage(logEntry) {
        try {
            const errorKey = `error_${Date.now()}`;
            localStorage.setItem(errorKey, JSON.stringify(logEntry));
            
            // Alte Fehler entfernen (nur die letzten 10 behalten)
            const errorKeys = Object.keys(localStorage).filter(key => key.startsWith('error_'));
            if (errorKeys.length > 10) {
                errorKeys.sort().slice(0, -10).forEach(key => localStorage.removeItem(key));
            }
        } catch (error) {
            console.error('Fehler beim Speichern in localStorage:', error);
        }
    }
    
    // Session-ID generieren
    getSessionId() {
        if (!this.sessionId) {
            this.sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        }
        return this.sessionId;
    }
    
    // Log-Level setzen
    setLevel(level) {
        if (typeof level === 'string') {
            this.currentLevel = this.logLevels[level.toUpperCase()] || this.logLevels.DEBUG;
        } else {
            this.currentLevel = level;
        }
        console.log('📊 Log-Level geändert zu:', this.getCurrentLevelName());
    }
    
    // Aktuelles Log-Level abrufen
    getCurrentLevelName() {
        return Object.keys(this.logLevels).find(key => this.logLevels[key] === this.currentLevel);
    }
    
    // Logs filtern
    getLogs(filter = {}) {
        let filteredLogs = [...this.logs];
        
        if (filter.level) {
            filteredLogs = filteredLogs.filter(log => log.level === filter.level.toUpperCase());
        }
        
        if (filter.category) {
            filteredLogs = filteredLogs.filter(log => log.category === filter.category.toUpperCase());
        }
        
        if (filter.since) {
            filteredLogs = filteredLogs.filter(log => log.relativeTime >= filter.since);
        }
        
        if (filter.search) {
            const searchTerm = filter.search.toLowerCase();
            filteredLogs = filteredLogs.filter(log => 
                log.message.toLowerCase().includes(searchTerm) ||
                log.category.toLowerCase().includes(searchTerm)
            );
        }
        
        return filteredLogs;
    }
    
    // Logs exportieren
    exportLogs(format = 'json') {
        const logs = this.getLogs();
        
        if (format === 'json') {
            return JSON.stringify(logs, null, 2);
        } else if (format === 'csv') {
            return this.exportToCSV(logs);
        } else if (format === 'txt') {
            return this.exportToTXT(logs);
        }
        
        return logs;
    }
    
    // CSV Export
    exportToCSV(logs) {
        const headers = ['Timestamp', 'Relative Time', 'Level', 'Category', 'Message', 'Data'];
        const csvContent = [
            headers.join(','),
            ...logs.map(log => [
                log.timestamp,
                log.relativeTime,
                log.level,
                log.category,
                `"${log.message.replace(/"/g, '""')}"`,
                log.data ? `"${JSON.stringify(log.data).replace(/"/g, '""')}"` : ''
            ].join(','))
        ].join('\n');
        
        return csvContent;
    }
    
    // TXT Export
    exportToTXT(logs) {
        return logs.map(log => 
            `[${log.timestamp}] ${log.level} [${log.category}] ${log.message}${log.data ? ' | Data: ' + JSON.stringify(log.data) : ''}`
        ).join('\n');
    }
    
    // Logs löschen
    clearLogs() {
        this.logs = [];
        console.log('📊 Logs gelöscht');
    }
    
    // Log-Export Setup
    setupLogExport() {
        // Globale Funktionen für Debugging
        window.getLogs = (filter) => this.getLogs(filter);
        window.exportLogs = (format) => this.exportLogs(format);
        window.clearLogs = () => this.clearLogs();
        window.setLogLevel = (level) => this.setLevel(level);
        
        // Log-Viewer in Console
        window.logViewer = {
            show: (filter) => {
                const logs = this.getLogs(filter);
                console.table(logs);
                return logs;
            },
            errors: () => this.getLogs({ level: 'ERROR' }),
            warnings: () => this.getLogs({ level: 'WARN' }),
            info: () => this.getLogs({ level: 'INFO' }),
            debug: () => this.getLogs({ level: 'DEBUG' }),
            recent: (minutes = 5) => this.getLogs({ since: minutes * 60 * 1000 })
        };
    }
    
    // Spezielle Log-Methoden für verschiedene Kategorien
    auth(message, data = null) {
        this.log('INFO', 'AUTH', message, data);
    }
    
    firebase(message, data = null) {
        this.log('DEBUG', 'FIREBASE', message, data);
    }
    
    api(message, data = null) {
        this.log('INFO', 'API', message, data);
    }
    
    ui(message, data = null) {
        this.log('DEBUG', 'UI', message, data);
    }
    
    error(message, error = null, data = null) {
        this.log('ERROR', 'ERROR', message, { error: error?.message || error, stack: error?.stack, ...data });
    }
    
    performance(message, data = null) {
        this.log('DEBUG', 'PERFORMANCE', message, data);
    }
    
    // Performance-Tracking
    startTimer(name) {
        this.timers = this.timers || {};
        this.timers[name] = Date.now();
        this.log('DEBUG', 'PERFORMANCE', `Timer gestartet: ${name}`);
    }
    
    endTimer(name) {
        if (this.timers && this.timers[name]) {
            const duration = Date.now() - this.timers[name];
            this.log('DEBUG', 'PERFORMANCE', `Timer beendet: ${name} (${duration}ms)`, { duration });
            delete this.timers[name];
            return duration;
        }
        return null;
    }
}

// Globale Logger-Instanz erstellen
window.logger = new Logger();

// Erweiterte Log-Funktionen
window.log = {
    auth: (message, data) => window.logger.auth(message, data),
    firebase: (message, data) => window.logger.firebase(message, data),
    api: (message, data) => window.logger.api(message, data),
    ui: (message, data) => window.logger.ui(message, data),
    error: (message, error, data) => window.logger.error(message, error, data),
    performance: (message, data) => window.logger.performance(message, data),
    startTimer: (name) => window.logger.startTimer(name),
    endTimer: (name) => window.logger.endTimer(name)
};

// Console-Hilfe anzeigen
console.log(`
📊 LOG-SYSTEM AKTIVIERT

Verfügbare Befehle:
- getLogs() - Alle Logs anzeigen
- getLogs({level: 'ERROR'}) - Nur Fehler anzeigen
- getLogs({category: 'AUTH'}) - Nur Auth-Logs anzeigen
- getLogs({search: 'firebase'}) - Logs durchsuchen
- exportLogs('json') - Logs als JSON exportieren
- exportLogs('csv') - Logs als CSV exportieren
- clearLogs() - Logs löschen
- setLogLevel('DEBUG') - Log-Level setzen

Log-Viewer:
- logViewer.show() - Logs in Tabelle anzeigen
- logViewer.errors() - Nur Fehler
- logViewer.warnings() - Nur Warnungen
- logViewer.recent(5) - Logs der letzten 5 Minuten

Schnelle Log-Funktionen:
- log.auth('Nachricht') - Auth-Log
- log.firebase('Nachricht') - Firebase-Log
- log.api('Nachricht') - API-Log
- log.error('Nachricht', error) - Fehler-Log
- log.startTimer('name') - Timer starten
- log.endTimer('name') - Timer beenden
`);

// Automatisches Logging für wichtige Events
document.addEventListener('DOMContentLoaded', () => {
    window.logger.log('INFO', 'SYSTEM', 'DOM Content Loaded');
});

window.addEventListener('load', () => {
    window.logger.log('INFO', 'SYSTEM', 'Window Loaded');
});

window.addEventListener('error', (event) => {
    window.logger.error('JavaScript Error', event.error, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
    });
});

window.addEventListener('unhandledrejection', (event) => {
    window.logger.error('Unhandled Promise Rejection', event.reason);
});

console.log('✅ Logger-System erfolgreich initialisiert');