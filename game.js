// Space Nations Game - Main Game Logic
class SpaceNationsGame {
    constructor() {
        this.gameState = {
            resources: {
                energy: 1000,
                minerals: 500,
                credits: 2500
            },
            population: 10000,
            defense: 85,
            production: 120,
            exploredSectors: new Set(),
            selectedSector: null,
            ships: [
                { id: 1, type: 'scout', name: 'Explorer I', hp: 100, attack: 20, defense: 10 },
                { id: 2, type: 'fighter', name: 'Defender I', hp: 150, attack: 40, defense: 25 }
            ],
            crew: [
                { id: 1, name: 'Commander Sarah', specialty: 'leadership', level: 5, bonus: 15 },
                { id: 2, name: 'Engineer Marcus', specialty: 'engineering', level: 3, bonus: 10 }
            ],
            research: {
                hyperDrive: { completed: true, cost: 0 },
                advancedWeapons: { completed: false, cost: 1000 },
                shieldTech: { completed: false, cost: 800 },
                miningTech: { completed: false, cost: 600 }
            },
            currentEnemy: null
        };
        
        this.sectorTypes = [
            { icon: '🌌', name: 'Leerer Raum', resources: { energy: 10, minerals: 5 } },
            { icon: '🪐', name: 'Planet', resources: { energy: 30, minerals: 50, credits: 20 } },
            { icon: '☄️', name: 'Asteroidenfeld', resources: { minerals: 100, energy: 20 } },
            { icon: '⭐', name: 'Stern', resources: { energy: 200, credits: 50 } },
            { icon: '🛸', name: 'Alien-Station', resources: { credits: 150, energy: 50 } },
            { icon: '💎', name: 'Kristall-Nebel', resources: { energy: 80, minerals: 80, credits: 100 } },
            { icon: '🌑', name: 'Schwarzes Loch', resources: { energy: 500, minerals: 200, credits: 300 } },
            { icon: '🏭', name: 'Verlassene Fabrik', resources: { minerals: 150, credits: 80 } }
        ];

        this.crewSpecialties = [
            { name: 'leadership', icon: '👑', description: 'Führung - Erhöht Kampfeffizienz' },
            { name: 'engineering', icon: '🔧', description: 'Technik - Reduziert Baukosten' },
            { name: 'science', icon: '🔬', description: 'Wissenschaft - Beschleunigt Forschung' },
            { name: 'navigation', icon: '🧭', description: 'Navigation - Reduziert Erkundungskosten' },
            { name: 'combat', icon: '⚔️', description: 'Kampf - Erhöht Schadenswerte' }
        ];

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.generateMap();
        this.updateUI();
        this.renderShips();
        this.renderCrew();
        this.renderResearch();
        this.startResourceProduction();
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Quick Actions
        window.quickMine = () => this.quickMine();
        window.quickExplore = () => this.quickExplore();
        window.quickTrade = () => this.quickTrade();
        
        // Fleet Actions
        window.showShipBuilder = () => this.showShipBuilder();
        window.buildShip = (type) => this.buildShip(type);
        
        // Crew Actions
        window.recruitCrew = () => this.recruitCrew();
        
        // Combat Actions
        window.findBattle = () => this.findBattle();
        window.startBattle = () => this.startBattle();

        // Exploration
        document.getElementById('exploreBtn').addEventListener('click', () => {
            this.exploreSector();
        });
    }

    switchTab(tabName) {
        // Update navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');
    }

    updateUI() {
        // Update resources
        document.getElementById('energy').textContent = this.gameState.resources.energy;
        document.getElementById('minerals').textContent = this.gameState.resources.minerals;
        document.getElementById('credits').textContent = this.gameState.resources.credits;
        
        // Update status
        document.getElementById('population').textContent = this.gameState.population.toLocaleString();
        document.getElementById('defense').textContent = this.gameState.defense + '%';
        document.getElementById('production').textContent = this.gameState.production + '/h';
    }

    generateMap() {
        const mapGrid = document.getElementById('mapGrid');
        mapGrid.innerHTML = '';
        
        for (let i = 0; i < 64; i++) {
            const sector = document.createElement('div');
            sector.className = 'sector';
            sector.dataset.sectorId = i;
            
            const sectorType = this.sectorTypes[Math.floor(Math.random() * this.sectorTypes.length)];
            sector.innerHTML = sectorType.icon;
            sector.dataset.sectorType = JSON.stringify(sectorType);
            
            if (this.gameState.exploredSectors.has(i)) {
                sector.classList.add('explored');
            }
            
            sector.addEventListener('click', () => {
                this.selectSector(i, sectorType);
            });
            
            mapGrid.appendChild(sector);
        }
    }

    selectSector(sectorId, sectorType) {
        // Remove previous selection
        document.querySelectorAll('.sector').forEach(s => s.classList.remove('selected'));
        
        // Select new sector
        document.querySelector(`[data-sector-id="${sectorId}"]`).classList.add('selected');
        this.gameState.selectedSector = { id: sectorId, type: sectorType };
        
        // Update exploration info
        const sectorInfo = document.getElementById('sectorInfo');
        const exploreBtn = document.getElementById('exploreBtn');
        
        if (this.gameState.exploredSectors.has(sectorId)) {
            sectorInfo.innerHTML = `
                <h3>${sectorType.icon} ${sectorType.name}</h3>
                <p><strong>Status:</strong> Erkundet</p>
                <p><strong>Verfügbare Ressourcen:</strong></p>
                <ul>
                    ${Object.entries(sectorType.resources).map(([key, value]) => 
                        `<li>${this.getResourceIcon(key)} ${value}</li>`
                    ).join('')}
                </ul>
            `;
            exploreBtn.disabled = true;
            exploreBtn.textContent = 'Bereits erkundet';
        } else {
            sectorInfo.innerHTML = `
                <h3>${sectorType.icon} ${sectorType.name}</h3>
                <p><strong>Status:</strong> Unerforscht</p>
                <p>Erkunden Sie diesen Sektor, um Ressourcen zu entdecken!</p>
            `;
            exploreBtn.disabled = false;
            exploreBtn.textContent = 'Erkunden (Kosten: 50⚡)';
        }
    }

    getResourceIcon(resourceType) {
        const icons = {
            energy: '⚡',
            minerals: '⛏️',
            credits: '🛡️'
        };
        return icons[resourceType] || '📦';
    }

    exploreSector() {
        if (!this.gameState.selectedSector || this.gameState.resources.energy < 50) {
            return;
        }

        const sectorId = this.gameState.selectedSector.id;
        const sectorType = this.gameState.selectedSector.type;
        
        // Deduct exploration cost
        this.gameState.resources.energy -= 50;
        
        // Mark as explored
        this.gameState.exploredSectors.add(sectorId);
        
        // Add resources
        Object.entries(sectorType.resources).forEach(([key, value]) => {
            this.gameState.resources[key] += value;
        });
        
        // Update UI
        this.updateUI();
        this.selectSector(sectorId, sectorType);
        document.querySelector(`[data-sector-id="${sectorId}"]`).classList.add('explored');
        
        // Add event log
        this.addEvent(`🔍 ${sectorType.name} in Sektor ${sectorId} erkundet! Ressourcen erhalten.`);
    }

    renderShips() {
        const shipGrid = document.getElementById('shipGrid');
        shipGrid.innerHTML = '';
        
        this.gameState.ships.forEach(ship => {
            const shipCard = document.createElement('div');
            shipCard.className = 'ship-card';
            shipCard.innerHTML = `
                <h3>${this.getShipIcon(ship.type)} ${ship.name}</h3>
                <p><strong>Typ:</strong> ${this.getShipTypeName(ship.type)}</p>
                <p><strong>HP:</strong> ${ship.hp}</p>
                <p><strong>Angriff:</strong> ${ship.attack}</p>
                <p><strong>Verteidigung:</strong> ${ship.defense}</p>
            `;
            shipGrid.appendChild(shipCard);
        });
    }

    getShipIcon(type) {
        const icons = {
            scout: '🛸',
            fighter: '⚔️',
            cruiser: '🛡️',
            battleship: '🚀'
        };
        return icons[type] || '🛸';
    }

    getShipTypeName(type) {
        const names = {
            scout: 'Aufklärer',
            fighter: 'Jäger',
            cruiser: 'Kreuzer',
            battleship: 'Schlachtschiff'
        };
        return names[type] || 'Unbekannt';
    }

    showShipBuilder() {
        const builder = document.getElementById('shipBuilder');
        builder.style.display = builder.style.display === 'none' ? 'block' : 'none';
    }

    buildShip(type) {
        const costs = {
            scout: { energy: 200, minerals: 100 },
            fighter: { energy: 500, minerals: 300 },
            cruiser: { energy: 1000, minerals: 600 }
        };

        const stats = {
            scout: { hp: 100, attack: 20, defense: 10 },
            fighter: { hp: 150, attack: 40, defense: 25 },
            cruiser: { hp: 300, attack: 60, defense: 50 }
        };

        const cost = costs[type];
        if (this.gameState.resources.energy >= cost.energy && 
            this.gameState.resources.minerals >= cost.minerals) {
            
            this.gameState.resources.energy -= cost.energy;
            this.gameState.resources.minerals -= cost.minerals;
            
            const newShip = {
                id: Date.now(),
                type: type,
                name: `${this.getShipTypeName(type)} ${this.gameState.ships.length + 1}`,
                ...stats[type]
            };
            
            this.gameState.ships.push(newShip);
            this.renderShips();
            this.updateUI();
            this.addEvent(`🚀 Neues Schiff gebaut: ${newShip.name}`);
        } else {
            this.addEvent('❌ Nicht genügend Ressourcen für den Schiffsbau!');
        }
    }

    renderCrew() {
        const crewGrid = document.getElementById('crewGrid');
        crewGrid.innerHTML = '';
        
        this.gameState.crew.forEach(member => {
            const crewCard = document.createElement('div');
            crewCard.className = 'crew-card';
            const specialty = this.crewSpecialties.find(s => s.name === member.specialty);
            crewCard.innerHTML = `
                <h3>${specialty.icon} ${member.name}</h3>
                <p><strong>Spezialisierung:</strong> ${specialty.description}</p>
                <p><strong>Level:</strong> ${member.level}</p>
                <p><strong>Bonus:</strong> +${member.bonus}%</p>
            `;
            crewGrid.appendChild(crewCard);
        });
    }

    recruitCrew() {
        if (this.gameState.resources.credits >= 100) {
            this.gameState.resources.credits -= 100;
            
            const names = ['Alex', 'Jordan', 'Casey', 'Morgan', 'Taylor', 'Riley', 'Quinn', 'Sage'];
            const specialties = this.crewSpecialties;
            
            const newCrew = {
                id: Date.now(),
                name: names[Math.floor(Math.random() * names.length)] + ' ' + 
                      ['Nova', 'Star', 'Void', 'Cosmos', 'Galaxy'][Math.floor(Math.random() * 5)],
                specialty: specialties[Math.floor(Math.random() * specialties.length)].name,
                level: Math.floor(Math.random() * 3) + 1,
                bonus: Math.floor(Math.random() * 10) + 5
            };
            
            this.gameState.crew.push(newCrew);
            this.renderCrew();
            this.updateUI();
            this.addEvent(`👥 Neues Crew-Mitglied rekrutiert: ${newCrew.name}`);
        } else {
            this.addEvent('❌ Nicht genügend Credits für die Rekrutierung!');
        }
    }

    renderResearch() {
        const researchTree = document.getElementById('researchTree');
        researchTree.innerHTML = '';
        
        Object.entries(this.gameState.research).forEach(([key, research]) => {
            const researchItem = document.createElement('div');
            researchItem.className = `research-item ${research.completed ? 'completed' : ''}`;
            
            const names = {
                hyperDrive: '🚀 Hyperantrieb',
                advancedWeapons: '⚔️ Erweiterte Waffen',
                shieldTech: '🛡️ Schild-Technologie',
                miningTech: '⛏️ Bergbau-Technologie'
            };
            
            researchItem.innerHTML = `
                <h3>${names[key]}</h3>
                <p>${research.completed ? 'Abgeschlossen' : `Kosten: ${research.cost}🛡️`}</p>
                ${!research.completed ? '<button onclick="game.startResearch(\'' + key + '\')">Forschen</button>' : ''}
            `;
            
            researchTree.appendChild(researchItem);
        });
    }

    startResearch(researchKey) {
        const research = this.gameState.research[researchKey];
        if (this.gameState.resources.credits >= research.cost) {
            this.gameState.resources.credits -= research.cost;
            research.completed = true;
            this.renderResearch();
            this.updateUI();
            this.addEvent(`🔬 Forschung abgeschlossen: ${researchKey}`);
        } else {
            this.addEvent('❌ Nicht genügend Credits für die Forschung!');
        }
    }

    findBattle() {
        const enemies = [
            { name: 'Piraten-Schwarm', ships: 2, difficulty: 'easy' },
            { name: 'Alien-Patrouille', ships: 3, difficulty: 'medium' },
            { name: 'Rogue-Flotte', ships: 4, difficulty: 'hard' }
        ];
        
        const enemy = enemies[Math.floor(Math.random() * enemies.length)];
        this.gameState.currentEnemy = enemy;
        
        document.getElementById('enemyFleet').innerHTML = `
            <h4>${enemy.name}</h4>
            <p>Schiffe: ${enemy.ships}</p>
            <p>Schwierigkeit: ${enemy.difficulty}</p>
        `;
        
        document.getElementById('playerFleet').innerHTML = `
            <h4>Deine Flotte</h4>
            <p>Schiffe: ${this.gameState.ships.length}</p>
            <p>Gesamtstärke: ${this.calculateFleetPower()}</p>
        `;
        
        document.getElementById('battleBtn').disabled = false;
        this.addEvent(`⚔️ Feindliche ${enemy.name} entdeckt!`);
    }

    calculateFleetPower() {
        return this.gameState.ships.reduce((total, ship) => total + ship.attack + ship.defense, 0);
    }

    startBattle() {
        if (!this.gameState.currentEnemy) return;
        
        const playerPower = this.calculateFleetPower();
        const enemyPower = this.gameState.currentEnemy.ships * 50; // Base enemy power
        
        const battleLog = document.getElementById('battleLog');
        battleLog.innerHTML = '<h3>⚔️ Schlacht beginnt!</h3>';
        
        // Simulate battle
        setTimeout(() => {
            const outcome = playerPower > enemyPower ? 'victory' : 'defeat';
            
            if (outcome === 'victory') {
                const reward = {
                    energy: Math.floor(Math.random() * 100) + 50,
                    minerals: Math.floor(Math.random() * 50) + 25,
                    credits: Math.floor(Math.random() * 200) + 100
                };
                
                Object.entries(reward).forEach(([key, value]) => {
                    this.gameState.resources[key] += value;
                });
                
                battleLog.innerHTML += `
                    <p>🎉 Sieg! Belohnung erhalten:</p>
                    <p>⚡ ${reward.energy} Energie</p>
                    <p>⛏️ ${reward.minerals} Mineralien</p>
                    <p>🛡️ ${reward.credits} Credits</p>
                `;
                
                this.addEvent('🎉 Schlacht gewonnen! Belohnungen erhalten.');
            } else {
                battleLog.innerHTML += `
                    <p>💀 Niederlage! Einige Schiffe wurden beschädigt.</p>
                    <p>Reparaturkosten: 100⚡</p>
                `;
                
                this.gameState.resources.energy = Math.max(0, this.gameState.resources.energy - 100);
                this.addEvent('💀 Schlacht verloren. Schiffe beschädigt.');
            }
            
            this.updateUI();
            this.gameState.currentEnemy = null;
            document.getElementById('battleBtn').disabled = true;
        }, 2000);
    }

    quickMine() {
        const reward = { energy: 50, minerals: 100 };
        Object.entries(reward).forEach(([key, value]) => {
            this.gameState.resources[key] += value;
        });
        this.updateUI();
        this.addEvent('⛏️ Schnell-Bergbau durchgeführt! Ressourcen erhalten.');
    }

    quickExplore() {
        if (this.gameState.resources.energy >= 30) {
            this.gameState.resources.energy -= 30;
            const reward = Math.floor(Math.random() * 50) + 25;
            this.gameState.resources.credits += reward;
            this.updateUI();
            this.addEvent(`🔍 Schnell-Erkundung! ${reward} Credits gefunden.`);
        } else {
            this.addEvent('❌ Nicht genügend Energie für die Erkundung!');
        }
    }

    quickTrade() {
        if (this.gameState.resources.minerals >= 50) {
            this.gameState.resources.minerals -= 50;
            this.gameState.resources.credits += 75;
            this.updateUI();
            this.addEvent('💰 Handel abgeschlossen! Mineralien gegen Credits getauscht.');
        } else {
            this.addEvent('❌ Nicht genügend Mineralien für den Handel!');
        }
    }

    addEvent(message) {
        const eventLog = document.getElementById('eventLog');
        const event = document.createElement('div');
        event.className = 'event';
        event.textContent = message;
        eventLog.insertBefore(event, eventLog.firstChild);
        
        // Keep only last 5 events
        while (eventLog.children.length > 5) {
            eventLog.removeChild(eventLog.lastChild);
        }
    }

    startResourceProduction() {
        setInterval(() => {
            // Passive resource generation
            this.gameState.resources.energy += Math.floor(this.gameState.production / 10);
            this.gameState.resources.minerals += Math.floor(this.gameState.production / 20);
            
            // Random events
            if (Math.random() < 0.1) { // 10% chance every interval
                const events = [
                    { message: '💫 Seltene Mineralien entdeckt!', reward: { minerals: 50 } },
                    { message: '⚡ Energieüberschuss generiert!', reward: { energy: 100 } },
                    { message: '🛸 Handelsschiff angekommen!', reward: { credits: 150 } }
                ];
                
                const event = events[Math.floor(Math.random() * events.length)];
                Object.entries(event.reward).forEach(([key, value]) => {
                    this.gameState.resources[key] += value;
                });
                this.addEvent(event.message);
            }
            
            this.updateUI();
        }, 10000); // Every 10 seconds
    }
}

// Initialize game when page loads
let game;
document.addEventListener('DOMContentLoaded', () => {
    game = new SpaceNationsGame();
    console.log('🚀 Space Nations Game loaded successfully!');
});

// Add global functions for HTML onclick handlers
window.game = null;
document.addEventListener('DOMContentLoaded', () => {
    window.game = new SpaceNationsGame();
});