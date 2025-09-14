# 🔥 Firebase-Konfigurationsprüfung - Spacenations Tools

## 📋 Aktuelle Firebase-Konfiguration

### Projekt-Details
- **Projekt-ID:** `spacenations-tools`
- **Auth Domain:** `spacenations-tools.firebaseapp.com`
- **Storage Bucket:** `spacenations-tools.firebasestorage.app`
- **API Key:** `AIzaSyDr4-ap_EubUn0UdP7hkEpS2jkzLIVgvyc`
- **Messaging Sender ID:** `651338201276`
- **App ID:** `1:651338201276:web:89e7d9c19dbd2611d3f8b9`

## ✅ Überprüfungsliste

### 1. **Firebase Console Einstellungen**
- [ ] **Projekt erstellt:** `spacenations-tools`
- [ ] **Web-App hinzugefügt:** Mit korrekter App-ID
- [ ] **API Key aktiviert:** Für Web-Anwendung
- [ ] **Domain autorisiert:** `spacenations-tools-production.up.railway.app`

### 2. **Firebase Authentication**
- [ ] **Authentication aktiviert:** In Firebase Console
- [ ] **Email/Password Provider:** Aktiviert
- [ ] **Authorized Domains:** 
  - `localhost` (für Entwicklung)
  - `spacenations-tools-production.up.railway.app` (für Produktion)
- [ ] **User Management:** Aktiviert

### 3. **Firestore Database**
- [ ] **Firestore aktiviert:** In Firebase Console
- [ ] **Security Rules:** Konfiguriert
- [ ] **Collections erstellt:**
  - `users` (für Benutzerdaten)
  - `alliances` (für Allianz-Daten)
  - `alliancePermissions` (für Berechtigungen)
  - `allianceChat` (für Chat-Nachrichten)

### 4. **Firebase Storage** (falls verwendet)
- [ ] **Storage aktiviert:** In Firebase Console
- [ ] **Security Rules:** Konfiguriert
- [ ] **Upload-Regeln:** Für Dateien

## 🔧 Erforderliche Firebase Security Rules

### Firestore Security Rules
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
  }
}
```

### Storage Security Rules (falls verwendet)
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /alliances/{allianceId}/{allPaths=**} {
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/alliances/$(allianceId)).data.members[request.auth.uid] != null;
    }
  }
}
```

## 🚨 Häufige Probleme und Lösungen

### Problem 1: "Firebase App not initialized"
**Lösung:**
- Überprüfen Sie, ob Firebase SDK korrekt geladen wird
- Stellen Sie sicher, dass `firebase-config.js` vor anderen Skripten geladen wird

### Problem 2: "Permission denied" bei Firestore
**Lösung:**
- Überprüfen Sie die Security Rules
- Stellen Sie sicher, dass der User authentifiziert ist
- Überprüfen Sie die Collection-Namen

### Problem 3: "Domain not authorized" bei Authentication
**Lösung:**
- Fügen Sie die Railway-Domain zu den autorisierten Domains hinzu
- Überprüfen Sie die Auth-Domain-Konfiguration

### Problem 4: "Invalid API key"
**Lösung:**
- Überprüfen Sie den API Key in der Firebase Console
- Stellen Sie sicher, dass der Key für Web-Anwendungen aktiviert ist

## 🔍 Debugging-Tools

### 1. **Firebase Console Logs**
- Gehen Sie zu Firebase Console → Functions → Logs
- Überprüfen Sie Fehler und Warnungen

### 2. **Browser Console**
- Öffnen Sie die Entwicklertools
- Überprüfen Sie Firebase-spezifische Fehler

### 3. **Network Tab**
- Überprüfen Sie Firebase-API-Aufrufe
- Stellen Sie sicher, dass alle Requests erfolgreich sind

## 📊 Test-Checkliste

### 1. **Authentication Test**
```javascript
// In Browser Console testen
firebase.auth().signInWithEmailAndPassword('test@example.com', 'password')
  .then(user => console.log('✅ Auth funktioniert'))
  .catch(error => console.error('❌ Auth Fehler:', error));
```

### 2. **Firestore Test**
```javascript
// In Browser Console testen
firebase.firestore().collection('users').doc('test').set({
  test: true,
  timestamp: firebase.firestore.FieldValue.serverTimestamp()
})
.then(() => console.log('✅ Firestore funktioniert'))
.catch(error => console.error('❌ Firestore Fehler:', error));
```

### 3. **API Endpoint Test**
```bash
# Firebase Config API testen
curl https://spacenations-tools-production.up.railway.app/api/firebase-config
```

## 🎯 Nächste Schritte

1. **Firebase Console überprüfen**
   - Melden Sie sich bei [console.firebase.google.com](https://console.firebase.google.com) an
   - Wählen Sie das Projekt `spacenations-tools`

2. **Services aktivieren**
   - Authentication → Sign-in method → Email/Password aktivieren
   - Firestore Database → Erstellen
   - Storage → Erstellen (falls benötigt)

3. **Security Rules setzen**
   - Kopieren Sie die obigen Rules in die Firebase Console
   - Testen Sie die Rules mit dem Firebase Rules Simulator

4. **Domain autorisieren**
   - Authentication → Settings → Authorized domains
   - Fügen Sie `spacenations-tools-production.up.railway.app` hinzu

5. **Testen**
   - Registrierung testen
   - Login testen
   - Firestore-Operationen testen

## 📞 Support

Falls Probleme auftreten:
1. Überprüfen Sie die Firebase Console Logs
2. Testen Sie mit den Debugging-Tools
3. Überprüfen Sie die Browser Console
4. Kontaktieren Sie den Firebase Support

---

**Status:** ⚠️ Überprüfung erforderlich
**Letzte Aktualisierung:** $(date)