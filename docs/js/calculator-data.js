/**
 * Calculator Data Manager - Verwaltet alle Kampfdaten für eingeloggte User
 * Abhängigkeiten: firebase-config.js, auth-manager.js
 */

class CalculatorDataManager {
    constructor() {
        this.currentUser = null;
        this.battleHistory = [];
        this.statistics = {
            totalBattles: 0,
            wins: 0,
            losses: 0,
            draws: 0,
            winRate: 0,
            totalDamageDealt: 0,
            totalDamageReceived: 0,
            totalShipsLost: 0,
            totalShipsDestroyed: 0
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
            window.AuthAPI.onAuthStateChange((user, _userData) => {
                this.currentUser = user;
                if (user) {
                    this.loadUserBattleData();
                }
            });
            
            } catch (error) {
            console.error('❌ CalculatorDataManager-Initialisierung fehlgeschlagen:', error);
        }
    }
    
    // Kampfdaten laden
    async loadUserBattleData() {
        try {
            if (!this.currentUser) return;
            
            // Kampf-Historie laden
            const battlesQuery = await this.db.collection('userBattles')
                .where('userId', '==', this.currentUser.uid)
                .orderBy('timestamp', 'desc')
                .limit(100) // Letzte 100 Kämpfe
                .get();
            
            this.battleHistory = [];
            battlesQuery.forEach(doc => {
                this.battleHistory.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            // Statistiken neu berechnen
            this.calculateStatistics();
            
            } catch (error) {
            console.error('❌ Fehler beim Laden der Kampfdaten:', error);
        }
    }
    
    // Neuen Kampf speichern
    async saveBattle(battleData) {
        try {
            if (!this.currentUser) {
                console.warn('⚠️ Kein User eingeloggt - Kampf wird nicht gespeichert');
                return null;
            }
            
            const battleDoc = {
                userId: this.currentUser.uid,
                timestamp: window.FirebaseConfig.getServerTimestamp(),
                ...battleData
            };
            
            // In Firestore speichern
            const docRef = await this.db.collection('userBattles').add(battleDoc);
            
            // Zur lokalen Historie hinzufügen
            this.battleHistory.unshift({
                id: docRef.id,
                ...battleDoc
            });
            
            // Statistiken aktualisieren
            this.calculateStatistics();
            
            // Dashboard-Statistiken aktualisieren
            await this.updateDashboardStats();
            
            // Aktivität hinzufügen
            const resultEmoji = battleData.result === 'win' ? '🏆' : battleData.result === 'loss' ? '💀' : '🤝';
            await window.AuthAPI.addActivity(resultEmoji, `Kampf ${battleData.result === 'win' ? 'gewonnen' : battleData.result === 'loss' ? 'verloren' : 'unentschieden'} (${battleData.attackerShips} vs ${battleData.defenderShips} Schiffe)`);
            
            return docRef.id;
            
        } catch (error) {
            console.error('❌ Fehler beim Speichern des Kampfes:', error);
            return null;
        }
    }
    
    // Statistiken berechnen
    calculateStatistics() {
        this.statistics = {
            totalBattles: this.battleHistory.length,
            wins: this.battleHistory.filter(b => b.result === 'win').length,
            losses: this.battleHistory.filter(b => b.result === 'loss').length,
            draws: this.battleHistory.filter(b => b.result === 'draw').length,
            totalDamageDealt: this.battleHistory.reduce((sum, b) => sum + (b.damageDealt || 0), 0),
            totalDamageReceived: this.battleHistory.reduce((sum, b) => sum + (b.damageReceived || 0), 0),
            totalShipsLost: this.battleHistory.reduce((sum, b) => sum + (b.attackerLoss || 0), 0),
            totalShipsDestroyed: this.battleHistory.reduce((sum, b) => sum + (b.defenderLoss || 0), 0)
        };
        
        // Win-Rate berechnen
        this.statistics.winRate = this.statistics.totalBattles > 0 
            ? Math.round((this.statistics.wins / this.statistics.totalBattles) * 100)
            : 0;
        
        }
    
    // Dashboard-Statistiken in Firestore aktualisieren
    async updateDashboardStats() {
        try {
            if (!this.currentUser) return;
            
            const statsRef = this.db.collection('userStats').doc(this.currentUser.uid);
            
            await statsRef.set({
                battles: this.statistics.totalBattles,
                wins: this.statistics.wins,
                losses: this.statistics.losses,
                winRate: this.statistics.winRate,
                totalDamageDealt: this.statistics.totalDamageDealt,
                totalDamageReceived: this.statistics.totalDamageReceived,
                lastUpdated: window.FirebaseConfig.getServerTimestamp()
            }, { merge: true });
            
            } catch (error) {
            console.error('❌ Fehler beim Aktualisieren der Dashboard-Statistiken:', error);
        }
    }
    
    // Kampf-Historie mit Filter
    getBattleHistory(filter = {}) {
        let filteredHistory = [...this.battleHistory];
        
        // Nach Ergebnis filtern
        if (filter.result) {
            filteredHistory = filteredHistory.filter(b => b.result === filter.result);
        }
        
        // Nach Kampftyp filtern
        if (filter.battleType) {
            filteredHistory = filteredHistory.filter(b => b.battleType === filter.battleType);
        }
        
        // Nach Datum filtern
        if (filter.dateFrom) {
            const fromDate = new Date(filter.dateFrom);
            filteredHistory = filteredHistory.filter(b => {
                const battleDate = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp);
                return battleDate >= fromDate;
            });
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
        
        const recentBattles = this.battleHistory.filter(battle => {
            const battleDate = battle.timestamp?.toDate ? battle.timestamp.toDate() : new Date(battle.timestamp);
            return battleDate >= cutoffDate;
        });
        
        const stats = {
            period: `${days} Tage`,
            totalBattles: recentBattles.length,
            wins: recentBattles.filter(b => b.result === 'win').length,
            losses: recentBattles.filter(b => b.result === 'loss').length,
            draws: recentBattles.filter(b => b.result === 'draw').length,
            avgDamageDealt: 0,
            avgDamageReceived: 0,
            winRate: 0
        };
        
        if (stats.totalBattles > 0) {
            stats.avgDamageDealt = Math.round(
                recentBattles.reduce((sum, b) => sum + (b.damageDealt || 0), 0) / stats.totalBattles
            );
            stats.avgDamageReceived = Math.round(
                recentBattles.reduce((sum, b) => sum + (b.damageReceived || 0), 0) / stats.totalBattles
            );
            stats.winRate = Math.round((stats.wins / stats.totalBattles) * 100);
        }
        
        return stats;
    }
    
    // Kampf löschen
    async deleteBattle(battleId) {
        try {
            if (!this.currentUser) return false;
            
            // Aus Firestore löschen
            await this.db.collection('userBattles').doc(battleId).delete();
            
            // Aus lokaler Historie entfernen
            this.battleHistory = this.battleHistory.filter(b => b.id !== battleId);
            
            // Statistiken neu berechnen
            this.calculateStatistics();
            
            // Dashboard-Statistiken aktualisieren
            await this.updateDashboardStats();
            
            return true;
            
        } catch (error) {
            console.error('❌ Fehler beim Löschen des Kampfes:', error);
            return false;
        }
    }
    
    // Alle Kampfdaten exportieren
    exportBattleData() {
        const exportData = {
            user: this.currentUser?.email,
            exportDate: new Date().toISOString(),
            statistics: this.statistics,
            battleHistory: this.battleHistory.map(battle => ({
                date: battle.timestamp?.toDate ? battle.timestamp.toDate().toISOString() : battle.timestamp,
                result: battle.result,
                attackerShips: battle.attackerShips,
                defenderShips: battle.defenderShips,
                damageDealt: battle.damageDealt,
                damageReceived: battle.damageReceived,
                battleType: battle.battleType
            }))
        };
        
        return JSON.stringify(exportData, null, 2);
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
window.calculatorDataManager = new CalculatorDataManager();

// Globale API für Calculator-Seiten
window.CalculatorAPI = {
    // Kampf speichern
    saveBattle: (battleData) => window.calculatorDataManager.saveBattle(battleData),
    
    // Statistiken abrufen
    getStats: () => window.calculatorDataManager.getCurrentStats(),
    
    // Kampf-Historie abrufen
    getBattleHistory: (filter) => window.calculatorDataManager.getBattleHistory(filter),
    
    // Periode-Statistiken
    getPeriodStats: (days) => window.calculatorDataManager.getStatisticsForPeriod(days),
    
    // Kampf löschen
    deleteBattle: (battleId) => window.calculatorDataManager.deleteBattle(battleId),
    
    // Daten exportieren
    exportData: () => window.calculatorDataManager.exportBattleData(),
    
    // User-Status prüfen
    isLoggedIn: () => window.calculatorDataManager.isUserLoggedIn(),
    
    // Daten neu laden
    reloadData: () => window.calculatorDataManager.loadUserBattleData()
};
