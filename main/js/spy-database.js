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

        if (this.elements.fetchBtn) this.elements.fetchBtn.addEventListener('click', () => this.handleFetchAndSave());
        if (this.elements.togglePaste) this.elements.togglePaste.addEventListener('click', () => this._togglePaste());
        if (this.elements.parseBtn) this.elements.parseBtn.addEventListener('click', () => this.handleParseAndSave());
    }

    _renderBranchBadge() {
        if (!this.elements.branchBadge) return;
        const b = 'main';
        this.elements.branchBadge.textContent = 'MAIN';
        this.elements.branchBadge.classList.remove('branch-main', 'branch-testarea');
        this.elements.branchBadge.classList.add('branch-main');
    }

    _detectBranch() {
        sessionStorage.setItem('branch', 'main');
        return 'main';
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
        try {
            this._setStatus('Bericht wird geladen...', false);
            const html = await this._fetchReportHTML(url);
            await this._parseAndStore(html, url);
            this._setStatus('Bericht gespeichert', false);
            this.elements.urlInput.value = '';
        } catch (error) {
            this._setStatus('Fehler beim Laden. Nutze ggf. "HTML einfügen". (' + (error?.message || error) + ')', true);
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
                this._setStatus('Bericht gespeichert', false);
                this.elements.rawTextarea.value = '';
            })
            .catch(err => this._setStatus('Fehler beim Speichern: ' + (err?.message || err), true));
    }

    async _parseAndStore(html, sourceUrl) {
        const parseResult = window.SpyParser.parse(html);
        if (!parseResult.success) throw new Error(parseResult.error || 'Parser fehlgeschlagen');

        const payload = {
            sourceUrl: sourceUrl || null,
            reportedAt: window.FirebaseConfig.getServerTimestamp(),
            reporterUid: this.user.uid,
            reporterUsername: this.userData?.username || null,
            alliance: this.alliance || null,
            branch: this.branch || 'main',
            rawHtml: html,
            parsed: parseResult.data
        };

        await this.db.collection('spyReports').add(payload);
    }

    async _fetchReportHTML(url) {
        // Direkter Fetch kann an CORS scheitern; wir versuchen es und lassen sonst den manuellen Weg zu
        const response = await fetch(url, { method: 'GET', mode: 'cors' });
        if (!response.ok) throw new Error('HTTP ' + response.status);
        return await response.text();
    }

    _startListening() {
        if (this.unsubscribe) this.unsubscribe();
        const baseQuery = this.alliance
            ? this.db.collection('spyReports').where('alliance', '==', this.alliance)
            : this.db.collection('spyReports').where('reporterUid', '==', this.user.uid);

        let query = baseQuery.where('branch', '==', 'main');
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
        return (
            `<tr>` +
				`<td>${this._escape(player)}</td>` +
				`<td>${this._escape(planet)} ${coords ? '(' + this._escape(coords) + ')' : ''}</td>` +
				`<td>${this._fmtNum(r.spionage)}</td>` +
				`<td>${this._fmtNum(r.tarn)}</td>` +
				`<td>${this._fmtNum(r.invasion)}</td>` +
				`<td>${this._fmtNum(r.pluender)}</td>` +
				`<td>${this._fmtNum(r.sabotage)}</td>` +
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