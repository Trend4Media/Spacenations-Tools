/**
 * Spionage-Datenbank JavaScript
 * Verwaltet die Spionage-Datenbank Funktionalität
 */

// Globale Variablen
let spyDatabase = [];
let filteredDatabase = [];
let currentSort = { field: 'lastScan', direction: 'desc' };

// Initialisierung
function initializeSpyDatabase() {
    console.log('🔧 Initialisiere Spionage-Datenbank...');
    
    // Event Listeners setzen
    setupEventListeners();
    
    // Datenbank laden
    loadSpyDatabase();
    
    // Branch-spezifische Konfiguration
    if (window.location.pathname.includes('/testarea/')) {
        console.log('🔧 TESTAREA Modus für Spionage-Datenbank aktiviert');
        document.body.setAttribute('data-branch', 'testarea');
    }
}

// Event Listeners einrichten
function setupEventListeners() {
    // Such- und Filter-Events
    const searchInput = document.getElementById('search');
    const allianceFilter = document.getElementById('alliance-filter');
    const statusFilter = document.getElementById('status-filter');
    
    if (searchInput) {
        searchInput.addEventListener('input', debounce(filterDatabase, 300));
    }
    
    if (allianceFilter) {
        allianceFilter.addEventListener('change', filterDatabase);
    }
    
    if (statusFilter) {
        statusFilter.addEventListener('change', filterDatabase);
    }
    
    // Tabellen-Sortierung
    const tableHeaders = document.querySelectorAll('.table th[data-sort]');
    tableHeaders.forEach(header => {
        header.style.cursor = 'pointer';
        header.addEventListener('click', () => sortDatabase(header.dataset.sort));
    });
}

// Spionage-Datenbank laden
async function loadSpyDatabase() {
    try {
        console.log('📡 Lade Spionage-Datenbank...');
        
        // Dummy-Daten für Demo (später durch echte Firebase-Daten ersetzen)
        spyDatabase = [
            {
                id: '1',
                playerName: 'TestSpieler1',
                alliance: '[ABC] Test Alliance',
                coordinates: '1:234:5',
                lastScan: new Date(Date.now() - 2 * 60 * 60 * 1000), // vor 2 Stunden
                fleetPower: 125000,
                status: 'active',
                resources: { metal: 1250000, crystal: 850000, deuterium: 450000 },
                fleet: { fighters: 1250, bombers: 850, cruisers: 450 }
            },
            {
                id: '2',
                playerName: 'TestSpieler2',
                alliance: '[XYZ] Another Alliance',
                coordinates: '2:345:6',
                lastScan: new Date(Date.now() - 6 * 60 * 60 * 1000), // vor 6 Stunden
                fleetPower: 85000,
                status: 'inactive',
                resources: { metal: 850000, crystal: 650000, deuterium: 300000 },
                fleet: { fighters: 850, bombers: 450, cruisers: 200 }
            },
            {
                id: '3',
                playerName: 'TestSpieler3',
                alliance: '[ABC] Test Alliance',
                coordinates: '3:456:7',
                lastScan: new Date(Date.now() - 24 * 60 * 60 * 1000), // vor 24 Stunden
                fleetPower: 95000,
                status: 'pending',
                resources: { metal: 950000, crystal: 750000, deuterium: 400000 },
                fleet: { fighters: 950, bombers: 600, cruisers: 300 }
            }
        ];
        
        filteredDatabase = [...spyDatabase];
        
        // UI aktualisieren
        updateAllianceFilter();
        renderDatabase();
        updateStatistics();
        
        console.log('✅ Spionage-Datenbank geladen:', spyDatabase.length, 'Einträge');
        
    } catch (error) {
        console.error('❌ Fehler beim Laden der Spionage-Datenbank:', error);
        showError('Fehler beim Laden der Datenbank: ' + error.message);
    }
}

// Allianz-Filter aktualisieren
function updateAllianceFilter() {
    const allianceFilter = document.getElementById('alliance-filter');
    if (!allianceFilter) return;
    
    // Unique Allianzen sammeln
    const alliances = [...new Set(spyDatabase.map(entry => entry.alliance))];
    
    // Filter-Optionen hinzufügen
    allianceFilter.innerHTML = '<option value="">Alle Allianzen</option>';
    alliances.forEach(alliance => {
        const option = document.createElement('option');
        option.value = alliance;
        option.textContent = alliance;
        allianceFilter.appendChild(option);
    });
}

// Datenbank filtern
function filterDatabase() {
    const searchTerm = document.getElementById('search')?.value.toLowerCase() || '';
    const allianceFilter = document.getElementById('alliance-filter')?.value || '';
    const statusFilter = document.getElementById('status-filter')?.value || '';
    
    filteredDatabase = spyDatabase.filter(entry => {
        const matchesSearch = !searchTerm || 
            entry.playerName.toLowerCase().includes(searchTerm) ||
            entry.alliance.toLowerCase().includes(searchTerm) ||
            entry.coordinates.toLowerCase().includes(searchTerm);
            
        const matchesAlliance = !allianceFilter || entry.alliance === allianceFilter;
        const matchesStatus = !statusFilter || entry.status === statusFilter;
        
        return matchesSearch && matchesAlliance && matchesStatus;
    });
    
    renderDatabase();
    updateStatistics();
}

// Datenbank sortieren
function sortDatabase(field) {
    if (currentSort.field === field) {
        currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
        currentSort.field = field;
        currentSort.direction = 'asc';
    }
    
    filteredDatabase.sort((a, b) => {
        let aVal = a[field];
        let bVal = b[field];
        
        // Spezielle Behandlung für verschiedene Datentypen
        if (field === 'lastScan') {
            aVal = new Date(aVal).getTime();
            bVal = new Date(bVal).getTime();
        } else if (typeof aVal === 'string') {
            aVal = aVal.toLowerCase();
            bVal = bVal.toLowerCase();
        }
        
        if (aVal < bVal) return currentSort.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return currentSort.direction === 'asc' ? 1 : -1;
        return 0;
    });
    
    renderDatabase();
    updateSortIndicators();
}

// Sort-Indikatoren aktualisieren
function updateSortIndicators() {
    const headers = document.querySelectorAll('.table th[data-sort]');
    headers.forEach(header => {
        header.classList.remove('sort-asc', 'sort-desc');
        if (header.dataset.sort === currentSort.field) {
            header.classList.add(`sort-${currentSort.direction}`);
        }
    });
}

// Datenbank rendern
function renderDatabase() {
    const tbody = document.getElementById('data-tbody');
    if (!tbody) return;
    
    if (filteredDatabase.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px; color: var(--text-secondary);">
                    Keine Einträge gefunden
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = filteredDatabase.map(entry => `
        <tr>
            <td>${entry.playerName}</td>
            <td>${entry.alliance}</td>
            <td>${entry.coordinates}</td>
            <td>${formatRelativeTime(entry.lastScan)}</td>
            <td>${entry.fleetPower.toLocaleString('de-DE')}</td>
            <td>
                <span class="status-badge status-${entry.status}">
                    ${getStatusText(entry.status)}
                </span>
            </td>
            <td>
                <button onclick="viewDetails('${entry.id}')" class="btn btn-sm btn-primary">
                    👁️ Details
                </button>
                <button onclick="editEntry('${entry.id}')" class="btn btn-sm btn-secondary">
                    ✏️ Bearbeiten
                </button>
            </td>
        </tr>
    `).join('');
}

// Statistiken aktualisieren
function updateStatistics() {
    const totalEntries = document.getElementById('total-entries');
    const activeTargets = document.getElementById('active-targets');
    const recentScans = document.getElementById('recent-scans');
    const topAlliance = document.getElementById('top-alliance');
    
    if (totalEntries) {
        totalEntries.textContent = spyDatabase.length;
    }
    
    if (activeTargets) {
        const active = spyDatabase.filter(entry => entry.status === 'active').length;
        activeTargets.textContent = active;
    }
    
    if (recentScans) {
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const recent = spyDatabase.filter(entry => new Date(entry.lastScan) > yesterday).length;
        recentScans.textContent = recent;
    }
    
    if (topAlliance) {
        const allianceCounts = {};
        spyDatabase.forEach(entry => {
            allianceCounts[entry.alliance] = (allianceCounts[entry.alliance] || 0) + 1;
        });
        
        const topAllianceName = Object.keys(allianceCounts).reduce((a, b) => 
            allianceCounts[a] > allianceCounts[b] ? a : b, '');
        
        topAlliance.textContent = topAllianceName.replace(/^\[.*?\]\s*/, '') || '-';
    }
}

// Hilfsfunktionen
function formatRelativeTime(date) {
    const now = new Date();
    const diff = now - new Date(date);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
        return `vor ${days} Tag${days === 1 ? '' : 'en'}`;
    } else if (hours > 0) {
        return `vor ${hours} Stunde${hours === 1 ? '' : 'n'}`;
    } else {
        const minutes = Math.floor(diff / (1000 * 60));
        return `vor ${Math.max(1, minutes)} Minute${minutes === 1 ? '' : 'n'}`;
    }
}

function getStatusText(status) {
    const statusTexts = {
        active: 'Aktiv',
        inactive: 'Inaktiv',
        pending: 'Ausstehend'
    };
    return statusTexts[status] || status;
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

function showError(message) {
    console.error('❌', message);
    // Hier könnte eine Toast-Notification angezeigt werden
}

// Aktions-Funktionen (Platzhalter)
function viewDetails(id) {
    const entry = spyDatabase.find(e => e.id === id);
    if (entry) {
        alert(`Details für ${entry.playerName}:\n\nAllianz: ${entry.alliance}\nKoordinaten: ${entry.coordinates}\nFlottenstärke: ${entry.fleetPower.toLocaleString('de-DE')}\nStatus: ${getStatusText(entry.status)}`);
    }
}

function editEntry(id) {
    alert('Bearbeitung wird implementiert...');
}

// Export für andere Module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeSpyDatabase,
        loadSpyDatabase,
        filterDatabase,
        sortDatabase
    };
}