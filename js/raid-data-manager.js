/**
 * Raid Data Manager - Verwaltet alle Raid-Daten für eingeloggte User
 * Abhängigkeiten: firebase-config.js, auth-manager.js
 */

class RaidDataManager {
    constructor() {
        this.currentUser = null;
        this.raidHistory = [];
        this.statistics = {
            totalRaids: 0,
            successfulRaids: 0,
            totalLoot: 0,
            averageLoot: 0,
            totalResourcesGathered: {
                iron: 0,
                silicon: 0,
                carbon: 0,
                water: 0,
                oxygen: 0,
                hydrogen: 0
            },
            bestRaid: {
                loot: 0,
                date: null,
                resources: {}
            },
            raidingStreak: 0,
            lastRaidDate: null
        };
        
        this.init();
    }
    
    async init() {
        try {
            // Warten bis Firebase bereit ist
            await window.FirebaseConfig.waitForReady();
            
            // Warten bis AuthManager bereit ist
            await window.AuthAPI.waitForInit();
            
            this.db = window.FirebaseConfig.getDB();
            
            // Auth State überwachen
            window.AuthAPI.onAuthStateChange((user, userData) => {
                this.currentUser = user;
                if (user) {
                    this.loadUserRaidData();
                }
            });
            
            console.log('🏴‍☠️ RaidDataManager initialisiert');
            
        } catch (error) {
            console.error('❌ RaidDataManager-Initialisierung fehlgeschlagen:', error);
        }
    }
    
    // Raid-Daten laden
    async loadUserRaidData() {
        try {
            if (!this.currentUser) return;
            
            console.log('🏴‍☠️ Lade Raid-Daten für User:', this.currentUser.uid);
            
            // Raid-Historie laden
            const raidsQuery = await this.db.collection('userRaids')
                .where('userId', '==', this.currentUser.uid)
                .orderBy('timestamp', 'desc')
                .limit(100) // Letzte 100 Raids
                .get();
            
            this.raidHistory = [];
            raidsQuery.forEach(doc => {
                this.raidHistory.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            // Statistiken neu berechnen
            this.calculateStatistics();
            
            console.log('✅ Raid-Daten geladen:', this.raidHistory.length, 'Raids');
            
        } catch (error) {
            console.error('❌ Fehler beim Laden der Raid-Daten:', error);
        }
    }
    
    // Neuen Raid speichern
    async saveRaid(raidData) {
        try {
            if (!this.currentUser) {
                console.warn('⚠️ Kein User eingeloggt - Raid wird nicht gespeichert');
                return null;
            }
            
            const raidDoc = {
                userId: this.currentUser.uid,
                timestamp: window.FirebaseConfig.getServerTimestamp(),
                ...raidData
            };
            
            // In Firestore speichern
            const docRef = await this.db.collection('userRaids').add(raidDoc);
            
            // Zur lokalen Historie hinzufügen
            this.raidHistory.unshift({
                id: docRef.id,
                ...raidDoc
            });
            
            // Statistiken aktualisieren
            this.calculateStatistics();
            
            // Dashboard-Statistiken aktualisieren
            await this.updateDashboardStats();
            
            // Aktivität hinzufügen
            const lootAmount = raidData.totalLoot || 0;
            const raidCount = raidData.raidCount || 1;
            await window.AuthAPI.addActivity('🏴‍☠️', `${raidCount} Raid${raidCount > 1 ? 's' : ''} durchgeführt (${this.formatNumber(lootAmount)} Beute)`);
            
            console.log('✅ Raid gespeichert:', docRef.id);
            return docRef.id;
            
        } catch (error) {
            console.error('❌ Fehler beim Speichern des Raids:', error);
            return null;
        }
    }
    
    // Statistiken berechnen
    calculateStatistics() {
        // Basis-Statistiken
        this.statistics.totalRaids = this.raidHistory.reduce((sum, r) => sum + (r.raidCount || 1), 0);
        this.statistics.successfulRaids = this.raidHistory.reduce((sum, r) => sum + (r.successfulRaids || 0), 0);
        this.statistics.totalLoot = this.raidHistory.reduce((sum, r) => sum + (r.totalLoot || 0), 0);
        
        // Durchschnittliche Beute
        this.statistics.averageLoot = this.statistics.totalRaids > 0 
            ? Math.round(this.statistics.totalLoot / this.statistics.totalRaids)
            : 0;
        
        // Gesammelte Rohstoffe
        this.statistics.totalResourcesGathered = {
            iron: this.raidHistory.reduce((sum, r) => sum + (r.resources?.iron || 0), 0),
            silicon: this.raidHistory.reduce((sum, r) => sum + (r.resources?.silicon || 0), 0),
            carbon: this.raidHistory.reduce((sum, r) => sum + (r.resources?.carbon || 0), 0),
            water: this.raidHistory.reduce((sum, r) => sum + (r.resources?.water || 0), 0),
            oxygen: this.raidHistory.reduce((sum, r) => sum + (r.resources?.oxygen || 0), 0),
            hydrogen: this.raidHistory.reduce((sum, r) => sum + (r.resources?.hydrogen || 0), 0)
        };
        
        // Bester Raid finden
        if (this.raidHistory.length > 0) {
            const bestRaid = this.raidHistory.reduce((best, current) => {
                return (current.totalLoot || 0) > (best.totalLoot || 0) ? current : best;
            });
            
            this.statistics.bestRaid = {
                loot: bestRaid.totalLoot || 0,
                date: bestRaid.timestamp?.toDate ? bestRaid.timestamp.toDate() : new Date(bestRaid.timestamp),
                resources: bestRaid.resources || {}
            };
        }
        
        // Raid-Streak berechnen
        this.calculateRaidingStreak();
        
        console.log('📈 Raid-Statistiken aktualisiert:', this.statistics);
    }
    
    // Raid-Streak berechnen (aufeinanderfolgende Tage mit Raids)
    calculateRaidingStreak() {
        if (this.raidHistory.length === 0) {
            this.statistics.raidingStreak = 0;
            this.statistics.lastRaidDate = null;
            return;
        }
        
        // Sortiere Raids nach Datum
        const sortedRaids = [...this.raidHistory].sort((a, b) => {
            const dateA = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
            const dateB = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp);
            return dateB - dateA;
        });
        
        const latestRaid = sortedRaids[0];
        this.statistics.lastRaidDate = latestRaid.timestamp?.toDate ? latestRaid.timestamp.toDate() : new Date(latestRaid.timestamp);
        
        // Berechne Streak (vereinfacht - aufeinanderfolgende Raids)
        let streak = 1;
        for (let i = 1; i < Math.min(sortedRaids.length, 30); i++) {
            const currentDate = sortedRaids[i].timestamp?.toDate ? sortedRaids[i].timestamp.toDate() : new Date(sortedRaids[i].timestamp);
            const previousDate = sortedRaids[i-1].timestamp?.toDate ? sortedRaids[i-1].timestamp.toDate() : new Date(sortedRaids[i-1].timestamp);
            
            const daysDiff = Math.floor((previousDate - currentDate) / (1000 * 60 * 60 * 24));
            
            if (daysDiff <= 2) { // Innerhalb von 2 Tagen = Streak fortsetzt
                streak++;
            } else {
                break;
            }
        }
        
        this.statistics.raidingStreak = streak;
    }
    
    // Dashboard-Statistiken in Firestore aktualisieren
    async updateDashboardStats() {
        try {
            if (!this.currentUser) return;
            
            const statsRef = this.db.collection('userStats').doc(this.currentUser.uid);
            
            await statsRef.set({
                raids: this.statistics.totalRaids,
                successfulRaids: this.statistics.successfulRaids,
                totalLoot: this.statistics.totalLoot,
                averageLoot: this.statistics.averageLoot,
                raidingStreak: this.statistics.raidingStreak,
                lastRaidUpdate: window.FirebaseConfig.getServerTimestamp()
            }, { merge: true });
            
            console.log('📊 Dashboard-Raid-Statistiken aktualisiert');
            
        } catch (error) {
            console.error('❌ Fehler beim Aktualisieren der Dashboard-Statistiken:', error);
        }
    }
    
    // Raid-Historie mit Filter
    getRaidHistory(filter = {}) {
        let filteredHistory = [...this.raidHistory];
        
        // Nach Beute-Mindestmenge filtern
        if (filter.minLoot) {
            filteredHistory = filteredHistory.filter(r => (r.totalLoot || 0) >= filter.minLoot);
        }
        
        // Nach Rohstoff-Typ filtern
        if (filter.resourceType) {
            filteredHistory = filteredHistory.filter(r => {
                return r.resources && r.resources[filter.resourceType] > 0;
            });
        }
        
        // Nach Datum filtern
        if (filter.dateFrom) {
            const fromDate = new Date(filter.dateFrom);
            filteredHistory = filteredHistory.filter(r => {
                const raidDate = r.timestamp?.toDate ? r.timestamp.toDate() : new Date(r.timestamp);
                return raidDate >= fromDate;
            });
        }
        
        // Nach Raid-Anzahl filtern
        if (filter.minRaidCount) {
            filteredHistory = filteredHistory.filter(r => (r.raidCount || 1) >= filter.minRaidCount);
        }
        
        // Limitieren
        if (filter.limit) {
            filteredHistory = filteredHistory.slice(0, filter.limit);
        }
        
        return filteredHistory;
    }
    
    // Detaillierte Statistiken für Zeitraum
    getStatisticsForPeriod(days = 30) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        
        const recentRaids = this.raidHistory.filter(raid => {
            const raidDate = raid.timestamp?.toDate ? raid.timestamp.toDate() : new Date(raid.timestamp);
            return raidDate >= cutoffDate;
        });
        
        const stats = {
            period: `${days} Tage`,
            totalRaids: recentRaids.reduce((sum, r) => sum + (r.raidCount || 1), 0),
            successfulRaids: recentRaids.reduce((sum, r) => sum + (r.successfulRaids || 0), 0),
            totalLoot: recentRaids.reduce((sum, r) => sum + (r.totalLoot || 0), 0),
            averageLoot: 0,
            bestDay: { date: null, loot: 0 },
            resourceBreakdown: {
                iron: recentRaids.reduce((sum, r) => sum + (r.resources?.iron || 0), 0),
                silicon: recentRaids.reduce((sum, r) => sum + (r.resources?.silicon || 0), 0),
                carbon: recentRaids.reduce((sum, r) => sum + (r.resources?.carbon || 0), 0),
                water: recentRaids.reduce((sum, r) => sum + (r.resources?.water || 0), 0),
                oxygen: recentRaids.reduce((sum, r) => sum + (r.resources?.oxygen || 0), 0),
                hydrogen: recentRaids.reduce((sum, r) => sum + (r.resources?.hydrogen || 0), 0)
            }
        };
        
        if (stats.totalRaids > 0) {
            stats.averageLoot = Math.round(stats.totalLoot / stats.totalRaids);
        }
        
        // Besten Tag finden
        const dailyLoot = {};
        recentRaids.forEach(raid => {
            const raidDate = raid.timestamp?.toDate ? raid.timestamp.toDate() : new Date(raid.timestamp);
            const dateKey = raidDate.toDateString();
            dailyLoot[dateKey] = (dailyLoot[dateKey] || 0) + (raid.totalLoot || 0);
        });
        
        for (const [date, loot] of Object.entries(dailyLoot)) {
            if (loot > stats.bestDay.loot) {
                stats.bestDay = { date: new Date(date), loot };
            }
        }
        
        return stats;
    }
    
    // Raid-Effizienz berechnen
    getRaidEfficiency() {
        if (this.statistics.totalRaids === 0) return 0;
        
        const successRate = (this.statistics.successfulRaids / this.statistics.totalRaids) * 100;
        const lootPerRaid = this.statistics.averageLoot;
        
        // Effizienz-Score (0-100)
        const efficiencyScore = Math.min(100, Math.round(
            (successRate * 0.6) + // 60% Gewichtung für Erfolgsrate
            (Math.min(100, lootPerRaid / 1000) * 0.4) // 40% Gewichtung für Beute
        ));
        
        return {
            score: efficiencyScore,
            successRate: Math.round(successRate),
            averageLoot: lootPerRaid,
            rating: this.getEfficiencyRating(efficiencyScore)
        };
    }
    
    // Effizienz-Rating
    getEfficiencyRating(score) {
        if (score >= 90) return { text: 'Legendär', emoji: '🏆', color: '#ffd700' };
        if (score >= 80) return { text: 'Exzellent', emoji: '⭐', color: '#ff8c42' };
        if (score >= 70) return { text: 'Sehr gut', emoji: '🔥', color: '#27ae60' };
        if (score >= 60) return { text: 'Gut', emoji: '👍', color: '#3498db' };
        if (score >= 50) return { text: 'Durchschnittlich', emoji: '📈', color: '#f39c12' };
        return { text: 'Verbesserungsbedarf', emoji: '📚', color: '#e74c3c' };
    }
    
    // Raid löschen
    async deleteRaid(raidId) {
        try {
            if (!this.currentUser) return false;
            
            // Aus Firestore löschen
            await this.db.collection('userRaids').doc(raidId).delete();
            
            // Aus lokaler Historie entfernen
            this.raidHistory = this.raidHistory.filter(r => r.id !== raidId);
            
            // Statistiken neu berechnen
            this.calculateStatistics();
            
            // Dashboard-Statistiken aktualisieren
            await this.updateDashboardStats();
            
            console.log('✅ Raid gelöscht:', raidId);
            return true;
            
        } catch (error) {
            console.error('❌ Fehler beim Löschen des Raids:', error);
            return false;
        }
    }
    
    // Alle Raid-Daten exportieren
    exportRaidData() {
        const exportData = {
            user: this.currentUser?.email,
            exportDate: new Date().toISOString(),
            statistics: this.statistics,
            efficiency: this.getRaidEfficiency(),
            raidHistory: this.raidHistory.map(raid => ({
                date: raid.timestamp?.toDate ? raid.timestamp.toDate().toISOString() : raid.timestamp,
                raidCount: raid.raidCount,
                successfulRaids: raid.successfulRaids,
                totalLoot: raid.totalLoot,
                averageLoot: raid.averageLoot,
                resources: raid.resources,
                raidType: raid.raidType
            }))
        };
        
        return JSON.stringify(exportData, null, 2);
    }
    
    // Raid-Daten importieren (aus Export)
    async importRaidData(jsonData) {
        try {
            const importData = JSON.parse(jsonData);
            
            if (!importData.raidHistory || !Array.isArray(importData.raidHistory)) {
                throw new Error('Ungültiges Import-Format');
            }
            
            let importedCount = 0;
            
            for (const raidData of importData.raidHistory) {
                const raidDoc = {
                    userId: this.currentUser.uid,
                    timestamp: window.FirebaseConfig.getServerTimestamp(),
                    raidCount: raidData.raidCount || 1,
                    successfulRaids: raidData.successfulRaids || 0,
                    totalLoot: raidData.totalLoot || 0,
                    averageLoot: raidData.averageLoot || 0,
                    resources: raidData.resources || {},
                    raidType: raidData.raidType || 'imported',
                    isImported: true,
                    originalDate: raidData.date
                };
                
                await this.db.collection('userRaids').add(raidDoc);
                importedCount++;
            }
            
            // Daten neu laden
            await this.loadUserRaidData();
            
            console.log('✅ Raid-Daten importiert:', importedCount, 'Raids');
            return { success: true, count: importedCount };
            
        } catch (error) {
            console.error('❌ Fehler beim Importieren der Raid-Daten:', error);
            return { success: false, error: error.message };
        }
    }
    
    // Raid-Trends analysieren
    getRaidTrends(days = 30) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        
        const recentRaids = this.raidHistory.filter(raid => {
            const raidDate = raid.timestamp?.toDate ? raid.timestamp.toDate() : new Date(raid.timestamp);
            return raidDate >= cutoffDate;
        });
        
        // Tägliche Daten sammeln
        const dailyData = {};
        recentRaids.forEach(raid => {
            const raidDate = raid.timestamp?.toDate ? raid.timestamp.toDate() : new Date(raid.timestamp);
            const dateKey = raidDate.toISOString().split('T')[0];
            
            if (!dailyData[dateKey]) {
                dailyData[dateKey] = {
                    date: dateKey,
                    raids: 0,
                    loot: 0,
                    successfulRaids: 0
                };
            }
            
            dailyData[dateKey].raids += raid.raidCount || 1;
            dailyData[dateKey].loot += raid.totalLoot || 0;
            dailyData[dateKey].successfulRaids += raid.successfulRaids || 0;
        });
        
        const trendData = Object.values(dailyData).sort((a, b) => a.date.localeCompare(b.date));
        
        // Trend-Berechnung
        const trends = {
            raidFrequency: this.calculateTrend(trendData.map(d => d.raids)),
            lootTrend: this.calculateTrend(trendData.map(d => d.loot)),
            successTrend: this.calculateTrend(trendData.map(d => d.successfulRaids)),
            dailyData: trendData
        };
        
        return trends;
    }
    
    // Trend-Berechnung (einfache lineare Regression)
    calculateTrend(values) {
        if (values.length < 2) return { direction: 'stable', percentage: 0 };
        
        const n = values.length;
        const x = Array.from({length: n}, (_, i) => i);
        const y = values;
        
        const sumX = x.reduce((a, b) => a + b, 0);
        const sumY = y.reduce((a, b) => a + b, 0);
        const sumXY = x.map((xi, i) => xi * y[i]).reduce((a, b) => a + b, 0);
        const sumXX = x.map(xi => xi * xi).reduce((a, b) => a + b, 0);
        
        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const avgY = sumY / n;
        
        const percentage = avgY > 0 ? Math.round((slope / avgY) * 100) : 0;
        
        let direction = 'stable';
        if (percentage > 5) direction = 'increasing';
        else if (percentage < -5) direction = 'decreasing';
        
        return { direction, percentage, slope };
    }
    
    // Raid-Empfehlungen basierend auf Daten
    getRaidRecommendations() {
        const efficiency = this.getRaidEfficiency();
        const trends = this.getRaidTrends(14); // 2 Wochen
        const recentStats = this.getStatisticsForPeriod(7); // 1 Woche
        
        const recommendations = [];
        
        // Effizienz-basierte Empfehlungen
        if (efficiency.successRate < 70) {
            recommendations.push({
                type: 'efficiency',
                priority: 'high',
                title: 'Erfolgsrate verbessern',
                description: `Ihre Erfolgsrate liegt bei ${efficiency.successRate}%. Versuchen Sie, schwächere Ziele zu wählen.`,
                icon: '🎯'
            });
        }
        
        if (efficiency.averageLoot < 5000) {
            recommendations.push({
                type: 'loot',
                priority: 'medium',
                title: 'Beute optimieren',
                description: `Durchschnittliche Beute: ${this.formatNumber(efficiency.averageLoot)}. Zielen Sie auf ressourcenreichere Gegner.`,
                icon: '💰'
            });
        }
        
        // Trend-basierte Empfehlungen
        if (trends.raidFrequency.direction === 'decreasing') {
            recommendations.push({
                type: 'frequency',
                priority: 'medium',
                title: 'Raid-Aktivität steigern',
                description: 'Ihre Raid-Häufigkeit ist rückläufig. Regelmäßige Raids verbessern Ihre Ressourcen.',
                icon: '📈'
            });
        }
        
        if (trends.lootTrend.direction === 'decreasing') {
            recommendations.push({
                type: 'strategy',
                priority: 'high',
                title: 'Strategie überdenken',
                description: 'Ihre Beute-Effizienz sinkt. Analysieren Sie Ihre Zielauswahl.',
                icon: '🧠'
            });
        }
        
        // Streak-basierte Empfehlungen
        if (this.statistics.raidingStreak >= 7) {
            recommendations.push({
                type: 'achievement',
                priority: 'low',
                title: 'Großartige Streak!',
                description: `${this.statistics.raidingStreak} Raids in Folge! Halten Sie das Tempo bei.`,
                icon: '🔥'
            });
        }
        
        // Ressourcen-basierte Empfehlungen
        const resources = this.statistics.totalResourcesGathered;
        const totalResources = Object.values(resources).reduce((a, b) => a + b, 0);
        if (totalResources > 0) {
            const resourcePercentages = {};
            Object.keys(resources).forEach(resource => {
                resourcePercentages[resource] = (resources[resource] / totalResources) * 100;
            });
            
            const dominantResource = Object.keys(resourcePercentages).reduce((a, b) => 
                resourcePercentages[a] > resourcePercentages[b] ? a : b
            );
            
            if (resourcePercentages[dominantResource] > 40) {
                recommendations.push({
                    type: 'diversification',
                    priority: 'low',
                    title: 'Ressourcen diversifizieren',
                    description: `${Math.round(resourcePercentages[dominantResource])}% Ihrer Beute ist ${dominantResource}. Diversifizieren Sie Ihre Ziele.`,
                    icon: '🎲'
                });
            }
        }
        
        return recommendations.sort((a, b) => {
            const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        });
    }
    
    // Raid-Leaderboard für Allianz (falls implementiert)
    async getAllianceRaidLeaderboard(allianceName, limit = 10) {
        try {
            if (!allianceName) return [];
            
            // Hole alle User der Allianz
            const allianceUsersQuery = await this.db.collection('users')
                .where('alliance', '==', allianceName)
                .get();
            
            const allianceUserIds = [];
            allianceUsersQuery.forEach(doc => {
                allianceUserIds.push(doc.id);
            });
            
            if (allianceUserIds.length === 0) return [];
            
            // Hole Raid-Statistiken für alle Allianz-Mitglieder
            const leaderboard = [];
            
            for (const userId of allianceUserIds.slice(0, 20)) { // Limit für Performance
                const statsDoc = await this.db.collection('userStats').doc(userId).get();
                const userDoc = await this.db.collection('users').doc(userId).get();
                
                if (statsDoc.exists && userDoc.exists) {
                    const stats = statsDoc.data();
                    const user = userDoc.data();
                    
                    leaderboard.push({
                        userId: userId,
                        username: user.username,
                        totalRaids: stats.raids || 0,
                        totalLoot: stats.totalLoot || 0,
                        averageLoot: stats.averageLoot || 0,
                        raidingStreak: stats.raidingStreak || 0
                    });
                }
            }
            
            // Sortiere nach Gesamtbeute
            leaderboard.sort((a, b) => b.totalLoot - a.totalLoot);
            
            return leaderboard.slice(0, limit);
            
        } catch (error) {
            console.error('❌ Fehler beim Laden des Allianz-Leaderboards:', error);
            return [];
        }
    }
    
    // Hilfsfunktionen
    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }
    
    // Aktuelle Statistiken abrufen
    getCurrentStats() {
        return this.statistics;
    }
    
    // Prüfen ob User eingeloggt ist
    isUserLoggedIn() {
        return !!this.currentUser;
    }
}

// Globale Instanz erstellen
window.raidDataManager = new RaidDataManager();

// Globale API für Raid-Counter-Seiten
window.RaidAPI = {
    // Raid speichern
    saveRaid: (raidData) => window.raidDataManager.saveRaid(raidData),
    
    // Statistiken abrufen
    getStats: () => window.raidDataManager.getCurrentStats(),
    
    // Raid-Historie abrufen
    getRaidHistory: (filter) => window.raidDataManager.getRaidHistory(filter),
    
    // Periode-Statistiken
    getPeriodStats: (days) => window.raidDataManager.getStatisticsForPeriod(days),
    
    // Effizienz abrufen
    getEfficiency: () => window.raidDataManager.getRaidEfficiency(),
    
    // Trends abrufen
    getTrends: (days) => window.raidDataManager.getRaidTrends(days),
    
    // Empfehlungen abrufen
    getRecommendations: () => window.raidDataManager.getRaidRecommendations(),
    
    // Raid löschen
    deleteRaid: (raidId) => window.raidDataManager.deleteRaid(raidId),
    
    // Daten exportieren
    exportData: () => window.raidDataManager.exportRaidData(),
    
    // Daten importieren
    importData: (jsonData) => window.raidDataManager.importRaidData(jsonData),
    
    // Allianz-Leaderboard
    getAllianceLeaderboard: (allianceName, limit) => window.raidDataManager.getAllianceRaidLeaderboard(allianceName, limit),
    
    // User-Status prüfen
    isLoggedIn: () => window.raidDataManager.isUserLoggedIn(),
    
    // Daten neu laden
    reloadData: () => window.raidDataManager.loadUserRaidData(),
    
    // Hilfsfunktionen
    formatNumber: (num) => window.raidDataManager.formatNumber(num)
};

console.log('🏴‍☠️ Raid Data Manager geladen');
console.log('📊 API verfügbar: window.RaidAPI');
