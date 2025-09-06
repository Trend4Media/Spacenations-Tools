/**
 * ERWEITERTE firebase-sync.js - Ersetzen Sie Ihre bestehende firebase-sync.js mit dieser Version
 * Hinzugefügte Features: Dashboard-Logout, Bessere Navigation, Session-Management
 */

class FirebaseSync {
    constructor() {
        this.currentPage = this.detectCurrentPage();
        this.redirectRules = {
            'index': { requiresAuth: false, redirectTo: 'dashboard.html' },
            'dashboard': { requiresAuth: true, redirectTo: 'index.html' },
            'register': { requiresAuth: false, redirectTo: 'dashboard.html' },
            'spy-database': { requiresAuth: true, redirectTo: 'index.html' },
            'spy-report': { requiresAuth: true, redirectTo: 'index.html' },
            'admin-login': { requiresAuth: false, adminLogin: true },
            'admin-dashboard': { requiresAuth: true, requiresSuperAdmin: true, redirectTo: 'admin-login.html' }
        };
        
        this.init();
    }
    
    async init() {
        try {
            await window.AuthAPI.waitForInit();
            
            console.log('🔄 FirebaseSync initialisiert für Seite:', this.currentPage);
            
            // Auth State Changes überwachen
            window.AuthAPI.onAuthStateChange((user, userData) => {
                this.handleAuthStateChange(user, userData);
            });
            
            // Logout-Success Message prüfen (von anderen Seiten)
            this.checkLogoutSuccessMessage();
            
        } catch (error) {
            console.error('❌ FirebaseSync-Initialisierung fehlgeschlagen:', error);
        }
    }
    
    detectCurrentPage() {
        const path = window.location.pathname;
        const filename = path.split('/').pop().split('.')[0] || 'index';
        
        console.log('📄 Aktuelle Seite erkannt:', filename);
        return filename;
    }
    
    handleAuthStateChange(user, userData) {
        const isLoggedIn = !!user;
        const pageConfig = this.redirectRules[this.currentPage];
        
        if (!pageConfig) {
            console.log('ℹ️ Keine Redirect-Regel für Seite:', this.currentPage);
            return;
        }
        
        console.log('🔄 Auth State für', this.currentPage, ':', isLoggedIn ? 'Eingeloggt' : 'Ausgeloggt');
        
        // Redirect-Logik (allgemein)
        if (pageConfig.requiresAuth && !isLoggedIn) {
            // Dashboard braucht Auth, aber User ist nicht eingeloggt
            console.log('🚫 Zugriff verweigert - Weiterleitung zu:', pageConfig.redirectTo);
            this.redirectAfterDelay(pageConfig.redirectTo, 1000);
            
        } else if (!pageConfig.requiresAuth && isLoggedIn) {
            // Index/Register braucht keine Auth, aber User ist eingeloggt
            if (this.currentPage === 'index') {
                console.log('✅ User eingeloggt - Weiterleitung zu Dashboard');
                this.showWelcomeMessage(userData);
                this.redirectAfterDelay(pageConfig.redirectTo, 2500);
            }
        }

        // Admin-spezifische Logik
        if (this.currentPage === 'admin-login') {
            if (isLoggedIn && userData?.isSuperAdmin === true) {
                console.log('🛡️ Super-Admin eingeloggt - Weiterleitung zum Admin-Dashboard');
                this.redirectAfterDelay('admin-dashboard.html', 800);
            }
        }

        if (this.currentPage === 'admin-dashboard') {
            if (!isLoggedIn) return; // oben bereits handled
            if (pageConfig.requiresSuperAdmin && userData?.isSuperAdmin !== true) {
                console.log('🚫 Kein Super-Admin - Weiterleitung zum Admin-Login');
                this.redirectAfterDelay('admin-login.html', 1000);
                return;
            }
        }
        
        // UI für aktuellen Auth-Status aktualisieren
        this.updateUIForAuthState(isLoggedIn, userData);
        
        // Dashboard-spezifische Funktionen
        if (this.currentPage === 'dashboard' && isLoggedIn) {
            this.setupDashboardFeatures(userData);
        }
    }
    
    // Dashboard-spezifische Features einrichten
    setupDashboardFeatures(userData) {
        console.log('🏠 Dashboard-Features werden eingerichtet');
        
        // Logout-Buttons konfigurieren
        this.setupDashboardLogout();
        
        // Willkommens-Header aktualisieren
        this.updateDashboardHeader(userData);
        
        // Navigation-Events einrichten
        this.setupDashboardNavigation();
    }
    
    // Dashboard-Logout konfigurieren
    setupDashboardLogout() {
        // Alle Logout-Buttons finden
        const logoutButtons = document.querySelectorAll('.logout-btn, [onclick*="handleLogout"], [onclick*="logout"]');
        
        logoutButtons.forEach(button => {
            // Alte Event-Handler entfernen
            button.removeAttribute('onclick');
            
            // Neuen Event-Handler hinzufügen
            button.addEventListener('click', async (e) => {
                e.preventDefault();
                await this.handleDashboardLogout();
            });
        });
        
        console.log('🚪 Dashboard-Logout Buttons konfiguriert:', logoutButtons.length);
    }
    
    // Dashboard-Logout Handler
    async handleDashboardLogout() {
        try {
            console.log('🚪 Dashboard-Logout gestartet');
            
            // Bestätigung (optional)
            const confirmed = confirm('Möchten Sie sich abmelden und zur Startseite zurückkehren?');
            if (!confirmed) return;
            
            // Loading-Overlay anzeigen
            this.showLogoutLoadingOverlay();
            
            // Logout über AuthManager
            const result = await window.AuthAPI.logout();
            
            if (result.success) {
                console.log('✅ Dashboard-Logout erfolgreich');
                
                // Erfolgsmeldung für Index-Seite setzen
                sessionStorage.setItem('logoutSuccess', 'true');
                
                // Weiterleitung zur Startseite
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
                
            } else {
                console.error('❌ Dashboard-Logout fehlgeschlagen:', result.error);
                this.hideLogoutLoadingOverlay();
                alert('Fehler beim Abmelden: ' + result.error);
            }
            
        } catch (error) {
            console.error('❌ Dashboard-Logout Fehler:', error);
            this.hideLogoutLoadingOverlay();
            alert('Unerwarteter Fehler beim Abmelden');
        }
    }
    
    // Logout Loading-Overlay anzeigen
    showLogoutLoadingOverlay() {
        const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay) {
            const titleElement = loadingOverlay.querySelector('h3');
            const textElement = loadingOverlay.querySelector('p');
            
            if (titleElement) titleElement.textContent = 'Abmeldung...';
            if (textElement) textElement.textContent = 'Sie werden zur Startseite weitergeleitet';
            
            loadingOverlay.style.display = 'flex';
        }
    }
    
    // Logout Loading-Overlay verstecken
    hideLogoutLoadingOverlay() {
        const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }
    }
    
    // Dashboard-Header aktualisieren
    updateDashboardHeader(userData) {
        const headerUsername = document.getElementById('header-username');
        if (headerUsername && userData?.username) {
            headerUsername.textContent = userData.username;
        }
    }
    
    // Dashboard-Navigation einrichten
    setupDashboardNavigation() {
        // Startseite-Button hinzufügen falls nicht vorhanden
        const backBtn = document.querySelector('.back-btn');
        if (backBtn) {
            backBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (confirm('Möchten Sie zur Startseite zurückkehren? (Sie bleiben eingeloggt)')) {
                    window.location.href = 'index.html';
                }
            });
        }
    }
    
    // Logout-Success Message prüfen
    checkLogoutSuccessMessage() {
        if (this.currentPage === 'index' && sessionStorage.getItem('logoutSuccess')) {
            // Erfolgsmeldung anzeigen
            setTimeout(() => {
                if (typeof showLoginSuccess === 'function') {
                    showLoginSuccess('Sie wurden erfolgreich abgemeldet.');
                }
                
                // Message nach 5 Sekunden verstecken
                setTimeout(() => {
                    if (typeof hideLoginMessages === 'function') {
                        hideLoginMessages();
                    }
                }, 5000);
            }, 500);
            
            // Flag entfernen
            sessionStorage.removeItem('logoutSuccess');
        }
    }
    
    showWelcomeMessage(userData) {
        const displayName = userData?.username || 'User';
        
        if (typeof showLoginSuccess === 'function') {
            showLoginSuccess(`Willkommen zurück, ${displayName}! Weiterleitung zum Dashboard...`);
        }
        
        if (typeof showLoadingOverlay === 'function') {
            setTimeout(() => showLoadingOverlay(), 1500);
        }
    }
    
    updateUIForAuthState(isLoggedIn, userData) {
        if (isLoggedIn && userData) {
            this.updateUIForLoggedInUser(userData);
        } else {
            this.updateUIForLoggedOutUser();
        }
    }
    
    updateUIForLoggedInUser(userData) {
        const displayName = userData.username || userData.email || 'User';
        
        const loginForm = document.getElementById('login-form');
        const userInfo = document.getElementById('user-info');
        const userWelcome = document.getElementById('user-welcome');
        
        if (loginForm) loginForm.style.display = 'none';
        if (userInfo) userInfo.style.display = 'block';
        if (userWelcome) userWelcome.textContent = `Hallo, ${displayName}!`;
        
        // Dashboard-spezifische UI-Updates
        const headerUsername = document.getElementById('header-username');
        if (headerUsername) headerUsername.textContent = displayName;
        
        const userAvatar = document.getElementById('user-avatar');
        if (userAvatar) {
            const firstLetter = displayName.charAt(0).toUpperCase();
            userAvatar.textContent = firstLetter;
        }
        
        const userName = document.getElementById('user-name');
        const userEmail = document.getElementById('user-email');
        if (userName) userName.textContent = displayName;
        if (userEmail) userEmail.textContent = userData.email;
        
        console.log('✅ UI für eingeloggten User aktualisiert');
    }
    
    updateUIForLoggedOutUser() {
        const loginForm = document.getElementById('login-form');
        const userInfo = document.getElementById('user-info');
        
        if (loginForm) loginForm.style.display = 'block';
        if (userInfo) userInfo.style.display = 'none';
        
        if (typeof hideLoginMessages === 'function') {
            hideLoginMessages();
        }
        
        console.log('✅ UI für ausgeloggten User aktualisiert');
    }
    
    redirectAfterDelay(url, delay = 2000) {
        console.log(`⏳ Weiterleitung zu ${url} in ${delay}ms`);
        const base = this.getBasePath();
        setTimeout(() => {
            window.location.href = base + url;
        }, delay);
    }
    
    getBasePath() {
        const p = window.location.pathname;
        if (p.includes('/testarea/')) {
            return p.split('/testarea/')[0] + '/';
        }
        return p.replace(/[^/]*$/, '');
    }
    
    // Dashboard-Daten laden (bestehende Funktion)
    async loadDashboardData(userId) {
        try {
            const db = window.FirebaseConfig.getDB();
            
            const statsDoc = await db.collection('userStats').doc(userId).get();
            const stats = statsDoc.exists ? statsDoc.data() : null;
            
            const activitiesQuery = await db.collection('userActivities')
                .where('userId', '==', userId)
                .orderBy('timestamp', 'desc')
                .limit(5)
                .get();
            
            const activities = [];
            activitiesQuery.forEach(doc => {
                activities.push(doc.data());
            });
            
            console.log('📊 Dashboard-Daten geladen');
            return { stats, activities };
            
        } catch (error) {
            console.error('❌ Fehler beim Laden der Dashboard-Daten:', error);
            return { stats: null, activities: [] };
        }
    }
    
    async updateUserStats(statType, increment = 1) {
        try {
            const user = window.AuthAPI.getCurrentUser();
            if (!user) return;
            
            const db = window.FirebaseConfig.getDB();
            const statsRef = db.collection('userStats').doc(user.uid);
            const statsDoc = await statsRef.get();
            
            if (statsDoc.exists) {
                const currentStats = statsDoc.data();
                const updates = {};
                updates[statType] = (currentStats[statType] || 0) + increment;
                await statsRef.update(updates);
            } else {
                const newStats = { battles: 0, raids: 0, winRate: 0 };
                newStats[statType] = increment;
                await statsRef.set(newStats);
            }
            
            console.log('📈 Statistik aktualisiert:', statType, '+' + increment);
            
        } catch (error) {
            console.error('❌ Fehler beim Aktualisieren der Statistiken:', error);
        }
    }
}

// Globale FirebaseSync-Instanz
window.firebaseSync = new FirebaseSync();

// Erweiterte API
window.SyncAPI = {
    loadDashboardData: (userId) => window.firebaseSync.loadDashboardData(userId),
    updateUserStats: (statType, increment) => window.firebaseSync.updateUserStats(statType, increment),
    redirectToDashboard: () => window.firebaseSync.redirectAfterDelay('dashboard.html', 1500),
    redirectToIndex: () => window.firebaseSync.redirectAfterDelay('index.html', 1500),
    getCurrentPage: () => window.firebaseSync.currentPage,
    
    // Neue Dashboard-Funktionen
    dashboardLogout: () => window.firebaseSync.handleDashboardLogout(),
    quickLogout: async () => {
        const result = await window.AuthAPI.logout();
        if (result.success) {
            window.location.href = 'index.html';
        }
    }
};
