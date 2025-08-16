/**
 * Global Footer Loader - Lädt automatisch den Footer auf JEDER Seite
 * Einfach diese Datei in jede HTML-Seite einbinden!
 */

class GlobalFooterLoader {
    constructor() {
        this.footerHTML = null;
        this.isLoaded = false;
        this.init();
    }
    
    async init() {
        // Footer HTML definieren (einmal hier, überall verfügbar)
        this.footerHTML = this.getFooterTemplate();
        
        // Footer automatisch laden wenn DOM bereit ist
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.loadFooter());
        } else {
            this.loadFooter();
        }
        
        console.log('🦶 Global Footer Loader initialisiert');
    }
    
    // Footer Template (zentraler Ort für Footer-HTML)
    getFooterTemplate() {
        return `
            <!-- Global Footer -->
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
                            <li><a href="calculator.html" class="tool-link" data-dashboard="dashboard-calculator.html">⚔️ AS-Counter</a></li>
                            <li><a href="raid-counter.html" class="tool-link" data-dashboard="dashboard-raid-counter.html">🏴‍☠️ Raid-Counter</a></li>
                            <li><a href="register.html">🚀 Account erstellen</a></li>
                        </ul>
                    </div>
                    
                    <!-- Admin & Support -->
                    <div class="footer-section">
                        <h4>⚙️ Administration</h4>
                        <ul class="footer-links admin-links">
                            <li><a href="admin-login.html" id="admin-login-link">🔐 Admin-Login</a></li>
                            <li><a href="admin-dashboard.html" id="admin-dashboard-link" style="display: none;">🛡️ Admin-Dashboard</a></li>
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
                            Made with ❤️ for Spacenations Players | Version 2.1.0
                        </p>
                    </div>
                    
                    <div class="footer-bottom-right">
                        <!-- Status Indicator -->
                        <div class="status-indicator" id="system-status">
                            <span class="status-dot"></span>
                            <span>Online</span>
                        </div>
                        
                        <!-- Quick Tools -->
                        <div class="quick-tools">
                            <a href="#" class="quick-tool" onclick="window.ThemeAPI?.toggle()">🌙 Theme</a>
                            <a href="dashboard.html" class="quick-tool" id="quick-dashboard">🏠 Dashboard</a>
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
    
    // Footer auf der aktuellen Seite laden
    loadFooter() {
        if (this.isLoaded) {
            console.log('🦶 Footer bereits geladen - übersprungen');
            return;
        }
        
        // Prüfen ob Footer bereits vorhanden ist
        if (document.querySelector('.global-footer')) {
            console.log('🦶 Footer bereits im HTML vorhanden');
            this.isLoaded = true;
            this.initializeFooterFeatures();
            return;
        }
        
        // Footer am Ende des Body einfügen
        document.body.insertAdjacentHTML('beforeend', this.footerHTML);
        this.isLoaded = true;
        
        console.log('✅ Global Footer automatisch geladen');
        
        // Footer-Features initialisieren
        this.initializeFooterFeatures();
    }
    
    // Footer-Features nach dem Laden initialisieren
    initializeFooterFeatures() {
        this.setupAdminLinks();
        this.setupDashboardLinks();
        this.setupSystemStatus();
        this.setupToolLinks();
        
        console.log('⚙️ Footer-Features initialisiert');
    }
    
    // Admin-Links basierend auf Login-Status anpassen
    setupAdminLinks() {
        // Warten bis AuthAPI verfügbar ist
        const checkAuth = () => {
            if (window.AuthAPI) {
                window.AuthAPI.onAuthStateChange((user, userData) => {
                    const adminLoginLink = document.getElementById('admin-login-link');
                    const adminDashboardLink = document.getElementById('admin-dashboard-link');
                    
                    if (userData && userData.isAllianceAdmin) {
                        if (adminLoginLink) adminLoginLink.style.display = 'none';
                        if (adminDashboardLink) adminDashboardLink.style.display = 'block';
                    } else {
                        if (adminLoginLink) adminLoginLink.style.display = 'block';
                        if (adminDashboardLink) adminDashboardLink.style.display = 'none';
                    }
                });
            } else {
                setTimeout(checkAuth, 500);
            }
        };
        
        checkAuth();
    }
    
    // Dashboard-Links basierend auf Login-Status anpassen
    setupDashboardLinks() {
        const checkAuth = () => {
            if (window.AuthAPI) {
                window.AuthAPI.onAuthStateChange((user, userData) => {
                    const quickDashboard = document.getElementById('quick-dashboard');
                    
                    if (user) {
                        if (quickDashboard) {
                            quickDashboard.textContent = '🏠 Dashboard';
                            quickDashboard.href = 'dashboard.html';
                        }
                        
                        // Tool-Links zu Dashboard-Versionen umleiten
                        this.updateToolLinksForLoggedInUser();
                    } else {
                        if (quickDashboard) {
                            quickDashboard.textContent = '🔐 Login';
                            quickDashboard.href = 'index.html';
                        }
                        
                        // Tool-Links zu Standard-Versionen zurücksetzen
                        this.resetToolLinksForLoggedOutUser();
                    }
                });
            } else {
                setTimeout(checkAuth, 500);
            }
        };
        
        checkAuth();
    }
    
    // Tool-Links für eingeloggte User zu Dashboard-Versionen
    updateToolLinksForLoggedInUser() {
        const toolLinks = document.querySelectorAll('.tool-link');
        
        toolLinks.forEach(link => {
            const dashboardVersion = link.getAttribute('data-dashboard');
            if (dashboardVersion) {
                link.href = dashboardVersion;
                
                // Text erweitern um zu zeigen dass es Dashboard-Version ist
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
    
    // Tool-Links für ausgeloggte User zurücksetzen
    resetToolLinksForLoggedOutUser() {
        const toolLinks = document.querySelectorAll('.tool-link');
        
        toolLinks.forEach(link => {
            // Zurück zu Standard-URLs
            if (link.href.includes('dashboard-calculator')) {
                link.href = 'calculator.html';
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
    
    // System-Status prüfen und anzeigen
    setupSystemStatus() {
        const statusIndicator = document.getElementById('system-status');
        if (!statusIndicator) return;
        
        // Einfacher Online-Check
        if (navigator.onLine) {
            statusIndicator.className = 'status-indicator';
            statusIndicator.innerHTML = '<span class="status-dot"></span><span>Online</span>';
        } else {
            statusIndicator.className = 'status-indicator offline';
            statusIndicator.innerHTML = '<span class="status-dot"></span><span>Offline</span>';
        }
        
        // Online/Offline Events überwachen
        window.addEventListener('online', () => {
            statusIndicator.className = 'status-indicator';
            statusIndicator.innerHTML = '<span class="status-dot"></span><span>Online</span>';
        });
        
        window.addEventListener('offline', () => {
            statusIndicator.className = 'status-indicator offline';
            statusIndicator.innerHTML = '<span class="status-dot"></span><span>Offline</span>';
        });
    }
    
    // Tool-Links einrichten
    setupToolLinks() {
        // Theme-Toggle im Footer
        const themeTools = document.querySelectorAll('.quick-tool[onclick*="ThemeAPI"]');
        themeTools.forEach(tool => {
            tool.addEventListener('click', (e) => {
                e.preventDefault();
                if (window.ThemeAPI) {
                    window.ThemeAPI.toggle();
                } else if (window.toggleTheme) {
                    window.toggleTheme();
                } else {
                    console.warn('⚠️ Keine Theme-Funktion verfügbar');
                }
            });
        });
    }
    
    // Footer manuell neu laden (für dynamische Inhalte)
    reload() {
        const existingFooter = document.querySelector('.global-footer');
        if (existingFooter) {
            existingFooter.remove();
        }
        
        this.isLoaded = false;
        this.loadFooter();
        
        console.log('🔄 Footer neu geladen');
    }
    
    // Footer-Inhalte aktualisieren ohne Neustart
    updateFooterContent(updates) {
        if (!this.isLoaded) return;
        
        // Beispiel: Status-Text aktualisieren
        if (updates.status) {
            const statusIndicator = document.getElementById('system-status');
            if (statusIndicator) {
                statusIndicator.innerHTML = `<span class="status-dot"></span><span>${updates.status}</span>`;
            }
        }
        
        // Beispiel: Version aktualisieren
        if (updates.version) {
            const versionText = document.querySelector('.footer-bottom-left p:last-child');
            if (versionText) {
                versionText.innerHTML = `Made with ❤️ for Spacenations Players | Version ${updates.version}`;
            }
        }
        
        console.log('📝 Footer-Inhalte aktualisiert:', updates);
    }
}

// Globale Instanz erstellen (automatisch)
window.globalFooterLoader = new GlobalFooterLoader();

// Globale API für Footer-Management
window.FooterAPI = {
    // Footer neu laden
    reload: () => window.globalFooterLoader.reload(),
    
    // Footer-Inhalte aktualisieren
    update: (updates) => window.globalFooterLoader.updateFooterContent(updates),
    
    // Prüfen ob Footer geladen ist
    isLoaded: () => window.globalFooterLoader.isLoaded,
    
    // Footer manuell laden (falls benötigt)
    load: () => window.globalFooterLoader.loadFooter(),
    
    // Tool-Links aktualisieren
    updateToolLinks: () => {
        window.globalFooterLoader.updateToolLinksForLoggedInUser();
    },
    
    // Status ändern
    setStatus: (status, type = 'online') => {
        const statusIndicator = document.getElementById('system-status');
        if (statusIndicator) {
            statusIndicator.className = `status-indicator ${type}`;
            statusIndicator.innerHTML = `<span class="status-dot"></span><span>${status}</span>`;
        }
    }
};

console.log('🦶 Global Footer Loader bereit');
console.log('📋 API verfügbar: window.FooterAPI');
console.log('✨ Footer wird automatisch auf jeder Seite geladen!');
