#!/usr/bin/env node

/**
 * Firebase Setup Script für Spacenations Tools
 * Automatisiert die Firebase-Konfiguration
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

console.log('🔥 Firebase Setup Script für Spacenations Tools');
console.log('================================================\n');

// Firebase-Konfiguration
const firebaseConfig = {
    apiKey: 'AIzaSyDr4-ap_EubUn0UdP7hkEpS2jkzLIVgvyc',
    authDomain: 'spacenations-tools.firebaseapp.com',
    projectId: 'spacenations-tools',
    storageBucket: 'spacenations-tools.firebasestorage.app',
    messagingSenderId: '651338201276',
    appId: '1:651338201276:web:89e7d9c19dbd2611d3f8b9',
    measurementId: 'G-SKWJWH2ERX'
};

// Security Rules
const securityRules = `rules_version = '2';
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
}`;

// Umgebungsvariablen für Railway
const railwayEnvVars = `FIREBASE_API_KEY=AIzaSyDr4-ap_EubUn0UdP7hkEpS2jkzLIVgvyc
FIREBASE_AUTH_DOMAIN=spacenations-tools.firebaseapp.com
FIREBASE_PROJECT_ID=spacenations-tools
FIREBASE_STORAGE_BUCKET=spacenations-tools.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=651338201276
FIREBASE_APP_ID=1:651338201276:web:89e7d9c19dbd2611d3f8b9`;

// Funktionen
function createFirebaseConfigFile() {
    console.log('📝 Erstelle firebase-config.json...');
    
    const configPath = path.join(__dirname, 'firebase-config.json');
    fs.writeFileSync(configPath, JSON.stringify(firebaseConfig, null, 2));
    console.log('✅ firebase-config.json erstellt');
}

function createSecurityRulesFile() {
    console.log('📝 Erstelle firestore-security-rules.txt...');
    
    const rulesPath = path.join(__dirname, 'firestore-security-rules.txt');
    fs.writeFileSync(rulesPath, securityRules);
    console.log('✅ firestore-security-rules.txt erstellt');
}

function createRailwayEnvFile() {
    console.log('📝 Erstelle railway-env-vars.txt...');
    
    const envPath = path.join(__dirname, 'railway-env-vars.txt');
    fs.writeFileSync(envPath, railwayEnvVars);
    console.log('✅ railway-env-vars.txt erstellt');
}

function createSetupInstructions() {
    console.log('📝 Erstelle setup-instructions.md...');
    
    const instructions = `# Firebase Setup Instructions

## 1. Firebase Console Konfiguration

### Authentication aktivieren:
1. Gehen Sie zu: https://console.firebase.google.com
2. Wählen Sie Projekt: spacenations-tools
3. Authentication → Sign-in method → Email/Password aktivieren
4. Settings → Authentication → Authorized domains hinzufügen:
   - spacenations-tools-production.up.railway.app
   - localhost

### Firestore Database erstellen:
1. Firestore Database → Create database
2. Start in test mode
3. Location: europe-west3

### Security Rules setzen:
Kopieren Sie den Inhalt von firestore-security-rules.txt in Firebase Console → Firestore → Rules

## 2. Railway Umgebungsvariablen

Kopieren Sie alle Variablen aus railway-env-vars.txt in Railway → Variables

## 3. Testing

Öffnen Sie: https://spacenations-tools-production.up.railway.app/test-firebase.html

## 4. Registrierung testen

Öffnen Sie: https://spacenations-tools-production.up.railway.app/register.html
`;

    const instructionsPath = path.join(__dirname, 'setup-instructions.md');
    fs.writeFileSync(instructionsPath, instructions);
    console.log('✅ setup-instructions.md erstellt');
}

function testFirebaseConnection() {
    console.log('🧪 Teste Firebase-Verbindung...');
    
    // Test API Endpoint
    const options = {
        hostname: 'spacenations-tools-production.up.railway.app',
        port: 443,
        path: '/api/firebase-config',
        method: 'GET'
    };
    
    const req = https.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            if (res.statusCode === 200) {
                console.log('✅ Firebase API Endpoint erreichbar');
                try {
                    const config = JSON.parse(data);
                    console.log('✅ Firebase-Konfiguration gültig');
                    console.log(`   Project ID: ${config.projectId}`);
                    console.log(`   Auth Domain: ${config.authDomain}`);
                } catch (error) {
                    console.log('❌ Firebase-Konfiguration ungültig:', error.message);
                }
            } else {
                console.log('❌ Firebase API Endpoint nicht erreichbar:', res.statusCode);
            }
        });
    });
    
    req.on('error', (error) => {
        console.log('❌ Firebase-Verbindung fehlgeschlagen:', error.message);
    });
    
    req.setTimeout(5000, () => {
        console.log('❌ Firebase-Verbindung Timeout');
        req.destroy();
    });
    
    req.end();
}

// Hauptfunktion
async function main() {
    try {
        console.log('🚀 Starte Firebase Setup...\n');
        
        // Dateien erstellen
        createFirebaseConfigFile();
        createSecurityRulesFile();
        createRailwayEnvFile();
        createSetupInstructions();
        
        console.log('\n📋 Setup-Dateien erstellt:');
        console.log('   - firebase-config.json');
        console.log('   - firestore-security-rules.txt');
        console.log('   - railway-env-vars.txt');
        console.log('   - setup-instructions.md');
        
        console.log('\n🔧 Nächste Schritte:');
        console.log('1. Folgen Sie den Anweisungen in setup-instructions.md');
        console.log('2. Konfigurieren Sie Firebase Console');
        console.log('3. Setzen Sie Railway Umgebungsvariablen');
        console.log('4. Testen Sie mit test-firebase.html');
        
        console.log('\n🧪 Teste Firebase-Verbindung...');
        testFirebaseConnection();
        
        console.log('\n✅ Firebase Setup Script abgeschlossen!');
        
    } catch (error) {
        console.error('❌ Setup Fehler:', error.message);
        process.exit(1);
    }
}

// Script ausführen
if (require.main === module) {
    main();
}

module.exports = {
    firebaseConfig,
    securityRules,
    railwayEnvVars
};