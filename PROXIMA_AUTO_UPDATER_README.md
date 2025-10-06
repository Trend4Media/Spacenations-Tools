# 🤖 Proxima Auto-Updater

Automatisches System zur Überwachung der Beta2 Spacenations API und Aktualisierung der ProximaDB Daten.

## 📋 Übersicht

Der Auto-Updater läuft als **Background-Thread** im Railway-Server und überwacht automatisch die Beta2 API während des kritischen Zeitfensters am Mittwochabend.

## ⏰ Zeitplan

- **Wochentag**: Nur Mittwoch
- **Zeitfenster**: 17:00 - 23:00 Uhr
- **Prüfintervall**: Alle 5 Minuten
- **Aktion**: Aktualisiert `proxima_data.json` bei Änderungen

## 🔧 Funktionsweise

### 1. Automatischer Betrieb

Der Auto-Updater startet automatisch mit dem Railway-Server:

```python
# In app.py - läuft als Daemon-Thread
def start_proxima_scheduler():
    # Prüft alle 5 Minuten
    # Nur aktiv am Mittwoch 17-23 Uhr
    check_and_update()
```

### 2. Intelligente Prüfung

- ✅ **Zeitfenster-Check**: Prüft ob es Mittwoch 17-23 Uhr ist
- ✅ **API-Abruf**: Lädt aktuelle Daten von Beta2 API
- ✅ **Änderungserkennung**: Vergleicht mit aktuellen Daten
- ✅ **Auto-Update**: Speichert nur bei Änderungen

### 3. Logging

Alle Aktivitäten werden geloggt:

```
proxima_auto_updater.log    # Detailliertes Log
Railway Logs                # Server-Logs
```

## 📊 Log-Beispiele

### Erfolgreiches Update
```
2025-10-06 18:05:00 - INFO - 🔍 Rufe API ab: https://beta2.game.spacenations.eu/api/proxima
2025-10-06 18:05:01 - INFO - ✅ API-Daten geladen: 60 Planeten
2025-10-06 18:05:01 - INFO - 🔔 Änderungen erkannt!
2025-10-06 18:05:01 - INFO -    Alt: 58 Planeten
2025-10-06 18:05:01 - INFO -    Neu: 60 Planeten
2025-10-06 18:05:01 - INFO - 💾 Daten gespeichert: 60 Planeten
2025-10-06 18:05:01 - INFO - ✅ Update erfolgreich!
```

### Keine Änderungen
```
2025-10-06 18:10:00 - INFO - 🔍 Rufe API ab: https://beta2.game.spacenations.eu/api/proxima
2025-10-06 18:10:01 - INFO - ✅ API-Daten geladen: 60 Planeten
2025-10-06 18:10:01 - INFO - ✓ Keine Änderungen - Daten sind aktuell
```

### Außerhalb des Zeitfensters
```
2025-10-06 14:00:00 - INFO - ⏰ Außerhalb des Update-Zeitfensters (Mittwoch 17-23 Uhr)
2025-10-06 14:00:00 - INFO -    Aktuell: Montag 14:00 Uhr
```

## 🧪 Manuelles Testen

### Einmalige Ausführung (Test)
```bash
python3 proxima_auto_updater.py --once
```

### Kontinuierlicher Betrieb
```bash
python3 proxima_auto_updater.py
```

## 📁 Dateien

- `proxima_auto_updater.py` - Hauptskript
- `proxima_data.json` - Datenbank (wird aktualisiert)
- `proxima_auto_updater.log` - Log-Datei
- `app.py` - Server mit integriertem Auto-Updater

## 🔍 Monitoring

### Railway Dashboard
```
Railway Dashboard → Logs → Suche nach "Proxima"
```

### Log-Filter
```bash
# Erfolgreiche Updates
grep "Update erfolgreich" proxima_auto_updater.log

# Fehler
grep "❌" proxima_auto_updater.log

# Änderungen
grep "Änderungen erkannt" proxima_auto_updater.log
```

## 🛠️ Konfiguration

Zeitfenster und Intervall können in `proxima_auto_updater.py` angepasst werden:

```python
START_HOUR = 17      # Start-Stunde
END_HOUR = 23        # End-Stunde
WEDNESDAY = 2        # 0=Montag, 2=Mittwoch
CHECK_INTERVAL = 300 # 5 Minuten in Sekunden
```

## ⚡ Performance

- **Speicherverbrauch**: ~10-20 MB
- **CPU-Last**: Minimal (nur bei Prüfung)
- **Netzwerk**: ~10 KB pro Prüfung
- **Impact**: Keine Auswirkung auf Server-Performance

## 🔐 Sicherheit

- ✅ Läuft als Daemon-Thread
- ✅ Exception-Handling für alle API-Calls
- ✅ Automatische Wiederherstellung bei Fehlern
- ✅ Keine sensiblen Daten im Log

## 🚀 Deployment

Der Auto-Updater ist vollständig in Railway integriert:

1. **Automatischer Start**: Bei Railway-Deployment
2. **Background-Betrieb**: Läuft parallel zum Web-Server
3. **Keine Konfiguration nötig**: Funktioniert out-of-the-box

## 📞 Support

Bei Problemen:
1. Prüfe Railway Logs
2. Prüfe `proxima_auto_updater.log`
3. Teste manuell mit `--once` Flag

## 🎯 Nächste Schritte

Mögliche Erweiterungen:
- [ ] E-Mail-Benachrichtigung bei Updates
- [ ] Webhook für Discord/Slack
- [ ] Historische Daten-Archivierung
- [ ] API-Status-Dashboard

---

**Status**: ✅ Aktiv auf Railway
**Version**: 1.0.0
**Letzte Aktualisierung**: 06.10.2025
