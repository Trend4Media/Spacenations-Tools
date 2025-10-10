# 📬 Discord Webhook Integration für ProximaDB

Diese Anleitung erklärt, wie Sie die ProximaDB-Daten automatisch an einen Discord-Kanal senden können.

## 🎯 Was macht das System?

Das System sendet automatisch formatierte Berichte der Proxima-Planetendaten an einen Discord-Kanal Ihrer Wahl. Die Daten werden als schön formatierte Discord Embeds dargestellt.

## 📋 Voraussetzungen

- Python 3.8+
- Installierte Dependencies: `pip install -r requirements.txt`
- Admin-Rechte auf dem Discord-Server
- ProximaDB läuft bereits (proxima.db existiert)

## 🔧 Schritt 1: Discord Webhook erstellen

### Option A: Über Discord Desktop/Web App

1. Öffnen Sie Ihren Discord-Server
2. Klicken Sie auf **Server-Einstellungen** (Zahnrad-Symbol neben dem Servernamen)
3. Gehen Sie zu **Integrationen**
4. Klicken Sie auf **Webhooks**
5. Klicken Sie auf **Neuer Webhook**
6. Konfigurieren Sie den Webhook:
   - **Name**: z.B. "ProximaDB Bot"
   - **Kanal**: Wählen Sie Ihren gewünschten Kanal aus (ID: 1349818332865368243)
   - **Avatar**: Optional - ein cooles Planet-Bild hochladen
7. Klicken Sie auf **Webhook-URL kopieren**
8. Speichern Sie die URL sicher ab!

### Option B: Über Discord Bot (für Entwickler)

```bash
# Die Webhook URL hat folgendes Format:
https://discord.com/api/webhooks/{webhook.id}/{webhook.token}
```

## 🚀 Schritt 2: Webhook URL konfigurieren

### Methode A: Umgebungsvariable setzen (Empfohlen)

**Linux/Mac:**
```bash
export DISCORD_WEBHOOK_URL='https://discord.com/api/webhooks/IHRE_ID/IHR_TOKEN'
```

**Windows PowerShell:**
```powershell
$env:DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/IHRE_ID/IHR_TOKEN'
```

**Windows CMD:**
```cmd
set DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/IHRE_ID/IHR_TOKEN
```

### Methode B: .env Datei (für Produktion)

Erstellen Sie eine `.env` Datei im Projektverzeichnis:

```bash
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/IHRE_ID/IHR_TOKEN
```

Dann laden Sie diese in Ihrer Anwendung:

```python
from dotenv import load_dotenv
load_dotenv()
```

## 📤 Schritt 3: Daten senden

### Manuell einmalig senden

```bash
python proxima_discord_webhook.py
```

### Automatisch mit proxima_fetcher.py

Der `proxima_fetcher.py` sendet automatisch an Discord, wenn die Umgebungsvariable gesetzt ist:

```bash
# Mit Webhook
export DISCORD_WEBHOOK_URL='https://discord.com/api/webhooks/...'
python proxima_fetcher.py

# Ohne Webhook (nur lokale Datenbank)
python proxima_fetcher.py
```

### Programmatisch in Ihrem Code

```python
from proxima_discord_webhook import ProximaDiscordWebhook

# Webhook initialisieren
webhook = ProximaDiscordWebhook(
    webhook_url='https://discord.com/api/webhooks/...',
    db_path='proxima.db'
)

# Embed-Nachricht senden (schön formatiert)
webhook.send_to_discord(use_embed=True)

# Einfache Text-Nachricht senden
webhook.send_to_discord(use_embed=False)

# Komplette Daten als JSON-Datei senden
webhook.send_full_data_as_file()
```

## 🎨 Beispiel-Ausgaben

### Embed-Format (Standard)
```
🌌 ProximaDB - Planetenübersicht

📊 Statistiken:
• Planeten gesamt: 42
• Aktuelle Woche: 10

🥇 Proxima 10-1
📍 12:345:6
💎 1,234 Punkte
⏰ 17.09.2025 16:06
📅 Woche 10

🥈 Proxima 10-2
...
```

### Tabellen-Format
```
🌌 ProximaDB - Planetenübersicht

📊 Statistiken:
• Planeten gesamt: 42
• Aktuelle Woche: 10

Top Planeten:
Rang | Name                | Koordinaten    | Punkte  | Woche
-----|---------------------|----------------|---------|------
 1   | Proxima 10-1       | 12:345:6       |  1,234  | W10
 2   | Proxima 10-2       | 23:456:7       |    987  | W10
...
```

## 📅 Automatisierung mit Cron/Scheduler

### Linux Cron Job (jeden Mittwoch 18:45)

```bash
crontab -e
```

Fügen Sie hinzu:
```cron
45 18 * * 3 cd /pfad/zu/ihrem/projekt && /usr/bin/python3 proxima_discord_webhook.py
```

### Python Schedule (bereits in proxima_fetcher.py integriert)

```python
import schedule

schedule.every().wednesday.at("18:45").do(webhook.send_to_discord)
```

### Systemd Service (Linux)

Erstellen Sie `/etc/systemd/system/proxima-webhook.service`:

```ini
[Unit]
Description=ProximaDB Discord Webhook
After=network.target

[Service]
Type=simple
User=ihr-benutzer
WorkingDirectory=/pfad/zu/ihrem/projekt
Environment="DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/..."
ExecStart=/usr/bin/python3 proxima_discord_webhook.py
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Aktivieren:
```bash
sudo systemctl enable proxima-webhook.service
sudo systemctl start proxima-webhook.service
```

## 🔒 Sicherheit

### ⚠️ WICHTIG: Webhook-URL schützen!

Die Webhook-URL ist ein Geheimnis! Jeder mit dieser URL kann Nachrichten in Ihren Discord-Kanal senden.

**Do's:**
✅ Speichern Sie die URL in Umgebungsvariablen
✅ Nutzen Sie `.env` Dateien (und fügen Sie `.env` zu `.gitignore` hinzu)
✅ Verwenden Sie Secret Manager in Production (AWS Secrets Manager, etc.)

**Don'ts:**
❌ NIEMALS die URL in Git committen
❌ NIEMALS die URL öffentlich teilen
❌ NIEMALS die URL im Code hardcoden

### .gitignore aktualisieren

Stellen Sie sicher, dass `.env` in Ihrer `.gitignore` ist:

```gitignore
.env
*.env
.env.local
```

## 🧪 Testen

### Test mit Mock-Daten

```python
from proxima_discord_webhook import ProximaDiscordWebhook

webhook = ProximaDiscordWebhook('YOUR_WEBHOOK_URL')

# Teste die Verbindung
test_payload = {
    "content": "🧪 Test-Nachricht von ProximaDB Bot!"
}

import requests
response = requests.post(webhook.webhook_url, json=test_payload)
print(f"Status: {response.status_code}")
```

### Debug-Modus

```python
import logging
logging.basicConfig(level=logging.DEBUG)

webhook.send_to_discord()
```

## 🛠️ Fehlerbehebung

### Fehler: "Discord Webhook Fehler: 404"
- Die Webhook-URL ist ungültig oder der Webhook wurde gelöscht
- Erstellen Sie einen neuen Webhook

### Fehler: "Discord Webhook Fehler: 429"
- Rate Limit erreicht (zu viele Anfragen)
- Warten Sie einige Minuten und versuchen Sie es erneut
- Reduzieren Sie die Häufigkeit der Nachrichten

### Fehler: "Keine Daten verfügbar"
- Die proxima.db Datenbank ist leer
- Führen Sie zuerst `python proxima_fetcher.py` aus

### Nachricht kommt nicht an
- Überprüfen Sie die Webhook-URL
- Prüfen Sie die Berechtigungen des Webhooks
- Schauen Sie in die Logs: `tail -f proxima_fetcher.log`

## 📊 Rate Limits

Discord Webhook Rate Limits:
- **5 Nachrichten pro Sekunde** pro Webhook
- **30 Nachrichten pro Minute** pro Webhook

Unser Script hält sich automatisch daran, da wir nur 1x pro Woche senden.

## 🎯 Best Practices

1. **Planen Sie Updates sinnvoll**: Nicht öfter als nötig (z.B. 1x pro Woche wie im Original)
2. **Nutzen Sie Embeds**: Sie sehen besser aus und sind übersichtlicher
3. **Fügen Sie Kontext hinzu**: Zeitstempel, Wochennummer, etc.
4. **Fehlerbehandlung**: Loggen Sie Fehler für Debugging
5. **Benachrichtigungen stummschalten**: Verwenden Sie `"allowed_mentions": {"parse": []}` im Payload

## 📚 Weitere Ressourcen

- [Discord Webhook Dokumentation](https://discord.com/developers/docs/resources/webhook)
- [Discord Embed Visualizer](https://leovoel.github.io/embed-visualizer/)
- [Discord API Server](https://discord.gg/discord-api)

## 💡 Erweiterte Funktionen

### Mehrere Webhooks

```python
webhooks = [
    'https://discord.com/api/webhooks/ID1/TOKEN1',
    'https://discord.com/api/webhooks/ID2/TOKEN2',
]

for url in webhooks:
    webhook = ProximaDiscordWebhook(url)
    webhook.send_to_discord()
```

### Konditionelle Benachrichtigungen

```python
data = webhook.get_proxima_data()

# Nur senden wenn neue Woche
if data['latest_week'] > last_sent_week:
    webhook.send_to_discord()
```

### Custom Embeds

```python
custom_embed = {
    "title": "🚀 Neue Proxima-Woche!",
    "description": f"Woche {week} ist jetzt verfügbar!",
    "color": 0x00FF88,
    "fields": [...]
}

requests.post(webhook_url, json={"embeds": [custom_embed]})
```

## 📞 Support

Bei Fragen oder Problemen:
1. Überprüfen Sie die Logs
2. Testen Sie die Webhook-URL manuell
3. Öffnen Sie ein Issue im Repository
4. Kontaktieren Sie den Admin

---

**Erstellt für Spacenations Tools** 🌌
