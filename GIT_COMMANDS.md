# 🔄 Git-Kommandos für Branch-Management

## 📋 Schritt-für-Schritt Anleitung

### 1. Aktuellen Branch-Status prüfen
```bash
git status
git branch -a
```

### 2. Alle Änderungen committen (falls noch nicht geschehen)
```bash
git add .
git commit -m "🛡️ Fix Admin-Login und Firebase Analytics-Berechtigungen

- Neues Sync-Tool für Firestore zu Firebase Auth
- Verbesserte Login-Logik mit Diskrepanz-Erkennung  
- Analytics-Fallback bei Berechtigungsfehlern
- Umfassende Diagnose-Tools
- Korrigierte Firestore-Sicherheitsregeln
- Bessere Benutzerführung und Fehlermeldungen

Fixes: Admin-Login für t.o@trend4media.de
Fixes: Analytics permission-denied Fehler-Loop"
```

### 3. Zum Main-Branch wechseln
```bash
git checkout main
```

### 4. Feature-Branch in Main mergen
```bash
git merge cursor/debug-firebase-admin-login-error-fefe
```

### 5. Main-Branch pushen
```bash
git push origin main
```

### 6. Alle anderen Branches löschen (lokal)
```bash
# Alle lokalen Branches außer main löschen
git branch | grep -v "main" | xargs git branch -D
```

### 7. Remote Branches löschen (optional)
```bash
# Alle remote Branches außer main löschen
git branch -r | grep -v "origin/main" | sed 's/origin\///' | xargs -I {} git push origin --delete {}
```

### 8. Finale Überprüfung
```bash
git branch -a
git log --oneline -5
```

## 🚨 Sicherheitshinweise

- **Backup empfohlen:** Erstellen Sie ein Backup vor dem Löschen der Branches
- **Teamwork:** Falls andere Entwickler an Branches arbeiten, koordinieren Sie sich
- **Remote-Branches:** Seien Sie vorsichtig beim Löschen von Remote-Branches

## 🎯 Alternative: Einzelne Kommandos

Falls Sie Schritt für Schritt vorgehen möchten:

```bash
# 1. Status prüfen
git status

# 2. Zum Main wechseln
git checkout main

# 3. Feature-Branch mergen
git merge cursor/debug-firebase-admin-login-error-fefe

# 4. Pushen
git push origin main

# 5. Feature-Branch löschen
git branch -D cursor/debug-firebase-admin-login-error-fefe
```

## ✅ Nach erfolgreichem Push

Testen Sie die Lösungen:
1. `/sync-firestore-to-auth.html` - Admin-Benutzer synchronisieren
2. Firestore-Regeln aus `FIRESTORE_RULES_FIX.txt` aktualisieren
3. Admin-Login testen

---

**Führen Sie diese Kommandos in Ihrem Terminal aus.**