# 📊 ProximaDB - Minimal & Excel Export

## ✅ Neue Features!

### 1. **Minimalistische Ansicht** 
Nur das Wichtigste: **Name : Punkte : Koordinaten**

### 2. **Excel-Export**
Komplette Daten als downloadbare Excel-Datei!

---

## 🚀 Verwendung

### Minimalistische Ansicht (Discord)

```bash
python3 send_minimal_to_discord.py
# Dann Option 1 wählen
```

**Ausgabe in Discord:**
```
📊 ProximaDB | 234 Planeten | Woche 12

Name                : Punkte   : Koordinaten
--------------------:---------:-------------
Proxima 12-1        :   10,234 : 12:345:6
Proxima 12-2        :    9,876 : 23:456:7
Proxima 12-3        :    8,543 : 34:567:8
Proxima 12-4        :    7,321 : 45:678:9
...
```

**Ohne Schnickschnack - genau wie gewünscht!** ✨

---

### Excel-Export (Download)

```bash
python3 send_minimal_to_discord.py
# Dann Option 2 wählen
```

**Was Sie bekommen:**
- 📊 Excel-Datei mit **allen** Planeten
- ✅ Spalten: Name | Punkte | Koordinaten | Zerstörung | Woche
- 🎨 Formatiert mit grünem Header (Razer-Grün #00FF88)
- 📥 Als Download in Discord verfügbar

---

## 📝 Programmatisch verwenden

### Nur Minimalansicht senden

```python
from proxima_discord_webhook import ProximaDiscordWebhook

webhook = ProximaDiscordWebhook('IHRE_WEBHOOK_URL')
webhook.send_to_discord(use_embed=False, table_style='minimal')
```

### Nur Excel-Datei senden

```python
webhook.send_excel_to_discord()
```

### Beides senden

```python
# Erst minimale Liste
webhook.send_to_discord(use_embed=False, table_style='minimal')

# Dann Excel-Datei
webhook.send_excel_to_discord()
```

### Excel lokal erstellen (ohne Discord)

```python
filename = webhook.create_excel_file('meine_proxima_daten.xlsx')
print(f"Excel erstellt: {filename}")
```

---

## 📊 Excel-Datei Details

### Spalten:
1. **Name** - Planetenname (z.B. "Proxima 12-1")
2. **Punkte** - Punktzahl (sortiert, höchste zuerst)
3. **Koordinaten** - Koordinaten (z.B. "12:345:6")
4. **Zerstörung** - Zerstörungsdatum formatiert
5. **Woche** - Wochennummer

### Formatierung:
- ✅ Grüner Header (Razer-Grün #00FF88)
- ✅ Fett gedruckte Spaltentitel
- ✅ Automatisch angepasste Spaltenbreiten
- ✅ Zentrierte Header
- ✅ Alle Planeten sortiert nach Punkten

### Dateiname:
- Format: `proxima_data_YYYYMMDD_HHMMSS.xlsx`
- Beispiel: `proxima_data_20251010_093620.xlsx`

---

## 🎯 Alle verfügbaren Formate

| Format | Beschreibung | Befehl |
|--------|--------------|--------|
| **Minimal** ⭐ | Name : Punkte : Koordinaten | `table_style='minimal'` |
| **Website** | Schöne Tabelle mit Boxen | `table_style='website'` |
| **Einfach** | Kompakte Tabelle | `table_style='simple'` |
| **Embed** | Karten-Stil | `use_embed=True` |
| **Excel** 📊 | Downloadbare .xlsx-Datei | `send_excel_to_discord()` |

---

## 💡 Beispiele

### Beispiel 1: Täglicher Report (minimal)

```python
import schedule
from proxima_discord_webhook import ProximaDiscordWebhook

def daily_report():
    webhook = ProximaDiscordWebhook('WEBHOOK_URL')
    webhook.send_to_discord(use_embed=False, table_style='minimal')

schedule.every().day.at("18:00").do(daily_report)
```

### Beispiel 2: Wöchentlicher Excel-Export

```python
def weekly_excel():
    webhook = ProximaDiscordWebhook('WEBHOOK_URL')
    webhook.send_excel_to_discord()

schedule.every().monday.at("09:00").do(weekly_excel)
```

### Beispiel 3: Beide Formate bei Update

```python
from proxima_fetcher import ProximaFetcher

fetcher = ProximaFetcher()
fetcher.update_planets()  # Daten holen

webhook = ProximaDiscordWebhook('WEBHOOK_URL')
webhook.send_to_discord(use_embed=False, table_style='minimal')  # Übersicht
webhook.send_excel_to_discord()  # Vollständige Daten
```

---

## 🔧 Dependencies

Für Excel-Export werden benötigt:
```bash
pip install pandas openpyxl
```

**Bereits installiert!** ✅

---

## 📁 Neue Scripts

| Script | Beschreibung |
|--------|--------------|
| `send_minimal_to_discord.py` | Interaktiv: Minimal/Excel/Beides |
| `proxima_discord_webhook.py` | Aktualisiert mit Minimal & Excel |

---

## 🆘 Fehlerbehebung

### Excel-Fehler: "pandas nicht gefunden"
```bash
pip install pandas openpyxl
```

### Excel-Datei zu groß für Discord
Discord Limit: 8 MB (sollte kein Problem sein bei ~1000 Planeten)

### Minimale Liste zu lang (>2000 Zeichen)
Zeigt Top 30 Planeten. Bei mehr als 30 Planeten wird automatisch gekürzt.

---

## 📈 Vorteile

### Minimal-Format:
✅ Schneller Überblick
✅ Keine überflüssigen Infos
✅ Direkt in Discord lesbar
✅ Top 30 Planeten

### Excel-Format:
✅ Alle Planeten enthalten
✅ Sortier- und Filterbar
✅ In Excel/LibreOffice öffnen
✅ Weiterverarbeitung möglich
✅ Offline verfügbar

---

## 🎯 Quick Commands

```bash
# Minimal
python3 -c "from proxima_discord_webhook import ProximaDiscordWebhook; ProximaDiscordWebhook('URL').send_to_discord(use_embed=False, table_style='minimal')"

# Excel
python3 -c "from proxima_discord_webhook import ProximaDiscordWebhook; ProximaDiscordWebhook('URL').send_excel_to_discord()"
```

---

**Genau was Sie wollten: Einfach und übersichtlich!** ✨

*Erstellt: 2025-10-10*
*ProximaDB - Minimal & Excel Export*
