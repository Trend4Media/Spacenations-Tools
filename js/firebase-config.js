/**
 * Firebase Konfiguration und Initialisierung
 * Diese Datei muss als ERSTE geladen werden!
 */

// Prüfen ob Firebase verfügbar ist
function checkFirebaseAvailability() {
    if (typeof firebase === 'undefined') {
        console.error('❌ Firebase ist nicht geladen!');
        throw new Error('Firebase SDK nicht verfügbar');
    }
    console.log('✅ Firebase SDK erfolgreich geladen');
}

// Check for browser extension conflicts
function checkBrowserExtensions() {
    // Check for common problematic extensions
    const userAgent = navigator.userAgent.toLowerCase();
    const hasExtensions = document.querySelector('script[src*="3agents"]') || 
                         document.querySelector('script[src*="extension"]') ||
                         window.chrome?.runtime;
    
    if (hasExtensions) {
        console.warn('🔍 Browser-Extensions erkannt - verwende kompatiblen Modus');
        return true;
    }
    return false;
}

// Firebase initialisieren
function initializeFirebase() {
    try {
        checkFirebaseAvailability();
        
        // Check for browser extension conflicts
        const hasExtensions = checkBrowserExtensions();
        
        // Firebase-Konfiguration
        // TODO: Diese Werte sollten über den Server geladen werden
        const firebaseConfig = {
            apiKey: 'AIzaSyDr4-ap_EubUn0UdP7hkEpS2jkzLIVgvyc',
            authDomain: 'spacenations-tools.firebaseapp.com',
            projectId: 'spacenations-tools',
            storageBucket: 'spacenations-tools.firebasestorage.app',
            messagingSenderId: '651338201276',
            appId: '1:651338201276:web:89e7d9c19dbd2611d3f8b9',
            measurementId: 'G-SKWJWH2ERX'
        };

        // Firebase initialisieren (nur einmal)
        if (!firebase.apps.length) {
            const app = firebase.initializeApp(firebaseConfig);
            console.log('🔥 Firebase erfolgreich initialisiert');
            
            // Teste die Verbindung
            const db = firebase.firestore();
            db.settings({
                cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED
            });
            
        // Globale Firebase-Services erstellen
        window.firebaseServices = {
            app: app,
            auth: firebase.auth(),
            db: db,
            serverTimestamp: firebase.firestore.FieldValue.serverTimestamp,
            initialized: true,
            offline: false
        };
        
        // Stelle sicher, dass die Auth-Services auch global verfügbar sind
        window.firebaseAuth = firebase.auth();
        window.firebaseDB = db;
            
        } else {
            console.log('🔥 Firebase bereits initialisiert');
            
            // Services aus existierender App holen
            const app = firebase.app();
            window.firebaseServices = {
                app: app,
                auth: firebase.auth(),
                db: firebase.firestore(),
                serverTimestamp: firebase.firestore.FieldValue.serverTimestamp,
                initialized: true,
                offline: false
            };
            
            // Stelle sicher, dass die Auth-Services auch global verfügbar sind
            window.firebaseAuth = firebase.auth();
            window.firebaseDB = firebase.firestore();
        }
        
        console.log('✅ Firebase Services verfügbar');
        
        // Setze initialized Flag sofort
        window.firebaseServices.initialized = true;
        
        // Stelle sicher, dass alle Services verfügbar sind
        if (window.firebaseServices.auth && window.firebaseServices.db) {
            console.log('🔥 Firebase Auth und DB verfügbar');
        } else {
            console.warn('⚠️ Firebase Services nicht vollständig verfügbar:', {
                auth: !!window.firebaseServices.auth,
                db: !!window.firebaseServices.db,
                initialized: window.firebaseServices.initialized
            });
        }
        
        // Debug: Zeige Firebase-Status
        console.log('🔍 Firebase-Status nach Initialisierung:', {
            initialized: window.firebaseServices.initialized,
            auth: !!window.firebaseServices.auth,
            db: !!window.firebaseServices.db,
            offline: window.firebaseServices.offline
        });
        
        // Dispatch ready event sofort
        document.dispatchEvent(new CustomEvent('firebaseReady'));
        console.log('🚀 Firebase bereit für andere Module');
        
        return true;
        
    } catch (error) {
        console.error('❌ Fehler bei Firebase-Initialisierung:', error);
        
        // Erstelle Fallback-Services
        handleFirebaseInitError(error);
        return false;
    }
}

// Warten bis Firebase geladen ist
function waitForFirebase() {
    return new Promise((resolve, reject) => {
        // Prüfe alle 100ms ob Firebase verfügbar ist
        const checkInterval = setInterval(() => {
            if (typeof firebase !== 'undefined') {
                clearInterval(checkInterval);
                const success = initializeFirebase();
                if (success) {
                    resolve();
                } else {
                    reject(new Error('Firebase-Initialisierung fehlgeschlagen'));
                }
            }
        }, 100);
        
        // Timeout nach 3 Sekunden (weiter reduziert)
        setTimeout(() => {
            clearInterval(checkInterval);
            reject(new Error('Firebase-Loading-Timeout'));
        }, 3000);
    });
}

// Auto-Initialisierung wenn DOM geladen ist
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Wait a bit to avoid browser extension conflicts
        await new Promise(resolve => setTimeout(resolve, 100));
        
        await waitForFirebase();
        console.log('🚀 Firebase bereit für andere Module');
        
        // Event für andere Module
        document.dispatchEvent(new CustomEvent('firebaseReady'));
        
    } catch (error) {
        console.error('❌ Firebase-Setup fehlgeschlagen:', error);
        
        // Erweiterte Fehlerbehandlung
        handleFirebaseInitError(error);
        
        // Fehler-Event für andere Module
        document.dispatchEvent(new CustomEvent('firebaseError', { 
            detail: { error: error.message } 
        }));
    }
});

// Additional initialization with retry mechanism
window.addEventListener('load', async () => {
    // Retry Firebase initialization if not ready
    if (!window.firebaseServices?.initialized) {
        console.log('🔄 Retry Firebase initialization...');
        try {
            await waitForFirebase();
            console.log('🚀 Firebase Retry erfolgreich');
            document.dispatchEvent(new CustomEvent('firebaseReady'));
        } catch (error) {
            console.error('❌ Firebase Retry fehlgeschlagen:', error);
            
            // Stelle sicher, dass firebaseServices existiert, auch wenn Firebase fehlschlägt
            if (!window.firebaseServices) {
                console.log('🔧 Erstelle Fallback-Services nach Retry-Fehler');
                handleFirebaseInitError(error);
            }
            
            // Dispatch error event for other modules
            document.dispatchEvent(new CustomEvent('firebaseError', { 
                detail: { error: error.message }
            }));
        }
    }
});

// Erweiterte Firebase-Fehlerbehandlung
function handleFirebaseInitError(error) {
    console.warn('🔄 Starte Firebase-Fallback-Modus');
    
    // Prüfe ob bereits echte Firebase-Services existieren
    if (window.firebaseServices && !window.firebaseServices.offline) {
        console.log('🔧 Firebase bereits verfügbar, überspringe Fallback');
        return;
    }
    
    // Stelle sicher, dass firebaseServices existiert
    if (!window.firebaseServices) {
        console.log('🔧 Erstelle firebaseServices-Objekt');
        window.firebaseServices = {};
    }
    
    // Mock Firebase Services für Offline-Entwicklung (NUR wenn Firebase wirklich nicht verfügbar)
    window.firebaseServices = {
        auth: {
            signInWithEmailAndPassword: () => Promise.reject(new Error('Firebase nicht verfügbar')),
            signOut: () => Promise.resolve(),
            onAuthStateChanged: (callback) => {
                // NICHT automatisch ausloggen - lasse bestehenden Auth-Status
                console.log('⚠️ Firebase Auth nicht verfügbar, behalte bestehenden Auth-Status');
                return () => {}; // Unsubscribe function
            }
        },
        db: {
            collection: (collectionName) => {
                console.log('🔧 Mock Firestore collection:', collectionName);
                return {
                    doc: (docId) => ({
                        get: () => Promise.resolve({ exists: false }),
                        update: () => Promise.resolve(),
                        set: () => Promise.resolve()
                    }),
                    add: (data) => Promise.resolve({ id: 'mock-id-' + Date.now() }),
                    where: (field, operator, value) => {
                        console.log('🔧 Mock Firestore where:', field, operator, value);
                        return {
                            orderBy: (orderField, direction = 'desc') => {
                                console.log('🔧 Mock Firestore orderBy:', orderField, direction);
                                return {
                                    limit: (limitCount) => {
                                        console.log('🔧 Mock Firestore limit:', limitCount);
                                        return {
                                            get: () => {
                                                console.log('🔧 Mock Firestore query.get() - returning empty results');
                                                return Promise.resolve({ 
                                                    docs: [],
                                                    forEach: (callback) => {
                                                        // Empty forEach for mock
                                                    }
                                                });
                                            }
                                        };
                                    },
                                    get: () => {
                                        console.log('🔧 Mock Firestore query.get() - returning empty results');
                                        return Promise.resolve({ 
                                            docs: [],
                                            forEach: (callback) => {
                                                // Empty forEach for mock
                                            }
                                        });
                                    }
                                };
                            },
                            get: () => {
                                console.log('🔧 Mock Firestore query.get() - returning empty results');
                                return Promise.resolve({ 
                                    docs: [],
                                    forEach: (callback) => {
                                        // Empty forEach for mock
                                    }
                                });
                            }
                        };
                    }
                };
            }
        },
        serverTimestamp: () => new Date(),
        initialized: true,
        offline: true
    };
    
    console.log('🔧 Firebase-Fallback-Services aktiviert (ohne Auth-Änderung)');
    
    // Dispatch ready event auch im Fallback-Modus
    document.dispatchEvent(new CustomEvent('firebaseReady'));
}

// Hilfsfunktionen für andere Module
window.FirebaseConfig = {
    isReady: () => {
        const ready = window.firebaseServices?.initialized || false;
        console.log('🔍 FirebaseConfig.isReady():', ready, 'firebaseServices:', !!window.firebaseServices, 'auth:', !!window.firebaseServices?.auth, 'db:', !!window.firebaseServices?.db);
        
        // Wenn firebaseServices nicht existiert, erstelle Fallback
        if (!window.firebaseServices) {
            console.log('🔧 firebaseServices nicht gefunden, erstelle Fallback');
            handleFirebaseInitError(new Error('firebaseServices nicht gefunden'));
            return window.firebaseServices?.initialized || false;
        }
        
        return ready;
    },
    isOffline: () => window.firebaseServices?.offline || false,
    getAuth: () => window.firebaseServices?.auth || window.firebaseAuth,
    getDB: () => window.firebaseServices?.db || window.firebaseDB,
    getApp: () => window.firebaseServices?.app,
    getServerTimestamp: () => window.firebaseServices?.serverTimestamp(),
    
    // Warten bis Firebase bereit ist
    waitForReady: () => {
        return new Promise((resolve) => {
            if (window.firebaseServices?.initialized) {
                resolve();
            } else {
                document.addEventListener('firebaseReady', resolve, { once: true });
            }
        });
    },
    
    // Warten mit Timeout
    waitForReadyWithTimeout: (timeoutMs = 5000) => {
        return new Promise((resolve, reject) => {
            if (window.firebaseServices?.initialized) {
                resolve();
                return;
            }
            
            const timeout = setTimeout(() => {
                reject(new Error('Firebase-Initialisierung fehlgeschlagen'));
            }, timeoutMs);
            
            document.addEventListener('firebaseReady', () => {
                clearTimeout(timeout);
                resolve();
            }, { once: true });
        });
    }
};
