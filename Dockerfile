# Verwende Python 3.11 als Base Image
FROM python:3.11-slim

# Arbeitsverzeichnis setzen
WORKDIR /app

# Alle Dateien kopieren
COPY . .

# Port freigeben (Railway setzt PORT automatisch)
EXPOSE 8000

# Python HTTP Server starten
CMD ["python", "-m", "http.server", "8000"]