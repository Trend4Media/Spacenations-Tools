/**
 * Auth Manager - Zentrale Verwaltung für Login/Logout
 * Abhängigkeiten: firebase-config.js muss geladen sein
 */

// Logger-Integration
const authLog = window.log || {
    auth: (msg, data) => console.log('👤 AUTH:', msg, data),
    error: (msg, err, data) => console.error('❌ ERROR:', msg, err, data),
    debug: (msg, data) => console.log('🔍 DEBUG:', msg, data)
};

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
            authLog.auth('AuthManager-Initialisierung gestartet');
            await window.FirebaseConfig.waitForReady();
            this.auth = window.FirebaseConfig.getAuth();
            this.db = window.FirebaseConfig.getDB();
            
            // Auth State Listener starten
            this.startAuthStateListener();
            this.initialized = true;
            
            authLog.auth('AuthManager erfolgreich initialisiert', { 
                authAvailable: !!this.auth, 
                dbAvailable: !!this.db 
            });
            
        } catch (error) {
            authLog.error('AuthManager-Initialisierung fehlgeschlagen', error, { 
                firebaseConfigAvailable: !!window.FirebaseConfig 
            });
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
                const userData = userDoc.data();
                // Migriere das Benutzerdokument falls nötig
                return await this.migrateUserDocument(userData);
            } else {
                console.warn('⚠️ Benutzerdokument nicht gefunden für UID:', uid);
                
                // Automatisch Benutzerdokument erstellen
                console.log('🔧 Erstelle automatisch Benutzerdokument...');
                return await this.createUserDocument(uid);
            }
        } catch (error) {
            console.error('❌ Fehler beim Laden der Benutzerdaten:', error);
            
            // Bei Berechtigungsfehlern: Fallback-Benutzerdaten erstellen
            if (error.code === 'permission-denied' || error.message.includes('permissions')) {
                console.warn('⚠️ Berechtigungsfehler - erstelle Fallback-Benutzerdaten');
                return this.createFallbackUserData(uid);
            }
            
            throw error;
        }
    }
    
    // Automatisch Benutzerdokument erstellen
    async createUserDocument(uid) {
        try {
            const user = this.auth.currentUser;
            if (!user) {
                throw new Error('Kein authentifizierter Benutzer');
            }
            
            const userData = {
                uid: uid,
                email: user.email,
                username: user.displayName || user.email.split('@')[0],
                createdAt: window.FirebaseConfig.getServerTimestamp(),
                lastLogin: window.FirebaseConfig.getServerTimestamp(),
                lastUpdated: window.FirebaseConfig.getServerTimestamp(),
                updatedAt: window.FirebaseConfig.getServerTimestamp(),
                updatedBy: uid,
                isActive: true,
                isAllianceAdmin: false,
                isSuperAdmin: false,
                systemRole: 'user',
                role: 'user',
                loginCount: 0,
                alliance: null,
                allianceRole: null,
                allianceTag: null,
                discord: null,
                permissions: {
                    dashboard_access: true,
                    profile_edit: true,
                    admin_dashboard: false,
                    user_management: false,
                    alliance_management: false,
                    system_settings: false
                },
                activities: [{
                    icon: '👤',
                    text: 'Account automatisch erstellt',
                    timestamp: new Date()
                }]
            };
            
            await this.db.collection('users').doc(uid).set(userData);
            console.log('✅ Benutzerdokument automatisch erstellt für:', userData.username);
            
            return userData;
            
        } catch (error) {
            console.error('❌ Fehler beim Erstellen des Benutzerdokuments:', error);
            
            // Fallback-Benutzerdaten erstellen
            return this.createFallbackUserData(uid);
        }
    }
    
    // Fallback-Benutzerdaten erstellen bei Berechtigungsfehlern
    createFallbackUserData(uid) {
        return {
            uid: uid,
            username: 'Unknown User',
            email: 'unknown@example.com',
            isActive: true,
            isAllianceAdmin: false,
            isSuperAdmin: false,
            systemRole: 'user',
            role: 'user',
            loginCount: 0,
            alliance: null,
            allianceRole: null,
            allianceTag: null,
            discord: null,
            permissions: {
                dashboard_access: true,
                profile_edit: true,
                admin_dashboard: false,
                user_management: false,
                alliance_management: false,
                system_settings: false
            },
            createdAt: new Date(),
            lastLogin: new Date(),
            lastUpdated: new Date(),
            updatedAt: new Date(),
            updatedBy: uid,
            activities: [{
                icon: '⚠️',
                text: 'Fallback-Benutzerdaten (Berechtigungsfehler)',
                timestamp: new Date()
            }]
        };
    }
    
    // Bestehende Benutzerdokumente migrieren (falls nötig)
    async migrateUserDocument(userData) {
        try {
            const updates = {};
            
            // Prüfe und füge fehlende Felder hinzu
            if (!userData.hasOwnProperty('isAllianceAdmin')) updates.isAllianceAdmin = false;
            if (!userData.hasOwnProperty('isSuperAdmin')) updates.isSuperAdmin = false;
            if (!userData.hasOwnProperty('systemRole')) updates.systemRole = userData.role || 'user';
            if (!userData.hasOwnProperty('loginCount')) updates.loginCount = 0;
            if (!userData.hasOwnProperty('alliance')) updates.alliance = null;
            if (!userData.hasOwnProperty('allianceRole')) updates.allianceRole = null;
            if (!userData.hasOwnProperty('allianceTag')) updates.allianceTag = null;
            if (!userData.hasOwnProperty('discord')) updates.discord = null;
            if (!userData.hasOwnProperty('permissions')) {
                updates.permissions = {
                    dashboard_access: true,
                    profile_edit: true,
                    admin_dashboard: false,
                    user_management: false,
                    alliance_management: false,
                    system_settings: false
                };
            }
            if (!userData.hasOwnProperty('lastUpdated')) updates.lastUpdated = window.FirebaseConfig.getServerTimestamp();
            if (!userData.hasOwnProperty('updatedAt')) updates.updatedAt = window.FirebaseConfig.getServerTimestamp();
            if (!userData.hasOwnProperty('updatedBy')) updates.updatedBy = userData.uid;
            
            // Nur aktualisieren wenn Updates nötig sind
            if (Object.keys(updates).length > 0) {
                await this.db.collection('users').doc(userData.uid).update(updates);
                console.log('✅ Benutzerdokument migriert für:', userData.username);
                
                // Aktualisierte Daten zurückgeben
                return { ...userData, ...updates };
            }
            
            return userData;
            
        } catch (error) {
            console.error('❌ Fehler bei Benutzerdokument-Migration:', error);
            return userData; // Original-Daten zurückgeben
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
            
            // Bei Berechtigungsfehlern: Fallback (nur loggen, nicht werfen)
            if (error.code === 'permission-denied' || error.message.includes('permissions')) {
                console.warn('⚠️ LastLogin-Update fehlgeschlagen - Berechtigungsfehler');
                return; // Nicht werfen, nur loggen
            }
            
            // Andere Fehler: auch nicht werfen, da es nicht kritisch ist
            console.warn('⚠️ LastLogin-Update fehlgeschlagen - nicht kritisch');
        }
    }
    
    // Hilfsfunktion: Benutzername zu E-Mail auflösen
    async resolveUsernameToEmail(input) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        // Wenn es bereits eine E-Mail ist, direkt zurückgeben
        if (emailRegex.test(input)) {
            return input;
        }
        
        // Ansonsten als Benutzername behandeln und in Firestore nachschlagen
        try {
            console.log('🔍 Suche E-Mail für Benutzername:', input);
            const userQuery = await this.db.collection('users')
                .where('username', '==', input)
                .limit(1)
                .get();
            
            if (userQuery.empty) {
                console.log('❌ Benutzername nicht gefunden:', input);
                return null;
            }
            
            const userDoc = userQuery.docs[0];
            const userData = userDoc.data();
            console.log('✅ E-Mail gefunden für Benutzername:', input, '->', userData.email);
            return userData.email;
            
        } catch (error) {
            console.error('❌ Fehler beim Auflösen des Benutzernamens:', error);
            return null;
        }
    }

    // Login-Funktion
    async login(input, password) {
        try {
            console.log('🔐 Login-Versuch für:', input);
            
            // Eingabe auflösen (Benutzername oder E-Mail)
            const email = await this.resolveUsernameToEmail(input);
            if (!email) {
                console.log('❌ Benutzer nicht gefunden:', input);
                return { 
                    success: false, 
                    error: 'Benutzername oder E-Mail-Adresse nicht gefunden. Bitte überprüfen Sie Ihre Eingabe.' 
                };
            }
            
            console.log('📧 Verwende E-Mail für Login:', email);
            
            // Zuerst prüfen, ob der Benutzer existiert
            try {
                const methods = await this.auth.fetchSignInMethodsForEmail(email);
                if (methods.length === 0) {
                    console.log('❌ Benutzer existiert nicht:', email);
                    return { 
                        success: false, 
                        error: 'Kein Account mit dieser E-Mail gefunden. Bitte registrieren Sie sich zuerst.' 
                    };
                }
                console.log('✅ Benutzer existiert:', email, 'Methoden:', methods);
            } catch (fetchError) {
                console.warn('⚠️ Konnte Benutzer-Existenz nicht prüfen:', fetchError);
                // Weiter mit Login-Versuch
            }
            
            const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
            console.log('✅ Login erfolgreich');
            
            // Aktivität hinzufügen
            this.addActivity('🔐', `Erfolgreich angemeldet (${input})`);
            
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
                    errorMessage = 'Kein Account mit diesem Benutzernamen oder dieser E-Mail gefunden. Bitte registrieren Sie sich zuerst.';
                    break;
                case 'auth/wrong-password':
                    errorMessage = 'Falsches Passwort.';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Ungültige E-Mail-Adresse. Bitte geben Sie eine gültige E-Mail-Adresse oder einen Benutzernamen ein.';
                    break;
                case 'auth/user-disabled':
                    errorMessage = 'Dieser Account wurde deaktiviert.';
                    break;
                case 'auth/too-many-requests':
                    errorMessage = 'Zu viele Login-Versuche. Bitte warten Sie einen Moment.';
                    break;
                case 'auth/network-request-failed':
                    errorMessage = 'Netzwerkfehler. Bitte überprüfen Sie Ihre Internetverbindung.';
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
                lastUpdated: window.FirebaseConfig.getServerTimestamp(),
                updatedAt: window.FirebaseConfig.getServerTimestamp(),
                updatedBy: user.uid,
                isActive: true,
                isAllianceAdmin: false,
                isSuperAdmin: false,
                systemRole: 'user',
                role: 'user',
                loginCount: 0,
                alliance: null,
                allianceRole: null,
                allianceTag: null,
                discord: null,
                permissions: {
                    dashboard_access: true,
                    profile_edit: true,
                    admin_dashboard: false,
                    user_management: false,
                    alliance_management: false,
                    system_settings: false
                },
                activities: [{
                    icon: '👤',
                    text: 'Account erstellt',
                    timestamp: new Date()
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
