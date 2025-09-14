# 🚀 Spacenations Tools - Railway Deployment

**Live Application:** [https://your-app.railway.app](https://your-app.railway.app)

## 🌟 Über das Projekt

Ein umfassendes **Tool-System** für Space Nations Spieler mit Allianz-Management, Proxima-System, Kampf-Tools und erweiterten Analytics.

## 🚀 Live Deployment

Diese Anwendung wird über **Railway** gehostet und deployed:

- **URL:** [https://your-app.railway.app](https://your-app.railway.app)
- **Status:** ✅ Online
- **Provider:** Railway
- **Backend:** Python + Firebase
- **Frontend:** HTML/CSS/JavaScript

## 🔧 Technische Details

### Backend-Infrastruktur
- **Python 3.9** Server
- **Firebase** Authentifizierung
- **Proxima-System** mit automatischer Datensynchronisation
- **API-Endpunkte** für Health Checks
- **Session-Management**

### Frontend
- **Responsive Design** für alle Geräte
- **Dark/Light Mode** Support
- **Moderne UI** mit Razer-Design
- **Real-time Updates**

## 📋 Hauptfunktionen

### 🛠️ **Kampf & Strategie-Tools**
- **AS Counter**: Automatische Angriffsstärke-Berechnung
- **Battle Counter**: Kampf-Vorhersage und Schadensberechnung
- **Raid Counter**: Überfall-Planung und Ressourcen-Berechnung
- **Sabo Counter**: Sabotage-Planung und Gebäude-Schäden

### 🌌 **Proxima-System**
- **Automatisierte Datenerfassung**: Wöchentliche API-Synchronisation
- **Proxima-Planeten-Tracking**: Vollständige Übersicht aller Proxima-Planeten
- **Score-Kategorisierung**: Intelligente Einteilung nach Bedrohungsstufen
- **SQLite-Datenbank**: Lokale Speicherung mit historischen Daten

### 👥 **Allianz-Management-System**
- **Vollständiges Allianz-System**: Erstellung, Verwaltung und Chat
- **Mitgliederverwaltung**: Einladungen, Berechtigungen und Rollen
- **Chat-System**: Echtzeit-Kommunikation mit Nachrichtenverwaltung
- **Berechtigungen**: Granulare Kontrolle über Allianz-Features

### 🔐 **User Session System**
- **Vollständige Authentifizierung**: Login, Logout, Registrierung
- **Session-Management**: 30-Minuten Timeout mit Activity-Tracking
- **Dashboard-System**: Intelligente Weiterleitungen und User-Interface
- **Berechtigungen**: Super-Admin und Alliance-Admin Rollen

## 🚀 Deployment-Informationen

### Railway-Konfiguration
- **Builder:** Dockerfile
- **Runtime:** Python 3.9
- **Port:** 8000
- **Health Check:** `/api/health`

### Umgebungsvariablen
```env
FIREBASE_API_KEY=your-firebase-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your-sender-id
FIREBASE_APP_ID=your-app-id
```

## 🔄 Continuous Deployment

Das Projekt wird automatisch über Railway deployed:

1. **Code Push** → GitHub Repository
2. **Automatisches Build** → Railway erkennt Änderungen
3. **Docker Build** → Python-Container wird erstellt
4. **Deployment** → Neue Version wird live geschaltet
5. **Health Check** → Automatische Überprüfung

## 📊 Monitoring

### Health Checks
- **Endpoint:** `GET /api/health`
- **Status:** `{"status": "healthy"}`
- **Interval:** 30 Sekunden

### Logs
- **Railway Dashboard** → Logs anzeigen
- **Real-time Monitoring** → Live-Logs verfolgen
- **Error Tracking** → Automatische Fehlerbehandlung

## 🛠️ Lokale Entwicklung

### Voraussetzungen
- Python 3.9+
- Firebase-Projekt
- Git

### Installation
```bash
# Repository klonen
git clone https://github.com/Trend4Media/Spacenations-Tools.git
cd Spacenations-Tools

# Dependencies installieren
pip install -r requirements.txt

# Lokal starten
python app.py
```

### Entwicklung
```bash
# Server starten
python app.py

# Health Check testen
curl http://localhost:8000/api/health

# Anwendung öffnen
open http://localhost:8000
```

## 🔧 Konfiguration

### Firebase Setup
1. Firebase-Projekt erstellen
2. Authentifizierung aktivieren
3. Umgebungsvariablen in Railway setzen

### Railway Setup
1. Railway Account erstellen
2. GitHub Repository verbinden
3. Umgebungsvariablen konfigurieren
4. Domain einrichten (optional)

## 📞 Support

### Railway-Support
- **Dashboard:** [railway.app](https://railway.app)
- **Documentation:** [docs.railway.app](https://docs.railway.app)
- **Discord:** [discord.gg/railway](https://discord.gg/railway)

### Projekt-Support
- **GitHub Issues:** [Issues](https://github.com/Trend4Media/Spacenations-Tools/issues)
- **Documentation:** Siehe `RAILWAY_DEPLOYMENT_ULTIMATE.md`

## 🎯 Roadmap

### ✅ **Abgeschlossen**
- [x] Railway-Deployment konfiguriert
- [x] Python-Backend implementiert
- [x] Firebase-Integration
- [x] Proxima-System
- [x] Allianz-Management

### 🚧 **In Entwicklung**
- [ ] Custom Domain
- [ ] Erweiterte Analytics
- [ ] Performance-Optimierung

### 🔮 **Geplant**
- [ ] Mobile App
- [ ] Push-Notifications
- [ ] Multi-Language Support

## 📄 Lizenz

**MIT License** - Siehe [LICENSE](LICENSE) für Details.

---

**Entwickelt mit ❤️ für die Space Nations Community**

**Live auf Railway:** [https://your-app.railway.app](https://your-app.railway.app) 🚀