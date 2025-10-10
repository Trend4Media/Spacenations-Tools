# 📊 ProximaDB Tabellen-Format für Discord

Die ProximaDB-Daten werden jetzt als **schöne Tabelle** im Website-Stil an Discord gesendet!

## ✅ Was wurde geändert?

### Vorher (Embed-Format):
- Karten-basierte Darstellung
- Nur Top 10 Planeten
- Viel Platz beanspruchend

### Jetzt (Tabellen-Format):
- **Übersichtliche Tabelle** wie auf der Website
- **Top 15 Planeten** auf einen Blick
- Kompakte, professionelle Darstellung
- 🥇🥈🥉 Medaillen für Top 3

## 📋 Tabellen-Beispiel

```
🌌 ProximaDB - Spacenations Tools
📊 234 Planeten | 📅 Woche 12

┌────┬──────────────────┬──────────────┬─────────┬────────────────────┬──────┐
│ #  │ Name             │ Koordinaten  │ Punkte  │ Zerstörung         │ Wo.  │
├────┼──────────────────┼──────────────┼─────────┼────────────────────┼──────┤
│ 🥇 │ Proxima 12-1     │ 12:345:6     │  10,234 │ 17.09.2025 16:06   │ W12  │
│ 🥈 │ Proxima 12-2     │ 23:456:7     │   9,876 │ 17.09.2025 16:06   │ W12  │
│ 🥉 │ Proxima 12-3     │ 34:567:8     │   8,543 │ 17.09.2025 16:06   │ W12  │
│ 4  │ Proxima 12-4     │ 45:678:9     │   7,321 │ 17.09.2025 16:06   │ W12  │
...
└────┴──────────────────┴──────────────┴─────────┴────────────────────┴──────┘

⏰ Letzte Aktualisierung: 2025-10-10 09:30
```

## 🚀 Verwendung

### Option 1: Einzelne Tabelle (Top 15)

```bash
# Automatisch (empfohlen)
python3 proxima_discord_webhook.py

# Oder mit Script
./send_table_to_discord.py
```

**Zeigt:** Die Top 15 Planeten in einer Nachricht

### Option 2: Alle Planeten (mehrere Nachrichten)

```bash
python3 send_all_planets_to_discord.py
```

**Zeigt:** ALLE Planeten, aufgeteilt in mehrere Tabellen (je 15 Planeten)

**Beispiel:**
- Bei 234 Planeten → 16 Nachrichten
- Bei 45 Planeten → 3 Nachrichten

### Option 3: Interaktiv wählen

```bash
python3 send_table_to_discord.py
```

Dann wählen Sie:
1. Website-Style Tabelle ✅ (Standard)
2. Einfache Tabelle
3. Embed-Format (alte Ansicht)

## 🔄 Automatische Integration

Der `proxima_fetcher.py` sendet jetzt **automatisch die Tabelle** jeden Mittwoch:

```bash
export DISCORD_WEBHOOK_URL='https://discordapp.com/api/webhooks/...'
python3 proxima_fetcher.py
```

✅ **Läuft automatisch jeden Mittwoch um 18:45 Uhr**
✅ **Sendet Tabellen-Format statt Embeds**

## 📊 Verfügbare Formate

### 1. Website-Style Tabelle (NEU! ⭐)
- Schöne Box-Zeichnung
- Top 15 Planeten
- Wie auf der Website
```python
webhook.send_to_discord(use_embed=False, table_style='website')
```

### 2. Einfache Tabelle
- Kompakt, ohne Boxen
- Top 25 Planeten
```python
webhook.send_to_discord(use_embed=False, table_style='simple')
```

### 3. Embed-Format (Alt)
- Karten-Stil
- Top 10 Planeten
```python
webhook.send_to_discord(use_embed=True)
```

### 4. Alle Planeten (Multi-Tabelle)
- Mehrere Nachrichten
- Alle Planeten
```python
webhook.send_multi_table(planets_per_page=15)
```

## 🎨 Anpassungen

### Anzahl der Planeten ändern

**In `proxima_discord_webhook.py`, Zeile 145:**
```python
planets = data['planets'][:15]  # Ändern Sie 15 zu gewünschter Zahl
```

⚠️ **Achtung:** Discord hat ein Limit von 2000 Zeichen!
- Top 15 Planeten = ca. 1800 Zeichen ✅
- Top 20 Planeten = ca. 2200 Zeichen ❌ (zu lang!)

### Spaltenbreiten anpassen

**Zeile 152-154:**
```python
│ {rank:<2} │ {name[:16]:<16} │ {coordinates:<12} │ ...
#              ↑ Zeichenlimit   ↑ Spaltenbreite
```

### Bot-Name ändern

**Zeile 207:**
```python
"username": "Proxima Sabocounter",  # Ihr eigener Name
```

## 📁 Neue Scripts

| Script | Beschreibung |
|--------|--------------|
| `proxima_discord_webhook.py` | **Aktualisiert** - Jetzt mit Tabellen-Format |
| `send_table_to_discord.py` | Interaktive Auswahl des Formats |
| `send_all_planets_to_discord.py` | Sendet ALLE Planeten |
| `proxima_fetcher.py` | **Aktualisiert** - Sendet Tabellen statt Embeds |

## 🔧 Konfiguration

### Standard-Format ändern

**In `proxima_discord_webhook.py`, Zeile 300:**
```python
# Standard: Tabellen-Format
success = webhook.send_to_discord(use_embed=False, table_style='website')

# Alternative: Embed-Format
success = webhook.send_to_discord(use_embed=True)
```

### Automatische Aktualisierung

**In `proxima_fetcher.py`, Zeile 219:**
```python
# Aktuell: Tabellen-Format
success = webhook.send_to_discord(use_embed=False, table_style='website')

# Ändern zu Embeds:
success = webhook.send_to_discord(use_embed=True)
```

## 💡 Tipps & Tricks

### 1. **Nur neue Planeten senden**
```python
# Nur senden wenn neue Woche
if data['latest_week'] > last_week:
    webhook.send_to_discord(use_embed=False, table_style='website')
```

### 2. **Ping bei wichtigen Updates**
```python
payload = {
    "content": "@here Neue Proxima-Woche verfügbar!\n\n" + message
}
```

### 3. **Mehrere Kanäle**
```python
webhooks = [URL1, URL2, URL3]
for url in webhooks:
    ProximaDiscordWebhook(url).send_to_discord(...)
```

### 4. **Schedule für andere Tage**
```python
# Zusätzlich jeden Sonntag
schedule.every().sunday.at("20:00").do(webhook.send_to_discord)
```

## 🆘 Fehlerbehebung

### Problem: "Must be 2000 or fewer in length"
**Lösung:** Reduzieren Sie die Anzahl der Planeten
```python
planets = data['planets'][:12]  # Statt [:15]
```

### Problem: Tabelle sieht verschoben aus
**Lösung:** Discord benötigt Monospace-Font (Code-Block)
- Stellen Sie sicher, dass die Tabelle in ``` ``` steht
- Verwenden Sie keine Tabs, nur Leerzeichen

### Problem: Emojis zerstören Layout
**Lösung:** Emojis haben variable Breite
```python
# Verwenden Sie fixed-width Alternativen
rank = f"{i:2}" if i > 3 else ["🥇","🥈","🥉"][i-1]
```

## 📈 Beispiel-Ausgabe

### In Discord sehen Sie:

**Nachricht von ProximaDB Bot:**
```
🌌 ProximaDB - Spacenations Tools
📊 234 Planeten | 📅 Woche 12

┌────┬──────────────────┬──────────────┬─────────┬────────────────────┬──────┐
│ #  │ Name             │ Koordinaten  │ Punkte  │ Zerstörung         │ Wo.  │
├────┼──────────────────┼──────────────┼─────────┼────────────────────┼──────┤
│ 🥇 │ Proxima 12-1     │ 12:345:6     │  10,234 │ 17.09.2025 16:06   │ W12  │
│ 🥈 │ Proxima 12-2     │ 23:456:7     │   9,876 │ 17.09.2025 16:06   │ W12  │
│ 🥉 │ Proxima 12-3     │ 34:567:8     │   8,543 │ 17.09.2025 16:06   │ W12  │
│ 4  │ Proxima 12-4     │ 45:678:9     │   7,321 │ 17.09.2025 16:06   │ W12  │
│ 5  │ Proxima 12-5     │ 56:789:0     │   6,543 │ 17.09.2025 16:06   │ W12  │
[... weitere Zeilen ...]
│ 15 │ Proxima 12-15    │ 91:234:5     │   2,100 │ 17.09.2025 16:06   │ W12  │
└────┴──────────────────┴──────────────┴─────────┴────────────────────┴──────┘

⏰ Letzte Aktualisierung: 2025-10-10 09:30
```

**Genau wie auf der Website!** ✨

## 🎯 Zusammenfassung

✅ **Tabellen-Format implementiert** - Sieht aus wie die Website
✅ **Top 15 Planeten** - Optimiert für Discord-Limit
✅ **Medaillen für Top 3** - 🥇🥈🥉
✅ **Automatische Integration** - Läuft jeden Mittwoch
✅ **Multi-Tabelle Option** - Für alle Planeten
✅ **Interaktive Scripts** - Einfache Bedienung

**Die ProximaDB wird jetzt schön formatiert in Discord angezeigt!** 🌌

---

*Erstellt: 2025-10-10*
*ProximaDB Discord Integration - Tabellen-Format*
