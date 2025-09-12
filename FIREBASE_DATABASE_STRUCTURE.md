# Firebase Database Structure für Spacenations-Tools

## Übersicht
Diese Dokumentation beschreibt die Firebase Firestore-Datenbankstruktur für das Allianz-System.

## Collections

### 1. `alliances` Collection
Speichert alle Allianz-Informationen.

**Dokument-Struktur:**
```javascript
{
  name: "Space Warriors",           // Allianz Name
  tag: "SW",                        // Allianz Tag (eindeutig)
  description: "Eine starke Allianz", // Beschreibung
  founder: "username123",           // Benutzername des Gründers
  members: ["username123", "user2"], // Array aller Mitglieder
  admin: "username123",             // Allianz-Admin (kann vom Super-Admin gesetzt werden)
  status: "pending",                // "pending" | "approved" | "rejected"
  createdAt: Timestamp,             // Erstellungsdatum
  approvedAt: Timestamp,            // Genehmigungsdatum (optional)
  approvedBy: "superadmin_uid",     // UID des genehmigenden Super-Admins
  adminSetAt: Timestamp,            // Wann Admin gesetzt wurde
  adminSetBy: "superadmin_uid"      // Wer den Admin gesetzt hat
}
```

### 2. `alliancePermissions` Collection
Speichert Allianz-weite Berechtigungen.

**Dokument-Struktur:**
```javascript
{
  chat_read: {
    enabled: true,
    description: "Chat lesen"
  },
  chat_write: {
    enabled: true,
    description: "Chat schreiben"
  },
  spy_database: {
    enabled: false,
    description: "Spionage-Datenbank"
  },
  member_approval: {
    enabled: false,
    description: "Mitglieder bestätigen"
  },
  permission_manage: {
    enabled: false,
    description: "Berechtigungen verwalten"
  }
}
```

### 3. `alliancePermissions/{allianceId}/memberPermissions` Subcollection
Speichert individuelle Mitglieder-Berechtigungen.

**Dokument-Struktur (Dokument-ID = Benutzername):**
```javascript
{
  chat_read: true,                  // Überschreibt Allianz-weite Berechtigung
  spy_database: false,              // Überschreibt Allianz-weite Berechtigung
  updatedAt: Timestamp,             // Wann zuletzt geändert
  updatedBy: "admin_username"       // Wer geändert hat
}
```

### 4. `allianceChats` Collection
Speichert Chat-Nachrichten für jede Allianz.

**Subcollection: `allianceChats/{allianceId}/messages`**
```javascript
{
  content: "Hallo Allianz!",        // Nachrichteninhalt
  author: "username123",            // Verfasser
  timestamp: Timestamp,             // Zeitstempel
  allianceId: "alliance_doc_id"     // Referenz zur Allianz
}
```

### 5. `allianceActivities` Collection
Loggt alle Allianz-Aktivitäten.

**Dokument-Struktur:**
```javascript
{
  allianceId: "alliance_doc_id",    // Referenz zur Allianz
  type: "member_approved",          // Art der Aktivität
  member: "username123",            // Betroffenes Mitglied
  performedBy: "admin_username",    // Wer die Aktion ausgeführt hat
  timestamp: Timestamp,             // Zeitstempel
  details: {                        // Zusätzliche Details (optional)
    oldPermission: false,
    newPermission: true
  }
}
```

## Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users Collection (bestehend)
    match /users/{userId} {
      allow read, write: if request.auth != null;
    }
    
    // Alliances Collection
    match /alliances/{allianceId} {
      // Lesen: Alle eingeloggten User
      allow read: if request.auth != null;
      
      // Schreiben: Nur der Gründer oder Super-Admins
      allow write: if request.auth != null && 
        (resource.data.founder == request.auth.token.email || 
         exists(/databases/$(database)/documents/users/$(request.auth.uid)) && 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isSuperAdmin == true);
      
      // Erstellen: Alle eingeloggten User
      allow create: if request.auth != null;
    }
    
    // Alliance Permissions
    match /alliancePermissions/{allianceId} {
      // Lesen: Alle Allianzmitglieder
      allow read: if request.auth != null && 
        exists(/databases/$(database)/documents/alliances/$(allianceId)) &&
        get(/databases/$(database)/documents/alliances/$(allianceId)).data.members.hasAny([request.auth.token.email]);
      
      // Schreiben: Nur Allianz-Admin oder Super-Admins
      allow write: if request.auth != null && 
        (get(/databases/$(database)/documents/alliances/$(allianceId)).data.admin == request.auth.token.email ||
         exists(/databases/$(database)/documents/users/$(request.auth.uid)) && 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isSuperAdmin == true);
      
      // Member Permissions Subcollection
      match /memberPermissions/{memberUsername} {
        allow read: if request.auth != null && 
          exists(/databases/$(database)/documents/alliances/$(allianceId)) &&
          get(/databases/$(database)/documents/alliances/$(allianceId)).data.members.hasAny([request.auth.token.email]);
        
        allow write: if request.auth != null && 
          (get(/databases/$(database)/documents/alliances/$(allianceId)).data.admin == request.auth.token.email ||
           exists(/databases/$(database)/documents/users/$(request.auth.uid)) && 
           get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isSuperAdmin == true);
      }
    }
    
    // Alliance Chats
    match /allianceChats/{allianceId} {
      // Lesen: Nur Allianzmitglieder
      allow read: if request.auth != null && 
        exists(/databases/$(database)/documents/alliances/$(allianceId)) &&
        get(/databases/$(database)/documents/alliances/$(allianceId)).data.members.hasAny([request.auth.token.email]);
      
      // Messages Subcollection
      match /messages/{messageId} {
        allow read: if request.auth != null && 
          exists(/databases/$(database)/documents/alliances/$(allianceId)) &&
          get(/databases/$(database)/documents/alliances/$(allianceId)).data.members.hasAny([request.auth.token.email]);
        
        allow create: if request.auth != null && 
          exists(/databases/$(database)/documents/alliances/$(allianceId)) &&
          get(/databases/$(database)/documents/alliances/$(allianceId)).data.members.hasAny([request.auth.token.email]) &&
          request.auth.token.email == resource.data.author;
      }
    }
    
    // Alliance Activities (nur für Logging)
    match /allianceActivities/{activityId} {
      allow read: if request.auth != null && 
        exists(/databases/$(database)/documents/alliances/$(resource.data.allianceId)) &&
        get(/databases/$(database)/documents/alliances/$(resource.data.allianceId)).data.members.hasAny([request.auth.token.email]);
      
      allow create: if request.auth != null;
    }
    
    // User Activities (bestehend)
    match /userActivities/{activityId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Indexes

### Composite Indexes (automatisch erstellt)
1. `alliances` Collection:
   - `status` (Ascending) + `createdAt` (Descending)
   - `members` (Arrays) + `status` (Ascending)

2. `allianceChats/{allianceId}/messages` Subcollection:
   - `timestamp` (Descending)

3. `allianceActivities` Collection:
   - `allianceId` (Ascending) + `timestamp` (Descending)

## Migration Script

```javascript
// Script zum Erstellen der Standard-Berechtigungen für bestehende Allianzen
async function migrateAlliancePermissions() {
  const db = firebase.firestore();
  const alliances = await db.collection('alliances').get();
  
  for (const allianceDoc of alliances.docs) {
    const allianceId = allianceDoc.id;
    
    // Erstelle Standard-Berechtigungen
    await db.collection('alliancePermissions').doc(allianceId).set({
      chat_read: { enabled: true, description: "Chat lesen" },
      chat_write: { enabled: true, description: "Chat schreiben" },
      spy_database: { enabled: false, description: "Spionage-Datenbank" },
      member_approval: { enabled: false, description: "Mitglieder bestätigen" },
      permission_manage: { enabled: false, description: "Berechtigungen verwalten" }
    });
    
    console.log(`Berechtigungen für Allianz ${allianceId} erstellt`);
  }
}
```

## Wichtige Hinweise

1. **Eindeutigkeit**: Allianz-Tags müssen eindeutig sein (wird im Code geprüft)
2. **Berechtigungen**: Individuelle Mitglieder-Berechtigungen überschreiben Allianz-weite Berechtigungen
3. **Real-time Updates**: Alle Collections unterstützen Real-time Listener
4. **Sicherheit**: Firestore Rules sorgen für sicheren Zugriff
5. **Performance**: Composite Indexes für optimale Abfrage-Performance

## Test-Daten

```javascript
// Beispiel-Allianz erstellen
const exampleAlliance = {
  name: "Space Warriors",
  tag: "SW",
  description: "Eine starke Allianz für erfahrene Spieler",
  founder: "testuser@example.com",
  members: ["testuser@example.com"],
  admin: "testuser@example.com",
  status: "pending",
  createdAt: firebase.firestore.FieldValue.serverTimestamp()
};
```