# Firebase Setup Anleitung für Allianz-System

## 🎯 Problem
Das Allianz-System benötigt spezielle Collections in Firebase Firestore, die noch nicht existieren.

## 📊 Benötigte Collections

### 1. `alliances` Collection
**Zweck:** Speichert alle Allianz-Informationen
```
alliances/
├── {allianceId}/
    ├── name: "Space Warriors"
    ├── tag: "SW"
    ├── description: "Eine starke Allianz"
    ├── founder: "username"
    ├── members: ["username1", "username2"]
    ├── status: "pending" | "approved" | "rejected"
    ├── admin: "username"
    ├── createdAt: Timestamp
    ├── approvedAt: Timestamp (optional)
    └── approvedBy: "superadmin_uid"
```

### 2. `alliancePermissions` Collection
**Zweck:** Speichert Allianz-weite Berechtigungen
```
alliancePermissions/
├── {allianceId}/
    ├── chat_read: { enabled: true, description: "Chat lesen" }
    ├── chat_write: { enabled: true, description: "Chat schreiben" }
    ├── spy_database: { enabled: false, description: "Spionage-Datenbank" }
    ├── member_approval: { enabled: false, description: "Mitglieder bestätigen" }
    └── permission_manage: { enabled: false, description: "Berechtigungen verwalten" }
```

### 3. `allianceChats` Collection
**Zweck:** Speichert Chat-Nachrichten (mit Subcollections)
```
allianceChats/
├── {allianceId}/
    └── messages/
        ├── {messageId}/
            ├── content: "Hallo Allianz!"
            ├── author: "username"
            ├── timestamp: Timestamp
            └── allianceId: "allianceId"
```

### 4. `allianceActivities` Collection
**Zweck:** Loggt alle Allianz-Aktivitäten
```
allianceActivities/
├── {activityId}/
    ├── allianceId: "allianceId"
    ├── type: "member_approved" | "member_removed" | "permission_changed"
    ├── member: "username"
    ├── performedBy: "admin_username"
    ├── timestamp: Timestamp
    └── details: { ... }
```

## 🔧 Setup-Optionen

### Option 1: Automatisches Setup (Empfohlen)
1. Gehe zu: `https://trend4media.github.io/Spacenations-Tools/initialize-firebase-database.html`
2. Klicke "Datenbank initialisieren"
3. Warte bis "✅ Datenbank erfolgreich initialisiert!" angezeigt wird
4. Klicke "Status prüfen" um zu bestätigen

### Option 2: Manuelles Setup in Firebase Console
1. Gehe zu [Firebase Console](https://console.firebase.google.com/)
2. Wähle dein Projekt "spacenations-tools"
3. Gehe zu "Firestore Database"
4. Erstelle die Collections manuell:

#### Schritt 1: alliances Collection
- Klicke "Start collection"
- Collection ID: `alliances`
- Document ID: `test` (wird später gelöscht)
- Felder hinzufügen:
  - `name` (string): "Test"
  - `tag` (string): "TEST"
  - `status` (string): "pending"
  - `createdAt` (timestamp): Jetzt

#### Schritt 2: alliancePermissions Collection
- Collection ID: `alliancePermissions`
- Document ID: `test`
- Felder hinzufügen:
  - `chat_read` (map): `{enabled: true, description: "Chat lesen"}`
  - `chat_write` (map): `{enabled: true, description: "Chat schreiben"}`

#### Schritt 3: Weitere Collections
- Wiederhole für `allianceChats` und `allianceActivities`
- Lösche die Test-Dokumente nach der Erstellung

### Option 3: Programmatisches Setup
```javascript
// In der Browser-Konsole ausführen
const db = firebase.firestore();

// Erstelle Test-Allianz
const testAlliance = {
  name: "Test Allianz",
  tag: "TEST",
  founder: "testuser",
  members: ["testuser"],
  status: "pending",
  createdAt: firebase.firestore.FieldValue.serverTimestamp()
};

db.collection('alliances').add(testAlliance).then(() => {
  console.log('Alliances Collection erstellt');
});
```

## 🔍 Verifikation

### Prüfe ob Setup erfolgreich war:
1. Gehe zu `https://trend4media.github.io/Spacenations-Tools/debug-firebase.html`
2. Klicke "Status prüfen"
3. Alle Collections sollten ✅ anzeigen

### Teste Allianz-Erstellung:
1. Gehe zu `https://trend4media.github.io/Spacenations-Tools/user-dashboard.html`
2. Klicke "Neue Allianz erstellen"
3. Fülle alle Felder aus
4. Klicke "Allianz erstellen"
5. Sollte Erfolg anzeigen

### Prüfe Admin-Dashboard:
1. Gehe zu `https://trend4media.github.io/Spacenations-Tools/admin-dashboard.html`
2. Klicke auf "Allianzen"-Tab
3. Deine erstellte Allianz sollte mit Status "Ausstehend" angezeigt werden

## ⚠️ Wichtige Hinweise

### Firestore Security Rules
Stelle sicher, dass deine Firestore Rules die neuen Collections erlauben:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Bestehende Rules...
    
    // Alliances
    match /alliances/{allianceId} {
      allow read, write: if request.auth != null;
    }
    
    // Alliance Permissions
    match /alliancePermissions/{allianceId} {
      allow read, write: if request.auth != null;
    }
    
    // Alliance Chats
    match /allianceChats/{allianceId} {
      allow read, write: if request.auth != null;
    }
    
    // Alliance Activities
    match /allianceActivities/{activityId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Indexes
Firestore erstellt automatisch die benötigten Indexes, aber du kannst sie in der Firebase Console überprüfen:
- Gehe zu "Firestore Database" → "Indexes"
- Stelle sicher, dass folgende Indexes existieren:
  - `alliances`: `status` (Ascending) + `createdAt` (Descending)
  - `alliances`: `members` (Arrays) + `status` (Ascending)

## 🚨 Troubleshooting

### Problem: "Collection does not exist"
**Lösung:** Collections müssen erst erstellt werden (siehe Setup-Optionen oben)

### Problem: "Permission denied"
**Lösung:** Firestore Rules anpassen (siehe oben)

### Problem: "Allianz wird nicht angezeigt"
**Lösung:** 
1. Prüfe Browser-Konsole auf Fehler
2. Verwende Debug-Tool um Status zu prüfen
3. Stelle sicher, dass Firebase korrekt initialisiert ist

### Problem: "Tag bereits vergeben"
**Lösung:** Verwende einen anderen, eindeutigen Tag

## 📞 Support

Falls Probleme auftreten:
1. Öffne Browser-Konsole (F12)
2. Schaue nach Fehlermeldungen
3. Verwende das Debug-Tool
4. Prüfe Firebase Console auf fehlende Collections