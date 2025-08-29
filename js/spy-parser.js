class SpyReportParser {
    /**
	 * Parse a raw spy report HTML/text into structured data
	 * Returns null on failure with an error in result.error
	 */
    parse(rawHtml) {
        try {
            if (!rawHtml || typeof rawHtml !== 'string') {
                return { success: false, error: 'Leerer Bericht' };
            }

            const doc = new DOMParser().parseFromString(rawHtml, 'text/html');
            const textContent = this._normalizeWhitespace(doc.body ? doc.body.textContent || '' : rawHtml);

            const { planetName, coords } = this._extractPlanetAndCoords(textContent);
            const playerName = this._extractPlayerName(textContent);
            const research = this._extractDetailedResearch(textContent);
            const buildings = this._extractBuildings(textContent);
            const ships = this._extractShips(textContent);
            const resources = this._extractResources(textContent);

            if (!playerName && !planetName && !coords?.raw) {
                return { success: false, error: 'Konnte keine Kerninformationen finden' };
            }

            return {
                success: true,
                data: {
                    targetPlayer: playerName || null,
                    planetName: planetName || null,
                    coords: coords || null,
                    research,
                    buildings,
                    ships,
                    resources,
                    // Legacy support für alte Auswertungen
                    research_legacy: this._extractResearch(textContent)
                }
            };
        } catch (error) {
            return { success: false, error: 'Parser-Fehler: ' + (error?.message || String(error)) };
        }
    }

    _normalizeWhitespace(str) {
        return String(str)
            .replace(/\u00A0/g, ' ')
            .replace(/[\t\r\n]+/g, '\n')
            .replace(/\s{2,}/g, ' ')
            .trim();
    }

    _extractPlayerName(text) {
        // Beispiele:
        // "Der Spieler der spioniert wurde ist : SirDaiking"
        // "Spieler: SirDaiking"
        const patterns = [
            /Spieler\s*:\s*([^\n\r]+)/i,
            /Spieler[^:]*ist\s*:\s*([^\n\r]+)/i,
            /der\s+spioniert\s+wurde\s+ist\s*:\s*([^\n\r]+)/i
        ];
        for (const regex of patterns) {
            const match = text.match(regex);
            if (match && match[1]) {
                return match[1].trim();
            }
        }
        return null;
    }

    _extractPlanetAndCoords(text) {
        // Beispiel: "Planet der spioniert wurde ist : TEMPEL (555:849:4)"
        // oder "Planet: TEMPEL (555:849:4)"
        const lineMatch = text.match(/([^\n\r]*?)\(\s*(\d{1,3}:\d{1,3}:\d{1,3})\s*\)/);
        let planetName = null;
        let coords = null;
        if (lineMatch) {
            const beforeParen = lineMatch[1] || '';
            const coordStr = lineMatch[2];
            coords = this._parseCoords(coordStr);
            // Versuche Planetennamen aus dem Text vor den Klammern zu extrahieren
            // Suche das letzte Wort oder Wortgruppe vor der Klammer
            const planetNameMatch = beforeParen.match(/([A-Za-z0-9ÄÖÜäöüß _-]{2,})\s*$/);
            if (planetNameMatch) {
                planetName = planetNameMatch[1].trim();
            }
        }
        return { planetName, coords };
    }

    _parseCoords(raw) {
        if (!raw) return null;
        const parts = raw.split(':').map(p => parseInt(p, 10));
        if (parts.length !== 3 || parts.some(isNaN)) return { raw };
        return { raw, galaxy: parts[0], system: parts[1], position: parts[2] };
    }

    _extractResearch(text) {
        // Unterstütze Umlaute und Schreibvarianten
        const entries = [
            { key: 'spionage', labels: [/Spionageeinheit/i, /Spionage\s*einheit/i] },
            { key: 'tarn', labels: [/Tarn(?:einheit)?/i] },
            { key: 'invasion', labels: [/Invasionseinheit/i, /Invasion\s*einheit/i] },
            { key: 'pluender', labels: [/Pl[üu]nder(?:einheit)?/i] },
            { key: 'sabotage', labels: [/Sabotageeinheit/i, /Sabotage\s*einheit/i] }
        ];

        const research = { spionage: null, tarn: null, invasion: null, pluender: null, sabotage: null };

        for (const entry of entries) {
            for (const label of entry.labels) {
                const regex = new RegExp(label.source + '\\s*[:=]?\\s*(\\d{1,4})', 'i');
                const match = text.match(regex);
                if (match && match[1]) {
                    research[entry.key] = parseInt(match[1], 10);
                    break;
                }
            }
        }
        return research;
    }

    _extractDetailedResearch(text) {
        // Erweiterte Forschungsextraktion mit mehr Details
        const research = {
            // Militärforschung
            spionage: null,
            tarn: null,
            invasion: null,
            pluender: null,
            sabotage: null,
            // Zivile Forschung
            bergbau: null,
            energie: null,
            schiffbau: null,
            verteidigung: null,
            antrieb: null,
            computer: null,
            // Erweiterte Forschung
            waffen: null,
            schilde: null,
            panzerung: null,
            hyperraum: null
        };

        const researchPatterns = [
            // Militär
            { key: 'spionage', patterns: [/Spionage(?:einheit|forschung)?\s*[:=]?\s*(\d{1,4})/i] },
            { key: 'tarn', patterns: [/Tarn(?:einheit|forschung)?\s*[:=]?\s*(\d{1,4})/i] },
            { key: 'invasion', patterns: [/Invasion(?:seinheit|sforschung)?\s*[:=]?\s*(\d{1,4})/i] },
            { key: 'pluender', patterns: [/Pl[üu]nder(?:einheit|forschung)?\s*[:=]?\s*(\d{1,4})/i] },
            { key: 'sabotage', patterns: [/Sabotage(?:einheit|forschung)?\s*[:=]?\s*(\d{1,4})/i] },
            
            // Zivil
            { key: 'bergbau', patterns: [/Bergbau(?:forschung)?\s*[:=]?\s*(\d{1,4})/i] },
            { key: 'energie', patterns: [/Energie(?:forschung)?\s*[:=]?\s*(\d{1,4})/i] },
            { key: 'schiffbau', patterns: [/Schiffbau(?:forschung)?\s*[:=]?\s*(\d{1,4})/i] },
            { key: 'verteidigung', patterns: [/Verteidigungs?(?:forschung)?\s*[:=]?\s*(\d{1,4})/i] },
            { key: 'antrieb', patterns: [/Antrieb(?:sforschung)?\s*[:=]?\s*(\d{1,4})/i] },
            { key: 'computer', patterns: [/Computer(?:forschung)?\s*[:=]?\s*(\d{1,4})/i] },
            
            // Erweitert
            { key: 'waffen', patterns: [/Waffen(?:forschung)?\s*[:=]?\s*(\d{1,4})/i] },
            { key: 'schilde', patterns: [/Schild(?:e|forschung)?\s*[:=]?\s*(\d{1,4})/i] },
            { key: 'panzerung', patterns: [/Panzerung(?:sforschung)?\s*[:=]?\s*(\d{1,4})/i] },
            { key: 'hyperraum', patterns: [/Hyperraum(?:forschung)?\s*[:=]?\s*(\d{1,4})/i] }
        ];

        for (const entry of researchPatterns) {
            for (const pattern of entry.patterns) {
                const match = text.match(pattern);
                if (match && match[1]) {
                    research[entry.key] = parseInt(match[1], 10);
                    break;
                }
            }
        }

        return research;
    }

    _extractBuildings(text) {
        const buildings = {
            // Ressourcengebäude
            metallmine: null,
            kristallmine: null,
            deuteriumraffinerie: null,
            sonnenkraftwerk: null,
            fusionskraftwerk: null,
            
            // Produktionsgebäude
            roboterfabrik: null,
            werft: null,
            metallspeicher: null,
            kristallspeicher: null,
            deuteriumtank: null,
            
            // Forschungsgebäude
            forschungslabor: null,
            terraformer: null,
            allianzdepo: null,
            
            // Verteidigung
            raketenwerfer: null,
            leichteslaser: null,
            schwerelaser: null,
            ionenkanone: null,
            gausskanone: null,
            plasmawerfer: null,
            kleineschilde: null,
            grosseschilde: null
        };

        const buildingPatterns = [
            // Ressourcen
            { key: 'metallmine', patterns: [/Metallmine\s*[:=]?\s*(\d{1,3})/i] },
            { key: 'kristallmine', patterns: [/Kristallmine\s*[:=]?\s*(\d{1,3})/i] },
            { key: 'deuteriumraffinerie', patterns: [/Deuterium(?:raffinerie|synthesizer)\s*[:=]?\s*(\d{1,3})/i] },
            { key: 'sonnenkraftwerk', patterns: [/Sonnenkraftwerk\s*[:=]?\s*(\d{1,3})/i] },
            { key: 'fusionskraftwerk', patterns: [/Fusionskraftwerk\s*[:=]?\s*(\d{1,3})/i] },
            
            // Produktion
            { key: 'roboterfabrik', patterns: [/Roboterfabrik\s*[:=]?\s*(\d{1,3})/i] },
            { key: 'werft', patterns: [/Werft\s*[:=]?\s*(\d{1,3})/i] },
            { key: 'metallspeicher', patterns: [/Metallspeicher\s*[:=]?\s*(\d{1,3})/i] },
            { key: 'kristallspeicher', patterns: [/Kristallspeicher\s*[:=]?\s*(\d{1,3})/i] },
            { key: 'deuteriumtank', patterns: [/Deuteriumtank\s*[:=]?\s*(\d{1,3})/i] },
            
            // Forschung
            { key: 'forschungslabor', patterns: [/Forschungslabor\s*[:=]?\s*(\d{1,3})/i] },
            { key: 'terraformer', patterns: [/Terraformer\s*[:=]?\s*(\d{1,3})/i] },
            { key: 'allianzdepo', patterns: [/Allianz(?:depot|depo)\s*[:=]?\s*(\d{1,3})/i] },
            
            // Verteidigung
            { key: 'raketenwerfer', patterns: [/Raketenwerfer\s*[:=]?\s*(\d{1,6})/i] },
            { key: 'leichteslaser', patterns: [/Leichte(?:s)?\s*Laser(?:geschütz)?\s*[:=]?\s*(\d{1,6})/i] },
            { key: 'schwerelaser', patterns: [/Schwere(?:s)?\s*Laser(?:geschütz)?\s*[:=]?\s*(\d{1,6})/i] },
            { key: 'ionenkanone', patterns: [/Ionenkanone\s*[:=]?\s*(\d{1,6})/i] },
            { key: 'gausskanone', patterns: [/Gau(?:ss|ß)kanone\s*[:=]?\s*(\d{1,6})/i] },
            { key: 'plasmawerfer', patterns: [/Plasmawerfer\s*[:=]?\s*(\d{1,6})/i] },
            { key: 'kleineschilde', patterns: [/Kleine(?:r|s)?\s*Schild(?:kuppel)?\s*[:=]?\s*(\d{1,3})/i] },
            { key: 'grosseschilde', patterns: [/Gro(?:ss|ß)e(?:r|s)?\s*Schild(?:kuppel)?\s*[:=]?\s*(\d{1,3})/i] }
        ];

        for (const entry of buildingPatterns) {
            for (const pattern of entry.patterns) {
                const match = text.match(pattern);
                if (match && match[1]) {
                    buildings[entry.key] = parseInt(match[1], 10);
                    break;
                }
            }
        }

        return buildings;
    }

    _extractShips(text) {
        const ships = {
            // Kampfschiffe
            leichterjäger: null,
            schwererjäger: null,
            kreuzer: null,
            schlachtschiff: null,
            schlachtkreuzer: null,
            bomber: null,
            zerstörer: null,
            todesstern: null,
            
            // Zivile Schiffe
            kleinerTransporter: null,
            grosserTransporter: null,
            kolonischiff: null,
            recycler: null,
            spionagesonde: null,
            
            // Spezialschiffe
            solarsatellit: null
        };

        const shipPatterns = [
            // Kampf
            { key: 'leichterjäger', patterns: [/Leichte(?:r|s)?\s*J[äa]ger\s*[:=]?\s*(\d{1,8})/i] },
            { key: 'schwererjäger', patterns: [/Schwere(?:r|s)?\s*J[äa]ger\s*[:=]?\s*(\d{1,8})/i] },
            { key: 'kreuzer', patterns: [/Kreuzer\s*[:=]?\s*(\d{1,8})/i] },
            { key: 'schlachtschiff', patterns: [/Schlachtschiff\s*[:=]?\s*(\d{1,8})/i] },
            { key: 'schlachtkreuzer', patterns: [/Schlachtkreuzer\s*[:=]?\s*(\d{1,8})/i] },
            { key: 'bomber', patterns: [/Bomber\s*[:=]?\s*(\d{1,8})/i] },
            { key: 'zerstörer', patterns: [/Zerst[öo]rer\s*[:=]?\s*(\d{1,8})/i] },
            { key: 'todesstern', patterns: [/Todesstern\s*[:=]?\s*(\d{1,8})/i] },
            
            // Zivil
            { key: 'kleinerTransporter', patterns: [/Kleine(?:r|s)?\s*Transporter\s*[:=]?\s*(\d{1,8})/i] },
            { key: 'grosserTransporter', patterns: [/Gro(?:ss|ß)e(?:r|s)?\s*Transporter\s*[:=]?\s*(\d{1,8})/i] },
            { key: 'kolonischiff', patterns: [/Koloni(?:e|schiff)\s*[:=]?\s*(\d{1,8})/i] },
            { key: 'recycler', patterns: [/Recycler\s*[:=]?\s*(\d{1,8})/i] },
            { key: 'spionagesonde', patterns: [/Spionagesonde\s*[:=]?\s*(\d{1,8})/i] },
            
            // Spezial
            { key: 'solarsatellit', patterns: [/Solarsatellit\s*[:=]?\s*(\d{1,8})/i] }
        ];

        for (const entry of shipPatterns) {
            for (const pattern of entry.patterns) {
                const match = text.match(pattern);
                if (match && match[1]) {
                    ships[entry.key] = parseInt(match[1], 10);
                    break;
                }
            }
        }

        return ships;
    }

    _extractResources(text) {
        const resources = {
            metall: null,
            kristall: null,
            deuterium: null,
            energie: null
        };

        const resourcePatterns = [
            { key: 'metall', patterns: [/Metall\s*[:=]?\s*([\d.,]+)/i] },
            { key: 'kristall', patterns: [/Kristall\s*[:=]?\s*([\d.,]+)/i] },
            { key: 'deuterium', patterns: [/Deuterium\s*[:=]?\s*([\d.,]+)/i] },
            { key: 'energie', patterns: [/Energie\s*[:=]?\s*([\d.,\-+]+)/i] }
        ];

        for (const entry of resourcePatterns) {
            for (const pattern of entry.patterns) {
                const match = text.match(pattern);
                if (match && match[1]) {
                    // Entferne Punkte und Kommas für große Zahlen
                    const cleanNumber = match[1].replace(/[.,]/g, '');
                    const parsed = parseInt(cleanNumber, 10);
                    if (!isNaN(parsed)) {
                        resources[entry.key] = parsed;
                    }
                    break;
                }
            }
        }

        return resources;
    }
}

window.SpyParser = new SpyReportParser();