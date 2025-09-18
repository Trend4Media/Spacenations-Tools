/**
 * NEUER Auth Manager - Vereinfacht und Robust
 * Ersetzt den bestehenden auth-manager.js
 */

// Logger-Integration
const authLog = window.log || {
    auth: (msg, data) => console.log('👤 AUTH:', msg, data),
    error: (msg, err, data) => console.error('❌ AUTH ERROR:', msg, err, data),
    debug: (msg, data) => console.log('🔍 AUTH DEBUG:', msg, data)
};

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.userData = null;
        this.authStateCallbacks = [];
        this.initialized = false;
        this.initPromise = null;
        
        // Initialisierung starten
        this.initPromise = this.initialize();
    }
    
    async initialize() {
        try {
            authLog.auth('AuthManager-Initialisierung gestartet');
            
            // Warten bis Firebase bereit ist
            const firebaseReady = await window.FirebaseConfig.waitForReadyWithTimeout(10000);
            if (!firebaseReady) {
                throw new Error('Firebase-Initialisierung fehlgeschlagen');
            }
            
            // Firebase-Services holen
            this.auth = window.FirebaseConfig.getAuth();
            this.db = window.FirebaseConfig.getDB();
            
            if (!this.auth || !this.db) {
                throw new Error('Firebase Auth oder DB nicht verfügbar');
            }
            
            // Auth State Listener starten
            this.setupAuthStateListener();
            
            this.initialized = true;
            authLog.auth('AuthManager erfolgreich initialisiert');
            
            return true;
            
        } catch (error) {
            authLog.error('AuthManager-Initialisierung fehlgeschlagen', error);
            this.initialized = false;
            throw error;
        }
    }
    
    // Auth State Listener einrichten
    setupAuthStateListener() {
        this.auth.onAuthStateChanged(async (user) => {
            authLog.auth('Auth State Change:', user ? `Eingeloggt: ${user.email}` : 'Ausgeloggt');
            
            this.currentUser = user;
            
            if (user) {
                try {
                    // Benutzerdaten laden
                    this.userData = await this.loadUserData(user.uid);
                    authLog.auth('Benutzerdaten geladen:', this.userData?.username || user.email);
                    
                    // LastLogin aktualisieren
                    await this.updateLastLogin(user.uid);
                    
                } catch (error) {
                    authLog.error('Fehler beim Laden der Benutzerdaten', error);
                    this.userData = this.createFallbackUserData(user);
                }
            } else {
                this.userData = null;
            }
            
            // Callbacks benachrichtigen
            this.notifyAuthStateChange(user, this.userData);
        });
    }
    
    // Benutzerdaten aus Firestore laden
    async loadUserData(uid) {
        try {
            const userDoc = await this.db.collection('users').doc(uid).get();
            
            if (userDoc.exists) {
                const userData = userDoc.data();
                return await this.migrateUserDocument(userData);
            } else {
                authLog.auth('Benutzerdokument nicht gefunden, erstelle neues');
                return await this.createUserDocument(uid);
            }
            
        } catch (error) {
            authLog.error('Fehler beim Laden der Benutzerdaten', error);
            
            // Fallback bei Berechtigungsfehlern
            if (error.code === 'permission-denied') {
                return this.createFallbackUserData(this.auth.currentUser);
            }
            
            throw error;
        }
    }
    
    // Neues Benutzerdokument erstellen
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
                loginCount: 1,
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
                }
            };
            
            await this.db.collection('users').doc(uid).set(userData);
            authLog.auth('Benutzerdokument erstellt für:', userData.username);
            
            return userData;
            
        } catch (error) {
            authLog.error('Fehler beim Erstellen des Benutzerdokuments', error);
            return this.createFallbackUserData(this.auth.currentUser);
        }
    }
    
    // Fallback-Benutzerdaten
    createFallbackUserData(user) {
        return {
            uid: user?.uid || 'unknown',
            email: user?.email || 'unknown@example.com',
            username: user?.displayName || user?.email?.split('@')[0] || 'Unknown User',
            isActive: true,
            isAllianceAdmin: false,
            isSuperAdmin: false,
            systemRole: 'user',
            role: 'user',
            loginCount: 0,
            alliance: null,
            permissions: {
                dashboard_access: true,
                profile_edit: true,
                admin_dashboard: false,
                user_management: false,
                alliance_management: false,
                system_settings: false
            },
            fallback: true
        };
    }
    
    // Benutzerdokument migrieren
    async migrateUserDocument(userData) {
        try {
            const updates = {};
            
            // Fehlende Felder hinzufügen
            if (!userData.hasOwnProperty('isAllianceAdmin')) updates.isAllianceAdmin = false;
            if (!userData.hasOwnProperty('isSuperAdmin')) updates.isSuperAdmin = false;
            if (!userData.hasOwnProperty('systemRole')) updates.systemRole = userData.role || 'user';
            if (!userData.hasOwnProperty('permissions')) {
                updates.permissions = {
                    dashboard_access: true,
                    profile_edit: true,
                    admin_dashboard: userData.isSuperAdmin || false,
                    user_management: userData.isSuperAdmin || false,
                    alliance_management: userData.isSuperAdmin || userData.isAllianceAdmin || false,
                    system_settings: userData.isSuperAdmin || false
                };
            }
            
            // Updates anwenden falls nötig
            if (Object.keys(updates).length > 0) {
                await this.db.collection('users').doc(userData.uid).update(updates);
                authLog.auth('Benutzerdokument migriert');
                return { ...userData, ...updates };
            }
            
            return userData;
            
        } catch (error) {
            authLog.error('Migration fehlgeschlagen', error);
            return userData;
        }
    }
    
    // LastLogin aktualisieren
    async updateLastLogin(uid) {
        try {
            await this.db.collection('users').doc(uid).update({
                lastLogin: window.FirebaseConfig.getServerTimestamp(),
                loginCount: firebase.firestore.FieldValue.increment(1)
            });
        } catch (error) {
            authLog.error('LastLogin-Update fehlgeschlagen', error);
            // Nicht kritisch, daher nicht werfen
        }
    }
    
    // Login-Funktion
    async login(input, password) {
        try {
            authLog.auth('Login-Versuch für:', input);
            
            // Warten bis initialisiert
            await this.waitForInit();
            
            if (!this.auth) {
                throw new Error('Firebase Auth nicht verfügbar');
            }
            
            // E-Mail-Validierung
            const email = await this.resolveEmailAddress(input);
            if (!email) {
                return {
                    success: false,
                    error: 'Ungültige E-Mail-Adresse oder Benutzername nicht gefunden'
                };
            }
            
            authLog.auth('Verwende E-Mail für Login:', email);
            
            // Prüfe ob Benutzer in Firebase Auth existiert
            try {
                const methods = await this.auth.fetchSignInMethodsForEmail(email);
                if (methods.length === 0) {
                    // Prüfe Firestore für detaillierte Fehlermeldung
                    const firestoreUser = await this.checkFirestoreUser(email);
                    if (firestoreUser) {
                        return {
                            success: false,
                            error: 'Benutzer existiert in der Datenbank, aber nicht in Firebase Authentication. Bitte wenden Sie sich an einen Administrator.'
                        };
                    } else {
                        return {
                            success: false,
                            error: 'Kein Account mit dieser E-Mail gefunden. Bitte registrieren Sie sich zuerst.'
                        };
                    }
                }
            } catch (fetchError) {
                authLog.error('Fehler beim Prüfen der Benutzer-Existenz', fetchError);
                // Weiter mit Login-Versuch
            }
            
            // Login-Versuch
            const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
            authLog.auth('Login erfolgreich für:', email);
            
            return {
                success: true,
                user: userCredential.user
            };
            
        } catch (error) {
            authLog.error('Login fehlgeschlagen', error);
            
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
                default:
                    errorMessage = error.message || 'Ein unbekannter Fehler ist aufgetreten.';
            }
            
            return {
                success: false,
                error: errorMessage
            };
        }
    }
    
    // E-Mail-Adresse auflösen
    async resolveEmailAddress(input) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        // Wenn es bereits eine E-Mail ist
        if (emailRegex.test(input)) {
            return input;
        }
        
        // Als Benutzername behandeln
        try {
            const userQuery = await this.db.collection('users')
                .where('username', '==', input)
                .limit(1)
                .get();
            
            if (!userQuery.empty) {
                const userData = userQuery.docs[0].data();
                authLog.auth('E-Mail für Benutzername gefunden:', input, '->', userData.email);
                return userData.email;
            }
            
        } catch (error) {
            authLog.error('Fehler beim Auflösen des Benutzernamens', error);
        }
        
        return null;
    }
    
    // Firestore-Benutzer prüfen
    async checkFirestoreUser(email) {
        try {
            const userQuery = await this.db.collection('users')
                .where('email', '==', email)
                .limit(1)
                .get();
            
            return !userQuery.empty ? userQuery.docs[0].data() : null;
            
        } catch (error) {
            authLog.error('Fehler beim Prüfen des Firestore-Benutzers', error);
            return null;
        }
    }
    
    // Registrierung
    async register(email, password, username) {
        try {
            authLog.auth('Registrierungs-Versuch für:', email);
            
            await this.waitForInit();
            
            if (!this.auth || !this.db) {
                throw new Error('Firebase Services nicht verfügbar');
            }
            
            // Firebase Auth User erstellen
            const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            authLog.auth('Firebase User erstellt:', user.uid);
            
            // Benutzerdaten in Firestore speichern
            const userData = {
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
                loginCount: 1,
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
                }
            };
            
            await this.db.collection('users').doc(user.uid).set(userData);
            authLog.auth('Benutzerdaten gespeichert für:', username);
            
            return {
                success: true,
                user: user,
                userData: userData
            };
            
        } catch (error) {
            authLog.error('Registrierung fehlgeschlagen', error);
            
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
                default:
                    errorMessage = error.message || 'Ein unbekannter Fehler ist aufgetreten.';
            }
            
            return {
                success: false,
                error: errorMessage
            };
        }
    }
    
    // Logout
    async logout() {
        try {
            authLog.auth('Logout-Versuch');
            
            await this.waitForInit();
            
            if (!this.auth) {
                throw new Error('Firebase Auth nicht verfügbar');
            }
            
            await this.auth.signOut();
            authLog.auth('Logout erfolgreich');
            
            return {
                success: true
            };
            
        } catch (error) {
            authLog.error('Logout fehlgeschlagen', error);
            return {
                success: false,
                error: 'Fehler beim Abmelden'
            };
        }
    }
    
    // Passwort zurücksetzen
    async resetPassword(email) {
        try {
            await this.waitForInit();
            
            if (!this.auth) {
                throw new Error('Firebase Auth nicht verfügbar');
            }
            
            await this.auth.sendPasswordResetEmail(email);
            authLog.auth('Passwort-Reset E-Mail gesendet an:', email);
            
            return {
                success: true
            };
            
        } catch (error) {
            authLog.error('Passwort-Reset fehlgeschlagen', error);
            
            let errorMessage = 'Fehler beim Passwort-Reset.';
            if (error.code === 'auth/user-not-found') {
                errorMessage = 'Kein Account mit dieser E-Mail gefunden.';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Ungültige E-Mail-Adresse.';
            }
            
            return {
                success: false,
                error: errorMessage
            };
        }
    }
    
    // Auth State Change Callback registrieren
    onAuthStateChange(callback) {
        this.authStateCallbacks.push(callback);
        
        // Sofort aufrufen wenn bereits initialisiert
        if (this.currentUser !== null && this.userData !== null) {
            try {
                callback(this.currentUser, this.userData);
            } catch (callbackError) {
                authLog.error('Fehler in Auth-Callback', callbackError);
            }
        }
    }
    
    // Alle Callbacks benachrichtigen
    notifyAuthStateChange(user, userData) {
        this.authStateCallbacks.forEach(callback => {
            try {
                callback(user, userData);
            } catch (error) {
                authLog.error('Fehler in Auth-Callback', error);
            }
        });
    }
    
    // Getter
    getCurrentUser() {
        return this.currentUser;
    }
    
    getUserData() {
        return this.userData;
    }
    
    isLoggedIn() {
        return !!this.currentUser;
    }
    
    isInitialized() {
        return this.initialized;
    }
    
    // Warten bis AuthManager bereit ist
    async waitForInit() {
        if (this.initialized) {
            return true;
        }
        
        if (this.initPromise) {
            try {
                await this.initPromise;
                return this.initialized;
            } catch (error) {
                authLog.error('AuthManager-Initialisierung fehlgeschlagen beim Warten', error);
                return false;
            }
        }
        
        return false;
    }
    
    // Aktivität hinzufügen
    async addActivity(icon, text) {
        try {
            if (!this.currentUser || !this.db) return;
            
            await this.db.collection('userActivities').add({
                userId: this.currentUser.uid,
                icon: icon,
                text: text,
                timestamp: window.FirebaseConfig.getServerTimestamp()
            });
            
            authLog.auth('Aktivität hinzugefügt:', text);
            
        } catch (error) {
            authLog.error('Fehler beim Hinzufügen der Aktivität', error);
            // Nicht kritisch, daher nicht werfen
        }
    }
}

// Globale AuthManager-Instanz
window.authManager = new AuthManager();

// Vereinfachte API
window.AuthAPI = {
    login: (input, password) => window.authManager.login(input, password),
    register: (email, password, username) => window.authManager.register(email, password, username),
    logout: () => window.authManager.logout(),
    resetPassword: (email) => window.authManager.resetPassword(email),
    addActivity: (icon, text) => window.authManager.addActivity(icon, text),
    getCurrentUser: () => window.authManager.getCurrentUser(),
    getUserData: () => window.authManager.getUserData(),
    isLoggedIn: () => window.authManager.isLoggedIn(),
    isInitialized: () => window.authManager.isInitialized(),
    onAuthStateChange: (callback) => window.authManager.onAuthStateChange(callback),
    waitForInit: () => window.authManager.waitForInit()
};