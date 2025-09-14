# Automatisiertes Setup - Spacenations Tools

## 🚀 SCHNELLSETUP (5 Minuten)

### 1. Firebase Console (2 Minuten)
1. Gehen Sie zu: https://console.firebase.google.com
2. Wählen Sie Projekt: spacenations-tools
3. Authentication → Sign-in method → Email/Password aktivieren
4. Settings → Authentication → Authorized domains:
   - spacenations-tools-production.up.railway.app
   - localhost
5. Firestore Database → Create database → Start in test mode
6. Firestore Database → Rules → Kopieren Sie Inhalt aus firestore-security-rules.txt

### 2. Railway (2 Minuten)
1. Gehen Sie zu: https://railway.app
2. Wählen Sie Projekt: spacenations-tools
3. Variables → Kopieren Sie alle Variablen aus railway-env-vars.txt

### 3. Testen (1 Minute)
1. Öffnen Sie: https://spacenations-tools-production.up.railway.app/test-firebase.html
2. Alle Tests sollten grün sein ✅

## 🎉 FERTIG!
Das System ist jetzt vollständig konfiguriert und funktionsfähig.
