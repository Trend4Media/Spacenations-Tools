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
			const research = this._extractResearch(textContent);

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
			const planetNameMatch = beforeParen.match(/([A-Za-z0-9ÄÖÜäöüß _\-]{2,})\s*$/);
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
}

window.SpyParser = new SpyReportParser();