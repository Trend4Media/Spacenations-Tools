/**
 * Analytics Dashboard - Statistik-Anzeige für Admin Dashboard
 * Zeigt Seitenaufrufe, Herkunft, Geräte und weitere Metriken an
 */

class AnalyticsDashboard {
    constructor() {
        this.currentTimeRange = '7d';
        this.analyticsData = null;
        this.processedStats = null;
        this.isInitialized = false;
        this._containerId = null;
        
        this.init();
    }
    
    async init() {
        try {
            // Warten bis Firebase bereit ist
            await this.waitForFirebase();
            this.isInitialized = true;
            
            console.log('📊 Analytics Dashboard initialisiert');
            
        } catch (error) {
            console.error('❌ Analytics Dashboard Initialisierung fehlgeschlagen:', error);
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
            
            setTimeout(() => {
                clearInterval(checkInterval);
                reject(new Error('Firebase nicht verfügbar'));
            }, 10000);
        });
    }
    
    // Analytics-Daten laden
    async loadAnalyticsData(timeRange = '7d') {
        try {
            this.currentTimeRange = timeRange;
            
            if (window.AnalyticsAPI) {
                this.analyticsData = await window.AnalyticsAPI.getAnalyticsData(timeRange);
                if (window.AnalyticsAPI.processAnalyticsData && typeof window.AnalyticsAPI.processAnalyticsData === 'function') {
                    this.processedStats = window.AnalyticsAPI.processAnalyticsData(this.analyticsData);
                } else {
                    this.processedStats = this.processData(this.analyticsData);
                }
            } else {
                // Fallback: Direkt aus Firebase laden
                this.analyticsData = await this.loadDataFromFirebase(timeRange);
                this.processedStats = this.processData(this.analyticsData);
            }
            
            console.log('📊 Analytics-Daten geladen:', this.processedStats.overview);
            return this.processedStats;
            
        } catch (error) {
            console.error('❌ Fehler beim Laden der Analytics-Daten:', error);
            throw error;
        }
    }
    
    // Fallback: Direkt aus Firebase laden
    async loadDataFromFirebase(timeRange) {
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
        
        const [pageViewsSnapshot, sessionsSnapshot, eventsSnapshot] = await Promise.all([
            db.collection('analytics_pageViews')
                .where('timestamp', '>=', startDate)
                .orderBy('timestamp', 'desc')
                .get(),
            db.collection('analytics_sessions')
                .where('startTime', '>=', startDate)
                .orderBy('startTime', 'desc')
                .get(),
            db.collection('analytics_events')
                .where('timestamp', '>=', startDate)
                .orderBy('timestamp', 'desc')
                .get()
        ]);
        
        return {
            pageViews: pageViewsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
            sessions: sessionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
            events: eventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
            timeRange: timeRange,
            generatedAt: new Date()
        };
    }
    
    // Daten verarbeiten
    processData(data) {
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
    
    // Dashboard rendern
    renderDashboard(containerId) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error('❌ Container nicht gefunden:', containerId);
            return;
        }
        
        if (!this.processedStats) {
            container.innerHTML = '<div class="hint">Lade Analytics-Daten...</div>';
            return;
        }
        
        container.innerHTML = this.generateDashboardHTML();
        this.attachEventListeners();
    }
    
    // Dashboard HTML generieren
    generateDashboardHTML() {
        const stats = this.processedStats;
        
        return `
            <div class="analytics-dashboard">
                <!-- Zeitraum-Auswahl -->
                <div class="analytics-controls">
                    <div class="time-range-selector">
                        <label>Zeitraum:</label>
                        <select id="analytics-time-range">
                            <option value="1d" ${this.currentTimeRange === '1d' ? 'selected' : ''}>Letzte 24 Stunden</option>
                            <option value="7d" ${this.currentTimeRange === '7d' ? 'selected' : ''}>Letzte 7 Tage</option>
                            <option value="30d" ${this.currentTimeRange === '30d' ? 'selected' : ''}>Letzte 30 Tage</option>
                        </select>
                    </div>
                    <button class="btn primary" id="refresh-analytics">🔄 Aktualisieren</button>
                    <button class="btn" id="export-analytics">📊 Export</button>
                </div>
                
                <!-- Übersicht -->
                <div class="analytics-overview">
                    <h3>📊 Übersicht</h3>
                    <div class="stats-grid">
                        <div class="stat">
                            <div class="value">${stats.overview.totalPageViews}</div>
                            <div class="label">Seitenaufrufe</div>
                        </div>
                        <div class="stat">
                            <div class="value">${stats.overview.uniqueSessions}</div>
                            <div class="label">Sessions</div>
                        </div>
                        <div class="stat">
                            <div class="value">${stats.overview.uniqueUsers}</div>
                            <div class="label">Eindeutige Benutzer</div>
                        </div>
                        <div class="stat">
                            <div class="value">${stats.overview.averageSessionDuration}s</div>
                            <div class="label">Ø Session-Dauer</div>
                        </div>
                        <div class="stat">
                            <div class="value">${stats.overview.bounceRate}%</div>
                            <div class="label">Bounce Rate</div>
                        </div>
                    </div>
                </div>
                
                <!-- Top-Seiten -->
                <div class="analytics-section">
                    <h3>📄 Top-Seiten</h3>
                    <div class="analytics-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Seite</th>
                                    <th>Aufrufe</th>
                                    <th>Eindeutige Sessions</th>
                                    <th>Anteil</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${stats.topPages.map(page => `
                                    <tr>
                                        <td>${page.page}</td>
                                        <td>${page.views}</td>
                                        <td>${page.uniqueSessions}</td>
                                        <td>${Math.round((page.views / stats.overview.totalPageViews) * 100)}%</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <!-- Referrer -->
                <div class="analytics-section">
                    <h3>🔗 Herkunft</h3>
                    <div class="analytics-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Referrer</th>
                                    <th>Aufrufe</th>
                                    <th>Anteil</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${stats.topReferrers.map(ref => `
                                    <tr>
                                        <td>${ref.referrer === 'direct' ? 'Direkt' : ref.referrer}</td>
                                        <td>${ref.count}</td>
                                        <td>${Math.round((ref.count / stats.overview.totalPageViews) * 100)}%</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <!-- Geräte -->
                <div class="analytics-section">
                    <h3>📱 Geräte</h3>
                    <div class="analytics-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Gerätetyp</th>
                                    <th>Aufrufe</th>
                                    <th>Anteil</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${stats.topDevices.map(device => `
                                    <tr>
                                        <td>${device.device}</td>
                                        <td>${device.count}</td>
                                        <td>${Math.round((device.count / stats.overview.totalPageViews) * 100)}%</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <!-- Browser -->
                <div class="analytics-section">
                    <h3>🌐 Browser</h3>
                    <div class="analytics-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Browser</th>
                                    <th>Aufrufe</th>
                                    <th>Anteil</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${stats.topBrowsers.map(browser => `
                                    <tr>
                                        <td>${browser.browser}</td>
                                        <td>${browser.count}</td>
                                        <td>${Math.round((browser.count / stats.overview.totalPageViews) * 100)}%</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <!-- Zeitliche Verteilung -->
                <div class="analytics-section">
                    <h3>⏰ Zeitliche Verteilung</h3>
                    <div class="time-chart">
                        <div class="hint">Zeitliche Verteilung wird hier angezeigt</div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Event-Listener anhängen
    attachEventListeners() {
        // Zeitraum-Änderung
        const timeRangeSelect = document.getElementById('analytics-time-range');
        if (timeRangeSelect) {
            timeRangeSelect.addEventListener('change', async (e) => {
                await this.loadAnalyticsData(e.target.value);
                this.renderDashboard(this._containerId || 'analytics-content');
            });
        }
        
        // Aktualisieren
        const refreshBtn = document.getElementById('refresh-analytics');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', async () => {
                await this.loadAnalyticsData(this.currentTimeRange);
                this.renderDashboard(this._containerId || 'analytics-content');
            });
        }
        
        // Export
        const exportBtn = document.getElementById('export-analytics');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportAnalyticsData();
            });
        }
    }
    
    // Analytics-Daten exportieren
    exportAnalyticsData() {
        if (!this.processedStats) {
            alert('Keine Daten zum Exportieren verfügbar');
            return;
        }
        
        const stats = this.processedStats;
        const exportData = {
            timeRange: this.currentTimeRange,
            generatedAt: new Date().toISOString(),
            overview: stats.overview,
            topPages: stats.topPages,
            topReferrers: stats.topReferrers,
            topDevices: stats.topDevices,
            topBrowsers: stats.topBrowsers
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics_export_${this.currentTimeRange}_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
    
    // Dashboard initialisieren
    async initializeDashboard(containerId) {
        try {
            this._containerId = containerId;
            await this.loadAnalyticsData(this.currentTimeRange);
            this.renderDashboard(containerId);
        } catch (error) {
            console.error('❌ Fehler beim Initialisieren des Analytics-Dashboards:', error);
            const container = document.getElementById(containerId);
            if (container) {
                container.innerHTML = `
                    <div class="error">
                        <h3>❌ Fehler beim Laden der Analytics-Daten</h3>
                        <p>${error.message}</p>
                        <button class="btn primary" onclick="location.reload()">Seite neu laden</button>
                    </div>
                `;
            }
        }
    }
}

// Globale Instanz erstellen
window.analyticsDashboard = new AnalyticsDashboard();

// Globale API
window.AnalyticsDashboardAPI = {
    loadAnalyticsData: (timeRange) => window.analyticsDashboard.loadAnalyticsData(timeRange),
    renderDashboard: (containerId) => window.analyticsDashboard.renderDashboard(containerId),
    initializeDashboard: (containerId) => window.analyticsDashboard.initializeDashboard(containerId),
    exportAnalyticsData: () => window.analyticsDashboard.exportAnalyticsData()
};