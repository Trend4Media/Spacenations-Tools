/**
 * Kompatible Dashboard Navigation - Erweitert bestehende Navigation ohne Design zu überschreiben
 * Funktioniert mit Ihrem bestehenden Dashboard-Design
 */

class CompatibleDashboardNavigation {
    constructor() {
        this.currentPage = this.detectCurrentPage();
        this.currentUser = null;
        this.userData = null;
        this.notifications = [];
        
        this.init();
    }
    
    async init() {
        try {
            // Warten bis Auth-Manager bereit ist
            await window.AuthAPI.waitForInit();
            
            // User-Daten überwachen
            window.AuthAPI.onAuthStateChange((user, userData) => {
                this.currentUser = user;
                this.userData = userData;
                
                if (user) {
                    this.enhanceExistingNavigation();
                    this.updateUserInfo();
                    this.setupNavigationFeatures();
                }
            });
            
            console.log('🧭 Kompatible Dashboard-Navigation initialisiert für:', this.currentPage);
            
        } catch (error) {
            console.error('❌ Dashboard-Navigation Initialisierung fehlgeschlagen:', error);
        }
    }
    
    // Aktuelle Seite erkennen
    detectCurrentPage() {
        const path = window.location.pathname;
        const filename = path.split('/').pop().split('.')[0] || 'dashboard';
        return filename;
    }
    
    // Bestehende Navigation erweitern (ohne zu überschreiben)
    enhanceExistingNavigation() {
        this.addBreadcrumbsToHeader();
        this.enhanceUserDropdown();
        this.addNotificationSystem();
        this.updateNavigationLinks();
        this.setupKeyboardNavigation();
    }
    
    // Breadcrumbs zum bestehenden Header hinzufügen
    addBreadcrumbsToHeader() {
        const headerSubtitle = document.querySelector('.header-subtitle');
        if (headerSubtitle && !document.getElementById('enhanced-breadcrumbs')) {
            const breadcrumbHTML = `
                <div id="enhanced-breadcrumbs" style="
                    margin-top: 8px;
                    font-size: 0.9rem;
                    color: var(--text-secondary);
                ">
                    <a href="dashboard.html" style="color: var(--accent-secondary); text-decoration: none;">Dashboard</a>
                    ${this.currentPage !== 'dashboard' ? `
                        <span style="margin: 0 8px;">></span>
                        <span style="color: var(--text-primary); font-weight: 600;">${this.getPageTitle()}</span>
                    ` : ''}
                </div>
            `;
            headerSubtitle.insertAdjacentHTML('afterend', breadcrumbHTML);
        }
    }
    
    // User-Dropdown erweitern
    enhanceUserDropdown() {
        const userInfo = document.getElementById('user-info');
        if (userInfo && !document.getElementById('enhanced-user-dropdown')) {
            const dropdownHTML = `
                <div id="enhanced-user-dropdown" style="margin-top: 10px;">
                    <details style="
                        background: var(--card-bg);
                        border: 2px solid var(--card-border);
                        border-radius: 8px;
                        padding: 8px;
                        cursor: pointer;
                    ">
                        <summary style="
                            list-style: none;
                            display: flex;
                            align-items: center;
                            justify-content: space-between;
                            font-weight: 600;
                            color: var(--text-primary);
                        ">
                            Quick Actions
                            <span style="font-size: 0.8rem;">▼</span>
                        </summary>
                        <div style="margin-top: 10px; border-top: 1px solid var(--card-border); padding-top: 10px;">
                            <a href="dashboard-calculator.html" style="
                                display: block;
                                padding: 8px;
                                color: var(--text-primary);
                                text-decoration: none;
                                border-radius: 6px;
                                margin-bottom: 4px;
                                transition: all 0.3s ease;
                                font-size: 0.9rem;
                            " onmouseover="this.style.background='var(--card-bg)'" onmouseout="this.style.background='transparent'">
                                ⚔️ AS-Counter (Dashboard)
                            </a>
                            <a href="#" onclick="DashboardNav.showComingSoon('Profil-Manager')" style="
                                display: block;
                                padding: 8px;
                                color: var(--text-primary);
                                text-decoration: none;
                                border-radius: 6px;
                                margin-bottom: 4px;
                                transition: all 0.3s ease;
                                font-size: 0.9rem;
                            " onmouseover="this.style.background='var(--card-bg)'" onmouseout="this.style.background='transparent'">
                                👤 Profil bearbeiten
                            </a>
                            <a href="#" onclick="DashboardNav.showComingSoon('Einstellungen')" style="
                                display: block;
                                padding: 8px;
                                color: var(--text-primary);
                                text-decoration: none;
                                border-radius: 6px;
                                transition: all 0.3s ease;
                                font-size: 0.9rem;
                            " onmouseover="this.style.background='var(--card-bg)'" onmouseout="this.style.background='transparent'">
                                ⚙️ Einstellungen
                            </a>
                        </div>
                    </details>
                </div>
            `;
            userInfo.insertAdjacentHTML('beforeend', dropdownHTML);
        }
    }
    
    // Notification-System hinzufügen
    addNotificationSystem() {
        const headerRight = document.querySelector('.header-right');
        if (headerRight && !document.getElementById('notification-center')) {
            const notificationHTML = `
                <div id="notification-center" style="position: relative; margin-left: 10px;">
                    <button id="notification-btn" style="
                        background: var(--card-bg);
                        border: 2px solid var(--card-border);
                        border-radius: 50%;
                        width: 40px;
                        height: 40px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        font-size: 1.1rem;
                        position: relative;
                    " onmouseover="this.style.borderColor='var(--accent-secondary)'" onmouseout="this.style.borderColor='var(--card-border)'">
                        🔔
                        <span id="notification-count" style="
                            position: absolute;
                            top: -5px;
                            right: -5px;
                            background: var(--error-color);
                            color: white;
                            border-radius: 50%;
                            width: 18px;
                            height: 18px;
                            display: none;
                            align-items: center;
                            justify-content: center;
                            font-size: 0.7rem;
                            font-weight: 600;
                        "></span>
                    </button>
                    <div id="notification-dropdown" style="
                        position: absolute;
                        top: 100%;
                        right: 0;
                        background: var(--bg-panel);
                        border: 2px solid var(--border-primary);
                        border-radius: 10px;
                        padding: 16px;
                        min-width: 280px;
                        max-height: 300px;
                        overflow-y: auto;
                        box-shadow: 0 10px 30px var(--border-shadow);
                        backdrop-filter: blur(10px);
                        z-index: 1000;
                        margin-top: 5px;
                        display: none;
                    ">
                        <div style="text-align: center; color: var(--text-secondary); padding: 20px; font-style: italic;">
                            Keine neuen Benachrichtigungen
                        </div>
                    </div>
                </div>
            `;
            
            // Vor dem Theme-Toggle einfügen
            const themeToggle = headerRight.querySelector('.theme-toggle');
            if (themeToggle) {
                themeToggle.insertAdjacentHTML('beforebegin', notificationHTML);
            } else {
                headerRight.insertAdjacentHTML('beforeend', notificationHTML);
            }
            
            // Event-Listener für Notification-Button
            document.getElementById('notification-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleNotifications();
            });
            
            // Außerhalb klicken um Dropdown zu schließen
            document.addEventListener('click', () => {
                this.closeNotifications();
            });
        }
    }
    
    // Navigation-Links aktualisieren
    updateNavigationLinks() {
        // AS-Counter Links für eingeloggte User aktualisieren
        const asCounterLinks = document.querySelectorAll('a[href="calculator.html"]');
        asCounterLinks.forEach(link => {
            if (this.currentUser) {
                link.href = 'dashboard-calculator.html';
                
                // Icon aktualisieren um zu zeigen dass Daten gespeichert werden
                const icon = link.querySelector('.nav-icon, .action-icon');
                if (icon && !icon.textContent.includes('💾')) {
                    icon.textContent = '⚔️💾';
                }
                
                // Titel aktualisieren
                link.title = 'AS-Counter (Dashboard) - Alle Kämpfe werden automatisch gespeichert';
                
                // Text aktualisieren falls vorhanden
                const textElement = link.querySelector('.nav-text, .action-title');
                if (textElement && !textElement.textContent.includes('Dashboard')) {
                    textElement.textContent = 'AS-Counter (Dashboard)';
                }
            }
        });
        
        // Aktuelle Seite markieren
        this.markActivePage();
    }
    
    // Aktuelle Seite in Navigation markieren
    markActivePage() {
        // Alle Nav-Links zurücksetzen
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active-page');
        });
        
        // Aktuellen Link markieren
        const currentLinks = document.querySelectorAll(`a[href="${this.currentPage}.html"], a[href*="${this.currentPage}"]`);
        currentLinks.forEach(link => {
            link.classList.add('active-page');
            link.style.background = 'linear-gradient(135deg, var(--accent-secondary), #3a5998)';
            link.style.color = 'white';
            link.style.fontWeight = '600';
        });
    }
    
    // Keyboard-Navigation einrichten
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Strg+1-5 für Quick-Navigation
            if (e.ctrlKey && e.key >= '1' && e.key <= '5') {
                e.preventDefault();
                this.navigateByShortcut(parseInt(e.key));
            }
            
            // Alt+N für Notifications
            if (e.altKey && e.key === 'n') {
                e.preventDefault();
                this.toggleNotifications();
            }
            
            // Esc für Dropdowns schließen
            if (e.key === 'Escape') {
                this.closeAllDropdowns();
            }
        });
    }
    
    // Navigation per Shortcut
    navigateByShortcut(number) {
        const shortcuts = {
            1: 'dashboard.html',
            2: 'dashboard-calculator.html',
            3: '#', // Raid-Counter (Coming Soon)
            4: '#', // Profil (Coming Soon)
            5: '#'  // Einstellungen (Coming Soon)
        };
        
        const url = shortcuts[number];
        if (url && url !== '#') {
            window.location.href = url;
        } else {
            this.showComingSoon('Feature');
        }
    }
    
    // User-Info aktualisieren
    updateUserInfo() {
        if (!this.userData) return;
        
        const displayName = this.userData.username || this.userData.email || 'User';
        
        // Header-Username aktualisieren falls vorhanden
        const headerUsername = document.getElementById('header-username');
        if (headerUsername) {
            headerUsername.textContent = displayName;
        }
        
        // Allianz-Badge hinzufügen falls nicht vorhanden
        this.addAllianceBadge();
        
        // Stats im Footer aktualisieren
        this.updateFooterStats();
    }
    
    // Allianz-Badge hinzufügen
    addAllianceBadge() {
        if (!this.userData?.alliance) return;
        
        const userBadges = document.getElementById('user-badges');
        if (userBadges) {
            const allianceBadge = `<span class="badge" style="
                background: linear-gradient(135deg, #8b5cf6, #7c3aed);
                color: white;
                padding: 4px 10px;
                border-radius: 12px;
                font-size: 0.75rem;
                font-weight: 600;
                margin-left: 8px;
            ">${this.userData.alliance}</span>`;
            
            if (!userBadges.innerHTML.includes(this.userData.alliance)) {
                userBadges.insertAdjacentHTML('beforeend', allianceBadge);
            }
        }
    }
    
    // Footer-Stats aktualisieren
    updateFooterStats() {
        const footer = document.querySelector('.footer');
        if (footer && !document.getElementById('enhanced-footer-stats')) {
            let statsText = '🎮 Online';
            
            // Calculator-Stats falls verfügbar
            if (window.CalculatorAPI && window.CalculatorAPI.isLoggedIn()) {
                const stats = window.CalculatorAPI.getStats();
                statsText = `⚔️ ${stats.totalBattles || 0} Kämpfe | 🏆 ${stats.winRate || 0}% Siegesrate`;
            }
            
            const enhancedFooter = `
                <div id="enhanced-footer-stats" style="
                    margin-top: 10px;
                    text-align: center;
                    font-size: 0.8rem;
                    color: var(--text-secondary);
                    padding: 8px;
                    background: var(--card-bg);
                    border-radius: 8px;
                    border: 1px solid var(--card-border);
                ">
                    ${statsText}
                </div>
            `;
            
            footer.insertAdjacentHTML('beforeend', enhancedFooter);
        }
    }
    
    // Notifications-Management
    toggleNotifications() {
        const dropdown = document.getElementById('notification-dropdown');
        if (dropdown) {
            const isVisible = dropdown.style.display !== 'none';
            dropdown.style.display = isVisible ? 'none' : 'block';
            
            if (!isVisible) {
                this.loadNotifications();
            }
        }
    }
    
    closeNotifications() {
        const dropdown = document.getElementById('notification-dropdown');
        if (dropdown) {
            dropdown.style.display = 'none';
        }
    }
    
    closeAllDropdowns() {
        this.closeNotifications();
    }
    
    loadNotifications() {
        const dropdown = document.getElementById('notification-dropdown');
        if (!dropdown) return;
        
        if (this.notifications.length === 0) {
            dropdown.innerHTML = '<div style="text-align: center; color: var(--text-secondary); padding: 20px; font-style: italic;">Keine neuen Benachrichtigungen</div>';
            return;
        }
        
        let notificationsHTML = '';
        this.notifications.slice(0, 5).forEach(notification => {
            const timeAgo = this.getTimeAgo(notification.timestamp);
            const bgColor = notification.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 
                           notification.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 
                           'rgba(74, 144, 226, 0.1)';
            
            notificationsHTML += `
                <div style="
                    padding: 12px;
                    border-radius: 8px;
                    margin-bottom: 8px;
                    background: ${bgColor};
                    border-left: 4px solid var(--accent-secondary);
                ">
                    <div style="color: var(--text-primary); font-size: 0.9rem; margin-bottom: 4px;">
                        ${notification.message}
                    </div>
                    <div style="color: var(--text-secondary); font-size: 0.8rem;">
                        ${timeAgo}
                    </div>
                </div>
            `;
        });
        
        dropdown.innerHTML = notificationsHTML;
    }
    
    // Hilfsfunktionen
    getPageTitle() {
        const titles = {
            'dashboard': 'Dashboard',
            'dashboard-calculator': 'AS-Counter',
            'dashboard-raid-counter': 'Raid-Counter',
            'dashboard-profile': 'Profil'
        };
        return titles[this.currentPage] || 'Dashboard';
    }
    
    getTimeAgo(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        
        if (diffMins < 1) return 'Gerade eben';
        if (diffMins < 60) return `vor ${diffMins} Min`;
        
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `vor ${diffHours} Std`;
        
        const diffDays = Math.floor(diffHours / 24);
        return `vor ${diffDays} Tag${diffDays === 1 ? '' : 'en'}`;
    }
    
    // Public API-Funktionen
    showNotification(message, type = 'info', duration = 5000) {
        const notification = {
            id: Date.now(),
            message,
            type,
            timestamp: new Date()
        };
        
        this.notifications.unshift(notification);
        this.updateNotificationBadge();
        
        // Auto-remove nach duration
        setTimeout(() => {
            this.removeNotification(notification.id);
        }, duration);
        
        console.log('📢 Notification:', message);
    }
    
    removeNotification(id) {
        this.notifications = this.notifications.filter(n => n.id !== id);
        this.updateNotificationBadge();
    }
    
    updateNotificationBadge() {
        const badge = document.getElementById('notification-count');
        if (badge) {
            const count = this.notifications.length;
            if (count > 0) {
                badge.textContent = count;
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        }
    }
    
    updateUserStats(stats) {
        this.updateFooterStats();
    }
    
    showComingSoon(featureName) {
        alert(`🚀 ${featureName}\n\nDieses Feature ist noch in Entwicklung!\n\n⭐ Wird in einer zukünftigen Version verfügbar sein.`);
    }
}

// Globale Instanz erstellen
window.compatibleDashboardNavigation = new CompatibleDashboardNavigation();

// Globale API (kompatibel mit bestehenden Aufrufen)
window.DashboardNav = {
    showNotification: (message, type, duration) => window.compatibleDashboardNavigation.showNotification(message, type, duration),
    updateUserStats: (stats) => window.compatibleDashboardNavigation.updateUserStats(stats),
    showComingSoon: (feature) => window.compatibleDashboardNavigation.showComingSoon(feature)
};

console.log('🧭 Kompatible Dashboard-Navigation geladen');
console.log('💡 Shortcuts: Strg+1-5 (Navigation), Alt+N (Notifications), Esc (Close)');
