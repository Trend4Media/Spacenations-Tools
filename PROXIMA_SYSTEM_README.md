# 🌌 ProximaDB System

Ein automatisiertes System zur Verfolgung von Proxima-Planeten aus der Spacenations API.

## 📋 Übersicht

Das System lädt Proxima-Planetendaten von der **Beta2 Spacenations API** (`https://beta2.game.spacenations.eu/api/proxima`) mit automatischem Fallback zu `proxima_data.json`. Die Daten werden jeden Mittwoch um 18:45 Uhr automatisch aktualisiert und in einer übersichtlichen Web-Oberfläche dargestellt.

## 🗂️ Dateien

### Hauptskripte
- `proxima_simple.py` - Hauptskript ohne externe Abhängigkeiten
- `setup_proxima.sh` - Setup-Skript für Installation und Cron-Job

### Web-Interface
- `ProximaDB.html` - Hauptseite für das Web-Interface mit Beta2 API Integration
- `proxima_report.html` - Generierter HTML-Report
- `proxima_data.json` - JSON-Daten als Fallback (60 echte Planeten-Einträge)

### Datenbank
- `proxima.db` - SQLite Datenbank mit allen Planetendaten

## 🚀 Installation

1. **Setup ausführen:**
   ```bash
   ./setup_proxima.sh
   ```

2. **Manuelle Ausführung:**
   ```bash
   python3 proxima_simple.py
   ```

## 📊 Datenstruktur

### API-Endpunkte
- **Primär**: `https://beta2.game.spacenations.eu/api/proxima` (Beta2 API)
- **Fallback**: `proxima_data.json` (Lokale Daten mit 60 Planeten)

Die API liefert folgende Daten für jeden Planeten:
- **name**: Planetennamen (z.B. "Proxima 10-1", "Proxima 11-2")
- **coordinates**: Koordinaten im Format "555:395:3"
- **score**: Punkte als Zahl
- **deleteOn**: Zerstörungsdatum im ISO-Format

### Datenquellen-Logik
1. **Primär**: Versucht Beta2 API zu laden (12 Sekunden Timeout)
2. **Fallback**: Bei Fehler wird `proxima_data.json` verwendet
3. **Anzeige**: Datenquelle wird im Interface angezeigt (🟢 Live API / 🟡 Fallback)

## 🗄️ Datenbank-Schema

```sql
CREATE TABLE planets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    coordinates TEXT NOT NULL,
    score INTEGER NOT NULL,
    delete_on TEXT NOT NULL,
    week_number INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(name, created_at)
);
```

## ⏰ Automatisierung

Das System wird automatisch jeden Mittwoch um 18:45 Uhr ausgeführt:
```bash
45 18 * * 3 cd /workspace && python3 proxima_simple.py >> proxima_cron.log 2>&1
```

## 🌐 Web-Integration

### Für https://trend4media.github.io/Spacenations-Tools/

1. **Dateien hochladen:**
   - `sabocounter.html` → `/sabocounter.html`
   - `proxima_data.json` → `/proxima_data.json`

2. **Navigation erweitern:**
   Fügen Sie einen Menüpunkt "Sabocounter" hinzu, der auf `/sabocounter.html` verweist.

## 📈 Features

### Web-Interface
- ✅ Responsive Design
- ✅ Sortierung nach Woche und Planetennummer
- ✅ Score-Kategorisierung (Hoch/Mittel/Niedrig)
- ✅ Automatische Datumsformatierung
- ✅ Statistiken (Anzahl Planeten, aktuelle Woche)
- ✅ Automatische Aktualisierung

### Datenverarbeitung
- ✅ Automatische Wochennummer-Extraktion
- ✅ Datumsformatierung für deutsche Anzeige
- ✅ Duplikat-Vermeidung
- ✅ Fehlerbehandlung

## 🔧 Wartung

### Logs überwachen
```bash
# Cron-Logs
tail -f proxima_cron.log

# System-Logs
tail -f /var/log/syslog | grep proxima
```

### Cron-Job verwalten
```bash
# Aktuelle Cron-Jobs anzeigen
crontab -l

# Cron-Job bearbeiten
crontab -e

# Cron-Job entfernen
crontab -e  # Zeile mit proxima_simple.py löschen
```

### Manuelle Aktualisierung
```bash
python3 proxima_simple.py
```

## 🐛 Fehlerbehebung

### Häufige Probleme

1. **API nicht erreichbar:**
   - Prüfen Sie die Internetverbindung
   - Überprüfen Sie die API-URL

2. **Cron-Job läuft nicht:**
   - Prüfen Sie die Cron-Logs
   - Überprüfen Sie die Pfade im Cron-Job

3. **Datenbank-Fehler:**
   - Prüfen Sie die Dateiberechtigungen
   - Überprüfen Sie den Speicherplatz

### Debug-Modus
```bash
# Mit detaillierter Ausgabe
python3 -u proxima_simple.py
```

## 📝 API-Dokumentation

### Primary Endpoint (Beta2)
```
GET https://beta2.game.spacenations.eu/api/proxima
```

### Fallback Endpoint
```
GET proxima_data.json (lokal)
```

### Response Format
```json
[
  {
    "name": "Proxima 10-1",
    "coordinates": "555:395:3",
    "score": 129,
    "deleteOn": "2025-09-17T16:06:58.000000Z"
  }
]
```

### Fehlerbehandlung
- **Timeout**: 12 Sekunden für API-Anfragen
- **Retry**: Automatischer Fallback zu lokalen Daten
- **Logging**: Detaillierte Console-Logs für Debugging

## 🔄 Update-Prozess

1. **Wöchentlich (Mittwoch 18:45):**
   - API-Daten abrufen
   - Datenbank aktualisieren
   - HTML-Report generieren
   - JSON-Daten aktualisieren

2. **Bei Bedarf:**
   - Manuelle Ausführung möglich
   - Sofortige Aktualisierung

## 📞 Support

Bei Problemen oder Fragen:
1. Prüfen Sie die Logs
2. Testen Sie die manuelle Ausführung
3. Überprüfen Sie die Cron-Konfiguration

## 🎯 Nächste Schritte

1. **Web-Integration:**
   - Dateien auf GitHub Pages hochladen
   - Navigation erweitern

2. **Erweiterte Features:**
   - Historische Daten-Visualisierung
   - E-Mail-Benachrichtigungen
   - API-Status-Monitoring

3. **Performance-Optimierung:**
   - Caching implementieren
   - Datenbank-Indizes optimieren