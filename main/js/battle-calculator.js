/**
 * BattleCalculator - Kampfrechner für Spacenations
 * Berechnet Stabilität-Verlust (Vorwärts) und benötigte Angriffspunkte (Rückwärts)
 * 
 * Basiert auf der Formel:
 * Schaden = (Angriff - Panzerung) / maxBattleDuration * Kampfdauer
 */

class BattleCalculator {
    constructor(maxBattleDuration = 100) {
        this.maxBattleDuration = maxBattleDuration;
    }

    /**
     * Berechnet den effektiven Angriff nach Panzerung
     * @param {number} attack - Angriffspunkte
     * @param {number} armor - Panzerung
     * @returns {number} Effektiver Angriff (mindestens 0)
     */
    calculateEffectiveAttack(attack, armor) {
        return Math.max(0, attack - armor);
    }

    /**
     * Berechnet den Schaden basierend auf Angriff und Dauer
     * @param {number} effectiveAttack - Effektiver Angriff
     * @param {number} duration - Kampfdauer in Sekunden
     * @returns {number} Verursachter Schaden
     */
    calculateDamageDealt(effectiveAttack, duration) {
        return (effectiveAttack / this.maxBattleDuration) * duration;
    }

    /**
     * VORWÄRTSRECHNUNG: Wie viel Stabilität geht verloren?
     * @param {number} attack - Angriffspunkte
     * @param {number} armor - Panzerung
     * @param {number} duration - Kampfdauer in Sekunden
     * @returns {number} Stabilitätsverlust
     */
    stabilityLoss(attack, armor, duration) {
        const effectiveAttack = this.calculateEffectiveAttack(attack, armor);
        return this.calculateDamageDealt(effectiveAttack, duration);
    }

    /**
     * RÜCKWÄRTSRECHNUNG: Wie viel Angriff ist nötig für X Stabilitätsverlust?
     * @param {number} stability - Gewünschter Stabilitätsverlust
     * @param {number} armor - Panzerung des Ziels
     * @param {number} duration - Kampfdauer in Sekunden
     * @returns {number} Benötigte Angriffspunkte
     */
    requiredAttack(stability, armor, duration) {
        // Formel: stability = ((attack - armor) / maxBattleDuration) * duration
        // => attack = (stability * maxBattleDuration / duration) + armor
        return (stability * this.maxBattleDuration / duration) + armor;
    }

    /**
     * Berechnet die Zeit, die benötigt wird, um X Stabilität abzubauen
     * @param {number} stability - Gewünschter Stabilitätsverlust
     * @param {number} attack - Verfügbare Angriffspunkte
     * @param {number} armor - Panzerung des Ziels
     * @returns {number} Benötigte Zeit in Sekunden
     */
    requiredTime(stability, attack, armor) {
        const effectiveAttack = this.calculateEffectiveAttack(attack, armor);
        if (effectiveAttack <= 0) {
            return Infinity; // Unmöglich, Schaden zu verursachen
        }
        return (stability * this.maxBattleDuration) / effectiveAttack;
    }

    /**
     * Validiert Eingabewerte
     * @param {Object} values - Werte zum Validieren
     * @returns {Object} Validierungsergebnis
     */
    validateInputs(values) {
        const errors = [];
        
        Object.entries(values).forEach(([key, value]) => {
            if (value === null || value === undefined || value === '') {
                errors.push(`${key} ist erforderlich`);
            } else if (isNaN(value) || value < 0) {
                errors.push(`${key} muss eine positive Zahl sein`);
            }
        });

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Formatiert Zahlen für die Anzeige
     * @param {number} value - Zu formatierender Wert
     * @param {number} decimals - Anzahl Dezimalstellen
     * @returns {string} Formatierte Zahl
     */
    formatNumber(value, decimals = 2) {
        if (value === Infinity) {
            return '∞';
        }
        return new Intl.NumberFormat('de-DE', {
            minimumFractionDigits: 0,
            maximumFractionDigits: decimals
        }).format(value);
    }
}

// Global verfügbar machen
window.BattleCalculator = BattleCalculator;

// Beispielnutzung und Tests
if (typeof console !== 'undefined') {
    console.log('🧮 BattleCalculator geladen');
    
    // Test mit den Beispielwerten aus dem Prompt
    const calc = new BattleCalculator(100);
    
    // Test 1: 156.897 Stabilität und 3.241 Panzer in 78 Sekunden
    const neededAttack1 = calc.requiredAttack(156897, 3241, 78);
    console.log(`Test 1 - Benötigter Angriff: ${calc.formatNumber(neededAttack1, 0)}`);
    
    // Test 2: Flotte mit 832.312 Stabilität und 12.324 Panzer, Dauer 100 Sek.
    const neededAttack2 = calc.requiredAttack(832312, 12324, 100);
    console.log(`Test 2 - Benötigter Angriff: ${calc.formatNumber(neededAttack2, 0)}`);
    
    // Gegenprobe: Wie viel Stabilität geht mit diesem Angriff verloren?
    const actualLoss1 = calc.stabilityLoss(neededAttack1, 3241, 78);
    const actualLoss2 = calc.stabilityLoss(neededAttack2, 12324, 100);
    console.log(`Gegenprobe 1 - Tatsächlicher Verlust: ${calc.formatNumber(actualLoss1, 0)}`);
    console.log(`Gegenprobe 2 - Tatsächlicher Verlust: ${calc.formatNumber(actualLoss2, 0)}`);
}