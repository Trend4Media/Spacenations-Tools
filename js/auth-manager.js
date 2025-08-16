/**
 * Auth Manager - Zentrale Verwaltung für Login/Logout
 * Abhängigkeiten: firebase-config.js muss geladen sein
 */

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.userData = null;
        this.authStateCallbacks = [];
        this.initialized = false;
        
        // Warten bis Firebase bereit ist
        this.init();
    }
    
    async init() {
        try {
            await window.FirebaseConfig.waitForReady();
            this.auth = window.FirebaseConfig.getAuth();
            this.db = window.FirebaseConfig.getDB();
            
            // Auth State Listener starten
            this.startAuthStateListener();
            this.initialized = true;
            
            console.log('👤 AuthManager initialisiert');
            
        } catch (error) {
            console.error('❌ AuthManager-Initialisierung fehlgeschlagen:', error);
        }
    }
    
    // Auth State Listener
    startAuthStateListener() {
        this.auth.onAuthStateChanged(async (user) => {
            console.log('🔄 Auth State Change:', user ? 'Eingeloggt' : 'Ausgeloggt');
            
            this.currentUser = user;
            
            if (user) {
                try {
                    // Benutzerdaten laden
                    this.userData = await this.loadUserData(user.uid);
                    console.log('📂 Benutzerdaten geladen:', this.userData?.username);
                    
                    // LastLogin aktualisieren
                    await this.updateLastLogin(user.uid);
                    
                } catch (error) {
                    console.error('❌ Fehler beim Laden der Benutzerdaten:', error);
                }
            } else {
                this.userData = null;
            }
            
            // Alle registrierten Callbacks aufrufen
            this.notifyAuthStateChange(user, this.userData);
        });
    }
    
    // Benutzerdaten aus Firestore laden
    async loadUserData(uid) {
        try {
            const userDoc = await this.db.collection('users').doc(uid).get();
            if (userDoc.exists) {
                return userDoc.data();
            } else {
                console.warn('⚠️ Benutzerdokument nicht gefunden für UID:', uid);
                return null;
            }
        } catch (error) {
            console.error('❌ Fehler beim Laden der Benutzerdaten:', error);
            throw error;
        }
    }
    
    // LastLogin aktualisieren
    async updateLastLogin(uid) {
        try {
            await this.db.collection('users').doc(uid).update({
                lastLogin: window.FirebaseConfig.getServerTimestamp()
            });
        } catch (error) {
            console.error('❌ Fehler beim LastLogin-Update:', error);
        }
    }
    
    // Login-Funktion
    async login(email, password) {
        try {
            console.log('🔐 Login-Versuch für:', email);
            const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
            console.log('✅ Login erfolgreich');
            
            // Aktivität hinzufügen
            this.addActivity('🔐', 'Erfolgreich angemeldet');
            
            return { success: true, user: userCredential.user };
            
        } catch (error) {
            console.error('❌ Login fehlgeschlagen:', error);
            
            // Benutzerfreundliche Fehlermeldungen
            let errorMessage = 'Login fehlgeschlagen.';
            switch (error.code) {
                case 'auth/user-not-found':
                    errorMessage = 'Kein Account mit dieser E-Mail gefunden.';
                    break;
                case 'auth/wrong-password':
                    errorMessage = 'Falsches Passwort.';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Ungültige E-Mail-Adresse.';
                    break;
                case 'auth/too-many-requests':
                    errorMessage = 'Zu viele Fehlversuche. Versuchen Sie es später erneut.';
                    break;
                case 'auth/invalid-credential':
                    errorMessage = 'Ungültige Anmeldedaten.';
                    break;
            }
            
            return { success: false, error: errorMessage };
        }
    }
    
    // Logout-Funktion
    async logout() {
        try {
            console.log('🚪 Logout-Versuch');
            
            // Aktivität hinzufügen bevor logout
            if (this.currentUser) {
                await this.addActivity('🚪', 'Abgemeldet');
            }
            
            await this.auth.signOut();
            console.log('✅ Logout erfolgreich');
            
            return { success: true };
            
        } catch (error) {
            console.error('❌ Logout fehlgeschlagen:', error);
            return { success: false, error: 'Fehler beim Abmelden' };
        }
    }
    
    // Passwort zurücksetzen
    async resetPassword(email) {
        try {
            await this.auth.sendPasswordResetEmail(email);
            console.log('📧 Passwort-Reset E-Mail gesendet an:', email);
            return { success: true };
            
        } catch (error) {
            console.error('❌ Passwort-Reset fehlgeschlagen:', error);
            
            let errorMessage = 'Fehler beim Passwort-Reset.';
            if (error.code === 'auth/user-not-found') {
                errorMessage = 'Kein Account mit dieser E-Mail gefunden.';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Ungültige E-Mail-Adresse.';
            }
            
            return { success: false, error: errorMessage };
        }
    }
    
    // Aktivität hinzufügen
    async addActivity(icon, text) {
        try {
            if (!this.currentUser) return;
            
            await this.db.collection('userActivities').add({
                userId: this.currentUser.uid,
                icon: icon,
                text: text,
                timestamp: window.FirebaseConfig.getServerTimestamp()
            });
            
            console.log('📝 Aktivität hinzugefügt:', text);
            
        } catch (error) {
            console.error('❌ Fehler beim Hinzufügen der Aktivität:', error);
        }
    }
    
    // Auth State Change Callback registrieren
    onAuthStateChange(callback) {
        this.authStateCallbacks.push(callback);
        
        // Sofort aufrufen wenn bereits User vorhanden
        if (this.currentUser && this.userData) {
            callback(this.currentUser, this.userData);
        }
    }
    
    // Alle Callbacks benachrichtigen
    notifyAuthStateChange(user, userData) {
        this.authStateCallbacks.forEach(callback => {
            try {
                callback(user, userData);
            } catch (error) {
                console.error('❌ Fehler in Auth-Callback:', error);
            }
        });
    }
    
    // Getter für aktuellen User
    getCurrentUser() {
        return this.currentUser;
    }
    
    // Getter für User-Daten
    getUserData() {
        return this.userData;
    }
    
    // Prüfen ob User eingeloggt ist
    isLoggedIn() {
        return !!this.currentUser;
    }
    
    // Warten bis AuthManager bereit ist
    waitForInit() {
        return new Promise((resolve) => {
            if (this.initialized) {
                resolve();
            } else {
                const checkInit = setInterval(() => {
                    if (this.initialized) {
                        clearInterval(checkInit);
                        resolve();
                    }
                }, 100);
            }
        });
    }
}

// Globale AuthManager-Instanz erstellen
window.authManager = new AuthManager();

// Globale Funktionen für einfache Nutzung
window.AuthAPI = {
    login: (email, password) => window.authManager.login(email, password),
    logout: () => window.authManager.logout(),
    resetPassword: (email) => window.authManager.resetPassword(email),
    addActivity: (icon, text) => window.authManager.addActivity(icon, text),
    getCurrentUser: () => window.authManager.getCurrentUser(),
    getUserData: () => window.authManager.getUserData(),
    isLoggedIn: () => window.authManager.isLoggedIn(),
    onAuthStateChange: (callback) => window.authManager.onAuthStateChange(callback),
    waitForInit: () => window.authManager.waitForInit()
};
