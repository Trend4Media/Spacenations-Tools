class SpyReportPage {
    constructor() {
        this.db = null;
        this.user = null;
        this.userData = null;
        this.branch = 'main';
        this.init();
    }

    async init() {
        await window.FirebaseConfig.waitForReady();
        await window.AuthAPI.waitForInit();
        this.db = window.FirebaseConfig.getDB();

        // Branch erkennen
        this.branch = this._detectBranch();

        window.AuthAPI.onAuthStateChange(async (user) => {
            this.user = user;
            if (!user) {
                window.location.href = 'index.html';
                return;
            }
            const id = new URLSearchParams(window.location.search).get('id');
            if (!id) {
                alert('Keine Bericht-ID angegeben');
                return;
            }
            this._renderBranchBadge();
            this._setBackLink();
            await this._loadReport(id);
        });
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

    async _loadReport(id) {
        const doc = await this.db.collection('spyReports').doc(id).get();
        if (!doc.exists) {
            alert('Bericht nicht gefunden');
            return;
        }
        const data = doc.data();
        this._renderMeta(data);
        this._renderEvaluation(data);
        this._renderSnapshot(data);
    }

    _renderMeta(data) {
        const parsed = data.parsed || {};
        const research = parsed.research || {};
        const coords = parsed.coords?.raw || '';
        const metaEl = document.getElementById('report-meta');
        const originalLink = document.getElementById('original-link');
        if (originalLink && data.sourceUrl) {
            originalLink.href = data.sourceUrl;
        } else if (originalLink) {
            originalLink.style.display = 'none';
        }
        metaEl.innerHTML = `
			<div><strong>Spieler:</strong> ${this._esc(parsed.targetPlayer)}</div>
			<div><strong>Planet:</strong> ${this._esc(parsed.planetName)} ${coords ? '(' + this._esc(coords) + ')' : ''}</div>
			<div><strong>Spionageeinheit:</strong> ${this._fmt(research.spionage)}</div>
			<div><strong>Tarneinheit:</strong> ${this._fmt(research.tarn)}</div>
			<div><strong>Invasionseinheit:</strong> ${this._fmt(research.invasion)}</div>
			<div><strong>Plündereinheit:</strong> ${this._fmt(research.pluender)}</div>
			<div><strong>Sabotageeinheit:</strong> ${this._fmt(research.sabotage)}</div>
			<div><strong>Reporter:</strong> ${this._esc(data.reporterUsername || '')}</div>
		`;
    }

    _renderEvaluation(data) {
        const evaluationContainer = document.getElementById('evaluation-container');
        const evaluationContent = document.getElementById('evaluation-content');
        
        if (data.evaluation) {
            evaluationContainer.style.display = 'block';
            evaluationContent.innerHTML = window.SpyEvaluator.formatEvaluationForUI(data.evaluation);
        } else if (data.evaluationError) {
            evaluationContainer.style.display = 'block';
            evaluationContent.innerHTML = `<div class="evaluation-result">
                <p style="color: var(--danger-color, #ef4444);">⚠️ Auswertung fehlgeschlagen: ${this._esc(data.evaluationError)}</p>
            </div>`;
        } else {
            evaluationContainer.style.display = 'none';
        }
    }

    _renderSnapshot(data) {
        const frame = document.getElementById('snapshot-frame');
        const safeHtml = this._sanitizeForSrcDoc(data.rawHtml || '<p>Kein Snapshot verfügbar</p>');
        frame.srcdoc = safeHtml;
    }

    _renderBranchBadge() {
        const b = (this.branch || 'main').toLowerCase();
        const badge = document.getElementById('branch-badge');
        if (!badge) return;
        badge.textContent = b.toUpperCase();
        badge.classList.remove('branch-main', 'branch-testarea');
        badge.classList.add(b === 'testarea' ? 'branch-testarea' : 'branch-main');
    }

    _setBackLink() {
        const link = document.getElementById('back-to-db');
        if (link) {
            const params = new URLSearchParams(window.location.search);
            const b = params.get('branch') || this.branch || 'main';
            link.href = `spy-database.html?branch=${encodeURIComponent(b)}`;
        }
    }

    _sanitizeForSrcDoc(html) {
        // Entferne Scripts vollständig
        const withoutScripts = String(html).replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '');
        // Neutralisiere event-handler Attribute
        return withoutScripts.replace(/ on[a-z]+="[^"]*"/gi, '');
    }

    _fmt(v) { return (v === null || v === undefined) ? '-' : String(v); }
    _esc(str) { return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
}

window.addEventListener('DOMContentLoaded', () => {
    window.spyReportPage = new SpyReportPage();
});