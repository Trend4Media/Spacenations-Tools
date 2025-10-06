#!/usr/bin/env python3
"""
Spacenations Tools - Railway Deployment Server
Hauptserver für die Space Nations Tools Web-Anwendung
Version: 1.0.1 - ProximaDB Fallback Update
"""

import os
import sys
import json
import logging
from http.server import HTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import threading
import time
from datetime import datetime

# Logging konfigurieren
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class SpacenationsRequestHandler(SimpleHTTPRequestHandler):
    """Custom Request Handler für Space Nations Tools"""
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=os.getcwd(), **kwargs)
    
    def do_GET(self):
        """GET Request Handler"""
        try:
            # Parse URL
            parsed_path = urlparse(self.path)
            path = parsed_path.path
            
            # Root path -> index.html
            if path == '/' or path == '':
                self.serve_file('index.html')
                return
            
            # API Endpoints
            if path.startswith('/api/'):
                self.handle_api_request(path, parsed_path.query)
                return
            
            # Static files
            if self.serve_static_file(path):
                return
            
            # Fallback zu index.html für SPA-Routing
            if not path.startswith('/assets/') and not path.startswith('/css/') and not path.startswith('/js/'):
                self.serve_file('index.html')
                return
                
        except Exception as e:
            logger.error(f"Error handling GET request: {e}")
            self.send_error(500, f"Internal Server Error: {str(e)}")
    
    def do_POST(self):
        """POST Request Handler"""
        try:
            parsed_path = urlparse(self.path)
            path = parsed_path.path
            
            if path.startswith('/api/'):
                self.handle_api_post(path)
                return
            
            self.send_error(404, "Not Found")
            
        except Exception as e:
            logger.error(f"Error handling POST request: {e}")
            self.send_error(500, f"Internal Server Error: {str(e)}")
    
    def serve_file(self, filename):
        """Serve a specific file"""
        try:
            if os.path.exists(filename):
                with open(filename, 'rb') as f:
                    content = f.read()
                
                # Set appropriate content type
                if filename.endswith('.html'):
                    self.send_response(200)
                    self.send_header('Content-Type', 'text/html; charset=utf-8')
                elif filename.endswith('.css'):
                    self.send_response(200)
                    self.send_header('Content-Type', 'text/css')
                elif filename.endswith('.js'):
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/javascript')
                elif filename.endswith('.json'):
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/json')
                else:
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/octet-stream')
                
                self.send_header('Content-Length', str(len(content)))
                self.end_headers()
                self.wfile.write(content)
                return True
            else:
                self.send_error(404, "File not found")
                return False
                
        except Exception as e:
            logger.error(f"Error serving file {filename}: {e}")
            self.send_error(500, f"Error serving file: {str(e)}")
            return False
    
    def serve_static_file(self, path):
        """Serve static files from various directories"""
        # Remove leading slash
        if path.startswith('/'):
            path = path[1:]
        
        # Check if file exists
        if os.path.exists(path):
            return self.serve_file(path)
        
        # Check common static directories
        static_dirs = ['css', 'js', 'assets', 'images']
        for static_dir in static_dirs:
            if path.startswith(static_dir + '/'):
                return self.serve_file(path)
        
        return False
    
    def handle_api_request(self, path, query_string):
        """Handle API requests"""
        try:
            if path == '/api/health':
                self.handle_health_check()
            elif path == '/api/status':
                self.handle_status_check()
            elif path == '/api/firebase-config':
                self.handle_firebase_config()
            else:
                self.send_error(404, "API endpoint not found")
                
        except Exception as e:
            logger.error(f"Error handling API request {path}: {e}")
            self.send_error(500, f"API Error: {str(e)}")
    
    def handle_api_post(self, path):
        """Handle API POST requests"""
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            
            if path == '/api/proxima/sync':
                self.handle_proxima_sync(post_data)
            else:
                self.send_error(404, "API endpoint not found")
                
        except Exception as e:
            logger.error(f"Error handling API POST {path}: {e}")
            self.send_error(500, f"API Error: {str(e)}")
    
    def handle_health_check(self):
        """Health check endpoint"""
        health_data = {
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "service": "spacenations-tools",
            "version": "1.0.0"
        }
        
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(health_data).encode())
    
    def handle_status_check(self):
        """Status check endpoint"""
        status_data = {
            "service": "spacenations-tools",
            "status": "running",
            "uptime": time.time() - start_time,
            "environment": os.getenv('RAILWAY_ENVIRONMENT', 'development'),
            "port": os.getenv('PORT', '8000')
        }
        
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(status_data).encode())
    
    def handle_firebase_config(self):
        """Firebase configuration endpoint"""
        firebase_config = {
            "apiKey": os.getenv('FIREBASE_API_KEY', 'AIzaSyDr4-ap_EubUn0UdP7hkEpS2jkzLIVgvyc'),
            "authDomain": os.getenv('FIREBASE_AUTH_DOMAIN', 'spacenations-tools.firebaseapp.com'),
            "projectId": os.getenv('FIREBASE_PROJECT_ID', 'spacenations-tools'),
            "storageBucket": os.getenv('FIREBASE_STORAGE_BUCKET', 'spacenations-tools.firebasestorage.app'),
            "messagingSenderId": os.getenv('FIREBASE_MESSAGING_SENDER_ID', '651338201276'),
            "appId": os.getenv('FIREBASE_APP_ID', '1:651338201276:web:89e7d9c19dbd2611d3f8b9'),
            "measurementId": "G-SKWJWH2ERX"
        }
        
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(firebase_config).encode())
    
    def handle_proxima_sync(self, post_data):
        """Handle Proxima sync requests"""
        try:
            # Placeholder for Proxima sync logic
            response_data = {
                "success": True,
                "message": "Proxima sync initiated",
                "timestamp": datetime.now().isoformat()
            }
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(response_data).encode())
            
        except Exception as e:
            logger.error(f"Error in Proxima sync: {e}")
            error_response = {
                "success": False,
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }
            
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(error_response).encode())
    
    def log_message(self, format, *args):
        """Custom log message format"""
        logger.info(f"{self.address_string()} - {format % args}")

def start_proxima_scheduler():
    """Start Proxima data scheduler in background thread"""
    def scheduler():
        while True:
            try:
                # Import and run Proxima fetcher
                try:
                    from proxima_fetcher import ProximaFetcher
                    fetcher = ProximaFetcher()
                    fetcher.run_sync()
                    logger.info("Proxima sync completed successfully")
                except ImportError:
                    logger.warning("Proxima fetcher not available")
                except Exception as e:
                    logger.error(f"Proxima sync error: {e}")
                
                time.sleep(3600)  # Run every hour
            except Exception as e:
                logger.error(f"Proxima scheduler error: {e}")
                time.sleep(60)  # Wait 1 minute on error
    
    thread = threading.Thread(target=scheduler, daemon=True)
    thread.start()
    logger.info("Proxima scheduler started")

def main():
    """Main application entry point"""
    global start_time
    start_time = time.time()
    
    # Get port from environment (Railway sets this)
    port = int(os.getenv('PORT', 8000))
    
    # Create server
    server_address = ('', port)
    httpd = HTTPServer(server_address, SpacenationsRequestHandler)
    
    # Start Proxima scheduler
    start_proxima_scheduler()
    
    logger.info(f"🚀 Spacenations Tools Server starting on port {port}")
    logger.info(f"🌍 Environment: {os.getenv('RAILWAY_ENVIRONMENT', 'development')}")
    logger.info(f"📁 Working directory: {os.getcwd()}")
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        logger.info("🛑 Server shutting down...")
        httpd.shutdown()
    except Exception as e:
        logger.error(f"❌ Server error: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()