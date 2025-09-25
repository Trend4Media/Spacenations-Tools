## Firebase: Rules & Indizes importieren und testen (Variante B)

### 1) Firestore Rules in der Console veröffentlichen
- Öffne `https://console.firebase.google.com/u/0/project/spacenations-tools/firestore/rules`
- Ersetze den Inhalt mit dem aus `firestore.rules`
- Klicke auf Publish

### 2) Indizes in der Console importieren
- Öffne `https://console.firebase.google.com/u/0/project/spacenations-tools/firestore/indexes`
- Klicke auf "Create index" und lege diese Composite-Indizes an (aus `firestore.indexes.json`):
  - spyReports: `allianceId ASC`, `createdAt DESC`
  - spyReports: `allianceId ASC`, `playerName ASC`
  - spyReports: `allianceId ASC`, `planetName ASC`

Hinweis: Alternativ kann die CLI genutzt werden (siehe unten).

### 3) Optional: CLI-Deployment (nicht interaktiv)
Voraussetzung: Ein CI-Token (`FIREBASE_TOKEN`) mit Zugriff auf das Projekt.

```bash
# im Projektverzeichnis
export FIREBASE_TOKEN=<dein_token>
npx firebase-tools deploy --only firestore:rules,firestore:indexes --project spacenations-tools --non-interactive
```

### 4) Regeln lokal mit Emulator prüfen (optional)
Voraussetzung: Java für den Emulator und Node.js.

```bash
npm install --save-dev @firebase/rules-unit-testing firebase@9
npx firebase-tools emulators:exec --only firestore "node tests/firestore-rules-simulator.js"
```

Der Test-Skript führt ein paar Lese-/Schreibvorgänge als:
- anonymer Client (sollte scheitern),
- eingeloggter Member,
- Global-Admin
gegen den Emulator aus.

