# 🚀 Spacenations-Tools

Eine Sammlung von Hilfswerkzeugen für Space Nations Spieler.

## 🌿 Branch-Struktur

Dieses Repository verwendet nur noch den **🟢 `main`** Branch für die produktive und stabile Version.
Alle ehemals experimentellen Bereiche (Testarea/Toolkit) wurden entfernt und in MAIN überführt.

## 🎯 Features

- **Dashboard**: Zentrale Übersicht aller Tools
- **Kampfbericht-Rechner**: Berechnung von Kampfberichten und Verlusten
- **Raid-Counter**: Verfolgung von Raid-Aktivitäten
- **Sabo-Counter**: Sabotage-Tracking und -Verwaltung
- **Benutzer-Registrierung**: Account-Management mit Firebase

## 🛠️ Installation & Setup

### Voraussetzungen
- Python 3.x (für lokalen Entwicklungsserver)
- Node.js 14+ (für Build-System)
- Moderne Browser (Chrome, Firefox, Safari, Edge)

### Entwicklung

1. Repository klonen:
```bash
git clone <repository-url>
cd spacenations-tools
```

2. Entwicklungsserver starten:
```bash
npm run serve
# oder
python -m http.server 8000
```

3. Browser öffnen: `http://localhost:8000`

### Produktion

1. Dependencies installieren:
```bash
npm install
```

2. Produktions-Build erstellen:
```bash
npm run build:prod
```

3. Build-Dateien aus `dist/` Verzeichnis deployen

## 📁 Projektstruktur

```
spacenations-tools/
├── css/                    # Stylesheets
│   ├── theme-variables.css # Gemeinsame Theme-Variablen
│   ├── dashboard-*.css     # Dashboard-spezifische Styles
│   └── global-footer.css   # Footer-Styles
├── js/                     # JavaScript-Module
│   ├── config.js          # Zentrale Konfiguration
│   ├── firebase-*.js      # Firebase-Integration
│   ├── auth-manager.js    # Authentifizierung
│   ├── theme-manager.js   # Theme-Verwaltung
│   └── *.js              # Tool-spezifische Module
├── build/                  # Build-System
│   └── build.js           # Build-Skript
├── *.html                 # HTML-Seiten
├── package.json           # NPM-Konfiguration
└── README.md             # Diese Datei
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
- Automatische Dark/Light-Mode-Erkennung
- Zentrale Farbverwaltung in `css/theme-variables.css`
- Responsive Design für alle Bildschirmgrößen

## 🔐 Firebase-Integration

Die Tools nutzen Firebase für:
- Benutzer-Authentifizierung
- Daten-Synchronisation
- Cloud-Speicherung

### Sicherheitshinweis
⚠️ **Wichtig**: Firebase-API-Keys sollten in Produktion über Umgebungsvariablen verwaltet werden.

## 🤝 Beitragen

1. Fork des Repositories erstellen
2. Feature-Branch erstellen: `git checkout -b feature/neues-feature`
3. Änderungen committen: `git commit -m 'Neues Feature hinzugefügt'`
4. Branch pushen: `git push origin feature/neues-feature`
5. Pull Request erstellen

## 📋 Roadmap

- [ ] Erweiterte Statistiken
- [ ] Mobile App (PWA)
- [ ] Automatische Tests
- [ ] Docker-Container
- [ ] CI/CD Pipeline

## 📄 Lizenz

MIT License - siehe [LICENSE](LICENSE) Datei für Details.

## 🐛 Bug Reports

Probleme bitte im [Issue Tracker](https://github.com/spacenations/tools/issues) melden.

---

**Entwickelt mit ❤️ für die Space Nations Community**
