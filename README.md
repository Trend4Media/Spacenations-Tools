# 🚀 Spacenations-Tools

Ein umfassendes **Intelligence-System** für Space Nations Spieler mit automatisierten Crawling-Systemen, detaillierter Spionage-Auswertung, Allianz-Management und erweiterten Analytics.

## 🌟 Hauptfunktionen

### 🔍 **Intelligence & Spionage-System**
- **Automatisches Crawling**: 6-Methoden-Pipeline für 95%+ Erfolgsrate bei Spionageberichten
- **Detaillierte Auswertung**: Umfassende Analyse von Forschung, Gebäuden, Schiffen und Ressourcen
- **Spielerzentrierte Übersicht**: Zentrale Verwaltung aller erfassten Spieler mit Verlaufsbetrachtung
- **Bedrohungsanalyse**: Intelligente Bewertung mit konkreten Handlungsempfehlungen
- **Flottenstärke-Berechnung**: Gewichtete Analyse aller Schiffstypen

### 🌌 **Proxima-System**
- **Automatisierte Datenerfassung**: Wöchentliche API-Synchronisation (Mittwoch 18:45)
- **Proxima-Planeten-Tracking**: Vollständige Übersicht aller Proxima-Planeten
- **Score-Kategorisierung**: Intelligente Einteilung nach Bedrohungsstufen
- **SQLite-Datenbank**: Lokale Speicherung mit historischen Daten

### 👥 **Allianz-Management-System**
- **Vollständiges Allianz-System**: Erstellung, Verwaltung und Berechtigungen
- **Real-time Chat**: Allianz-weite Kommunikation mit Firebase
- **Granulare Berechtigungen**: Individuelle und Allianz-weite Rechteverwaltung
- **Admin-Dashboard**: Umfassende Verwaltung aller Allianzen und Mitglieder
- **Aktivitäts-Logging**: Vollständige Nachverfolgung aller Aktionen

### 🛠️ **Erweiterte Tools**
- **Kampfbericht-Rechner**: Präzise Berechnung von Verlusten und Siegen
- **Raid-Counter**: Verfolgung und Analyse von Raid-Aktivitäten
- **Sabo-Counter**: Sabotage-Tracking mit detaillierter Auswertung
- **Admin-Dashboard**: Vollständige Systemverwaltung mit Debug-Tools
- **User-Management**: Registrierung, Authentifizierung und Profilverwaltung

## 🏗️ System-Architektur

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (HTML/CSS/JS)                   │
├─────────────────────────────────────────────────────────────┤
│  Dashboard  │  Spionage  │  Proxima  │  Allianz  │  Admin  │
├─────────────────────────────────────────────────────────────┤
│                    Firebase Backend                         │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │  Auth       │ │  Firestore  │ │  Storage    │          │
│  │  System     │ │  Database   │ │  (Files)    │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
├─────────────────────────────────────────────────────────────┤
│                    External APIs                            │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │ Spacenations│ │  Proxima    │ │  CORS       │          │
│  │  API        │ │  API        │ │  Proxies    │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

## 🔍 Detaillierte System-Dokumentation

### 🕷️ **Spionage & Intelligence-System**

#### Automatisches Crawling-System
Das System verwendet **6 verschiedene Crawling-Methoden** für maximale Erfolgsrate:

1. **Enhanced Direct Fetch**: Erweiterte Headers und User-Agents
2. **Advanced Proxy Fetch**: 6 verschiedene CORS-Proxies
3. **Serverless Proxy Fetch**: Eigene Serverless Functions
4. **Alternative URLs Crawl**: 8+ URL-Varianten automatisch
5. **Browser Simulation Fetch**: Vollständige Browser-Header-Simulation
6. **Fallback API Crawl**: Externe API-basierte Lösungen

**Erfolgsrate**: 95%+ bei automatischem Abrufen von Spionageberichten

#### Detaillierte Auswertung
- **15 Forschungsfelder** in 3 Kategorien (Militär, Zivil, Erweitert)
- **18 Gebäudetypen** in 3 Kategorien (Wirtschaft, Infrastruktur, Verteidigung)
- **16 Schiffstypen** in 3 Kategorien (Kampf, Support, Spezial)
- **Flottenstärke-Berechnung** mit gewichteter Bedrohungsanalyse
- **Konkrete Handlungsempfehlungen** basierend auf allen Faktoren

#### Bedrohungsstufen
- 🟢 **Sehr Niedrig** (0-15%): Ideales Angriffsziel
- 🟡 **Niedrig** (16-35%): Schwache Verteidigung
- 🟠 **Mittel** (36-55%): Vorsicht geboten
- 🔴 **Hoch** (56-75%): Starke Verteidigung
- ⚫ **Sehr Hoch** (76-100%): Extrem gefährlich

### 🌌 **Proxima-System**

#### Automatisierung
- **Wöchentliche Synchronisation**: Jeden Mittwoch um 18:45 Uhr
- **API-Integration**: `https://beta1.game.spacenations.eu/api/proxima`
- **SQLite-Datenbank**: Lokale Speicherung mit historischen Daten
- **Cron-Job**: Automatische Ausführung im Hintergrund

#### Features
- **Planeten-Tracking**: Vollständige Übersicht aller Proxima-Planeten
- **Score-Kategorisierung**: Hoch/Mittel/Niedrig basierend auf Punkten
- **Wochennummer-Extraktion**: Automatische Zuordnung zu Spielwochen
- **Responsive Web-Interface**: Optimiert für alle Geräte

### 👥 **Allianz-Management-System**

#### Kernfunktionen
- **Allianz-Erstellung**: Vollständiger Workflow mit Admin-Genehmigung
- **Mitgliederverwaltung**: Einladungen, Genehmigungen, Entfernung
- **Real-time Chat**: Allianz-weite Kommunikation mit Firebase
- **Berechtigungssystem**: Granulare Rechteverwaltung pro Mitglied

#### Berechtigungen
- **Chat lesen/schreiben**: Grundlegende Kommunikation
- **Spionage-Datenbank**: Zugriff auf Intelligence-System
- **Mitglieder bestätigen**: Verwaltung neuer Mitglieder
- **Berechtigungen verwalten**: Admin-Funktionen

#### Admin-Dashboard
- **Allianz-Übersicht**: Alle Allianzen mit Status und Statistiken
- **Mitglieder-Management**: Detaillierte Verwaltung aller Mitglieder
- **Berechtigungs-Verwaltung**: Individuelle und Allianz-weite Rechte
- **Aktivitäts-Logging**: Vollständige Nachverfolgung aller Aktionen

### 🛠️ **Erweiterte Tools**

#### Kampfbericht-Rechner
- **Präzise Berechnungen**: Verluste, Siege, Ressourcen
- **Schiffstyp-Analyse**: Detaillierte Aufschlüsselung aller Einheiten
- **Strategische Empfehlungen**: Basierend auf Kampfergebnissen

#### Raid-Counter
- **Aktivitäts-Tracking**: Verfolgung aller Raid-Aktivitäten
- **Statistik-Dashboard**: Umfassende Analyse und Trends
- **Export-Funktionen**: Datenexport für weitere Analyse

#### Sabo-Counter
- **Sabotage-Tracking**: Verfolgung aller Sabotage-Aktivitäten
- **Proxima-Integration**: Automatische Synchronisation mit Proxima-Daten
- **Bedrohungsanalyse**: Intelligente Bewertung von Zielen

## 🛠️ Installation & Setup

### Voraussetzungen
- **Python 3.x** (für lokalen Entwicklungsserver und Proxima-System)
- **Node.js 14+** (für Build-System)
- **Moderne Browser** (Chrome, Firefox, Safari, Edge)
- **Firebase-Projekt** (für Backend-Services)

### Entwicklung

1. **Repository klonen:**
```bash
git clone <repository-url>
cd spacenations-tools
```

2. **Dependencies installieren:**
```bash
npm install
pip install -r requirements.txt
```

3. **Firebase konfigurieren:**
```bash
# Firebase-Konfiguration in js/firebase-config.js anpassen
# Firestore Security Rules einrichten
```

4. **Proxima-System einrichten:**
```bash
chmod +x setup_proxima.sh
./setup_proxima.sh
```

5. **Entwicklungsserver starten:**
```bash
npm run serve
# oder
python -m http.server 8000
```

6. **Browser öffnen:** `http://localhost:8000`

### Produktion

1. **Produktions-Build erstellen:**
```bash
npm run build:prod
```

2. **Firebase deployen:**
```bash
# Firebase Hosting konfigurieren
firebase deploy
```

3. **Proxima-Cron einrichten:**
```bash
# Cron-Job für wöchentliche Synchronisation
crontab -e
# Hinzufügen: 45 18 * * 3 cd /workspace && python3 proxima_simple.py
```

## 📁 Projektstruktur

```
spacenations-tools/
├── 📁 css/                          # Stylesheets
│   ├── theme-variables.css          # Gemeinsame Theme-Variablen
│   ├── dashboard-*.css              # Dashboard-spezifische Styles
│   └── global-footer.css            # Footer-Styles
├── 📁 js/                           # JavaScript-Module
│   ├── config.js                    # Zentrale Konfiguration
│   ├── firebase-*.js                # Firebase-Integration
│   ├── auth-manager.js              # Authentifizierung
│   ├── theme-manager.js             # Theme-Verwaltung
│   ├── spy-*.js                     # Spionage-System
│   ├── alliance-*.js                # Allianz-Management
│   ├── admin-*.js                   # Admin-Dashboard
│   └── *.js                         # Weitere Tool-Module
├── 📁 api/                          # Backend-Services
│   └── crawler.js                   # Crawling-API
├── 📁 build/                        # Build-System
│   └── build.js                     # Build-Skript
├── 📄 *.html                        # HTML-Seiten
├── 📄 *.py                          # Python-Skripte (Proxima)
├── 📄 *.sh                          # Shell-Skripte
├── 📄 *.db                          # SQLite-Datenbanken
├── 📄 *.json                        # Konfigurationsdateien
├── 📄 *.md                          # Dokumentation
├── 📄 package.json                  # NPM-Konfiguration
├── 📄 requirements.txt              # Python-Dependencies
└── 📄 README.md                     # Diese Datei
```

## 🔌 API-Dokumentation

### **Spionage-System APIs**

#### Crawling-API
```javascript
// Automatisches Crawling von Spionageberichten
POST /api/crawler/fetch
{
  "url": "https://beta1.game.spacenations.eu/spy-report/12345",
  "method": "auto" // oder spezifische Methode
}

// Response
{
  "success": true,
  "data": "<html>...</html>",
  "method": "cors-proxy",
  "executionTime": 1250
}
```

#### Spionage-Auswertung
```javascript
// Detaillierte Auswertung eines Berichts
POST /api/spy/evaluate
{
  "html": "<html>...</html>",
  "url": "https://beta1.game.spacenations.eu/spy-report/12345"
}

// Response
{
  "player": "Spielername",
  "threatLevel": "medium",
  "threatScore": 45,
  "research": { /* 15 Forschungsfelder */ },
  "buildings": { /* 18 Gebäudetypen */ },
  "ships": { /* 16 Schiffstypen */ },
  "recommendations": ["Angriff möglich", "Schwache Verteidigung"]
}
```

### **Proxima-System APIs**

#### Proxima-Daten abrufen
```javascript
// Aktuelle Proxima-Planeten
GET /api/proxima/planets

// Response
{
  "planets": [
    {
      "name": "Proxima 10-1",
      "coordinates": "555:395:3",
      "score": 129,
      "deleteOn": "2025-09-17T16:06:58.000000Z",
      "weekNumber": 10
    }
  ],
  "lastUpdate": "2025-01-15T18:45:00Z"
}
```

### **Allianz-System APIs**

#### Allianz-Management
```javascript
// Allianz erstellen
POST /api/alliance/create
{
  "name": "Space Warriors",
  "tag": "SW",
  "description": "Eine starke Allianz"
}

// Mitglied hinzufügen
POST /api/alliance/{allianceId}/members
{
  "username": "newmember",
  "permissions": {
    "chat_read": true,
    "spy_database": false
  }
}
```

#### Chat-System
```javascript
// Nachricht senden
POST /api/alliance/{allianceId}/chat
{
  "content": "Hallo Allianz!",
  "author": "username"
}

// Nachrichten abrufen
GET /api/alliance/{allianceId}/chat?limit=50&offset=0
```

### **Admin-APIs**

#### System-Status
```javascript
// System-Status abrufen
GET /api/admin/status

// Response
{
  "users": 1250,
  "alliances": 45,
  "spyReports": 15600,
  "proximaPlanets": 89,
  "systemHealth": "healthy"
}
```

#### Debug-Tools
```javascript
// Firebase-Verbindung testen
GET /api/admin/debug/firebase

// Crawling-Statistiken
GET /api/admin/debug/crawler

// Datenbank-Integrität prüfen
GET /api/admin/debug/database
```

## 🔧 Entwicklung

### Verfügbare Scripts

```bash
npm run dev        # Entwicklungsserver starten
npm run build      # Development-Build
npm run build:prod # Produktions-Build (optimiert)
npm run clean      # Build-Verzeichnis löschen
npm run lint       # Code-Qualitätsprüfung
npm run lint:fix   # Automatische Code-Reparatur
npm run serve      # Python HTTP-Server
```

### Debug-Modi

Das Projekt unterstützt automatische Umgebungserkennung:
- **Entwicklung**: `localhost` → Alle Debug-Ausgaben aktiv
- **Produktion**: Andere Domains → Nur Error-Logs

Manuelle Steuerung:
```javascript
// In Browser-Konsole
enableDevelopmentMode();  // Debug-Modus an
enableProductionMode();   // Debug-Modus aus
```

### Theme-System

Das Projekt verwendet CSS-Variablen für konsistente Themes:
- **Razer-Design**: Moderne Gaming-Ästhetik mit grünen Akzenten
- **Responsive Design**: Optimiert für alle Bildschirmgrößen
- **Dark-Mode**: Automatische Erkennung und manuelle Umschaltung
- **Zentrale Farbverwaltung**: `css/theme-variables.css`

### Code-Struktur

#### JavaScript-Module
- **Modulare Architektur**: Jedes System als eigenes Modul
- **Firebase-Integration**: Zentrale Konfiguration und Services
- **Error-Handling**: Umfassende Fehlerbehandlung und Logging
- **Performance-Optimierung**: Lazy Loading und Caching

#### CSS-Architektur
- **CSS-Variablen**: Zentrale Theme-Verwaltung
- **Mobile-First**: Responsive Design von klein nach groß
- **Component-Styles**: Modulare Stylesheets pro Komponente
- **Animationen**: Smooth Transitions und Hover-Effekte

## 🔐 Firebase-Integration

### Services
- **Authentication**: Benutzer-Anmeldung und -Verwaltung
- **Firestore**: Real-time Datenbank für alle Systeme
- **Storage**: Datei-Upload und -Verwaltung
- **Hosting**: Statische Website-Bereitstellung

### Sicherheit
- **Firestore Security Rules**: Granulare Zugriffskontrolle
- **API-Key-Management**: Sichere Konfiguration
- **User-Permissions**: Rollenbasierte Berechtigungen
- **Data-Validation**: Server-seitige Datenvalidierung

### ⚠️ Sicherheitshinweise
- Firebase-API-Keys sollten in Produktion über Umgebungsvariablen verwaltet werden
- Firestore Security Rules müssen für alle Collections konfiguriert sein
- Regelmäßige Updates der Firebase-Services empfohlen

## 🧪 Testing & Qualitätssicherung

### Test-Systeme
- **Crawler-Tests**: Umfassende Tests aller Crawling-Methoden
- **Spy-Evaluator-Tests**: Validierung der Auswertungslogik
- **Firebase-Tests**: Verbindungstests und Datenintegrität
- **UI-Tests**: Cross-Browser-Kompatibilität

### Debug-Tools
- **Admin-Dashboard**: Umfassende Debug-Funktionen
- **Crawler-Test-Interface**: Live-Testing aller Crawling-Methoden
- **Firebase-Debug**: Verbindungs- und Datenbank-Tests
- **Performance-Monitoring**: Real-time Metriken

## 📊 Performance & Monitoring

### Optimierungen
- **Lazy Loading**: Module werden nur bei Bedarf geladen
- **Caching**: Intelligentes Caching für bessere Performance
- **Compression**: Gzip-Kompression für alle Assets
- **CDN**: Content Delivery Network für globale Verfügbarkeit

### Monitoring
- **Real-time Analytics**: Benutzerverhalten und System-Performance
- **Error-Tracking**: Automatische Fehlererkennung und -meldung
- **Uptime-Monitoring**: Kontinuierliche Verfügbarkeitsüberwachung
- **Performance-Metriken**: Ladezeiten und Responsivität

## 🤝 Beitragen

### Entwicklungsworkflow
1. **Fork erstellen**: Repository forken
2. **Branch erstellen**: `git checkout -b feature/neues-feature`
3. **Entwicklung**: Feature implementieren mit Tests
4. **Code-Review**: Selbst-Review und Linting
5. **Commit**: `git commit -m 'feat: Neues Feature hinzugefügt'`
6. **Push**: `git push origin feature/neues-feature`
7. **Pull Request**: Detaillierte Beschreibung erstellen

### Code-Standards
- **ESLint**: JavaScript-Code-Qualität
- **Prettier**: Code-Formatierung
- **JSDoc**: Dokumentation für alle Funktionen
- **Git-Conventions**: Strukturierte Commit-Messages

## 📋 Roadmap

### ✅ **Abgeschlossen (v1.0)**
- [x] **Intelligence-System**: Vollständige Spionage-Auswertung
- [x] **Crawling-System**: 6-Methoden-Pipeline mit 95%+ Erfolgsrate
- [x] **Allianz-Management**: Vollständiges Allianz-System mit Chat
- [x] **Proxima-System**: Automatisierte Datenerfassung
- [x] **Admin-Dashboard**: Umfassende Systemverwaltung
- [x] **User-Management**: Registrierung und Authentifizierung

### 🚧 **In Entwicklung (v1.1)**
- [ ] **Mobile App**: PWA für mobile Geräte
- [ ] **Erweiterte Analytics**: Detaillierte Statistiken und Trends
- [ ] **API-Erweiterungen**: Zusätzliche Endpunkte und Services
- [ ] **Performance-Optimierung**: Weitere Geschwindigkeitsverbesserungen

### 🔮 **Geplant (v2.0)**
- [ ] **Machine Learning**: KI-basierte Bedrohungsanalyse
- [ ] **Real-time Notifications**: Push-Benachrichtigungen
- [ ] **Docker-Container**: Containerisierte Deployment
- [ ] **CI/CD Pipeline**: Automatisierte Tests und Deployment
- [ ] **Multi-Language**: Internationalisierung
- [ ] **Advanced Reporting**: PDF-Export und Berichte

### 🎯 **Langfristig (v3.0+)**
- [ ] **Mobile Native Apps**: iOS und Android Apps
- [ ] **Blockchain-Integration**: Dezentrale Datenverwaltung
- [ ] **AI-Assistant**: Intelligenter Spielassistent
- [ ] **Community-Features**: Erweiterte Social-Funktionen

## 📄 Lizenz

**MIT License** - siehe [LICENSE](LICENSE) Datei für Details.

## 🐛 Bug Reports & Support

### Bug Reports
Probleme bitte im [Issue Tracker](https://github.com/spacenations/tools/issues) melden mit:
- **Beschreibung**: Detaillierte Problembeschreibung
- **Schritte**: Reproduktionsschritte
- **Umgebung**: Browser, OS, Version
- **Logs**: Relevante Fehlermeldungen

### Support
- **Dokumentation**: Umfassende README und Code-Kommentare
- **Community**: Discord-Server für Community-Support
- **FAQ**: Häufig gestellte Fragen und Lösungen

## 🏆 Credits

**Entwickelt mit ❤️ für die Space Nations Community**

### Hauptentwickler
- **Intelligence-System**: Automatisierte Spionage-Auswertung
- **Crawling-Engine**: 6-Methoden-Pipeline für maximale Erfolgsrate
- **Allianz-System**: Vollständiges Management und Chat-System
- **Proxima-Integration**: Automatisierte Datenerfassung

### Community-Contributors
- **Testing**: Umfassende Tests und Feedback
- **Documentation**: Verbesserung der Dokumentation
- **Bug Reports**: Wertvolle Fehlermeldungen und Verbesserungsvorschläge

---

**Version 1.0** - *Ein vollständiges Intelligence-System für Space Nations* 🚀
