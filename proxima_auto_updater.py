#!/usr/bin/env python3
"""
Proxima Auto-Updater
Überprüft jeden Mittwoch zwischen 17-23 Uhr alle 5 Minuten die Beta2 API
und aktualisiert proxima_data.json bei neuen Daten
"""

import json
import time
import logging
import requests
from datetime import datetime, time as dt_time
from pathlib import Path

# Logging konfigurieren
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('proxima_auto_updater.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Konfiguration
API_URL = 'https://beta2.game.spacenations.eu/api/proxima'
JSON_FILE = Path(__file__).parent / 'proxima_data.json'
CHECK_INTERVAL = 300  # 5 Minuten in Sekunden
START_HOUR = 17  # 17 Uhr
END_HOUR = 23    # 23 Uhr
WEDNESDAY = 2    # 0=Montag, 2=Mittwoch

def fetch_api_data():
    """Lädt Daten von der Beta2 API"""
    try:
        logger.info(f"🔍 Rufe API ab: {API_URL}")
        response = requests.get(API_URL, timeout=15)
        response.raise_for_status()
        data = response.json()
        logger.info(f"✅ API-Daten geladen: {len(data)} Planeten")
        return data
    except requests.exceptions.RequestException as e:
        logger.error(f"❌ API-Fehler: {e}")
        return None

def load_current_data():
    """Lädt aktuelle Daten aus proxima_data.json"""
    try:
        if JSON_FILE.exists():
            with open(JSON_FILE, 'r', encoding='utf-8') as f:
                data = json.load(f)
            logger.info(f"📂 Aktuelle Daten geladen: {len(data)} Planeten")
            return data
        else:
            logger.warning(f"⚠️ {JSON_FILE} existiert nicht")
            return []
    except Exception as e:
        logger.error(f"❌ Fehler beim Laden: {e}")
        return []

def save_data(data):
    """Speichert Daten in proxima_data.json"""
    try:
        with open(JSON_FILE, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        logger.info(f"💾 Daten gespeichert: {len(data)} Planeten")
        return True
    except Exception as e:
        logger.error(f"❌ Fehler beim Speichern: {e}")
        return False

def data_has_changed(old_data, new_data):
    """Prüft ob sich die Daten geändert haben"""
    if len(old_data) != len(new_data):
        return True
    
    # Konvertiere zu Sets für Vergleich
    old_set = set(json.dumps(item, sort_keys=True) for item in old_data)
    new_set = set(json.dumps(item, sort_keys=True) for item in new_data)
    
    return old_set != new_set

def is_update_time():
    """Prüft ob es Mittwoch zwischen 17-23 Uhr ist"""
    now = datetime.now()
    is_wednesday = now.weekday() == WEDNESDAY
    is_correct_hour = START_HOUR <= now.hour < END_HOUR
    
    return is_wednesday and is_correct_hour

def check_and_update():
    """Hauptfunktion: Prüft API und aktualisiert bei Änderungen"""
    logger.info("🔄 Starte Überprüfung...")
    
    # Zeitfenster prüfen
    if not is_update_time():
        now = datetime.now()
        logger.info(f"⏰ Außerhalb des Update-Zeitfensters (Mittwoch 17-23 Uhr)")
        logger.info(f"   Aktuell: {now.strftime('%A %H:%M Uhr')}")
        return False
    
    # API-Daten laden
    new_data = fetch_api_data()
    if not new_data:
        logger.warning("⚠️ Keine API-Daten verfügbar")
        return False
    
    # Aktuelle Daten laden
    current_data = load_current_data()
    
    # Vergleichen
    if data_has_changed(current_data, new_data):
        logger.info(f"🔔 Änderungen erkannt!")
        logger.info(f"   Alt: {len(current_data)} Planeten")
        logger.info(f"   Neu: {len(new_data)} Planeten")
        
        # Speichern
        if save_data(new_data):
            logger.info("✅ Update erfolgreich!")
            return True
        else:
            logger.error("❌ Update fehlgeschlagen!")
            return False
    else:
        logger.info("✓ Keine Änderungen - Daten sind aktuell")
        return False

def run_continuous():
    """Läuft kontinuierlich und prüft alle 5 Minuten"""
    logger.info("🚀 Proxima Auto-Updater gestartet")
    logger.info(f"📅 Update-Zeitfenster: Mittwoch {START_HOUR}:00 - {END_HOUR}:00 Uhr")
    logger.info(f"⏱️  Prüfintervall: Alle {CHECK_INTERVAL // 60} Minuten")
    logger.info(f"📂 Zieldatei: {JSON_FILE}")
    logger.info("-" * 60)
    
    while True:
        try:
            check_and_update()
        except Exception as e:
            logger.error(f"❌ Unerwarteter Fehler: {e}", exc_info=True)
        
        # Warte 5 Minuten
        logger.info(f"😴 Nächste Prüfung in {CHECK_INTERVAL // 60} Minuten...")
        time.sleep(CHECK_INTERVAL)

def run_once():
    """Einmalige Ausführung (für manuelles Testen)"""
    logger.info("🔧 Einmalige Ausführung (Testmodus)")
    check_and_update()

if __name__ == '__main__':
    import sys
    
    # Wenn "--once" Parameter, nur einmal ausführen
    if len(sys.argv) > 1 and sys.argv[1] == '--once':
        run_once()
    else:
        run_continuous()
