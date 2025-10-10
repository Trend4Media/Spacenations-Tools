#!/bin/bash
# Setup-Script für ProximaDB Discord Webhook

echo "🌌 ProximaDB Discord Webhook Setup"
echo "===================================="
echo ""

# Webhook URL
WEBHOOK_URL="https://discordapp.com/api/webhooks/1426138127608844388/EafXsVN9-auN12Trm3j9Ipi0V5y54dBaXlpSOmO_jOPEZ7fTkISsaWI46XN-zZPv9jmv"

# Erstelle .env Datei
cat > .env << EOF
# Discord Webhook Konfiguration
DISCORD_WEBHOOK_URL=$WEBHOOK_URL
EOF

echo "✅ .env Datei erstellt"

# Installiere Dependencies falls nötig
if ! python3 -c "import requests" 2>/dev/null; then
    echo "📦 Installiere requests..."
    pip install requests --quiet
fi

echo "✅ Dependencies installiert"
echo ""
echo "🚀 Setup abgeschlossen!"
echo ""
echo "Sie können jetzt folgende Befehle verwenden:"
echo ""
echo "  1. Einmalig Daten senden:"
echo "     python3 proxima_discord_webhook.py"
echo ""
echo "  2. Mit Bash-Script:"
echo "     ./send_proxima_to_discord.sh"
echo ""
echo "  3. Automatisch (bereits integriert in proxima_fetcher.py):"
echo "     python3 proxima_fetcher.py"
echo ""
echo "  4. Beispiele ansehen:"
echo "     python3 example_webhook_usage.py"
echo ""
