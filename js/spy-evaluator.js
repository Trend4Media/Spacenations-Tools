class SpyEvaluator {
    constructor() {
        this.evaluationRules = {
            // Forschungsstufen Bewertung
            research: {
                spionage: { low: 0, medium: 5, high: 10, excellent: 15 },
                tarn: { low: 0, medium: 3, high: 8, excellent: 12 },
                invasion: { low: 0, medium: 4, high: 9, excellent: 14 },
                pluender: { low: 0, medium: 3, high: 7, excellent: 11 },
                sabotage: { low: 0, medium: 2, high: 6, excellent: 10 }
            },
            // Threat Level Bewertung basierend auf Gesamtforschung
            threatLevels: {
                veryLow: { min: 0, max: 15, color: '#22c55e', label: 'Sehr Niedrig' },
                low: { min: 16, max: 35, color: '#84cc16', label: 'Niedrig' },
                medium: { min: 36, max: 55, color: '#eab308', label: 'Mittel' },
                high: { min: 56, max: 75, color: '#f97316', label: 'Hoch' },
                veryHigh: { min: 76, max: 100, color: '#ef4444', label: 'Sehr Hoch' }
            }
        };
    }

    /**
     * Automatische Auswertung eines Spionageberichts
     * @param {Object} reportData - Die geparsten Spionagedaten
     * @returns {Object} - Auswertungsergebnis
     */
    evaluate(reportData) {
        try {
            const parsed = reportData.parsed || {};
            const research = parsed.research || parsed.research_legacy || {};
            const buildings = parsed.buildings || {};
            const ships = parsed.ships || {};
            const resources = parsed.resources || {};
            
            // Detaillierte Auswertungen
            const researchEvaluation = this._evaluateDetailedResearch(research);
            const buildingEvaluation = this._evaluateBuildings(buildings);
            const shipEvaluation = this._evaluateShips(ships);
            const resourceEvaluation = this._evaluateResources(resources);
            
            // Bedrohungsanalyse (erweitert)
            const threatAnalysis = this._analyzeDetailedThreat(researchEvaluation, buildingEvaluation, shipEvaluation);
            
            // Empfehlungen generieren (erweitert)
            const recommendations = this._generateDetailedRecommendations(research, buildings, ships, threatAnalysis);
            
            // Strategische Einschätzung (erweitert)
            const strategicAssessment = this._assessDetailedStrategicValue(research, buildings, ships, resources);
            
            const evaluation = {
                timestamp: new Date().toISOString(),
                research: researchEvaluation,
                buildings: buildingEvaluation,
                ships: shipEvaluation,
                resources: resourceEvaluation,
                threat: threatAnalysis,
                strategic: strategicAssessment,
                recommendations: recommendations,
                summary: this._generateDetailedSummary(threatAnalysis, strategicAssessment, buildingEvaluation, shipEvaluation)
            };

            return {
                success: true,
                evaluation: evaluation
            };
        } catch (error) {
            return {
                success: false,
                error: 'Auswertungsfehler: ' + (error?.message || String(error))
            };
        }
    }

    _evaluateResearch(research) {
        const evaluation = {};
        let totalScore = 0;
        let maxPossibleScore = 0;

        for (const [type, value] of Object.entries(research)) {
            if (value === null || value === undefined) {
                evaluation[type] = {
                    level: null,
                    score: 0,
                    rating: 'Unbekannt'
                };
                continue;
            }

            const rules = this.evaluationRules.research[type];
            if (!rules) continue;

            let rating, score;
            if (value >= rules.excellent) {
                rating = 'Exzellent';
                score = 4;
            } else if (value >= rules.high) {
                rating = 'Hoch';
                score = 3;
            } else if (value >= rules.medium) {
                rating = 'Mittel';
                score = 2;
            } else if (value > rules.low) {
                rating = 'Niedrig';
                score = 1;
            } else {
                rating = 'Sehr Niedrig';
                score = 0;
            }

            evaluation[type] = {
                level: value,
                score: score,
                rating: rating
            };

            totalScore += score;
            maxPossibleScore += 4;
        }

        evaluation.total = {
            score: totalScore,
            maxScore: maxPossibleScore,
            percentage: maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0
        };

        return evaluation;
    }

    _analyzeThreat(researchEvaluation) {
        const totalPercentage = researchEvaluation.total.percentage;
        
        let threatLevel = 'veryLow';
        for (const [level, config] of Object.entries(this.evaluationRules.threatLevels)) {
            if (totalPercentage >= config.min && totalPercentage <= config.max) {
                threatLevel = level;
                break;
            }
        }

        const threatConfig = this.evaluationRules.threatLevels[threatLevel];
        
        return {
            level: threatLevel,
            label: threatConfig.label,
            color: threatConfig.color,
            percentage: totalPercentage,
            description: this._getThreatDescription(threatLevel)
        };
    }

    _getThreatDescription(threatLevel) {
        const descriptions = {
            veryLow: 'Sehr geringes Risiko. Ziel ist schwach entwickelt und stellt keine unmittelbare Bedrohung dar.',
            low: 'Geringes Risiko. Grundlegende Entwicklung vorhanden, aber noch nicht bedrohlich.',
            medium: 'Mittleres Risiko. Solide Entwicklung erkennbar. Vorsicht bei Angriffen empfohlen.',
            high: 'Hohes Risiko. Starke Entwicklung. Angriffe nur mit Vorbereitung und Verstärkung.',
            veryHigh: 'Sehr hohes Risiko. Extrem starke Entwicklung. Angriffe extrem riskant oder unmöglich.'
        };
        return descriptions[threatLevel] || 'Unbekannte Bedrohungsstufe';
    }

    _generateRecommendations(research, threatAnalysis) {
        const recommendations = [];

        // Bedrohungsbasierte Empfehlungen
        switch (threatAnalysis.level) {
            case 'veryLow':
            case 'low':
                recommendations.push({
                    type: 'attack',
                    priority: 'high',
                    text: 'Ideales Angriffsziel. Schwache Verteidigung erwartet.'
                });
                break;
            case 'medium':
                recommendations.push({
                    type: 'caution',
                    priority: 'medium',
                    text: 'Vorsichtiger Angriff empfohlen. Verstärkung bereithalten.'
                });
                break;
            case 'high':
            case 'veryHigh':
                recommendations.push({
                    type: 'warning',
                    priority: 'high',
                    text: 'Angriff nicht empfohlen. Sehr starke Verteidigung erwartet.'
                });
                break;
        }

        // Spezifische Forschungs-Empfehlungen
        if (research.spionage >= 10) {
            recommendations.push({
                type: 'intel',
                priority: 'medium',
                text: 'Hohe Spionage-Forschung erkannt. Eigene Tarn-Einheiten verstärken.'
            });
        }

        if (research.sabotage >= 8) {
            recommendations.push({
                type: 'defense',
                priority: 'high',
                text: 'Sabotage-Gefahr! Produktionsanlagen schützen.'
            });
        }

        if (research.invasion >= 10) {
            recommendations.push({
                type: 'military',
                priority: 'high',
                text: 'Invasions-Bedrohung! Militärische Verteidigung verstärken.'
            });
        }

        return recommendations;
    }

    _assessStrategicValue(research) {
        const assessment = {
            primaryStrength: null,
            weaknesses: [],
            opportunities: [],
            overallRating: 'neutral'
        };

        // Stärken identifizieren
        let maxResearch = 0;
        let maxType = null;
        for (const [type, value] of Object.entries(research)) {
            if (value && value > maxResearch) {
                maxResearch = value;
                maxType = type;
            }
        }

        if (maxType && maxResearch > 5) {
            const typeNames = {
                spionage: 'Aufklärung',
                tarn: 'Tarnung',
                invasion: 'Invasion',
                pluender: 'Plünderung',
                sabotage: 'Sabotage'
            };
            assessment.primaryStrength = `${typeNames[maxType]} (Stufe ${maxResearch})`;
        }

        // Schwächen identifizieren
        for (const [type, value] of Object.entries(research)) {
            if (value !== null && value < 3) {
                const typeNames = {
                    spionage: 'Aufklärung',
                    tarn: 'Tarnung',
                    invasion: 'Invasion',
                    pluender: 'Plünderung',
                    sabotage: 'Sabotage'
                };
                assessment.weaknesses.push(`Schwache ${typeNames[type]} (Stufe ${value})`);
            }
        }

        // Gelegenheiten identifizieren
        if (research.tarn < 5) {
            assessment.opportunities.push('Geringe Tarn-Forschung - Spionage-Angriffe erfolgversprechend');
        }
        if (research.invasion < 7) {
            assessment.opportunities.push('Schwache Invasions-Abwehr - Eroberung möglich');
        }

        // Gesamtbewertung
        const avgResearch = Object.values(research).filter(v => v !== null).reduce((a, b) => a + b, 0) / 
                           Object.values(research).filter(v => v !== null).length;
        
        if (avgResearch < 3) assessment.overallRating = 'weak';
        else if (avgResearch < 7) assessment.overallRating = 'moderate';
        else if (avgResearch < 12) assessment.overallRating = 'strong';
        else assessment.overallRating = 'veryStrong';

        return assessment;
    }

    _generateSummary(threatAnalysis, strategicAssessment) {
        const summaryParts = [];
        
        summaryParts.push(`Bedrohungsstufe: ${threatAnalysis.label} (${threatAnalysis.percentage}%)`);
        
        if (strategicAssessment.primaryStrength) {
            summaryParts.push(`Hauptstärke: ${strategicAssessment.primaryStrength}`);
        }
        
        const ratingTexts = {
            weak: 'Schwaches Ziel - Angriff empfohlen',
            moderate: 'Moderates Ziel - Vorsicht geboten',
            strong: 'Starkes Ziel - Gut vorbereiten',
            veryStrong: 'Sehr starkes Ziel - Angriff riskant'
        };
        
        summaryParts.push(ratingTexts[strategicAssessment.overallRating] || 'Bewertung unbekannt');
        
        return summaryParts.join(' | ');
    }

    /**
     * Formatiert die Auswertung für die Anzeige in der UI
     * @param {Object} evaluation - Das Auswertungsergebnis
     * @returns {string} - HTML-formatierte Auswertung
     */
    formatEvaluationForUI(evaluation) {
        if (!evaluation) return '<p>Keine Auswertung verfügbar</p>';

        let html = '<div class="evaluation-result">';
        
        // Zusammenfassung
        html += `<div class="evaluation-summary">
            <h4>📊 Auswertung</h4>
            <p><strong>${evaluation.summary}</strong></p>
        </div>`;
        
        // Bedrohungsanalyse
        html += `<div class="threat-analysis">
            <h5>🚨 Bedrohungsanalyse</h5>
            <div class="threat-badge" style="background-color: ${evaluation.threat.color}20; color: ${evaluation.threat.color}; border: 1px solid ${evaluation.threat.color};">
                ${evaluation.threat.label} (${evaluation.threat.percentage}%)
            </div>
            <p><small>${evaluation.threat.description}</small></p>
        </div>`;
        
        // Empfehlungen
        if (evaluation.recommendations.length > 0) {
            html += '<div class="recommendations"><h5>💡 Empfehlungen</h5><ul>';
            for (const rec of evaluation.recommendations) {
                const icon = rec.type === 'attack' ? '⚔️' : rec.type === 'warning' ? '⚠️' : rec.type === 'defense' ? '🛡️' : '📋';
                html += `<li class="rec-${rec.priority}">${icon} ${rec.text}</li>`;
            }
            html += '</ul></div>';
        }
        
        html += '</div>';
        return html;
    }

    // Neue detaillierte Auswertungsmethoden
    _evaluateDetailedResearch(research) {
        const categories = {
            military: {
                name: 'Militärforschung',
                fields: ['spionage', 'tarn', 'invasion', 'pluender', 'sabotage'],
                weight: 0.4
            },
            civil: {
                name: 'Zivile Forschung',
                fields: ['bergbau', 'energie', 'schiffbau', 'verteidigung', 'antrieb', 'computer'],
                weight: 0.3
            },
            advanced: {
                name: 'Erweiterte Forschung',
                fields: ['waffen', 'schilde', 'panzerung', 'hyperraum'],
                weight: 0.3
            }
        };

        const evaluation = {
            categories: {},
            total: { score: 0, maxScore: 0, percentage: 0 }
        };

        let totalScore = 0;
        let maxScore = 0;

        for (const [catKey, category] of Object.entries(categories)) {
            let catScore = 0;
            let catMaxScore = 0;
            const fields = {};

            for (const field of category.fields) {
                const value = research[field];
                let score = 0;
                let rating = 'Unbekannt';

                if (value !== null && value !== undefined) {
                    if (value >= 15) {
                        score = 4; rating = 'Exzellent';
                    } else if (value >= 10) {
                        score = 3; rating = 'Hoch';
                    } else if (value >= 5) {
                        score = 2; rating = 'Mittel';
                    } else if (value > 0) {
                        score = 1; rating = 'Niedrig';
                    } else {
                        score = 0; rating = 'Nicht vorhanden';
                    }
                }

                fields[field] = { level: value, score, rating };
                catScore += score;
                catMaxScore += 4;
            }

            const catPercentage = catMaxScore > 0 ? Math.round((catScore / catMaxScore) * 100) : 0;
            evaluation.categories[catKey] = {
                name: category.name,
                fields: fields,
                score: catScore,
                maxScore: catMaxScore,
                percentage: catPercentage,
                weight: category.weight
            };

            totalScore += catScore * category.weight;
            maxScore += catMaxScore * category.weight;
        }

        evaluation.total = {
            score: totalScore,
            maxScore: maxScore,
            percentage: maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0
        };

        return evaluation;
    }

    _evaluateBuildings(buildings) {
        const categories = {
            economy: {
                name: 'Wirtschaftsgebäude',
                fields: ['metallmine', 'kristallmine', 'deuteriumraffinerie', 'sonnenkraftwerk', 'fusionskraftwerk'],
                weight: 0.3
            },
            infrastructure: {
                name: 'Infrastruktur',
                fields: ['roboterfabrik', 'werft', 'forschungslabor', 'metallspeicher', 'kristallspeicher', 'deuteriumtank'],
                weight: 0.4
            },
            defense: {
                name: 'Verteidigung',
                fields: ['raketenwerfer', 'leichteslaser', 'schwerelaser', 'ionenkanone', 'gausskanone', 'plasmawerfer', 'kleineschilde', 'grosseschilde'],
                weight: 0.3
            }
        };

        const evaluation = {
            categories: {},
            total: { score: 0, maxScore: 0, percentage: 0 }
        };

        let totalScore = 0;
        let maxScore = 0;

        for (const [catKey, category] of Object.entries(categories)) {
            let catScore = 0;
            let catMaxScore = 0;
            const fields = {};

            for (const field of category.fields) {
                const value = buildings[field];
                let score = 0;
                let rating = 'Unbekannt';

                if (value !== null && value !== undefined) {
                    if (catKey === 'defense') {
                        // Verteidigungsgebäude haben andere Bewertung
                        if (value >= 1000) {
                            score = 4; rating = 'Sehr stark';
                        } else if (value >= 100) {
                            score = 3; rating = 'Stark';
                        } else if (value >= 10) {
                            score = 2; rating = 'Mittel';
                        } else if (value > 0) {
                            score = 1; rating = 'Schwach';
                        } else {
                            score = 0; rating = 'Keine';
                        }
                    } else {
                        // Normale Gebäude
                        if (value >= 30) {
                            score = 4; rating = 'Maximal';
                        } else if (value >= 20) {
                            score = 3; rating = 'Hoch';
                        } else if (value >= 10) {
                            score = 2; rating = 'Mittel';
                        } else if (value > 0) {
                            score = 1; rating = 'Niedrig';
                        } else {
                            score = 0; rating = 'Nicht vorhanden';
                        }
                    }
                }

                fields[field] = { level: value, score, rating };
                catScore += score;
                catMaxScore += 4;
            }

            const catPercentage = catMaxScore > 0 ? Math.round((catScore / catMaxScore) * 100) : 0;
            evaluation.categories[catKey] = {
                name: category.name,
                fields: fields,
                score: catScore,
                maxScore: catMaxScore,
                percentage: catPercentage,
                weight: category.weight
            };

            totalScore += catScore * category.weight;
            maxScore += catMaxScore * category.weight;
        }

        evaluation.total = {
            score: totalScore,
            maxScore: maxScore,
            percentage: maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0
        };

        return evaluation;
    }

    _evaluateShips(ships) {
        const categories = {
            combat: {
                name: 'Kampfschiffe',
                fields: ['leichterjäger', 'schwererjäger', 'kreuzer', 'schlachtschiff', 'schlachtkreuzer', 'bomber', 'zerstörer', 'todesstern'],
                weight: 0.6
            },
            support: {
                name: 'Unterstützungsschiffe',
                fields: ['kleinerTransporter', 'grosserTransporter', 'kolonischiff', 'recycler', 'spionagesonde'],
                weight: 0.3
            },
            special: {
                name: 'Spezialschiffe',
                fields: ['solarsatellit'],
                weight: 0.1
            }
        };

        const evaluation = {
            categories: {},
            total: { score: 0, maxScore: 0, percentage: 0, fleetStrength: 0 }
        };

        let totalScore = 0;
        let maxScore = 0;
        let fleetStrength = 0;

        // Flottenstärke-Gewichtung
        const shipWeights = {
            leichterjäger: 1,
            schwererjäger: 2,
            kreuzer: 5,
            schlachtschiff: 10,
            schlachtkreuzer: 15,
            bomber: 8,
            zerstörer: 25,
            todesstern: 100
        };

        for (const [catKey, category] of Object.entries(categories)) {
            let catScore = 0;
            let catMaxScore = 0;
            const fields = {};

            for (const field of category.fields) {
                const value = ships[field];
                let score = 0;
                let rating = 'Unbekannt';

                if (value !== null && value !== undefined) {
                    if (catKey === 'combat') {
                        // Kampfschiffe
                        if (value >= 10000) {
                            score = 4; rating = 'Massive Flotte';
                        } else if (value >= 1000) {
                            score = 3; rating = 'Große Flotte';
                        } else if (value >= 100) {
                            score = 2; rating = 'Mittlere Flotte';
                        } else if (value > 0) {
                            score = 1; rating = 'Kleine Flotte';
                        } else {
                            score = 0; rating = 'Keine';
                        }

                        // Flottenstärke berechnen
                        if (shipWeights[field]) {
                            fleetStrength += value * shipWeights[field];
                        }
                    } else {
                        // Support-Schiffe
                        if (value >= 1000) {
                            score = 4; rating = 'Sehr viele';
                        } else if (value >= 100) {
                            score = 3; rating = 'Viele';
                        } else if (value >= 10) {
                            score = 2; rating = 'Einige';
                        } else if (value > 0) {
                            score = 1; rating = 'Wenige';
                        } else {
                            score = 0; rating = 'Keine';
                        }
                    }
                }

                fields[field] = { count: value, score, rating };
                catScore += score;
                catMaxScore += 4;
            }

            const catPercentage = catMaxScore > 0 ? Math.round((catScore / catMaxScore) * 100) : 0;
            evaluation.categories[catKey] = {
                name: category.name,
                fields: fields,
                score: catScore,
                maxScore: catMaxScore,
                percentage: catPercentage,
                weight: category.weight
            };

            totalScore += catScore * category.weight;
            maxScore += catMaxScore * category.weight;
        }

        evaluation.total = {
            score: totalScore,
            maxScore: maxScore,
            percentage: maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0,
            fleetStrength: fleetStrength
        };

        return evaluation;
    }

    _evaluateResources(resources) {
        const evaluation = {
            current: resources,
            assessment: {}
        };

        const resourceThresholds = {
            metall: { low: 50000, medium: 500000, high: 2000000 },
            kristall: { low: 25000, medium: 250000, high: 1000000 },
            deuterium: { low: 10000, medium: 100000, high: 500000 }
        };

        for (const [resource, value] of Object.entries(resources)) {
            if (value !== null && value !== undefined && resourceThresholds[resource]) {
                const thresholds = resourceThresholds[resource];
                let rating, description;

                if (value >= thresholds.high) {
                    rating = 'Sehr hoch';
                    description = 'Massive Ressourcenreserven';
                } else if (value >= thresholds.medium) {
                    rating = 'Hoch';
                    description = 'Gute Ressourcenreserven';
                } else if (value >= thresholds.low) {
                    rating = 'Mittel';
                    description = 'Moderate Ressourcenreserven';
                } else {
                    rating = 'Niedrig';
                    description = 'Geringe Ressourcenreserven';
                }

                evaluation.assessment[resource] = { rating, description, value };
            }
        }

        return evaluation;
    }

    _analyzeDetailedThreat(researchEval, buildingEval, shipEval) {
        // Gewichtete Bedrohungsanalyse
        const weights = {
            research: 0.4,
            buildings: 0.3,
            ships: 0.3
        };

        const totalPercentage = Math.round(
            (researchEval.total.percentage * weights.research) +
            (buildingEval.total.percentage * weights.buildings) +
            (shipEval.total.percentage * weights.ships)
        );

        let threatLevel = 'veryLow';
        for (const [level, config] of Object.entries(this.evaluationRules.threatLevels)) {
            if (totalPercentage >= config.min && totalPercentage <= config.max) {
                threatLevel = level;
                break;
            }
        }

        const threatConfig = this.evaluationRules.threatLevels[threatLevel];
        
        return {
            level: threatLevel,
            label: threatConfig.label,
            color: threatConfig.color,
            percentage: totalPercentage,
            description: this._getThreatDescription(threatLevel),
            components: {
                research: researchEval.total.percentage,
                buildings: buildingEval.total.percentage,
                ships: shipEval.total.percentage,
                fleetStrength: shipEval.total.fleetStrength
            }
        };
    }

    _generateDetailedRecommendations(research, buildings, ships, threatAnalysis) {
        const recommendations = [];

        // Bedrohungsbasierte Empfehlungen
        switch (threatAnalysis.level) {
            case 'veryLow':
            case 'low':
                recommendations.push({
                    type: 'attack',
                    priority: 'high',
                    text: 'Ideales Angriffsziel. Schwache Entwicklung in allen Bereichen.'
                });
                break;
            case 'medium':
                recommendations.push({
                    type: 'caution',
                    priority: 'medium',
                    text: 'Vorsichtiger Angriff empfohlen. Mittlere Entwicklung erkannt.'
                });
                break;
            case 'high':
            case 'veryHigh':
                recommendations.push({
                    type: 'warning',
                    priority: 'high',
                    text: 'Angriff nicht empfohlen. Starke Entwicklung in mehreren Bereichen.'
                });
                break;
        }

        // Flotten-spezifische Empfehlungen
        if (threatAnalysis.components.fleetStrength > 50000) {
            recommendations.push({
                type: 'military',
                priority: 'high',
                text: `Massive Flotte erkannt (Stärke: ${threatAnalysis.components.fleetStrength}). Extrem gefährlich!`
            });
        } else if (threatAnalysis.components.fleetStrength > 10000) {
            recommendations.push({
                type: 'caution',
                priority: 'medium',
                text: `Starke Flotte vorhanden (Stärke: ${threatAnalysis.components.fleetStrength}). Vorsicht geboten.`
            });
        }

        // Forschungs-spezifische Empfehlungen
        if (research.spionage >= 12) {
            recommendations.push({
                type: 'intel',
                priority: 'medium',
                text: 'Sehr hohe Spionage-Forschung. Eigene Tarn-Einheiten verstärken!'
            });
        }

        if (research.verteidigung >= 10) {
            recommendations.push({
                type: 'defense',
                priority: 'high',
                text: 'Starke Verteidigungsforschung. Angriff wird schwierig.'
            });
        }

        // Gebäude-spezifische Empfehlungen
        const defenseBuildings = ['raketenwerfer', 'leichteslaser', 'schwerelaser', 'ionenkanone', 'gausskanone', 'plasmawerfer'];
        const totalDefense = defenseBuildings.reduce((sum, building) => sum + (buildings[building] || 0), 0);
        
        if (totalDefense > 5000) {
            recommendations.push({
                type: 'warning',
                priority: 'high',
                text: `Massive Verteidigungsanlagen (${totalDefense} Einheiten). Angriff aussichtslos.`
            });
        } else if (totalDefense > 1000) {
            recommendations.push({
                type: 'caution',
                priority: 'medium',
                text: `Starke Verteidigungsanlagen (${totalDefense} Einheiten). Große Flotte nötig.`
            });
        }

        return recommendations;
    }

    _assessDetailedStrategicValue(research, buildings, ships, resources) {
        const assessment = {
            primaryStrengths: [],
            weaknesses: [],
            opportunities: [],
            threats: [],
            overallRating: 'neutral',
            economicStrength: 'unknown',
            militaryStrength: 'unknown'
        };

        // Stärken identifizieren
        if (research.spionage >= 10) assessment.primaryStrengths.push(`Starke Aufklärung (${research.spionage})`);
        if (research.invasion >= 12) assessment.primaryStrengths.push(`Hohe Invasionskapazität (${research.invasion})`);
        if (ships.schlachtschiff >= 1000) assessment.primaryStrengths.push(`Große Schlachtschiff-Flotte (${ships.schlachtschiff})`);
        if (buildings.werft >= 20) assessment.primaryStrengths.push(`Hochentwickelte Werft (${buildings.werft})`);

        // Schwächen identifizieren
        if (research.tarn < 5) assessment.weaknesses.push(`Schwache Tarnung (${research.tarn})`);
        if (research.verteidigung < 8) assessment.weaknesses.push(`Geringe Verteidigungsforschung (${research.verteidigung})`);
        
        const totalDefense = ['raketenwerfer', 'leichteslaser', 'schwerelaser'].reduce((sum, def) => sum + (buildings[def] || 0), 0);
        if (totalDefense < 100) assessment.weaknesses.push(`Schwache Verteidigung (${totalDefense} Einheiten)`);

        // Gelegenheiten identifizieren
        if (research.tarn < 8) assessment.opportunities.push('Spionage-Angriffe erfolgversprechend');
        if (totalDefense < 500) assessment.opportunities.push('Direkter Angriff möglich');
        if (resources.metall < 100000) assessment.opportunities.push('Geringe Ressourcenreserven - Raid lohnend');

        // Bedrohungen identifizieren
        if (ships.zerstörer > 0) assessment.threats.push(`Zerstörer vorhanden (${ships.zerstörer})`);
        if (research.sabotage >= 8) assessment.threats.push('Sabotage-Gefahr für eigene Anlagen');

        // Gesamtbewertung
        const avgResearch = Object.values(research).filter(v => v !== null).reduce((a, b) => a + b, 0) / 
                           Object.values(research).filter(v => v !== null).length;
        
        if (avgResearch < 5) assessment.overallRating = 'weak';
        else if (avgResearch < 8) assessment.overallRating = 'moderate';
        else if (avgResearch < 12) assessment.overallRating = 'strong';
        else assessment.overallRating = 'veryStrong';

        // Wirtschaftsstärke
        const economicBuildings = buildings.metallmine + buildings.kristallmine + buildings.deuteriumraffinerie;
        if (economicBuildings > 60) assessment.economicStrength = 'strong';
        else if (economicBuildings > 30) assessment.economicStrength = 'moderate';
        else assessment.economicStrength = 'weak';

        // Militärstärke
        const totalFleet = Object.values(ships).filter(v => v !== null).reduce((a, b) => a + b, 0);
        if (totalFleet > 10000) assessment.militaryStrength = 'veryStrong';
        else if (totalFleet > 1000) assessment.militaryStrength = 'strong';
        else if (totalFleet > 100) assessment.militaryStrength = 'moderate';
        else assessment.militaryStrength = 'weak';

        return assessment;
    }

    _generateDetailedSummary(threatAnalysis, strategicAssessment, buildingEval, shipEval) {
        const parts = [];
        
        parts.push(`Bedrohung: ${threatAnalysis.label} (${threatAnalysis.percentage}%)`);
        parts.push(`Wirtschaft: ${strategicAssessment.economicStrength}`);
        parts.push(`Militär: ${strategicAssessment.militaryStrength}`);
        
        if (threatAnalysis.components.fleetStrength > 10000) {
            parts.push(`Flottenstärke: ${threatAnalysis.components.fleetStrength}`);
        }
        
        const ratingTexts = {
            weak: 'Schwaches Ziel',
            moderate: 'Moderates Ziel', 
            strong: 'Starkes Ziel',
            veryStrong: 'Sehr starkes Ziel'
        };
        
        parts.push(ratingTexts[strategicAssessment.overallRating] || 'Unbekannt');
        
        return parts.join(' | ');
    }

    /**
     * Formatiert die detaillierte Auswertung für die Anzeige in der UI
     */
    formatDetailedEvaluationForUI(evaluation) {
        if (!evaluation) return '<p>Keine Auswertung verfügbar</p>';

        let html = '<div class="detailed-evaluation-result">';
        
        // Zusammenfassung
        html += `<div class="evaluation-summary">
            <h4>📊 Detaillierte Auswertung</h4>
            <p><strong>${evaluation.summary}</strong></p>
        </div>`;
        
        // Bedrohungsanalyse
        html += `<div class="threat-analysis">
            <h5>🚨 Bedrohungsanalyse</h5>
            <div class="threat-badge" style="background-color: ${evaluation.threat.color}20; color: ${evaluation.threat.color}; border: 1px solid ${evaluation.threat.color};">
                ${evaluation.threat.label} (${evaluation.threat.percentage}%)
            </div>
            <p><small>${evaluation.threat.description}</small></p>
            <div class="threat-breakdown">
                <small>Forschung: ${evaluation.threat.components.research}% | Gebäude: ${evaluation.threat.components.buildings}% | Schiffe: ${evaluation.threat.components.ships}%</small>
            </div>
        </div>`;

        // Forschungsauswertung
        if (evaluation.research) {
            html += '<div class="research-evaluation"><h5>🔬 Forschung</h5>';
            for (const [catKey, category] of Object.entries(evaluation.research.categories)) {
                html += `<div class="category-section">
                    <h6>${category.name} (${category.percentage}%)</h6>
                    <div class="fields-grid">`;
                for (const [fieldKey, field] of Object.entries(category.fields)) {
                    if (field.level !== null) {
                        html += `<span class="field-item">${this._formatFieldName(fieldKey)}: ${field.level} (${field.rating})</span>`;
                    }
                }
                html += '</div></div>';
            }
            html += '</div>';
        }

        // Gebäudeauswertung
        if (evaluation.buildings) {
            html += '<div class="buildings-evaluation"><h5>🏗️ Gebäude</h5>';
            for (const [catKey, category] of Object.entries(evaluation.buildings.categories)) {
                html += `<div class="category-section">
                    <h6>${category.name} (${category.percentage}%)</h6>
                    <div class="fields-grid">`;
                for (const [fieldKey, field] of Object.entries(category.fields)) {
                    if (field.level !== null && field.level > 0) {
                        html += `<span class="field-item">${this._formatFieldName(fieldKey)}: ${field.level} (${field.rating})</span>`;
                    }
                }
                html += '</div></div>';
            }
            html += '</div>';
        }

        // Schiffsauswertung
        if (evaluation.ships) {
            html += '<div class="ships-evaluation"><h5>🚀 Flotte</h5>';
            if (evaluation.ships.total.fleetStrength > 0) {
                html += `<p><strong>Flottenstärke: ${evaluation.ships.total.fleetStrength}</strong></p>`;
            }
            for (const [catKey, category] of Object.entries(evaluation.ships.categories)) {
                html += `<div class="category-section">
                    <h6>${category.name} (${category.percentage}%)</h6>
                    <div class="fields-grid">`;
                for (const [fieldKey, field] of Object.entries(category.fields)) {
                    if (field.count !== null && field.count > 0) {
                        html += `<span class="field-item">${this._formatFieldName(fieldKey)}: ${field.count} (${field.rating})</span>`;
                    }
                }
                html += '</div></div>';
            }
            html += '</div>';
        }

        // Empfehlungen
        if (evaluation.recommendations.length > 0) {
            html += '<div class="recommendations"><h5>💡 Empfehlungen</h5><ul>';
            for (const rec of evaluation.recommendations) {
                const icon = rec.type === 'attack' ? '⚔️' : rec.type === 'warning' ? '⚠️' : rec.type === 'defense' ? '🛡️' : rec.type === 'military' ? '🚀' : '📋';
                html += `<li class="rec-${rec.priority}">${icon} ${rec.text}</li>`;
            }
            html += '</ul></div>';
        }
        
        html += '</div>';
        return html;
    }

    _formatFieldName(fieldKey) {
        const names = {
            // Forschung
            spionage: 'Spionage',
            tarn: 'Tarnung',
            invasion: 'Invasion',
            pluender: 'Plünderung',
            sabotage: 'Sabotage',
            bergbau: 'Bergbau',
            energie: 'Energie',
            schiffbau: 'Schiffbau',
            verteidigung: 'Verteidigung',
            antrieb: 'Antrieb',
            computer: 'Computer',
            waffen: 'Waffen',
            schilde: 'Schilde',
            panzerung: 'Panzerung',
            hyperraum: 'Hyperraum',
            
            // Gebäude
            metallmine: 'Metallmine',
            kristallmine: 'Kristallmine',
            deuteriumraffinerie: 'Deuteriumraffinerie',
            sonnenkraftwerk: 'Sonnenkraftwerk',
            fusionskraftwerk: 'Fusionskraftwerk',
            roboterfabrik: 'Roboterfabrik',
            werft: 'Werft',
            forschungslabor: 'Forschungslabor',
            raketenwerfer: 'Raketenwerfer',
            leichteslaser: 'Leichtes Laser',
            schwerelaser: 'Schweres Laser',
            
            // Schiffe
            leichterjäger: 'Leichter Jäger',
            schwererjäger: 'Schwerer Jäger',
            kreuzer: 'Kreuzer',
            schlachtschiff: 'Schlachtschiff',
            schlachtkreuzer: 'Schlachtkreuzer',
            bomber: 'Bomber',
            zerstörer: 'Zerstörer',
            todesstern: 'Todesstern',
            kleinerTransporter: 'Kleiner Transporter',
            grosserTransporter: 'Großer Transporter'
        };
        
        return names[fieldKey] || fieldKey;
    }
}

// Globale Instanz erstellen
window.SpyEvaluator = new SpyEvaluator();