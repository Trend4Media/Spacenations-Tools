# 🔥 Firebase Security Rules - Fehlerbehebung

## 🚨 **PROBLEM IDENTIFIZIERT:**

**Fehler:** `Missing or insufficient permissions` beim Laden der Benutzerdaten

**Ursache:** Firestore Security Rules sind zu restriktiv für die Benutzerdaten

## 🛠️ **LÖSUNG:**

### **1. Firebase Console öffnen:**
1. **Link:** [console.firebase.google.com](https://console.firebase.google.com)
2. **Projekt auswählen:** `spacenations-tools`
3. **Firestore Database** → **Rules** Tab

### **2. Security Rules ersetzen:**

**Löschen Sie den gesamten Inhalt** im Rules-Editor und **fügen Sie diese Regeln ein:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users Collection - Benutzer können ihre eigenen Daten lesen/schreiben
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null;
    }
    
    // Alliances Collection - Alle eingeloggten User können lesen
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
    
    // User Activities
    match /userActivities/{activityId} {
      allow read, write: if request.auth != null;
    }
    
    // Error Logs (für Debugging)
    match /errorLogs/{logId} {
      allow read, write: if request.auth != null;
    }
    
    // Test Collection
    match /test/{document} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### **3. Rules veröffentlichen:**
1. **Klicken Sie auf "Publish"** (oben rechts)
2. **Warten Sie** bis die Rules veröffentlicht sind
3. **Testen Sie** die Anwendung erneut

## 🔍 **WAS DIE REGELN BEDEUTEN:**

### **Users Collection:**
- ✅ **Lesen/Schreiben:** Nur eigene Benutzerdaten (`request.auth.uid == userId`)
- ✅ **Erstellen:** Alle eingeloggten User können neue Benutzerdaten erstellen
- ❌ **Andere Benutzer:** Können nicht auf fremde Daten zugreifen

### **Alliances Collection:**
- ✅ **Lesen:** Alle eingeloggten User
- ✅ **Schreiben:** Nur Allianz-Admin oder Super-Admins

### **User Activities:**
- ✅ **Lesen/Schreiben:** Alle eingeloggten User

## 🧪 **TESTEN NACH DEM FIX:**

### **1. Registrierung testen:**
- **URL:** [register.html](https://spacenations-tools-production.up.railway.app/register.html)
- **Erwartung:** Keine "Missing permissions" Fehler

### **2. Login testen:**
- **URL:** [index.html](https://spacenations-tools-production.up.railway.app/index.html)
- **Erwartung:** Benutzerdaten werden korrekt geladen

### **3. Debug-Logs prüfen:**
- **URL:** [debug-logs.html](https://spacenations-tools-production.up.railway.app/debug-logs.html)
- **Erwartung:** Keine Firebase-Berechtigungsfehler

## 🚨 **FALLS PROBLEME BLEIBEN:**

### **Temporäre Test-Regeln (NUR FÜR DEBUGGING):**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**⚠️ WARNUNG:** Diese Regeln sind sehr permissiv - nur für Debugging verwenden!

## 📊 **VERIFIKATION:**

Nach dem Anwenden der korrigierten Rules sollten Sie sehen:

### **In der Browser-Konsole:**
```
✅ Firebase Services verfügbar
🔥 Firebase Auth und DB verfügbar
👤 AUTH: AuthManager erfolgreich initialisiert
📂 Benutzerdaten geladen: [username]
```

### **Keine Fehler mehr:**
- ❌ `Missing or insufficient permissions`
- ❌ `FirebaseError: Permission denied`
- ❌ `Cannot read properties of undefined`

## 🎯 **NÄCHSTE SCHRITTE:**

1. **Rules in Firebase Console aktualisieren**
2. **2-3 Minuten warten** bis Rules aktiv sind
3. **Anwendung testen**
4. **Debug-Logs überprüfen**

**Das sollte das Berechtigungsproblem vollständig lösen! 🚀**