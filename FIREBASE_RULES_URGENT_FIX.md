# URGENT: Firebase-Sicherheitsregeln sofort anwenden!

## Problem
Das Login-System kann nicht auf die Firebase-Datenbank zugreifen, weil die Sicherheitsregeln noch nicht aktualisiert wurden.

## Sofortige Lösung

### 1. Gehen Sie zur Firebase Console
**Link**: https://console.firebase.google.com/u/0/project/spacenations-tools/firestore/rules

### 2. Ersetzen Sie die aktuellen Regeln mit diesem Code:

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

### 3. Klicken Sie auf "Publish"

## Warum das notwendig ist

Das Login-System versucht:
1. **Benutzername-Suche**: `users` Collection nach `username` durchsuchen
2. **Benutzer-Existenz prüfen**: `fetchSignInMethodsForEmail()` aufrufen
3. **Benutzerdaten laden**: Nach erfolgreichem Login

**Aktuell blockiert**: Die Sicherheitsregeln erlauben diese Operationen nicht.

## Nach der Anwendung

Das Login sollte sofort funktionieren:
- ✅ Benutzername-Suche funktioniert
- ✅ E-Mail-Login funktioniert
- ✅ Benutzerdaten werden geladen
- ✅ Keine Permission-Fehler mehr

## Testen

Nach der Regel-Anwendung:
1. Seite neu laden
2. Login mit `t.o@trend4media.de` versuchen
3. Console sollte keine Permission-Fehler mehr zeigen

## Alternative: Temporäre Regeln

Falls Sie die Regeln nicht sofort ändern können, können Sie temporär alle Berechtigungen erlauben:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**WARNUNG**: Diese Regeln sind nur für Tests - nicht für Produktion!