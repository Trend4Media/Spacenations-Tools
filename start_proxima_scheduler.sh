#!/bin/bash
# Startet den ProximaDB Scheduler für automatische wöchentliche Updates

echo "🌌 ProximaDB Scheduler"
echo "======================"
echo ""

# Prüfe ob Discord Webhook URL gesetzt ist
if [ -z "$DISCORD_WEBHOOK_URL" ]; then
    echo "⚠️  DISCORD_WEBHOOK_URL nicht gesetzt!"
    echo "   Setzen Sie die Webhook-URL für automatische Discord-Benachrichtigungen:"
    echo ""
    echo "   export DISCORD_WEBHOOK_URL='https://discord.com/api/webhooks/...'"
    echo ""
    read -p "Möchten Sie die URL jetzt setzen? (j/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Jj]$ ]]; then
        read -p "Discord Webhook URL: " DISCORD_WEBHOOK_URL
        export DISCORD_WEBHOOK_URL
        echo "✅ Webhook-URL gesetzt"
    else
        echo "ℹ️  Scheduler läuft ohne Discord-Benachrichtigungen"
    fi
fi

echo ""
echo "📅 Scheduler-Konfiguration:"
echo "   • Tag: Mittwoch"
echo "   • Zeit: 18:45 Uhr"
echo "   • Aktion: Planeten von beta2 laden → Discord senden"
echo ""

if [ ! -z "$DISCORD_WEBHOOK_URL" ]; then
    echo "✅ Discord-Webhook: Aktiviert"
else
    echo "⚠️  Discord-Webhook: Deaktiviert (DISCORD_WEBHOOK_URL nicht gesetzt)"
fi

echo ""
echo "🚀 Starte Scheduler..."
echo "   (Drücken Sie Ctrl+C zum Beenden)"
echo ""

# Starte den Fetcher mit Scheduler
python3 proxima_fetcher.py
