/**
 * REPARIERTER Global Footer Loader - Automatisch auf JEDER Seite
 * Lädt Footer automatisch ohne manuelle Einbindung in HTML
 */

class AutoGlobalFooterLoader {
    constructor() {
        this.footerHTML = null;
        this.isLoaded = false;
        this.autoInit();
    }
    
    autoInit() {
        console.log('🦶 Auto Global Footer Loader gestartet');
        
        // Footer HTML definieren
        this.footerHTML = this.getFooterTemplate();
        
        // Sofortige Initialisierung
        this.quickLoad();
        
        // Backup-Initialisierung für alle DOM-Zustände
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.safeLoad());
        } else {
            this.safeLoad();
        }
        
        // Backup für sehr späte Initialisierung
        setTimeout(() => this.ensureFooterExists(), 2000);
    }
    
    // Schneller Load-Versuch
    quickLoad() {
        try {
            if (document.body && !this.isFooterPresent()) {
                this.injectFooter();
                console.log('⚡ Footer schnell geladen');
            }
        } catch (error) {
            console.log('⚠️ Schneller Load fehlgeschlagen, Backup wird verwendet');
        }
    }
    
    // Sicherer Load
    safeLoad() {
        if (this.isLoaded || this.isFooterPresent()) {
            console.log('🦶 Footer bereits vorhanden - übersprungen');
            return;
        }
        
        this.injectFooter();
    }
    
    // Sicherstellen dass Footer existiert
    ensureFooterExists() {
        if (!this.isFooterPresent()) {
            console.log('🔧 Footer fehlt - wird nachgeladen');
            this.injectFooter();
        }
    }
    
    // Prüfen ob Footer bereits vorhanden ist
    isFooterPresent() {
        return !!document.querySelector('.global-footer');
    }
    
    // Footer in die Seite einfügen
    injectFooter() {
        if (!document.body) {
            console.warn('⚠️ Kein Body-Element gefunden');
            return;
        }
        
        if (this.isFooterPresent()) {
            console.log('🦶 Footer bereits vorhanden');
            return;
        }
        
        // Footer am Ende des Body einfügen
        document.body.insertAdjacentHTML('beforeend', this.footerHTML);
        this.isLoaded = true;
        
        console.log('✅ Global Footer automatisch eingefügt');
        
        // Footer-Features nach kleiner Verzögerung initialisieren
        setTimeout(() => this.initializeFooterFeatures(), 100);
    }
    
    // Footer HTML Template
    getFooterTemplate() {
        return `
            <!-- AUTOMATISCHER Global Footer -->
            <footer class="global-footer">
                <div class="footer-content">
                    <!-- Rechtliche Links -->
                    <div class="footer-section">
                        <h4>📋 Rechtliches</h4>
                        <ul class="footer-links legal-links">
                            <li><a href="impressum.html">📄 Impressum</a></li>
                            <li><a href="datenschutz.html">🔒 Datenschutzerklärung</a></li>
                            <li><a href="agb.html">📜 AGB & Nutzungsbedingungen</a></li>
                            <li><a href="kontakt.html">✉️ Kontakt</a></li>
                        </ul>
                    </div>
                    
                    <!-- Tools & Navigation -->
                    <div class="footer-section">
                        <h4>🛠️ Tools & Navigation</h4>
                        <ul class="footer-links">
                            <li><a href="index.html">🏠 Startseite</a></li>
                            <li><a href="as-counter.html" class="auto-tool-link" data-dashboard="dashboard-as-counter.html">⚔️ AS-Counter</a></li>
                            <li><a href="raid-counter.html" class="auto-tool-link" data-dashboard="dashboard-raid-counter.html">🏴‍☠️ Raid-Counter</a></li>
                            <li><a href="register.html">🚀 Account erstellen</a></li>
                        </ul>
                    </div>
                    
                    <!-- Admin & Support -->
                    <div class="footer-section">
                        <h4>⚙️ Administration</h4>
                        <ul class="footer-links admin-links">
                            <li><a href="admin-login.html" id="auto-admin-login-link">🔐 Admin-Login</a></li>
                            <li><a href="admin-dashboard.html" id="auto-admin-dashboard-link" style="display: none;">🛡️ Admin-Dashboard</a></li>
                        </ul>
                        <ul class="footer-links" style="margin-top: 15px;">
                            <li><a href="hilfe.html">❓ Hilfe & FAQ</a></li>
                            <li><a href="changelog.html">📝 Changelog</a></li>
                            <li><a href="roadmap.html">🗺️ Roadmap</a></li>
                        </ul>
                    </div>
                </div>
                
                <div class="footer-bottom">
                    <div class="footer-bottom-left">
                        <p>© 2025 Spacenations Tools | Inoffizielle Tools für die Spacenations Community</p>
                        <p style="font-size: 0.8rem; margin-top: 5px; opacity: 0.8;">
                            Made with ❤️ for Spacenations Players | Version 2.1.0 | Auto-Footer ✨
                        </p>
                    </div>
                    
                    <div class="footer-bottom-right">
                        <!-- Status Indicator -->
                        <div class="status-indicator" id="auto-system-status">
                            <span class="status-dot"></span>
                            <span>Online</span>
                        </div>
                        
                        <!-- Quick Tools -->
                        <div class="quick-tools">
                            <a href="#" class="quick-tool auto-theme-toggle">🌙 Theme</a>
                            <a href="dashboard.html" class="quick-tool" id="auto-quick-dashboard">🏠 Dashboard</a>
                        </div>
                        
                        <!-- Social Links -->
                        <div class="social-links">
                            <a href="#" class="social-link" title="Discord Server">🎮</a>
                            <a href="#" class="social-link" title="GitHub Repository">⚡</a>
                            <a href="mailto:admin@spacenations-tools.de" class="social-link" title="E-Mail">✉️</a>
                        </div>
                    </div>
                </div>
            </footer>
        `;
    }
    
    // Footer-Features initialisieren
    initializeFooterFeatures() {
        this.setupAutoThemeToggle();
        this.setupAutoAdminLinks();
        this.setupAutoDashboardLinks();
        this.setupAutoSystemStatus();
        this.setupAutoToolLinks();
        
        console.log('⚙️ Auto-Footer-Features initialisiert');
    }
    
    // Auto Theme Toggle
    setupAutoThemeToggle() {
        const themeToggle = document.querySelector('.auto-theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', (e) => {
                e.preventDefault();
                if (window.ThemeAPI) {
                    window.ThemeAPI.toggle();
                } else if (window.toggleTheme) {
                    window.toggleTheme();
                } else {
                    console.warn('⚠️ Keine Theme-Funktion verfügbar');
                }
            });
        }
    }
    
    // Auto Admin Links
    setupAutoAdminLinks() {
        const checkAuth = () => {
            if (window.AuthAPI) {
                window.AuthAPI.onAuthStateChange((user, userData) => {
                    const adminLoginLink = document.getElementById('auto-admin-login-link');
                    const adminDashboardLink = document.getElementById('auto-admin-dashboard-link');
                    
                    if (userData && userData.isAllianceAdmin) {
                        if (adminLoginLink) adminLoginLink.style.display = 'none';
                        if (adminDashboardLink) adminDashboardLink.style.display = 'block';
                    } else {
                        if (adminLoginLink) adminLoginLink.style.display = 'block';
                        if (adminDashboardLink) adminDashboardLink.style.display = 'none';
                    }
                });
            } else {
                setTimeout(checkAuth, 1000);
            }
        };
        
        checkAuth();
    }
    
    // Auto Dashboard Links
    setupAutoDashboardLinks() {
        const checkAuth = () => {
            if (window.AuthAPI) {
                window.AuthAPI.onAuthStateChange((user, _userData) => {
                    const quickDashboard = document.getElementById('auto-quick-dashboard');
                    
                    if (user) {
                        if (quickDashboard) {
                            quickDashboard.textContent = '🏠 Dashboard';
                            quickDashboard.href = 'dashboard.html';
                        }
                        this.updateAutoToolLinksForLoggedInUser();
                    } else {
                        if (quickDashboard) {
                            quickDashboard.textContent = '🔐 Login';
                            quickDashboard.href = 'index.html';
                        }
                        this.resetAutoToolLinksForLoggedOutUser();
                    }
                });
            } else {
                setTimeout(checkAuth, 1000);
            }
        };
        
        checkAuth();
    }
    
    // Auto Tool Links für eingeloggte User
    updateAutoToolLinksForLoggedInUser() {
        const toolLinks = document.querySelectorAll('.auto-tool-link');
        
        toolLinks.forEach(link => {
            const dashboardVersion = link.getAttribute('data-dashboard');
            if (dashboardVersion) {
                link.href = dashboardVersion;
                
                if (link.textContent.includes('AS-Counter') && !link.textContent.includes('💾')) {
                    link.innerHTML = '⚔️💾 AS-Counter (Dashboard)';
                }
                if (link.textContent.includes('Raid-Counter') && !link.textContent.includes('💾')) {
                    link.innerHTML = '🏴‍☠️💾 Raid-Counter (Dashboard)';
                }
                
                link.title = 'Dashboard-Version - Automatisches Speichern aktiviert';
            }
        });
    }
    
    // Auto Tool Links für ausgeloggte User
    resetAutoToolLinksForLoggedOutUser() {
        const toolLinks = document.querySelectorAll('.auto-tool-link');
        
        toolLinks.forEach(link => {
            if (link.href.includes('dashboard-calculator')) {
                link.href = 'as-counter.html';
                link.innerHTML = '⚔️ AS-Counter';
                link.title = 'AS-Counter (Standard-Version)';
            }
            if (link.href.includes('dashboard-raid-counter')) {
                link.href = 'raid-counter.html';
                link.innerHTML = '🏴‍☠️ Raid-Counter';
                link.title = 'Raid-Counter (Standard-Version)';
            }
        });
    }
    
    // Auto System Status
    setupAutoSystemStatus() {
        const statusIndicator = document.getElementById('auto-system-status');
        if (!statusIndicator) return;
        
        // Online-Status prüfen
        const updateStatus = () => {
            if (navigator.onLine) {
                statusIndicator.className = 'status-indicator';
                statusIndicator.innerHTML = '<span class="status-dot"></span><span>Online</span>';
            } else {
                statusIndicator.className = 'status-indicator offline';
                statusIndicator.innerHTML = '<span class="status-dot"></span><span>Offline</span>';
            }
        };
        
        updateStatus();
        
        window.addEventListener('online', updateStatus);
        window.addEventListener('offline', updateStatus);
    }
    
    // Auto Tool Links Setup
    setupAutoToolLinks() {
        // Hier können weitere Tool-spezifische Links konfiguriert werden
        console.log('🔗 Auto Tool Links konfiguriert');
    }
    
    // Force-Reload für dynamische Inhalte
    forceReload() {
        const existingFooter = document.querySelector('.global-footer');
        if (existingFooter) {
            existingFooter.remove();
        }
        
        this.isLoaded = false;
        this.safeLoad();
        
        console.log('🔄 Auto-Footer force-reloaded');
    }
    
    // Public API
    updateContent(updates) {
        if (!this.isLoaded) return;
        
        if (updates.status) {
            const statusIndicator = document.getElementById('auto-system-status');
            if (statusIndicator) {
                statusIndicator.innerHTML = `<span class="status-dot"></span><span>${updates.status}</span>`;
            }
        }
        
        if (updates.version) {
            const versionText = document.querySelector('.footer-bottom-left p:last-child');
            if (versionText) {
                versionText.innerHTML = `Made with ❤️ for Spacenations Players | Version ${updates.version} | Auto-Footer ✨`;
            }
        }
        
        console.log('📝 Auto-Footer aktualisiert:', updates);
    }
}

// SOFORTIGE automatische Initialisierung
if (!window.autoGlobalFooterLoader) {
    window.autoGlobalFooterLoader = new AutoGlobalFooterLoader();
}

// Globale API für Footer-Management
window.AutoFooterAPI = {
    // Footer neu laden
    reload: () => window.autoGlobalFooterLoader.forceReload(),
    
    // Footer-Inhalte aktualisieren
    update: (updates) => window.autoGlobalFooterLoader.updateContent(updates),
    
    // Prüfen ob Footer geladen ist
    isLoaded: () => window.autoGlobalFooterLoader.isLoaded,
    
    // Footer manuell laden
    load: () => window.autoGlobalFooterLoader.safeLoad(),
    
    // Status ändern
    setStatus: (status, type = 'online') => {
        const statusIndicator = document.getElementById('auto-system-status');
        if (statusIndicator) {
            statusIndicator.className = `status-indicator ${type}`;
            statusIndicator.innerHTML = `<span class="status-dot"></span><span>${status}</span>`;
        }
    }
};

// Auto-Load Überwachung für dynamische Seiten
const autoFooterObserver = new MutationObserver(() => {
    if (!window.autoGlobalFooterLoader.isFooterPresent()) {
        console.log('🔍 Footer verschwunden - wird neu geladen');
        window.autoGlobalFooterLoader.ensureFooterExists();
    }
});

// Observer starten wenn DOM bereit
const startObserver = () => {
    if (document.body) {
        autoFooterObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
        console.log('👁️ Auto-Footer Observer gestartet');
    } else {
        setTimeout(startObserver, 500);
    }
};

startObserver();

console.log('🦶 Auto Global Footer Loader vollständig geladen');
console.log('📋 API verfügbar: window.AutoFooterAPI');
console.log('✨ Footer wird AUTOMATISCH auf JEDER Seite geladen!');
