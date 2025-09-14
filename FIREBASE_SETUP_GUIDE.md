# 🔥 Firebase Setup Guide - Schritt für Schritt

## 🚨 **KRITISCHE SCHRITTE - FÜHREN SIE DIESE IN REIHENFOLGE AUS**

### **SCHRITT 1: Firebase Console öffnen** (2 Minuten)

1. **Gehen Sie zu:** [console.firebase.google.com](https://console.firebase.google.com)
2. **Melden Sie sich an** mit Ihrem Google-Account
3. **Wählen Sie das Projekt:** `spacenations-tools`
   - Falls das Projekt nicht existiert, erstellen Sie es mit der ID: `spacenations-tools`

### **SCHRITT 2: Authentication aktivieren** (3 Minuten)

1. **Klicken Sie auf:** `Authentication` (im linken Menü)
2. **Klicken Sie auf:** `Get started`
3. **Gehen Sie zu:** `Sign-in method` Tab
4. **Klicken Sie auf:** `Email/Password`
5. **Aktivieren Sie:** `Email/Password` (erster Schalter)
6. **Klicken Sie auf:** `Save`

#### **Authorized Domains hinzufügen:**
1. **Gehen Sie zu:** `Settings` (Zahnrad-Symbol oben rechts)
2. **Klicken Sie auf:** `Authentication` Tab
3. **Scrollen Sie zu:** `Authorized domains`
4. **Klicken Sie auf:** `Add domain`
5. **Fügen Sie hinzu:** `spacenations-tools-production.up.railway.app`
6. **Fügen Sie hinzu:** `localhost` (für Entwicklung)
7. **Klicken Sie auf:** `Done`

### **SCHRITT 3: Firestore Database erstellen** (2 Minuten)

1. **Klicken Sie auf:** `Firestore Database` (im linken Menü)
2. **Klicken Sie auf:** `Create database`
3. **Wählen Sie:** `Start in test mode` (zunächst)
4. **Klicken Sie auf:** `Next`
5. **Wählen Sie:** `europe-west3` (oder eine andere europäische Region)
6. **Klicken Sie auf:** `Done`

### **SCHRITT 4: Security Rules setzen** (5 Minuten)

1. **Gehen Sie zu:** `Firestore Database` → `Rules` Tab
2. **Ersetzen Sie den gesamten Inhalt** mit folgendem Code:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users Collection
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null; // Für Allianz-Mitglieder
    }
    
    // Alliances Collection
    match /alliances/{allianceId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (resource.data.admin == request.auth.uid || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.systemRole == 'superadmin');
    }
    
    // Alliance Permissions
    match /alliancePermissions/{allianceId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (get(/databases/$(database)/documents/alliances/$(allianceId)).data.admin == request.auth.uid ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.systemRole == 'superadmin');
    }
    
    // Alliance Chat
    match /allianceChat/{allianceId} {
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/alliances/$(allianceId)).data.members[request.auth.uid] != null;
    }
    
    // Test Collection (für Testing)
    match /test/{document} {
      allow read, write: if request.auth != null;
    }
  }
}
```

3. **Klicken Sie auf:** `Publish`

### **SCHRITT 5: Projekt-Konfiguration überprüfen** (2 Minuten)

1. **Gehen Sie zu:** `Project Settings` (Zahnrad-Symbol)
2. **Scrollen Sie zu:** `Your apps` Sektion
3. **Stellen Sie sicher, dass eine Web-App existiert** mit:
   - **App nickname:** `spacenations-tools-web`
   - **App ID:** `1:651338201276:web:89e7d9c19dbd2611d3f8b9`

4. **Falls keine Web-App existiert:**
   - **Klicken Sie auf:** `Add app` → `Web` (</> Symbol)
   - **App nickname:** `spacenations-tools-web`
   - **Klicken Sie auf:** `Register app`
   - **Kopieren Sie die Konfiguration** (wird später benötigt)

### **SCHRITT 6: Railway Umgebungsvariablen setzen** (3 Minuten)

1. **Gehen Sie zu:** [railway.app](https://railway.app)
2. **Wählen Sie Ihr Projekt:** `spacenations-tools`
3. **Klicken Sie auf:** `Variables` Tab
4. **Fügen Sie folgende Variablen hinzu:**

```env
FIREBASE_API_KEY=AIzaSyDr4-ap_EubUn0UdP7hkEpS2jkzLIVgvyc
FIREBASE_AUTH_DOMAIN=spacenations-tools.firebaseapp.com
FIREBASE_PROJECT_ID=spacenations-tools
FIREBASE_STORAGE_BUCKET=spacenations-tools.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=651338201276
FIREBASE_APP_ID=1:651338201276:web:89e7d9c19dbd2611d3f8b9
```

5. **Klicken Sie auf:** `Add` für jede Variable
6. **Warten Sie auf:** Neues Deployment (automatisch)

### **SCHRITT 7: Testing durchführen** (5 Minuten)

1. **Öffnen Sie:** `https://spacenations-tools-production.up.railway.app/test-firebase.html`
2. **Führen Sie alle Tests durch:**
   - Firebase SDK Test
   - Firebase Config Test
   - Authentication Test
   - Firestore Test
   - API Endpoint Test

3. **Alle Tests sollten grün sein** ✅

### **SCHRITT 8: Registrierung testen** (3 Minuten)

1. **Öffnen Sie:** `https://spacenations-tools-production.up.railway.app/register.html`
2. **Erstellen Sie einen Test-Account:**
   - Email: `test@example.com`
   - Password: `test123456`
   - Username: `testuser`
3. **Überprüfen Sie:** Erfolgreiche Registrierung
4. **Überprüfen Sie in Firebase Console:** User wurde in Firestore erstellt

### **SCHRITT 9: Login testen** (2 Minuten)

1. **Öffnen Sie:** `https://spacenations-tools-production.up.railway.app/index.html`
2. **Loggen Sie sich ein** mit dem Test-Account
3. **Überprüfen Sie:** Erfolgreicher Login und Weiterleitung

## 🎯 **ERFOLGSKRITERIEN**

Nach Abschluss aller Schritte sollten Sie haben:

- ✅ **Firebase Authentication** aktiviert
- ✅ **Firestore Database** erstellt
- ✅ **Security Rules** konfiguriert
- ✅ **Domain autorisiert** für Railway
- ✅ **Umgebungsvariablen** in Railway gesetzt
- ✅ **Alle Tests** erfolgreich
- ✅ **Registrierung** funktioniert
- ✅ **Login** funktioniert

## 🚨 **BEI PROBLEMEN**

### **Problem: "Permission denied"**
- **Lösung:** Security Rules überprüfen und neu publizieren

### **Problem: "Domain not authorized"**
- **Lösung:** Domain in Firebase Console hinzufügen

### **Problem: "Firebase App not initialized"**
- **Lösung:** API-Endpunkt testen: `/api/firebase-config`

### **Problem: "User not found"**
- **Lösung:** Firestore Database überprüfen

## 📞 **SUPPORT**

Falls Sie Probleme haben:
1. Überprüfen Sie die Browser-Konsole auf Fehler
2. Testen Sie mit `test-firebase.html`
3. Überprüfen Sie die Firebase Console Logs
4. Kontaktieren Sie mich mit den Fehlermeldungen

---

**Geschätzte Gesamtzeit:** 25 Minuten
**Schwierigkeit:** Einfach bis Mittel
**Erfolgswahrscheinlichkeit:** 95% (wenn alle Schritte befolgt werden)