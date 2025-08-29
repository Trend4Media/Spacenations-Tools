class PlayerOverviewPage {
    constructor() {
        this.db = null;
        this.user = null;
        this.userData = null;
        this.alliance = null;
        this.branch = 'main';
        this.elements = {};
        this.unsubscribe = null;
        this.players = new Map();
        this.selectedPlayer = null;
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
            this._loadPlayerData();
        });
    }

    _setupUI() {
        this.elements.branchBadge = document.getElementById('branch-badge');
        this.elements.playerSearch = document.getElementById('player-search');
        this.elements.playersContainer = document.getElementById('players-container');
        this.elements.loading = document.getElementById('loading');
        this.elements.noData = document.getElementById('no-data');
        this.elements.playerDetailsCard = document.getElementById('player-details-card');
        this.elements.selectedPlayerName = document.getElementById('selected-player-name');
        this.elements.reportHistory = document.getElementById('report-history');
        this.elements.latestEvaluation = document.getElementById('latest-evaluation');
        this.elements.backToDatabase = document.getElementById('back-to-database');
        
        // Statistik-Elemente
        this.elements.totalPlayers = document.getElementById('total-players');
        this.elements.totalReports = document.getElementById('total-reports');
        this.elements.recentReports = document.getElementById('recent-reports');

        // Event Listeners
        if (this.elements.playerSearch) {
            this.elements.playerSearch.addEventListener('input', (e) => this._filterPlayers(e.target.value));
        }

        if (this.elements.backToDatabase) {
            this.elements.backToDatabase.href = `spy-database.html?branch=${encodeURIComponent(this.branch)}`;
        }
    }

    _renderBranchBadge() {
        if (!this.elements.branchBadge) return;
        const b = (this.branch || 'main').toLowerCase();
        this.elements.branchBadge.textContent = b.toUpperCase();
        this.elements.branchBadge.classList.remove('branch-main', 'branch-testarea');
        this.elements.branchBadge.classList.add(b === 'testarea' ? 'branch-testarea' : 'branch-main');
    }

    _detectBranch() {
        const params = new URLSearchParams(window.location.search);
        let b = params.get('branch') || null;
        if (!b) {
            if (window.location.pathname.toLowerCase().includes('/testarea/')) {
                b = 'testarea';
            }
        }
        b = (b || sessionStorage.getItem('branch') || 'main').toLowerCase();
        sessionStorage.setItem('branch', b);
        return b;
    }

    async _loadPlayerData() {
        if (this.unsubscribe) this.unsubscribe();
        
        this.elements.loading.style.display = 'block';
        this.elements.playersContainer.style.display = 'none';
        this.elements.noData.style.display = 'none';

        const baseQuery = this.alliance
            ? this.db.collection('spyReports').where('alliance', '==', this.alliance)
            : this.db.collection('spyReports').where('reporterUid', '==', this.user.uid);

        let query = baseQuery.where('branch', '==', this.branch || 'main');
        query = query.orderBy('reportedAt', 'desc').limit(500); // Mehr Berichte für bessere Spielerübersicht

        this.unsubscribe = query.onSnapshot(snapshot => {
            this._processReports(snapshot);
        });
    }

    _processReports(snapshot) {
        this.players.clear();
        const reports = [];
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        snapshot.forEach(doc => {
            const data = doc.data();
            const reportDate = data.reportedAt?.toDate() || new Date();
            reports.push({ id: doc.id, data, reportDate });

            const playerName = data.parsed?.targetPlayer;
            if (!playerName) return;

            if (!this.players.has(playerName)) {
                this.players.set(playerName, {
                    name: playerName,
                    reports: [],
                    latestReport: null,
                    planets: new Set(),
                    totalReports: 0,
                    recentReports: 0
                });
            }

            const player = this.players.get(playerName);
            player.reports.push({ id: doc.id, data, reportDate });
            player.totalReports++;

            if (reportDate >= sevenDaysAgo) {
                player.recentReports++;
            }

            // Planet tracking
            if (data.parsed?.planetName) {
                player.planets.add(data.parsed.planetName);
            }

            // Aktuellsten Bericht verfolgen
            if (!player.latestReport || reportDate > player.latestReport.reportDate) {
                player.latestReport = { id: doc.id, data, reportDate };
            }
        });

        // Sortiere Berichte für jeden Spieler
        for (const player of this.players.values()) {
            player.reports.sort((a, b) => b.reportDate - a.reportDate);
        }

        this._updateStatistics(reports, sevenDaysAgo);
        this._renderPlayers();
    }

    _updateStatistics(reports, sevenDaysAgo) {
        const totalPlayers = this.players.size;
        const totalReports = reports.length;
        const recentReports = reports.filter(r => r.reportDate >= sevenDaysAgo).length;

        this.elements.totalPlayers.textContent = totalPlayers;
        this.elements.totalReports.textContent = totalReports;
        this.elements.recentReports.textContent = recentReports;
    }

    _renderPlayers() {
        this.elements.loading.style.display = 'none';

        if (this.players.size === 0) {
            this.elements.noData.style.display = 'block';
            this.elements.playersContainer.style.display = 'none';
            return;
        }

        this.elements.noData.style.display = 'none';
        this.elements.playersContainer.style.display = 'grid';

        // Sortiere Spieler nach letztem Bericht
        const sortedPlayers = Array.from(this.players.values()).sort((a, b) => {
            if (!a.latestReport && !b.latestReport) return 0;
            if (!a.latestReport) return 1;
            if (!b.latestReport) return -1;
            return b.latestReport.reportDate - a.latestReport.reportDate;
        });

        this.elements.playersContainer.innerHTML = sortedPlayers.map(player => this._renderPlayerCard(player)).join('');

        // Event Listeners für Spielerkarten
        this.elements.playersContainer.querySelectorAll('.player-card').forEach(card => {
            card.addEventListener('click', () => {
                const playerName = card.dataset.playerName;
                this._selectPlayer(playerName);
            });
        });
    }

    _renderPlayerCard(player) {
        const latestReport = player.latestReport;
        const evaluation = latestReport?.data?.evaluation;
        const threat = evaluation?.threat;
        
        let threatBadge = '';
        if (threat) {
            threatBadge = `<div class="player-threat" style="background-color: ${threat.color}20; color: ${threat.color}; border: 1px solid ${threat.color};">
                ${threat.label}
            </div>`;
        }

        const lastReportDate = latestReport ? this._formatDate(latestReport.reportDate) : 'Nie';
        const planetsText = player.planets.size > 1 ? `${player.planets.size} Planeten` : '1 Planet';

        return `
            <div class="player-card" data-player-name="${this._escape(player.name)}">
                <div class="player-name">${this._escape(player.name)}</div>
                <div class="player-stats">
                    ${planetsText} • ${player.totalReports} Berichte
                </div>
                <div class="last-report">
                    Letzter Bericht: ${lastReportDate}
                </div>
                ${threatBadge}
            </div>
        `;
    }

    _selectPlayer(playerName) {
        this.selectedPlayer = this.players.get(playerName);
        if (!this.selectedPlayer) return;

        // Markiere ausgewählte Karte
        this.elements.playersContainer.querySelectorAll('.player-card').forEach(card => {
            card.classList.remove('selected');
            if (card.dataset.playerName === playerName) {
                card.classList.add('selected');
            }
        });

        this._renderPlayerDetails();
        this.elements.playerDetailsCard.style.display = 'block';
        this.elements.playerDetailsCard.scrollIntoView({ behavior: 'smooth' });
    }

    _renderPlayerDetails() {
        if (!this.selectedPlayer) return;

        this.elements.selectedPlayerName.textContent = `📊 ${this.selectedPlayer.name}`;

        // Berichtsverlauf
        this.elements.reportHistory.innerHTML = this.selectedPlayer.reports.slice(0, 10).map(report => 
            this._renderHistoryItem(report)
        ).join('');

        // Aktuellste Auswertung
        const latestReport = this.selectedPlayer.latestReport;
        if (latestReport && latestReport.data.evaluation) {
            if (latestReport.data.evaluation.buildings || latestReport.data.evaluation.ships) {
                this.elements.latestEvaluation.innerHTML = window.SpyEvaluator.formatDetailedEvaluationForUI(latestReport.data.evaluation);
            } else {
                this.elements.latestEvaluation.innerHTML = window.SpyEvaluator.formatEvaluationForUI(latestReport.data.evaluation);
            }
        } else {
            this.elements.latestEvaluation.innerHTML = '<p>Keine Auswertung verfügbar</p>';
        }

        // Event Listeners für Berichts-Links
        this.elements.reportHistory.querySelectorAll('.history-item').forEach(item => {
            item.addEventListener('click', () => {
                const reportId = item.dataset.reportId;
                window.open(`spy-report.html?id=${encodeURIComponent(reportId)}&branch=${encodeURIComponent(this.branch)}`, '_blank');
            });
        });
    }

    _renderHistoryItem(report) {
        const data = report.data;
        const parsed = data.parsed || {};
        const evaluation = data.evaluation;
        const threat = evaluation?.threat;

        let threatBadge = '';
        if (threat) {
            threatBadge = `<span class="history-threat" style="background-color: ${threat.color}20; color: ${threat.color}; border: 1px solid ${threat.color};">
                ${threat.label}
            </span>`;
        }

        const planetInfo = parsed.planetName ? 
            `${parsed.planetName} ${parsed.coords?.raw ? '(' + parsed.coords.raw + ')' : ''}` : 
            'Unbekannter Planet';

        return `
            <div class="history-item" data-report-id="${report.id}" style="cursor: pointer;" title="Klicken um Bericht zu öffnen">
                <div class="history-date">${this._formatDate(report.reportDate)}</div>
                <div class="history-planet">${this._escape(planetInfo)}</div>
                ${threatBadge}
            </div>
        `;
    }

    _filterPlayers(searchTerm) {
        const cards = this.elements.playersContainer.querySelectorAll('.player-card');
        const term = searchTerm.toLowerCase();

        cards.forEach(card => {
            const playerName = card.dataset.playerName.toLowerCase();
            if (playerName.includes(term)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    _formatDate(date) {
        if (!date) return 'Unbekannt';
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 60) {
            return `vor ${diffMins} Min`;
        } else if (diffHours < 24) {
            return `vor ${diffHours} Std`;
        } else if (diffDays < 7) {
            return `vor ${diffDays} Tagen`;
        } else {
            return date.toLocaleDateString('de-DE', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        }
    }

    _escape(str) {
        return String(str || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.playerOverviewPage = new PlayerOverviewPage();
});