# Benutzername oder E-Mail Login - Anleitung

## Übersicht
Das Spacenations Tools System unterstützt jetzt sowohl Login mit Benutzername als auch mit E-Mail-Adresse. Benutzer können sich mit beiden Optionen anmelden.

## Funktionsweise

### 1. Eingabe-Erkennung
- **E-Mail-Format**: Wenn die Eingabe dem E-Mail-Format entspricht (z.B. `user@example.com`), wird sie direkt als E-Mail verwendet
- **Benutzername-Format**: Wenn die Eingabe kein E-Mail-Format hat, wird sie als Benutzername behandelt

### 2. Benutzername-Auflösung
Wenn ein Benutzername eingegeben wird:
1. Das System sucht in der Firestore-Datenbank nach einem Benutzer mit diesem `username`
2. Wenn gefunden, wird die zugehörige `email` aus dem Benutzerdokument abgerufen
3. Diese E-Mail wird dann für den Firebase-Authentication-Login verwendet

### 3. Firebase Authentication
- Das eigentliche Login erfolgt immer über Firebase Authentication mit der E-Mail-Adresse
- Das Passwort wird gegen die Firebase-Authentication-Datenbank geprüft

## Technische Implementierung

### AuthManager.resolveUsernameToEmail()
```javascript
async resolveUsernameToEmail(input) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    // E-Mail-Format prüfen
    if (emailRegex.test(input)) {
        return input; // Direkt als E-Mail verwenden
    }
    
    // Benutzername in Firestore suchen
    const userQuery = await this.db.collection('users')
        .where('username', '==', input)
        .limit(1)
        .get();
    
    if (userQuery.empty) {
        return null; // Benutzername nicht gefunden
    }
    
    return userQuery.docs[0].data().email; // E-Mail zurückgeben
}
```

### Login-Funktion
```javascript
async login(input, password) {
    // Eingabe auflösen
    const email = await this.resolveUsernameToEmail(input);
    if (!email) {
        return { success: false, error: 'Benutzername oder E-Mail nicht gefunden' };
    }
    
    // Firebase Login mit E-Mail
    const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
    return { success: true, user: userCredential.user };
}
```

## UI-Änderungen

### Login-Formular
- **Eingabefeld**: `type="text"` statt `type="email"`
- **Placeholder**: "Benutzername oder E-Mail-Adresse"
- **Validierung**: Nur Mindestlänge (2 Zeichen) statt E-Mail-Format

### Admin-Login
- **Label**: "Benutzername oder E-Mail"
- **Placeholder**: "Benutzername oder E-Mail-Adresse"
- **Input-Type**: `text` statt `email`

## Firestore-Sicherheitsregeln

### Benutzerdaten lesen
```javascript
match /users/{userId} {
  allow read: if request.auth != null;  // Alle authentifizierten Benutzer können lesen
  allow write: if request.auth != null && request.auth.uid == userId;  // Nur eigene Daten schreiben
}
```

**Wichtig**: Alle authentifizierten Benutzer können Benutzerdaten lesen, um die Benutzername-Suche zu ermöglichen.

## Verwendung

### Für Benutzer
1. **Mit E-Mail**: `t.o@trend4media.de` + Passwort
2. **Mit Benutzername**: `Daikin` + Passwort

### Für Entwickler
```javascript
// Beide Aufrufe funktionieren:
await AuthAPI.login('t.o@trend4media.de', 'password');
await AuthAPI.login('Daikin', 'password');
```

## Fehlerbehandlung

### Benutzername nicht gefunden
- **Fehler**: "Benutzername oder E-Mail-Adresse nicht gefunden"
- **Lösung**: Benutzer überprüft Eingabe oder registriert sich

### E-Mail-Format ungültig
- **Fehler**: "Ungültige E-Mail-Adresse. Bitte geben Sie eine gültige E-Mail-Adresse oder einen Benutzernamen ein."
- **Lösung**: Benutzer korrigiert Eingabe

### Passwort falsch
- **Fehler**: "Falsches Passwort"
- **Lösung**: Benutzer korrigiert Passwort

## Vorteile

1. **Benutzerfreundlichkeit**: Benutzer können sich mit dem gewohnten Benutzernamen anmelden
2. **Flexibilität**: Unterstützt sowohl E-Mail als auch Benutzername
3. **Kompatibilität**: Funktioniert mit bestehenden Firebase-Authentication-Systemen
4. **Sicherheit**: Verwendet weiterhin Firebase-Authentication für Passwort-Validierung

## Migration

### Bestehende Benutzer
- Keine Änderungen erforderlich
- Beide Login-Methoden funktionieren sofort
- E-Mail-Login bleibt unverändert

### Neue Benutzer
- Können sich mit E-Mail registrieren
- Können sich dann mit Benutzername oder E-Mail anmelden
- Benutzername wird automatisch aus den Benutzerdaten abgerufen

## Troubleshooting

### "Benutzername nicht gefunden"
- Prüfen Sie, ob der Benutzername in der Firestore-Datenbank existiert
- Prüfen Sie die Firestore-Sicherheitsregeln
- Prüfen Sie die Firebase-Authentication-Konfiguration

### "E-Mail nicht gefunden"
- Prüfen Sie, ob die E-Mail in Firebase Authentication registriert ist
- Prüfen Sie die Firebase-Konfiguration

### Performance-Probleme
- Die Benutzername-Suche erfolgt über Firestore-Query
- Bei vielen Benutzern kann ein Index erforderlich sein
- Caching kann implementiert werden für bessere Performance