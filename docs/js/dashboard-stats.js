/**
 * DASHBOARD STATISTIKEN
 * Lädt und zeigt Auswertungen aus allen Countern an
 */

class DashboardStats {
    constructor() {
        this.asStats = {
            totalReports: 0,
            stabilityDestroyed: 0,
            tanksDestroyed: 0,
            asDestroyed: 0
        };
        
        this.raidStats = {
            totalRaids: 0,
            energyLooted: 0,
            oilLooted: 0,
            metalLooted: 0,
            crystalLooted: 0
        };
        
        this.saboStats = {
            totalSabotages: 0,
            buildingsDestroyed: {}
        };
        
        this.init();
    }

    init() {
        Logger.info('Dashboard-Statistiken werden initialisiert...');
        this.loadAllStats();
        
        // Aktualisierung alle 30 Sekunden
        setInterval(() => {
            this.loadAllStats();
        }, 30000);
    }

    async loadAllStats() {
        try {
            await Promise.all([
                this.loadASStats(),
                this.loadRaidStats(),
                this.loadSaboStats()
            ]);
            
            this.updateDisplay();
        } catch (error) {
            Logger.error('Fehler beim Laden der Statistiken:', error);
        }
    }

    async loadASStats() {
        try {
            if (typeof firebase === 'undefined' || !firebase.auth().currentUser) {
                return;
            }

            const userId = firebase.auth().currentUser.uid;
            const calculatorRef = firebase.firestore()
                .collection('users')
                .doc(userId)
                .collection('calculator_data');

            const snapshot = await calculatorRef.get();
            
            let totalReports = 0;
            let stabilityDestroyed = 0;
            let tanksDestroyed = 0;
            let asDestroyed = 0;

            snapshot.forEach(doc => {
                const data = doc.data();
                if (data.destroyed || data.lost) {
                    totalReports++;
                    
                    // Parsing der Berichte für detaillierte Statistiken
                    if (data.destroyed) {
                        const destroyed = this.parseReport(data.destroyed);
                        stabilityDestroyed += destroyed.stability || 0;
                        tanksDestroyed += destroyed.tanks || 0;
                        asDestroyed += destroyed.as || 0;
                    }
                }
            });

            this.asStats = {
                totalReports,
                stabilityDestroyed,
                tanksDestroyed,
                asDestroyed
            };

            Logger.debug('AS-Statistiken geladen:', this.asStats);
        } catch (error) {
            Logger.error('Fehler beim Laden der AS-Statistiken:', error);
        }
    }

    async loadRaidStats() {
        try {
            if (typeof firebase === 'undefined' || !firebase.auth().currentUser) {
                return;
            }

            const userId = firebase.auth().currentUser.uid;
            const raidRef = firebase.firestore()
                .collection('users')
                .doc(userId)
                .collection('raid_data');

            const snapshot = await raidRef.get();
            
            let totalRaids = 0;
            let energyLooted = 0;
            let oilLooted = 0;
            let metalLooted = 0;
            let crystalLooted = 0;

            snapshot.forEach(doc => {
                const data = doc.data();
                totalRaids++;
                
                // Rohstoffe aus den Raid-Daten extrahieren
                energyLooted += data.energy || 0;
                oilLooted += data.oil || 0;
                metalLooted += data.metal || 0;
                crystalLooted += data.crystal || 0;
            });

            this.raidStats = {
                totalRaids,
                energyLooted,
                oilLooted,
                metalLooted,
                crystalLooted
            };

            Logger.debug('Raid-Statistiken geladen:', this.raidStats);
        } catch (error) {
            Logger.error('Fehler beim Laden der Raid-Statistiken:', error);
        }
    }

    async loadSaboStats() {
        try {
            if (typeof firebase === 'undefined' || !firebase.auth().currentUser) {
                return;
            }

            const userId = firebase.auth().currentUser.uid;
            const saboRef = firebase.firestore()
                .collection('users')
                .doc(userId)
                .collection('sabo_data');

            const snapshot = await saboRef.get();
            
            let totalSabotages = 0;
            const buildingsDestroyed = {};

            snapshot.forEach(doc => {
                const data = doc.data();
                totalSabotages++;
                
                // Gebäude aus den Sabo-Daten extrahieren
                if (data.buildings) {
                    Object.entries(data.buildings).forEach(([building, count]) => {
                        buildingsDestroyed[building] = (buildingsDestroyed[building] || 0) + count;
                    });
                }
            });

            this.saboStats = {
                totalSabotages,
                buildingsDestroyed
            };

            Logger.debug('Sabo-Statistiken geladen:', this.saboStats);
        } catch (error) {
            Logger.error('Fehler beim Laden der Sabo-Statistiken:', error);
        }
    }

    parseReport(reportText) {
        const stats = {
            stability: 0,
            tanks: 0,
            as: 0
        };

        if (!reportText) return stats;

        // Regex-Patterns für verschiedene Einheiten
        const patterns = {
            stability: /Stabilität.*?(\d+)/gi,
            tanks: /Panzer.*?(\d+)/gi,
            as: /AS.*?(\d+)/gi
        };

        Object.entries(patterns).forEach(([key, pattern]) => {
            const matches = reportText.matchAll(pattern);
            for (const match of matches) {
                stats[key] += parseInt(match[1]) || 0;
            }
        });

        return stats;
    }

    updateDisplay() {
        // AS-Counter Statistiken anzeigen
        this.updateElement('total-kills', this.asStats.totalReports);
        this.updateElement('stability-destroyed', this.formatNumber(this.asStats.stabilityDestroyed));
        this.updateElement('tanks-destroyed', this.formatNumber(this.asStats.tanksDestroyed));
        this.updateElement('as-destroyed', this.formatNumber(this.asStats.asDestroyed));

        // Raid-Counter Statistiken anzeigen
        this.updateElement('total-raids', this.raidStats.totalRaids);
        this.updateElement('energy-looted', this.formatNumber(this.raidStats.energyLooted));
        this.updateElement('oil-looted', this.formatNumber(this.raidStats.oilLooted));
        this.updateElement('metal-looted', this.formatNumber(this.raidStats.metalLooted));
        this.updateElement('crystal-looted', this.formatNumber(this.raidStats.crystalLooted));

        // Sabo-Counter Statistiken anzeigen
        this.updateElement('total-sabotages', this.saboStats.totalSabotages);
        this.updateBuildingStats();
    }

    updateBuildingStats() {
        const buildingStatsElement = document.getElementById('building-stats');
        if (!buildingStatsElement) return;

        const buildings = this.saboStats.buildingsDestroyed;
        
        if (Object.keys(buildings).length === 0) {
            buildingStatsElement.innerHTML = `
                <div class="loading-buildings">
                    <span style="color: var(--text-secondary);">Noch keine Sabotage-Daten vorhanden</span>
                </div>
            `;
            return;
        }

        // Sortiere Gebäude nach Anzahl (höchste zuerst)
        const sortedBuildings = Object.entries(buildings)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10); // Zeige nur Top 10

        const buildingHTML = sortedBuildings.map(([building, count]) => `
            <div class="building-item">
                <span class="building-name">${this.formatBuildingName(building)}</span>
                <span class="building-count">${this.formatNumber(count)}</span>
            </div>
        `).join('');

        buildingStatsElement.innerHTML = buildingHTML;
    }

    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            // Animierte Zahlen-Aktualisierung
            const currentValue = parseInt(element.textContent.replace(/[^\d]/g, '')) || 0;
            const newValue = typeof value === 'string' ? parseInt(value.replace(/[^\d]/g, '')) || 0 : value;
            
            if (currentValue !== newValue) {
                this.animateNumber(element, currentValue, newValue);
            }
        }
    }

    animateNumber(element, from, to) {
        const duration = 1000;
        const steps = 60;
        const stepValue = (to - from) / steps;
        let current = from;
        let step = 0;

        const timer = setInterval(() => {
            step++;
            current += stepValue;
            
            if (step >= steps) {
                current = to;
                clearInterval(timer);
            }
            
            element.textContent = this.formatNumber(Math.round(current));
        }, duration / steps);
    }

    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    formatBuildingName(building) {
        // Gebäudenamen benutzerfreundlich formatieren
        const buildingNames = {
            'kraftwerk': '⚡ Kraftwerk',
            'raffinerie': '🛢️ Raffinerie',
            'mine': '⚒️ Mine',
            'kristallmine': '💎 Kristallmine',
            'fabrik': '🏭 Fabrik',
            'forschung': '🔬 Forschungszentrum',
            'kaserne': '🏰 Kaserne',
            'hangar': '✈️ Hangar',
            'raketenabwehr': '🚀 Raketenabwehr',
            'schild': '🛡️ Schildgenerator'
        };

        return buildingNames[building.toLowerCase()] || `🏢 ${building}`;
    }

    // Öffentliche Methoden für manuelle Aktualisierung
    refresh() {
        Logger.info('Dashboard-Statistiken werden manuell aktualisiert...');
        this.loadAllStats();
    }

    getStats() {
        return {
            as: this.asStats,
            raid: this.raidStats,
            sabo: this.saboStats
        };
    }
}

// Dashboard-Statistiken initialisieren, wenn Firebase bereit ist
let dashboardStats = null;

function initializeDashboardStats() {
    if (firebase.auth().currentUser && !dashboardStats) {
        dashboardStats = new DashboardStats();
        Logger.info('Dashboard-Statistiken initialisiert');
    }
}

// Event-Listener für Firebase Auth
firebase.auth().onAuthStateChanged(user => {
    if (user) {
        setTimeout(initializeDashboardStats, 1000); // Kurz warten bis Firebase vollständig geladen ist
    } else {
        dashboardStats = null;
    }
});

// Global verfügbar machen
window.DashboardStats = DashboardStats;
window.dashboardStats = dashboardStats;
window.refreshDashboardStats = () => {
    if (dashboardStats) {
        dashboardStats.refresh();
    }
};

Logger.info('Dashboard-Statistiken Modul geladen');