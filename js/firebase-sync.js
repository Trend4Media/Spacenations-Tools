/**
 * Firebase Sync - Dashboard-Synchronisation zwischen Seiten
 * Abhängigkeiten: firebase-config.js, auth-manager.js
 */

class FirebaseSync {
    constructor() {
        this.currentPage = this.detectCurrentPage();
        this.redirectRules = {
            'index': { requiresAuth: false, redirectTo: 'dashboard.html' },
            'dashboard': { requiresAuth: true, redirectTo: 'index.html' },
            'register': { requiresAuth: false, redirectTo: 'dashboard.html' }
        };
        
        this.init();
    }
    
    async init() {
        try {
            // Warten bis AuthManager bereit ist
            await window.AuthAPI.waitForInit();
            
            console.log('🔄 FirebaseSync initialisiert für Seite:', this.currentPage);
            
            // Auth State Changes überwachen
            window.AuthAPI.onAuthStateChange((user, userData) => {
                this.handleAuthStateChange(user, userData);
            });
            
        } catch (error) {
            console.error('❌ FirebaseSync-Initialisierung fehlgeschlagen:', error);
        }
    }
    
    // Aktuelle Seite erkennen
    detectCurrentPage() {
        const path = window.location.pathname;
        const filename = path.split('/').pop().split('.')[0] || 'index';
        
        console.log('📄 Aktuelle Seite erkannt:', filename);
        return filename;
    }
    
    // Auth State Changes verarbeiten
    handleAuthStateChange(user, userData) {
        const isLoggedIn = !!user;
        const pageConfig = this.redirectRules[this.currentPage];
        
        if (!pageConfig) {
            console.log('ℹ️ Keine Redirect-Regel für Seite:', this.currentPage);
            return;
        }
        
        console.log('🔄 Auth State für', this.currentPage, ':', isLoggedIn ? 'Eingeloggt' : 'Ausgeloggt');
        
        // Redirect-Logik
        if (pageConfig.requiresAuth && !isLoggedIn) {
            // Seite braucht Auth, aber User ist nicht eingeloggt
            console.log('🚫 Zugriff verweigert - Weiterleitung zu:', pageConfig.redirectTo);
            this.redirectAfterDelay(pageConfig.redirectTo, 1000);
            
        } else if (!pageConfig.requiresAuth && isLoggedIn) {
            // Seite braucht keine Auth, aber User ist eingeloggt
            if (this.currentPage === 'index' || this.currentPage === 'register') {
                console.log('✅ User eingeloggt - Weiterleitung zu Dashboard');
                this.showWelcomeMessage(userData);
                this.redirectAfterDelay(pageConfig.redirectTo, 2500);
            }
        }
        
        // UI für aktuellen Auth-Status aktualisieren
        this.updateUIForAuthState(isLoggedIn, userData);
    }
    
    // Willkommensnachricht anzeigen
    showWelcomeMessage(userData) {
        const displayName = userData?.username || 'User';
        
        // Versuche Erfolgsnachricht anzuzeigen
        if (typeof showLoginSuccess === 'function') {
            showLoginSuccess(`Willkommen zurück, ${displayName}! Weiterleitung zum Dashboard...`);
        }
        
        // Loading-Overlay anzeigen wenn verfügbar
        if (typeof showLoadingOverlay === 'function') {
            setTimeout(() => showLoadingOverlay(), 1500);
        }
    }
    
    // UI für Auth-Status aktualisieren
    updateUIForAuthState(isLoggedIn, userData) {
        if (isLoggedIn && userData) {
            this.updateUIForLoggedInUser(userData);
        } else {
            this.updateUIForLoggedOutUser();
        }
    }
    
    // UI für eingeloggten User
    updateUIForLoggedInUser(userData) {
        const displayName = userData.username || userData.email || 'User';
        
        // Login-Form verstecken, User-Info anzeigen
        const loginForm = document.getElementById('login-form');
        const userInfo = document.getElementById('user-info');
        const userWelcome = document.getElementById('user-welcome');
        
        if (loginForm) loginForm.style.display = 'none';
        if (userInfo) userInfo.style.display = 'block';
        if (userWelcome) userWelcome.textContent = `Hallo, ${displayName}!`;
        
        // Header-Username aktualisieren (für Dashboard)
        const headerUsername = document.getElementById('header-username');
        if (headerUsername) headerUsername.textContent = displayName;
        
        // User-Avatar aktualisieren (für Dashboard)
        const userAvatar = document.getElementById('user-avatar');
        if (userAvatar) {
            const firstLetter = displayName.charAt(0).toUpperCase();
            userAvatar.textContent = firstLetter;
        }
        
        // User-Name und E-Mail aktualisieren
        const userName = document.getElementById('user-name');
        const userEmail = document.getElementById('user-email');
        if (userName) userName.textContent = displayName;
        if (userEmail) userEmail.textContent = userData.email;
        
        console.log('✅ UI für eingeloggten User aktualisiert');
    }
    
    // UI für ausgeloggten User
    updateUIForLoggedOutUser() {
        const loginForm = document.getElementById('login-form');
        const userInfo = document.getElementById('user-info');
        
        if (loginForm) loginForm.style.display = 'block';
        if (userInfo) userInfo.style.display = 'none';
        
        // Nachrichten verstecken
        if (typeof hideLoginMessages === 'function') {
            hideLoginMessages();
        }
        
        console.log('✅ UI für ausgeloggten User aktualisiert');
    }
    
    // Verzögerte Weiterleitung
    redirectAfterDelay(url, delay = 2000) {
        console.log(`⏳ Weiterleitung zu ${url} in ${delay}ms`);
        
        setTimeout(() => {
            window.location.href = url;
        }, delay);
    }
    
    // Dashboard-spezifische Daten laden
    async loadDashboardData(userId) {
        try {
            const db = window.FirebaseConfig.getDB();
            
            // Benutzer-Statistiken laden
            const statsDoc = await db.collection('userStats').doc(userId).get();
            const stats = statsDoc.exists ? statsDoc.data() : null;
            
            // Letzte Aktivitäten laden
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
    
    // Statistiken aktualisieren
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

// Globale FirebaseSync-Instanz erstellen
window.firebaseSync = new FirebaseSync();

// Globale API für andere Seiten
window.SyncAPI = {
    loadDashboardData: (userId) => window.firebaseSync.loadDashboardData(userId),
    updateUserStats: (statType, increment) => window.firebaseSync.updateUserStats(statType, increment),
    redirectToDashboard: () => window.firebaseSync.redirectAfterDelay('dashboard.html', 1500),
    getCurrentPage: () => window.firebaseSync.currentPage
};
