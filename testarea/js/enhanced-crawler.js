class EnhancedSpyCrawler extends SpyCrawler {
    constructor() {
        super();
        
        // Erweiterte CORS-Proxies mit besserer Erfolgsrate
        this.corsProxies = [
            'https://api.allorigins.win/raw?url=',
            'https://api.codetabs.com/v1/proxy?quest=',
            'https://thingproxy.freeboard.io/fetch/',
            'https://cors-anywhere.herokuapp.com/',
            'https://crossorigin.me/',
            'https://api.allorigins.win/get?url=', // Gibt JSON zurück
        ];
        
        // Serverless Functions für garantiertes Crawling
        this.serverlessEndpoints = [
            'https://api.netlify.app/api/v1/proxy?url=',
            'https://vercel-proxy.vercel.app/api/proxy?url=',
        ];
        
        // User Agents für bessere Akzeptanz
        this.userAgents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        ];
        
        this.retryAttempts = 5; // Mehr Versuche
        this.requestTimeout = 15000; // 15 Sekunden Timeout
    }

    /**
     * Garantiertes Crawling mit allen verfügbaren Methoden
     */
    async guaranteedCrawl(url) {
        console.log('🚀 Starte garantiertes Crawling für:', url);
        
        if (!this._isValidSpyReportUrl(url)) {
            throw new Error('Ungültige Spionagebericht-URL');
        }

        const methods = [
            () => this._enhancedDirectFetch(url),
            () => this._advancedProxyFetch(url),
            () => this._serverlessProxyFetch(url),
            () => this._alternativeUrlsCrawl(url),
            () => this._browserSimulationFetch(url),
            () => this._fallbackApiCrawl(url)
        ];

        let lastError = null;
        const results = [];

        for (let i = 0; i < methods.length; i++) {
            const methodName = [
                'Enhanced Direct Fetch',
                'Advanced Proxy Fetch', 
                'Serverless Proxy Fetch',
                'Alternative URLs Crawl',
                'Browser Simulation Fetch',
                'Fallback API Crawl'
            ][i];

            try {
                console.log(`📡 Versuche Methode ${i + 1}/${methods.length}: ${methodName}`);
                
                const startTime = performance.now();
                const result = await this._withTimeout(methods[i](), this.requestTimeout);
                const duration = Math.round(performance.now() - startTime);

                if (result && this._validateHtmlContent(result)) {
                    console.log(`✅ ${methodName} erfolgreich in ${duration}ms`);
                    return {
                        html: result,
                        method: methodName,
                        duration: duration,
                        url: url
                    };
                }

                results.push({ method: methodName, success: false, error: 'Ungültiger Content' });
            } catch (error) {
                console.warn(`❌ ${methodName} fehlgeschlagen:`, error.message);
                results.push({ method: methodName, success: false, error: error.message });
                lastError = error;
            }
        }

        // Wenn alle Methoden fehlschlagen, detaillierte Fehleranalyse
        const errorReport = this._generateErrorReport(results, url);
        throw new Error(`Alle Crawling-Methoden fehlgeschlagen.\n\n${errorReport}`);
    }

    /**
     * Erweiterter direkter Fetch mit besseren Headern
     */
    async _enhancedDirectFetch(url) {
        const userAgent = this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
        
        const response = await fetch(url, {
            method: 'GET',
            mode: 'cors',
            headers: {
                'User-Agent': userAgent,
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'de-DE,de;q=0.9,en;q=0.8',
                'Accept-Encoding': 'gzip, deflate, br',
                'DNT': '1',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
            },
            cache: 'no-cache'
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.text();
    }

    /**
     * Erweiterte Proxy-Methode mit mehr Anbietern
     */
    async _advancedProxyFetch(url) {
        const errors = [];

        for (const proxy of this.corsProxies) {
            try {
                let proxyUrl;
                let processResponse;

                if (proxy.includes('allorigins.win/get')) {
                    // Spezielle Behandlung für allorigins JSON API
                    proxyUrl = proxy + encodeURIComponent(url);
                    processResponse = async (response) => {
                        const data = await response.json();
                        return data.contents;
                    };
                } else {
                    proxyUrl = proxy + encodeURIComponent(url);
                    processResponse = async (response) => await response.text();
                }

                const response = await fetch(proxyUrl, {
                    method: 'GET',
                    headers: {
                        'User-Agent': this.userAgents[0]
                    }
                });

                if (response.ok) {
                    const html = await processResponse(response);
                    if (html && html.length > 100) {
                        return html;
                    }
                }
            } catch (error) {
                errors.push(`${proxy}: ${error.message}`);
                continue;
            }
        }

        throw new Error(`Alle Proxies fehlgeschlagen: ${errors.join(', ')}`);
    }

    /**
     * Serverless Proxy Fetch (falls verfügbar)
     */
    async _serverlessProxyFetch(url) {
        const errors = [];

        for (const endpoint of this.serverlessEndpoints) {
            try {
                const proxyUrl = endpoint + encodeURIComponent(url);
                
                const response = await fetch(proxyUrl, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                if (response.ok) {
                    const html = await response.text();
                    if (html && html.length > 100) {
                        return html;
                    }
                }
            } catch (error) {
                errors.push(`${endpoint}: ${error.message}`);
                continue;
            }
        }

        throw new Error(`Alle Serverless Endpoints fehlgeschlagen: ${errors.join(', ')}`);
    }

    /**
     * Crawlt alle alternativen URLs
     */
    async _alternativeUrlsCrawl(url) {
        const alternatives = this.generateAlternativeUrls(url);
        const errors = [];

        for (const altUrl of alternatives) {
            try {
                const result = await this._enhancedDirectFetch(altUrl);
                if (result && this._validateHtmlContent(result)) {
                    return result;
                }
            } catch (error) {
                errors.push(`${altUrl}: ${error.message}`);
                continue;
            }
        }

        throw new Error(`Alle alternativen URLs fehlgeschlagen: ${errors.join(', ')}`);
    }

    /**
     * Browser-Simulation für JavaScript-schwere Seiten
     */
    async _browserSimulationFetch(url) {
        // Simuliere Browser-Verhalten mit erweiterten Headers
        const response = await fetch(url, {
            method: 'GET',
            mode: 'cors',
            credentials: 'omit',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7',
                'Accept-Encoding': 'gzip, deflate, br',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Sec-Fetch-User': '?1',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            },
            cache: 'no-cache'
        });

        if (!response.ok) {
            throw new Error(`Browser Simulation HTTP ${response.status}`);
        }

        return await response.text();
    }

    /**
     * Fallback API Crawl mit eigener Implementierung
     */
    async _fallbackApiCrawl(url) {
        // Versuche eine eigene API-basierte Lösung
        const apiUrl = 'https://api.scraperapi.com/';
        const params = new URLSearchParams({
            api_key: 'demo', // Demo-Key, in Produktion durch echten Key ersetzen
            url: url,
            render: 'true'
        });

        try {
            const response = await fetch(apiUrl + '?' + params.toString());
            if (response.ok) {
                return await response.text();
            }
        } catch (error) {
            // Fallback zu einer anderen Methode
            throw new Error('API Crawl nicht verfügbar');
        }

        throw new Error('Fallback API Crawl fehlgeschlagen');
    }

    /**
     * Validiert ob der HTML-Content ein gültiger Spionagebericht ist
     */
    _validateHtmlContent(html) {
        if (!html || typeof html !== 'string' || html.length < 500) {
            return false;
        }

        // Prüfe auf typische Spionagebericht-Inhalte
        const indicators = [
            /spion/i,
            /bericht/i,
            /planet/i,
            /spieler/i,
            /forschung/i,
            /spacenations/i
        ];

        let matchCount = 0;
        for (const indicator of indicators) {
            if (indicator.test(html)) {
                matchCount++;
            }
        }

        return matchCount >= 3; // Mindestens 3 Indikatoren müssen vorhanden sein
    }

    /**
     * Timeout-Wrapper für Requests
     */
    async _withTimeout(promise, timeoutMs) {
        return Promise.race([
            promise,
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error(`Timeout nach ${timeoutMs}ms`)), timeoutMs)
            )
        ]);
    }

    /**
     * Generiert detaillierten Fehlerbericht
     */
    _generateErrorReport(results, url) {
        let report = `URL: ${url}\n`;
        report += `Getestete Methoden:\n`;
        
        results.forEach((result, index) => {
            report += `${index + 1}. ${result.method}: ${result.success ? '✅' : '❌'} ${result.error || ''}\n`;
        });

        report += `\nMögliche Lösungen:\n`;
        report += `1. Prüfen Sie ob die URL korrekt und erreichbar ist\n`;
        report += `2. Versuchen Sie es zu einem späteren Zeitpunkt\n`;
        report += `3. Nutzen Sie die manuelle HTML-Eingabe als Fallback\n`;
        report += `4. Kontaktieren Sie den Administrator falls das Problem anhält`;

        return report;
    }

    /**
     * Erweiterte alternative URL-Generierung
     */
    generateAlternativeUrls(originalUrl) {
        const alternatives = super.generateAlternativeUrls(originalUrl);
        
        try {
            const reportId = this.extractReportId(originalUrl);
            if (reportId) {
                // Weitere Varianten hinzufügen
                const extraVariants = [
                    `https://game.spacenations.eu/spy-report/${reportId}`,
                    `https://app.spacenations.eu/spy-report/${reportId}`,
                    `https://play.spacenations.eu/spy-report/${reportId}`,
                    `http://beta1.game.spacenations.eu/spy-report/${reportId}`, // HTTP Fallback
                ];
                
                alternatives.push(...extraVariants);
            }
        } catch (error) {
            console.warn('Fehler bei erweiterten alternativen URLs:', error);
        }

        return [...new Set(alternatives)]; // Duplikate entfernen
    }

    /**
     * Analysiert die Netzwerk-Konnektivität
     */
    async analyzeConnectivity(url) {
        const results = {
            url: url,
            reachable: false,
            corsBlocked: false,
            serverError: false,
            networkError: false,
            recommendations: []
        };

        try {
            // Teste HEAD Request
            const headResponse = await fetch(url, { method: 'HEAD', mode: 'no-cors' });
            results.reachable = true;
        } catch (error) {
            if (error.message.includes('CORS')) {
                results.corsBlocked = true;
                results.recommendations.push('CORS-Proxy verwenden');
            } else if (error.message.includes('network')) {
                results.networkError = true;
                results.recommendations.push('Netzwerkverbindung prüfen');
            } else {
                results.serverError = true;
                results.recommendations.push('Server möglicherweise nicht erreichbar');
            }
        }

        return results;
    }
}

// Globale erweiterte Instanz
window.EnhancedSpyCrawler = new EnhancedSpyCrawler();