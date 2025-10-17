# 🚀 ProximaDB Tabelle - Quick Start

## Sofort loslegen in 3 Schritten:

### 1️⃣ Einzelne Tabelle senden (Top 15)

```bash
python3 proxima_discord_webhook.py
```

### 2️⃣ Alle Planeten senden (mehrere Nachrichten)

```bash
python3 send_all_planets_to_discord.py
```

### 3️⃣ Automatisch jeden Mittwoch

```bash
export DISCORD_WEBHOOK_URL='https://discordapp.com/api/webhooks/1426138127608844388/EafXsVN9-auN12Trm3j9Ipi0V5y54dBaXlpSOmO_jOPEZ7fTkISsaWI46XN-zZPv9jmv'
python3 proxima_fetcher.py
```

## 📊 Was Sie in Discord sehen:

```
🌌 ProximaDB - Spacenations Tools
📊 234 Planeten | 📅 Woche 12

┌────┬──────────────────┬──────────────┬─────────┬────────────────────┬──────┐
│ #  │ Name             │ Koordinaten  │ Punkte  │ Zerstörung         │ Wo.  │
├────┼──────────────────┼──────────────┼─────────┼────────────────────┼──────┤
│ 🥇 │ Proxima 12-1     │ 12:345:6     │  10,234 │ 17.09.2025 16:06   │ W12  │
│ 🥈 │ Proxima 12-2     │ 23:456:7     │   9,876 │ 17.09.2025 16:06   │ W12  │
│ 🥉 │ Proxima 12-3     │ 34:567:8     │   8,543 │ 17.09.2025 16:06   │ W12  │
...
└────┴──────────────────┴──────────────┴─────────┴────────────────────┴──────┘

⏰ Letzte Aktualisierung: 2025-10-10 09:30
```

**Genau wie auf der Website!** ✨

## 📚 Mehr Infos:

- Vollständige Anleitung: `TABELLEN_FORMAT_ANLEITUNG.md`
- Beispiele: `send_table_to_discord.py`
