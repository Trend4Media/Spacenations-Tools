#!/bin/bash
# Einfaches Script zum Senden der ProximaDB-Daten an Discord

# Farben für Output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🌌 ProximaDB Discord Webhook${NC}"
echo "================================"

# Prüfe ob Discord Webhook URL gesetzt ist
if [ -z "$DISCORD_WEBHOOK_URL" ]; then
    echo -e "${YELLOW}⚠️  DISCORD_WEBHOOK_URL nicht gesetzt!${NC}"
    echo ""
    echo "Bitte setzen Sie die Umgebungsvariable:"
    echo -e "${GREEN}export DISCORD_WEBHOOK_URL='https://discord.com/api/webhooks/...'${NC}"
    echo ""
    read -p "Möchten Sie die URL jetzt eingeben? (j/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Jj]$ ]]; then
        read -p "Discord Webhook URL: " DISCORD_WEBHOOK_URL
        export DISCORD_WEBHOOK_URL
    else
        exit 1
    fi
fi

# Prüfe ob proxima.db existiert
if [ ! -f "proxima.db" ]; then
    echo -e "${YELLOW}⚠️  proxima.db nicht gefunden!${NC}"
    echo "Führe zuerst proxima_fetcher.py aus, um Daten zu laden..."
    python3 proxima_fetcher.py &
    PID=$!
    sleep 5
    kill $PID 2>/dev/null
fi

# Sende Daten an Discord
echo -e "${GREEN}📤 Sende ProximaDB-Daten an Discord...${NC}"
python3 proxima_discord_webhook.py

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Erfolgreich gesendet!${NC}"
else
    echo -e "${RED}❌ Fehler beim Senden!${NC}"
    exit 1
fi
