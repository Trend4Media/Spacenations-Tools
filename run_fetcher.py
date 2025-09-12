#!/usr/bin/env python3
"""
Einfaches Skript zum Ausführen des Proxima Fetchers
Kann als Cron-Job oder manuell ausgeführt werden
"""

import sys
import os
from proxima_fetcher import ProximaFetcher

def main():
    """Führt eine einmalige Aktualisierung der Proxima-Daten durch"""
    print("🌌 Proxima Fetcher - Einmalige Aktualisierung")
    print("=" * 50)
    
    fetcher = ProximaFetcher()
    
    # Daten aktualisieren
    print("Lade aktuelle Daten von der API...")
    fetcher.update_planets()
    
    # HTML-Report generieren
    print("Generiere HTML-Report...")
    html_report = fetcher.generate_html_report()
    if html_report:
        with open('proxima_report.html', 'w', encoding='utf-8') as f:
            f.write(html_report)
        print("✅ HTML-Report erstellt: proxima_report.html")
    
    # JSON-Daten für Web-Interface
    print("Generiere JSON-Daten...")
    summary = fetcher.get_planets_summary()
    if summary:
        import json
        with open('proxima_data.json', 'w', encoding='utf-8') as f:
            json.dump(summary['planets'], f, ensure_ascii=False, indent=2)
        print("✅ JSON-Daten erstellt: proxima_data.json")
    
    print("\n🎉 Aktualisierung abgeschlossen!")
    print(f"📊 {summary['total_planets']} Planeten aus Woche {summary['latest_week']} geladen")

if __name__ == "__main__":
    main()