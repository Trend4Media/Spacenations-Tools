#!/usr/bin/env node

/**
 * Vollautomatisiertes Setup-Script für Spacenations Tools
 * Führt alle möglichen Schritte automatisch aus
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

console.log('🚀 Vollautomatisiertes Setup für Spacenations Tools');
console.log('==================================================\n');

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
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null;
    }
    match /alliances/{allianceId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (resource.data.admin == request.auth.uid || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.systemRole == 'superadmin');
    }
    match /alliancePermissions/{allianceId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (get(/databases/$(database)/documents/alliances/$(allianceId)).data.admin == request.auth.uid ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.systemRole == 'superadmin');
    }
    match /allianceChat/{allianceId} {
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/alliances/$(allianceId)).data.members[request.auth.uid] != null;
    }
    match /test/{document} {
      allow read, write: if request.auth != null;
    }
  }
}`;

// Railway Umgebungsvariablen
const railwayEnvVars = `FIREBASE_API_KEY=AIzaSyDr4-ap_EubUn0UdP7hkEpS2jkzLIVgvyc
FIREBASE_AUTH_DOMAIN=spacenations-tools.firebaseapp.com
FIREBASE_PROJECT_ID=spacenations-tools
FIREBASE_STORAGE_BUCKET=spacenations-tools.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=651338201276
FIREBASE_APP_ID=1:651338201276:web:89e7d9c19dbd2611d3f8b9`;

// Funktionen
function createAllSetupFiles() {
    console.log('📝 Erstelle alle Setup-Dateien...');
    
    // Firebase Config
    fs.writeFileSync('firebase-config.json', JSON.stringify(firebaseConfig, null, 2));
    console.log('✅ firebase-config.json erstellt');
    
    // Security Rules
    fs.writeFileSync('firestore-security-rules.txt', securityRules);
    console.log('✅ firestore-security-rules.txt erstellt');
    
    // Railway Env Vars
    fs.writeFileSync('railway-env-vars.txt', railwayEnvVars);
    console.log('✅ railway-env-vars.txt erstellt');
    
    // Setup Instructions
    const instructions = `# Automatisiertes Setup - Spacenations Tools

## 🚀 SCHNELLSETUP (5 Minuten)

### 1. Firebase Console (2 Minuten)
1. Gehen Sie zu: https://console.firebase.google.com
2. Wählen Sie Projekt: spacenations-tools
3. Authentication → Sign-in method → Email/Password aktivieren
4. Settings → Authentication → Authorized domains:
   - spacenations-tools-production.up.railway.app
   - localhost
5. Firestore Database → Create database → Start in test mode
6. Firestore Database → Rules → Kopieren Sie Inhalt aus firestore-security-rules.txt

### 2. Railway (2 Minuten)
1. Gehen Sie zu: https://railway.app
2. Wählen Sie Projekt: spacenations-tools
3. Variables → Kopieren Sie alle Variablen aus railway-env-vars.txt

### 3. Testen (1 Minute)
1. Öffnen Sie: https://spacenations-tools-production.up.railway.app/test-firebase.html
2. Alle Tests sollten grün sein ✅

## 🎉 FERTIG!
Das System ist jetzt vollständig konfiguriert und funktionsfähig.
`;
    
    fs.writeFileSync('QUICK_SETUP.md', instructions);
    console.log('✅ QUICK_SETUP.md erstellt');
}

function testRailwayConnection() {
    return new Promise((resolve) => {
        console.log('🧪 Teste Railway-Verbindung...');
        
        const options = {
            hostname: 'spacenations-tools-production.up.railway.app',
            port: 443,
            path: '/api/health',
            method: 'GET',
            timeout: 5000
        };
        
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    console.log('✅ Railway-Verbindung erfolgreich');
                    resolve(true);
                } else {
                    console.log('❌ Railway-Verbindung fehlgeschlagen:', res.statusCode);
                    resolve(false);
                }
            });
        });
        
        req.on('error', (error) => {
            console.log('❌ Railway-Verbindung Fehler:', error.message);
            resolve(false);
        });
        
        req.on('timeout', () => {
            console.log('❌ Railway-Verbindung Timeout');
            req.destroy();
            resolve(false);
        });
        
        req.end();
    });
}

function testFirebaseAPI() {
    return new Promise((resolve) => {
        console.log('🧪 Teste Firebase API...');
        
        const options = {
            hostname: 'spacenations-tools-production.up.railway.app',
            port: 443,
            path: '/api/firebase-config',
            method: 'GET',
            timeout: 5000
        };
        
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    try {
                        const config = JSON.parse(data);
                        console.log('✅ Firebase API erfolgreich');
                        console.log(`   Project ID: ${config.projectId}`);
                        resolve(true);
                    } catch (error) {
                        console.log('❌ Firebase API ungültig:', error.message);
                        resolve(false);
                    }
                } else {
                    console.log('❌ Firebase API fehlgeschlagen:', res.statusCode);
                    resolve(false);
                }
            });
        });
        
        req.on('error', (error) => {
            console.log('❌ Firebase API Fehler:', error.message);
            resolve(false);
        });
        
        req.on('timeout', () => {
            console.log('❌ Firebase API Timeout');
            req.destroy();
            resolve(false);
        });
        
        req.end();
    });
}

function createAutomatedTestScript() {
    console.log('📝 Erstelle automatisiertes Test-Script...');
    
    const testScript = `#!/bin/bash

# Automatisiertes Test-Script für Spacenations Tools
echo "🧪 Starte automatisiertes Testing..."

# Test 1: Railway Health Check
echo "Test 1: Railway Health Check"
if curl -s https://spacenations-tools-production.up.railway.app/api/health | grep -q "healthy"; then
    echo "✅ Railway Health Check erfolgreich"
else
    echo "❌ Railway Health Check fehlgeschlagen"
fi

# Test 2: Firebase Config API
echo "Test 2: Firebase Config API"
if curl -s https://spacenations-tools-production.up.railway.app/api/firebase-config | grep -q "projectId"; then
    echo "✅ Firebase Config API erfolgreich"
else
    echo "❌ Firebase Config API fehlgeschlagen"
fi

# Test 3: Test-Seite erreichbar
echo "Test 3: Test-Seite erreichbar"
if curl -s -o /dev/null -w "%{http_code}" https://spacenations-tools-production.up.railway.app/test-firebase.html | grep -q "200"; then
    echo "✅ Test-Seite erreichbar"
else
    echo "❌ Test-Seite nicht erreichbar"
fi

echo "🎉 Testing abgeschlossen!"
`;
    
    fs.writeFileSync('test-system.sh', testScript);
    fs.chmodSync('test-system.sh', '755');
    console.log('✅ test-system.sh erstellt');
}

async function main() {
    try {
        console.log('🚀 Starte vollautomatisiertes Setup...\n');
        
        // Alle Setup-Dateien erstellen
        createAllSetupFiles();
        
        // Automatisiertes Test-Script erstellen
        createAutomatedTestScript();
        
        console.log('\n📋 Setup-Dateien erstellt:');
        console.log('   - firebase-config.json');
        console.log('   - firestore-security-rules.txt');
        console.log('   - railway-env-vars.txt');
        console.log('   - QUICK_SETUP.md');
        console.log('   - test-system.sh');
        
        console.log('\n🧪 Teste System-Verbindungen...');
        
        // Railway testen
        const railwayOk = await testRailwayConnection();
        
        // Firebase API testen
        const firebaseOk = await testFirebaseAPI();
        
        console.log('\n📊 Test-Ergebnisse:');
        console.log(`   Railway: ${railwayOk ? '✅ OK' : '❌ Fehler'}`);
        console.log(`   Firebase API: ${firebaseOk ? '✅ OK' : '❌ Fehler'}`);
        
        if (railwayOk && firebaseOk) {
            console.log('\n🎉 System ist bereit!');
            console.log('📖 Lesen Sie QUICK_SETUP.md für die letzten Schritte');
        } else {
            console.log('\n⚠️ System benötigt Konfiguration');
            console.log('📖 Lesen Sie QUICK_SETUP.md für die Konfiguration');
        }
        
        console.log('\n🔧 Nächste Schritte:');
        console.log('1. Lesen Sie QUICK_SETUP.md');
        console.log('2. Führen Sie die 5-Minuten-Konfiguration durch');
        console.log('3. Testen Sie mit: ./test-system.sh');
        console.log('4. Oder öffnen Sie: https://spacenations-tools-production.up.railway.app/test-firebase.html');
        
    } catch (error) {
        console.error('❌ Setup Fehler:', error.message);
        process.exit(1);
    }
}

// Script ausführen
if (require.main === module) {
    main();
}

module.exports = { main };