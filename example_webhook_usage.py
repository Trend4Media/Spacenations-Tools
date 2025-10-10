#!/usr/bin/env python3
"""
Beispiele für die Verwendung des ProximaDB Discord Webhooks
"""

import os
from proxima_discord_webhook import ProximaDiscordWebhook

def beispiel_1_einfach():
    """Beispiel 1: Einfachster Weg - Embed senden"""
    print("📤 Beispiel 1: Einfache Embed-Nachricht")
    
    webhook_url = os.getenv('DISCORD_WEBHOOK_URL')
    if not webhook_url:
        print("❌ DISCORD_WEBHOOK_URL nicht gesetzt!")
        return
    
    webhook = ProximaDiscordWebhook(webhook_url)
    webhook.send_to_discord(use_embed=True)
    print("✅ Gesendet!\n")


def beispiel_2_text_tabelle():
    """Beispiel 2: Einfache Text-Tabelle"""
    print("📤 Beispiel 2: Text-Tabelle")
    
    webhook_url = os.getenv('DISCORD_WEBHOOK_URL')
    if not webhook_url:
        print("❌ DISCORD_WEBHOOK_URL nicht gesetzt!")
        return
    
    webhook = ProximaDiscordWebhook(webhook_url)
    webhook.send_to_discord(use_embed=False)
    print("✅ Gesendet!\n")


def beispiel_3_datei_export():
    """Beispiel 3: Komplette Daten als JSON-Datei"""
    print("📤 Beispiel 3: JSON-Datei Export")
    
    webhook_url = os.getenv('DISCORD_WEBHOOK_URL')
    if not webhook_url:
        print("❌ DISCORD_WEBHOOK_URL nicht gesetzt!")
        return
    
    webhook = ProximaDiscordWebhook(webhook_url)
    webhook.send_full_data_as_file()
    print("✅ Gesendet!\n")


def beispiel_4_custom_embed():
    """Beispiel 4: Custom Embed mit eigenen Daten"""
    print("📤 Beispiel 4: Custom Embed")
    
    webhook_url = os.getenv('DISCORD_WEBHOOK_URL')
    if not webhook_url:
        print("❌ DISCORD_WEBHOOK_URL nicht gesetzt!")
        return
    
    import requests
    from datetime import datetime
    
    webhook = ProximaDiscordWebhook(webhook_url)
    data = webhook.get_proxima_data()
    
    if not data:
        print("❌ Keine Daten verfügbar!")
        return
    
    # Custom Embed erstellen
    custom_embed = {
        "title": "🚀 Wöchentlicher ProximaDB Report",
        "description": f"**Spacenations Proxima-Update**\n\n📅 Woche: **{data['latest_week']}**\n📊 Planeten: **{data['total_planets']}**",
        "color": 0x00FF88,  # Razer Grün
        "fields": [
            {
                "name": "🏆 Top Planet",
                "value": f"**{data['planets'][0][0]}**\nKoordinaten: `{data['planets'][0][1]}`\nPunkte: **{data['planets'][0][2]:,}**",
                "inline": False
            },
            {
                "name": "📈 Statistiken",
                "value": f"Gesamt Planeten: {data['total_planets']}\nAktive Woche: {data['latest_week']}",
                "inline": True
            }
        ],
        "footer": {
            "text": "ProximaDB • Spacenations Tools"
        },
        "timestamp": datetime.utcnow().isoformat(),
        "thumbnail": {
            "url": "https://cdn.discordapp.com/attachments/placeholder/planet.png"
        }
    }
    
    payload = {
        "username": "ProximaDB Custom Bot",
        "embeds": [custom_embed]
    }
    
    response = requests.post(webhook_url, json=payload)
    if response.status_code == 204:
        print("✅ Custom Embed gesendet!\n")
    else:
        print(f"❌ Fehler: {response.status_code}\n")


def beispiel_5_mehrere_webhooks():
    """Beispiel 5: An mehrere Discord-Kanäle senden"""
    print("📤 Beispiel 5: Mehrere Webhooks")
    
    # Liste von Webhook-URLs
    webhooks = [
        os.getenv('DISCORD_WEBHOOK_URL_1'),
        os.getenv('DISCORD_WEBHOOK_URL_2'),
        # Weitere Webhooks hier hinzufügen...
    ]
    
    # Filtere None-Werte
    webhooks = [w for w in webhooks if w]
    
    if not webhooks:
        print("❌ Keine Webhooks konfiguriert!")
        print("Setzen Sie DISCORD_WEBHOOK_URL_1, DISCORD_WEBHOOK_URL_2, etc.")
        return
    
    for i, url in enumerate(webhooks, 1):
        print(f"  → Sende an Webhook {i}...")
        webhook = ProximaDiscordWebhook(url)
        webhook.send_to_discord(use_embed=True)
    
    print(f"✅ An {len(webhooks)} Webhooks gesendet!\n")


def beispiel_6_bedingtes_senden():
    """Beispiel 6: Nur senden wenn bestimmte Bedingungen erfüllt sind"""
    print("📤 Beispiel 6: Bedingtes Senden")
    
    webhook_url = os.getenv('DISCORD_WEBHOOK_URL')
    if not webhook_url:
        print("❌ DISCORD_WEBHOOK_URL nicht gesetzt!")
        return
    
    webhook = ProximaDiscordWebhook(webhook_url)
    data = webhook.get_proxima_data()
    
    if not data:
        print("❌ Keine Daten verfügbar!")
        return
    
    # Nur senden wenn es Planeten gibt und es Woche 10 oder höher ist
    if data['total_planets'] > 0 and data['latest_week'] >= 10:
        print(f"✓ Bedingungen erfüllt (Woche {data['latest_week']}, {data['total_planets']} Planeten)")
        webhook.send_to_discord(use_embed=True)
        print("✅ Gesendet!")
    else:
        print(f"⏭️  Bedingungen nicht erfüllt - Woche {data['latest_week']}, {data['total_planets']} Planeten")
        print("   (Benötigt: Woche >= 10 und Planeten > 0)")
    
    print()


def main():
    """Hauptmenü"""
    print("=" * 60)
    print("🌌 ProximaDB Discord Webhook - Beispiele")
    print("=" * 60)
    print()
    
    # Prüfe ob Webhook URL gesetzt ist
    if not os.getenv('DISCORD_WEBHOOK_URL'):
        print("⚠️  WICHTIG: Setzen Sie zuerst die DISCORD_WEBHOOK_URL:")
        print()
        print("  export DISCORD_WEBHOOK_URL='https://discord.com/api/webhooks/...'")
        print()
        print("Oder führen Sie aus:")
        print("  DISCORD_WEBHOOK_URL='...' python example_webhook_usage.py")
        print()
        return
    
    # Menü
    beispiele = [
        ("Einfache Embed-Nachricht", beispiel_1_einfach),
        ("Text-Tabelle", beispiel_2_text_tabelle),
        ("JSON-Datei Export", beispiel_3_datei_export),
        ("Custom Embed", beispiel_4_custom_embed),
        ("Mehrere Webhooks", beispiel_5_mehrere_webhooks),
        ("Bedingtes Senden", beispiel_6_bedingtes_senden),
    ]
    
    print("Verfügbare Beispiele:\n")
    for i, (name, _) in enumerate(beispiele, 1):
        print(f"  {i}. {name}")
    print(f"  0. Alle ausführen")
    print()
    
    try:
        wahl = input("Wählen Sie ein Beispiel (0-6): ").strip()
        
        if wahl == "0":
            for name, func in beispiele:
                print(f"\n{'='*60}")
                func()
        elif wahl.isdigit() and 1 <= int(wahl) <= len(beispiele):
            beispiele[int(wahl)-1][1]()
        else:
            print("❌ Ungültige Eingabe!")
    
    except KeyboardInterrupt:
        print("\n\n👋 Abgebrochen!")
    except Exception as e:
        print(f"\n❌ Fehler: {e}")
    
    print("\n" + "="*60)
    print("Fertig! 🎉")
    print("="*60)


if __name__ == "__main__":
    main()
