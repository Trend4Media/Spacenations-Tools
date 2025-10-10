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
        planets = data['planets'][:25]
        
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
    
    def create_minimal_list(self, data: Dict) -> str:
        """Erstellt eine minimalistische Liste: Name : Punkte : Koordinaten"""
        planets = data['planets'][:30]
        
        message = f"""📊 **ProximaDB** | {data['total_planets']} Planeten | Woche {data['latest_week']}

```
Name                : Punkte   : Koordinaten
--------------------:---------:-------------"""
        
        for planet in planets:
            name, coordinates, score, delete_on, week_number = planet
            message += f"\n{name[:20]:<20}: {score:8,} : {coordinates}"
        
        message += f"\n```\n⏰ {data['last_update']}"
        
        return message
    
    def create_website_style_table(self, data: Dict) -> str:
        """Erstellt eine Website-ähnliche Tabelle für Discord"""
        planets = data['planets'][:15]  # Reduziert auf Top 15 wegen Discord Limit
        
        # Header im Website-Stil
        message = f"""🌌 **ProximaDB - Spacenations Tools**
📊 **{data['total_planets']} Planeten** | 📅 **Woche {data['latest_week']}**

```
┌────┬──────────────────┬──────────────┬─────────┬────────────────────┬──────┐
│ #  │ Name             │ Koordinaten  │ Punkte  │ Zerstörung         │ Wo.  │
├────┼──────────────────┼──────────────┼─────────┼────────────────────┼──────┤"""
        
        for i, planet in enumerate(planets, 1):
            name, coordinates, score, delete_on, week_number = planet
            formatted_date = self.format_delete_date(delete_on)
            
            # Emoji für Top 3
            rank = "🥇" if i == 1 else "🥈" if i == 2 else "🥉" if i == 3 else f"{i:2}"
            
            message += f"\n│ {rank:<2} │ {name[:16]:<16} │ {coordinates:<12} │ {score:7,} │ {formatted_date:<18} │ W{week_number:<3} │"
        
        message += f"""\n└────┴──────────────────┴──────────────┴─────────┴────────────────────┴──────┘
```
⏰ Letzte Aktualisierung: {data['last_update']}"""
        
        return message
    
    def create_excel_file(self, filename: str = None) -> str:
        """Erstellt eine Excel-Datei mit den Proxima-Daten"""
        try:
            import pandas as pd
            from datetime import datetime
            
            if filename is None:
                timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
                filename = f'proxima_data_{timestamp}.xlsx'
            
            data = self.get_proxima_data()
            if not data:
                return None
            
            # Konvertiere Daten für DataFrame
            planets_list = []
            for planet in data['planets']:
                name, coordinates, score, delete_on, week_number = planet
                planets_list.append({
                    'Name': name,
                    'Punkte': score,
                    'Koordinaten': coordinates,
                    'Zerstörung': self.format_delete_date(delete_on),
                    'Woche': week_number
                })
            
            df = pd.DataFrame(planets_list)
            
            # Excel mit Formatierung erstellen
            with pd.ExcelWriter(filename, engine='openpyxl') as writer:
                df.to_excel(writer, sheet_name='ProximaDB', index=False)
                
                # Formatierung
                worksheet = writer.sheets['ProximaDB']
                
                # Spaltenbreiten anpassen
                worksheet.column_dimensions['A'].width = 25  # Name
                worksheet.column_dimensions['B'].width = 12  # Punkte
                worksheet.column_dimensions['C'].width = 15  # Koordinaten
                worksheet.column_dimensions['D'].width = 20  # Zerstörung
                worksheet.column_dimensions['E'].width = 10  # Woche
                
                # Header formatieren
                from openpyxl.styles import Font, PatternFill, Alignment
                header_fill = PatternFill(start_color='00FF88', end_color='00FF88', fill_type='solid')
                header_font = Font(bold=True, color='000000')
                
                for cell in worksheet[1]:
                    cell.fill = header_fill
                    cell.font = header_font
                    cell.alignment = Alignment(horizontal='center')
            
            logging.info(f"✅ Excel-Datei erstellt: {filename}")
            return filename
            
        except ImportError:
            logging.error("❌ pandas oder openpyxl nicht installiert! Installieren Sie: pip install pandas openpyxl")
            return None
        except Exception as e:
            logging.error(f"❌ Fehler beim Erstellen der Excel-Datei: {e}")
            return None
    
    def send_excel_to_discord(self) -> bool:
        """Erstellt und sendet Excel-Datei an Discord"""
        try:
            filename = self.create_excel_file()
            if not filename:
                return False
            
            data = self.get_proxima_data()
            
            # Sende als Datei
            with open(filename, 'rb') as f:
                response = requests.post(
                    self.webhook_url,
                    data={
                        "content": f"📊 **ProximaDB Excel-Export**\n\n• {data['total_planets']} Planeten\n• Woche {data['latest_week']}\n• Sortiert nach Punkten (höchste zuerst)"
                    },
                    files={'file': (filename, f, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')}
                )
            
            # Lösche temporäre Datei
            import os
            os.remove(filename)
            
            if response.status_code == 204 or response.status_code == 200:
                logging.info(f"✅ Excel-Datei erfolgreich gesendet und gelöscht!")
                return True
            else:
                logging.error(f"❌ Fehler beim Senden: {response.status_code}")
                return False
                
        except Exception as e:
            logging.error(f"❌ Fehler beim Excel-Versand: {e}")
            return False
    
    def send_to_discord(self, use_embed: bool = True, table_style: str = 'website') -> bool:
        """
        Sendet die Proxima-Daten an Discord
        
        Args:
            use_embed: True für formatierte Embeds, False für Tabellen-Nachricht
            table_style: 'simple', 'website' oder 'compact' - nur relevant wenn use_embed=False
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
                if table_style == 'website':
                    message = self.create_website_style_table(data)
                elif table_style == 'minimal':
                    message = self.create_minimal_list(data)
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
    
    def send_multi_table(self, planets_per_page: int = 15) -> bool:
        """Sendet die Daten als mehrere Tabellen-Nachrichten (alle Planeten)"""
        try:
            data = self.get_proxima_data()
            if not data:
                return False
            
            all_planets = data['planets']
            total_pages = (len(all_planets) + planets_per_page - 1) // planets_per_page
            
            for page in range(total_pages):
                start_idx = page * planets_per_page
                end_idx = min(start_idx + planets_per_page, len(all_planets))
                page_planets = all_planets[start_idx:end_idx]
                
                # Header für erste Seite, kompakter für weitere
                if page == 0:
                    message = f"""🌌 **ProximaDB - Spacenations Tools**
📊 **{data['total_planets']} Planeten** | 📅 **Woche {data['latest_week']}** | 📄 Seite 1/{total_pages}

```
┌────┬──────────────────┬──────────────┬─────────┬────────────────────┬──────┐
│ #  │ Name             │ Koordinaten  │ Punkte  │ Zerstörung         │ Wo.  │
├────┼──────────────────┼──────────────┼─────────┼────────────────────┼──────┤"""
                else:
                    message = f"""📄 **Seite {page+1}/{total_pages}**

```
┌────┬──────────────────┬──────────────┬─────────┬────────────────────┬──────┐"""
                
                for i, planet in enumerate(page_planets, start_idx + 1):
                    name, coordinates, score, delete_on, week_number = planet
                    formatted_date = self.format_delete_date(delete_on)
                    rank = "🥇" if i == 1 else "🥈" if i == 2 else "🥉" if i == 3 else f"{i:2}"
                    message += f"\n│ {rank:<2} │ {name[:16]:<16} │ {coordinates:<12} │ {score:7,} │ {formatted_date:<18} │ W{week_number:<3} │"
                
                message += "\n└────┴──────────────────┴──────────────┴─────────┴────────────────────┴──────┘\n```"
                
                if page == total_pages - 1:
                    message += f"\n⏰ Letzte Aktualisierung: {data['last_update']}"
                
                # Sende Nachricht
                payload = {"username": "ProximaDB Bot", "content": message}
                response = requests.post(
                    self.webhook_url,
                    json=payload,
                    headers={'Content-Type': 'application/json'}
                )
                
                if response.status_code != 204:
                    logging.error(f"❌ Fehler bei Seite {page+1}: {response.status_code}")
                    return False
                
                # Kurze Pause zwischen Nachrichten
                if page < total_pages - 1:
                    import time
                    time.sleep(0.5)
            
            logging.info(f"✅ {total_pages} Seiten erfolgreich gesendet!")
            return True
            
        except Exception as e:
            logging.error(f"❌ Fehler beim Multi-Tabellen-Versand: {e}")
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
    
    # Sende Website-Style Tabelle (Standard)
    print("📤 Sende ProximaDB-Daten als Tabelle an Discord...")
    success = webhook.send_to_discord(use_embed=False, table_style='website')
    
    if success:
        print("✅ Erfolgreich gesendet!")
    else:
        print("❌ Fehler beim Senden!")


if __name__ == "__main__":
    main()
