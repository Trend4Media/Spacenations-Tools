/**
 * Dashboard Navigation Fix - Automatische Reparatur aller Tool-Links
 * Stellt sicher, dass alle Tool-Links auf Dashboard-Versionen zeigen
 */

function fixDashboardNavigation() {
    console.log('🔧 Dashboard-Navigation wird repariert...');
    
    // 1. Calculator-Links reparieren
    const calculatorLinks = document.querySelectorAll('a[href="calculator.html"]');
    calculatorLinks.forEach(link => {
        link.href = 'dashboard-calculator.html';
        link.title = 'AS-Counter (Dashboard) - Kämpfe werden automatisch gespeichert';
        
        // Icon aktualisieren
        const icon = link.querySelector('.nav-icon, .action-icon');
        if (icon && !icon.textContent.includes('💾')) {
            icon.textContent = '⚔️💾';
        }
        
        // Text aktualisieren
        const titleElement = link.querySelector('.action-title');
        if (titleElement && !titleElement.textContent.includes('Dashboard')) {
            titleElement.textContent = 'AS-Counter (Dashboard)';
        }
        
        // Beschreibung aktualisieren
        const descElement = link.querySelector('.action-desc');
        if (descElement && !descElement.textContent.includes('automatisch')) {
            descElement.textContent = 'AS-Counter mit automatischem Speichern aller Kampfergebnisse';
        }
        
        console.log('✅ Calculator-Link repariert:', link.href);
    });
    
    // 2. Raid-Counter-Links reparieren
    const raidLinks = document.querySelectorAll('a[href="raid-counter.html"]');
    raidLinks.forEach(link => {
        link.href = 'dashboard-raid-counter.html';
        link.title = 'Raid-Counter (Dashboard) - Raids werden automatisch gespeichert';
        
        // Icon aktualisieren
        const icon = link.querySelector('.nav-icon, .action-icon');
        if (icon && !icon.textContent.includes('💾')) {
            icon.textContent = '🏴‍☠️💾';
        }
        
        // Text aktualisieren
        const titleElement = link.querySelector('.action-title');
        if (titleElement && !titleElement.textContent.includes('Dashboard')) {
            titleElement.textContent = 'Raid-Counter (Dashboard)';
        }
        
        // Beschreibung aktualisieren
        const descElement = link.querySelector('.action-desc');
        if (descElement && !descElement.textContent.includes('automatisch')) {
            descElement.textContent = 'Raid-Counter mit automatischem Speichern aller Raid-Daten';
        }
        
        console.log('✅ Raid-Counter-Link repariert:', link.href);
    });
    
    // 3. Alle Links mit "Raid planen" Text finden und aktualisieren
    const planRaidLinks = document.querySelectorAll('a');
    planRaidLinks.forEach(link => {
        const titleElement = link.querySelector('.action-title');
        if (titleElement && titleElement.textContent.includes('Raid planen')) {
            link.href = 'dashboard-raid-counter.html';
            titleElement.textContent = 'Raid-Counter (Dashboard)';
            
            const icon = link.querySelector('.action-icon');
            if (icon) icon.textContent = '🏴‍☠️💾';
            
            const desc = link.querySelector('.action-desc');
            if (desc) desc.textContent = 'Raid-Counter mit automatischem Speichern aller Raid-Daten';
            
            console.log('✅ "Raid planen" Link repariert');
        }
    });
    
    // 4. Navigation-spezifische Links in der Sidebar
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        if (link.href.includes('calculator.html')) {
            link.href = 'dashboard-calculator.html';
            const textElement = link.querySelector('.nav-text, span:not(.nav-icon)');
            if (textElement && !textElement.textContent.includes('Dashboard')) {
                textElement.textContent = 'AS-Counter (Dashboard)';
            }
        }
        
        if (link.href.includes('raid-counter.html')) {
            link.href = 'dashboard-raid-counter.html';
            const textElement = link.querySelector('.nav-text, span:not(.nav-icon)');
            if (textElement && !textElement.textContent.includes('Dashboard')) {
                textElement.textContent = 'Raid-Counter (Dashboard)';
            }
        }
    });
    
    console.log('✅ Dashboard-Navigation erfolgreich repariert!');
}

// Navigation reparieren wenn DOM geladen ist
document.addEventListener('DOMContentLoaded', function() {
    // Warten bis alle anderen Scripts geladen sind
    setTimeout(fixDashboardNavigation, 500);
    
    // Nochmal nach 2 Sekunden falls Scripts nachladen
    setTimeout(fixDashboardNavigation, 2000);
});

// Funktion für manuellen Aufruf verfügbar machen
window.fixDashboardNavigation = fixDashboardNavigation;

// Beobachter für dynamische Inhalte
const navigationObserver = new MutationObserver(function(mutations) {
    let shouldFix = false;
    
    mutations.forEach(function(mutation) {
        if (mutation.type === 'childList') {
            mutation.addedNodes.forEach(function(node) {
                if (node.nodeType === 1) { // Element node
                    // Prüfe ob neue Links hinzugefügt wurden
                    const newCalculatorLinks = node.querySelectorAll ? node.querySelectorAll('a[href="calculator.html"]') : [];
                    const newRaidLinks = node.querySelectorAll ? node.querySelectorAll('a[href="raid-counter.html"]') : [];
                    
                    if (newCalculatorLinks.length > 0 || newRaidLinks.length > 0) {
                        shouldFix = true;
                    }
                }
            });
        }
    });
    
    if (shouldFix) {
        console.log('🔄 Neue Links erkannt - Navigation wird aktualisiert');
        setTimeout(fixDashboardNavigation, 100);
    }
});

// Beobachter starten
navigationObserver.observe(document.body, {
    childList: true,
    subtree: true
});

console.log('🔧 Dashboard Navigation Fix geladen - Navigation wird automatisch repariert');
