/**
 * Sabo-Counter JavaScript - js/sabo-counter.js
 * Für dashboard-sabo-counter.html und sabo-counter.html
 * Abhängigkeiten: firebase-config.js, auth-manager.js (optional für Dashboard-Features)
 */

// Gebäude-Punkte-System
const BUILDING_POINTS = {
    'Planetenzentrale': 3,
    'Raumhafen': 1,
    'Wohngebäude': 1,
    'Solarpark': 1,
    'Eisenmine': 2,
    'Siliziumraffinerie': 2,
    'Kohlenstoffgewinnungsanlage': 2,
    'Bohrturm': 2,
    'Chemiefabrik': 2,
    'Recyclinganlage': 1,
    'Rohstofflager': 1,
    'Schiffsfabrik': 3,
    'Waffenfabrik': 3,
    'Forschungszentrum': 3
};

// Alle möglichen Gebäudenamen (erweiterte Liste für bessere Erkennung)
// const ALL_BUILDING_NAMES = [
//     'Planetenzentrale', 'Raumhafen', 'Wohngebäude', 'Solarpark',
//     'Eisenmine', 'Siliziumraffinerie', 'Kohlenstoffgewinnungsanlage',
//     'Bohrturm', 'Chemiefabrik', 'Recyclinganlage', 'Rohstofflager',
//     'Schiffsfabrik', 'Waffenfabrik', 'Forschungszentrum',
//     // Zusätzliche mögliche Varianten
//     'Eismine', 'Solaranlage', 'Forschungslabor', 'Militärfabrik'
// ];

// Globale Variablen
let currentSabotageData = null;
let currentUser = null;
let userData = null;
let isDashboardMode = false;

// Initialisierung beim Laden der Seite
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Prüfen ob Dashboard-Modus (basierend auf URL oder Elementen)
        isDashboardMode = window.location.pathname.includes('dashboard-sabo') || 
                         document.getElementById('dashboard-status') !== null;
        
        // Warten bis AuthManager bereit ist (falls vorhanden)
        if (window.AuthAPI && isDashboardMode) {
            await window.AuthAPI.waitForInit();
            
            // Auth State überwachen
            window.AuthAPI.onAuthStateChange(async (user, userDataFromAuth) => {
                if (user && userDataFromAuth) {
                    currentUser = user;
                    userData = userDataFromAuth;
                    
                    // Dashboard-Features aktivieren
                    enableDashboardFeatures();
                    
                    // Letzte Sabotagen laden
                    await loadRecentSabotages();
                    
                    // Aktivität hinzufügen
                    setTimeout(() => {
                        if (window.AuthAPI.addActivity) {
                            window.AuthAPI.addActivity('💥', 'Sabo-Counter (Dashboard) besucht');
                        }
                    }, 2000);
                    
                } else {
                    enableStandardFeatures();
                }
            });
        } else {
            ');
            enableStandardFeatures();
        }
        
        // Event-Listener einrichten
        setupEventListeners();
        
    } catch (error) {
        console.error('❌ Sabo-Counter Initialisierung fehlgeschlagen:', error);
        enableStandardFeatures(); // Fallback
    }
});

// Event-Listener einrichten
function setupEventListeners() {
    // Keyboard-Shortcuts
    document.addEventListener('keydown', function(e) {
        // Strg+S = Speichern
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            const saveBtn = document.getElementById('save-btn');
            if (saveBtn && !saveBtn.disabled) {
                saveSabotageData();
            }
        }
        
        // Strg+Enter = Berechnen
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            calculateSabotage();
        }
        
        // Strg+D = Dashboard
        if (e.ctrlKey && e.key === 'd') {
            e.preventDefault();
            window.location.href = 'dashboard.html';
        }
        
        // Strg+Delete = Alles löschen
        if (e.ctrlKey && e.key === 'Delete') {
            e.preventDefault();
            if (confirm('Alle Eingaben löschen?')) {
                clearAll();
            }
        }
    });

    // Auto-Save Warnung beim Verlassen der Seite
    window.addEventListener('beforeunload', function(e) {
        if (currentSabotageData && currentUser && 
            document.getElementById('save-btn') && 
            !document.getElementById('save-btn').disabled) {
            e.preventDefault();
            e.returnValue = 'Sie haben ungespeicherte Sabotage-Daten. Möchten Sie die Seite wirklich verlassen?';
            return e.returnValue;
        }
    });

    // Sabo-Counter-Nutzung tracken
    const saboReports = document.getElementById('sabo-reports');
    if (saboReports) {
        saboReports.addEventListener('input', function() {
            if (this.value.length > 100) { // Erst nach sinnvoller Eingabe
                onSabotageCounterUsed();
            }
        });
    }
}

// Dashboard-Features aktivieren
function enableDashboardFeatures() {
    const saveBtn = document.getElementById('save-btn');
    if (saveBtn) {
        saveBtn.style.display = 'inline-block';
        saveBtn.disabled = true;
    }
    
    const dashboardStatus = document.getElementById('dashboard-status');
    if (dashboardStatus) {
        dashboardStatus.textContent = `💾 Dashboard-Modus aktiv für ${userData?.username || 'User'}`;
        dashboardStatus.style.background = 'linear-gradient(135deg, var(--success-color), #16a34a)';
    }
    
    }

// Standard-Features aktivieren (ohne Dashboard)
function enableStandardFeatures() {
    const saveBtn = document.getElementById('save-btn');
    if (saveBtn) {
        saveBtn.style.display = 'none';
    }
    
    const dashboardStatus = document.getElementById('dashboard-status');
    if (dashboardStatus) {
        dashboardStatus.innerHTML = `
            ⚔️ Standard Sabo-Counter | 
            <a href="register.html" style="color: white; text-decoration: underline;">
                Account erstellen
            </a> für automatisches Speichern
        `;
    }
    
    }

// Zahlen-Hilfsfunktionen
// function parseNumber(str) {
//     if (!str) return 0;
//     // Entferne alle Punkte und Leerzeichen, aber behalte Kommas
//     return parseInt(str.toString().replace(/[.\s]/g, '').replace(/,/g, '')) || 0;
// }

function formatNumber(num) {
    if (!num || num === 0) return '0';
    return num.toLocaleString('de-DE');
}

// Gebäudename normalisieren (für bessere Erkennung)
function normalizeBuilding(buildingName) {
    const name = buildingName.trim();
    
    // Exakte Matches zuerst
    if (Object.prototype.hasOwnProperty.call(BUILDING_POINTS, name)) {
        return name;
    }
    
    // Fuzzy Matching für häufige Varianten
    const variations = {
        'eismine': 'Eisenmine',
        'solaranlage': 'Solarpark',
        'forschungslabor': 'Forschungszentrum',
        'militärfabrik': 'Waffenfabrik',
        'pz': 'Planetenzentrale',
        'rh': 'Raumhafen'
    };
    
    const lowerName = name.toLowerCase();
    if (variations[lowerName]) {
        return variations[lowerName];
    }
    
    // Partial matching
    for (const key of Object.keys(BUILDING_POINTS)) {
        if (key.toLowerCase().includes(lowerName) || lowerName.includes(key.toLowerCase())) {
            return key;
        }
    }
    
    return name; // Rückgabe des ursprünglichen Namens wenn nichts gefunden
}

// HAUPTFUNKTION: Sabotage-Berechnung
function calculateSabotage() {
    const saboText = document.getElementById('sabo-reports').value;
    
    if (!saboText.trim()) {
        alert('Bitte fügen Sie Sabotage-Berichte ein!');
        return;
    }
    
    // Initialisiere Gebäude-Zähler und Statistiken
    const buildings = {};
    let saboCount = 0;
    let totalLevels = 0;
    let totalPoints = 0;
    
    const lines = saboText.split('\n');
    let inSabotageReport = false;
    let inBuildingList = false;
    let currentSabotage = null;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        // Erkenne Sabotage-Start (verschiedene Varianten)
        if (line.includes('sabotierte erfolgreich') || 
            line.includes('Sabotage erfolgreich') ||
            line.includes('Sabotage-Aktion erfolgreich')) {
            
            saboCount++;
            inSabotageReport = true;
            inBuildingList = false;
            currentSabotage = {
                buildings: {},
                totalLevels: 0,
                totalPoints: 0
            };
            
            continue;
        }
        
        // Erkenne Gebäude-Liste-Start
        if (inSabotageReport && (
            line.includes('Gebäude') && line.includes('Stufen') ||
            line.includes('Zerstört') ||
            line.includes('Beschädigt'))) {
            
            inBuildingList = true;
            continue;
        }
        
        // Parse Gebäude-Zeilen wenn in Gebäude-Liste
        if (inBuildingList && line.length > 0) {
            const buildingData = parseBuildingLine(line);
            
            if (buildingData.name && buildingData.levels > 0) {
                const normalizedName = normalizeBuilding(buildingData.name);
                
                if (Object.prototype.hasOwnProperty.call(BUILDING_POINTS, normalizedName)) {
                    // Gültiges Gebäude gefunden
                    if (!buildings[normalizedName]) {
                        buildings[normalizedName] = 0;
                    }
                    buildings[normalizedName] += buildingData.levels;
                    totalLevels += buildingData.levels;
                    totalPoints += buildingData.levels * BUILDING_POINTS[normalizedName];
                    
                    // Für aktuellen Sabotage-Bericht
                    if (currentSabotage) {
                        if (!currentSabotage.buildings[normalizedName]) {
                            currentSabotage.buildings[normalizedName] = 0;
                        }
                        currentSabotage.buildings[normalizedName] += buildingData.levels;
                        currentSabotage.totalLevels += buildingData.levels;
                        currentSabotage.totalPoints += buildingData.levels * BUILDING_POINTS[normalizedName];
                    }
                    
                    `);
                } else {
                    console.warn('⚠️ Unbekanntes Gebäude:', buildingData.name);
                }
            }
            
            // Beende Gebäude-Liste bei leerer Zeile oder neuem Sabotage-Bericht
            if (line.length === 0 || line.includes('sabotierte erfolgreich')) {
                inBuildingList = false;
                inSabotageReport = false;
                currentSabotage = null;
            }
        }
    }
    
    // Berechne Durchschnitt
    const averagePoints = saboCount > 0 ? Math.round(totalPoints / saboCount) : 0;
    
    // Update UI
    updateSabotageStats(saboCount, totalLevels, totalPoints, averagePoints);
    updateBuildingOverview(buildings);
    updateSummaryBuildingList(buildings);
    updateBuildingDetailsTable(buildings);
    
    // Sabotage-Daten für Speichern vorbereiten
    currentSabotageData = {
        saboText: saboText,
        buildings: buildings,
        saboCount: saboCount,
        totalLevels: totalLevels,
        totalPoints: totalPoints,
        averagePoints: averagePoints,
        timestamp: new Date()
    };
    
    // Save-Button aktivieren falls User eingeloggt
    const saveBtn = document.getElementById('save-btn');
    if (saveBtn && currentUser && totalPoints > 0) {
        saveBtn.disabled = false;
    }
    
    }

// Gebäude-Zeile parsen (robuste Variante)
function parseBuildingLine(line) {
    // Entferne führende Symbole und Leerzeichen
    line = line.replace(/^[•\-*+\s]+/, '').trim();
    
    // Verschiedene Formate versuchen:
    // Format 1: "Gebäudename 5" oder "Gebäudename: 5"
    let match = line.match(/^(.+?)[:\s]+(\d+)$/);
    if (match) {
        return {
            name: match[1].trim(),
            levels: parseInt(match[2])
        };
    }
    
    // Format 2: "5 Gebäudename" 
    match = line.match(/^(\d+)\s+(.+)$/);
    if (match) {
        return {
            name: match[2].trim(),
            levels: parseInt(match[1])
        };
    }
    
    // Format 3: "Gebäudename (5)" oder "Gebäudename [5]"
    match = line.match(/^(.+?)\s*[([]]\s*(\d+)\s*[)\]]$/);
    if (match) {
        return {
            name: match[1].trim(),
            levels: parseInt(match[2])
        };
    }
    
    // Format 4: Nur Gebäudename (0 Stufen angenommen)
    if (line.length > 0 && !/\d/.test(line)) {
        return {
            name: line,
            levels: 0
        };
    }
    
    // Nichts gefunden
    return {
        name: '',
        levels: 0
    };
}

// UI Update-Funktionen
function updateSabotageStats(saboCount, totalLevels, totalPoints, averagePoints) {
    const elements = {
        'sabo-count': saboCount,
        'total-levels': formatNumber(totalLevels),
        'total-points': formatNumber(totalPoints),
        'average-points': formatNumber(averagePoints)
    };
    
    for (const [id, value] of Object.entries(elements)) {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    }
}

function updateBuildingOverview(buildings) {
    const buildingTypes = Object.keys(buildings).length;
    const buildingTypesElement = document.getElementById('building-types');
    if (buildingTypesElement) buildingTypesElement.textContent = buildingTypes;
    
    // Meistgetroffenes Gebäude
    let mostHitBuilding = '-';
    let mostHitCount = 0;
    for (const [building, count] of Object.entries(buildings)) {
        if (count > mostHitCount) {
            mostHitCount = count;
            mostHitBuilding = `${building} (${count})`;
        }
    }
    const mostHitElement = document.getElementById('most-hit-building');
    if (mostHitElement) mostHitElement.textContent = mostHitBuilding;
    
    // Wertvollstes Ziel (nach Gesamtpunkten)
    let mostValuableBuilding = '-';
    let mostValuablePoints = 0;
    for (const [building, count] of Object.entries(buildings)) {
        const points = count * BUILDING_POINTS[building];
        if (points > mostValuablePoints) {
            mostValuablePoints = points;
            mostValuableBuilding = `${building} (${points} Pkt.)`;
        }
    }
    const mostValuableElement = document.getElementById('most-valuable-building');
    if (mostValuableElement) mostValuableElement.textContent = mostValuableBuilding;
}

function updateSummaryBuildingList(buildings) {
    // Update Anzahl der Berichte
    const reportsEvaluated = document.getElementById('reports-evaluated');
    const saboCount = document.getElementById('sabo-count');
    if (reportsEvaluated && saboCount) {
        reportsEvaluated.textContent = saboCount.textContent;
    }
    
    // Alle Gebäude-IDs definieren
    const buildingIds = {
        'Planetenzentrale': 'levels-planetenzentrale',
        'Raumhafen': 'levels-raumhafen',
        'Wohngebäude': 'levels-wohngebäude',
        'Solarpark': 'levels-solarpark',
        'Eisenmine': 'levels-eisenmine',
        'Siliziumraffinerie': 'levels-siliziumraffinerie',
        'Kohlenstoffgewinnungsanlage': 'levels-kohlenstoffgewinnungsanlage',
        'Bohrturm': 'levels-bohrturm',
        'Chemiefabrik': 'levels-chemiefabrik',
        'Recyclinganlage': 'levels-recyclinganlage',
        'Rohstofflager': 'levels-rohstofflager',
        'Schiffsfabrik': 'levels-schiffsfabrik',
        'Waffenfabrik': 'levels-waffenfabrik',
        'Forschungszentrum': 'levels-forschungszentrum'
    };
    
    // Alle Gebäude auf 0 setzen
    Object.values(buildingIds).forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = '0';
        }
    });
    
    // Aktualisiere mit den tatsächlichen Werten
    for (const [building, levels] of Object.entries(buildings)) {
        const id = buildingIds[building];
        if (id) {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = formatNumber(levels);
            }
        }
    }
}

function updateBuildingDetailsTable(buildings) {
    const tableBody = document.getElementById('building-details-body');
    const detailsSection = document.getElementById('building-details');
    
    if (Object.keys(buildings).length === 0) {
        if (detailsSection) detailsSection.style.display = 'none';
        return;
    }
    
    if (!tableBody) return;
    
    let tableHTML = '';
    
    // Sortiere Gebäude nach Gesamtpunkten (absteigend)
    const sortedBuildings = Object.entries(buildings).sort((a, b) => {
        const pointsA = a[1] * BUILDING_POINTS[a[0]];
        const pointsB = b[1] * BUILDING_POINTS[b[0]];
        return pointsB - pointsA;
    });
    
    for (const [building, levels] of sortedBuildings) {
        const pointsPerLevel = BUILDING_POINTS[building];
        const totalPoints = levels * pointsPerLevel;
        
        tableHTML += `
            <tr>
                <td class="building-name">${building}</td>
                <td class="levels-destroyed">${formatNumber(levels)}</td>
                <td class="points-earned">${pointsPerLevel}</td>
                <td class="points-earned">${formatNumber(totalPoints)}</td>
            </tr>
        `;
    }
    
    tableBody.innerHTML = tableHTML;
    if (detailsSection) detailsSection.style.display = 'block';
}

// Sabotage-Daten speichern (Dashboard-Funktion)
async function saveSabotageData() {
    if (!currentUser || !currentSabotageData) {
        showSaveStatus('Keine Daten zum Speichern vorhanden', 'error');
        return;
    }
    
    const saveBtn = document.getElementById('save-btn');
    if (!saveBtn) return;
    
    saveBtn.disabled = true;
    saveBtn.textContent = '💾 Speichert...';
    
    try {
        // Sabotage-Daten in Firestore speichern
        const db = window.FirebaseConfig.getDB();
        const sabotageDoc = {
            userId: currentUser.uid,
            timestamp: window.FirebaseConfig.getServerTimestamp(),
            saboText: currentSabotageData.saboText,
            buildings: currentSabotageData.buildings,
            saboCount: currentSabotageData.saboCount,
            totalLevels: currentSabotageData.totalLevels,
            totalPoints: currentSabotageData.totalPoints,
            averagePoints: currentSabotageData.averagePoints,
            sabotageType: 'building_sabotage'
        };
        
        const docRef = await db.collection('userSabotages').add(sabotageDoc);
        
        // Dashboard-Statistiken aktualisieren
        await updateDashboardSabotageStats();
        
        // Aktivität hinzufügen
        if (window.AuthAPI && window.AuthAPI.addActivity) {
            await window.AuthAPI.addActivity('💥', `Sabotage gespeichert (${currentSabotageData.saboCount} Sabotagen, ${formatNumber(currentSabotageData.totalPoints)} Punkte)`);
        }
        
        showSaveStatus(`Sabotage erfolgreich gespeichert! (${currentSabotageData.saboCount} Sabotagen)`, 'success');
        // Letzte Sabotagen neu laden
        await loadRecentSabotages();
        
        // Event für Dashboard-Updates
        document.dispatchEvent(new CustomEvent('sabotageDataUpdated', { 
            detail: currentSabotageData 
        }));
        
    } catch (error) {
        console.error('❌ Fehler beim Speichern der Sabotage:', error);
        showSaveStatus('Fehler beim Speichern der Sabotage', 'error');
    } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = '💾 Sabotage Speichern';
    }
}

// Dashboard-Sabotage-Statistiken aktualisieren
async function updateDashboardSabotageStats() {
    try {
        if (!currentUser || !window.FirebaseConfig) return;
        
        const db = window.FirebaseConfig.getDB();
        const statsRef = db.collection('userStats').doc(currentUser.uid);
        const statsDoc = await statsRef.get();
        
        let currentStats = { 
            sabotages: 0, 
            totalSabotagePoints: 0, 
            totalLevelsDestroyed: 0,
            destroyedBuildings: {}
        };
        if (statsDoc.exists) {
            currentStats = { ...currentStats, ...statsDoc.data() };
        }
        
        // Stelle sicher, dass destroyedBuildings existiert
        if (!currentStats.destroyedBuildings) {
            currentStats.destroyedBuildings = {};
        }
        
        // Neue Sabotage-Stats hinzufügen
        const updatedStats = {
            sabotages: (currentStats.sabotages || 0) + currentSabotageData.saboCount,
            totalSabotagePoints: (currentStats.totalSabotagePoints || 0) + currentSabotageData.totalPoints,
            totalLevelsDestroyed: (currentStats.totalLevelsDestroyed || 0) + currentSabotageData.totalLevels,
            lastSabotageUpdate: window.FirebaseConfig.getServerTimestamp()
        };

        // Gebäude-spezifische Statistiken aktualisieren
        if (!updatedStats.destroyedBuildings) {
            updatedStats.destroyedBuildings = {};
        }
        
        // Initialisiere alle Gebäude-Typen mit 0 falls sie nicht existieren
        for (const building of Object.keys(BUILDING_POINTS)) {
            if (!updatedStats.destroyedBuildings[building]) {
                updatedStats.destroyedBuildings[building] = 0;
            }
        }
        
        // Füge die neuen zerstörten Gebäude hinzu
        for (const [building, count] of Object.entries(currentSabotageData.buildings)) {
            if (BUILDING_POINTS[building]) {
                updatedStats.destroyedBuildings[building] = 
                    (updatedStats.destroyedBuildings[building] || 0) + count;
            }
        }
        
        await statsRef.set(updatedStats, { merge: true });
        
        } catch (error) {
        console.error('❌ Fehler beim Aktualisieren der Sabotage-Statistiken:', error);
    }
}

// Letzte Sabotagen laden
async function loadRecentSabotages() {
    try {
        if (!currentUser || !window.FirebaseConfig) return;
        
        const db = window.FirebaseConfig.getDB();
        const sabotagesQuery = await db.collection('userSabotages')
            .where('userId', '==', currentUser.uid)
            .orderBy('timestamp', 'desc')
            .limit(5)
            .get();
        
        const recentSabotagesList = document.getElementById('recent-sabotages-list');
        const recentSabotagesSection = document.getElementById('recent-sabotages-section');
        
        if (sabotagesQuery.empty) {
            if (recentSabotagesSection) recentSabotagesSection.style.display = 'none';
            return;
        }
        
        let sabotagesHTML = '';
        sabotagesQuery.forEach(doc => {
            const sabotage = doc.data();
            const sabotageDate = sabotage.timestamp.toDate();
            const timeAgo = getTimeAgo(sabotageDate);
            
            sabotagesHTML += `
                <div class="sabotage-history-item">
                    <div class="sabotage-meta">
                        <span><strong>${sabotage.saboCount || 0} Sabotagen</strong> - ${formatNumber(sabotage.totalPoints || 0)} Punkte</span>
                        <span>${timeAgo}</span>
                    </div>
                    <div class="sabotage-stats">
                        <div class="sabotage-stat">
                            <span>Stufen zerstört:</span>
                            <span>${formatNumber(sabotage.totalLevels || 0)}</span>
                        </div>
                        <div class="sabotage-stat">
                            <span>Ø Punkte/Sabo:</span>
                            <span>${formatNumber(sabotage.averagePoints || 0)}</span>
                        </div>
                        <div class="sabotage-stat">
                            <span>Gebäudetypen:</span>
                            <span>${Object.keys(sabotage.buildings || {}).length}</span>
                        </div>
                    </div>
                </div>
            `;
        });
        
        if (recentSabotagesList) recentSabotagesList.innerHTML = sabotagesHTML;
        if (recentSabotagesSection) recentSabotagesSection.style.display = 'block';
        
        } catch (error) {
        console.error('❌ Fehler beim Laden der letzten Sabotagen:', error);
    }
}

// Save-Status anzeigen
function showSaveStatus(message, type = 'success') {
    const saveStatus = document.getElementById('save-status');
    if (!saveStatus) return;
    
    saveStatus.textContent = message;
    saveStatus.className = `save-status ${type} show`;
    
    setTimeout(() => {
        saveStatus.classList.remove('show');
    }, 3000);
}

// Zeit-Hilfsfunktion
function getTimeAgo(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Gerade eben';
    if (diffMins < 60) return `vor ${diffMins} Min`;
    if (diffHours < 24) return `vor ${diffHours} Std`;
    if (diffDays < 7) return `vor ${diffDays} Tag${diffDays === 1 ? '' : 'en'}`;
    
    return date.toLocaleDateString('de-DE', { 
        day: '2-digit', 
        month: '2-digit',
        year: '2-digit'
    });
}

// Alles löschen
function clearAll() {
    const saboReports = document.getElementById('sabo-reports');
    if (saboReports) saboReports.value = '';
    
    // Reset alle Statistik-Werte auf 0
    const statsElements = ['sabo-count', 'total-levels', 'total-points', 'average-points'];
    statsElements.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.textContent = '0';
    });
    
    // Reset Gebäude-Übersicht
    const overviewElements = {
        'building-types': '0',
        'most-hit-building': '-',
        'most-valuable-building': '-',
        'reports-evaluated': '0'
    };
    
    for (const [id, value] of Object.entries(overviewElements)) {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    }
    
    // Alle Gebäude-Level auf 0 setzen
    const buildingIds = [
        'levels-planetenzentrale', 'levels-raumhafen', 'levels-wohngebäude', 'levels-solarpark',
        'levels-eisenmine', 'levels-siliziumraffinerie', 'levels-kohlenstoffgewinnungsanlage',
        'levels-bohrturm', 'levels-chemiefabrik', 'levels-recyclinganlage', 'levels-rohstofflager',
        'levels-schiffsfabrik', 'levels-waffenfabrik', 'levels-forschungszentrum'
    ];
    
    buildingIds.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.textContent = '0';
    });
    
    // Hide building details table
    const buildingDetails = document.getElementById('building-details');
    if (buildingDetails) buildingDetails.style.display = 'none';
    
    // Save-Button deaktivieren
    const saveBtn = document.getElementById('save-btn');
    if (saveBtn) saveBtn.disabled = true;
    
    // Aktuelle Sabotage-Daten zurücksetzen
    currentSabotageData = null;
    
    }

// Theme Toggle (falls theme-manager.js nicht verfügbar)
function toggleTheme() {
    if (window.ThemeAPI) {
        window.ThemeAPI.toggle();
    } else {
        console.warn('⚠️ ThemeAPI nicht verfügbar');
    }
}

// Dashboard-Integration: Sabo-Counter als genutzt markieren
function onSabotageCounterUsed() {
    if (window.dashboardAPI && window.dashboardAPI.onSabotageCounterUsed) {
        window.dashboardAPI.onSabotageCounterUsed();
    }
}

// Erweiterte Parsing-Funktionen für bessere Sabotage-Erkennung
function parseAdvancedSabotageReport(text) {
    const results = {
        sabotages: [],
        totalSabotages: 0,
        totalBuildings: {},
        errors: []
    };
    
    // Verschiedene Sabotage-Report-Formate
    const sabotagePatterns = [
        /Sie haben .* erfolgreich sabotiert/gi,
        /Sabotage.*erfolgreich/gi,
        /.*sabotierte erfolgreich.*/gi,
        /Sabotage-Aktion.*abgeschlossen/gi
    ];
    
    const lines = text.split('\n');
    let currentSabotage = null;
    let lineIndex = 0;
    
    for (const line of lines) {
        lineIndex++;
        const trimmedLine = line.trim();
        
        if (!trimmedLine) continue;
        
        // Erkenne Sabotage-Start
        let isSabotageStart = false;
        for (const pattern of sabotagePatterns) {
            if (pattern.test(trimmedLine)) {
                isSabotageStart = true;
                break;
            }
        }
        
        if (isSabotageStart) {
            // Speichere vorherige Sabotage falls vorhanden
            if (currentSabotage) {
                results.sabotages.push(currentSabotage);
            }
            
            // Neue Sabotage starten
            currentSabotage = {
                reportLine: lineIndex,
                buildings: {},
                totalLevels: 0,
                totalPoints: 0
            };
            
            results.totalSabotages++;
            continue;
        }
        
        // Parse Gebäude-Zeilen
        if (currentSabotage) {
            const buildingData = parseBuildingLineAdvanced(trimmedLine);
            
            if (buildingData.name && buildingData.levels > 0) {
                const normalizedName = normalizeBuilding(buildingData.name);
                
                if (Object.prototype.hasOwnProperty.call(BUILDING_POINTS, normalizedName)) {
                    if (!currentSabotage.buildings[normalizedName]) {
                        currentSabotage.buildings[normalizedName] = 0;
                    }
                    currentSabotage.buildings[normalizedName] += buildingData.levels;
                    currentSabotage.totalLevels += buildingData.levels;
                    currentSabotage.totalPoints += buildingData.levels * BUILDING_POINTS[normalizedName];
                    
                    // Zu Gesamt-Statistiken hinzufügen
                    if (!results.totalBuildings[normalizedName]) {
                        results.totalBuildings[normalizedName] = 0;
                    }
                    results.totalBuildings[normalizedName] += buildingData.levels;
                } else if (buildingData.name.length > 2) {
                    results.errors.push(`Zeile ${lineIndex}: Unbekanntes Gebäude "${buildingData.name}"`);
                }
            }
        }
    }
    
    // Letzte Sabotage speichern
    if (currentSabotage) {
        results.sabotages.push(currentSabotage);
    }
    
    return results;
}

function parseBuildingLineAdvanced(line) {
    // Entferne HTML-Tags falls vorhanden
    line = line.replace(/<[^>]*>/g, '');
    
    // Entferne führende Symbole
    line = line.replace(/^[•\-*+\s|→>]+/, '').trim();
    
    // Skip leere Zeilen und Header
    if (!line || 
        line.toLowerCase().includes('gebäude') && line.toLowerCase().includes('stufen') ||
        line.toLowerCase().includes('zerstört') ||
        line.toLowerCase().includes('beschädigt') ||
        line.includes('---') ||
        line.includes('===')) {
        return { name: '', levels: 0 };
    }
    
    // Verschiedene Parsing-Ansätze
    const patterns = [
        // "Planetenzentrale: 5"
        /^(.+?)[:\s]+(\d+)$/,
        // "5 Planetenzentrale"
        /^(\d+)\s+(.+)$/,
        // "Planetenzentrale (5)"
        /^(.+?)\s*[([]]\s*(\d+)\s*[)\]]$/,
        // "Planetenzentrale - 5"
        /^(.+?)\s*[-–]\s*(\d+)$/,
        // "Planetenzentrale 5 Stufen"
        /^(.+?)\s+(\d+)\s+[Ss]tufen?$/
    ];
    
    for (const pattern of patterns) {
        const match = line.match(pattern);
        if (match) {
            let name, levels;
            
            if (pattern === patterns[1]) { // "5 Planetenzentrale" Format
                levels = parseInt(match[1]);
                name = match[2].trim();
            } else {
                name = match[1].trim();
                levels = parseInt(match[2]);
            }
            
            // Bereinige Gebäudename
            name = name.replace(/\s*(Stufen?|Level|Lvl)\s*$/i, '').trim();
            
            return { name, levels };
        }
    }
    
    // Wenn nur Gebäudename ohne Zahl (0 Stufen angenommen)
    if (line.length > 2 && !/\d/.test(line)) {
        // Prüfe ob es ein bekanntes Gebäude ist
        const normalizedName = normalizeBuilding(line);
        if (Object.prototype.hasOwnProperty.call(BUILDING_POINTS, normalizedName)) {
            return { name: line, levels: 0 };
        }
    }
    
    return { name: '', levels: 0 };
}

// Test-Funktion für Debugging
function testSabotageParser(testText) {
    const testCases = testText || `
Sie haben Admiral_Evil erfolgreich sabotiert!
Planetenzentrale: 5
Eisenmine: 3
Waffenfabrik: 2

Sie haben TestPlayer erfolgreich sabotiert!
Raumhafen 4
Forschungszentrum 1
    `;
    
    const result = parseAdvancedSabotageReport(testCases);
    return result;
}

// Export-API für Dashboard-Integration
window.SabotageCounterAPI = {
    // Sabotage-Statistiken abrufen
    getStats: async () => {
        if (!currentUser || !window.FirebaseConfig) return null;
        
        try {
            const db = window.FirebaseConfig.getDB();
            const statsDoc = await db.collection('userStats').doc(currentUser.uid).get();
            
            if (statsDoc.exists) {
                const data = statsDoc.data();
                return {
                    totalSabotages: data.sabotages || 0,
                    totalPoints: data.totalSabotagePoints || 0,
                    totalLevelsDestroyed: data.totalLevelsDestroyed || 0,
                    averagePoints: data.sabotages > 0 ? Math.round((data.totalSabotagePoints || 0) / data.sabotages) : 0
                };
            }
            return { totalSabotages: 0, totalPoints: 0, totalLevelsDestroyed: 0, averagePoints: 0 };
        } catch (error) {
            console.error('❌ Fehler beim Abrufen der Sabotage-Stats:', error);
            return null;
        }
    },
    
    // Sabotage-Historie abrufen
    getSabotageHistory: async (limit = 10) => {
        if (!currentUser || !window.FirebaseConfig) return [];
        
        try {
            const db = window.FirebaseConfig.getDB();
            const sabotagesQuery = await db.collection('userSabotages')
                .where('userId', '==', currentUser.uid)
                .orderBy('timestamp', 'desc')
                .limit(limit)
                .get();
            
            const sabotages = [];
            sabotagesQuery.forEach(doc => {
                sabotages.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            return sabotages;
        } catch (error) {
            console.error('❌ Fehler beim Abrufen der Sabotage-Historie:', error);
            return [];
        }
    },
    
    // Prüfen ob User eingeloggt ist
    isLoggedIn: () => !!currentUser,
    
    // Daten neu laden
    reloadData: () => loadRecentSabotages(),
    
    // Aktuelle Berechnung abrufen
    getCurrentCalculation: () => currentSabotageData,
    
    // Manuelle Berechnung starten
    calculate: () => calculateSabotage(),
    
    // Speichern (falls eingeloggt)
    save: () => saveSabotageData(),
    
    // Zurücksetzen
    clear: () => clearAll(),
    
    // Test-Funktionen
    test: testSabotageParser,
    parseText: parseAdvancedSabotageReport,
    
    // Hilfsfunktionen
    formatNumber: formatNumber,
    normalizeBuilding: normalizeBuilding
};

window.saboDebug = {
    testParser: testSabotageParser,
    parseText: parseAdvancedSabotageReport,
    buildings: BUILDING_POINTS,
    currentData: () => currentSabotageData,
    normalizeBuilding: normalizeBuilding,
    isDashboard: () => isDashboardMode,
    currentUser: () => currentUser,
    userData: () => userData
};

// Globale Funktionen für HTML-Buttons (Abwärtskompatibilität)
window.calculateSabotage = calculateSabotage;
window.saveSabotageData = saveSabotageData;
window.clearAll = clearAll;
window.toggleTheme = toggleTheme;

, Strg+Enter (Berechnen), Strg+D (Dashboard), Strg+Delete (Löschen)');
// Auto-Test beim Laden (nur im Development)
setTimeout(() => {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        // testSabotageParser(); // Auskommentiert für Produktion
    }
}, 2000);
