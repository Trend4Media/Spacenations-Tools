/**
 * DASHBOARD PERMISSIONS MANAGER
 * Zentrale Verwaltung für Dashboard-Berechtigungen mit der neuen User-Struktur
 */

class DashboardPermissions {
    constructor() {
        this.currentUser = null;
        this.userData = null;
        this.init();
    }
    
    async init() {
        try {
            // Warte auf AuthAPI
            if (!window.AuthAPI) {
                await this.waitForAuthAPI();
            }
            
            await window.AuthAPI.waitForInit();
            
            // Auth State Changes überwachen
            window.AuthAPI.onAuthStateChange((user, userData) => {
                this.currentUser = user;
                this.userData = userData;
                this.updateDashboardAccess();
            });
            
            console.log('🔐 Dashboard Permissions Manager initialisiert');
            
        } catch (error) {
            console.error('❌ Dashboard Permissions Manager Initialisierung fehlgeschlagen:', error);
        }
    }
    
    async waitForAuthAPI() {
        return new Promise((resolve) => {
            const check = setInterval(() => {
                if (window.AuthAPI) {
                    clearInterval(check);
                    resolve();
                }
            }, 100);
            
            setTimeout(() => {
                clearInterval(check);
                resolve(); // Timeout nach 5 Sekunden
            }, 5000);
        });
    }
    
    /**
     * Prüft ob User Zugriff auf User-Dashboard hat
     */
    canAccessUserDashboard() {
        if (!this.currentUser) return false;
        
        // Jeder eingeloggte User kann auf User-Dashboard zugreifen
        return this.userData?.canAccessUserDashboard !== false;
    }
    
    /**
     * Prüft ob User Zugriff auf Allianz-Dashboard hat
     */
    canAccessAllianceDashboard() {
        if (!this.currentUser || !this.userData) return false;
        
        // Prüfe verschiedene Bedingungen
        return this.userData.canAccessAllianceDashboard || 
               this.userData.isAllianceMember || 
               this.userData.isAllianceAdmin || 
               this.userData.isAllianceModerator ||
               (this.userData.alliance && this.userData.alliance.status === 'member');
    }
    
    /**
     * Prüft ob User Zugriff auf Admin-Dashboard hat
     */
    canAccessAdminDashboard() {
        if (!this.currentUser || !this.userData) return false;
        
        // Prüfe Admin-Berechtigungen
        return this.userData.canAccessAdminDashboard || 
               this.userData.isSuperAdmin || 
               this.userData.isSystemAdmin ||
               this.userData.systemRole === 'superadmin' ||
               this.userData.systemRole === 'admin';
    }
    
    /**
     * Prüft ob User Spionage-Datenbank nutzen kann
     */
    canUseSpyDatabase() {
        if (!this.currentUser || !this.userData) return false;
        
        return this.userData.canUseSpyDatabase || 
               this.userData.isAllianceMember ||
               this.userData.permissions?.spy_database_read === true;
    }
    
    /**
     * Prüft ob User Tools nutzen kann
     */
    canUseTools() {
        if (!this.currentUser) return false;
        
        return {
            raidCounter: this.userData?.canUseRaidCounter !== false,
            battleCounter: this.userData?.canUseBattleCounter !== false,
            saboCounter: this.userData?.canUseSaboCounter !== false,
            spyDatabase: this.canUseSpyDatabase()
        };
    }
    
    /**
     * Gibt alle Berechtigungen des Users zurück
     */
    getAllPermissions() {
        if (!this.currentUser) {
            return {
                isLoggedIn: false,
                userDashboard: false,
                allianceDashboard: false,
                adminDashboard: false,
                tools: {
                    raidCounter: false,
                    battleCounter: false,
                    saboCounter: false,
                    spyDatabase: false
                }
            };
        }
        
        return {
            isLoggedIn: true,
            userDashboard: this.canAccessUserDashboard(),
            allianceDashboard: this.canAccessAllianceDashboard(),
            adminDashboard: this.canAccessAdminDashboard(),
            tools: this.canUseTools(),
            userData: this.userData
        };
    }
    
    /**
     * Aktualisiert Dashboard-Zugriff basierend auf aktuellen Berechtigungen
     */
    updateDashboardAccess() {
        const permissions = this.getAllPermissions();
        
        console.log('🔐 Dashboard-Berechtigungen aktualisiert:', permissions);
        
        // Dashboard-Links ein-/ausblenden
        this.updateDashboardLinks(permissions);
        
        // Tool-Links ein-/ausblenden
        this.updateToolLinks(permissions.tools);
        
        // User-Info aktualisieren
        this.updateUserInfo(permissions);
    }
    
    /**
     * Aktualisiert Dashboard-Links basierend auf Berechtigungen
     */
    updateDashboardLinks(permissions) {
        // User-Dashboard Link
        const userDashboardLinks = document.querySelectorAll('a[href*="user-dashboard"], .user-dashboard-link');
        userDashboardLinks.forEach(link => {
            if (permissions.userDashboard) {
                link.style.display = '';
                link.classList.remove('disabled');
            } else {
                link.style.display = 'none';
            }
        });
        
        // Allianz-Dashboard Link
        const allianceDashboardLinks = document.querySelectorAll('a[href*="alliance-dashboard"], .alliance-dashboard-link');
        allianceDashboardLinks.forEach(link => {
            if (permissions.allianceDashboard) {
                link.style.display = '';
                link.classList.remove('disabled');
            } else {
                link.style.display = 'none';
            }
        });
        
        // Admin-Dashboard Link
        const adminDashboardLinks = document.querySelectorAll('a[href*="admin-dashboard"], .admin-dashboard-link, #admin-dashboard-link');
        adminDashboardLinks.forEach(link => {
            if (permissions.adminDashboard) {
                link.style.display = '';
                link.classList.remove('disabled');
            } else {
                link.style.display = 'none';
            }
        });
    }
    
    /**
     * Aktualisiert Tool-Links basierend auf Berechtigungen
     */
    updateToolLinks(toolPermissions) {
        // Spionage-Datenbank
        const spyDatabaseLinks = document.querySelectorAll('a[href*="spy-database"], .spy-database-link');
        spyDatabaseLinks.forEach(link => {
            if (toolPermissions.spyDatabase) {
                link.style.display = '';
                link.classList.remove('disabled');
            } else {
                link.style.display = 'none';
            }
        });
        
        // Raid-Counter
        const raidCounterLinks = document.querySelectorAll('a[href*="raid-counter"], .raid-counter-link');
        raidCounterLinks.forEach(link => {
            if (toolPermissions.raidCounter) {
                link.style.display = '';
                link.classList.remove('disabled');
            } else {
                link.style.display = 'none';
            }
        });
        
        // Battle-Counter
        const battleCounterLinks = document.querySelectorAll('a[href*="battle-counter"], .battle-counter-link');
        battleCounterLinks.forEach(link => {
            if (toolPermissions.battleCounter) {
                link.style.display = '';
                link.classList.remove('disabled');
            } else {
                link.style.display = 'none';
            }
        });
        
        // Sabo-Counter
        const saboCounterLinks = document.querySelectorAll('a[href*="sabo-counter"], .sabo-counter-link');
        saboCounterLinks.forEach(link => {
            if (toolPermissions.saboCounter) {
                link.style.display = '';
                link.classList.remove('disabled');
            } else {
                link.style.display = 'none';
            }
        });
    }
    
    /**
     * Aktualisiert User-Informationen in der UI
     */
    updateUserInfo(permissions) {
        // Username anzeigen
        const usernameElements = document.querySelectorAll('.username, .user-name, #username, #user-name');
        usernameElements.forEach(el => {
            if (permissions.userData?.username) {
                el.textContent = permissions.userData.username;
            }
        });
        
        // E-Mail anzeigen
        const emailElements = document.querySelectorAll('.user-email, #user-email');
        emailElements.forEach(el => {
            if (this.currentUser?.email) {
                el.textContent = this.currentUser.email;
            }
        });
        
        // System-Role anzeigen
        const roleElements = document.querySelectorAll('.user-role, #user-role');
        roleElements.forEach(el => {
            if (permissions.userData?.systemRole) {
                el.textContent = permissions.userData.systemRole;
            }
        });
        
        // Allianz-Info anzeigen
        const allianceElements = document.querySelectorAll('.user-alliance, #user-alliance');
        allianceElements.forEach(el => {
            if (permissions.userData?.alliance?.name) {
                el.textContent = permissions.userData.alliance.name;
            } else {
                el.textContent = 'Keine Allianz';
            }
        });
    }
    
    /**
     * Prüft Zugriff auf aktuelle Seite und leitet um falls nötig
     */
    async checkPageAccess() {
        const currentPage = window.location.pathname.split('/').pop().split('.')[0];
        const permissions = this.getAllPermissions();
        
        console.log('🔐 Prüfe Seitenzugriff für:', currentPage, permissions);
        
        // Wenn nicht eingeloggt, zur Startseite
        if (!permissions.isLoggedIn) {
            console.log('❌ Nicht eingeloggt - Weiterleitung zur Startseite');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
            return false;
        }
        
        // Spezifische Seitenprüfungen
        switch (currentPage) {
            case 'user-dashboard':
                if (!permissions.userDashboard) {
                    console.log('❌ Kein User-Dashboard-Zugriff');
                    this.showAccessDenied('User-Dashboard');
                    return false;
                }
                break;
                
            case 'alliance-dashboard':
                if (!permissions.allianceDashboard) {
                    console.log('❌ Kein Allianz-Dashboard-Zugriff');
                    this.showAccessDenied('Allianz-Dashboard', 'Sie müssen Mitglied einer Allianz sein.');
                    return false;
                }
                break;
                
            case 'admin-dashboard':
                if (!permissions.adminDashboard) {
                    console.log('❌ Kein Admin-Dashboard-Zugriff');
                    this.showAccessDenied('Admin-Dashboard', 'Sie benötigen Administrator-Berechtigungen.');
                    return false;
                }
                break;
                
            case 'spy-database':
                if (!permissions.tools.spyDatabase) {
                    console.log('❌ Kein Spionage-Datenbank-Zugriff');
                    this.showAccessDenied('Spionage-Datenbank', 'Sie müssen Mitglied einer Allianz sein.');
                    return false;
                }
                break;
        }
        
        return true;
    }
    
    /**
     * Zeigt Zugriff-verweigert-Nachricht
     */
    showAccessDenied(pageName, reason = 'Sie haben keine Berechtigung für diese Seite.') {
        const message = `
            <div style="text-align: center; padding: 20px; background: rgba(255, 68, 68, 0.1); border: 1px solid #ff4444; border-radius: 8px; margin: 20px;">
                <h3>🚫 Zugriff verweigert</h3>
                <p><strong>${pageName}</strong> ist nicht verfügbar.</p>
                <p>${reason}</p>
                <br>
                <button onclick="window.location.href='user-dashboard.html'" style="background: var(--razer-green); color: black; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">
                    Zum User-Dashboard
                </button>
            </div>
        `;
        
        // Nachricht in Body einfügen
        const messageDiv = document.createElement('div');
        messageDiv.innerHTML = message;
        document.body.insertBefore(messageDiv, document.body.firstChild);
        
        // Nach 5 Sekunden zur Startseite weiterleiten
        setTimeout(() => {
            window.location.href = 'user-dashboard.html';
        }, 5000);
    }
}

// Globale Instanz erstellen
window.dashboardPermissions = new DashboardPermissions();

// Globale API
window.DashboardPermissionsAPI = {
    canAccessUserDashboard: () => window.dashboardPermissions.canAccessUserDashboard(),
    canAccessAllianceDashboard: () => window.dashboardPermissions.canAccessAllianceDashboard(),
    canAccessAdminDashboard: () => window.dashboardPermissions.canAccessAdminDashboard(),
    canUseSpyDatabase: () => window.dashboardPermissions.canUseSpyDatabase(),
    canUseTools: () => window.dashboardPermissions.canUseTools(),
    getAllPermissions: () => window.dashboardPermissions.getAllPermissions(),
    checkPageAccess: () => window.dashboardPermissions.checkPageAccess(),
    updateDashboardAccess: () => window.dashboardPermissions.updateDashboardAccess()
};

console.log('🔐 DashboardPermissionsAPI verfügbar: window.DashboardPermissionsAPI');