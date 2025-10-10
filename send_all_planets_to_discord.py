#!/usr/bin/env python3
"""
Sendet ALLE Planeten als mehrere Tabellen-Nachrichten an Discord
"""

import os
from proxima_discord_webhook import ProximaDiscordWebhook

WEBHOOK_URL = 'https://discordapp.com/api/webhooks/1426138127608844388/EafXsVN9-auN12Trm3j9Ipi0V5y54dBaXlpSOmO_jOPEZ7fTkISsaWI46XN-zZPv9jmv'

def main():
    print("🌌 ProximaDB - ALLE Planeten an Discord senden")
    print("="*50)
    print()
    
    webhook = ProximaDiscordWebhook(WEBHOOK_URL)
    
    # Hole Daten-Info
    data = webhook.get_proxima_data()
    if not data:
        print("❌ Keine Daten verfügbar!")
        return
    
    total_planets = len(data['planets'])
    planets_per_page = 15
    total_pages = (total_planets + planets_per_page - 1) // planets_per_page
    
    print(f"📊 Gefunden: {total_planets} Planeten")
    print(f"📄 Wird aufgeteilt in: {total_pages} Nachrichten (je 15 Planeten)")
    print()
    
    response = input(f"Möchten Sie {total_pages} Nachrichten an Discord senden? (j/n): ").strip().lower()
    
    if response != 'j':
        print("❌ Abgebrochen!")
        return
    
    print()
    print("📤 Sende Daten an Discord...")
    
    success = webhook.send_multi_table(planets_per_page=15)
    
    if success:
        print(f"✅ Alle {total_pages} Nachrichten erfolgreich gesendet!")
    else:
        print("❌ Fehler beim Senden!")

if __name__ == "__main__":
    main()
