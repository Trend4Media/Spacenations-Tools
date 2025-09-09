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
        sessionStorage.setItem('branch', 'main');
        return 'main';
    }

    async _loadReport(id) {
        const doc = await this.db.collection('spyReports').doc(id).get();
        if (!doc.exists) {
            alert('Bericht nicht gefunden');
            return;
        }
        const data = doc.data();
        this._renderMeta(data);
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

    _renderSnapshot(data) {
        const frame = document.getElementById('snapshot-frame');
        const safeHtml = this._sanitizeForSrcDoc(data.rawHtml || '<p>Kein Snapshot verfügbar</p>');
        frame.srcdoc = safeHtml;
    }

    _renderBranchBadge() {
        const b = 'main';
        const badge = document.getElementById('branch-badge');
        if (!badge) return;
        badge.textContent = 'MAIN';
        badge.classList.remove('branch-main', 'branch-testarea');
        badge.classList.add('branch-main');
    }

    _setBackLink() {
        const link = document.getElementById('back-to-db');
        if (link) {
            link.href = `spy-database.html`;
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