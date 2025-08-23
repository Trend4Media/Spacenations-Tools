# JTL Shop Template Implementation Guide
## 4-Ground.shop Design Adaptation

### 1. Template-Struktur erstellen

#### info.xml - Template Konfiguration
```xml
<?xml version="1.0" encoding="UTF-8"?>
<template>
    <name>4Ground-Adaptation</name>
    <author>Ihr Name</author>
    <version>1.0.0</version>
    <description>4-Ground.shop Design Adaptation für JTL Shop</description>
    <preview>preview.jpg</preview>
    <parent>NOVA</parent>
    <responsive>true</responsive>
    <minShopVersion>5.0.0</minShopVersion>
</template>
```

#### Ordnerstruktur
```
/templates/4Ground-Adaptation/
├── css/
│   ├── custom.css
│   ├── responsive.css
│   └── components/
├── js/
│   └── custom.js
├── layout/
│   ├── header.tpl
│   ├── footer.tpl
│   └── index.tpl
├── productdetails/
│   └── details.tpl
├── productlist/
│   └── item_box.tpl
├── checkout/
│   └── inc_steps.tpl
└── info.xml
```

### 2. CSS Framework - 4Ground Style

#### css/custom.css
```css
/* 4Ground Design System - Basis Styles */

:root {
    /* Farbpalette inspiriert von 4-ground.shop */
    --primary-color: #2c2c2c;
    --secondary-color: #f8f8f8;
    --accent-color: #007bff;
    --text-primary: #333333;
    --text-secondary: #666666;
    --border-color: #e0e0e0;
    --white: #ffffff;
    
    /* Typography */
    --font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    --font-weight-normal: 400;
    --font-weight-medium: 500;
    --font-weight-bold: 700;
    
    /* Spacing */
    --spacing-xs: 0.5rem;
    --spacing-sm: 1rem;
    --spacing-md: 1.5rem;
    --spacing-lg: 2rem;
    --spacing-xl: 3rem;
    --spacing-xxl: 4rem;
    
    /* Border Radius */
    --border-radius: 8px;
    --border-radius-lg: 12px;
    
    /* Shadows */
    --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.1);
    --shadow-md: 0 4px 8px rgba(0, 0, 0, 0.12);
    --shadow-lg: 0 8px 16px rgba(0, 0, 0, 0.15);
}

/* Reset und Basis Styles */
* {
    box-sizing: border-box;
}

body {
    font-family: var(--font-primary);
    font-weight: var(--font-weight-normal);
    color: var(--text-primary);
    line-height: 1.6;
    margin: 0;
    padding: 0;
}

/* Container System */
.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 var(--spacing-sm);
}

.container-fluid {
    width: 100%;
    padding: 0 var(--spacing-sm);
}

/* Grid System */
.row {
    display: flex;
    flex-wrap: wrap;
    margin: 0 -var(--spacing-xs);
}

.col {
    flex: 1;
    padding: 0 var(--spacing-xs);
}

.col-1 { flex: 0 0 8.333333%; }
.col-2 { flex: 0 0 16.666667%; }
.col-3 { flex: 0 0 25%; }
.col-4 { flex: 0 0 33.333333%; }
.col-6 { flex: 0 0 50%; }
.col-8 { flex: 0 0 66.666667%; }
.col-9 { flex: 0 0 75%; }
.col-12 { flex: 0 0 100%; }

/* Header Styles */
.header {
    background: var(--white);
    border-bottom: 1px solid var(--border-color);
    position: sticky;
    top: 0;
    z-index: 1000;
    box-shadow: var(--shadow-sm);
}

.header-top {
    padding: var(--spacing-sm) 0;
    border-bottom: 1px solid var(--border-color);
    font-size: 0.875rem;
    color: var(--text-secondary);
}

.header-main {
    padding: var(--spacing-md) 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.logo {
    font-size: 1.5rem;
    font-weight: var(--font-weight-bold);
    color: var(--primary-color);
    text-decoration: none;
}

.logo:hover {
    color: var(--accent-color);
}

/* Navigation */
.main-nav {
    display: flex;
    list-style: none;
    margin: 0;
    padding: 0;
    gap: var(--spacing-lg);
}

.main-nav a {
    color: var(--text-primary);
    text-decoration: none;
    font-weight: var(--font-weight-medium);
    padding: var(--spacing-xs) 0;
    position: relative;
    transition: color 0.3s ease;
}

.main-nav a:hover,
.main-nav a.active {
    color: var(--accent-color);
}

.main-nav a::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 0;
    height: 2px;
    background: var(--accent-color);
    transition: width 0.3s ease;
}

.main-nav a:hover::after,
.main-nav a.active::after {
    width: 100%;
}

/* Header Actions */
.header-actions {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
}

.header-search {
    position: relative;
}

.search-input {
    padding: var(--spacing-xs) var(--spacing-md);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    background: var(--secondary-color);
    font-size: 0.875rem;
    width: 250px;
    transition: all 0.3s ease;
}

.search-input:focus {
    outline: none;
    border-color: var(--accent-color);
    background: var(--white);
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.cart-icon,
.user-icon {
    position: relative;
    padding: var(--spacing-xs);
    color: var(--text-primary);
    text-decoration: none;
    transition: color 0.3s ease;
}

.cart-icon:hover,
.user-icon:hover {
    color: var(--accent-color);
}

.cart-count {
    position: absolute;
    top: -5px;
    right: -5px;
    background: var(--accent-color);
    color: var(--white);
    border-radius: 50%;
    width: 18px;
    height: 18px;
    font-size: 0.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: var(--font-weight-bold);
}

/* Button System */
.btn {
    display: inline-block;
    padding: var(--spacing-xs) var(--spacing-md);
    border: none;
    border-radius: var(--border-radius);
    font-family: var(--font-primary);
    font-weight: var(--font-weight-medium);
    text-decoration: none;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 0.875rem;
    line-height: 1.5;
}

.btn-primary {
    background: var(--accent-color);
    color: var(--white);
}

.btn-primary:hover {
    background: #0056b3;
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
}

.btn-secondary {
    background: var(--secondary-color);
    color: var(--text-primary);
    border: 1px solid var(--border-color);
}

.btn-secondary:hover {
    background: var(--white);
    border-color: var(--accent-color);
    color: var(--accent-color);
}

.btn-lg {
    padding: var(--spacing-sm) var(--spacing-lg);
    font-size: 1rem;
}

/* Product Grid */
.product-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: var(--spacing-lg);
    padding: var(--spacing-lg) 0;
}

.product-item {
    background: var(--white);
    border-radius: var(--border-radius-lg);
    overflow: hidden;
    transition: all 0.3s ease;
    box-shadow: var(--shadow-sm);
}

.product-item:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
}

.product-image {
    position: relative;
    overflow: hidden;
    aspect-ratio: 1;
}

.product-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
}

.product-item:hover .product-image img {
    transform: scale(1.05);
}

.product-info {
    padding: var(--spacing-md);
}

.product-title {
    font-size: 1rem;
    font-weight: var(--font-weight-medium);
    margin: 0 0 var(--spacing-xs) 0;
    color: var(--text-primary);
}

.product-price {
    font-size: 1.125rem;
    font-weight: var(--font-weight-bold);
    color: var(--accent-color);
    margin: var(--spacing-xs) 0;
}

.product-price-old {
    font-size: 0.875rem;
    color: var(--text-secondary);
    text-decoration: line-through;
    margin-right: var(--spacing-xs);
}

/* Footer */
.footer {
    background: var(--primary-color);
    color: var(--white);
    padding: var(--spacing-xxl) 0 var(--spacing-lg) 0;
    margin-top: var(--spacing-xxl);
}

.footer-content {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: var(--spacing-xl);
    margin-bottom: var(--spacing-xl);
}

.footer-section h3 {
    margin: 0 0 var(--spacing-md) 0;
    font-weight: var(--font-weight-bold);
}

.footer-section ul {
    list-style: none;
    padding: 0;
    margin: 0;
}

.footer-section li {
    margin-bottom: var(--spacing-xs);
}

.footer-section a {
    color: #cccccc;
    text-decoration: none;
    transition: color 0.3s ease;
}

.footer-section a:hover {
    color: var(--white);
}

.footer-bottom {
    border-top: 1px solid #444444;
    padding-top: var(--spacing-md);
    text-align: center;
    color: #cccccc;
    font-size: 0.875rem;
}

/* Utility Classes */
.text-center { text-align: center; }
.text-left { text-align: left; }
.text-right { text-align: right; }

.mb-0 { margin-bottom: 0; }
.mb-sm { margin-bottom: var(--spacing-sm); }
.mb-md { margin-bottom: var(--spacing-md); }
.mb-lg { margin-bottom: var(--spacing-lg); }

.mt-0 { margin-top: 0; }
.mt-sm { margin-top: var(--spacing-sm); }
.mt-md { margin-top: var(--spacing-md); }
.mt-lg { margin-top: var(--spacing-lg); }

.p-sm { padding: var(--spacing-sm); }
.p-md { padding: var(--spacing-md); }
.p-lg { padding: var(--spacing-lg); }

/* Responsive Design */
@media (max-width: 768px) {
    .container {
        padding: 0 var(--spacing-sm);
    }
    
    .header-main {
        flex-direction: column;
        gap: var(--spacing-md);
    }
    
    .main-nav {
        flex-wrap: wrap;
        justify-content: center;
        gap: var(--spacing-md);
    }
    
    .search-input {
        width: 200px;
    }
    
    .product-grid {
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: var(--spacing-md);
    }
    
    .col-6,
    .col-4,
    .col-3 {
        flex: 0 0 100%;
    }
}

@media (max-width: 480px) {
    .product-grid {
        grid-template-columns: 1fr;
    }
    
    .header-actions {
        flex-direction: column;
        gap: var(--spacing-xs);
    }
    
    .search-input {
        width: 100%;
    }
}
```

### 3. Smarty Template Beispiele

#### layout/header.tpl
```smarty
{* 4Ground Header Template *}
<header class="header">
    <div class="header-top">
        <div class="container">
            <div class="row">
                <div class="col-6">
                    <span>Kostenloser Versand ab 50€</span>
                </div>
                <div class="col-6 text-right">
                    <span>Kundenservice: 0800 123 456</span>
                </div>
            </div>
        </div>
    </div>
    
    <div class="header-main">
        <div class="container">
            <div class="row">
                <div class="col-3">
                    <a href="{$ShopURL}" class="logo">
                        {if $Einstellungen.logo.shop_logo}
                            <img src="{$ShopURL}/{$Einstellungen.logo.shop_logo}" alt="{$Einstellungen.global.global_shopname}" class="img-responsive">
                        {else}
                            {$Einstellungen.global.global_shopname}
                        {/if}
                    </a>
                </div>
                
                <div class="col-6">
                    <nav class="main-nav">
                        {foreach $NaviObjs.megamenu as $oNaviObj}
                            <a href="{$oNaviObj->cURL}" 
                               {if $oNaviObj->bAktiv}class="active"{/if}>
                                {$oNaviObj->cName}
                            </a>
                        {/foreach}
                    </nav>
                </div>
                
                <div class="col-3">
                    <div class="header-actions">
                        <div class="header-search">
                            <form action="{$ShopURL}/suche" method="get">
                                <input type="text" name="qs" placeholder="Suchen..." class="search-input" value="{$Suchanfrage}">
                            </form>
                        </div>
                        
                        <a href="{$ShopURL}/jtl.php?knd=1" class="user-icon">
                            <i class="fas fa-user"></i>
                        </a>
                        
                        <a href="{$ShopURL}/warenkorb.php" class="cart-icon">
                            <i class="fas fa-shopping-cart"></i>
                            {if $WarenkorbArtikelanzahl > 0}
                                <span class="cart-count">{$WarenkorbArtikelanzahl}</span>
                            {/if}
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</header>
```

#### productlist/item_box.tpl
```smarty
{* 4Ground Product Item Template *}
<div class="product-item" itemscope itemtype="http://schema.org/Product">
    <div class="product-image">
        <a href="{$Artikel->cURLFull}">
            {if isset($Artikel->Bilder[0])}
                <img src="{$Artikel->Bilder[0]->cURLMini}" 
                     alt="{$Artikel->cName|escape:'html'}" 
                     itemprop="image"
                     loading="lazy">
            {else}
                <img src="{$ShopURL}/{$PFAD_GFX}keinBild.gif" 
                     alt="{$Artikel->cName|escape:'html'}" 
                     loading="lazy">
            {/if}
        </a>
        
        {if $Artikel->Preise->rabatt > 0}
            <div class="product-badge">
                -{$Artikel->Preise->rabatt}%
            </div>
        {/if}
    </div>
    
    <div class="product-info">
        <h3 class="product-title" itemprop="name">
            <a href="{$Artikel->cURLFull}">{$Artikel->cName}</a>
        </h3>
        
        <div class="product-price" itemprop="offers" itemscope itemtype="http://schema.org/Offer">
            {if $Artikel->Preise->fVKNetto != $Artikel->Preise->fVK}
                <span class="product-price-old">
                    {$Artikel->Preise->cVKLocalized[0]}
                </span>
            {/if}
            <span class="product-price-current" itemprop="price" content="{$Artikel->Preise->fVKNetto}">
                {$Artikel->Preise->cVKLocalized[1]}
            </span>
            <meta itemprop="priceCurrency" content="{$smarty.session.cWaehrungName}">
        </div>
        
        {if $Artikel->cKurzBeschreibung}
            <div class="product-description">
                {$Artikel->cKurzBeschreibung|strip_tags|truncate:80}
            </div>
        {/if}
        
        <form action="{$ShopURL}/warenkorb.php" method="post" class="product-form">
            <input type="hidden" name="a" value="{$Artikel->kArtikel}">
            <input type="hidden" name="anzahl" value="1">
            <button type="submit" class="btn btn-primary btn-block">
                In den Warenkorb
            </button>
        </form>
    </div>
</div>
```

### 4. JavaScript Enhancements

#### js/custom.js
```javascript
// 4Ground Custom JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Mobile menu toggle
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    
    if (mobileToggle && mainNav) {
        mobileToggle.addEventListener('click', function() {
            mainNav.classList.toggle('active');
            this.classList.toggle('active');
        });
    }
    
    // Search enhancement
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        searchInput.addEventListener('blur', function() {
            this.parentElement.classList.remove('focused');
        });
    }
    
    // Product image hover effects
    document.querySelectorAll('.product-item').forEach(item => {
        const img = item.querySelector('.product-image img');
        if (img && img.dataset.hover) {
            const originalSrc = img.src;
            const hoverSrc = img.dataset.hover;
            
            item.addEventListener('mouseenter', function() {
                img.src = hoverSrc;
            });
            
            item.addEventListener('mouseleave', function() {
                img.src = originalSrc;
            });
        }
    });
    
    // Lazy loading enhancement
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    observer.unobserve(img);
                }
            });
        });
        
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
});

// Cart functionality
function addToCart(articleId, quantity = 1) {
    const formData = new FormData();
    formData.append('a', articleId);
    formData.append('anzahl', quantity);
    
    fetch('/warenkorb.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.text())
    .then(data => {
        // Update cart counter
        updateCartCounter();
        // Show success message
        showNotification('Artikel wurde zum Warenkorb hinzugefügt', 'success');
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('Fehler beim Hinzufügen zum Warenkorb', 'error');
    });
}

function updateCartCounter() {
    fetch('/includes/ajax.php?action=getCartCount')
        .then(response => response.json())
        .then(data => {
            const counter = document.querySelector('.cart-count');
            if (counter) {
                counter.textContent = data.count;
                counter.style.display = data.count > 0 ? 'flex' : 'none';
            }
        });
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}
```

### 5. Performance Optimierungen

#### CSS Optimierungen
```css
/* Critical CSS - Above the fold */
.header,
.main-nav,
.container,
.btn {
    /* Kritische Styles hier */
}

/* Non-critical CSS - Below the fold */
.footer,
.product-grid {
    /* Laden nach dem ersten Rendering */
}
```

#### Preload wichtiger Ressourcen
```html
<link rel="preload" href="/css/custom.css" as="style">
<link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossorigin>
```

### 6. SEO Optimierungen

#### Strukturierte Daten
```smarty
{* JSON-LD für Produkte *}
<script type="application/ld+json">
{
    "@context": "http://schema.org",
    "@type": "Product",
    "name": "{$Artikel->cName}",
    "image": "{$Artikel->Bilder[0]->cURLNormal}",
    "description": "{$Artikel->cBeschreibung|strip_tags|truncate:160}",
    "offers": {
        "@type": "Offer",
        "price": "{$Artikel->Preise->fVKNetto}",
        "priceCurrency": "{$smarty.session.cWaehrungName}",
        "availability": "http://schema.org/InStock"
    }
}
</script>
```

### 7. Testing und Deployment

#### Checkliste vor Go-Live:
- [ ] Cross-Browser Testing (Chrome, Firefox, Safari, Edge)
- [ ] Mobile Responsive Testing
- [ ] Performance Testing (PageSpeed Insights)
- [ ] SEO Testing (Google Search Console)
- [ ] Accessibility Testing (WAVE, axe)
- [ ] Funktionalitätstests (Warenkorb, Checkout, etc.)

#### Deployment Schritte:
1. Backup des aktuellen Templates erstellen
2. Template-Dateien per FTP hochladen
3. Template im JTL Shop Backend aktivieren
4. Cache leeren
5. Frontend-Tests durchführen
6. Monitoring einrichten

---

**Hinweis**: Diese Implementierung bietet eine solide Grundlage für die Adaptation des 4-ground.shop Designs. Je nach spezifischen Anforderungen können weitere Anpassungen erforderlich sein.