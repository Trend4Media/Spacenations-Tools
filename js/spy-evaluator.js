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
            const research = parsed.research || {};
            
            // Basis-Auswertung der Forschungsstufen
            const researchEvaluation = this._evaluateResearch(research);
            
            // Bedrohungsanalyse
            const threatAnalysis = this._analyzeThreat(researchEvaluation);
            
            // Empfehlungen generieren
            const recommendations = this._generateRecommendations(research, threatAnalysis);
            
            // Strategische Einschätzung
            const strategicAssessment = this._assessStrategicValue(research);
            
            const evaluation = {
                timestamp: new Date().toISOString(),
                research: researchEvaluation,
                threat: threatAnalysis,
                strategic: strategicAssessment,
                recommendations: recommendations,
                summary: this._generateSummary(threatAnalysis, strategicAssessment)
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
}

// Globale Instanz erstellen
window.SpyEvaluator = new SpyEvaluator();