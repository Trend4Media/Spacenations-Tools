#!/usr/bin/env python3
"""
Discord Webhook Integration für ProximaDB
Sendet ProximaDB-Daten formatiert an einen Discord-Kanal
"""

import json
import requests
import sqlite3
from datetime import datetime
import logging
import os
from typing import List, Dict, Optional

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

class ProximaDiscordWebhook:
    def __init__(self, webhook_url: str, db_path: str = 'proxima.db'):
        """
        Initialisiert den Discord Webhook Sender
        
        Args:
            webhook_url: Discord Webhook URL
            db_path: Pfad zur ProximaDB SQLite Datenbank
        """
        self.webhook_url = webhook_url
        self.db_path = db_path
    
    def get_proxima_data(self) -> Optional[Dict]:
        """Lädt die aktuellen Proxima-Daten aus der Datenbank"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Hole die neuesten Planeten
            cursor.execute('''
                SELECT name, coordinates, score, delete_on, week_number
                FROM planets p1
                WHERE created_at = (
                    SELECT MAX(created_at) 
                    FROM planets p2 
                    WHERE p2.name = p1.name
                )
                ORDER BY score DESC
                LIMIT 25
            ''')
            
            planets = cursor.fetchall()
            
            # Statistiken
            cursor.execute('SELECT COUNT(DISTINCT name) FROM planets')
            total_planets = cursor.fetchone()[0]
            
            cursor.execute('SELECT MAX(week_number) FROM planets')
            latest_week = cursor.fetchone()[0]
            
            cursor.execute('SELECT MAX(created_at) FROM planets')
            last_update = cursor.fetchone()[0]
            
            conn.close()
            
            return {
                'planets': planets,
                'total_planets': total_planets,
                'latest_week': latest_week,
                'last_update': last_update
            }
            
        except Exception as e:
            logging.error(f"Fehler beim Laden der Daten: {e}")
            return None
    
    def format_delete_date(self, delete_on_str: str) -> str:
        """Formatiert das Löschdatum für Discord"""
        try:
            dt = datetime.fromisoformat(delete_on_str.replace('Z', '+00:00'))
            return dt.strftime("%d.%m.%Y %H:%M")
        except:
            return delete_on_str
    
    def create_discord_embed(self, data: Dict) -> Dict:
        """Erstellt ein Discord Embed mit den Proxima-Daten"""
        
        # Top 10 Planeten für das Embed
        top_planets = data['planets'][:10]
        
        # Erstelle Felder für die Top-Planeten
        fields = []
        
        for i, planet in enumerate(top_planets, 1):
            name, coordinates, score, delete_on, week_number = planet
            formatted_date = self.format_delete_date(delete_on)
            
            # Emoji basierend auf Ranking
            emoji = "🥇" if i == 1 else "🥈" if i == 2 else "🥉" if i == 3 else f"{i}."
            
            fields.append({
                "name": f"{emoji} {name}",
                "value": f"📍 `{coordinates}`\n💎 **{score:,}** Punkte\n⏰ {formatted_date}\n📅 Woche {week_number}",
                "inline": True
            })
        
        # Erstelle das Embed
        embed = {
            "title": "🌌 ProximaDB - Planetenübersicht",
            "description": f"**Aktuelle Proxima-Daten von Spacenations**\n\n📊 **Statistiken:**\n• Planeten gesamt: **{data['total_planets']}**\n• Aktuelle Woche: **{data['latest_week']}**\n• Letzte Aktualisierung: {data['last_update']}",
            "color": 65480,  # Razer Grün (#00FF88)
            "fields": fields,
            "footer": {
                "text": "Spacenations Tools • ProximaDB"
            },
            "timestamp": datetime.now(datetime.now().astimezone().tzinfo).isoformat()
        }
        
        return embed
    
    def create_simple_table_message(self, data: Dict) -> str:
        """Erstellt eine einfache Tabellen-Nachricht als Alternative"""
        planets = data['planets'][:15]
        
        message = f"""🌌 **ProximaDB - Planetenübersicht**

📊 **Statistiken:**
• Planeten gesamt: **{data['total_planets']}**
• Aktuelle Woche: **{data['latest_week']}**

**Top Planeten:**
```
Rang | Name                | Koordinaten    | Punkte  | Woche
-----|---------------------|----------------|---------|------"""
        
        for i, planet in enumerate(planets, 1):
            name, coordinates, score, delete_on, week_number = planet
            message += f"\n{i:2}   | {name[:18]:<18} | {coordinates:<14} | {score:7,} | W{week_number}"
        
        message += "\n```\n\n⏰ Letzte Aktualisierung: " + data['last_update']
        
        return message
    
    def send_to_discord(self, use_embed: bool = True) -> bool:
        """
        Sendet die Proxima-Daten an Discord
        
        Args:
            use_embed: True für formatierte Embeds, False für einfache Nachricht
        """
        try:
            data = self.get_proxima_data()
            if not data:
                logging.error("Keine Daten verfügbar")
                return False
            
            if use_embed:
                embed = self.create_discord_embed(data)
                payload = {
                    "username": "ProximaDB Bot",
                    "avatar_url": "https://cdn.discordapp.com/attachments/1234567890/planet.png",
                    "embeds": [embed]
                }
            else:
                message = self.create_simple_table_message(data)
                payload = {
                    "username": "ProximaDB Bot",
                    "content": message
                }
            
            response = requests.post(
                self.webhook_url,
                json=payload,
                headers={'Content-Type': 'application/json'}
            )
            
            if response.status_code == 204:
                logging.info("✅ Erfolgreich an Discord gesendet!")
                return True
            else:
                logging.error(f"❌ Discord Webhook Fehler: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            logging.error(f"❌ Fehler beim Senden an Discord: {e}")
            return False
    
    def send_full_data_as_file(self) -> bool:
        """Sendet die kompletten Daten als JSON-Datei an Discord"""
        try:
            data = self.get_proxima_data()
            if not data:
                return False
            
            # Konvertiere Daten für JSON
            planets_list = []
            for planet in data['planets']:
                name, coordinates, score, delete_on, week_number = planet
                planets_list.append({
                    "name": name,
                    "coordinates": coordinates,
                    "score": score,
                    "deleteOn": delete_on,
                    "weekNumber": week_number
                })
            
            json_data = {
                "totalPlanets": data['total_planets'],
                "latestWeek": data['latest_week'],
                "lastUpdate": data['last_update'],
                "planets": planets_list
            }
            
            # Speichere temporär als Datei
            filename = f"proxima_data_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(json_data, f, ensure_ascii=False, indent=2)
            
            # Sende als Datei
            with open(filename, 'rb') as f:
                response = requests.post(
                    self.webhook_url,
                    data={
                        "content": f"📁 **Komplette ProximaDB Export**\n📊 {data['total_planets']} Planeten • Woche {data['latest_week']}"
                    },
                    files={'file': (filename, f, 'application/json')}
                )
            
            # Lösche temporäre Datei
            os.remove(filename)
            
            if response.status_code == 204:
                logging.info(f"✅ Datei {filename} erfolgreich gesendet!")
                return True
            else:
                logging.error(f"❌ Fehler beim Senden der Datei: {response.status_code}")
                return False
                
        except Exception as e:
            logging.error(f"❌ Fehler beim Datei-Versand: {e}")
            return False


def main():
    """Beispiel-Verwendung"""
    
    # WICHTIG: Ersetzen Sie dies mit Ihrer echten Discord Webhook URL!
    # Webhook URL erstellen: Discord > Server Einstellungen > Integrationen > Webhooks > Neuer Webhook
    WEBHOOK_URL = os.getenv('DISCORD_WEBHOOK_URL', 'YOUR_WEBHOOK_URL_HERE')
    
    if WEBHOOK_URL == 'YOUR_WEBHOOK_URL_HERE':
        print("❌ Bitte setzen Sie die DISCORD_WEBHOOK_URL Umgebungsvariable!")
        print("   export DISCORD_WEBHOOK_URL='https://discord.com/api/webhooks/...'")
        return
    
    webhook = ProximaDiscordWebhook(WEBHOOK_URL)
    
    # Sende Embed-Nachricht
    print("📤 Sende ProximaDB-Daten an Discord...")
    success = webhook.send_to_discord(use_embed=True)
    
    if success:
        print("✅ Erfolgreich gesendet!")
    else:
        print("❌ Fehler beim Senden!")


if __name__ == "__main__":
    main()
