class SpyCrawler {
    constructor() {
        this.corsProxies = [
            'https://api.allorigins.win/raw?url=',
            'https://cors-anywhere.herokuapp.com/',
            'https://thingproxy.freeboard.io/fetch/',
            'https://api.codetabs.com/v1/proxy?quest='
        ];
        this.retryAttempts = 3;
        this.retryDelay = 1000; // 1 Sekunde
    }

    /**
     * Crawlt einen Spionagebericht von der angegebenen URL
     * @param {string} url - Die URL des Spionageberichts
     * @returns {Promise<string>} - Der HTML-Inhalt des Berichts
     */
    async crawlSpyReport(url) {
        if (!this._isValidSpyReportUrl(url)) {
            throw new Error('Ungültige Spionagebericht-URL. Nur spacenations.eu URLs werden unterstützt.');
        }

        console.log('Crawling Spionagebericht:', url);

        // Versuche verschiedene Methoden
        const methods = [
            () => this._directFetch(url),
            () => this._corsProxyFetch(url),
            () => this._fallbackFetch(url)
        ];

        let lastError = null;

        for (const method of methods) {
            try {
                const result = await this._retryWithBackoff(method);
                if (result && result.length > 100) { // Mindestlänge für gültigen HTML-Content
                    console.log('Crawling erfolgreich mit Methode:', method.name);
                    return result;
                }
            } catch (error) {
                console.warn('Crawling-Methode fehlgeschlagen:', method.name, error.message);
                lastError = error;
                continue;
            }
        }

        throw new Error(`Alle Crawling-Methoden fehlgeschlagen. Letzter Fehler: ${lastError?.message || 'Unbekannter Fehler'}`);
    }

    /**
     * Direkter Fetch-Versuch (funktioniert meist nicht wegen CORS)
     */
    async _directFetch(url) {
        console.log('Versuche direkten Fetch...');
        const response = await fetch(url, {
            method: 'GET',
            mode: 'cors',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.text();
    }

    /**
     * Versucht verschiedene CORS-Proxies
     */
    async _corsProxyFetch(url) {
        console.log('Versuche CORS-Proxy Fetch...');
        
        for (const proxy of this.corsProxies) {
            try {
                console.log(`Versuche Proxy: ${proxy}`);
                const proxyUrl = proxy + encodeURIComponent(url);
                
                const response = await fetch(proxyUrl, {
                    method: 'GET',
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                });

                if (response.ok) {
                    const html = await response.text();
                    if (html && html.length > 100) {
                        console.log(`Proxy erfolgreich: ${proxy}`);
                        return html;
                    }
                }
            } catch (error) {
                console.warn(`Proxy ${proxy} fehlgeschlagen:`, error.message);
                continue;
            }
        }

        throw new Error('Alle CORS-Proxies fehlgeschlagen');
    }

    /**
     * Fallback-Methode mit alternativen Ansätzen
     */
    async _fallbackFetch(url) {
        console.log('Versuche Fallback-Fetch...');
        
        // Versuche mit verschiedenen Fetch-Optionen
        const fetchOptions = [
            {
                method: 'GET',
                mode: 'no-cors',
                cache: 'no-cache'
            },
            {
                method: 'GET',
                mode: 'cors',
                credentials: 'omit',
                cache: 'no-cache'
            }
        ];

        for (const options of fetchOptions) {
            try {
                const response = await fetch(url, options);
                
                // Bei no-cors können wir den Text nicht lesen, aber wir können prüfen ob die Response ok ist
                if (options.mode === 'no-cors') {
                    if (response.type === 'opaque') {
                        // Fallback: Benutzer muss manuell kopieren
                        throw new Error('CORS_BLOCKED');
                    }
                } else if (response.ok) {
                    return await response.text();
                }
            } catch (error) {
                if (error.message === 'CORS_BLOCKED') {
                    throw error;
                }
                continue;
            }
        }

        throw new Error('Alle Fallback-Methoden fehlgeschlagen');
    }

    /**
     * Retry-Mechanismus mit exponential backoff
     */
    async _retryWithBackoff(asyncFunction) {
        let lastError = null;
        
        for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
            try {
                return await asyncFunction();
            } catch (error) {
                lastError = error;
                
                if (attempt === this.retryAttempts) {
                    throw error;
                }

                // Exponential backoff
                const delay = this.retryDelay * Math.pow(2, attempt - 1);
                console.log(`Versuch ${attempt} fehlgeschlagen, retry in ${delay}ms...`);
                await this._sleep(delay);
            }
        }

        throw lastError;
    }

    /**
     * Validiert ob die URL ein gültiger Spionagebericht ist
     */
    _isValidSpyReportUrl(url) {
        if (!url || typeof url !== 'string') {
            return false;
        }

        try {
            const urlObj = new URL(url);
            
            // Prüfe Domain
            if (!urlObj.hostname.includes('spacenations.eu')) {
                return false;
            }

            // Prüfe Pfad
            if (!urlObj.pathname.includes('/spy-report/')) {
                return false;
            }

            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Sleep-Funktion für Delays
     */
    _sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Extrahiert die Bericht-ID aus der URL
     */
    extractReportId(url) {
        try {
            const urlObj = new URL(url);
            const pathParts = urlObj.pathname.split('/');
            const spyReportIndex = pathParts.findIndex(part => part === 'spy-report');
            
            if (spyReportIndex !== -1 && pathParts[spyReportIndex + 1]) {
                return pathParts[spyReportIndex + 1];
            }
        } catch (error) {
            console.warn('Fehler beim Extrahieren der Bericht-ID:', error);
        }
        
        return null;
    }

    /**
     * Generiert alternative URLs für den Fall, dass die Original-URL nicht funktioniert
     */
    generateAlternativeUrls(originalUrl) {
        const alternatives = [];
        
        try {
            const urlObj = new URL(originalUrl);
            const reportId = this.extractReportId(originalUrl);
            
            if (reportId) {
                // Verschiedene Subdomain-Varianten
                const subdomains = ['beta1', 'beta2', 'www', ''];
                const domains = ['spacenations.eu', 'game.spacenations.eu'];
                
                for (const subdomain of subdomains) {
                    for (const domain of domains) {
                        const hostname = subdomain ? `${subdomain}.${domain}` : domain;
                        const altUrl = `https://${hostname}/spy-report/${reportId}`;
                        
                        if (altUrl !== originalUrl) {
                            alternatives.push(altUrl);
                        }
                    }
                }
            }
        } catch (error) {
            console.warn('Fehler beim Generieren alternativer URLs:', error);
        }
        
        return alternatives;
    }

    /**
     * Erweiterte Crawling-Methode mit alternativen URLs
     */
    async crawlWithAlternatives(originalUrl) {
        const urlsToTry = [originalUrl, ...this.generateAlternativeUrls(originalUrl)];
        let lastError = null;

        for (const url of urlsToTry) {
            try {
                console.log(`Versuche URL: ${url}`);
                const result = await this.crawlSpyReport(url);
                
                if (result) {
                    console.log(`Erfolgreich mit URL: ${url}`);
                    return { html: result, usedUrl: url };
                }
            } catch (error) {
                console.warn(`URL ${url} fehlgeschlagen:`, error.message);
                lastError = error;
                continue;
            }
        }

        throw new Error(`Alle URLs fehlgeschlagen. Letzter Fehler: ${lastError?.message || 'Unbekannter Fehler'}`);
    }

    /**
     * Prüft ob eine URL erreichbar ist (HEAD-Request)
     */
    async checkUrlAvailability(url) {
        try {
            const response = await fetch(url, {
                method: 'HEAD',
                mode: 'cors'
            });
            
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    /**
     * Analysiert die Crawling-Erfolgsrate für Debugging
     */
    async analyzeCrawlingSuccess(urls) {
        const results = {
            total: urls.length,
            successful: 0,
            failed: 0,
            methods: {
                direct: 0,
                proxy: 0,
                fallback: 0
            },
            errors: []
        };

        for (const url of urls) {
            try {
                await this.crawlSpyReport(url);
                results.successful++;
            } catch (error) {
                results.failed++;
                results.errors.push({ url, error: error.message });
            }
        }

        results.successRate = (results.successful / results.total) * 100;
        
        return results;
    }
}

// Globale Instanz erstellen
window.SpyCrawler = new SpyCrawler();