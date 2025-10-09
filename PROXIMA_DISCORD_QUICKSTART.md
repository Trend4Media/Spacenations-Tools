# 🚀 ProximaDB Discord Webhook - Quick Start

Eine **5-Minuten-Anleitung**, um ProximaDB-Daten an Discord zu senden.

## ⚡ Schnellstart in 3 Schritten

### 1️⃣ Discord Webhook erstellen

1. Öffnen Sie Ihren Discord-Server
2. Gehen Sie zu **Server-Einstellungen** → **Integrationen** → **Webhooks**
3. Klicken Sie auf **Neuer Webhook**
4. Wählen Sie den Kanal: **1349818332865368243**
5. Kopieren Sie die **Webhook-URL**

### 2️⃣ Webhook URL setzen

```bash
export DISCORD_WEBHOOK_URL='https://discord.com/api/webhooks/IHRE_ID/IHR_TOKEN'
```

### 3️⃣ Daten senden

```bash
python3 proxima_discord_webhook.py
```

**Das war's!** 🎉 Ihre ProximaDB-Daten werden jetzt an Discord gesendet.

---

## 📋 Was wurde erstellt?

### Neue Dateien:

1. **`proxima_discord_webhook.py`** - Haupt-Script für Discord Integration
2. **`DISCORD_WEBHOOK_ANLEITUNG.md`** - Vollständige Dokumentation
3. **`PROXIMA_DISCORD_QUICKSTART.md`** - Diese Quick-Start-Anleitung
4. **`example_webhook_usage.py`** - Beispiele für verschiedene Anwendungsfälle
5. **`send_proxima_to_discord.sh`** - Bash-Script für einfaches Senden

### Modifizierte Dateien:

- **`proxima_fetcher.py`** - Jetzt mit automatischer Discord-Integration

---

## 🎯 Verwendungsmöglichkeiten

### Manuell senden (einmalig)

```bash
python3 proxima_discord_webhook.py
```

### Automatisch mit proxima_fetcher

```bash
export DISCORD_WEBHOOK_URL='...'
python3 proxima_fetcher.py
```
→ Sendet automatisch jeden Mittwoch um 18:45 Uhr

### Mit Bash-Script

```bash
./send_proxima_to_discord.sh
```

### Beispiele ausführen

```bash
python3 example_webhook_usage.py
```

---

## 🔧 Konfiguration

### Umgebungsvariable (Empfohlen)

```bash
# Linux/Mac
export DISCORD_WEBHOOK_URL='https://discord.com/api/webhooks/...'

# Windows PowerShell
$env:DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/...'
```

### .env Datei

Erstellen Sie `.env`:
```
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
```

### Im Code

```python
from proxima_discord_webhook import ProximaDiscordWebhook

webhook = ProximaDiscordWebhook('https://discord.com/api/webhooks/...')
webhook.send_to_discord()
```

---

## 📤 Verschiedene Formate

### 1. Embed-Nachricht (schön formatiert)

```python
webhook.send_to_discord(use_embed=True)  # Standard
```

**Ausgabe:**
```
🌌 ProximaDB - Planetenübersicht

📊 Statistiken:
• Planeten gesamt: 42
• Aktuelle Woche: 10

🥇 Proxima 10-1
📍 12:345:6
💎 1,234 Punkte
...
```

### 2. Text-Tabelle

```python
webhook.send_to_discord(use_embed=False)
```

**Ausgabe:**
```
Top Planeten:
Rang | Name            | Koordinaten | Punkte
-----|-----------------|-------------|-------
 1   | Proxima 10-1   | 12:345:6    | 1,234
```

### 3. JSON-Datei

```python
webhook.send_full_data_as_file()
```

**Ausgabe:** Komplette Daten als downloadbare JSON-Datei

---

## ⏰ Automatisierung

### Cron Job (Linux/Mac)

```bash
# Jeden Mittwoch um 18:45
45 18 * * 3 cd /pfad/zum/projekt && python3 proxima_discord_webhook.py
```

### Windows Task Scheduler

1. Öffnen Sie **Aufgabenplanung**
2. Erstellen Sie eine neue **Aufgabe**
3. Trigger: Jeden Mittwoch 18:45
4. Aktion: `python.exe proxima_discord_webhook.py`

### Python Schedule (bereits integriert!)

Der `proxima_fetcher.py` macht das bereits automatisch:

```python
schedule.every().wednesday.at("18:45").do(webhook.send_to_discord)
```

---

## 🔒 Sicherheit - WICHTIG!

### ✅ DO's

- Webhook-URL in Umgebungsvariablen speichern
- `.env` zu `.gitignore` hinzufügen
- Webhook-URL NIEMALS committen

### ❌ DON'Ts

- Webhook-URL NICHT im Code hardcoden
- Webhook-URL NICHT öffentlich teilen
- Webhook-URL NICHT in Git pushen

---

## 🧪 Testen

### Schnelltest

```bash
# Test-Nachricht senden
curl -X POST "$DISCORD_WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{"content": "🧪 Test von ProximaDB!"}'
```

### Mit Python

```python
import requests
response = requests.post(
    'YOUR_WEBHOOK_URL',
    json={'content': '🧪 Test!'}
)
print(response.status_code)  # Sollte 204 sein
```

---

## 🛠️ Fehlerbehebung

| Problem | Lösung |
|---------|--------|
| **404 Fehler** | Webhook-URL ungültig → Neu erstellen |
| **429 Fehler** | Rate Limit → Warten Sie 1 Minute |
| **Keine Daten** | proxima.db leer → `python3 proxima_fetcher.py` ausführen |
| **Import Error** | Dependencies fehlen → `pip install -r requirements.txt` |

---

## 📚 Weitere Dokumentation

- **Vollständige Anleitung:** `DISCORD_WEBHOOK_ANLEITUNG.md`
- **Code-Beispiele:** `example_webhook_usage.py`
- **Discord API Docs:** https://discord.com/developers/docs/resources/webhook

---

## 💡 Tipps

1. **Testen Sie zuerst:** Senden Sie eine Test-Nachricht bevor Sie automatisieren
2. **Stummschalten:** Fügen Sie `"allowed_mentions": {"parse": []}` hinzu, um @everyone zu vermeiden
3. **Rate Limits:** Max 5 Nachrichten/Sekunde, 30/Minute pro Webhook
4. **Embeds sind besser:** Sie sehen professioneller aus und sind übersichtlicher
5. **Logs prüfen:** Bei Problemen schauen Sie in `proxima_fetcher.log`

---

## 🎨 Personalisierung

### Eigener Bot-Name

```python
payload = {
    "username": "Mein Custom Bot Name",
    "avatar_url": "https://url-zu-ihrem-bild.png",
    ...
}
```

### Eigene Farben

```python
embed = {
    "color": 0x00FF88,  # Hex Farbe ohne #
    ...
}
```

Beliebte Farben:
- Razer Grün: `0x00FF88`
- Discord Blurple: `0x5865F2`
- Rot: `0xFF0000`
- Gold: `0xFFD700`

---

## 📞 Support

**Bei Fragen:**
1. Lesen Sie `DISCORD_WEBHOOK_ANLEITUNG.md`
2. Prüfen Sie die Logs: `tail -f proxima_fetcher.log`
3. Testen Sie die Webhook-URL manuell
4. Schauen Sie in `example_webhook_usage.py` für Beispiele

---

**Viel Erfolg! 🚀**

*Erstellt für Spacenations Tools* 🌌
