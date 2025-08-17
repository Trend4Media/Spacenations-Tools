/**
 * Dashboard Core - Erweitert Ihre bestehende dashboard.html mit zusätzlicher Funktionalität
 * Funktioniert perfekt mit Ihren bestehenden Firebase- und Auth-Dateien
 */

class DashboardCore {
    constructor() {
        this.currentUser = null;
        this.userData = null;
        this.isInitialized = false;
        
        this.init();
    }
    
    async init() {
        try {
            // Warten bis alle Module bereit sind
            await this.waitForDependencies();
            
            // Auth State überwachen
            window.AuthAPI.onAuthStateChange((user, userData) => {
                this.currentUser = user;
                this.userData = userData;
                
                if (user && userData) {
                    this.initializeDashboard();
                }
            });
            
            this.isInitialized = true;
            console.log('🎯 Dashboard Core initialisiert');
            
        } catch (error) {
            console.error('❌ Dashboard Core Initialisierung fehlgeschlagen:', error);
        }
    }
    
    // Warten bis alle Abhängigkeiten geladen sind
    async waitForDependencies() {
        const dependencies = [
            () => window.AuthAPI,
            () => window.FirebaseConfig,
            () => window.ThemeAPI
        ];
        
        for (const check of dependencies) {
            while (!check()) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }
    }
    
    // Dashboard initialisieren
    async initializeDashboard() {
        try {
            console.log('🏠 Dashboard wird für User initialisiert:', this.userData.username);
            
            // UI aktualisieren
            this.updateDashboardUI();
            
            // Enhanced Statistiken laden
            await this.loadEnhancedStats();
            
            // Erweiterte Aktivitäten laden
            await this.loadEnhancedActivities();
            
            // Dashboard-Features aktivieren
            this.enableDashboardFeatures();
            
            // Auto-Refresh starten
            this.startAutoRefresh();
            
            console.log('✅ Dashboard vollständig initialisiert');
            
        } catch (error) {
            console.error('❌ Fehler bei Dashboard-Initialisierung:', error);
        }
    }
    
    // Dashboard UI aktualisieren
    updateDashboardUI() {
        // Header Username
        const headerUsername = document.getElementById('header-username');
        if (headerUsername) {
            headerUsername.textContent = this.userData.username || 'User';
        }
        
        // User Profile Sidebar
        const userAvatar = document.getElementById('user-avatar');
        const userName = document.getElementById('user-name');
        const userEmail = document.getElementById('user-email');
        
        if (userAvatar) {
            const firstLetter = (this.userData.username || 'U').charAt(0).toUpperCase();
            userAvatar.textContent = firstLetter;
        }
        
        if (userName) userName.textContent = this.userData.username || 'User';
        if (userEmail) userEmail.textContent = this.userData.email || '';
        
        // Allianz-Badge hinzufügen
        this.updateAllianceBadge();
        
        console.log('🎨 Dashboard UI aktualisiert');
    }
    
    // Allianz-Badge aktualisieren
    updateAllianceBadge() {
        const userBadges = document.getElementById('user-badges');
        if (!userBadges || !this.userData.alliance) return;
        
        // Prüfen ob Badge bereits existiert
        if (userBadges.innerHTML.includes(this.userData.alliance)) return;
        
        const allianceBadge = document.createElement('span');
        allianceBadge.className = 'badge badge-alliance';
        allianceBadge.textContent = this.userData.alliance;
        userBadges.appendChild(allianceBadge);
        
        // Allianz-Info Sektion anzeigen
        const allianceSection = document.getElementById('alliance-section');
        const allianceName = document.getElementById('alliance-name');
        const allianceDetails = document.getElementById('alliance-details');
        
        if (allianceSection && allianceName && allianceDetails) {
            allianceSection.style.display = 'block';
            allianceName.textContent = this.userData.alliance;
            allianceDetails.textContent = `Mitglied der Allianz "${this.userData.alliance}"`;
        }
    }
    
    // Erweiterte Statistiken laden
    async loadEnhancedStats() {
        try {
            // Basis-Statistiken
            const createdDate = this.userData.createdAt ? this.userData.createdAt.toDate() : new Date();
            const daysSinceCreation = Math.floor((new Date() - createdDate) / (1000 * 60 * 60 * 24));
            
            let battlesCount = 0;
            let raidsCount = 0;
            let winRate = 0;
            
            // Calculator-Statistiken falls verfügbar
            if (window.CalculatorAPI && window.CalculatorAPI.isLoggedIn()) {
                const stats = window.CalculatorAPI.getStats();
                battlesCount = stats.totalBattles || 0;
                winRate = stats.winRate || 0;
                
                console.log('📊 Calculator-Statistiken geladen:', stats);
            } else {
                // Simulierte Werte basierend auf Account-Alter
                battlesCount = Math.floor(daysSinceCreation * 0.7) + Math.floor(Math.random() * 15);
                winRate = Math.floor(65 + Math.random() * 25);
            }
            
            // Raid-Statistiken (simuliert oder aus zukünftigem Raid-System)
            raidsCount = Math.floor(daysSinceCreation * 0.3) + Math.floor(Math.random() * 8);
            
            // Firestore-Statistiken laden und überschreiben falls vorhanden
            await this.loadFirestoreStats(battlesCount, raidsCount, winRate, daysSinceCreation);
            
            // Animierte Zähler starten
            this.animateStatCounters();
            
        } catch (error) {
            console.error('❌ Fehler beim Laden der Statistiken:', error);
            this.setFallbackStats();
        }
    }
    
    // Firestore-Statistiken laden
    async loadFirestoreStats(defaultBattles, defaultRaids, defaultWinRate, defaultDays) {
        try {
            const db = window.FirebaseConfig.getDB();
            const statsDoc = await db.collection('userStats').doc(this.currentUser.uid).get();
            
            if (statsDoc.exists) {
                const firestoreStats = statsDoc.data();
                
                document.getElementById('battles-count').setAttribute('data-target', firestoreStats.battles || defaultBattles);
                document.getElementById('raids-count').setAttribute('data-target', firestoreStats.raids || defaultRaids);
                document.getElementById('win-rate').setAttribute('data-target', firestoreStats.winRate || defaultWinRate);
                document.getElementById('days-active').setAttribute('data-target', defaultDays);
                
                console.log('📈 Firestore-Statistiken geladen');
            } else {
                // Default-Werte setzen
                document.getElementById('battles-count').setAttribute('data-target', defaultBattles);
                document.getElementById('raids-count').setAttribute('data-target', defaultRaids);
                document.getElementById('win-rate').setAttribute('data-target', defaultWinRate);
                document.getElementById('days-active').setAttribute('data-target', defaultDays);
            }
            
        } catch (error) {
            console.error('❌ Fehler beim Laden der Firestore-Statistiken:', error);
            this.setFallbackStats();
        }
    }
    
    // Fallback-Statistiken setzen
    setFallbackStats() {
        document.getElementById('battles-count').textContent = '0';
        document.getElementById('raids-count').textContent = '0';
        document.getElementById('win-rate').textContent = '0%';
        document.getElementById('days-active').textContent = '0';
    }
    
    // Animierte Zähler
    animateStatCounters() {
        const statElements = [
            { element: document.getElementById('battles-count'), suffix: '' },
            { element: document.getElementById('raids-count'), suffix: '' },
            { element: document.getElementById('win-rate'), suffix: '%' },
            { element: document.getElementById('days-active'), suffix: '' }
        ];
        
        statElements.forEach(({ element, suffix }) => {
            if (!element) return;
            
            const target = parseInt(element.getAttribute('data-target')) || 0;
            const duration = 2000 + Math.random() * 1000; // 2-3 Sekunden
            const increment = target / (duration / 16);
            let current = 0;
            
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                
                element.textContent = Math.floor(current) + suffix;
            }, 16);
        });
        
        console.log('🎯 Stat-Counter-Animationen gestartet');
    }
    
    // Erweiterte Aktivitäten laden
    async loadEnhancedActivities() {
        const activityList = document.getElementById('activity-list');
        if (!activityList) return;
        
        try {
            // Echte Aktivitäten aus Firestore laden
            const db = window.FirebaseConfig.getDB();
            const activitiesQuery = await db.collection('userActivities')
                .where('userId', '==', this.currentUser.uid)
                .orderBy('timestamp', 'desc')
                .limit(8)
                .get();
            
            if (!activitiesQuery.empty) {
                let activitiesHtml = '';
                activitiesQuery.forEach(doc => {
                    const activity = doc.data();
                    const time = this.formatActivityTime(activity.timestamp.toDate());
                    activitiesHtml += this.createEnhancedActivityItem(activity.icon, activity.text, time);
                });
                activityList.innerHTML = activitiesHtml;
                
                console.log('📝 Echte Aktivitäten geladen:', activitiesQuery.size);
            } else {
                this.showEnhancedExampleActivities();
            }
            
        } catch (error) {
            console.error('❌ Fehler beim Laden der Aktivitäten:', error);
            this.showEnhancedExampleActivities();
        }
    }
    
    // Erweiterte Beispiel-Aktivitäten
    showEnhancedExampleActivities() {
        const activityList = document.getElementById('activity-list');
        const now = new Date();
        
        const activities = [
            {
                icon: '🎉',
                text: 'Account erfolgreich erstellt',
                time: this.userData.createdAt ? this.userData.createdAt.toDate() : now
            },
            {
                icon: '🔐',
                text: 'Erfolgreich angemeldet',
                time: new Date(now.getTime() - 5 * 60 * 1000)
            },
            {
                icon: '🏠',
                text: 'Dashboard besucht',
                time: new Date(now.getTime() - 2 * 60 * 1000)
            },
            {
                icon: '⚔️',
                text: 'AS-Counter bereit zur Nutzung',
                time: new Date(now.getTime() - 1 * 60 * 1000)
            },
            {
                icon: '📊',
                text: 'Dashboard-Features aktiviert',
                time: new Date()
            }
        ];
        
        let activitiesHtml = '';
        activities.forEach(activity => {
            const timeStr = this.formatActivityTime(activity.time);
            activitiesHtml += this.createEnhancedActivityItem(activity.icon, activity.text, timeStr);
        });
        
        activityList.innerHTML = activitiesHtml;
    }
    
    // Enhanced Activity Item erstellen
    createEnhancedActivityItem(icon, text, time) {
        return `
            <div class="activity-item">
                <div class="activity-icon">${icon}</div>
                <div class="activity-content">
                    <div class="activity-text">${text}</div>
                    <div class="activity-time">${time}</div>
                </div>
            </div>
        `;
    }
    
    // Zeit formatieren
    formatActivityTime(date) {
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        
        if (minutes < 1) return 'Gerade eben';
        if (minutes < 60) return `vor ${minutes} Min.`;
        if (hours < 24) return `vor ${hours} Std.`;
        if (days < 7) return `vor ${days} Tag${days === 1 ? '' : 'en'}`;
        
        return date.toLocaleDateString('de-DE', { 
            day: '2-digit', 
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    // Dashboard-Features aktivieren
    enableDashboardFeatures() {
        // Enhanced Navigation
        this.setupEnhancedNavigation();
        
        // Keyboard Shortcuts
        this.setupKeyboardShortcuts();
        
        // Performance Monitoring
        this.setupPerformanceMonitoring();
        
        // Integration mit Calculator
        this.setupCalculatorIntegration();
        
        console.log('⚡ Dashboard-Features aktiviert');
    }
    
    // Enhanced Navigation
    setupEnhancedNavigation() {
        // AS-Counter Links für eingeloggte User erweitern
        const calculatorLinks = document.querySelectorAll('a[href="as-counter.html"]');
        calculatorLinks.forEach(link => {
            link.href = 'dashboard-as-counter.html';
            link.title = 'AS-Counter (Dashboard) - Alle Kämpfe werden automatisch gespeichert';
            
            // Icon erweitern
            const icon = link.querySelector('.nav-icon, .action-icon');
            if (icon && !icon.textContent.includes('💾')) {
                icon.textContent = '⚔️💾';
            }
        });
        
        // Premium-Features mit Coming-Soon verbinden
        const premiumLinks = document.querySelectorAll('a[href="#"]');
        premiumLinks.forEach(link => {
            if (link.onclick && link.onclick.toString().includes('showPremiumFeature')) {
                // Link ist bereits richtig konfiguriert
                return;
            }
            
            const text = link.textContent.trim();
            if (text.includes('Profil') || text.includes('Allianz')) {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.showComingSoon(text);
                });
            }
        });
    }
    
    // Keyboard Shortcuts
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Strg+D = Dashboard
            if (e.ctrlKey && e.key === 'd') {
                e.preventDefault();
                window.location.reload();
            }
            
            // Strg+C = Calculator
            if (e.ctrlKey && e.key === 'c') {
                e.preventDefault();
                window.location.href = 'dashboard-as-counter.html';
            }
            
            // Strg+R = Refresh Stats
            if (e.ctrlKey && e.key === 'r') {
                e.preventDefault();
                this.refreshDashboardData();
            }
            
            // Esc = Close all dropdowns/modals
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
        
        console.log('⌨️ Keyboard Shortcuts aktiviert: Strg+D (Reload), Strg+C (Calculator), Strg+R (Refresh)');
    }
    
    // Performance Monitoring
    setupPerformanceMonitoring() {
        // Ladezeit messen
        const loadStartTime = performance.now();
        
        window.addEventListener('load', () => {
            const loadTime = performance.now() - loadStartTime;
            console.log(`⚡ Dashboard Ladezeit: ${Math.round(loadTime)}ms`);
            
            if (loadTime > 3000) {
                this.showNotification('Dashboard lädt langsam. Überprüfen Sie Ihre Internetverbindung.', 'warning');
            }
        });
        
        // Memory Usage überwachen (falls verfügbar)
        if ('memory' in performance) {
            setInterval(() => {
                const memory = performance.memory;
                if (memory.usedJSHeapSize > 50 * 1024 * 1024) { // 50MB
                    console.warn('⚠️ Hoher Speicherverbrauch detected');
                }
            }, 60000); // Alle 60 Sekunden prüfen
        }
    }
    
    // Calculator Integration
    setupCalculatorIntegration() {
        if (!window.CalculatorAPI) {
            console.log('📊 Calculator API nicht verfügbar - Integration übersprungen');
            return;
        }
        
        // AS-Counter-Updates überwachen
        document.addEventListener('calculatorDataUpdated', async () => {
            console.log('🔄 AS-Counter-Daten aktualisiert - Dashboard wird refreshed');
            await this.loadEnhancedStats();
            await this.loadEnhancedActivities();
        });
        
        // Enhanced Stats mit Calculator-Daten
        this.enhanceStatsWithCalculatorData();
    }
    
    // Stats mit Calculator-Daten erweitern
    enhanceStatsWithCalculatorData() {
        if (!window.CalculatorAPI || !window.CalculatorAPI.isLoggedIn()) return;
        
        try {
            const stats = window.CalculatorAPI.getStats();
            const recentBattles = window.CalculatorAPI.getBattleHistory({ limit: 3 });
            
            // Zusätzliche Stat-Cards erstellen
            this.createAdditionalStatCards(stats);
            
            // Recent Battles in Activities integrieren
            this.integrateRecentBattles(recentBattles);
            
            console.log('📊 Dashboard mit Calculator-Daten erweitert');
            
        } catch (error) {
            console.error('❌ Fehler bei Calculator-Integration:', error);
        }
    }
    
    // Zusätzliche Stat-Cards erstellen
    createAdditionalStatCards(stats) {
        const statsGrid = document.querySelector('.stats-grid');
        if (!statsGrid || statsGrid.children.length > 4) return; // Bereits erweitert
        
        // Damage Card
        const damageCard = document.createElement('div');
        damageCard.className = 'stat-card';
        damageCard.innerHTML = `
            <span class="stat-icon">💥</span>
            <div class="stat-value">${this.formatLargeNumber(stats.totalDamageDealt)}</div>
            <div class="stat-label">Schaden verursacht</div>
        `;
        
        // Ships Lost Card
        const shipsCard = document.createElement('div');
        shipsCard.className = 'stat-card';
        shipsCard.innerHTML = `
            <span class="stat-icon">🚀</span>
            <div class="stat-value">${stats.totalShipsDestroyed || 0}</div>
            <div class="stat-label">Schiffe zerstört</div>
        `;
        
        statsGrid.appendChild(damageCard);
        statsGrid.appendChild(shipsCard);
    }
    
    // Recent Battles integrieren
    integrateRecentBattles(recentBattles) {
        if (!recentBattles || recentBattles.length === 0) return;
        
        const activityList = document.getElementById('activity-list');
        if (!activityList) return;
        
        // Battle-Activities erstellen
        let battleActivitiesHtml = '';
        recentBattles.slice(0, 2).forEach(battle => {
            const battleDate = battle.timestamp?.toDate ? battle.timestamp.toDate() : new Date(battle.timestamp);
            const resultEmoji = battle.result === 'win' ? '🏆' : battle.result === 'loss' ? '💀' : '🤝';
            const resultText = battle.result === 'win' ? 'Kampf gewonnen' : 
                battle.result === 'loss' ? 'Kampf verloren' : 'Kampf unentschieden';
            
            battleActivitiesHtml += this.createEnhancedActivityItem(
                resultEmoji,
                `${resultText} (${battle.attackerShips || 0} vs ${battle.defenderShips || 0} Schiffe)`,
                this.formatActivityTime(battleDate)
            );
        });
        
        // An den Anfang der Activity-Liste einfügen
        activityList.innerHTML = battleActivitiesHtml + activityList.innerHTML;
    }
    
    // Auto-Refresh starten
    startAutoRefresh() {
        // Dashboard alle 5 Minuten auto-refreshen
        this.autoRefreshInterval = setInterval(async () => {
            console.log('🔄 Auto-Refresh wird ausgeführt');
            await this.refreshDashboardData();
            this.showNotification('Dashboard automatisch aktualisiert', 'success', 2000);
        }, 5 * 60 * 1000); // 5 Minuten
        
        console.log('⏰ Auto-Refresh aktiviert (alle 5 Minuten)');
    }
    
    // Dashboard-Daten refreshen
    async refreshDashboardData() {
        try {
            await this.loadEnhancedStats();
            await this.loadEnhancedActivities();
            
            // Calculator-Integration neu laden
            if (window.CalculatorAPI && window.CalculatorAPI.isLoggedIn()) {
                this.enhanceStatsWithCalculatorData();
            }
            
            console.log('🔄 Dashboard-Daten refreshed');
            
        } catch (error) {
            console.error('❌ Fehler beim Refreshen der Dashboard-Daten:', error);
        }
    }
    
    // Utility-Funktionen
    formatLargeNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }
    
    showNotification(message, type = 'info', duration = 4000) {
        // Verwende bestehende Notification-Funktion falls vorhanden
        if (window.DashboardNav && window.DashboardNav.showNotification) {
            window.DashboardNav.showNotification(message, type, duration);
            return;
        }
        
        // Fallback: Einfache Notification erstellen
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Animation
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Auto-remove
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => document.body.removeChild(notification), 300);
        }, duration);
    }
    
    showComingSoon(featureName) {
        this.showNotification(`${featureName} kommt bald! 🚀`, 'warning', 3000);
    }
    
    closeAllModals() {
        // Schließe alle offenen Dropdowns/Modals
        const dropdowns = document.querySelectorAll('[style*="display: block"]');
        dropdowns.forEach(dropdown => {
            if (dropdown.id && dropdown.id.includes('dropdown')) {
                dropdown.style.display = 'none';
            }
        });
    }
    
    // Session-Management
    startSessionManagement() {
        let lastActivity = Date.now();
        const SESSION_WARNING_TIME = 25 * 60 * 1000; // 25 Minuten
        const SESSION_TIMEOUT_TIME = 30 * 60 * 1000; // 30 Minuten
        
        // Activity Tracker
        const updateActivity = () => {
            lastActivity = Date.now();
        };
        
        ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'].forEach(event => {
            document.addEventListener(event, updateActivity, true);
        });
        
        // Session Timer
        setInterval(() => {
            const timeSinceActivity = Date.now() - lastActivity;
            
            if (timeSinceActivity >= SESSION_TIMEOUT_TIME) {
                this.showNotification('Session abgelaufen. Sie werden abgemeldet.', 'error');
                setTimeout(() => {
                    if (window.SyncAPI && window.SyncAPI.dashboardLogout) {
                        window.SyncAPI.dashboardLogout();
                    }
                }, 3000);
            } else if (timeSinceActivity >= SESSION_WARNING_TIME) {
                this.showNotification('Session läuft in 5 Minuten ab.', 'warning', 5000);
            }
        }, 60 * 1000); // Jede Minute prüfen
        
        console.log('🔐 Session-Management aktiviert (30 Min Timeout)');
    }
    
    // Cleanup beim Verlassen der Seite
    cleanup() {
        if (this.autoRefreshInterval) {
            clearInterval(this.autoRefreshInterval);
        }
        
        console.log('🧹 Dashboard Core Cleanup abgeschlossen');
    }
    
    // Public API
    getStats() {
        return {
            user: this.currentUser,
            userData: this.userData,
            isInitialized: this.isInitialized
        };
    }
    
    // Event-Emitter für andere Module
    emit(eventName, data) {
        document.dispatchEvent(new CustomEvent(eventName, { detail: data }));
    }
    
    on(eventName, callback) {
        document.addEventListener(eventName, callback);
    }
}

// Globale Dashboard-Core-Instanz
window.dashboardCore = new DashboardCore();

// Globale API für Dashboard-Core
window.DashboardCoreAPI = {
    refresh: () => window.dashboardCore.refreshDashboardData(),
    getStats: () => window.dashboardCore.getStats(),
    showNotification: (message, type, duration) => window.dashboardCore.showNotification(message, type, duration),
    emit: (eventName, data) => window.dashboardCore.emit(eventName, data),
    on: (eventName, callback) => window.dashboardCore.on(eventName, callback)
};

// Cleanup beim Verlassen der Seite
window.addEventListener('beforeunload', () => {
    window.dashboardCore.cleanup();
});

// Session-Management starten
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        window.dashboardCore.startSessionManagement();
    }, 2000);
});

console.log('🎯 Dashboard Core geladen');
console.log('📋 API verfügbar: window.DashboardCoreAPI');
console.log('⌨️ Shortcuts: Strg+D (Reload), Strg+C (Calculator), Strg+R (Refresh), Esc (Close)');

/**
 * Navigation Update Script - Ergänzung für dashboard-core.js
 * Fügen Sie das zu Ihrer js/dashboard-core.js hinzu (am Ende vor dem letzten console.log)
 */

// Enhanced Navigation zwischen AS-Counter Versionen
// eslint-disable-next-line no-unused-vars
function setupEnhancedNavigation() {
    // Alle AS-Counter-Links finden und richtig verlinken
    const calculatorLinks = document.querySelectorAll('a[href="as-counter.html"], a[href*="as-counter"]');
    
    calculatorLinks.forEach(link => {
        const isInDashboard = window.location.pathname.includes('dashboard');
        const isLoggedIn = this.currentUser !== null;
        
        if (isInDashboard && isLoggedIn) {
            // Im Dashboard: Immer zum Dashboard-AS-Counter
            link.href = 'dashboard-as-counter.html';
            link.title = 'AS-Counter (Dashboard) - Kämpfe werden automatisch gespeichert';
            
            // Icon erweitern falls noch nicht geschehen
            const icon = link.querySelector('.nav-icon, .action-icon');
            if (icon && !icon.textContent.includes('💾')) {
                icon.textContent = '⚔️💾';
            }
            
            // Text erweitern falls vorhanden
            const titleElement = link.querySelector('.action-title, .nav-text');
            if (titleElement && !titleElement.textContent.includes('Dashboard')) {
                titleElement.textContent = 'AS-Counter (Dashboard)';
            }
            
            // Beschreibung erweitern
            const descElement = link.querySelector('.action-desc');
            if (descElement) {
                descElement.textContent = 'AS-Counter mit automatischem Speichern aller Kampfergebnisse';
            }
        }
    });
    
    // Version-Switcher hinzufügen (falls im Dashboard-AS-Counter)
    if (window.location.pathname.includes('dashboard-as-counter')) {
        this.addVersionSwitcher();
    }
    
    // Standard-Calculator Links erweitern für bessere UX
    this.enhanceStandardCalculatorLinks();
}

// Version-Switcher für Calculator
// eslint-disable-next-line no-unused-vars
function addVersionSwitcher() {
    const header = document.querySelector('.header');
    if (!header || document.getElementById('version-switcher')) return;
    
    const versionSwitcher = document.createElement('div');
    versionSwitcher.id = 'version-switcher';
    versionSwitcher.style.cssText = `
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        margin-top: 10px;
        display: flex;
        gap: 10px;
        font-size: 0.9rem;
        z-index: 10;
    `;
    
    versionSwitcher.innerHTML = `
        <span style="
            background: linear-gradient(135deg, var(--save-color), #2ecc71);
            color: white;
            padding: 5px 12px;
            border-radius: 15px;
            font-weight: 600;
            font-size: 0.8rem;
        ">
            💾 Dashboard-Version
        </span>
        <a href="as-counter.html" style="
            background: var(--card-bg);
            color: var(--text-secondary);
            padding: 5px 12px;
            border-radius: 15px;
            text-decoration: none;
            font-weight: 500;
            border: 1px solid var(--card-border);
            transition: all 0.3s ease;
            font-size: 0.8rem;
        " onmouseover="this.style.borderColor='var(--accent-secondary)'" onmouseout="this.style.borderColor='var(--card-border)'">
            ⚔️ Standard-Version
        </a>
    `;
    
    header.appendChild(versionSwitcher);
}

// Standard-Calculator Links verbessern
// eslint-disable-next-line no-unused-vars
function enhanceStandardCalculatorLinks() {
    // In as-counter.html einen Hinweis auf Dashboard-Version hinzufügen
    if (window.location.pathname.includes('as-counter.html') && !window.location.pathname.includes('dashboard')) {
        addDashboardVersionPromo();
    }
}

// Dashboard-Version Promotion in Standard-Calculator
function addDashboardVersionPromo() {
    const container = document.querySelector('.container');
    if (!container || document.getElementById('dashboard-promo')) return;
    
    const promo = document.createElement('div');
    promo.id = 'dashboard-promo';
    promo.style.cssText = `
        background: linear-gradient(135deg, #3b82f6, #1d4ed8);
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        margin-bottom: 20px;
        text-align: center;
        box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
    `;
    
    promo.innerHTML = `
        <h4 style="margin-bottom: 10px; font-size: 1.1rem;">💾 Upgrade zum Dashboard-Calculator!</h4>
        <p style="margin-bottom: 15px; font-size: 0.9rem; opacity: 0.9;">
            Speichere alle deine Kämpfe automatisch und verfolge deine Statistiken
        </p>
        <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
            <a href="dashboard.html" style="
                background: rgba(255, 255, 255, 0.2);
                color: white;
                padding: 8px 16px;
                border-radius: 6px;
                text-decoration: none;
                font-weight: 600;
                font-size: 0.9rem;
                transition: all 0.3s ease;
            " onmouseover="this.style.background='rgba(255,255,255,0.3)'" onmouseout="this.style.background='rgba(255,255,255,0.2)'">
                🏠 Zum Dashboard
            </a>
            <a href="register.html" style="
                background: rgba(255, 255, 255, 0.2);
                color: white;
                padding: 8px 16px;
                border-radius: 6px;
                text-decoration: none;
                font-weight: 600;
                font-size: 0.9rem;
                transition: all 0.3s ease;
            " onmouseover="this.style.background='rgba(255,255,255,0.3)'" onmouseout="this.style.background='rgba(255,255,255,0.2)'">
                🚀 Account erstellen
            </a>
        </div>
    `;
    
    // Nach dem ersten input-section einfügen
    const firstInputSection = container.querySelector('.input-sections');
    if (firstInputSection) {
        container.insertBefore(promo, firstInputSection);
    }
}
