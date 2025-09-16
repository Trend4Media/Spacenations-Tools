# 📊 Analytics-System Setup

## Übersicht

Das Analytics-System für die Spacenations-Plattform ermöglicht es, detaillierte Statistiken über Seitenaufrufe, Benutzerverhalten und Plattform-Nutzung zu sammeln und anzuzeigen.

## Features

- **Seitenaufruf-Tracking**: Erfasst jeden Seitenaufruf mit Details
- **Herkunft-Analyse**: Verfolgt, woher die Besucher kommen
- **Geräte-Informationen**: Erkennt Gerätetyp, Browser und Betriebssystem
- **Session-Tracking**: Verfolgt Benutzer-Sessions und Verweildauer
- **Event-Tracking**: Erfasst benutzerdefinierte Events
- **Admin-Dashboard**: Umfassende Statistik-Ansicht für Administratoren

## Installation

### 1. Automatisches Setup

1. Öffnen Sie `setup-analytics.html` in Ihrem Browser
2. Folgen Sie den Anweisungen auf der Seite
3. Das System erstellt automatisch die notwendigen Firebase-Sammlungen

### 2. Manuelle Installation

#### Firebase-Sammlungen erstellen

Erstellen Sie die folgenden Sammlungen in Ihrer Firestore-Datenbank:

- `analytics_pageViews` - Seitenaufrufe
- `analytics_sessions` - Benutzer-Sessions  
- `analytics_events` - Benutzer-Events

#### Sicherheitsregeln

Fügen Sie diese Regeln zu Ihrer Firestore-Konfiguration hinzu:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Analytics-Sammlungen - nur für authentifizierte Benutzer
    match /analytics_pageViews/{document} {
      allow read, write: if request.auth != null;
    }
    match /analytics_sessions/{document} {
      allow read, write: if request.auth != null;
    }
    match /analytics_events/{document} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Verwendung

### 1. Tracking aktivieren

Das Analytics-Tracking wird automatisch aktiviert, wenn die `analytics-tracker.js` in Ihre Seiten eingebunden wird:

```html
<script src="js/analytics-tracker.js"></script>
```

### 2. Admin-Dashboard

1. Melden Sie sich als Super-Admin an
2. Öffnen Sie das Admin-Dashboard
3. Klicken Sie auf den "📊 Statistiken" Tab
4. Wählen Sie den gewünschten Zeitraum aus

### 3. Daten exportieren

- Verwenden Sie den "📊 Export" Button im Analytics-Dashboard
- Daten werden als JSON-Datei heruntergeladen

## Datenstruktur

### Seitenaufrufe (analytics_pageViews)

```javascript
{
  sessionId: string,
  pagePath: string,
  pageTitle: string,
  timestamp: Date,
  referrer: string,
  userAgent: string,
  screenResolution: string,
  viewportSize: string,
  language: string,
  timezone: string,
  isOnline: boolean,
  connectionType: object,
  deviceInfo: {
    isMobile: boolean,
    isTablet: boolean,
    isDesktop: boolean,
    browser: string,
    os: string,
    deviceType: string
  },
  location: {
    hasGeolocation: boolean,
    coordinates: object
  },
  utmParams: {
    utm_source: string,
    utm_medium: string,
    utm_campaign: string,
    utm_term: string,
    utm_content: string
  },
  userId: string,
  createdAt: Date
}
```

### Sessions (analytics_sessions)

```javascript
{
  sessionId: string,
  startTime: Date,
  endTime: Date,
  lastActivity: Date,
  duration: number,
  pageViewCount: number,
  userId: string,
  userAgent: string,
  referrer: string,
  deviceInfo: object,
  location: object,
  utmParams: object,
  isActive: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Events (analytics_events)

```javascript
{
  sessionId: string,
  eventName: string,
  eventValue: any,
  eventData: object,
  timestamp: Date,
  pagePath: string,
  userId: string,
  createdAt: Date
}
```

## API-Referenz

### AnalyticsTracker

```javascript
// Seitenaufruf erfassen
window.AnalyticsAPI.trackPageView(pagePath);

// Event erfassen
window.AnalyticsAPI.trackEvent(eventName, eventValue, eventData);

// Analytics-Daten abrufen
const data = await window.AnalyticsAPI.getAnalyticsData('7d');

// Daten verarbeiten
const stats = window.AnalyticsAPI.processAnalyticsData(data);
```

### AnalyticsDashboard

```javascript
// Dashboard initialisieren
await window.AnalyticsDashboardAPI.initializeDashboard('container-id');

// Dashboard rendern
window.AnalyticsDashboardAPI.renderDashboard('container-id');

// Daten exportieren
window.AnalyticsDashboardAPI.exportAnalyticsData();
```

## Konfiguration

### Zeiträume

- `1d` - Letzte 24 Stunden
- `7d` - Letzte 7 Tage
- `30d` - Letzte 30 Tage

### Tracking-Events

Das System erfasst automatisch:

- Seitenaufrufe
- Scroll-Tiefe
- Zeit auf Seite
- Online/Offline-Status
- Navigation zwischen Seiten

### Benutzerdefinierte Events

```javascript
// Event erfassen
window.AnalyticsAPI.trackEvent('button_click', 'login_button', {
  page: 'index.html',
  section: 'header'
});
```

## Datenschutz

- Alle Daten werden anonymisiert gespeichert
- Keine persönlichen Informationen werden erfasst
- IP-Adressen werden nicht gespeichert
- Standortdaten nur mit expliziter Erlaubnis

## Troubleshooting

### Häufige Probleme

1. **Analytics-Daten werden nicht angezeigt**
   - Überprüfen Sie die Firebase-Verbindung
   - Stellen Sie sicher, dass die Sicherheitsregeln korrekt sind
   - Prüfen Sie die Browser-Konsole auf Fehler

2. **Tracking funktioniert nicht**
   - Überprüfen Sie, ob `analytics-tracker.js` geladen wird
   - Stellen Sie sicher, dass Firebase initialisiert ist
   - Prüfen Sie die Netzwerk-Verbindung

3. **Admin-Dashboard zeigt keine Daten**
   - Überprüfen Sie die Super-Admin-Berechtigung
   - Stellen Sie sicher, dass Daten in den Firebase-Sammlungen vorhanden sind
   - Prüfen Sie die Firestore-Sicherheitsregeln

### Debug-Modus

Aktivieren Sie den Debug-Modus in der Browser-Konsole:

```javascript
localStorage.setItem('analytics-debug', 'true');
```

## Support

Bei Problemen oder Fragen:

1. Überprüfen Sie die Browser-Konsole auf Fehlermeldungen
2. Verwenden Sie das Setup-Tool (`setup-analytics.html`)
3. Überprüfen Sie die Firebase-Konfiguration
4. Kontaktieren Sie den System-Administrator

## Changelog

### Version 1.0.0
- Initiale Implementierung
- Seitenaufruf-Tracking
- Session-Tracking
- Event-Tracking
- Admin-Dashboard
- Export-Funktionalität