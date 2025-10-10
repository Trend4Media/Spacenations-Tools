#!/usr/bin/env python3
"""
Sendet ProximaDB in minimalistischem Format: Name : Punkte : Koordinaten
"""

import os
from proxima_discord_webhook import ProximaDiscordWebhook

WEBHOOK_URL = 'https://discordapp.com/api/webhooks/1426138127608844388/EafXsVN9-auN12Trm3j9Ipi0V5y54dBaXlpSOmO_jOPEZ7fTkISsaWI46XN-zZPv9jmv'

def main():
    print("🌌 ProximaDB - Minimalistische Ansicht")
    print("="*50)
    print()
    
    webhook = ProximaDiscordWebhook(WEBHOOK_URL)
    
    print("Verfügbare Optionen:")
    print()
    print("1. Minimal (Name : Punkte : Koordinaten)")
    print("2. Excel-Datei senden")
    print("3. Beides")
    print()
    
    choice = input("Wählen Sie (1-3): ").strip()
    
    if choice == "1":
        print("\n📤 Sende minimale Liste...")
        success = webhook.send_to_discord(use_embed=False, table_style='minimal')
        if success:
            print("✅ Erfolgreich gesendet!")
        else:
            print("❌ Fehler beim Senden!")
    
    elif choice == "2":
        print("\n📊 Erstelle Excel-Datei...")
        success = webhook.send_excel_to_discord()
        if success:
            print("✅ Excel-Datei erfolgreich gesendet!")
        else:
            print("❌ Fehler beim Senden der Excel-Datei!")
    
    elif choice == "3":
        print("\n📤 Sende minimale Liste...")
        success1 = webhook.send_to_discord(use_embed=False, table_style='minimal')
        
        print("📊 Erstelle Excel-Datei...")
        success2 = webhook.send_excel_to_discord()
        
        if success1 and success2:
            print("✅ Beides erfolgreich gesendet!")
        else:
            print("⚠️ Mindestens ein Versand hatte Fehler!")
    
    else:
        print("❌ Ungültige Eingabe!")

if __name__ == "__main__":
    main()
