#!/usr/bin/env python3
"""
ProximaDB Quick Access - Schnellzugriff auf alle Formate
"""

from proxima_discord_webhook import ProximaDiscordWebhook
import sys

WEBHOOK_URL = 'https://discordapp.com/api/webhooks/1426138127608844388/EafXsVN9-auN12Trm3j9Ipi0V5y54dBaXlpSOmO_jOPEZ7fTkISsaWI46XN-zZPv9jmv'

def show_menu():
    print("\n" + "="*60)
    print("🌌 ProximaDB - Quick Access")
    print("="*60)
    print()
    print("Formate:")
    print("  1. Minimal (Name : Punkte : Koordinaten) ⭐")
    print("  2. Website-Tabelle (schöne Boxen)")
    print("  3. Excel-Datei (Download)")
    print("  4. Alle Planeten (mehrere Nachrichten)")
    print()
    print("  0. Beenden")
    print()

def main():
    webhook = ProximaDiscordWebhook(WEBHOOK_URL)
    
    while True:
        show_menu()
        choice = input("Wählen Sie (0-4): ").strip()
        
        if choice == "0":
            print("\n👋 Auf Wiedersehen!")
            break
        
        elif choice == "1":
            print("\n📤 Sende minimale Liste...")
            if webhook.send_to_discord(use_embed=False, table_style='minimal'):
                print("✅ Erfolgreich gesendet!")
            else:
                print("❌ Fehler beim Senden!")
        
        elif choice == "2":
            print("\n📤 Sende Website-Tabelle...")
            if webhook.send_to_discord(use_embed=False, table_style='website'):
                print("✅ Erfolgreich gesendet!")
            else:
                print("❌ Fehler beim Senden!")
        
        elif choice == "3":
            print("\n📊 Erstelle Excel-Datei...")
            if webhook.send_excel_to_discord():
                print("✅ Excel-Datei erfolgreich gesendet!")
            else:
                print("❌ Fehler beim Senden!")
        
        elif choice == "4":
            data = webhook.get_proxima_data()
            total = len(data['planets'])
            pages = (total + 14) // 15
            
            response = input(f"\n⚠️  Sendet {pages} Nachrichten. Fortfahren? (j/n): ")
            if response.lower() == 'j':
                print("\n📤 Sende alle Planeten...")
                if webhook.send_multi_table(planets_per_page=15):
                    print(f"✅ Alle {pages} Nachrichten gesendet!")
                else:
                    print("❌ Fehler beim Senden!")
        
        else:
            print("\n❌ Ungültige Eingabe!")
        
        input("\nDrücken Sie Enter für das Menü...")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n👋 Auf Wiedersehen!")
    except Exception as e:
        print(f"\n❌ Fehler: {e}")
        sys.exit(1)
