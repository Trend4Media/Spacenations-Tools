#!/usr/bin/env python3
"""
Schnell-Script zum Senden der ProximaDB-Tabelle an Discord
"""

import os
from proxima_discord_webhook import ProximaDiscordWebhook

# Ihre Webhook URL
WEBHOOK_URL = 'https://discordapp.com/api/webhooks/1426138127608844388/EafXsVN9-auN12Trm3j9Ipi0V5y54dBaXlpSOmO_jOPEZ7fTkISsaWI46XN-zZPv9jmv'

def main():
    print("🌌 ProximaDB - Tabelle an Discord senden")
    print("="*50)
    
    webhook = ProximaDiscordWebhook(WEBHOOK_URL)
    
    # Verschiedene Formate zum Auswählen
    print("\nVerfügbare Formate:")
    print("1. Website-Style Tabelle (mit Farben, Top 25)")
    print("2. Einfache Tabelle (kompakt, Top 25)")
    print("3. Embed-Format (Karten-Stil)")
    print()
    
    choice = input("Wählen Sie ein Format (1-3) oder Enter für Standard: ").strip()
    
    if choice == "2":
        print("\n📤 Sende einfache Tabelle...")
        success = webhook.send_to_discord(use_embed=False, table_style='simple')
    elif choice == "3":
        print("\n📤 Sende Embed-Format...")
        success = webhook.send_to_discord(use_embed=True)
    else:
        print("\n📤 Sende Website-Style Tabelle...")
        success = webhook.send_to_discord(use_embed=False, table_style='website')
    
    if success:
        print("✅ Erfolgreich an Discord gesendet!")
    else:
        print("❌ Fehler beim Senden!")

if __name__ == "__main__":
    main()
