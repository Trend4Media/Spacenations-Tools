#!/bin/bash

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
