// Serverless Function für garantiertes Crawling
// Kann auf Vercel, Netlify oder anderen Plattformen deployed werden

const https = require('https');
const http = require('http');
const { URL } = require('url');

// Hauptfunktion für Serverless Deployment
module.exports = async (req, res) => {
    // CORS Headers setzen
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // OPTIONS Request behandeln
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Nur GET und POST erlauben
    if (req.method !== 'GET' && req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    try {
        // URL aus Query Parameter oder Body extrahieren
        const targetUrl = req.method === 'GET' 
            ? req.query.url 
            : req.body?.url;

        if (!targetUrl) {
            res.status(400).json({ 
                error: 'URL parameter required',
                usage: 'GET /api/crawler?url=https://example.com or POST with {"url": "https://example.com"}'
            });
            return;
        }

        // URL validieren
        if (!isValidSpyReportUrl(targetUrl)) {
            res.status(400).json({ 
                error: 'Invalid URL. Only spacenations.eu spy-report URLs are allowed.',
                provided: targetUrl
            });
            return;
        }

        console.log('Crawling URL:', targetUrl);

        // Crawling durchführen
        const result = await crawlUrl(targetUrl);
        
        res.status(200).json({
            success: true,
            url: targetUrl,
            html: result.html,
            contentLength: result.html.length,
            method: result.method,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Crawling error:', error);
        
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
};

// URL-Validierung
function isValidSpyReportUrl(url) {
    try {
        const urlObj = new URL(url);
        return urlObj.hostname.includes('spacenations.eu') && 
               urlObj.pathname.includes('/spy-report/');
    } catch {
        return false;
    }
}

// Haupt-Crawling-Funktion
async function crawlUrl(targetUrl) {
    const methods = [
        () => directFetch(targetUrl),
        () => fetchWithUserAgent(targetUrl),
        () => fetchWithHeaders(targetUrl)
    ];

    let lastError;

    for (let i = 0; i < methods.length; i++) {
        try {
            const result = await methods[i]();
            if (result && result.length > 500) {
                return {
                    html: result,
                    method: `Method ${i + 1}`
                };
            }
        } catch (error) {
            console.warn(`Method ${i + 1} failed:`, error.message);
            lastError = error;
        }
    }

    throw new Error(`All crawling methods failed. Last error: ${lastError?.message}`);
}

// Direkter Fetch
function directFetch(url) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const client = urlObj.protocol === 'https:' ? https : http;

        const options = {
            hostname: urlObj.hostname,
            port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
            path: urlObj.pathname + urlObj.search,
            method: 'GET',
            timeout: 10000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        };

        const req = client.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(data);
                } else {
                    reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });

        req.end();
    });
}

// Fetch mit erweiterten User-Agent
function fetchWithUserAgent(url) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const client = urlObj.protocol === 'https:' ? https : http;

        const options = {
            hostname: urlObj.hostname,
            port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
            path: urlObj.pathname + urlObj.search,
            method: 'GET',
            timeout: 10000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'de-DE,de;q=0.9,en;q=0.8',
                'Accept-Encoding': 'identity', // Keine Kompression für einfacheres Handling
                'Connection': 'close'
            }
        };

        const req = client.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(data);
                } else {
                    reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });

        req.end();
    });
}

// Fetch mit vollständigen Browser-Headers
function fetchWithHeaders(url) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const client = urlObj.protocol === 'https:' ? https : http;

        const options = {
            hostname: urlObj.hostname,
            port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
            path: urlObj.pathname + urlObj.search,
            method: 'GET',
            timeout: 15000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7',
                'Accept-Encoding': 'identity',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Sec-Fetch-User': '?1',
                'Upgrade-Insecure-Requests': '1',
                'Connection': 'close'
            }
        };

        const req = client.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(data);
                } else if (res.statusCode >= 300 && res.statusCode < 400) {
                    // Handle redirects
                    const location = res.headers.location;
                    if (location) {
                        const redirectUrl = location.startsWith('http') ? location : new URL(location, url).toString();
                        fetchWithHeaders(redirectUrl)
                            .then(resolve)
                            .catch(reject);
                    } else {
                        reject(new Error(`Redirect without location: ${res.statusCode}`));
                    }
                } else {
                    reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });

        req.end();
    });
}

// Für lokale Tests
if (require.main === module) {
    const testUrl = 'https://beta1.game.spacenations.eu/spy-report/wywXudrjsP9ri09BwBIf';
    
    crawlUrl(testUrl)
        .then(result => {
            console.log('✅ Crawling erfolgreich');
            console.log('Method:', result.method);
            console.log('Content length:', result.html.length);
            console.log('First 200 chars:', result.html.substring(0, 200));
        })
        .catch(error => {
            console.error('❌ Crawling fehlgeschlagen:', error.message);
        });
}