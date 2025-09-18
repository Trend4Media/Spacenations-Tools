/**
 * Analytics Tracker - Erfasst Seitenaufrufe, Herkunft und Geräteinformationen
 * Integriert mit Firebase Firestore für Datenspeicherung
 */

class AnalyticsTracker {
    constructor() {
        this.sessionId = this.generateSessionId();
        this.startTime = Date.now();
        this.pageViews = [];
        this.isInitialized = false;
        this.firebaseReady = false;
        
        // Warten bis Firebase bereit ist
        this.init();
    }
    
    async init() {
        try {
            // Warten bis Firebase verfügbar ist
            await this.waitForFirebase();
            
            // Teste Firebase-Berechtigung
            await this.testFirebasePermissions();
            
            this.isInitialized = true;
            
            console.log('📊 Analytics Tracker initialisiert');
            
            // Erste Seitenaufruf erfassen
            this.trackPageView();
            
            // Event-Listener für Navigation
            this.setupEventListeners();
            
        } catch (error) {
            console.error('❌ Analytics Tracker Initialisierung fehlgeschlagen:', error);
            
            // Fallback: Lokaler Modus
            this.firebaseReady = false;
            this.isInitialized = true;
            console.warn('⚠️ Analytics läuft im lokalen Modus');
            
            // Erste Seitenaufruf erfassen (lokal)
            this.trackPageView();
            this.setupEventListeners();
        }
    }
    
    async waitForFirebase() {
        return new Promise((resolve, reject) => {
            if (window.FirebaseConfig && window.FirebaseConfig.isReady()) {
                resolve();
                return;
            }
            
            const checkInterval = setInterval(() => {
                if (window.FirebaseConfig && window.FirebaseConfig.isReady()) {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 100);
            
            // Timeout nach 10 Sekunden
            setTimeout(() => {
                clearInterval(checkInterval);
                reject(new Error('Firebase nicht verfügbar'));
            }, 10000);
        });
    }
    
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    // Teste Firebase-Berechtigungen
    async testFirebasePermissions() {
        try {
            const db = window.FirebaseConfig.getDB();
            
            // Prüfe ob es echte Firebase-Services sind
            if (window.FirebaseConfig.isOffline()) {
                console.warn('⚠️ Firebase im Offline-Modus - Analytics deaktiviert');
                this.firebaseReady = false;
                return;
            }
            
            // Teste Schreibberechtigung mit einem Test-Event
            await db.collection('analytics_events').add({
                type: 'permission_test',
                sessionId: this.sessionId,
                timestamp: window.FirebaseConfig.getServerTimestamp(),
                test: true
            });
            
            // Test erfolgreich - lösche Test-Event
            const testQuery = await db.collection('analytics_events')
                .where('sessionId', '==', this.sessionId)
                .where('type', '==', 'permission_test')
                .limit(1)
                .get();
            
            if (!testQuery.empty) {
                await testQuery.docs[0].ref.delete();
            }
            
            this.firebaseReady = true;
            console.log('✅ Firebase Analytics-Berechtigungen OK');
            
        } catch (error) {
            console.warn('⚠️ Firebase Analytics-Berechtigungen fehlen:', error);
            this.firebaseReady = false;
            throw error;
        }
    }
    
    // Seitenaufruf erfassen
    trackPageView(pagePath = null) {
        try {
            const pageData = {
                sessionId: this.sessionId,
                pagePath: pagePath || window.location.pathname,
                pageTitle: document.title,
                timestamp: new Date(),
                referrer: document.referrer || 'direct',
                userAgent: navigator.userAgent,
                screenResolution: `${screen.width}x${screen.height}`,
                viewportSize: `${window.innerWidth}x${window.innerHeight}`,
                language: navigator.language,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                isOnline: navigator.onLine,
                connectionType: this.getConnectionType(),
                deviceInfo: this.getDeviceInfo(),
                location: this.getLocationInfo(),
                utmParams: this.getUTMParameters(),
                userId: this.getCurrentUserId()
            };
            
            this.pageViews.push(pageData);
            
            // Sofort in Firebase speichern
            this.savePageView(pageData);
            
            console.log('📊 Seitenaufruf erfasst:', pageData.pagePath);
            
        } catch (error) {
            console.error('❌ Fehler beim Erfassen des Seitenaufrufs:', error);
        }
    }
    
    // Geräteinformationen extrahieren
    getDeviceInfo() {
        const userAgent = navigator.userAgent;
        
        return {
            isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent),
            isTablet: /iPad|Android(?=.*\bMobile\b)/i.test(userAgent),
            isDesktop: !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent),
            browser: this.getBrowserInfo(userAgent),
            os: this.getOSInfo(userAgent),
            deviceType: this.getDeviceType(userAgent)
        };
    }
    
    getBrowserInfo(userAgent) {
        if (userAgent.includes('Chrome')) return 'Chrome';
        if (userAgent.includes('Firefox')) return 'Firefox';
        if (userAgent.includes('Safari')) return 'Safari';
        if (userAgent.includes('Edge')) return 'Edge';
        if (userAgent.includes('Opera')) return 'Opera';
        return 'Unknown';
    }
    
    getOSInfo(userAgent) {
        if (userAgent.includes('Windows')) return 'Windows';
        if (userAgent.includes('Mac')) return 'macOS';
        if (userAgent.includes('Linux')) return 'Linux';
        if (userAgent.includes('Android')) return 'Android';
        if (userAgent.includes('iOS')) return 'iOS';
        return 'Unknown';
    }
    
    getDeviceType(userAgent) {
        if (/iPad/i.test(userAgent)) return 'Tablet';
        if (/Android.*Mobile/i.test(userAgent)) return 'Mobile';
        if (/iPhone/i.test(userAgent)) return 'Mobile';
        if (/Windows|Mac|Linux/i.test(userAgent)) return 'Desktop';
        return 'Unknown';
    }
    
    // Verbindungstyp ermitteln
    getConnectionType() {
        if (navigator.connection) {
            return {
                effectiveType: navigator.connection.effectiveType,
                downlink: navigator.connection.downlink,
                rtt: navigator.connection.rtt
            };
        }
        return null;
    }
    
    // Standort-Informationen (nur wenn erlaubt)
    getLocationInfo() {
        return {
            hasGeolocation: 'geolocation' in navigator,
            // Standort wird nur mit expliziter Erlaubnis abgerufen
            coordinates: null
        };
    }
    
    // UTM-Parameter extrahieren
    getUTMParameters() {
        const urlParams = new URLSearchParams(window.location.search);
        return {
            utm_source: urlParams.get('utm_source'),
            utm_medium: urlParams.get('utm_medium'),
            utm_campaign: urlParams.get('utm_campaign'),
            utm_term: urlParams.get('utm_term'),
            utm_content: urlParams.get('utm_content')
        };
    }
    
    // Aktuelle User-ID ermitteln
    getCurrentUserId() {
        if (window.AuthAPI && window.AuthAPI.getCurrentUser()) {
            return window.AuthAPI.getCurrentUser().uid;
        }
        return null;
    }
    
    // Seitenaufruf in Firebase speichern
    async savePageView(pageData) {
        if (!this.firebaseReady) {
            console.warn('⚠️ Firebase nicht bereit - Seitenaufruf wird nicht gespeichert');
            return;
        }
        
        try {
            const db = window.FirebaseConfig.getDB();
            
            // In pageViews Collection speichern
            await db.collection('analytics_pageViews').add({
                ...pageData,
                timestamp: window.FirebaseConfig.getServerTimestamp(),
                createdAt: window.FirebaseConfig.getServerTimestamp()
            });
            
            // Session-Daten aktualisieren
            await this.updateSessionData();
            
        } catch (error) {
            console.error('❌ Fehler beim Speichern des Seitenaufrufs:', error);
        }
    }
    
    // Session-Daten aktualisieren
    async updateSessionData() {
        try {
            const db = window.FirebaseConfig.getDB();
            const sessionRef = db.collection('analytics_sessions').doc(this.sessionId);
            
            const sessionData = {
                sessionId: this.sessionId,
                startTime: new Date(this.startTime),
                lastActivity: new Date(),
                pageViewCount: this.pageViews.length,
                userId: this.getCurrentUserId(),
                userAgent: navigator.userAgent,
                referrer: document.referrer || 'direct',
                deviceInfo: this.getDeviceInfo(),
                location: this.getLocationInfo(),
                utmParams: this.getUTMParameters(),
                isActive: true,
                updatedAt: window.FirebaseConfig.getServerTimestamp()
            };
            
            await sessionRef.set(sessionData, { merge: true });
            
        } catch (error) {
            console.error('❌ Fehler beim Aktualisieren der Session-Daten:', error);
        }
    }
    
    // Event-Listener einrichten
    setupEventListeners() {
        // Seitenaufruf bei Navigation erfassen
        window.addEventListener('popstate', () => {
            this.trackPageView();
        });
        
        // Session beenden bei Seitenverlassen
        window.addEventListener('beforeunload', () => {
            this.endSession();
        });
        
        // Online/Offline Status
        window.addEventListener('online', () => {
            this.trackEvent('connection', 'online');
        });
        
        window.addEventListener('offline', () => {
            this.trackEvent('connection', 'offline');
        });
        
        // Scroll-Tiefe erfassen
        let maxScrollDepth = 0;
        window.addEventListener('scroll', () => {
            const scrollDepth = Math.round((window.scrollY + window.innerHeight) / document.body.scrollHeight * 100);
            if (scrollDepth > maxScrollDepth) {
                maxScrollDepth = scrollDepth;
                this.trackEvent('scroll_depth', scrollDepth);
            }
        });
        
        // Zeit auf Seite erfassen
        setInterval(() => {
            const timeOnPage = Math.round((Date.now() - this.startTime) / 1000);
            this.trackEvent('time_on_page', timeOnPage);
        }, 30000); // Alle 30 Sekunden
    }
    
    // Event erfassen
    trackEvent(eventName, eventValue = null, eventData = {}) {
        try {
            const event = {
                sessionId: this.sessionId,
                eventName: eventName,
                eventValue: eventValue,
                eventData: eventData,
                timestamp: new Date(),
                pagePath: window.location.pathname,
                userId: this.getCurrentUserId()
            };
            
            if (this.firebaseReady) {
                this.saveEvent(event);
            } else {
                // Fallback: Event nur lokal speichern
                this.saveEventLocally(event);
            }
            
            console.log('📊 Event erfasst:', eventName, eventValue);
            
        } catch (error) {
            console.error('❌ Fehler beim Erfassen des Events:', error);
        }
    }
    
    // Event in Firebase speichern
    async saveEvent(event) {
        try {
            const db = window.FirebaseConfig.getDB();
            
            await db.collection('analytics_events').add({
                ...event,
                timestamp: window.FirebaseConfig.getServerTimestamp(),
                createdAt: window.FirebaseConfig.getServerTimestamp()
            });
            
        } catch (error) {
            console.error('❌ Fehler beim Speichern des Events:', error);
            
            // Bei Berechtigungsfehlern: Analytics deaktivieren
            if (error.code === 'permission-denied' || error.message.includes('permissions')) {
                console.warn('⚠️ Analytics deaktiviert - Berechtigungsfehler');
                this.firebaseReady = false;
                this.isInitialized = false;
                
                // Fallback: Events nur lokal speichern
                this.saveEventLocally(event);
            }
        }
    }
    
    // Lokales Event-Speichern als Fallback
    saveEventLocally(event) {
        try {
            const localEvents = JSON.parse(localStorage.getItem('analytics_events') || '[]');
            localEvents.push({
                ...event,
                timestamp: new Date().toISOString(),
                sessionId: this.sessionId,
                stored: 'locally'
            });
            
            // Nur die letzten 100 Events behalten
            if (localEvents.length > 100) {
                localEvents.splice(0, localEvents.length - 100);
            }
            
            localStorage.setItem('analytics_events', JSON.stringify(localEvents));
            console.log('📊 Event lokal gespeichert:', event.type);
            
        } catch (localError) {
            console.warn('⚠️ Lokales Event-Speichern fehlgeschlagen:', localError);
        }
    }
    
    // Session beenden
    async endSession() {
        try {
            if (!this.firebaseReady) return;
            
            const db = window.FirebaseConfig.getDB();
            const sessionRef = db.collection('analytics_sessions').doc(this.sessionId);
            
            await sessionRef.update({
                endTime: new Date(),
                duration: Date.now() - this.startTime,
                isActive: false,
                updatedAt: window.FirebaseConfig.getServerTimestamp()
            });
            
            console.log('📊 Session beendet');
            
        } catch (error) {
            console.error('❌ Fehler beim Beenden der Session:', error);
            
            // Bei Berechtigungsfehlern: Analytics deaktivieren
            if (error.code === 'permission-denied' || error.message.includes('permissions')) {
                console.warn('⚠️ Analytics deaktiviert - Session-Berechtigungsfehler');
                this.firebaseReady = false;
            }
        }
    }
    
    // Statistiken abrufen
    async getAnalyticsData(timeRange = '7d') {
        if (!this.firebaseReady) {
            throw new Error('Firebase nicht verfügbar');
        }
        
        try {
            const db = window.FirebaseConfig.getDB();
            const now = new Date();
            let startDate;
            
            switch (timeRange) {
                case '1d':
                    startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                    break;
                case '7d':
                    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    break;
                case '30d':
                    startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                    break;
                default:
                    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            }
            
            // Seitenaufrufe abrufen
            const pageViewsSnapshot = await db.collection('analytics_pageViews')
                .where('timestamp', '>=', startDate)
                .orderBy('timestamp', 'desc')
                .get();
            
            // Sessions abrufen
            const sessionsSnapshot = await db.collection('analytics_sessions')
                .where('startTime', '>=', startDate)
                .orderBy('startTime', 'desc')
                .get();
            
            // Events abrufen
            const eventsSnapshot = await db.collection('analytics_events')
                .where('timestamp', '>=', startDate)
                .orderBy('timestamp', 'desc')
                .get();
            
            return {
                pageViews: pageViewsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
                sessions: sessionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
                events: eventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
                timeRange: timeRange,
                generatedAt: new Date()
            };
            
        } catch (error) {
            console.error('❌ Fehler beim Abrufen der Analytics-Daten:', error);
            throw error;
        }
    }
    
    // Statistiken verarbeiten
    processAnalyticsData(data) {
        const stats = {
            overview: {
                totalPageViews: data.pageViews.length,
                uniqueSessions: data.sessions.length,
                uniqueUsers: new Set(data.sessions.map(s => s.userId).filter(Boolean)).size,
                averageSessionDuration: 0,
                bounceRate: 0
            },
            pages: {},
            referrers: {},
            devices: {},
            browsers: {},
            countries: {},
            timeDistribution: {},
            topPages: [],
            topReferrers: [],
            topDevices: [],
            topBrowsers: []
        };
        
        // Seitenaufrufe verarbeiten
        data.pageViews.forEach(pageView => {
            const page = pageView.pagePath;
            const referrer = pageView.referrer;
            const device = pageView.deviceInfo;
            const browser = pageView.browser;
            
            // Seiten-Statistiken
            if (!stats.pages[page]) {
                stats.pages[page] = { views: 0, uniqueSessions: new Set() };
            }
            stats.pages[page].views++;
            stats.pages[page].uniqueSessions.add(pageView.sessionId);
            
            // Referrer-Statistiken
            if (!stats.referrers[referrer]) {
                stats.referrers[referrer] = 0;
            }
            stats.referrers[referrer]++;
            
            // Geräte-Statistiken
            const deviceType = device.deviceType;
            if (!stats.devices[deviceType]) {
                stats.devices[deviceType] = 0;
            }
            stats.devices[deviceType]++;
            
            // Browser-Statistiken
            if (!stats.browsers[browser]) {
                stats.browsers[browser] = 0;
            }
            stats.browsers[browser]++;
        });
        
        // Sessions verarbeiten
        let totalDuration = 0;
        let singlePageSessions = 0;
        
        data.sessions.forEach(session => {
            if (session.duration) {
                totalDuration += session.duration;
            }
            if (session.pageViewCount === 1) {
                singlePageSessions++;
            }
        });
        
        stats.overview.averageSessionDuration = data.sessions.length > 0 ? 
            Math.round(totalDuration / data.sessions.length / 1000) : 0;
        stats.overview.bounceRate = data.sessions.length > 0 ? 
            Math.round((singlePageSessions / data.sessions.length) * 100) : 0;
        
        // Top-Listen erstellen
        stats.topPages = Object.entries(stats.pages)
            .map(([page, data]) => ({ page, views: data.views, uniqueSessions: data.uniqueSessions.size }))
            .sort((a, b) => b.views - a.views)
            .slice(0, 10);
        
        stats.topReferrers = Object.entries(stats.referrers)
            .map(([referrer, count]) => ({ referrer, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
        
        stats.topDevices = Object.entries(stats.devices)
            .map(([device, count]) => ({ device, count }))
            .sort((a, b) => b.count - a.count);
        
        stats.topBrowsers = Object.entries(stats.browsers)
            .map(([browser, count]) => ({ browser, count }))
            .sort((a, b) => b.count - a.count);
        
        return stats;
    }
}

// Globale Instanz erstellen
window.analyticsTracker = new AnalyticsTracker();

// Globale API
window.AnalyticsAPI = {
    trackPageView: (pagePath) => window.analyticsTracker.trackPageView(pagePath),
    trackEvent: (eventName, eventValue, eventData) => window.analyticsTracker.trackEvent(eventName, eventValue, eventData),
    getAnalyticsData: (timeRange) => window.analyticsTracker.getAnalyticsData(timeRange),
    processAnalyticsData: (data) => window.analyticsTracker.processAnalyticsData(data)
};