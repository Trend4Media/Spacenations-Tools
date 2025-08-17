/**
 * Spionage-Report Parser
 * Parst Spionage-Reports aus Spacenations
 */

// Hauptfunktion zum Parsen eines Spionage-Reports
function parseSpyReport(reportText) {
    console.log('🔍 Beginne Spionage-Report Analyse...');
    
    if (!reportText || typeof reportText !== 'string') {
        throw new Error('Ungültiger Report-Text');
    }
    
    const report = {
        playerName: null,
        alliance: null,
        coordinates: null,
        spyTime: new Date(),
        fleet: {},
        resources: {
            metal: 0,
            crystal: 0,
            deuterium: 0,
            total: 0
        },
        defense: {},
        buildings: {},
        research: {},
        raw: reportText
    };
    
    try {
        // Spielername und Koordinaten extrahieren
        extractPlayerInfo(reportText, report);
        
        // Allianz extrahieren
        extractAlliance(reportText, report);
        
        // Flotte extrahieren
        extractFleet(reportText, report);
        
        // Ressourcen extrahieren
        extractResources(reportText, report);
        
        // Verteidigung extrahieren
        extractDefense(reportText, report);
        
        // Gebäude extrahieren (falls vorhanden)
        extractBuildings(reportText, report);
        
        // Forschung extrahieren (falls vorhanden)
        extractResearch(reportText, report);
        
        console.log('✅ Spionage-Report erfolgreich geparst:', report);
        return report;
        
    } catch (error) {
        console.error('❌ Fehler beim Parsen des Reports:', error);
        throw new Error('Fehler beim Analysieren des Reports: ' + error.message);
    }
}

// Spielername und Koordinaten extrahieren
function extractPlayerInfo(text, report) {
    // Verschiedene Muster für Spielername und Koordinaten
    const patterns = [
        /Spionage von (.+?) \[(\d+:\d+:\d+)\]/i,
        /Spionagebericht von (.+?) \[(\d+:\d+:\d+)\]/i,
        /(.+?) \[(\d+:\d+:\d+)\]/i,
        /Spieler:\s*(.+?)\s*Koordinaten:\s*(\d+:\d+:\d+)/i
    ];
    
    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
            report.playerName = match[1].trim();
            report.coordinates = match[2].trim();
            break;
        }
    }
    
    // Fallback: Nur Koordinaten suchen
    if (!report.coordinates) {
        const coordMatch = text.match(/(\d+:\d+:\d+)/);
        if (coordMatch) {
            report.coordinates = coordMatch[1];
        }
    }
}

// Allianz extrahieren
function extractAlliance(text, report) {
    const patterns = [
        /Allianz:\s*(.+?)(?:\n|$)/i,
        /\[([A-Z0-9_-]+)\]/i
    ];
    
    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
            report.alliance = match[1].trim();
            break;
        }
    }
}

// Flotte extrahieren
function extractFleet(text, report) {
    const fleetSection = extractSection(text, ['flotte', 'fleet', 'schiffe']);
    if (!fleetSection) return;
    
    const fleetTypes = {
        // Deutsch
        'jäger': 'fighters',
        'jaeger': 'fighters',
        'bomber': 'bombers',
        'kreuzer': 'cruisers',
        'schlachtschiff': 'battleships',
        'zerstörer': 'destroyers',
        'zerstoerer': 'destroyers',
        'träger': 'carriers',
        'traeger': 'carriers',
        'transporter': 'transporters',
        
        // Englisch
        'fighter': 'fighters',
        'fighters': 'fighters',
        'bomber': 'bombers',
        'bombers': 'bombers',
        'cruiser': 'cruisers',
        'cruisers': 'cruisers',
        'battleship': 'battleships',
        'battleships': 'battleships',
        'destroyer': 'destroyers',
        'destroyers': 'destroyers',
        'carrier': 'carriers',
        'carriers': 'carriers',
        'transporter': 'transporters',
        'transporters': 'transporters'
    };
    
    // Verschiedene Muster für Flotten-Einträge
    const patterns = [
        /(.+?):\s*([0-9.,]+)/g,
        /(.+?)\s+([0-9.,]+)/g,
        /-\s*(.+?):\s*([0-9.,]+)/g
    ];
    
    for (const pattern of patterns) {
        let match;
        while ((match = pattern.exec(fleetSection)) !== null) {
            const shipName = match[1].toLowerCase().trim();
            const count = parseInt(match[2].replace(/[.,]/g, ''));
            
            if (fleetTypes[shipName] && !isNaN(count) && count > 0) {
                report.fleet[fleetTypes[shipName]] = count;
            }
        }
    }
}

// Ressourcen extrahieren
function extractResources(text, report) {
    const resourceSection = extractSection(text, ['ressourcen', 'resources', 'rohstoffe']);
    
    const patterns = [
        /metall:\s*([0-9.,]+)/i,
        /metal:\s*([0-9.,]+)/i,
        /kristall:\s*([0-9.,]+)/i,
        /crystal:\s*([0-9.,]+)/i,
        /deuterium:\s*([0-9.,]+)/i
    ];
    
    const searchText = resourceSection || text;
    
    patterns.forEach((pattern, index) => {
        const match = searchText.match(pattern);
        if (match) {
            const value = parseInt(match[1].replace(/[.,]/g, ''));
            if (!isNaN(value)) {
                switch (index) {
                    case 0:
                    case 1:
                        report.resources.metal = value;
                        break;
                    case 2:
                    case 3:
                        report.resources.crystal = value;
                        break;
                    case 4:
                        report.resources.deuterium = value;
                        break;
                }
            }
        }
    });
    
    // Gesamtressourcen berechnen
    report.resources.total = report.resources.metal + report.resources.crystal + report.resources.deuterium;
}

// Verteidigung extrahieren
function extractDefense(text, report) {
    const defenseSection = extractSection(text, ['verteidigung', 'defense', 'verteidigungsanlagen']);
    if (!defenseSection) return;
    
    const defenseTypes = {
        'raketen': 'rockets',
        'laser': 'lasers',
        'ionenkanone': 'ion_cannons',
        'plasmakanone': 'plasma_cannons',
        'schild': 'shields'
    };
    
    Object.keys(defenseTypes).forEach(defName => {
        const pattern = new RegExp(defName + ':\\s*([0-9.,]+)', 'i');
        const match = defenseSection.match(pattern);
        if (match) {
            const count = parseInt(match[1].replace(/[.,]/g, ''));
            if (!isNaN(count) && count > 0) {
                report.defense[defenseTypes[defName]] = count;
            }
        }
    });
}

// Gebäude extrahieren
function extractBuildings(text, report) {
    const buildingSection = extractSection(text, ['gebäude', 'buildings', 'bauten']);
    if (!buildingSection) return;
    
    // Hier können bei Bedarf Gebäude-Parser hinzugefügt werden
    // Meist nicht in Standard-Spionage-Reports enthalten
}

// Forschung extrahieren
function extractResearch(text, report) {
    const researchSection = extractSection(text, ['forschung', 'research', 'technologie']);
    if (!researchSection) return;
    
    // Hier können bei Bedarf Forschungs-Parser hinzugefügt werden
    // Meist nur in detaillierten Spionage-Reports enthalten
}

// Hilfsfunktion: Sektion aus Text extrahieren
function extractSection(text, keywords) {
    for (const keyword of keywords) {
        const pattern = new RegExp(`${keyword}[:\\s]*([\\s\\S]*?)(?=\\n\\s*[a-zA-ZäöüÄÖÜ]+:|$)`, 'i');
        const match = text.match(pattern);
        if (match) {
            return match[1].trim();
        }
    }
    return null;
}

// Flottenstärke berechnen
function calculateFleetPower(fleet) {
    const shipPower = {
        fighters: 100,
        bombers: 200,
        cruisers: 400,
        battleships: 800,
        destroyers: 1200,
        carriers: 600,
        transporters: 50
    };
    
    let totalPower = 0;
    Object.keys(fleet).forEach(shipType => {
        if (shipPower[shipType]) {
            totalPower += fleet[shipType] * shipPower[shipType];
        }
    });
    
    return totalPower;
}

// Report validieren
function validateReport(report) {
    const errors = [];
    
    if (!report.playerName) {
        errors.push('Spielername nicht gefunden');
    }
    
    if (!report.coordinates) {
        errors.push('Koordinaten nicht gefunden');
    }
    
    if (Object.keys(report.fleet).length === 0) {
        errors.push('Keine Flotten-Daten gefunden');
    }
    
    if (report.resources.total === 0) {
        errors.push('Keine Ressourcen-Daten gefunden');
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

// Report formatieren für Anzeige
function formatReportForDisplay(report) {
    return {
        ...report,
        fleetPower: calculateFleetPower(report.fleet),
        formattedResources: {
            metal: report.resources.metal.toLocaleString('de-DE'),
            crystal: report.resources.crystal.toLocaleString('de-DE'),
            deuterium: report.resources.deuterium.toLocaleString('de-DE'),
            total: report.resources.total.toLocaleString('de-DE')
        },
        spyTimeFormatted: report.spyTime.toLocaleString('de-DE')
    };
}

// Export für andere Module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        parseSpyReport,
        calculateFleetPower,
        validateReport,
        formatReportForDisplay
    };
}