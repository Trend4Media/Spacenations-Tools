/**
 * Spy Report Parser - Individuelle Allianz Spionage-Bericht-Datenbank
 * Parsed normale Spy-Report URLs und extrahiert Daten via API
 */

class SpyReportParser {
    constructor() {
        this.apiBaseUrl = 'https://beta1.game.spacenations.eu/api/spy-report/';
        this.init();
    }
    
    init() {
        console.log('🕵️ Spy Report Parser initialisiert');
    }
    
    /**
     * Extrahiert Report-ID aus einer Spy-Report URL
     * @param {string} url - Die Spy-Report URL
     * @returns {string|null} - Die Report-ID oder null
     */
    extractReportId(url) {
        try {
            // Verschiedene URL-Formate unterstützen
            const patterns = [
                /\/spy-report\/([a-zA-Z0-9_-]+)/,  // Standard Format
                /spy-report\/([a-zA-Z0-9_-]+)/,    // Ohne führenden Slash
                /([a-zA-Z0-9_-]{20,})/             // Direkte ID (mindestens 20 Zeichen)
            ];
            
            for (const pattern of patterns) {
                const match = url.match(pattern);
                if (match && match[1]) {
                    console.log('✅ Report-ID extrahiert:', match[1]);
                    return match[1];
                }
            }
            
            console.warn('⚠️ Keine gültige Report-ID in URL gefunden:', url);
            return null;
            
        } catch (error) {
            console.error('❌ Fehler beim Extrahieren der Report-ID:', error);
            return null;
        }
    }
    
    /**
     * Lädt Spy-Report Daten von der API
     * @param {string} reportId - Die Report-ID
     * @returns {Promise<Object|null>} - Die Report-Daten oder null
     */
    async fetchReportData(reportId) {
        try {
            console.log('📡 Lade Spy-Report Daten für ID:', reportId);
            
            const apiUrl = `${this.apiBaseUrl}${reportId}`;
            console.log('🔗 API-URL:', apiUrl);
            
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'Spacenations-Tools/1.0'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('✅ Spy-Report Daten erfolgreich geladen');
            
            return data;
            
        } catch (error) {
            console.error('❌ Fehler beim Laden der Spy-Report Daten:', error);
            throw error;
        }
    }
    
    /**
     * Parsed und validiert Spy-Report Daten
     * @param {Object} rawData - Die rohen API-Daten
     * @returns {Object} - Validierte und strukturierte Daten
     */
    parseReportData(rawData) {
        try {
            if (!rawData || !rawData.report) {
                throw new Error('Ungültige API-Antwort: Keine Report-Daten');
            }
            
            const report = rawData.report;
            const timestamp = rawData.time || new Date().toISOString();
            
            // Grunddaten extrahieren
            const parsedData = {
                // Metadaten
                timestamp: new Date(timestamp),
                reportId: this.extractReportIdFromData(rawData),
                
                // Planet-Daten
                planet: {
                    coordinates: report.planet?.coordinates || 'Unbekannt',
                    name: report.planet?.name || 'Unbekannter Planet',
                    levels: report.planet?.levels || {},
                    recycling: report.planet?.recycling || {}
                },
                
                // Spieler-Daten
                player: {
                    name: report.player?.name || 'Unbekannter Spieler',
                    allianceName: report.player?.allianceName || null,
                    metaName: report.player?.metaName || null,
                    research: report.player?.research || {},
                    shipTypes: report.player?.shipTypes || []
                },
                
                // Gebäude
                buildings: report.buildings || {},
                
                // Ressourcen
                resources: report.resources || {},
                
                // Verteidigung
                defense: report.defense || [],
                
                // Flotten
                fleets: {
                    stationed: report.stationedShips || [],
                    uncloaked: report.uncloakedFleets || [],
                    cloaked: report.cloakedFleets || {}
                },
                
                // Fleet-Daten (für die spionierte Flotte)
                fleet: report.fleet || {}
            };
            
            // Berechne zusätzliche Statistiken
            parsedData.statistics = this.calculateStatistics(parsedData);
            
            console.log('✅ Spy-Report Daten erfolgreich geparst');
            return parsedData;
            
        } catch (error) {
            console.error('❌ Fehler beim Parsen der Spy-Report Daten:', error);
            throw error;
        }
    }
    
    /**
     * Extrahiert Report-ID aus den Daten (falls vorhanden)
     * @param {Object} data - Die API-Daten
     * @returns {string} - Die Report-ID
     */
    extractReportIdFromData(data) {
        // Versuche verschiedene Wege, die ID zu finden
        if (data.reportId) return data.reportId;
        if (data.id) return data.id;
        
        // Generiere eine ID basierend auf Timestamp und Spielername
        const timestamp = data.time || new Date().toISOString();
        const playerName = data.report?.player?.name || 'unknown';
        return `${playerName}_${timestamp.slice(0, 10)}_${Date.now()}`;
    }
    
    /**
     * Berechnet zusätzliche Statistiken aus den Report-Daten
     * @param {Object} data - Die geparsten Daten
     * @returns {Object} - Berechnete Statistiken
     */
    calculateStatistics(data) {
        const stats = {
            totalAttackPower: 0,
            totalDefensePower: 0,
            totalResources: 0,
            researchLevel: 0,
            buildingLevel: 0,
            fleetCount: 0,
            threatLevel: 'unknown'
        };
        
        try {
            // Angriffsstärke berechnen
            if (data.fleets.uncloaked) {
                data.fleets.uncloaked.forEach(fleet => {
                    stats.totalAttackPower += fleet.stats?.attack || 0;
                });
            }
            
            // Verteidigungsstärke berechnen
            if (data.defense) {
                data.defense.forEach(defense => {
                    stats.totalDefensePower += defense.attack || 0;
                });
            }
            
            // Gesamtressourcen berechnen
            if (data.resources) {
                const resourceKeys = ['fe', 'si', 'c', 'h2o', 'o2', 'h'];
                resourceKeys.forEach(key => {
                    stats.totalResources += data.resources[key] || 0;
                });
            }
            
            // Forschungslevel berechnen (Durchschnitt)
            if (data.player.research) {
                const researchValues = Object.values(data.player.research);
                stats.researchLevel = researchValues.reduce((sum, val) => sum + val, 0) / researchValues.length;
            }
            
            // Gebäudelevel berechnen (Durchschnitt)
            if (data.buildings) {
                const buildingValues = Object.values(data.buildings);
                stats.buildingLevel = buildingValues.reduce((sum, val) => sum + val, 0) / buildingValues.length;
            }
            
            // Flottenanzahl
            stats.fleetCount = (data.fleets.uncloaked?.length || 0) + (data.fleets.stationed?.length || 0);
            
            // Bedrohungsstufe berechnen
            stats.threatLevel = this.calculateThreatLevel(stats);
            
        } catch (error) {
            console.warn('⚠️ Fehler beim Berechnen der Statistiken:', error);
        }
        
        return stats;
    }
    
    /**
     * Berechnet die Bedrohungsstufe basierend auf den Statistiken
     * @param {Object} stats - Die Statistiken
     * @returns {string} - Die Bedrohungsstufe
     */
    calculateThreatLevel(stats) {
        const { totalAttackPower, totalDefensePower, researchLevel, buildingLevel } = stats;
        
        // Gewichtete Bewertung
        const attackScore = Math.min(totalAttackPower / 100000, 10); // Max 10 Punkte
        const defenseScore = Math.min(totalDefensePower / 50000, 10); // Max 10 Punkte
        const researchScore = Math.min(researchLevel / 5, 10); // Max 10 Punkte
        const buildingScore = Math.min(buildingLevel / 5, 10); // Max 10 Punkte
        
        const totalScore = attackScore + defenseScore + researchScore + buildingScore;
        
        if (totalScore >= 35) return 'very_high';
        if (totalScore >= 25) return 'high';
        if (totalScore >= 15) return 'medium';
        if (totalScore >= 5) return 'low';
        return 'very_low';
    }
    
    /**
     * Hauptfunktion: Verarbeitet eine Spy-Report URL
     * @param {string} url - Die Spy-Report URL
     * @returns {Promise<Object>} - Die verarbeiteten Daten
     */
    async processSpyReportUrl(url) {
        try {
            console.log('🕵️ Verarbeite Spy-Report URL:', url);
            
            // 1. Report-ID extrahieren
            const reportId = this.extractReportId(url);
            if (!reportId) {
                throw new Error('Keine gültige Report-ID gefunden');
            }
            
            // 2. Daten von API laden
            const rawData = await this.fetchReportData(reportId);
            
            // 3. Daten parsen und validieren
            const parsedData = this.parseReportData(rawData);
            
            // 4. Original-URL hinzufügen
            parsedData.originalUrl = url;
            parsedData.reportId = reportId;
            
            console.log('✅ Spy-Report erfolgreich verarbeitet:', parsedData.player.name);
            return parsedData;
            
        } catch (error) {
            console.error('❌ Fehler beim Verarbeiten der Spy-Report URL:', error);
            throw error;
        }
    }
    
    /**
     * Validiert, ob eine URL eine gültige Spy-Report URL ist
     * @param {string} url - Die zu validierende URL
     * @returns {boolean} - True wenn gültig
     */
    isValidSpyReportUrl(url) {
        if (!url || typeof url !== 'string') return false;
        
        // Verschiedene gültige Formate
        const validPatterns = [
            /https?:\/\/.*spacenations\.eu\/spy-report\/[a-zA-Z0-9_-]+/,
            /spacenations\.eu\/spy-report\/[a-zA-Z0-9_-]+/,
            /spy-report\/[a-zA-Z0-9_-]+/
        ];
        
        return validPatterns.some(pattern => pattern.test(url));
    }
    
    /**
     * Formatiert Bedrohungsstufe für UI-Anzeige
     * @param {string} threatLevel - Die Bedrohungsstufe
     * @returns {Object} - Formatierte Anzeige-Daten
     */
    formatThreatLevel(threatLevel) {
        const levels = {
            'very_low': { text: 'Sehr Niedrig', color: '#4CAF50', icon: '🟢' },
            'low': { text: 'Niedrig', color: '#8BC34A', icon: '🟡' },
            'medium': { text: 'Mittel', color: '#FF9800', icon: '🟠' },
            'high': { text: 'Hoch', color: '#F44336', icon: '🔴' },
            'very_high': { text: 'Sehr Hoch', color: '#9C27B0', icon: '⚫' }
        };
        
        return levels[threatLevel] || levels['unknown'];
    }
}

// Globale Instanz erstellen
window.spyReportParser = new SpyReportParser();

// Globale API für einfache Nutzung
window.SpyReportAPI = {
    processUrl: (url) => window.spyReportParser.processSpyReportUrl(url),
    isValidUrl: (url) => window.spyReportParser.isValidSpyReportUrl(url),
    extractId: (url) => window.spyReportParser.extractReportId(url),
    formatThreatLevel: (level) => window.spyReportParser.formatThreatLevel(level)
};

console.log('🕵️ SpyReportAPI verfügbar: window.SpyReportAPI');