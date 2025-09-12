# User Database Structure - Spacenations Tools

## Einheitliche User-Struktur in Firebase Firestore

### Collection: `users`
Jedes User-Dokument hat folgende Struktur:

```javascript
{
  // Grunddaten
  username: "Daikin",                    // Eindeutiger Benutzername (Document ID)
  email: "daikin@example.com",          // E-Mail-Adresse
  password: "hashed_password",          // Gehashtes Passwort (für lokale Entwicklung)
  
  // System-Rollen
  systemRole: "superadmin",             // "superadmin", "admin", "user"
  
  // Allianz-Information
  alliance: "allianceId123",            // ID der Allianz (null wenn keine)
  allianceRole: "admin",                // "admin", "member", "founder" (null wenn keine Allianz)
  
  // Status und Aktivität
  isActive: true,                       // Account aktiv/inaktiv
  lastLogin: timestamp,                 // Letzter Login
  loginCount: 42,                       // Anzahl Logins
  
  // Zeitstempel
  createdAt: timestamp,                 // Account erstellt
  updatedAt: timestamp,                 // Letzte Aktualisierung
  updatedBy: "username",                // Wer hat zuletzt aktualisiert
  
  // Berechtigungen (optional, für erweiterte Features)
  permissions: {
    dashboard_access: true,
    profile_edit: true,
    admin_dashboard: false,
    user_management: false,
    alliance_management: false,
    system_settings: false
  },
  
  // Profil-Informationen (optional)
  profile: {
    displayName: "Daikin",              // Anzeigename
    avatar: "avatar_url",               // Avatar-URL
    bio: "Space Commander",             // Kurze Beschreibung
    timezone: "Europe/Berlin"           // Zeitzone
  },
  
  // Aktivitäten-Log (optional)
  activities: [
    {
      type: "login",
      timestamp: timestamp,
      details: "Successful login"
    },
    {
      type: "alliance_joined",
      timestamp: timestamp,
      details: "Joined alliance XYZ"
    }
  ]
}
```

## Mögliche Werte

### systemRole
- `"superadmin"` - Vollzugriff auf alle Systeme
- `"admin"` - Admin-Rechte für bestimmte Bereiche
- `"user"` - Standard-Benutzer

### allianceRole
- `"founder"` - Gründer der Allianz
- `"admin"` - Admin der Allianz
- `"member"` - Mitglied der Allianz
- `null` - Keine Allianz

### isActive
- `true` - Account ist aktiv
- `false` - Account ist deaktiviert/gesperrt

## Abfragen

### Alle User einer Allianz
```javascript
db.collection('users')
  .where('alliance', '==', 'allianceId123')
  .get()
```

### Alle Admins einer Allianz
```javascript
db.collection('users')
  .where('alliance', '==', 'allianceId123')
  .where('allianceRole', '==', 'admin')
  .get()
```

### Alle Superadmins
```javascript
db.collection('users')
  .where('systemRole', '==', 'superadmin')
  .get()
```

### User nach E-Mail finden
```javascript
db.collection('users')
  .where('email', '==', 'daikin@example.com')
  .limit(1)
  .get()
```

### Aktive User
```javascript
db.collection('users')
  .where('isActive', '==', true)
  .get()
```

## Migration

### Bestehende User aktualisieren
```javascript
// Füge fehlende Felder zu bestehenden Usern hinzu
const users = await db.collection('users').get();
users.forEach(doc => {
  const userData = doc.data();
  const updates = {};
  
  // Füge fehlende Felder hinzu
  if (!userData.systemRole) updates.systemRole = 'user';
  if (!userData.isActive) updates.isActive = true;
  if (!userData.loginCount) updates.loginCount = 0;
  if (!userData.permissions) updates.permissions = getDefaultPermissions(userData.systemRole);
  
  if (Object.keys(updates).length > 0) {
    doc.ref.update(updates);
  }
});
```

## Vorteile dieser Struktur

1. **Einheitlich** - Alle User haben die gleiche Struktur
2. **Erweiterbar** - Neue Felder können einfach hinzugefügt werden
3. **Abfragbar** - Effiziente Firebase-Abfragen möglich
4. **Flexibel** - Unterstützt verschiedene Rollen und Berechtigungen
5. **Nachvollziehbar** - Vollständige Audit-Trail mit updatedBy
6. **Performance** - Indizierte Felder für schnelle Abfragen