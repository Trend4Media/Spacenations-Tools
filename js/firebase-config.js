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

// Firebase initialisieren
function initializeFirebase() {
    try {
        checkFirebaseAvailability();
        
        // Ihre Firebase-Konfiguration
        const firebaseConfig = {
            apiKey: "AIzaSyDr4-ap_EubUn0UdP7hkEpS2jkzLIVgvyc",
            authDomain: "spacenations-tools.firebaseapp.com",
            projectId: "spacenations-tools",
            storageBucket: "spacenations-tools.firebasestorage.app",
            messagingSenderId: "651338201276",
            appId: "1:651338201276:web:89e7d9c19dbd2611d3f8b9",
            measurementId: "G-SKWJWH2ERX"
        };

        // Firebase initialisieren (nur einmal)
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
            console.log('🔥 Firebase erfolgreich initialisiert');
        } else {
            console.log('🔥 Firebase bereits initialisiert');
        }
        
        // Globale Firebase-Services erstellen
        window.firebaseServices = {
            auth: firebase.auth(),
            db: firebase.firestore(),
            serverTimestamp: firebase.firestore.FieldValue.serverTimestamp,
            initialized: true
        };
        
        console.log('✅ Firebase Services verfügbar');
        return true;
        
    } catch (error) {
        console.error('❌ Fehler bei Firebase-Initialisierung:', error);
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
        
        // Timeout nach 10 Sekunden
        setTimeout(() => {
            clearInterval(checkInterval);
            reject(new Error('Firebase-Loading-Timeout'));
        }, 10000);
    });
}

// Auto-Initialisierung wenn DOM geladen ist
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await waitForFirebase();
        console.log('🚀 Firebase bereit für andere Module');
        
        // Event für andere Module
        document.dispatchEvent(new CustomEvent('firebaseReady'));
        
    } catch (error) {
        console.error('❌ Firebase-Setup fehlgeschlagen:', error);
        
        // Fehler-Event für andere Module
        document.dispatchEvent(new CustomEvent('firebaseError', { 
            detail: { error: error.message } 
        }));
    }
});

// Hilfsfunktionen für andere Module
window.FirebaseConfig = {
    isReady: () => window.firebaseServices?.initialized || false,
    getAuth: () => window.firebaseServices?.auth,
    getDB: () => window.firebaseServices?.db,
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
    }
};
