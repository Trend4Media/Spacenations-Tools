# Firebase Setup Instructions

## 1. Firebase Console Konfiguration

### Authentication aktivieren:
1. Gehen Sie zu: https://console.firebase.google.com
2. Wählen Sie Projekt: spacenations-tools
3. Authentication → Sign-in method → Email/Password aktivieren
4. Settings → Authentication → Authorized domains hinzufügen:
   - spacenations-tools-production.up.railway.app
   - localhost

### Firestore Database erstellen:
1. Firestore Database → Create database
2. Start in test mode
3. Location: europe-west3

### Security Rules setzen:
Kopieren Sie den Inhalt von firestore-security-rules.txt in Firebase Console → Firestore → Rules

## 2. Railway Umgebungsvariablen

Kopieren Sie alle Variablen aus railway-env-vars.txt in Railway → Variables

## 3. Testing

Öffnen Sie: https://spacenations-tools-production.up.railway.app/test-firebase.html

## 4. Registrierung testen

Öffnen Sie: https://spacenations-tools-production.up.railway.app/register.html
