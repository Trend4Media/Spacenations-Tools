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
                    
                    // Session-Daten aktualisieren
                    if (window.SessionAPI) {
                        window.SessionAPI.setUserData(user, this.userData);
                        window.SessionAPI.setSessionActive(true);
                    }
                    
                    // LastLogin aktualisieren
                    await this.updateLastLogin(user.uid);
                    
                } catch (error) {
                    console.error('❌ Fehler beim Laden der Benutzerdaten:', error);
                }
            } else {
                this.userData = null;
                
                // Session-Daten löschen
                if (window.SessionAPI) {
                    window.SessionAPI.clearUserData();
                }
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
            
            // Login-Success Message setzen
            if (window.SessionAPI) {
                window.SessionAPI.setLoginSuccess('Login erfolgreich! Willkommen zurück.');
            }
            
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
    
    // Registrierungs-Funktion
    async register(email, password, username) {
        try {
            console.log('📝 Registrierungs-Versuch für:', email, 'Username:', username);
            
            // Firebase Auth User erstellen
            const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            console.log('✅ Firebase User erstellt:', user.uid);
            
            // Benutzerdaten in Firestore speichern
            await this.db.collection('users').doc(user.uid).set({
                uid: user.uid,
                email: email,
                username: username,
                createdAt: window.FirebaseConfig.getServerTimestamp(),
                lastLogin: window.FirebaseConfig.getServerTimestamp(),
                isActive: true,
                role: 'user',
                activities: [{
                    icon: '👤',
                    text: 'Account erstellt',
                    timestamp: window.FirebaseConfig.getServerTimestamp()
                }]
            });
            
            console.log('✅ Benutzerdaten gespeichert für:', username);
            
            // Aktivität hinzufügen
            this.addActivity('👤', 'Account erfolgreich erstellt');
            
            // Session aktivieren
            if (window.SessionAPI) {
                window.SessionAPI.setSessionActive(true);
                window.SessionAPI.setLoginSuccess('Registrierung erfolgreich! Willkommen bei Spacenations Tools.');
            }
            
            return { success: true, user: user };
            
        } catch (error) {
            console.error('❌ Registrierungs-Fehler:', error);
            
            // Benutzerfreundliche Fehlermeldungen
            let errorMessage = 'Registrierung fehlgeschlagen.';
            switch (error.code) {
                case 'auth/email-already-in-use':
                    errorMessage = 'Diese E-Mail-Adresse wird bereits verwendet.';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Ungültige E-Mail-Adresse.';
                    break;
                case 'auth/weak-password':
                    errorMessage = 'Passwort ist zu schwach. Verwenden Sie mindestens 6 Zeichen.';
                    break;
                case 'auth/operation-not-allowed':
                    errorMessage = 'Registrierung ist derzeit nicht möglich.';
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
            
            // Logout-Success Message setzen
            if (window.SessionAPI) {
                window.SessionAPI.setLogoutSuccess('Erfolgreich abgemeldet.');
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
    register: (email, password, username) => window.authManager.register(email, password, username),
    logout: () => window.authManager.logout(),
    resetPassword: (email) => window.authManager.resetPassword(email),
    addActivity: (icon, text) => window.authManager.addActivity(icon, text),
    getCurrentUser: () => window.authManager.getCurrentUser(),
    getUserData: () => window.authManager.getUserData(),
    isLoggedIn: () => window.authManager.isLoggedIn(),
    onAuthStateChange: (callback) => window.authManager.onAuthStateChange(callback),
    waitForInit: () => window.authManager.waitForInit()
};
