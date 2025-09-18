#!/usr/bin/env python3
"""
Test-Skript um die aktuelle Firebase-Verbindung zu überprüfen
"""

import json
import os
import sys

def test_api_config():
    """Teste die API-Konfiguration"""
    print("🔍 Firebase-Konfiguration Test")
    print("=" * 50)
    
    # Simuliere die API-Konfiguration aus app.py
    firebase_config = {
        "apiKey": os.getenv('FIREBASE_API_KEY', 'AIzaSyDr4-ap_EubUn0UdP7hkEpS2jkzLIVgvyc'),
        "authDomain": os.getenv('FIREBASE_AUTH_DOMAIN', 'spacenations-tools.firebaseapp.com'),
        "projectId": os.getenv('FIREBASE_PROJECT_ID', 'spacenations-tools'),
        "storageBucket": os.getenv('FIREBASE_STORAGE_BUCKET', 'spacenations-tools.firebasestorage.app'),
        "messagingSenderId": os.getenv('FIREBASE_MESSAGING_SENDER_ID', '651338201276'),
        "appId": os.getenv('FIREBASE_APP_ID', '1:651338201276:web:89e7d9c19dbd2611d3f8b9'),
        "measurementId": "G-SKWJWH2ERX"
    }
    
    print("📋 Aktuelle API-Konfiguration:")
    for key, value in firebase_config.items():
        if key == 'apiKey':
            print(f"  {key}: {value[:20]}...")
        else:
            print(f"  {key}: {value}")
    
    print("\n🔍 Umgebungsvariablen-Status:")
    env_vars = [
        'FIREBASE_API_KEY',
        'FIREBASE_AUTH_DOMAIN', 
        'FIREBASE_PROJECT_ID',
        'FIREBASE_STORAGE_BUCKET',
        'FIREBASE_MESSAGING_SENDER_ID',
        'FIREBASE_APP_ID'
    ]
    
    for var in env_vars:
        value = os.getenv(var)
        status = "✅ Gesetzt" if value else "❌ Nicht gesetzt (Fallback)"
        print(f"  {var}: {status}")
    
    print("\n🎯 Erwartete Werte:")
    expected = {
        "projectId": "spacenations-tools",
        "authDomain": "spacenations-tools.firebaseapp.com"
    }
    
    for key, expected_value in expected.items():
        current_value = firebase_config[key]
        status = "✅" if current_value == expected_value else "❌"
        print(f"  {key}: {status} {current_value} (erwartet: {expected_value})")
    
    print("\n🌐 Firebase Console URLs:")
    project_id = firebase_config['projectId']
    print(f"  Firestore: https://console.firebase.google.com/u/0/project/{project_id}/firestore/databases/-default-/data")
    print(f"  Auth: https://console.firebase.google.com/u/0/project/{project_id}/authentication/users")
    print(f"  Settings: https://console.firebase.google.com/u/0/project/{project_id}/settings/general")
    
    # Überprüfung
    if firebase_config['projectId'] == 'spacenations-tools':
        print("\n✅ DIAGNOSE: Konfiguration zeigt auf die richtige Projekt-ID")
        print("   Das Problem liegt wahrscheinlich woanders:")
        print("   • Firestore-Sicherheitsregeln")
        print("   • Netzwerkverbindung")
        print("   • Browser-Cache")
        print("   • Service Worker")
    else:
        print(f"\n❌ PROBLEM ERKANNT: Falsche Projekt-ID!")
        print(f"   Aktuell: {firebase_config['projectId']}")
        print(f"   Erwartet: spacenations-tools")
    
    return firebase_config

def test_local_config():
    """Teste die lokale Konfigurationsdatei"""
    print("\n📁 Lokale Konfigurationsdatei Test")
    print("=" * 50)
    
    config_file = 'firebase-config.json'
    
    if os.path.exists(config_file):
        try:
            with open(config_file, 'r') as f:
                local_config = json.load(f)
            
            print("✅ Lokale Konfigurationsdatei gefunden:")
            for key, value in local_config.items():
                if key == 'apiKey':
                    print(f"  {key}: {value[:20]}...")
                else:
                    print(f"  {key}: {value}")
            
            # Vergleich mit erwarteten Werten
            if local_config.get('projectId') == 'spacenations-tools':
                print("\n✅ Lokale Konfiguration ist korrekt")
            else:
                print(f"\n❌ Lokale Konfiguration hat falsche Projekt-ID: {local_config.get('projectId')}")
                
            return local_config
            
        except Exception as e:
            print(f"❌ Fehler beim Lesen der lokalen Konfiguration: {e}")
    else:
        print("⚠️ Lokale Konfigurationsdatei nicht gefunden")
    
    return None

def check_js_config():
    """Überprüfe die JavaScript-Konfiguration"""
    print("\n🔧 JavaScript-Konfiguration Test")
    print("=" * 50)
    
    js_config_file = 'js/firebase-config.js'
    
    if os.path.exists(js_config_file):
        try:
            with open(js_config_file, 'r') as f:
                content = f.read()
            
            # Suche nach der Fallback-Konfiguration
            if 'spacenations-tools' in content:
                print("✅ JavaScript-Konfiguration enthält 'spacenations-tools'")
            else:
                print("❌ JavaScript-Konfiguration enthält nicht 'spacenations-tools'")
            
            # Suche nach projectId
            import re
            project_id_match = re.search(r"projectId:\s*['\"]([^'\"]+)['\"]", content)
            if project_id_match:
                project_id = project_id_match.group(1)
                print(f"📋 Gefundene Projekt-ID in JS: {project_id}")
                
                if project_id == 'spacenations-tools':
                    print("✅ JavaScript-Konfiguration ist korrekt")
                else:
                    print(f"❌ JavaScript-Konfiguration hat falsche Projekt-ID: {project_id}")
            else:
                print("⚠️ Keine Projekt-ID in JavaScript-Konfiguration gefunden")
                
        except Exception as e:
            print(f"❌ Fehler beim Lesen der JavaScript-Konfiguration: {e}")
    else:
        print("❌ JavaScript-Konfigurationsdatei nicht gefunden")

def main():
    print("🔍 Firebase-Datenbank Diagnose")
    print("=" * 60)
    print("Dieses Skript überprüft, ob das System auf die richtige")
    print("Firebase-Datenbank zugreift.\n")
    
    # Tests durchführen
    api_config = test_api_config()
    local_config = test_local_config()
    check_js_config()
    
    print("\n" + "=" * 60)
    print("📊 ZUSAMMENFASSUNG")
    print("=" * 60)
    
    # Finale Diagnose
    api_project_id = api_config.get('projectId') if api_config else None
    local_project_id = local_config.get('projectId') if local_config else None
    
    if api_project_id == 'spacenations-tools':
        print("✅ API-Konfiguration: Korrekte Projekt-ID")
    else:
        print(f"❌ API-Konfiguration: Falsche Projekt-ID ({api_project_id})")
    
    if local_project_id == 'spacenations-tools':
        print("✅ Lokale Konfiguration: Korrekte Projekt-ID")
    elif local_project_id is None:
        print("⚠️ Lokale Konfiguration: Nicht gefunden")
    else:
        print(f"❌ Lokale Konfiguration: Falsche Projekt-ID ({local_project_id})")
    
    print(f"\n🌐 Erwartete Firebase Console:")
    print(f"https://console.firebase.google.com/u/0/project/spacenations-tools/firestore/databases/-default-/data")
    
    print(f"\n🌐 Tatsächliche Firebase Console (basierend auf API):")
    if api_project_id:
        print(f"https://console.firebase.google.com/u/0/project/{api_project_id}/firestore/databases/-default-/data")
    
    # Empfehlungen
    print(f"\n💡 EMPFEHLUNGEN:")
    if api_project_id == 'spacenations-tools':
        print("• Die Firebase-Konfiguration scheint korrekt zu sein")
        print("• Das Problem könnte an folgenden Stellen liegen:")
        print("  - Firestore-Sicherheitsregeln")
        print("  - Browser-Cache (versuchen Sie einen Hard-Refresh)")
        print("  - Service Worker (deaktivieren Sie ihn temporär)")
        print("  - Netzwerkverbindung zur Firebase-API")
        print("• Verwenden Sie das Firebase-Diagnose-Tool: firebase-database-check.html")
    else:
        print("• Die Firebase-Konfiguration ist FALSCH!")
        print("• Korrigieren Sie die Umgebungsvariablen oder die Fallback-Werte")
        print("• Stellen Sie sicher, dass alle Konfigurationsdateien konsistent sind")

if __name__ == "__main__":
    main()