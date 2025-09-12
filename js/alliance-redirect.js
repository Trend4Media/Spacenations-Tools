/**
 * Allianz-Redirect System
 * Leitet User zum korrekten individuellen Allianz-Dashboard weiter
 */

(function() {
    'use strict';
    
    class AllianceRedirectManager {
        constructor() {
            this.currentUsername = null;
            this.userAlliance = null;
        }
        
        async initialize() {
            try {
                console.log('🚀 Initialisiere Allianz-Redirect-System...');
                
                // Lade aktuellen Benutzernamen
                this.currentUsername = this.getCurrentUsername();
                if (!this.currentUsername) {
                    console.error('❌ Kein Benutzername gefunden');
                    this.redirectToLogin();
                    return;
                }
                
                console.log('👤 Benutzername:', this.currentUsername);
                
                // Initialisiere Firebase
                await this.initializeFirebase();
                
                // Lade User-Allianz
                await this.loadUserAlliance();
                
                // Prüfe ob User einer Allianz angehört
                if (this.userAlliance) {
                    console.log('🏰 User gehört zu Allianz:', this.userAlliance.name);
                    this.redirectToAllianceDashboard();
                } else {
                    console.log('❌ User gehört keiner Allianz an');
                    this.redirectToUserDashboard();
                }
                
            } catch (error) {
                console.error('❌ Fehler beim Initialisieren des Allianz-Redirect-Systems:', error);
                this.redirectToUserDashboard();
            }
        }
        
        getCurrentUsername() {
            // Methode 1: Aus URL-Parameter
            const urlParams = new URLSearchParams(window.location.search);
            const usernameFromUrl = urlParams.get('username');
            if (usernameFromUrl) {
                return usernameFromUrl;
            }
            
            // Methode 2: Aus localStorage
            const usernameFromStorage = localStorage.getItem('currentUsername');
            if (usernameFromStorage) {
                return usernameFromStorage;
            }
            
            // Methode 3: Aus sessionStorage
            const usernameFromSession = sessionStorage.getItem('currentUsername');
            if (usernameFromSession) {
                return usernameFromSession;
            }
            
            // Methode 4: Aus URL-String extrahieren
            const url = window.location.href;
            const usernameMatch = url.match(/[?&]username=([^&]+)/);
            if (usernameMatch) {
                return decodeURIComponent(usernameMatch[1]);
            }
            
            return null;
        }
        
        async initializeFirebase() {
            try {
                console.log('🔥 Initialisiere Firebase...');
                
                // Prüfe ob Firebase bereits initialisiert ist
                if (typeof window.FirebaseConfig !== 'undefined' && window.FirebaseConfig.isReady()) {
                    console.log('✅ Firebase bereits initialisiert');
                    return;
                }
                
                // Prüfe ob Firebase verfügbar ist
                if (typeof firebase === 'undefined') {
                    throw new Error('Firebase-Scripts nicht geladen');
                }
                
                // Initialisiere Firebase
                const firebaseConfig = {
                    apiKey: 'AIzaSyDr4-ap_EubUn0UdP7hkEpS2jkzLIVgvyc',
                    authDomain: 'spacenations-tools.firebaseapp.com',
                    projectId: 'spacenations-tools',
                    storageBucket: 'spacenations-tools.firebasestorage.app',
                    messagingSenderId: '651338201276',
                    appId: '1:651338201276:web:89e7d9c19dbd2611d3f8b9',
                    measurementId: 'G-SKWJWH2ERX'
                };
                
                if (!firebase.apps.length) {
                    firebase.initializeApp(firebaseConfig);
                }
                
                // Teste die Verbindung
                const db = firebase.firestore();
                await db.collection('_test').doc('connection').set({
                    test: true,
                    timestamp: new Date()
                });
                await db.collection('_test').doc('connection').delete();
                
                // Erstelle FirebaseConfig Mock
                window.FirebaseConfig = {
                    isReady: () => true,
                    getAuth: () => firebase.auth(),
                    getDB: () => firebase.firestore(),
                    getServerTimestamp: () => firebase.firestore.FieldValue.serverTimestamp(),
                    waitForInit: () => Promise.resolve()
                };
                
                console.log('✅ Firebase erfolgreich initialisiert');
                
            } catch (error) {
                console.error('❌ Firebase-Initialisierung fehlgeschlagen:', error);
                throw error;
            }
        }
        
        async loadUserAlliance() {
            try {
                console.log('🔍 Lade User-Allianz...');
                
                const db = window.FirebaseConfig.getDB();
                
                // Suche nach Allianzen, in denen der User Mitglied ist
                const userAlliancesQuery = await db.collection('alliances')
                    .where('members', 'array-contains', this.currentUsername)
                    .get();
                
                console.log('📊 Gefundene Allianzen als Mitglied:', userAlliancesQuery.size);
                
                if (!userAlliancesQuery.empty) {
                    const allianceDoc = userAlliancesQuery.docs[0];
                    this.userAlliance = {
                        id: allianceDoc.id,
                        ...allianceDoc.data()
                    };
                    console.log('✅ User-Allianz gefunden:', this.userAlliance.name);
                    return;
                }
                
                // Prüfe ob User eine Allianz erstellt hat (als Gründer)
                const createdAlliancesQuery = await db.collection('alliances')
                    .where('founder', '==', this.currentUsername)
                    .get();
                
                console.log('📊 Gefundene erstellte Allianzen:', createdAlliancesQuery.size);
                
                if (!createdAlliancesQuery.empty) {
                    const allianceDoc = createdAlliancesQuery.docs[0];
                    this.userAlliance = {
                        id: allianceDoc.id,
                        ...allianceDoc.data()
                    };
                    console.log('✅ Erstellte Allianz gefunden:', this.userAlliance.name);
                    return;
                }
                
                console.log('❌ Keine Allianz gefunden');
                
            } catch (error) {
                console.error('❌ Fehler beim Laden der User-Allianz:', error);
                throw error;
            }
        }
        
        redirectToAllianceDashboard() {
            if (!this.userAlliance) {
                console.error('❌ Keine Allianz-Daten für Redirect');
                this.redirectToUserDashboard();
                return;
            }
            
            // Prüfe ob Allianz genehmigt ist
            if (this.userAlliance.status !== 'approved') {
                console.log('⚠️ Allianz nicht genehmigt, Status:', this.userAlliance.status);
                this.redirectToUserDashboard();
                return;
            }
            
            // Erstelle individuelle Allianz-Dashboard URL
            const allianceTag = this.userAlliance.tag || this.userAlliance.id;
            const dashboardUrl = `alliance-dashboard.html?alliance=${allianceTag}&username=${this.currentUsername}`;
            
            console.log('🔄 Leite weiter zu individuellem Allianz-Dashboard:', dashboardUrl);
            
            // Speichere Allianz-Daten für das Dashboard
            localStorage.setItem('currentAlliance', JSON.stringify(this.userAlliance));
            localStorage.setItem('currentUsername', this.currentUsername);
            
            // Weiterleitung
            window.location.href = dashboardUrl;
        }
        
        redirectToUserDashboard() {
            const userDashboardUrl = `user-dashboard.html?username=${this.currentUsername}`;
            console.log('🔄 Leite zurück zum User-Dashboard:', userDashboardUrl);
            window.location.href = userDashboardUrl;
        }
        
        redirectToLogin() {
            console.log('🔄 Leite zur Anmeldung weiter');
            window.location.href = 'index.html';
        }
    }
    
    // Globale Instanz erstellen
    window.AllianceRedirectManager = AllianceRedirectManager;
    
    // Auto-Start wenn das Script geladen wird
    document.addEventListener('DOMContentLoaded', () => {
        const redirectManager = new AllianceRedirectManager();
        redirectManager.initialize();
    });
    
})();