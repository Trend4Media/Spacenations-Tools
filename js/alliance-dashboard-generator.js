/**
 * Allianz-Dashboard Generator
 * Erstellt individuelle Dashboards für jede Allianz
 */

(function() {
    'use strict';
    
    class AllianceDashboardGenerator {
        constructor() {
            this.templateUrl = 'alliance-dashboard-template.html';
        }
        
        async generateDashboard(allianceId, username) {
            try {
                console.log('🏰 Generiere individuelles Dashboard für Allianz:', allianceId);
                
                // Lade Allianz-Daten
                const allianceData = await this.loadAllianceData(allianceId);
                
                // Generiere individuelle URL
                const dashboardUrl = this.generateDashboardUrl(allianceId, username);
                
                // Erstelle individuelles Dashboard
                await this.createIndividualDashboard(allianceId, allianceData, username);
                
                console.log('✅ Individuelles Dashboard generiert:', dashboardUrl);
                return dashboardUrl;
                
            } catch (error) {
                console.error('❌ Fehler beim Generieren des Dashboards:', error);
                throw error;
            }
        }
        
        async loadAllianceData(allianceId) {
            try {
                console.log('🔍 Lade Allianz-Daten für ID:', allianceId);
                
                // Initialisiere Firebase
                await this.initializeFirebase();
                
                const db = window.FirebaseConfig.getDB();
                const allianceDoc = await db.collection('alliances').doc(allianceId).get();
                
                if (!allianceDoc.exists) {
                    throw new Error('Allianz nicht gefunden');
                }
                
                return {
                    id: allianceDoc.id,
                    ...allianceDoc.data()
                };
                
            } catch (error) {
                console.error('❌ Fehler beim Laden der Allianz-Daten:', error);
                throw error;
            }
        }
        
        async initializeFirebase() {
            try {
                if (typeof window.FirebaseConfig !== 'undefined' && window.FirebaseConfig.isReady()) {
                    return;
                }
                
                if (typeof firebase === 'undefined') {
                    throw new Error('Firebase-Scripts nicht geladen');
                }
                
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
                
                window.FirebaseConfig = {
                    isReady: () => true,
                    getAuth: () => firebase.auth(),
                    getDB: () => firebase.firestore(),
                    getServerTimestamp: () => firebase.firestore.FieldValue.serverTimestamp(),
                    waitForInit: () => Promise.resolve()
                };
                
            } catch (error) {
                console.error('❌ Firebase-Initialisierung fehlgeschlagen:', error);
                throw error;
            }
        }
        
        generateDashboardUrl(allianceId, username) {
            return `alliance-dashboard.html?id=${allianceId}&username=${encodeURIComponent(username)}`;
        }
        
        async createIndividualDashboard(allianceId, allianceData, username) {
            try {
                console.log('📝 Erstelle individuelles Dashboard...');
                
                // Lade Template
                const templateResponse = await fetch(this.templateUrl);
                if (!templateResponse.ok) {
                    throw new Error('Template konnte nicht geladen werden');
                }
                
                let template = await templateResponse.text();
                
                // Ersetze Platzhalter
                template = template.replace(/\{\{ALLIANCE_NAME\}\}/g, allianceData.name);
                template = template.replace(/\{\{ALLIANCE_TAG\}\}/g, allianceData.tag);
                template = template.replace(/\{\{USERNAME\}\}/g, username);
                template = template.replace(/\{\{USER_ROLE\}\}/g, 
                    (allianceData.admin === username || allianceData.founder === username) ? 'Admin' : 'Mitglied'
                );
                
                // Erstelle individuelle Datei
                const blob = new Blob([template], { type: 'text/html' });
                const url = URL.createObjectURL(blob);
                
                // Speichere URL für späteren Zugriff
                localStorage.setItem(`alliance-dashboard-${allianceId}`, url);
                
                console.log('✅ Individuelles Dashboard erstellt');
                return url;
                
            } catch (error) {
                console.error('❌ Fehler beim Erstellen des individuellen Dashboards:', error);
                throw error;
            }
        }
        
        getDashboardUrl(allianceId) {
            return localStorage.getItem(`alliance-dashboard-${allianceId}`);
        }
        
        async redirectToIndividualDashboard(allianceId, username) {
            try {
                console.log('🔄 Leite zu individuellem Dashboard weiter...');
                
                // Prüfe ob Dashboard bereits existiert
                let dashboardUrl = this.getDashboardUrl(allianceId);
                
                if (!dashboardUrl) {
                    // Generiere neues Dashboard
                    await this.generateDashboard(allianceId, username);
                    dashboardUrl = this.getDashboardUrl(allianceId);
                }
                
                if (dashboardUrl) {
                    // Verwende generierte URL
                    window.location.href = dashboardUrl;
                } else {
                    // Fallback: Verwende Template mit Parametern
                    const fallbackUrl = this.generateDashboardUrl(allianceId, username);
                    window.location.href = fallbackUrl;
                }
                
            } catch (error) {
                console.error('❌ Fehler beim Weiterleiten:', error);
                // Fallback: Verwende Template mit Parametern
                const fallbackUrl = this.generateDashboardUrl(allianceId, username);
                window.location.href = fallbackUrl;
            }
        }
    }
    
    // Globale Instanz erstellen
    window.AllianceDashboardGenerator = AllianceDashboardGenerator;
    
})();