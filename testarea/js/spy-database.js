class SpyDatabasePage {
    constructor() {
        this.db = null;
        this.user = null;
        this.userData = null;
        this.alliance = null;
        this.branch = 'main';
        this.elements = {};
        this.unsubscribe = null;
        this.init();
    }

    async init() {
        await window.FirebaseConfig.waitForReady();
        await window.AuthAPI.waitForInit();
        this.db = window.FirebaseConfig.getDB();

        // Branch erkennen und speichern
        this.branch = this._detectBranch();

        window.AuthAPI.onAuthStateChange((user, userData) => {
            this.user = user;
            this.userData = userData;
            this.alliance = userData?.alliance || null;
            if (!user) {
                window.location.href = 'index.html';
                return;
            }
            this._setupUI();
            this._renderBranchBadge();
            this._startListening();
        });
    }

    _setupUI() {
        this.elements.urlInput = document.getElementById('report-url');
        this.elements.fetchBtn = document.getElementById('fetch-and-save-btn');
        this.elements.togglePaste = document.getElementById('toggle-paste');
        this.elements.pasteContainer = document.getElementById('raw-html-container');
        this.elements.rawTextarea = document.getElementById('raw-html');
        this.elements.parseBtn = document.getElementById('parse-and-save-btn');
        this.elements.status = document.getElementById('status-message');
        this.elements.tableBody = document.getElementById('reports-tbody');
        this.elements.branchBadge = document.getElementById('branch-badge');
        this.elements.playerOverviewLink = document.getElementById('player-overview-link');

        if (this.elements.fetchBtn) this.elements.fetchBtn.addEventListener('click', () => this.handleFetchAndSave());
        if (this.elements.togglePaste) this.elements.togglePaste.addEventListener('click', () => this._togglePaste());
        if (this.elements.parseBtn) this.elements.parseBtn.addEventListener('click', () => this.handleParseAndSave());
    }

    _renderBranchBadge() {
        if (!this.elements.branchBadge) return;
        const b = (this.branch || 'main').toLowerCase();
        this.elements.branchBadge.textContent = b.toUpperCase();
        this.elements.branchBadge.classList.remove('branch-main', 'branch-testarea');
        this.elements.branchBadge.classList.add(b === 'testarea' ? 'branch-testarea' : 'branch-main');
        
        // Update player overview link
        if (this.elements.playerOverviewLink) {
            this.elements.playerOverviewLink.href = `player-overview.html?branch=${encodeURIComponent(this.branch)}`;
        }
    }

    _detectBranch() {
        const params = new URLSearchParams(window.location.search);
        let b = params.get('branch') || null;
        if (!b) {
            // Erkenne testarea über Pfad (z. B. /testarea/ auf GitHub Pages)
            if (window.location.pathname.toLowerCase().includes('/testarea/')) {
                b = 'testarea';
            }
        }
        b = (b || sessionStorage.getItem('branch') || 'main').toLowerCase();
        sessionStorage.setItem('branch', b);
        return b;
    }

    _togglePaste() {
        const isHidden = this.elements.pasteContainer.style.display === 'none' || !this.elements.pasteContainer.style.display;
        this.elements.pasteContainer.style.display = isHidden ? 'block' : 'none';
    }

    async handleFetchAndSave() {
        const url = (this.elements.urlInput?.value || '').trim();
        if (!url) {
            this._setStatus('Bitte eine Bericht-URL eingeben', true);
            return;
        }

        // URL-Validierung
        if (!window.EnhancedSpyCrawler._isValidSpyReportUrl(url)) {
            this._setStatus('❌ Ungültige URL. Bitte eine gültige spacenations.eu Spionagebericht-URL eingeben (z.B. https://beta1.game.spacenations.eu/spy-report/...)', true);
            return;
        }

        try {
            this._setStatus('🔍 Crawling Spionagebericht...', false);
            const html = await this._fetchReportHTML(url);
            await this._parseAndStore(html, url);
            // Status wird in _parseAndStore gesetzt
            this.elements.urlInput.value = '';
        } catch (error) {
            const errorMsg = error?.message || error;
            if (errorMsg.includes('CORS') || errorMsg.includes('Alle')) {
                this._setStatus(`❌ ${errorMsg}`, true);
            } else {
                this._setStatus(`❌ Crawling fehlgeschlagen: ${errorMsg}`, true);
            }
        }
    }

    handleParseAndSave() {
        const html = (this.elements.rawTextarea?.value || '').trim();
        if (!html) {
            this._setStatus('Bitte HTML-Inhalt einfügen', true);
            return;
        }
        this._parseAndStore(html, (this.elements.urlInput?.value || '').trim() || null)
            .then(() => {
                // Status wird in _parseAndStore gesetzt
                this.elements.rawTextarea.value = '';
            })
            .catch(err => this._setStatus('Fehler beim Speichern: ' + (err?.message || err), true));
    }

    async _parseAndStore(html, sourceUrl) {
        const parseResult = window.SpyParser.parse(html);
        if (!parseResult.success) throw new Error(parseResult.error || 'Parser fehlgeschlagen');

        // Automatische Auswertung durchführen
        this._setStatus('Bericht wird ausgewertet...', false);
        const evaluationResult = window.SpyEvaluator.evaluate({ parsed: parseResult.data });
        
        const payload = {
            sourceUrl: sourceUrl || null,
            reportedAt: window.FirebaseConfig.getServerTimestamp(),
            reporterUid: this.user.uid,
            reporterUsername: this.userData?.username || null,
            alliance: this.alliance || null,
            branch: this.branch || 'main',
            rawHtml: html,
            parsed: parseResult.data,
            evaluation: evaluationResult.success ? evaluationResult.evaluation : null,
            evaluationError: evaluationResult.success ? null : evaluationResult.error
        };

        await this.db.collection('spyReports').add(payload);
        
        // Status mit Auswertungsinfo aktualisieren
        if (evaluationResult.success) {
            this._setStatus('Bericht gespeichert und ausgewertet ✅', false);
        } else {
            this._setStatus('Bericht gespeichert (Auswertung fehlgeschlagen: ' + evaluationResult.error + ')', true);
        }
    }

    async _fetchReportHTML(url) {
        // Verwende den garantierten Enhanced Crawler
        try {
            this._setStatus('🚀 Starte garantiertes Crawling mit 6 Methoden...', false);
            const result = await window.EnhancedSpyCrawler.guaranteedCrawl(url);
            
            this._setStatus(`✅ Erfolgreich mit ${result.method} in ${result.duration}ms geladen`, false);
            
            return result.html;
        } catch (error) {
            console.error('Enhanced Crawler fehlgeschlagen:', error);
            
            // Fallback zum normalen Crawler
            try {
                this._setStatus('⚠️ Fallback zu Standard-Crawler...', false);
                const fallbackResult = await window.SpyCrawler.crawlWithAlternatives(url);
                
                this._setStatus('✅ Erfolgreich mit Fallback-Methode geladen', false);
                return fallbackResult.html;
            } catch (fallbackError) {
                // Detaillierte Fehlermeldung mit Lösungsvorschlägen
                const errorMsg = this._generateUserFriendlyError(error.message, url);
                throw new Error(errorMsg);
            }
        }
    }

    _generateUserFriendlyError(errorMessage, url) {
        let userMsg = '❌ Automatisches Crawling fehlgeschlagen.\n\n';
        
        if (errorMessage.includes('CORS')) {
            userMsg += '🔒 Problem: CORS-Blockierung durch den Server\n';
            userMsg += '💡 Lösung: Nutze "HTML einfügen" und kopiere den Seiteninhalt manuell\n\n';
        } else if (errorMessage.includes('timeout') || errorMessage.includes('Timeout')) {
            userMsg += '⏱️ Problem: Server antwortet nicht rechtzeitig\n';
            userMsg += '💡 Lösung: Versuche es später erneut oder nutze "HTML einfügen"\n\n';
        } else if (errorMessage.includes('404') || errorMessage.includes('not found')) {
            userMsg += '🔍 Problem: Spionagebericht nicht gefunden\n';
            userMsg += '💡 Lösung: Prüfe die URL oder verwende einen aktuelleren Link\n\n';
        } else {
            userMsg += '🌐 Problem: Netzwerk- oder Server-Fehler\n';
            userMsg += '💡 Lösung: Prüfe deine Internetverbindung oder nutze "HTML einfügen"\n\n';
        }
        
        userMsg += '📋 So gehst du vor:\n';
        userMsg += '1. Klicke auf "HTML einfügen"\n';
        userMsg += '2. Öffne den Spionagebericht in einem neuen Tab\n';
        userMsg += '3. Markiere alles (Strg+A) und kopiere es (Strg+C)\n';
        userMsg += '4. Füge den Inhalt hier ein (Strg+V)\n';
        userMsg += '5. Klicke auf "Parsen & Speichern"\n\n';
        userMsg += `🔗 URL: ${url}`;
        
        return userMsg;
    }

    _startListening() {
        if (this.unsubscribe) this.unsubscribe();
        const baseQuery = this.alliance
            ? this.db.collection('spyReports').where('alliance', '==', this.alliance)
            : this.db.collection('spyReports').where('reporterUid', '==', this.user.uid);

        let query = baseQuery.where('branch', '==', this.branch || 'main');
        query = query.orderBy('reportedAt', 'desc').limit(100);

        this.unsubscribe = query.onSnapshot(snapshot => {
            const rows = [];
            snapshot.forEach(doc => {
                rows.push(this._renderRow(doc.id, doc.data()));
            });
            this.elements.tableBody.innerHTML = rows.join('');
        });
    }

    _renderRow(id, data) {
        const parsed = data.parsed || {};
        const coords = parsed.coords?.raw || '';
        const player = parsed.targetPlayer || '';
        const planet = parsed.planetName || '';
        const r = parsed.research || {};
        const evaluation = data.evaluation;
        
        // Auswertungs-Zelle erstellen
        let evaluationCell = '-';
        if (evaluation && evaluation.threat) {
            const threat = evaluation.threat;
            evaluationCell = `<div class="threat-badge" style="background-color: ${threat.color}20; color: ${threat.color}; border: 1px solid ${threat.color}; font-size: 0.8rem; padding: 2px 6px;">
                ${threat.label} (${threat.percentage}%)
            </div>`;
        } else if (data.evaluationError) {
            evaluationCell = '<span style="color: var(--danger-color, #ef4444); font-size: 0.8rem;">Fehler</span>';
        }
        
        return (
            `<tr>` +
				`<td>${this._escape(player)}</td>` +
				`<td>${this._escape(planet)} ${coords ? '(' + this._escape(coords) + ')' : ''}</td>` +
				`<td>${this._fmtNum(r.spionage)}</td>` +
				`<td>${this._fmtNum(r.tarn)}</td>` +
				`<td>${this._fmtNum(r.invasion)}</td>` +
				`<td>${this._fmtNum(r.pluender)}</td>` +
				`<td>${this._fmtNum(r.sabotage)}</td>` +
				`<td>${evaluationCell}</td>` +
				`<td><a class="report-link" href="spy-report.html?id=${encodeURIComponent(id)}&branch=${encodeURIComponent(this.branch)}">Bericht</a></td>` +
			`</tr>`
        );
    }

    _fmtNum(v) {
        if (v === null || v === undefined) return '-';
        return String(v);
    }

    _escape(str) {
        return String(str || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    _setStatus(msg, isError) {
        if (!this.elements.status) return;
        this.elements.status.textContent = msg;
        this.elements.status.style.color = isError ? 'var(--danger-color, #ef4444)' : 'var(--text-secondary)';
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.spyDatabasePage = new SpyDatabasePage();
});