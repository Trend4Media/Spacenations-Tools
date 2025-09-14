#!/usr/bin/env node

/**
 * SPACENATIONS TOOLS - BUILD SCRIPT
 * Optimiert alle Dateien für die Produktion
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Konfiguration
const config = {
    rootDir: path.join(__dirname, '..'),
    srcDir: path.join(__dirname, '..'), // Verwende Root-Verzeichnis statt main/
    distDir: path.join(__dirname, '..', 'dist'),
    isProduction: process.env.NODE_ENV === 'production'
};

// Hilfsfunktionen
const log = (message, type = 'info') => {
    const prefix = {
        info: '🔧',
        success: '✅',
        error: '❌',
        warn: '⚠️'
    };
    console.log(`${prefix[type]} ${message}`);
};

const ensureDir = (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
};

const copyFile = (src, dest) => {
    ensureDir(path.dirname(dest));
    fs.copyFileSync(src, dest);
};

// Build-Prozess
const build = () => {
    log('Build-Prozess gestartet...');
    
    try {
        // Dist-Verzeichnis vorbereiten
        if (fs.existsSync(config.distDir)) {
            fs.rmSync(config.distDir, { recursive: true });
        }
        ensureDir(config.distDir);
        
        // HTML-Dateien aus Root kopieren und optimieren
        log('HTML-Dateien werden verarbeitet...');
        const htmlFiles = fs.readdirSync(config.srcDir)
            .filter(file => file.endsWith('.html') && !file.startsWith('.'));
        
        htmlFiles.forEach(file => {
            const srcPath = path.join(config.srcDir, file);
            const destPath = path.join(config.distDir, file);
            
            let content = fs.readFileSync(srcPath, 'utf8');
            
            // Für Produktion: Debug-Ausgaben entfernen
            if (config.isProduction) {
                // Config.js so modifizieren, dass Produktionsmodus aktiviert ist
                content = content.replace(
                    '<script src="js/config.js"></script>',
                    '<script src="js/config.js"></script>\n    <script>enableProductionMode();</script>'
                );
            }
            
            fs.writeFileSync(destPath, content);
        });

        // Root-Index in dist/ bereitstellen (verweist auf main/)
        const rootIndex = path.join(config.rootDir, 'index.html');
        if (fs.existsSync(rootIndex)) {
            copyFile(rootIndex, path.join(config.distDir, 'index.html'));
        }
        
        // CSS-Dateien kopieren (falls vorhanden)
        const cssDir = path.join(config.srcDir, 'css');
        if (fs.existsSync(cssDir)) {
            log('CSS-Dateien werden kopiert...');
            ensureDir(path.join(config.distDir, 'css'));
            const cssFiles = fs.readdirSync(cssDir);
            cssFiles.forEach(file => {
                copyFile(
                    path.join(cssDir, file),
                    path.join(config.distDir, 'css', file)
                );
            });
        }
        
        // JavaScript-Dateien kopieren (falls vorhanden)
        const jsDir = path.join(config.srcDir, 'js');
        if (fs.existsSync(jsDir)) {
            log('JavaScript-Dateien werden kopiert...');
            ensureDir(path.join(config.distDir, 'js'));
            const jsFiles = fs.readdirSync(jsDir);
            jsFiles.forEach(file => {
                let srcPath = path.join(jsDir, file);
                let destPath = path.join(config.distDir, 'js', file);
                
                let content = fs.readFileSync(srcPath, 'utf8');
                
                // Für Produktion: Erweiterte Console-Statement-Entfernung
                if (config.isProduction) {
                    // Entferne Debug-Kommentare und console.log (aber nicht console.error/warn)
                    content = content.replace(/console\.log\([^)]*\);?\s*\n?/g, '');
                    content = content.replace(/\/\/ Debug.*\n/g, '');
                    content = content.replace(/\/\*\* Debug[\s\S]*?\*\//g, '');
                }
                
                fs.writeFileSync(destPath, content);
            });
        }

        // Assets kopieren (falls vorhanden)
        const assetsDir = path.join(config.srcDir, 'assets');
        if (fs.existsSync(assetsDir)) {
            log('Assets werden kopiert...');
            ensureDir(path.join(config.distDir, 'assets'));
            execSync(`cp -r "${assetsDir}/." "${path.join(config.distDir, 'assets')}"`);
        }
        
        // GitHub-Ordner aus Root kopieren (falls vorhanden)
        if (fs.existsSync(path.join(config.rootDir, '.github'))) {
            log('.github Verzeichnis wird kopiert...');
            execSync(`cp -r "${path.join(config.rootDir, '.github')}" "${config.distDir}"`);
        }
        
        // README aus Root kopieren
        if (fs.existsSync(path.join(config.rootDir, 'README.md'))) {
            copyFile(
                path.join(config.rootDir, 'README.md'),
                path.join(config.distDir, 'README.md')
            );
        }
        
        log('Build erfolgreich abgeschlossen!', 'success');
        log(`Ausgabe in: ${config.distDir}`);
        
        if (config.isProduction) {
            log('Produktionsmodus: Debug-Ausgaben wurden entfernt', 'info');
        }
        
    } catch (error) {
        log(`Build-Fehler: ${error.message}`, 'error');
        process.exit(1);
    }
};

// Build starten
build();