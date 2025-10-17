#!/usr/bin/env python3
"""
Test-Script für den automatischen Scheduler
Simuliert einen Mittwoch 18:45 Update
"""

import os
from proxima_fetcher import ProximaFetcher

def test_scheduler():
    print("🧪 Test: Automatischer Mittwoch-Update")
    print("="*50)
    print()
    
    # Webhook URL setzen
    webhook_url = 'https://discordapp.com/api/webhooks/1426138127608844388/EafXsVN9-auN12Trm3j9Ipi0V5y54dBaXlpSOmO_jOPEZ7fTkISsaWI46XN-zZPv9jmv'
    os.environ['DISCORD_WEBHOOK_URL'] = webhook_url
    
    print("📡 Webhook-URL gesetzt")
    print()
    
    # Erstelle Fetcher
    fetcher = ProximaFetcher()
    
    # Teste run_sync (das wird am Mittwoch ausgeführt)
    print("🔄 Simuliere Mittwoch 18:45 Update...")
    print("   1. Lade Daten von beta2 API")
    print("   2. Speichere in Datenbank")
    print("   3. Generiere HTML-Report")
    print("   4. Sende an Discord")
    print()
    
    success = fetcher.run_sync()
    
    print()
    if success:
        print("✅ Scheduler-Test erfolgreich!")
        print()
        print("📊 Was passiert jeden Mittwoch 18:45:")
        print("   ✓ Planeten von beta2 laden")
        print("   ✓ In Datenbank speichern")
        print("   ✓ HTML-Report generieren")
        print("   ✓ An Discord senden (minimal + Excel)")
        print()
        print("🎉 Automatischer Webhook funktioniert!")
    else:
        print("❌ Fehler beim Test!")
        print("   Überprüfen Sie die Logs")
    
    print()
    print("💡 Zum Starten des echten Schedulers:")
    print("   ./start_proxima_scheduler.sh")
    print()
    print("   oder:")
    print()
    print("   export DISCORD_WEBHOOK_URL='...'")
    print("   python3 proxima_fetcher.py")

if __name__ == "__main__":
    test_scheduler()
