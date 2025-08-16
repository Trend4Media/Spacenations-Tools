/**
 * Dashboard Navigation Manager - Modulare Navigation für alle Dashboard-Seiten
 * Abhängigkeiten: firebase-config.js, auth-manager.js, theme-manager.js
 */

class DashboardNavigation {
    constructor() {
        this.currentPage = this.detectCurrentPage();
        this.currentUser = null;
        this.userData = null;
        this.breadcrumbs = [];
        this.notifications = [];
        
        // Navigation-Konfiguration
        this.navigationConfig = {
            'dashboard': {
                title: 'Dashboard',
                icon: '🏠',
                breadcrumb: 'Übersicht'
            },
            'dashboard-calculator': {
                title: 'AS-Counter',
                icon: '⚔️',
                breadcrumb: 'AS-Counter',
                parent: 'dashboard'
            },
            'dashboard-raid-counter': {
                title: 'Raid-Counter',
                icon: '🏴‍☠️',
                breadcrumb: 'Raid-Counter',
                parent: 'dashboard'
            },
            'dashboard-profile': {
                title: 'Profil',
                icon: '👤',
                breadcrumb: 'Mein Profil',
                parent: 'dashboard'
            },
            'dashboard-alliance': {
                title: 'Allianz',
                icon: '🛡️',
                breadcrumb: 'Allianz-Verwaltung',
                parent: 'dashboard'
            },
            'dashboard-statistics': {
                title: 'Statistiken',
                icon: '📊',
                breadcrumb: 'Detaillierte Statistiken',
                parent: 'dashboard'
            }
        };
        
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
                    this.renderNavigation();
                    this.updateUserInfo();
                } else {
                    // Nicht eingeloggt - Weiterleitung
                    window.location.href = 'index.html';
                }
            });
            
            console.log('🧭 Dashboard-Navigation initialisiert für:', this.currentPage);
            
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
    
    // Navigation rendern
    renderNavigation() {
        this.renderHeader();
        this.renderSidebar();
        this.renderFooter();
        this.setupEventListeners();
        this.updateBreadcrumbs();
        this.setActivePage();
    }
    
    // Header rendern
    renderHeader() {
        const headerHTML = `
            <div class="dashboard-header">
                <div class="header-content">
                    <div class="header-left">
                        <h1>${this.getPageIcon()} ${this.getPageTitle()}</h1>
                        <div class="header-subtitle">
                            <nav class="breadcrumbs" id="breadcrumbs">
                                <!-- Breadcrumbs werden hier eingefügt -->
                            </nav>
                        </div>
                    </div>
                    <div class="header-right">
                        <div class="notifications-container">
                            <button class="notification-btn" id="notification-btn" onclick="DashboardNav.toggleNotifications()">
                                🔔
                                <span class="notification-count" id="notification-count" style="display: none;">0</span>
                            </button>
                            <div class="notifications-dropdown" id="notifications-dropdown" style="display: none;">
                                <!-- Notifications werden hier eingefügt -->
                            </div>
                        </div>
                        <button class="theme-toggle" onclick="toggleTheme()">
                            <span id="theme-icon">🌙</span>
                            <span id="theme-text">Light</span>
                        </button>
                        <div class="user-dropdown">
                            <button class="user-dropdown-btn" id="user-dropdown-btn" onclick="DashboardNav.toggleUserDropdown()">
                                <div class="user-avatar-small" id="user-avatar-small">?</div>
                                <span id="user-name-header">User</span>
                                <span class="dropdown-arrow">▼</span>
                            </button>
                            <div class="user-dropdown-menu" id="user-dropdown-menu" style="display: none;">
                                <a href="dashboard.html" class="dropdown-item">
                                    🏠 Dashboard
                                </a>
                                <a href="#" class="dropdown-item" onclick="DashboardNav.openProfile()">
                                    👤 Profil
                                </a>
                                <a href="#" class="dropdown-item" onclick="DashboardNav.openSettings()">
                                    ⚙️ Einstellungen
                                </a>
                                <div class="dropdown-divider"></div>
                                <a href="#" class="dropdown-item logout-item" onclick="DashboardNav.logout()">
                                    🚪 Abmelden
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Header in DOM einfügen oder ersetzen
        let headerContainer = document.querySelector('.header, .dashboard-header');
        if (headerContainer) {
            headerContainer.outerHTML = headerHTML;
        } else {
            // Header am Anfang des Body einfügen
            document.body.insertAdjacentHTML('afterbegin', headerHTML);
        }
    }
    
    // Sidebar rendern
    renderSidebar() {
        const sidebarHTML = `
            <nav class="dashboard-sidebar">
                <div class="sidebar-section">
                    <h3 class="sidebar-title">🛠️ Hauptbereich</h3>
                    <ul class="sidebar-nav">
                        <li class="sidebar-item">
                            <a href="dashboard.html" class="sidebar-link" data-page="dashboard">
                                <span class="sidebar-icon">🏠</span>
                                <span class="sidebar-text">Dashboard</span>
                            </a>
                        </li>
                    </ul>
                </div>
                
                <div class="sidebar-section">
                    <h3 class="sidebar-title">⚔️ Battle Tools</h3>
                    <ul class="sidebar-nav">
                        <li class="sidebar-item">
                            <a href="dashboard-calculator.html" class="sidebar-link" data-page="dashboard-calculator">
                                <span class="sidebar-icon">⚔️</span>
                                <span class="sidebar-text">AS-Counter</span>
                                <span class="sidebar-badge new">💾</span>
                            </a>
                        </li>
                        <li class="sidebar-item">
                            <a href="#" class="sidebar-link coming-soon" onclick="DashboardNav.showComingSoon('Raid-Counter')">
                                <span class="sidebar-icon">🏴‍☠️</span>
                                <span class="sidebar-text">Raid-Counter</span>
                                <span class="sidebar-badge soon">Soon</span>
                            </a>
                        </li>
                        <li class="sidebar-item">
                            <a href="#" class="sidebar-link coming-soon" onclick="DashboardNav.showComingSoon('Battle Simulator')">
                                <span class="sidebar-icon">🎯</span>
                                <span class="sidebar-text">Battle Sim</span>
                                <span class="sidebar-badge premium">Pro</span>
                            </a>
                        </li>
                    </ul>
                </div>
                
                <div class="sidebar-section">
                    <h3 class="sidebar-title">📊 Analytics</h3>
                    <ul class="sidebar-nav">
                        <li class="sidebar-item">
                            <a href="#" class="sidebar-link coming-soon" onclick="DashboardNav.showComingSoon('Detaillierte Statistiken')">
                                <span class="sidebar-icon">📈</span>
                                <span class="sidebar-text">Statistiken</span>
                                <span class="sidebar-badge premium">Pro</span>
                            </a>
                        </li>
                        <li class="sidebar-item">
                            <a href="#" class="sidebar-link coming-soon" onclick="DashboardNav.showComingSoon('Kampf-Historie')">
                                <span class="sidebar-icon">📝</span>
                                <span class="sidebar-text">Kampf-Historie</span>
                            </a>
                        </li>
                    </ul>
                </div>
                
                <div class="sidebar-section">
                    <h3 class="sidebar-title">🛡️ Allianz</h3>
                    <ul class="sidebar-nav" id="alliance-nav">
                        <!-- Allianz-Navigation wird dynamisch eingefügt -->
                    </ul>
                </div>
                
                <div class="sidebar-section">
                    <h3 class="sidebar-title">🔧 Einstellungen</h3>
                    <ul class="sidebar-nav">
                        <li class="sidebar-item">
                            <a href="#" class="sidebar-link" onclick="DashboardNav.openProfile()">
                                <span class="sidebar-icon">👤</span>
                                <span class="sidebar-text">Mein Profil</span>
                            </a>
                        </li>
                        <li class="sidebar-item">
                            <a href="#" class="sidebar-link" onclick="DashboardNav.openSettings()">
                                <span class="sidebar-icon">⚙️</span>
                                <span class="sidebar-text">Einstellungen</span>
                            </a>
                        </li>
                    </ul>
                </div>
            </nav>
        `;
        
        // Sidebar in DOM einfügen oder ersetzen
        let sidebarContainer = document.querySelector('.nav, .dashboard-sidebar');
        if (sidebarContainer) {
            sidebarContainer.outerHTML = sidebarHTML;
        } else {
            // Sidebar nach Header einfügen
            const header = document.querySelector('.dashboard-header');
            if (header) {
                header.insertAdjacentHTML('afterend', sidebarHTML);
            }
        }
    }
    
    // Footer rendern
    renderFooter() {
        const footerHTML = `
            <footer class="dashboard-footer">
                <div class="footer-content">
                    <div class="footer-left">
                        <p>Spacenations Dashboard © 2025</p>
                        <p class="footer-subtitle">Dein persönlicher Bereich</p>
                    </div>
                    <div class="footer-right">
                        <div class="footer-stats" id="footer-stats">
                            <!-- Quick-Stats werden hier eingefügt -->
                        </div>
                    </div>
                </div>
            </footer>
        `;
        
        // Footer in DOM einfügen oder ersetzen
        let footerContainer = document.querySelector('.footer, .dashboard-footer');
        if (footerContainer) {
            footerContainer.outerHTML = footerHTML;
        } else {
            // Footer am Ende des Body einfügen
            document.body.insertAdjacentHTML('beforeend', footerHTML);
        }
    }
    
    // Event-Listener einrichten
    setupEventListeners() {
        // Sidebar-Links
        document.querySelectorAll('.sidebar-link').forEach(link => {
            link.addEventListener('click', (e) => {
                if (!link.classList.contains('coming-soon')) {
                    this.setActiveLink(link);
                }
            });
        });
        
        // Außerhalb von Dropdowns klicken
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.user-dropdown')) {
                this.closeUserDropdown();
            }
            if (!e.target.closest('.notifications-container')) {
                this.closeNotifications();
            }
        });
        
        // Keyboard-Navigation
        document.addEventListener('keydown', (e) => {
            // Strg+1-9 für Quick-Navigation
            if (e.ctrlKey && e.key >= '1' && e.key <= '9') {
                e.preventDefault();
                this.navigateByShortcut(parseInt(e.key));
            }
            
            // Esc für Dropdowns schließen
            if (e.key === 'Escape') {
                this.closeAllDropdowns();
            }
        });
    }
    
    // Aktuelle Seite markieren
    setActivePage() {
        const currentLink = document.querySelector(`[data-page="${this.currentPage}"]`);
        if (currentLink) {
            this.setActiveLink(currentLink);
        }
    }
    
    // Aktiven Link setzen
    setActiveLink(activeLink) {
        // Alle Links deaktivieren
        document.querySelectorAll('.sidebar-link').forEach(link => {
            link.classList.remove('active');
        });
        
        // Aktiven Link markieren
        activeLink.classList.add('active');
    }
    
    // Breadcrumbs aktualisieren
    updateBreadcrumbs() {
        const breadcrumbsContainer = document.getElementById('breadcrumbs');
        if (!breadcrumbsContainer) return;
        
        const config = this.navigationConfig[this.currentPage];
        if (!config) return;
        
        let breadcrumbsHTML = '<a href="dashboard.html" class="breadcrumb-link">Dashboard</a>';
        
        if (config.parent && config.parent !== 'dashboard') {
            const parentConfig = this.navigationConfig[config.parent];
            if (parentConfig) {
                breadcrumbsHTML += ` <span class="breadcrumb-separator">></span> <span class="breadcrumb-item">${parentConfig.breadcrumb}</span>`;
            }
        }
        
        if (this.currentPage !== 'dashboard') {
            breadcrumbsHTML += ` <span class="breadcrumb-separator">></span> <span class="breadcrumb-current">${config.breadcrumb}</span>`;
        }
        
        breadcrumbsContainer.innerHTML = breadcrumbsHTML;
    }
    
    // User-Info aktualisieren
    updateUserInfo() {
        if (!this.userData) return;
        
        const displayName = this.userData.username || this.userData.email || 'User';
        const firstLetter = displayName.charAt(0).toUpperCase();
        
        // Header User-Info
        const userNameHeader = document.getElementById('user-name-header');
        const userAvatarSmall = document.getElementById('user-avatar-small');
        
        if (userNameHeader) userNameHeader.textContent = displayName;
        if (userAvatarSmall) userAvatarSmall.textContent = firstLetter;
        
        // Allianz-Navigation aktualisieren
        this.updateAllianceNavigation();
        
        // Footer-Stats aktualisieren
        this.updateFooterStats();
    }
    
    // Allianz-Navigation aktualisieren
    updateAllianceNavigation() {
        const allianceNav = document.getElementById('alliance-nav');
        if (!allianceNav) return;
        
        if (this.userData?.alliance) {
            allianceNav.innerHTML = `
                <li class="sidebar-item">
                    <a href="#" class="sidebar-link" onclick="DashboardNav.openAlliance()">
                        <span class="sidebar-icon">🛡️</span>
                        <span class="sidebar-text">${this.userData.alliance}</span>
                        ${this.userData.isAllianceAdmin ? '<span class="sidebar-badge admin">Admin</span>' : ''}
                    </a>
                </li>
                <li class="sidebar-item">
                    <a href="#" class="sidebar-link coming-soon" onclick="DashboardNav.showComingSoon('Allianz-Chat')">
                        <span class="sidebar-icon">💬</span>
                        <span class="sidebar-text">Allianz-Chat</span>
                        <span class="sidebar-badge soon">Soon</span>
                    </a>
                </li>
                <li class="sidebar-item">
                    <a href="#" class="sidebar-link coming-soon" onclick="DashboardNav.showComingSoon('Allianz-Statistiken')">
                        <span class="sidebar-icon">📊</span>
                        <span class="sidebar-text">Allianz-Stats</span>
                        <span class="sidebar-badge premium">Pro</span>
                    </a>
                </li>
            `;
        } else {
            allianceNav.innerHTML = `
                <li class="sidebar-item">
                    <a href="#" class="sidebar-link" onclick="DashboardNav.joinAlliance()">
                        <span class="sidebar-icon">➕</span>
                        <span class="sidebar-text">Allianz beitreten</span>
                    </a>
                </li>
            `;
        }
    }
    
    // Footer-Stats aktualisieren
    updateFooterStats() {
        const footerStats = document.getElementById('footer-stats');
        if (!footerStats) return;
        
        // Stats aus Calculator-API holen falls verfügbar
        if (window.CalculatorAPI && window.CalculatorAPI.isLoggedIn()) {
            const stats = window.CalculatorAPI.getStats();
            footerStats.innerHTML = `
                <span class="footer-stat">⚔️ ${stats.totalBattles || 0}</span>
                <span class="footer-stat">🏆 ${stats.winRate || 0}%</span>
                <span class="footer-stat">💥 ${(stats.totalDamageDealt || 0).toLocaleString()}</span>
            `;
        } else {
            footerStats.innerHTML = `
                <span class="footer-stat">🎮 Online</span>
                <span class="footer-stat">📊 Dashboard</span>
            `;
        }
    }
    
    // Hilfs-Methoden
    getPageTitle() {
        const config = this.navigationConfig[this.currentPage];
        return config ? config.title : 'Dashboard';
    }
    
    getPageIcon() {
        const config = this.navigationConfig[this.currentPage];
        return config ? config.icon : '🏠';
    }
    
    // Dropdown-Management
    toggleUserDropdown() {
        const dropdown = document.getElementById('user-dropdown-menu');
        if (dropdown) {
            dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
        }
    }
    
    closeUserDropdown() {
        const dropdown = document.getElementById('user-dropdown-menu');
        if (dropdown) {
            dropdown.style.display = 'none';
        }
    }
    
    toggleNotifications() {
        const dropdown = document.getElementById('notifications-dropdown');
        if (dropdown) {
            dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
            this.loadNotifications();
        }
    }
    
    closeNotifications() {
        const dropdown = document.getElementById('notifications-dropdown');
        if (dropdown) {
            dropdown.style.display = 'none';
        }
    }
    
    closeAllDropdowns() {
        this.closeUserDropdown();
        this.closeNotifications();
    }
    
    // Navigation-Funktionen
    navigateByShortcut(number) {
        const links = document.querySelectorAll('.sidebar-link:not(.coming-soon)');
        if (links[number - 1]) {
            links[number - 1].click();
        }
    }
    
    // Action-Funktionen
    async logout() {
        if (confirm('Möchten Sie sich wirklich abmelden?')) {
            const result = await window.AuthAPI.logout();
            if (result.success) {
                sessionStorage.setItem('logoutSuccess', 'true');
                window.location.href = 'index.html';
            } else {
                this.showNotification('Fehler beim Abmelden', 'error');
            }
        }
    }
    
    openProfile() {
        this.showComingSoon('Profil-Verwaltung');
    }
    
    openSettings() {
        this.showComingSoon('Einstellungen');
    }
    
    openAlliance() {
        this.showComingSoon('Allianz-Verwaltung');
    }
    
    joinAlliance() {
        this.showComingSoon('Allianz beitreten');
    }
    
    showComingSoon(featureName) {
        alert(`🚀 ${featureName}\n\nDieses Feature ist noch in Entwicklung!\n\n⭐ Wird in einer zukünftigen Version verfügbar sein.`);
    }
    
    // Notifications-System
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
                badge.style.display = 'block';
            } else {
                badge.style.display = 'none';
            }
        }
    }
    
    loadNotifications() {
        const dropdown = document.getElementById('notifications-dropdown');
        if (!dropdown) return;
        
        if (this.notifications.length === 0) {
            dropdown.innerHTML = '<div class="notification-empty">Keine neuen Benachrichtigungen</div>';
            return;
        }
        
        let notificationsHTML = '';
        this.notifications.slice(0, 5).forEach(notification => {
            const timeAgo = this.getTimeAgo(notification.timestamp);
            notificationsHTML += `
                <div class="notification-item ${notification.type}">
                    <div class="notification-content">${notification.message}</div>
                    <div class="notification-time">${timeAgo}</div>
                </div>
            `;
        });
        
        dropdown.innerHTML = notificationsHTML;
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
    
    // Public API
    setActiveItem(page) {
        const link = document.querySelector(`[data-page="${page}"]`);
        if (link) {
            this.setActiveLink(link);
        }
    }
    
    addBreadcrumb(text, url = null) {
        this.breadcrumbs.push({ text, url });
        this.updateBreadcrumbs();
    }
    
    updateUserStats(stats) {
        // Footer-Stats mit neuen Werten aktualisieren
        this.updateFooterStats();
    }
}

// Globale Instanz erstellen
window.dashboardNavigation = new DashboardNavigation();

// Globale API
window.DashboardNav = {
    setActiveItem: (page) => window.dashboardNavigation.setActiveItem(page),
    addBreadcrumb: (text, url) => window.dashboardNavigation.addBreadcrumb(text, url),
    showNotification: (message, type, duration) => window.dashboardNavigation.showNotification(message, type, duration),
    updateUserStats: (stats) => window.dashboardNavigation.updateUserStats(stats),
    toggleUserDropdown: () => window.dashboardNavigation.toggleUserDropdown(),
    toggleNotifications: () => window.dashboardNavigation.toggleNotifications(),
    logout: () => window.dashboardNavigation.logout(),
    openProfile: () => window.dashboardNavigation.openProfile(),
    openSettings: () => window.dashboardNavigation.openSettings(),
    openAlliance: () => window.dashboardNavigation.openAlliance(),
    joinAlliance: () => window.dashboardNavigation.joinAlliance(),
    showComingSoon: (feature) => window.dashboardNavigation.showComingSoon(feature)
};

console.log('🧭 Dashboard-Navigation geladen');
console.log('💡 Shortcuts: Strg+1-9 (Quick-Navigation), Esc (Dropdowns schließen)');
