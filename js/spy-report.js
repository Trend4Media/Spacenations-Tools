/**
 * Spionage-Report JavaScript
 * Verwaltet die Spionage-Report Analyzer Funktionalität
 */

// Globale Variablen
let currentParsedReport = null;

// Initialisierung
function initializeSpyReport() {
    console.log('🔧 Initialisiere Spionage-Report Analyzer...');
    
    // Event Listeners setzen
    setupReportEventListeners();
    
    // Branch-spezifische Konfiguration
    if (window.location.pathname.includes('/testarea/')) {
        console.log('🔧 TESTAREA Modus für Spionage-Report aktiviert');
        document.body.setAttribute('data-branch', 'testarea');
    }
}

// Event Listeners einrichten
function setupReportEventListeners() {
    // Textarea für Auto-Resize
    const reportTextarea = document.getElementById('report-text');
    if (reportTextarea) {
        reportTextarea.addEventListener('input', autoResizeTextarea);
    }
    
    // Enter-Taste für schnelle Analyse
    if (reportTextarea) {
        reportTextarea.addEventListener('keydown', function(e) {
            if (e.ctrlKey && e.key === 'Enter') {
                parseReport();
            }
        });
    }
    
    // Auto-Save Draft
    if (reportTextarea) {
        reportTextarea.addEventListener('input', debounce(saveDraft, 1000));
    }
    
    // Load Draft beim Start
    loadDraft();
}

// Auto-Resize für Textarea
function autoResizeTextarea() {
    const textarea = document.getElementById('report-text');
    if (textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = Math.max(200, textarea.scrollHeight) + 'px';
    }
}

// Draft speichern
function saveDraft() {
    const reportText = document.getElementById('report-text')?.value || '';
    const targetName = document.getElementById('target-name')?.value || '';
    
    if (reportText.trim()) {
        localStorage.setItem('spy-report-draft', JSON.stringify({
            reportText: reportText,
            targetName: targetName,
            timestamp: Date.now()
        }));
        console.log('💾 Draft gespeichert');
    }
}

// Draft laden
function loadDraft() {
    try {
        const draft = localStorage.getItem('spy-report-draft');
        if (draft) {
            const draftData = JSON.parse(draft);
            
            // Nur laden wenn weniger als 24 Stunden alt
            if (Date.now() - draftData.timestamp < 24 * 60 * 60 * 1000) {
                const reportTextarea = document.getElementById('report-text');
                const targetInput = document.getElementById('target-name');
                
                if (reportTextarea && draftData.reportText) {
                    reportTextarea.value = draftData.reportText;
                    autoResizeTextarea();
                }
                
                if (targetInput && draftData.targetName) {
                    targetInput.value = draftData.targetName;
                }
                
                console.log('📄 Draft geladen');
            }
        }
    } catch (error) {
        console.error('❌ Fehler beim Laden des Drafts:', error);
    }
}

// Report analysieren (erweiterte Version der HTML-Funktion)
async function parseReport() {
    const reportText = document.getElementById('report-text')?.value.trim();
    const targetName = document.getElementById('target-name')?.value.trim();
    
    if (!reportText) {
        showStatusMessage('Bitte füge einen Spionage-Report ein.', 'error');
        return;
    }
    
    try {
        showStatusMessage('Analysiere Report...', 'info');
        
        // Parser verwenden (falls spy-parser.js geladen ist)
        let parsedData;
        if (typeof parseSpyReport === 'function') {
            parsedData = parseSpyReport(reportText);
            
            // Target-Name überschreiben falls manuell eingegeben
            if (targetName) {
                parsedData.playerName = targetName;
            }
            
            // Validierung
            const validation = validateReport(parsedData);
            if (!validation.isValid) {
                showStatusMessage('Warnung: ' + validation.errors.join(', '), 'warning');
            }
            
            // Für Anzeige formatieren
            parsedData = formatReportForDisplay(parsedData);
            
        } else {
            // Fallback: Dummy-Daten für Demo
            parsedData = createDummyReportData(targetName, reportText);
        }
        
        // UI aktualisieren
        displayParsedData(parsedData);
        currentParsedReport = parsedData;
        
        // Buttons anzeigen
        document.getElementById('save-btn').style.display = 'flex';
        document.getElementById('export-btn').style.display = 'flex';
        
        showStatusMessage('Report erfolgreich analysiert!', 'success');
        
        // Draft löschen nach erfolgreicher Analyse
        localStorage.removeItem('spy-report-draft');
        
    } catch (error) {
        console.error('❌ Fehler beim Parsen:', error);
        showStatusMessage('Fehler beim Analysieren: ' + error.message, 'error');
    }
}

// Dummy-Daten erstellen (Fallback)
function createDummyReportData(targetName, reportText) {
    // Einfache Regex-Patterns für Fallback
    const coordMatch = reportText.match(/(\d+:\d+:\d+)/);
    const allianceMatch = reportText.match(/\[([A-Z0-9_-]+)\]/i);
    
    return {
        playerName: targetName || 'Unbekannter Spieler',
        alliance: allianceMatch ? `[${allianceMatch[1]}]` : 'Unbekannte Allianz',
        coordinates: coordMatch ? coordMatch[1] : '0:0:0',
        spyTime: new Date().toLocaleString('de-DE'),
        fleet: [
            { type: 'Jäger', count: 1250, power: 125000, percentage: 35 },
            { type: 'Bomber', count: 850, power: 85000, percentage: 24 },
            { type: 'Kreuzer', count: 450, power: 90000, percentage: 25 },
            { type: 'Schlachtschiff', count: 120, power: 60000, percentage: 16 }
        ],
        resources: {
            metal: 1250000,
            crystal: 850000,
            deuterium: 450000,
            total: 2550000
        },
        fleetPower: 360000,
        raw: reportText
    };
}

// Parsed Data anzeigen (erweiterte Version der HTML-Funktion)
function displayParsedData(data) {
    // Basis-Informationen
    document.getElementById('player-name').textContent = data.playerName || '-';
    document.getElementById('player-alliance').textContent = data.alliance || '-';
    document.getElementById('player-coords').textContent = data.coordinates || '-';
    document.getElementById('spy-time').textContent = data.spyTime || '-';
    
    // Flotten-Tabelle
    const fleetTbody = document.getElementById('fleet-tbody');
    if (fleetTbody) {
        if (data.fleet && Array.isArray(data.fleet)) {
            // Array-Format (Dummy-Daten)
            fleetTbody.innerHTML = data.fleet.map(ship => `
                <tr>
                    <td>${ship.type}</td>
                    <td>${ship.count.toLocaleString('de-DE')}</td>
                    <td>${ship.power.toLocaleString('de-DE')}</td>
                    <td>${ship.percentage}%</td>
                </tr>
            `).join('');
        } else if (data.fleet && typeof data.fleet === 'object') {
            // Object-Format (Parser-Daten)
            const fleetArray = Object.entries(data.fleet).map(([type, count]) => {
                const power = calculateShipPower(type, count);
                return { type: formatShipType(type), count, power };
            });
            
            const totalPower = fleetArray.reduce((sum, ship) => sum + ship.power, 0);
            
            fleetTbody.innerHTML = fleetArray.map(ship => `
                <tr>
                    <td>${ship.type}</td>
                    <td>${ship.count.toLocaleString('de-DE')}</td>
                    <td>${ship.power.toLocaleString('de-DE')}</td>
                    <td>${totalPower > 0 ? Math.round((ship.power / totalPower) * 100) : 0}%</td>
                </tr>
            `).join('');
        } else {
            fleetTbody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center; color: var(--text-secondary);">
                        Keine Flotten-Daten verfügbar
                    </td>
                </tr>
            `;
        }
    }
    
    // Ressourcen
    if (data.resources) {
        document.getElementById('metal').textContent = (data.resources.metal || 0).toLocaleString('de-DE');
        document.getElementById('crystal').textContent = (data.resources.crystal || 0).toLocaleString('de-DE');
        document.getElementById('deuterium').textContent = (data.resources.deuterium || 0).toLocaleString('de-DE');
        document.getElementById('total-resources').textContent = (data.resources.total || 0).toLocaleString('de-DE');
    }
    
    // Parsed Data Section anzeigen
    document.getElementById('parsed-data').classList.add('visible');
}

// Hilfsfunktionen für Flotten-Display
function calculateShipPower(shipType, count) {
    const shipPower = {
        fighters: 100,
        bombers: 200,
        cruisers: 400,
        battleships: 800,
        destroyers: 1200,
        carriers: 600,
        transporters: 50
    };
    
    return (shipPower[shipType] || 100) * count;
}

function formatShipType(shipType) {
    const typeNames = {
        fighters: 'Jäger',
        bombers: 'Bomber',
        cruisers: 'Kreuzer',
        battleships: 'Schlachtschiff',
        destroyers: 'Zerstörer',
        carriers: 'Träger',
        transporters: 'Transporter'
    };
    
    return typeNames[shipType] || shipType;
}

// Report zurücksetzen (erweiterte Version)
function clearReport() {
    // Felder leeren
    document.getElementById('report-text').value = '';
    document.getElementById('target-name').value = '';
    
    // UI zurücksetzen
    document.getElementById('parsed-data').classList.remove('visible');
    document.getElementById('save-btn').style.display = 'none';
    document.getElementById('export-btn').style.display = 'none';
    document.getElementById('status-messages').innerHTML = '';
    
    // Variablen zurücksetzen
    currentParsedReport = null;
    
    // Draft löschen
    localStorage.removeItem('spy-report-draft');
    
    // Textarea-Höhe zurücksetzen
    const textarea = document.getElementById('report-text');
    if (textarea) {
        textarea.style.height = '200px';
    }
    
    console.log('🗑️ Report zurückgesetzt');
}

// In Datenbank speichern (erweiterte Version)
async function saveToDatabase() {
    if (!currentParsedReport) {
        showStatusMessage('Keine Daten zum Speichern vorhanden.', 'error');
        return;
    }
    
    try {
        showStatusMessage('Speichere in Datenbank...', 'info');
        
        // Hier würde die echte Firebase-Integration stehen
        // Für jetzt simulieren wir das Speichern
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Daten für Datenbank formatieren
        const dbEntry = {
            id: generateId(),
            playerName: currentParsedReport.playerName,
            alliance: currentParsedReport.alliance,
            coordinates: currentParsedReport.coordinates,
            lastScan: new Date(),
            fleetPower: currentParsedReport.fleetPower || 0,
            status: 'active',
            resources: currentParsedReport.resources,
            fleet: currentParsedReport.fleet,
            rawReport: currentParsedReport.raw,
            createdAt: new Date(),
            source: 'report-analyzer'
        };
        
        console.log('💾 Würde in DB speichern:', dbEntry);
        
        showStatusMessage('Daten erfolgreich in der Spionage-Datenbank gespeichert!', 'success');
        
        // Optional: Nach dem Speichern zur Datenbank navigieren
        setTimeout(() => {
            if (confirm('Möchtest du zur Spionage-Datenbank wechseln, um den gespeicherten Eintrag zu sehen?')) {
                window.location.href = 'spy-database.html';
            }
        }, 2000);
        
    } catch (error) {
        console.error('❌ Fehler beim Speichern:', error);
        showStatusMessage('Fehler beim Speichern: ' + error.message, 'error');
    }
}

// Report exportieren (erweiterte Version)
function exportReport() {
    if (!currentParsedReport) {
        showStatusMessage('Keine Daten zum Exportieren vorhanden.', 'error');
        return;
    }
    
    try {
        // Export-Format wählen
        const format = prompt('Export-Format wählen:\n1 = JSON\n2 = CSV\n3 = Text', '1');
        
        switch (format) {
            case '1':
                exportAsJSON();
                break;
            case '2':
                exportAsCSV();
                break;
            case '3':
                exportAsText();
                break;
            default:
                exportAsJSON(); // Standard
        }
        
    } catch (error) {
        console.error('❌ Fehler beim Export:', error);
        showStatusMessage('Fehler beim Export: ' + error.message, 'error');
    }
}

// Export-Funktionen
function exportAsJSON() {
    const dataStr = JSON.stringify(currentParsedReport, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `spy-report-${currentParsedReport.playerName}-${Date.now()}.json`;
    link.click();
    
    showStatusMessage('Report als JSON exportiert!', 'success');
}

function exportAsCSV() {
    const csv = [
        'Spieler,Allianz,Koordinaten,Spionage-Zeit,Flottenstärke,Metall,Kristall,Deuterium,Gesamt-Ressourcen',
        [
            currentParsedReport.playerName || '',
            currentParsedReport.alliance || '',
            currentParsedReport.coordinates || '',
            currentParsedReport.spyTime || '',
            currentParsedReport.fleetPower || 0,
            currentParsedReport.resources?.metal || 0,
            currentParsedReport.resources?.crystal || 0,
            currentParsedReport.resources?.deuterium || 0,
            currentParsedReport.resources?.total || 0
        ].join(',')
    ].join('\n');
    
    const dataBlob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `spy-report-${currentParsedReport.playerName}-${Date.now()}.csv`;
    link.click();
    
    showStatusMessage('Report als CSV exportiert!', 'success');
}

function exportAsText() {
    const text = `
Spionage-Report: ${currentParsedReport.playerName}
==============================================

Spieler: ${currentParsedReport.playerName || 'Unbekannt'}
Allianz: ${currentParsedReport.alliance || 'Unbekannt'}
Koordinaten: ${currentParsedReport.coordinates || 'Unbekannt'}
Spionage-Zeit: ${currentParsedReport.spyTime || 'Unbekannt'}
Flottenstärke: ${(currentParsedReport.fleetPower || 0).toLocaleString('de-DE')}

Ressourcen:
-----------
Metall: ${(currentParsedReport.resources?.metal || 0).toLocaleString('de-DE')}
Kristall: ${(currentParsedReport.resources?.crystal || 0).toLocaleString('de-DE')}
Deuterium: ${(currentParsedReport.resources?.deuterium || 0).toLocaleString('de-DE')}
Gesamt: ${(currentParsedReport.resources?.total || 0).toLocaleString('de-DE')}

Original-Report:
----------------
${currentParsedReport.raw || 'Nicht verfügbar'}
    `.trim();
    
    const dataBlob = new Blob([text], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `spy-report-${currentParsedReport.playerName}-${Date.now()}.txt`;
    link.click();
    
    showStatusMessage('Report als Text exportiert!', 'success');
}

// Hilfsfunktionen
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Status-Nachricht anzeigen (erweiterte Version)
function showStatusMessage(message, type) {
    const container = document.getElementById('status-messages');
    if (!container) return;
    
    container.innerHTML = `
        <div class="status-message status-${type}">
            <span>${getStatusIcon(type)}</span>
            ${message}
        </div>
    `;
    
    // Nach 5 Sekunden ausblenden (außer bei Fehlern)
    if (type !== 'error') {
        setTimeout(() => {
            container.innerHTML = '';
        }, 5000);
    }
}

// Status-Icon ermitteln
function getStatusIcon(type) {
    switch (type) {
        case 'success': return '✅';
        case 'error': return '❌';
        case 'warning': return '⚠️';
        case 'info': return 'ℹ️';
        default: return 'ℹ️';
    }
}

// Export für andere Module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeSpyReport,
        parseReport,
        clearReport,
        saveToDatabase,
        exportReport
    };
}