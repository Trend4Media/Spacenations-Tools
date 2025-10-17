# 🕵️ Spy Database System - Vollständige Systemdokumentation

## Übersicht

Das Spy Database System ist eine Allianz-basierte Spionage-Datenbank für das Spacenations-Spiel. Es ermöglicht Allianzen, Spionageberichte zu sammeln, zu analysieren und zu teilen.

---

## 🏗️ Systemarchitektur

### 1. **Frontend-Layer (HTML-Dateien)**

#### 1.1 `spy-database.html` - Hauptdatenbank-Interface
**Zweck:** Zentrale Übersicht aller Spy-Reports der Allianz

**Funktionalität:**
- **Tabellen-Darstellung:** Zeigt alle Spy-Reports in einer übersichtlichen Tabelle
- **Such-/Filterfunktionen:**
  - Spielername-Suche
  - Planetenname-Suche
  - Live-Filterung während der Eingabe
- **Spalten-Informationen:**
  - Spieler, Planet, Koordinaten, Allianz
  - Gebäudestufen (Planetenzentrale, Raumhafen, Minen, Fabriken, etc.)
  - Forschungsstufen
  - Militäreinheiten (Spionage, Tarn-, Invasions-, Plünder-, Sabotageeinheiten)
  - Datum und Link-Aktionen

**Datenfluss:**
1. Lädt Demo-Daten sofort beim Start (Offline-Modus)
2. Versucht Firebase-Verbindung im Hintergrund
3. Ersetzt Demo-Daten durch echte Daten wenn verbunden
4. Nutzt `window.SpyDatabaseAPI.getAllianceReports()` zum Laden

**Besonderheiten:**
- Fallback-Strategie: Demo-Modus wenn Firebase nicht verfügbar
- Cache-Busting: Aggressive Cache-Control Headers
- Real-time Search: Event Listener auf Input-Feldern

---

#### 1.2 `spy-report-input.html` - Eingabe neuer Reports
**Zweck:** Interface zum Hinzufügen neuer Spy-Reports

**Workflow:**
```
1. User gibt Spy-Report URL ein
   ↓
2. System validiert URL-Format
   ↓
3. Report-ID wird extrahiert
   ↓
4. API-Call zum Spacenations Server
   ↓
5. Daten werden geparst und strukturiert
   ↓
6. Vorschau wird angezeigt
   ↓
7. User bestätigt und speichert
   ↓
8. Daten werden in Firebase gespeichert
```

**UI-Features:**
- Live URL-Validierung (Grün = gültig, Rot = ungültig)
- Beispiel-URLs zur Orientierung
- Preview-Sektion mit allen geparsten Daten
- Duplikats-Prüfung (warnt wenn Report bereits existiert)

---

#### 1.3 `spy-report-detail.html` - Detail-Ansicht
**Zweck:** Detaillierte Einzelansicht eines Spy-Reports

**Dargestellte Informationen:**
- **Grunddaten:** Spieler, Planet, Koordinaten, Allianz, Datum
- **Ressourcen:** Fe, Si, C, Wasser, Sauerstoff, Wasserstoff
- **Gebäude:** Name + Stufe aller Gebäude
- **Forschung:** Name + Stufe aller Forschungen
- **Schiffe:** Typ + Anzahl
- **Statistiken:** Angriff, Verteidigung, Bedrohungsstufe
- **Original-Link:** Zugriff auf Original-Report

---

### 2. **JavaScript-Module (Backend-Logik)**

#### 2.1 `spy-database-manager.js` - Datenbank-Manager
**Kernklasse:** `SpyDatabaseManager`

**Hauptfunktionen:**

##### A. Initialisierung
```javascript
async init() {
    - Wartet auf Firebase-Initialisierung
    - Wartet auf Auth-Manager
    - Lädt Allianz-Daten aus Session/localStorage
    - Richtet Auth-State-Change-Listener ein
}
```

##### B. Report Speichern
```javascript
async saveSpyReport(reportData, allianceName)
```
**Prozess:**
1. Validiert Allianz-Zuordnung (mit Fallback-Strategie)
2. Bereitet Daten für Firebase vor:
   - Metadaten (reportId, timestamp, addedBy, allianceName)
   - Planet- und Spieler-Daten
   - Gebäude, Ressourcen, Verteidigung, Flotten
   - Berechnete Statistiken
   - Index-Felder für schnelle Abfragen
3. Speichert in Firestore Collection `allianceSpyReports`
4. Fügt Activity-Log hinzu

**Datenstruktur in Firebase:**
```javascript
{
    reportId: string,
    originalUrl: string,
    timestamp: Date,
    addedBy: userId,
    addedByName: email,
    allianceName: string,
    
    planet: {
        name: string,
        coordinates: string,
        levels: {},
        recycling: {}
    },
    
    player: {
        name: string,
        allianceName: string,
        metaName: string
    },
    
    buildings: {},
    resources: {},
    defense: [],
    fleets: {},
    
    statistics: {
        totalAttackPower: number,
        totalDefensePower: number,
        totalResources: number,
        threatLevel: string
    },
    
    // Index-Felder
    playerName: string,
    planetCoordinates: string,
    planetName: string,
    threatLevel: string,
    totalAttackPower: number,
    totalDefensePower: number,
    totalResources: number,
    
    createdAt: Date,
    updatedAt: Date
}
```

##### C. Reports Laden
```javascript
async getAllianceSpyReports(allianceName, options)
```
**Prozess:**
1. Lädt Allianz-Name (mit Fallback)
2. Firebase Query: `where('allianceName', '==', alliance)`
3. Client-seitige Sortierung nach `createdAt` (vermeidet Index-Probleme)
4. Gibt Array aller Reports zurück

**Wichtig:** Keine `orderBy` in Query um Index-Konflikte zu vermeiden!

##### D. Suche
```javascript
async searchSpyReports(searchCriteria)
```
**Unterstützte Suchkriterien:**
- Spielername (mit Prefix-Matching)
- Planetenname (mit Prefix-Matching)
- Koordinaten (exakt)
- Bedrohungsstufe
- Min/Max Angriffsstärke
- Zeitraum (fromDate, toDate)
- Sortierung + Limit

##### E. Statistiken
```javascript
async getAllianceStatistics(allianceName)
```
**Berechnet:**
- Anzahl Reports gesamt
- Einzigartige Spieler
- Einzigartige Planeten
- Bedrohungsstufen-Verteilung
- Durchschnittliche Forschungs-/Gebäudestufen
- Reports pro Monat
- Top 10 Spieler (nach Anzahl Reports)

##### F. Berechtigungen
```javascript
async deleteSpyReport(reportId)
```
- Nur Ersteller oder Alliance-Admin darf löschen
- Prüft `isAllianceAdmin()` über AlliancePermissionManager

##### G. Duplikats-Prüfung
```javascript
async reportExists(reportId, allianceName)
```
- Prüft ob Report-ID bereits in Allianz-DB existiert

---

#### 2.2 `spy-report-parser.js` - Report-Parser
**Kernklasse:** `SpyReportParser`

**API-Endpoint:** `https://beta2.game.spacenations.eu/api/spy-report/{reportId}`

##### A. URL-Parsing
```javascript
extractReportId(url)
```
**Unterstützte URL-Formate:**
- `/spy-report/[ID]`
- `spy-report/[ID]` (ohne führenden Slash)
- Direkte ID (mind. 20 Zeichen)

##### B. API-Call
```javascript
async fetchReportData(reportId)
```
- GET Request zur Spacenations API
- Headers: `Accept: application/json`
- Gibt JSON-Daten zurück

##### C. Daten-Parsing
```javascript
parseReportData(rawData)
```
**Transformiert API-Daten in strukturiertes Format:**

**Eingabe (von API):**
```javascript
{
    report: {
        planet: { name, coordinates, levels, recycling },
        player: { name, allianceName, metaName, research, shipTypes },
        resources: { fe, si, c, water, oxygen, hydrogen },
        buildings: { building1: level1, building2: level2, ... },
        stationedShips: [],
        uncloakedFleets: [],
        cloakedFleets: {},
        defense: [],
        fleet: {}
    },
    time: timestamp
}
```

**Ausgabe (strukturiert):**
```javascript
{
    timestamp: Date,
    reportId: string,
    originalUrl: string,
    
    planet: {
        name: string,
        coordinates: string,
        levels: {},
        recycling: {}
    },
    
    player: {
        name: string,
        allianceName: string,
        metaName: string
    },
    
    resources: {
        fe: { amount: number, formatted: string },
        si: { amount: number, formatted: string },
        c: { amount: number, formatted: string },
        water: { amount: number, formatted: string },
        oxygen: { amount: number, formatted: string },
        hydrogen: { amount: number, formatted: string },
        additional: []
    },
    
    buildings: [
        { name: string, level: number, rawName: string }
    ],
    
    research: [
        { name: string, level: number, rawName: string }
    ],
    
    shipTypes: [
        { name: string, type: string, count: number, properties: {} }
    ],
    
    fleets: {
        stationed: [],
        uncloaked: [],
        cloaked: {}
    },
    
    defense: [],
    fleet: {},
    
    statistics: {
        totalAttackPower: number,
        totalDefensePower: number,
        totalResources: number,
        researchLevel: number,
        buildingLevel: number,
        fleetCount: number,
        threatLevel: string,
        resourceBreakdown: {},
        buildingCount: number,
        researchCount: number,
        shipTypeCount: number
    }
}
```

##### D. Statistik-Berechnung
```javascript
calculateStatistics(data)
```
**Berechnet:**
- **Angriffsstärke:** Summe aus uncloaked Flotten
- **Verteidigungsstärke:** Summe aus Defense-Einheiten
- **Gesamtressourcen:** Summe aller Ressourcen
- **Forschungslevel:** Summe aller Forschungsstufen
- **Gebäudelevel:** Summe aller Gebäudestufen
- **Bedrohungsstufe:** Gewichtete Bewertung (very_low - very_high)

**Bedrohungsstufen-Berechnung:**
```javascript
Punktesystem (max 40 Punkte):
- Angriffsstärke: max 10 Punkte (bei 100.000+)
- Verteidigungsstärke: max 10 Punkte (bei 50.000+)
- Forschungslevel: max 10 Punkte (bei 5+)
- Gebäudelevel: max 10 Punkte (bei 5+)

Bewertung:
- 35+ Punkte: very_high
- 25-34 Punkte: high
- 15-24 Punkte: medium
- 5-14 Punkte: low
- <5 Punkte: very_low
```

##### E. Formatierung
```javascript
formatNumber(num)
```
- 1B = 1.000.000.000+
- 1M = 1.000.000+
- 1K = 1.000+

```javascript
formatBuildingName(rawName)
```
- CamelCase → Lesbare Namen
- Mapping-Tabelle für deutsche Übersetzungen

```javascript
formatThreatLevel(level)
```
- Gibt Objekt zurück: `{ text, color, icon }`
- Für UI-Darstellung

---

#### 2.3 `firebase-sync.js` - Synchronisations-Manager
**Kernklasse:** `FirebaseSync`

**Verantwortlichkeiten:**
1. **Seiten-Erkennung:** Erkennt aktuelle Seite automatisch
2. **Redirect-Logik:** 
   - Dashboard-Seiten erfordern Auth
   - Index/Register-Seiten für Nicht-Eingeloggte
3. **Auth-State-Überwachung:** Reagiert auf Login/Logout
4. **Dashboard-Features:**
   - Logout-Button-Konfiguration
   - Willkommens-Header
   - Navigation-Setup

**Redirect-Regeln:**
```javascript
{
    'index': { requiresAuth: false, redirectTo: 'dashboard.html' },
    'dashboard': { requiresAuth: true, redirectTo: 'index.html' },
    'user-dashboard': { requiresAuth: true, redirectTo: 'index.html' },
    'spy-database': { requiresAuth: true, redirectTo: 'index.html' },
    'spy-report-input': { requiresAuth: true, redirectTo: 'index.html' },
    'admin-dashboard': { requiresAuth: true, requiresSuperAdmin: true }
}
```

---

### 3. **Datenfluss-Diagramme**

#### 3.1 Neuen Report Hinzufügen
```
User → spy-report-input.html
  ↓
1. User gibt URL ein
  ↓
2. validateUrl() prüft Format
  ↓
3. processSpyReport() wird aufgerufen
  ↓
4. SpyReportAPI.processUrl(url)
  ↓
5. SpyReportParser.extractReportId(url)
  ↓
6. SpyReportParser.fetchReportData(reportId)
  ↓
7. API-Call: GET /api/spy-report/{id}
  ↓
8. SpyReportParser.parseReportData(rawData)
  ↓
9. calculateStatistics(data)
  ↓
10. currentReportData = parsed data
  ↓
11. User klickt "Vorschau"
  ↓
12. previewSpyReport() rendert Daten
  ↓
13. User klickt "Speichern"
  ↓
14. saveSpyReport() wird aufgerufen
  ↓
15. SpyDatabaseAPI.saveReport(data)
  ↓
16. SpyDatabaseManager.saveSpyReport(data, alliance)
  ↓
17. Firestore: allianceSpyReports.add()
  ↓
18. Activity-Log hinzufügen
  ↓
19. Erfolgs-Meldung
```

#### 3.2 Reports Anzeigen
```
User → spy-database.html
  ↓
1. DOMContentLoaded Event
  ↓
2. Lade Demo-Daten sofort
  ↓
3. displayReports(demoReports)
  ↓
4. Versuche Firebase-Verbindung (Hintergrund)
  ↓
5. waitForFirebaseQuick()
  ↓
6. loadReports()
  ↓
7. SpyDatabaseAPI.getAllianceReports()
  ↓
8. SpyDatabaseManager.getAllianceSpyReports()
  ↓
9. Firestore Query:
   where('allianceName', '==', alliance)
  ↓
10. Client-seitige Sortierung
  ↓
11. displayReports(realReports)
  ↓
12. Tabelle wird gerendert
```

#### 3.3 Suche/Filter
```
User tippt in Suchfeld
  ↓
1. Event Listener: input event
  ↓
2. performSearch()
  ↓
3. Hole Suchbegriffe (playerSearch, planetSearch)
  ↓
4. Filter currentReports Array:
   - player.includes(searchTerm)
   - planet.includes(searchTerm)
   - alliance.includes(searchTerm)
  ↓
5. filteredReports = gefilterte Ergebnisse
  ↓
6. displayReports(filteredReports)
  ↓
7. Tabelle wird aktualisiert (live)
```

---

### 4. **Firebase-Struktur**

#### Collection: `allianceSpyReports`
```
allianceSpyReports/
  └── {documentId}/
       ├── reportId: string
       ├── originalUrl: string
       ├── timestamp: Timestamp
       ├── addedBy: string (userId)
       ├── addedByName: string (email)
       ├── allianceName: string *** INDEX ***
       ├── planet: {
       │    ├── name: string
       │    ├── coordinates: string
       │    ├── levels: {}
       │    └── recycling: {}
       ├── }
       ├── player: {
       │    ├── name: string
       │    ├── allianceName: string
       │    └── metaName: string
       ├── }
       ├── buildings: {}
       ├── resources: {}
       ├── defense: []
       ├── fleets: {}
       ├── fleet: {}
       ├── research: []
       ├── shipTypes: []
       ├── statistics: {
       │    ├── totalAttackPower: number
       │    ├── totalDefensePower: number
       │    ├── totalResources: number
       │    ├── researchLevel: number
       │    ├── buildingLevel: number
       │    ├── fleetCount: number
       │    ├── threatLevel: string
       │    ├── resourceBreakdown: {}
       │    ├── buildingCount: number
       │    ├── researchCount: number
       │    └── shipTypeCount: number
       ├── }
       ├── playerName: string *** INDEX ***
       ├── planetCoordinates: string *** INDEX ***
       ├── planetName: string *** INDEX ***
       ├── threatLevel: string *** INDEX ***
       ├── totalAttackPower: number *** INDEX ***
       ├── totalDefensePower: number *** INDEX ***
       ├── totalResources: number *** INDEX ***
       ├── createdAt: Timestamp *** INDEX ***
       └── updatedAt: Timestamp
```

#### Collection: `allianceActivityLogs`
```
allianceActivityLogs/
  └── {documentId}/
       ├── action: string ('spy_report_added', 'spy_report_deleted')
       ├── data: {
       │    ├── reportId: string
       │    ├── playerName: string
       │    └── planetCoordinates: string
       ├── }
       ├── userId: string
       ├── userEmail: string
       ├── allianceName: string
       └── timestamp: Timestamp
```

**Wichtige Firebase-Indizes:**
```
Collection: allianceSpyReports
- Index: allianceName (ASC)
- Index: allianceName (ASC) + createdAt (DESC) [optional]
- Index: playerName (ASC) [für Suche]
- Index: planetCoordinates (ASC) [für Suche]
```

---

### 5. **Globale APIs**

#### `window.SpyReportAPI`
```javascript
{
    processUrl: (url) => SpyReportParser.processSpyReportUrl(url),
    isValidUrl: (url) => SpyReportParser.isValidSpyReportUrl(url),
    extractId: (url) => SpyReportParser.extractReportId(url),
    formatThreatLevel: (level) => SpyReportParser.formatThreatLevel(level)
}
```

#### `window.SpyDatabaseAPI`
```javascript
{
    saveReport: (reportData, allianceName),
    getAllianceReports: (allianceName, options),
    getReport: (reportId),
    deleteReport: (reportId),
    searchReports: (criteria),
    getStatistics: (allianceName),
    reportExists: (reportId, allianceName),
    isAdmin: ()
}
```

#### `window.SyncAPI`
```javascript
{
    loadDashboardData: (userId),
    updateUserStats: (statType, increment),
    redirectToDashboard: (),
    redirectToIndex: (),
    getCurrentPage: (),
    dashboardLogout: (),
    quickLogout: ()
}
```

---

### 6. **Fehlerbehandlung & Fallbacks**

#### 6.1 Firebase Nicht Verfügbar
**Strategie:**
1. Zeige Demo-Daten sofort
2. Versuche Verbindung im Hintergrund
3. Zeige "Retry"-Button bei Fehlschlag
4. User kann weiter arbeiten (Demo-Modus)

**Code:**
```javascript
// Sofortiges Laden von Demo-Daten
currentReports = getDemoReports();
displayReports(currentReports);

// Hintergrund-Verbindung
setTimeout(async () => {
    const firebaseReady = await waitForFirebaseQuick();
    if (firebaseReady) {
        await loadReports(); // Echte Daten
    } else {
        showMessage('Demo-Modus aktiv');
    }
}, 1000);
```

#### 6.2 Allianz-Daten Nicht Verfügbar
**Fallback-Kette:**
```javascript
1. Versuche: this.currentAlliance
   ↓
2. Versuche: window.SessionAPI.getAllianceData()
   ↓
3. Versuche: localStorage.getItem('currentAlliance')
   ↓
4. Fehler: "Keine Allianz zugeordnet"
```

#### 6.3 API-Call Fehlgeschlagen
**Behandlung:**
```javascript
try {
    const rawData = await fetchReportData(reportId);
} catch (error) {
    console.error('API-Call fehlgeschlagen:', error);
    showMessage('Fehler: ' + error.message, 'error');
    // User kann erneut versuchen
}
```

#### 6.4 Duplikat-Report
**Verhalten:**
- Warnung anzeigen: "Report bereits vorhanden"
- User kann trotzdem speichern (Duplikate erlaubt)
- Keine automatische Blockierung

---

### 7. **Performance-Optimierungen**

#### 7.1 Cache-Busting
```html
<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
<meta name="cache-bust" content="v24&force=5">
```

#### 7.2 Client-seitige Sortierung
**Grund:** Vermeidung von Firebase Index-Problemen
```javascript
// KEINE orderBy() in Query
query = this.db.collection('allianceSpyReports')
    .where('allianceName', '==', alliance);

// Sortierung im Client
reports.sort((a, b) => {
    const dateA = a.createdAt.toDate();
    const dateB = b.createdAt.toDate();
    return dateB - dateA; // Neueste zuerst
});
```

#### 7.3 Live-Suche mit Debouncing
```javascript
// Direkte Event Listener (ohne Debouncing)
document.getElementById('playerSearch')
    .addEventListener('input', performSearch);

// Suche erfolgt sofort (filtert lokales Array)
// Kein API-Call nötig = schnell!
```

#### 7.4 Demo-Daten Vorladung
```javascript
// Zeige Daten SOFORT
currentReports = getDemoReports();
displayReports(currentReports);

// Firebase im Hintergrund
setTimeout(() => loadRealData(), 1000);
```

---

### 8. **Sicherheit & Berechtigungen**

#### 8.1 Allianz-Isolation
**Jede Allianz sieht nur eigene Daten:**
```javascript
query = db.collection('allianceSpyReports')
    .where('allianceName', '==', currentAlliance);
```

#### 8.2 Löschen-Berechtigung
**Nur erlaubt für:**
- Report-Ersteller (`addedBy === currentUser.uid`)
- Alliance-Admin (`isAllianceAdmin() === true`)

```javascript
const canDelete = report.addedBy === this.currentUser?.uid || 
                await this.isAllianceAdmin();

if (!canDelete) {
    throw new Error('Keine Berechtigung zum Löschen');
}
```

#### 8.3 Auth-Redirect
**Geschützte Seiten:**
- spy-database.html
- spy-report-input.html
- spy-report-detail.html

**Redirect bei fehlender Auth:**
```javascript
if (pageConfig.requiresAuth && !isLoggedIn) {
    this.redirectAfterDelay(pageConfig.redirectTo, 1000);
}
```

---

### 9. **UI/UX-Features**

#### 9.1 Live-Validierung
**URL-Input:**
- Grüner Border = gültige URL
- Roter Border = ungültige URL
- Grauer Border = leer

#### 9.2 Vorschau-Modus
**Vor dem Speichern:**
- Alle geparsten Daten anzeigen
- Bedrohungsstufe visualisieren
- Statistiken hervorheben

#### 9.3 Status-Messages
**Auto-Hide nach 5 Sekunden:**
```javascript
showMessage(message, type); // type: success, error, info
setTimeout(() => hideMessage(), 5000);
```

#### 9.4 Loading States
**Spinner während:**
- API-Calls
- Firebase-Operations
- Daten-Verarbeitung

#### 9.5 Responsive Design
**Tabelle:**
- Horizontal scrollbar bei Overflow
- Minimale Spaltenbreiten
- Rotierte Header für Platzersparnis

---

### 10. **Typische Problemstellen & Lösungen**

#### Problem 1: Firebase Index-Fehler
**Symptom:** "The query requires an index"

**Lösung:**
```javascript
// FALSCH (benötigt Index):
query.where('allianceName', '==', alliance)
     .orderBy('createdAt', 'desc')

// RICHTIG (kein Index nötig):
query.where('allianceName', '==', alliance)
// Client-seitige Sortierung danach
```

#### Problem 2: Allianz-Daten fehlen
**Symptom:** "Keine Allianz zugeordnet"

**Lösung:** Fallback-Kette implementiert
```javascript
1. SessionAPI
2. localStorage
3. Fehler mit klarer Meldung
```

#### Problem 3: API-Call schlägt fehl
**Symptom:** CORS oder Network Error

**Lösung:**
- Try-Catch um API-Calls
- Benutzerfreundliche Fehlermeldung
- Retry-Option anbieten

#### Problem 4: Duplikate
**Symptom:** Gleicher Report mehrfach

**Lösung:**
- `reportExists()` Prüfung vor Speichern
- Warnung anzeigen (aber nicht blockieren)
- User entscheidet

---

### 11. **Deployment-Checkliste**

#### Vor der Überarbeitung prüfen:

✅ **Firebase-Regeln:**
```javascript
// Firestore Rules für allianceSpyReports
match /allianceSpyReports/{document} {
    allow read: if request.auth != null && 
                request.auth.token.allianceName == resource.data.allianceName;
    allow create: if request.auth != null;
    allow delete: if request.auth != null && 
                 (request.auth.uid == resource.data.addedBy || 
                  request.auth.token.isAllianceAdmin == true);
}
```

✅ **Firebase-Indizes:**
- `allianceName` (Ascending)
- Optional: Composite Indizes für erweiterte Suche

✅ **API-Endpoints:**
- `https://beta2.game.spacenations.eu/api/spy-report/{id}` funktioniert

✅ **Dependencies:**
- Firebase SDK 9.23.0
- Auth-Manager lädt vor Spy-Database
- Session-Manager verfügbar

✅ **Browser-Kompatibilität:**
- Modern Browsers (ES6+)
- Async/Await Support
- Fetch API

---

### 12. **Erweiterungsmöglichkeiten**

#### 12.1 Erweiterte Suche
```javascript
// Mehrere Filter kombinieren
searchCriteria = {
    playerName: 'Astra',
    minAttackPower: 50000,
    threatLevel: 'high',
    fromDate: new Date('2025-01-01')
}
```

#### 12.2 Export-Funktion
```javascript
// CSV/Excel Export
exportToCSV(reports) {
    // Konvertiere zu CSV
    // Download-Trigger
}
```

#### 12.3 Report-Vergleich
```javascript
// Zwei Reports nebeneinander
compareReports(reportId1, reportId2) {
    // Lade beide Reports
    // Zeige Unterschiede
}
```

#### 12.4 Benachrichtigungen
```javascript
// Neue Reports benachrichtigen
subscribeToNewReports(allianceName) {
    // Firebase Realtime Listener
    // Push-Notification bei neuem Report
}
```

#### 12.5 Historische Analyse
```javascript
// Entwicklung über Zeit
getPlayerHistory(playerName) {
    // Alle Reports des Spielers
    // Sortiert nach Datum
    // Zeige Entwicklung von Gebäuden/Forschung
}
```

---

### 13. **Testing-Strategie**

#### Unit Tests (Empfohlen)
```javascript
// spy-report-parser.test.js
describe('SpyReportParser', () => {
    test('extractReportId sollte ID extrahieren', () => {
        const url = 'https://...../spy-report/ABC123';
        const id = parser.extractReportId(url);
        expect(id).toBe('ABC123');
    });
    
    test('calculateStatistics sollte korrekte Werte berechnen', () => {
        const data = { /* mock data */ };
        const stats = parser.calculateStatistics(data);
        expect(stats.threatLevel).toBe('medium');
    });
});
```

#### Integration Tests
```javascript
// spy-database-manager.test.js
describe('SpyDatabaseManager', () => {
    test('saveSpyReport sollte Report in Firebase speichern', async () => {
        const mockReport = { /* mock data */ };
        const docId = await manager.saveSpyReport(mockReport);
        expect(docId).toBeDefined();
    });
});
```

#### E2E Tests
```javascript
// Mit Playwright/Cypress
describe('Spy Report Input Flow', () => {
    test('User kann Report hinzufügen', async () => {
        await page.goto('/spy-report-input.html');
        await page.fill('#spy-report-url', 'https://....');
        await page.click('#process-btn');
        await page.waitForSelector('.preview-section');
        await page.click('#save-btn');
        await expect(page.locator('.status-success')).toBeVisible();
    });
});
```

---

## 🎯 Zusammenfassung

### Kernkomponenten:
1. **spy-database.html** - Hauptdatenbank-Interface (Tabelle + Suche)
2. **spy-report-input.html** - Eingabe-Interface (URL → Parse → Save)
3. **spy-report-detail.html** - Detail-Ansicht (Einzelreport)
4. **spy-database-manager.js** - Firebase-Backend-Logik
5. **spy-report-parser.js** - API-Integration + Daten-Parsing
6. **firebase-sync.js** - Auth + Sync-Management

### Datenfluss:
```
User Input → API Call → Parse → Validate → Save → Display
```

### Allianz-System:
- Jede Allianz hat eigene isolierte Datenbank
- Zugriff nur für eigene Allianz-Mitglieder
- Berechtigungen: Ersteller + Alliance-Admin

### Fehler-Sicherheit:
- Demo-Modus als Fallback
- Multiple Allianz-Load-Strategien
- Try-Catch überall
- Benutzerfreundliche Fehlermeldungen

---

**Status:** Voll funktionsfähig mit Fallback-Strategien
**Letzte Aktualisierung:** Version v24 (Cache-Bust)
**Dokumentation:** 2025-10-17
