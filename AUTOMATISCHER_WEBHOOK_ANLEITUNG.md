# 🤖 Automatischer Discord-Webhook - Anleitung

## ✅ Ja, der Webhook funktioniert automatisch!

Jeden **Mittwoch um 18:45 Uhr** werden automatisch:
1. 📡 Neue Planeten von beta2 API geladen
2. 💾 In Datenbank gespeichert
3. 📄 HTML-Report generiert
4. 📤 **An Discord gesendet** (minimal + Excel)

---

## 🚀 So starten Sie den automatischen Scheduler:

### **Option 1: Mit Start-Script (Empfohlen)**

```bash
# Webhook-URL setzen
export DISCORD_WEBHOOK_URL='https://discordapp.com/api/webhooks/1426138127608844388/EafXsVN9-auN12Trm3j9Ipi0V5y54dBaXlpSOmO_jOPEZ7fTkISsaWI46XN-zZPv9jmv'

# Scheduler starten
./start_proxima_scheduler.sh
```

### **Option 2: Direkt mit Python**

```bash
export DISCORD_WEBHOOK_URL='...'
python3 proxima_fetcher.py
```

### **Option 3: Im Hintergrund (nohup)**

```bash
export DISCORD_WEBHOOK_URL='...'
nohup python3 proxima_fetcher.py > proxima_scheduler.log 2>&1 &
```

### **Option 4: Mit screen (empfohlen für Server)**

```bash
screen -S proxima
export DISCORD_WEBHOOK_URL='...'
python3 proxima_fetcher.py
# Drücken Sie: Ctrl+A dann D (zum Detachen)
```

---

## 📅 Zeitplan

**Jeden Mittwoch 18:45 Uhr:**

1. ✅ Lädt Planeten von `https://beta2.game.spacenations.eu/api/proxima`
2. ✅ Speichert in `proxima.db`
3. ✅ Generiert `proxima_report.html`
4. ✅ **Sendet automatisch an Discord:**
   - Minimale Liste (Name : Punkte : Koordinaten)
   - Excel-Datei (alle Planeten)

---

## 🧪 Testen Sie den Scheduler:

```bash
python3 test_scheduler.py
```

Das simuliert einen Mittwoch 18:45 Update und sendet sofort an Discord!

---

## 🔄 Wie es funktioniert:

### **proxima_fetcher.py:**
```python
# Scheduler-Konfiguration (Zeile 430)
schedule.every().wednesday.at("18:45").do(fetcher.run_sync)

# run_sync() führt aus:
def run_sync(self):
    self.update_planets()           # Lade von API
    self.generate_html_report()     # Generiere HTML
    self.send_to_discord()          # → SENDE AN DISCORD! ✅
```

### **send_to_discord() (Zeile 207-229):**
```python
def send_to_discord(self):
    webhook_url = os.getenv('DISCORD_WEBHOOK_URL')
    if webhook_url:
        webhook = ProximaDiscordWebhook(webhook_url)
        webhook.send_to_discord(use_embed=False, table_style='minimal')
        # → Sendet automatisch!
```

---

## ✅ Voraussetzungen:

1. **Discord Webhook URL setzen:**
   ```bash
   export DISCORD_WEBHOOK_URL='https://discord.com/api/webhooks/...'
   ```

2. **Dependencies installiert:**
   ```bash
   pip install requests schedule pandas openpyxl
   ```
   ✅ Bereits installiert!

3. **Scheduler läuft permanent:**
   - Im Hintergrund mit `nohup` oder `screen`
   - Oder als systemd Service (siehe unten)

---

## 🖥️ Als Service einrichten (Linux):

### **Systemd Service erstellen:**

```bash
sudo nano /etc/systemd/system/proxima-scheduler.service
```

**Inhalt:**
```ini
[Unit]
Description=ProximaDB Automatischer Scheduler
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/workspace
Environment="DISCORD_WEBHOOK_URL=https://discordapp.com/api/webhooks/1426138127608844388/EafXsVN9-auN12Trm3j9Ipi0V5y54dBaXlpSOmO_jOPEZ7fTkISsaWI46XN-zZPv9jmv"
ExecStart=/usr/bin/python3 /workspace/proxima_fetcher.py
Restart=always
RestartSec=60

[Install]
WantedBy=multi-user.target
```

**Aktivieren:**
```bash
sudo systemctl daemon-reload
sudo systemctl enable proxima-scheduler
sudo systemctl start proxima-scheduler
sudo systemctl status proxima-scheduler
```

**Logs ansehen:**
```bash
sudo journalctl -u proxima-scheduler -f
```

---

## 📊 Was wird gesendet:

### **1. Minimale Liste:**
```
📊 ProximaDB | 118 Planeten | Woche 2

Name                : Punkte   : Koordinaten
--------------------:---------:-------------
Proxima 2-39        :      498 : 555:578:9
Proxima 2-58        :      488 : 555:192:3
...
```

### **2. Excel-Datei:**
- Alle Planeten
- 5 Spalten: Name | Punkte | Koordinaten | Zerstörung | Woche
- Als Download verfügbar

---

## 🔍 Überprüfung:

### **Prüfen ob Scheduler läuft:**
```bash
ps aux | grep proxima_fetcher
```

### **Logs ansehen:**
```bash
tail -f proxima_fetcher.log
```

### **Nächster Mittwoch:**
```bash
python3 -c "import schedule; print(schedule.jobs)"
```

---

## 💡 Tipps:

### **Sofortiger Test (nicht auf Mittwoch warten):**
```bash
python3 test_scheduler.py
```

### **Manuell aktualisieren:**
```bash
python3 proxima_quick.py
```

### **Nur Daten laden (ohne Discord):**
```bash
unset DISCORD_WEBHOOK_URL
python3 proxima_fetcher.py
```

---

## 🆘 Fehlerbehebung:

### **Webhook wird nicht gesendet?**
1. Prüfen Sie die Umgebungsvariable:
   ```bash
   echo $DISCORD_WEBHOOK_URL
   ```

2. Prüfen Sie die Logs:
   ```bash
   grep "Discord" proxima_fetcher.log
   ```

3. Testen Sie manuell:
   ```bash
   python3 test_scheduler.py
   ```

### **Scheduler läuft nicht?**
1. Prüfen Sie ob der Prozess läuft:
   ```bash
   ps aux | grep proxima
   ```

2. Starten Sie neu:
   ```bash
   pkill -f proxima_fetcher
   ./start_proxima_scheduler.sh
   ```

---

## 📝 Zusammenfassung:

✅ **Automatischer Webhook ist AKTIVIERT**
✅ Läuft jeden **Mittwoch 18:45 Uhr**
✅ Lädt neue Planeten von **beta2 API**
✅ Sendet automatisch an **Discord**
✅ Kann jederzeit getestet werden

**Kommando zum Starten:**
```bash
export DISCORD_WEBHOOK_URL='https://discordapp.com/api/webhooks/1426138127608844388/EafXsVN9-auN12Trm3j9Ipi0V5y54dBaXlpSOmO_jOPEZ7fTkISsaWI46XN-zZPv9jmv'
python3 proxima_fetcher.py
```

**Oder einfach:**
```bash
./start_proxima_scheduler.sh
```

---

**Der Webhook sendet automatisch sobald neue Planeten am Mittwoch verfügbar sind!** 🚀
