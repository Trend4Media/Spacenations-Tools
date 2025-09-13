/**
 * Enhanced Navigation System
 * Improves clickability, accessibility, and user experience across all pages
 */

class EnhancedNavigation {
    constructor() {
        this.currentPage = this.detectCurrentPage();
        this.init();
    }

    init() {
        this.addCurrentPageIndicators();
        this.enhanceClickability();
        this.addKeyboardNavigation();
        this.addLoadingStates();
        this.addTouchFeedback();
        this.improveAccessibility();
        // Spionage-Datenbank Navigation entfernt
        
        console.log('🚀 Enhanced Navigation initialized for:', this.currentPage);
    }

    detectCurrentPage() {
        const path = window.location.pathname;
        const filename = path.split('/').pop().split('.')[0] || 'index';
        return filename;
    }

    addCurrentPageIndicators() {
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (!href) return;
            
            const linkPage = href.split('/').pop().split('.')[0];
            
            // Mark current page
            if (linkPage === this.currentPage) {
                link.classList.add('current-page');
                link.setAttribute('aria-current', 'page');
            }
            
            // Add page indicators for dashboard variants
            if (this.currentPage.includes('dashboard') && href.includes('dashboard')) {
                const currentTool = this.currentPage.replace('dashboard-', '');
                const linkTool = linkPage.replace('dashboard-', '');
                
                if (currentTool === linkTool) {
                    link.classList.add('current-page');
                    link.setAttribute('aria-current', 'page');
                }
            }
        });
    }

    // Spionage-Datenbank Navigation entfernt - System wird neu aufgebaut

    enhanceClickability() {
        // Add ripple effect to clickable elements
        const clickableElements = document.querySelectorAll(
            '.nav-link, .action-card, button:not(.no-ripple), .quick-tool'
        );
        
        clickableElements.forEach(element => {
            element.addEventListener('click', this.createRippleEffect.bind(this));
            
            // Add visual feedback for better UX
            element.addEventListener('mousedown', (_e) => {
                element.style.transform = 'scale(0.98)';
            });
            
            element.addEventListener('mouseup', (_e) => {
                setTimeout(() => {
                    element.style.transform = '';
                }, 100);
            });
            
            element.addEventListener('mouseleave', (_e) => {
                element.style.transform = '';
            });
        });
    }

    createRippleEffect(e) {
        const element = e.currentTarget;
        const rect = element.getBoundingClientRect();
        const ripple = document.createElement('div');
        
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s ease-out;
            pointer-events: none;
            z-index: 1;
        `;
        
        // Add ripple styles if not already present
        if (!document.getElementById('ripple-styles')) {
            const style = document.createElement('style');
            style.id = 'ripple-styles';
            style.textContent = `
                @keyframes ripple {
                    to {
                        transform: scale(2);
                        opacity: 0;
                    }
                }
                .nav-link, .action-card, button {
                    position: relative;
                    overflow: hidden;
                }
            `;
            document.head.appendChild(style);
        }
        
        element.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    addKeyboardNavigation() {
        // Enhanced keyboard navigation
        document.addEventListener('keydown', (e) => {
            // Quick navigation shortcuts
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'h':
                        e.preventDefault();
                        window.location.href = 'index.html';
                        break;
                    case 'd':
                        e.preventDefault();
                        window.location.href = 'dashboard.html';
                        break;
                    case '1':
                        e.preventDefault();
                        window.location.href = 'dashboard-as-counter.html';
                        break;
                    case '2':
                        e.preventDefault();
                        window.location.href = 'dashboard-raid-counter.html';
                        break;
                    case '3':
                        e.preventDefault();
                        window.location.href = 'dashboard-sabo-counter.html';
                        break;
                }
            }
            
            // Arrow key navigation for nav links
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                const focusedElement = document.activeElement;
                const navLinks = Array.from(document.querySelectorAll('.nav-link, .action-card'));
                const currentIndex = navLinks.indexOf(focusedElement);
                
                if (currentIndex !== -1) {
                    e.preventDefault();
                    const nextIndex = e.key === 'ArrowDown' 
                        ? (currentIndex + 1) % navLinks.length
                        : (currentIndex - 1 + navLinks.length) % navLinks.length;
                    
                    navLinks[nextIndex].focus();
                }
            }
            
            // Enter/Space activation for focused elements
            if (e.key === 'Enter' || e.key === ' ') {
                const focusedElement = document.activeElement;
                if (focusedElement.classList.contains('nav-link') || 
                    focusedElement.classList.contains('action-card')) {
                    e.preventDefault();
                    focusedElement.click();
                }
            }
        });
        
        // Add tabindex to navigation elements for keyboard accessibility
        const navElements = document.querySelectorAll('.nav-link, .action-card');
        navElements.forEach((element, _index) => {
            if (!element.hasAttribute('tabindex')) {
                element.setAttribute('tabindex', '0');
            }
        });
    }

    addLoadingStates() {
        // Add loading states for navigation
        const navLinks = document.querySelectorAll('.nav-link, .action-card');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (_e) => {
                // Don't add loading state for same page or hash links
                const href = link.getAttribute('href');
                if (!href || href === '#' || href.startsWith('#')) return;
                
                // Add loading state
                link.classList.add('loading');
                link.style.pointerEvents = 'none';
                
                // Remove loading state after navigation or timeout
                setTimeout(() => {
                    link.classList.remove('loading');
                    link.style.pointerEvents = '';
                }, 3000);
            });
        });
    }

    addTouchFeedback() {
        // Enhanced touch feedback for mobile devices
        if ('ontouchstart' in window) {
            const touchElements = document.querySelectorAll('.nav-link, .action-card, button');
            
            touchElements.forEach(element => {
                element.addEventListener('touchstart', (_e) => {
                    element.classList.add('touch-active');
                }, { passive: true });
                
                element.addEventListener('touchend', (_e) => {
                    setTimeout(() => {
                        element.classList.remove('touch-active');
                    }, 150);
                }, { passive: true });
                
                element.addEventListener('touchcancel', (_e) => {
                    element.classList.remove('touch-active');
                }, { passive: true });
            });
            
            // Add touch-active styles
            if (!document.getElementById('touch-styles')) {
                const style = document.createElement('style');
                style.id = 'touch-styles';
                style.textContent = `
                    .touch-active {
                        background: rgba(255, 140, 66, 0.1) !important;
                        transform: scale(0.98) !important;
                    }
                `;
                document.head.appendChild(style);
            }
        }
    }

    improveAccessibility() {
        // Add ARIA labels and roles where missing
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            if (!link.hasAttribute('aria-label')) {
                const text = link.textContent.trim();
                link.setAttribute('aria-label', `Navigate to ${text}`);
            }
        });
        
        const actionCards = document.querySelectorAll('.action-card');
        actionCards.forEach(card => {
            if (!card.hasAttribute('role')) {
                card.setAttribute('role', 'button');
            }
            
            if (!card.hasAttribute('aria-label')) {
                const title = card.querySelector('.action-title');
                if (title) {
                    card.setAttribute('aria-label', `Open ${title.textContent.trim()}`);
                }
            }
        });
        
        // Add skip navigation link
        this.addSkipNavigation();
    }

    addSkipNavigation() {
        if (document.getElementById('skip-nav')) return;
        
        const skipNav = document.createElement('a');
        skipNav.id = 'skip-nav';
        skipNav.href = '#main-content';
        skipNav.textContent = 'Skip to main content';
        skipNav.style.cssText = `
            position: absolute;
            top: -40px;
            left: 6px;
            background: var(--accent-primary);
            color: white;
            padding: 8px;
            text-decoration: none;
            border-radius: 4px;
            z-index: 1000;
            transition: top 0.3s ease;
        `;
        
        skipNav.addEventListener('focus', () => {
            skipNav.style.top = '6px';
        });
        
        skipNav.addEventListener('blur', () => {
            skipNav.style.top = '-40px';
        });
        
        document.body.insertBefore(skipNav, document.body.firstChild);
        
        // Add main content ID if not present
        const main = document.querySelector('main, .main');
        if (main && !main.id) {
            main.id = 'main-content';
        }
    }

    // Public methods for external use
    setLoadingState(element, loading = true) {
        if (loading) {
            element.classList.add('loading');
            element.style.pointerEvents = 'none';
        } else {
            element.classList.remove('loading');
            element.style.pointerEvents = '';
        }
    }

    highlightCurrentPage() {
        this.addCurrentPageIndicators();
    }

    addCustomRipple(element, _color = 'rgba(255, 255, 255, 0.3)') {
        element.addEventListener('click', (e) => {
            this.createRippleEffect.call(this, e);
        });
    }
}

// Initialize enhanced navigation when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.EnhancedNavigation = new EnhancedNavigation();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnhancedNavigation;
}